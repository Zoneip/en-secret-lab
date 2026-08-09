#!/usr/bin/env node
/**
 * 静态站增量同步器(实验性)
 *
 * 用动态版 SSR(astro App)渲染页面,增量合并到 dist-static/,替代全量 build:static。
 * 思路:内容变化时只重新渲染受影响的页面(文章详情页 + 聚合页),复用构建产物里的
 * 静态资源(dist-server/client),避免每次全量 vite build + 全站渲染。
 *
 * 依赖:
 *   - 先执行一次 npm run build:server(组件/路由代码变化后需要重建)
 *   - 首次同步用 --init(复制 client 资源 + 全量渲染),或直接 build:static 初始化
 *
 * 用法:
 *   node scripts/static-sync.mjs --init   # 首次:复制资源 + 全量渲染
 *   node scripts/static-sync.mjs          # 增量:按内容指纹渲染变化页面
 *   node scripts/static-sync.mjs --full   # 强制全量渲染(不复制资源)
 *
 * fallback(全量打包):npm run build:static
 *
 * 已知限制(v1):
 *   - Pagefind 搜索索引不增量(由 build:static 重建)
 *   - sitemap 不增量(构建期生成,保持 client 版本)
 *   - 主题预设/组件代码变化需 --full 或 build:static
 *   - 仅同步前台页面;admin 路由(控制台)不输出到静态站
 *
 * 运行时环境:
 *   产物中 isServer = process.env.ASTRO_MODE === 'server',脚本内已置为 server,
 *   页面因此走文件系统读取(src/content),与真实 server 运行行为一致
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, cpSync, rmSync, statSync } from 'node:fs'
import { join, dirname, basename, extname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { parse as parseYaml } from 'yaml'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const serverDir = join(root, 'dist-server', 'server')
const clientDir = join(root, 'dist-server', 'client')
const staticDir = join(root, 'dist-static')
const postsDir = join(root, 'src', 'content', 'posts')
const stateFile = join(root, '.static-sync-state.json')

/** 博客分页大小,与 src/pages/blog/index.astro 保持一致 */
const PAGE_SIZE = 9

/* ---------- 内容扫描(与 posts-store.parsePostFile 同规则) ---------- */

function parsePostFile(fileName, raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  const fm = {}
  if (m) {
    for (const line of m[1].split('\n')) {
      const eq = line.match(/^([a-zA-Z]+):\s*(.*)$/)
      if (!eq) continue
      const [, key, value] = eq
      if (key === 'tags') {
        const inner = value.match(/\[(.*)\]/)?.[1] ?? value
        fm.tags = [...inner.matchAll(/'([^']+)'|"([^"]+)"|([^,\s[]+)/g)]
          .map((g) => (g[1] ?? g[2] ?? g[3]).trim())
          .filter(Boolean)
      } else if (value === 'true' || value === 'false') {
        fm[key] = value === 'true'
      } else {
        fm[key] = value
      }
    }
  }
  return {
    slug: fileName.replace(/\.(md|mdx)$/, ''),
    category: String(fm.category ?? '随笔'),
    tags: fm.tags ?? [],
    draft: Boolean(fm.draft),
    pubDate: String(fm.pubDate ?? ''),
  }
}

/** 已发布文章列表(过滤 draft),字段:slug/category/tags/pubDate */
function listPosts() {
  if (!existsSync(postsDir)) return []
  return readdirSync(postsDir)
    .filter((f) => /\.(md|mdx)$/.test(f) && statSync(join(postsDir, f)).isFile())
    .map((f) => parsePostFile(f, readFileSync(join(postsDir, f), 'utf8')))
    .filter((p) => !p.draft)
}

/** 数据目录 yaml 文件的 id 列表(about 除外,about 是 me.json) */
function listYamlIds(dir) {
  const abs = join(root, 'src', 'content', dir)
  if (!existsSync(abs)) return []
  return readdirSync(abs)
    .filter((f) => /\.(yaml|yml|json)$/.test(f))
    .map((f) => f.replace(/\.(yaml|yml|json)$/, ''))
}

