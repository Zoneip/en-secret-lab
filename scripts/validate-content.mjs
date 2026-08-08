#!/usr/bin/env node
/**
 * 内容质量门禁(CI 与本地共用):
 *  - slug 唯一性
 *  - frontmatter 必填字段、类型
 *  - 标签为字符串数组、分类非空
 *  - 封面引用存在于 public/assets/blog/<slug>/
 *  - 日期可解析且非未来日期(允许 ±1 天缓冲)
 * 非零退出码 = 门禁失败
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const postsDir = join(root, 'src', 'content', 'posts')

function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!m) return null
  const body = {}
  for (const line of m[1].split('\n')) {
    const eq = line.match(/^([a-zA-Z]+):\s*(.*)$/)
    if (!eq) continue
    const [, key, value] = eq
    if (key === 'tags') {
      body.tags = [...value.matchAll(/"([^"]+)"|'([^']+)'|([^,[\]]+)/g)]
        .map((g) => (g[1] ?? g[2] ?? g[3]).trim())
        .filter(Boolean)
    } else if (key === 'draft' || key === 'featured') {
      body[key] = value === 'true'
    } else if (key === 'pubDate' || key === 'updatedDate') {
      body[key] = value
    } else {
      body[key] = value.trim()
    }
  }
  return body
}

const errors = []
const slugs = new Set()

for (const file of readdirSync(postsDir)) {
  if (!/\.(md|mdx)$/.test(file)) continue
  const filePath = join(postsDir, file)
  const stat = statSync(filePath)
  if (stat.isDirectory()) continue

  const slug = file.replace(/\.(md|mdx)$/, '')
  if (slugs.has(slug)) errors.push(`${file}:slug 重复`)
  slugs.add(slug)

  const fm = parseFrontmatter(readFileSync(filePath, 'utf8'))
  if (!fm) {
    errors.push(`${file}:缺少 frontmatter`)
    continue
  }
  if (!fm.title) errors.push(`${file}:缺少 title`)
  if (!fm.pubDate || Number.isNaN(Date.parse(fm.pubDate)))
    errors.push(`${file}:pubDate 缺失或不可解析`)
  if (!fm.category) errors.push(`${file}:缺少 category`)
  if (fm.tags !== undefined && !Array.isArray(fm.tags))
    errors.push(`${file}:tags 必须是数组`)

  if (fm.cover) {
    const coverPath = join(root, 'public', 'assets', 'blog', slug, fm.cover)
    if (!existsSync(coverPath))
      errors.push(`${file}:封面 ${fm.cover} 不存在(${coverPath})`)
  }

  if (fm.pubDate) {
    const d = new Date(fm.pubDate).getTime()
    if (d - Date.now() > 86400000) errors.push(`${file}:pubDate 是未来日期`)
  }
}

if (errors.length) {
  console.error(`内容校验失败(${errors.length}):`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log(`内容校验通过:${slugs.size} 篇文章`)