/* ---------- 内容指纹 ---------- */

function sha1(buf) {
  return createHash('sha1').update(buf).digest('hex')
}

/** 扫描所有影响渲染的内容文件 → { relPath: hash } */
function fingerprint() {
  const result = {}
  const dirs = ['posts', 'about', 'columns', 'ocs', 'resources', 'friends']
  for (const d of dirs) {
    const abs = join(root, 'src', 'content', d)
    if (!existsSync(abs)) continue
    for (const f of readdirSync(abs)) {
      const file = join(abs, f)
      if (!statSync(file).isFile()) continue
      result[`src/content/${d}/${f}`] = sha1(readFileSync(file))
    }
  }
  const siteConfig = join(root, 'public', 'site-config.json')
  if (existsSync(siteConfig)) {
    result['public/site-config.json'] = sha1(readFileSync(siteConfig))
  }
  // 主题预设变化影响所有页面 CSS 变量 → 触发全量
  const presetsDir = join(root, 'src', 'themes', 'presets')
  if (existsSync(presetsDir)) {
    for (const f of readdirSync(presetsDir)) {
      if (!f.endsWith('.json')) continue
      result[`src/themes/presets/${f}`] = sha1(
        readFileSync(join(presetsDir, f)),
      )
    }
  }
  return result
}

function readState() {
  try {
    // 状态文件结构为 { at, files },computePlan 只消费 files 映射
    return JSON.parse(readFileSync(stateFile, 'utf8')).files
  } catch {
    return null
  }
}

function writeState(state) {
  writeFileSync(stateFile, JSON.stringify(state, null, 2))
}

/* ---------- SSR 渲染 ---------- */

let app = null

async function loadApp() {
  // 构建产物中 isServer = process.env.ASTRO_MODE === 'server',
  // 页面据此决定走文件系统(server)还是内容集合缓存(static),脚本必须模拟 server 运行环境
  process.env.ASTRO_MODE = 'server'
  // 阻止 @astrojs/node 在导入 entry.mjs 时自动启动监听服务器
  process.env.ASTRO_NODE_AUTOSTART = 'disabled'
  const manifestFile = readdirSync(serverDir).find((f) =>
    f.startsWith('manifest_') && f.endsWith('.mjs'),
  )
  if (!manifestFile) throw new Error('找不到 dist-server/server/manifest_*.mjs,请先执行 npm run build:server')
  const url = (f) => pathToFileURL(join(serverDir, f)).href
  const [{ manifest }, { pageMap }, { renderers }, middlewareMod] = await Promise.all([
    import(url(manifestFile)),
    import(url('entry.mjs')),
    import(url('renderers.mjs')),
    import(url('_astro-internal_middleware.mjs')),
  ])
  // server 构建中,pageMap 等字段由 entry.mjs 注入 manifest;这里补全后 App 才能定位页面组件
  Object.assign(manifest, {
    pageMap,
    serverIslandMap: new Map(),
    renderers,
    actions: () => import(url('noop-entrypoint.mjs')),
    middleware: () => Promise.resolve(middlewareMod),
  })
  const { App } = await import('astro/app')
  app = new App(manifest)
}

/**
 * 渲染一个路径,返回 { kind: 'html'|'data', body: string|Buffer } 或 null(404)
 * html → 写 {path}/index.html;data(xml/json/txt) → 写 {path}
 */
async function render(path, { allow404 = false } = {}) {
  const res = await app.render(new Request('http://localhost:4321' + path))
  // Astro 对 404 路由返回 404 状态码,静态站需要把内容写成 404.html
  if (res.status !== 200 && !(allow404 && res.status === 404)) return null
  const type = res.headers.get('content-type') ?? ''
  const body = Buffer.from(await res.arrayBuffer())
  if (type.includes('text/html')) return { kind: 'html', body }
  if (type.includes('json')) {
    try {
      return { kind: 'data', body: JSON.stringify(JSON.parse(body.toString('utf8')), null, 2) }
    } catch {
      return { kind: 'data', body: body.toString('utf8') }
    }
  }
  return { kind: 'data', body: body.toString('utf8') }
}

/** 输出路径映射:html → {path}/index.html,data → {path} */
function outputPath(path, kind) {
  // 请求路径是 URL 编码形式(如 /categories/%E9%9A%8F%E7%AC%84),
  // 文件系统目录用解码后的中文名,静态服务器按 URL 解码后查找
  const decoded = decodeURIComponent(path)
  if (kind === 'data') return join(staticDir, decoded)
  const clean = decoded.replace(/\/+$/, '')
  return join(staticDir, clean, 'index.html')
}

function writeOutput(path, kind, body) {
  const out = outputPath(path, kind)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, body)
}

/* ---------- 页面清单 ---------- */

/** 聚合页(任何内容变化都重渲染) */
function aggregatePaths(posts) {
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  const cats = [...new Set(posts.map((p) => p.category))]
  const tags = [...new Set(posts.flatMap((p) => p.tags))]
  const resources = listYamlIds('resources')
  const paths = [
    '/',
    '/about',
    '/blog',
    '/categories',
    '/tags',
    '/friends',
    '/resources',
    '/search',
    '/rss.xml',
    '/robots.txt',
    '/api/search-index.json',
    '/404',
    // 栏目页(标题/描述来自 columns 数据,变化时随聚合页刷新)
    '/fantasy',
    '/journal',
    '/knowledge',
    '/thinking',
  ]
  for (let p = 2; p <= totalPages; p++) paths.push(`/blog/page/${p}`)
  for (const c of cats) paths.push(`/categories/${encodeURIComponent(c)}`)
  for (const t of tags) paths.push(`/tags/${encodeURIComponent(t)}`)
  for (const id of resources) paths.push(`/resources/${id}`)
  return paths
}

/** 全量页面清单:聚合页 + 所有文章详情页 */
function fullPaths(posts) {
  const paths = aggregatePaths(posts)
  for (const p of posts) paths.push(`/blog/${p.slug}`)
  return paths
}

/** 清理失效的聚合页子目录(分类/标签/资源/分页收缩后残留) */
function pruneAggregateDirs(posts) {
  const keep = new Set()
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE))
  for (let p = 2; p <= totalPages; p++) keep.add(`blog/page/${p}`)
  for (const c of new Set(posts.map((p) => p.category))) keep.add(`categories/${c}`)
  for (const t of new Set(posts.flatMap((p) => p.tags))) keep.add(`tags/${t}`)
  for (const id of listYamlIds('resources')) keep.add(`resources/${id}`)
  let removed = 0
  for (const t of ['blog/page', 'categories', 'tags', 'resources']) {
    const abs = join(staticDir, t)
    if (!existsSync(abs)) continue
    for (const entry of readdirSync(abs)) {
      const entryAbs = join(abs, entry)
      if (!statSync(entryAbs).isDirectory()) continue
      if (!keep.has(`${t}/${entry}`)) {
        rmSync(entryAbs, { recursive: true, force: true })
        removed++
      }
    }
    // 子目录全部清空后,目录本身可能为空,一并移除
    if (readdirSync(abs).length === 0) {
      rmSync(abs, { recursive: true, force: true })
    }
  }
  if (removed > 0) console.log(`[static-sync] 清理 ${removed} 个失效聚合目录`)
}

/* ---------- 增量计划 ---------- */

function computePlan(prev, curr) {
  const prevPosts = new Set(Object.keys(prev ?? {}).filter((k) => k.startsWith('src/content/posts/')))
  const currPosts = new Set(Object.keys(curr).filter((k) => k.startsWith('src/content/posts/')))
  const added = [...currPosts].filter((k) => !prevPosts.has(k))
  const removed = [...prevPosts].filter((k) => !currPosts.has(k))
  const changed = [...currPosts].filter(
    (k) => prevPosts.has(k) && prev[k] !== curr[k],
  )
  const otherChanged = Object.keys(curr).some(
    (k) => !k.startsWith('src/content/posts/') && prev?.[k] !== curr[k],
  )
  // 主题预设变化 → 全量(所有页面 CSS 变量都变)
  const presetsChanged = Object.keys(curr).some(
    (k) => k.startsWith('src/themes/presets/') && prev?.[k] !== curr[k],
  )
  const slugOf = (key) => basename(key).replace(/\.(md|mdx)$/, '')
  return {
    addedSlugs: added.map(slugOf),
    removedSlugs: removed.map(slugOf),
    changedSlugs: changed.map(slugOf),
    anyContent: otherChanged || added.length > 0 || changed.length > 0 || removed.length > 0,
    presetsChanged,
  }
}

/* ---------- 主流程 ---------- */

async function main() {
  const args = process.argv.slice(2)
  const init = args.includes('--init')
  const full = args.includes('--full')

  if (!existsSync(serverDir)) {
    console.error('[static-sync] 缺少 dist-server,请先执行 npm run build:server')
    process.exit(1)
  }
  // 资源基线:client 是构建产物(样式/JS/壁纸/封面),页面 HTML 由本脚本渲染
  if (init) {
    if (!existsSync(clientDir)) {
      console.error('[static-sync] 缺少 dist-server/client,请先执行 npm run build:server')
      process.exit(1)
    }
    console.log('[static-sync] --init:清空 dist-static 并复制 client 资源...')
    // cpSync 是合并语义,不清理旧文件(如旧 build:static 残留),先整体清空
    rmSync(staticDir, { recursive: true, force: true })
    mkdirSync(staticDir, { recursive: true })
    cpSync(clientDir, staticDir, { recursive: true })
  }

  await loadApp()
  const posts = listPosts()
  const curr = fingerprint()
  const prev = readState()
  const plan = full ? {
    addedSlugs: [], removedSlugs: [], changedSlugs: [],
    anyContent: true, presetsChanged: true,
  } : computePlan(prev, curr)

  if (!prev && !full && !init) {
    console.log('[static-sync] 无状态记录,执行全量渲染(首次请用 --init)')
    plan.anyContent = true
    plan.presetsChanged = true
  }

  // 删除被移除文章的静态页
  for (const slug of plan.removedSlugs) {
    const dir = join(staticDir, 'blog', slug)
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true })
      console.log(`  - 删除文章页 blog/${slug}`)
    }
  }

  // 渲染集合
  const renderList = []
  if (plan.presetsChanged) {
    console.log('[static-sync] 主题预设变化,全量渲染')
    for (const p of fullPaths(posts)) renderList.push(p)
  } else if (plan.anyContent) {
    for (const p of aggregatePaths(posts)) renderList.push(p)
    for (const slug of [...plan.addedSlugs, ...plan.changedSlugs]) {
      renderList.push(`/blog/${slug}`)
    }
  } else {
    console.log('[static-sync] 无内容变化,跳过')
  }

  // 去重渲染(新增文章同时出现在聚合页集合时避免重复)
  for (const path of [...new Set(renderList)]) {
    const out = await render(path, { allow404: path === '/404' })
    if (!out) {
      console.log(`  - 跳过 ${path}(404)`)
      continue
    }
    if (path === '/404' && out.kind === 'html') {
      // 404 路由输出为 404.html(静态托管约定)
      writeFileSync(join(staticDir, '404.html'), out.body)
      console.log('  ✓ /404.html')
      continue
    }
    writeOutput(path, out.kind, out.body)
    console.log(`  ✓ ${path}`)
  }

  if (!init) pruneAggregateDirs(posts)

  writeState({ at: Date.now(), files: curr })
  console.log('[static-sync] 完成. 状态已写入 .static-sync-state.json')
}

main().catch((e) => {
  console.error('[static-sync] 失败:', e)
  process.exit(1)
})
