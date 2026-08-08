/**
 * 文章文件存储(动态版):直接读写内容目录下的 posts/*.md
 * 内容目录优先取 CONTENT_DIR 环境变量(Docker 部署用),否则为运行目录下的 src/content
 */
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  statSync,
} from 'node:fs'
import { join, basename, extname } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { readDoc } from './docs-store'

const postsDir = join(
  process.env.CONTENT_DIR ?? join(process.cwd(), 'src', 'content'),
  'posts',
)

export function postsDirOf(): string {
  return postsDir
}

export interface PostDraft {
  slug: string
  title: string
  description?: string
  pubDate: string
  updatedDate?: string
  category: string
  series?: string
  tags: string[]
  draft: boolean
  featured: boolean
  body: string
}

export interface PostFile {
  slug: string
  fileName: string
  draft: PostDraft
}

export interface ListPostsOptions {
  /** 搜索关键词(匹配标题/标签/描述) */
  search?: string
  /** 按分类筛选 */
  category?: string
  /** 按标签筛选 */
  tag?: string
  /** 状态筛选:all 全部/draft 草稿/published 已发布 */
  status?: 'all' | 'draft' | 'published'
  /** 按日期范围筛选 */
  fromDate?: string
  toDate?: string
  /** 排序方式 */
  sortBy?:
    'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'updated-desc'
  /** 分页 */
  page?: number
  pageSize?: number
}

export interface ListPostsResult {
  posts: PostFile[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface BatchUpdateOptions {
  slugs: string[]
  draft?: boolean
  category?: string
  featured?: boolean
}

export interface PostStats {
  total: number
  draft: number
  published: number
  featured: number
  categories: { name: string; count: number }[]
  tags: { name: string; count: number }[]
  totalWords: number
}

const REQUIRED: Array<keyof PostDraft> = [
  'slug',
  'title',
  'pubDate',
  'category',
]

function assertValid(draft: Partial<PostDraft>): asserts draft is PostDraft {
  for (const key of REQUIRED) {
    if (!draft[key]) throw new Error(`缺少必填字段:${key}`)
  }
  if (!/^[a-z0-9-]+$/.test(draft.slug!)) {
    throw new Error('slug 仅允许小写字母、数字与连字符')
  }
}

export function serializePost(d: PostDraft): string {
  const lines = ['---', `title: ${d.title}`, `pubDate: ${d.pubDate}`]
  if (d.description) lines.push(`description: ${d.description}`)
  if (d.updatedDate) lines.push(`updatedDate: ${d.updatedDate}`)
  lines.push(`category: ${d.category}`)
  if (d.series) lines.push(`series: ${d.series}`)
  if (d.tags.length > 0) {
    lines.push(`tags: ${JSON.stringify(d.tags).replace(/"/g, "'")}`)
  }
  lines.push(`draft: ${d.draft}`)
  if (d.featured) lines.push(`featured: ${d.featured}`)
  lines.push('---')
  lines.push('')
  lines.push(d.body.trim())
  lines.push('')
  return lines.join('\n')
}

export function parsePostFile(fileName: string, raw: string): PostFile {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  const fm: Record<string, string | boolean | string[]> = {}
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
    fileName,
    draft: {
      slug: fileName.replace(/\.(md|mdx)$/, ''),
      title: String(fm.title ?? '未命名'),
      description: fm.description ? String(fm.description) : undefined,
      pubDate: String(fm.pubDate ?? new Date().toISOString().slice(0, 10)),
      updatedDate: fm.updatedDate ? String(fm.updatedDate) : undefined,
      category: String(fm.category ?? '随笔'),
      series: fm.series ? String(fm.series) : undefined,
      tags: (fm.tags as string[]) ?? [],
      draft: Boolean(fm.draft),
      featured: Boolean(fm.featured),
      body: m?.[2]?.trim() ?? raw,
    },
  }
}

/** 原始列表(不分页、不筛选) */
function _listAllPosts(): PostFile[] {
  mkdirSync(postsDir, { recursive: true })
  const files = readdirSync(postsDir).filter(
    (f) => /\.(md|mdx)$/.test(f) && statSync(join(postsDir, f)).isFile(),
  )
  return files.map((f) =>
    parsePostFile(f, readFileSync(join(postsDir, f), 'utf8')),
  )
}

/** 兼容旧 API:返回全部文章(按日期倒序) */
export function listPosts(): PostFile[] {
  return _listAllPosts().sort(
    (a, b) => +new Date(b.draft.pubDate) - +new Date(a.draft.pubDate),
  )
}

/** 增强版列表:支持搜索、筛选、排序、分页 */
export function listPostsAdvanced(
  opts: ListPostsOptions = {},
): ListPostsResult {
  const {
    search,
    category,
    tag,
    status,
    fromDate,
    toDate,
    sortBy = 'date-desc',
    page = 1,
    pageSize = 20,
  } = opts

  let posts = _listAllPosts()

  // 搜索
  if (search) {
    const kw = search.toLowerCase()
    posts = posts.filter(
      (p) =>
        p.draft.title.toLowerCase().includes(kw) ||
        p.draft.description?.toLowerCase().includes(kw) ||
        p.draft.tags.some((t) => t.toLowerCase().includes(kw)),
    )
  }

  // 分类筛选
  if (category) {
    posts = posts.filter((p) => p.draft.category === category)
  }

  // 标签筛选
  if (tag) {
    posts = posts.filter((p) => p.draft.tags.includes(tag))
  }

  // 状态筛选
  if (status === 'draft') {
    posts = posts.filter((p) => p.draft.draft)
  } else if (status === 'published') {
    posts = posts.filter((p) => !p.draft.draft)
  }

  // 日期范围
  if (fromDate) {
    posts = posts.filter((p) => p.draft.pubDate >= fromDate)
  }
  if (toDate) {
    posts = posts.filter((p) => p.draft.pubDate <= toDate)
  }

  // 排序
  posts.sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return +new Date(a.draft.pubDate) - +new Date(b.draft.pubDate)
      case 'date-desc':
        return +new Date(b.draft.pubDate) - +new Date(a.draft.pubDate)
      case 'title-asc':
        return a.draft.title.localeCompare(b.draft.title, 'zh-CN')
      case 'title-desc':
        return b.draft.title.localeCompare(a.draft.title, 'zh-CN')
      case 'updated-desc':
        return (
          +new Date(b.draft.updatedDate ?? b.draft.pubDate) -
          +new Date(a.draft.updatedDate ?? a.draft.pubDate)
        )
      default:
        return 0
    }
  })

  const total = posts.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize

  return {
    posts: posts.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  }
}

export function getPost(slug: string): PostFile | null {
  return _listAllPosts().find((p) => p.slug === slug) ?? null
}

export function savePost(
  draft: Partial<PostDraft> & { slug: string },
): PostFile {
  assertValid(draft)
  mkdirSync(postsDir, { recursive: true })
  const fileName = `${draft.slug}.md`
  writeFileSync(join(postsDir, fileName), serializePost(draft))
  return { slug: draft.slug, fileName, draft }
}

export function deletePost(slug: string): boolean {
  const post = getPost(slug)
  if (!post) return false
  unlinkSync(join(postsDir, post.fileName))
  return true
}

/** 批量更新 */
export function batchUpdate(options: BatchUpdateOptions): { updated: number } {
  const { slugs, draft, category, featured } = options
  let updated = 0

  for (const slug of slugs) {
    const post = getPost(slug)
    if (!post) continue

    const merged: PostDraft = {
      ...post.draft,
      ...(draft !== undefined ? { draft } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(featured !== undefined ? { featured } : {}),
      updatedDate: new Date().toISOString().slice(0, 10),
    }

    savePost(merged)
    updated++
  }

  return { updated }
}

/** 批量删除 */
export function batchDelete(slugs: string[]): { deleted: number } {
  let deleted = 0
  for (const slug of slugs) {
    if (deletePost(slug)) deleted++
  }
  return { deleted }
}

/** 获取所有分类及其文章数 */
export function getCategories(): { name: string; count: number }[] {
  const posts = _listAllPosts()
  const map = new Map<string, number>()
  for (const p of posts) {
    map.set(p.draft.category, (map.get(p.draft.category) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/** 获取所有标签及其文章数 */
export function getTags(): { name: string; count: number }[] {
  const posts = _listAllPosts()
  const map = new Map<string, number>()
  for (const p of posts) {
    for (const tag of p.draft.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1)
    }
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/** 文章统计 */
export function getStats(): PostStats {
  const posts = _listAllPosts()
  const published = posts.filter((p) => !p.draft.draft)
  const featured = posts.filter((p) => p.draft.featured)

  const categories = getCategories()
  const tags = getTags()

  const totalWords = posts.reduce((sum, p) => sum + p.draft.body.length, 0)

  return {
    total: posts.length,
    draft: posts.length - published.length,
    published: published.length,
    featured: featured.length,
    categories,
    tags,
    totalWords,
  }
}

/** 供编辑页读取单个文章全文 */
export function getPostPath(slug: string): string | null {
  const post = getPost(slug)
  return post ? join(postsDir, post.fileName) : null
}

/* ============ 文档库 → 文章发布 ============ */

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function slugFromFileName(fileName: string): string {
  const base = basename(fileName, extname(fileName))
  const latin = base.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const slug = latin
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (/^[a-z0-9-]+$/.test(slug) && slug.length > 0) return slug
  // 文件名全非拉丁时回退到拼音式 slug
  return slugify(base) || 'untitled'
}

function parseFrontmatter(raw: string): {
  fm: Record<string, unknown>
  body: string
} {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!m) return { fm: {}, body: raw }
  try {
    const fm = parseYaml(m[1]) as Record<string, unknown>
    return { fm: fm ?? {}, body: m[2].trim() }
  } catch {
    return { fm: {}, body: raw }
  }
}

function extractFirstHeading(body: string): string | undefined {
  const m = body.match(/^#\s+(.+)$/m)
  return m?.[1].trim()
}

function coerceTags(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.map((i) => String(i).trim()).filter(Boolean)
  }
  if (typeof v === 'string') {
    return v
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean)
  }
  return []
}

/**
 * 把文档库中的文档解析为文章草稿。
 * 优先读取 frontmatter；缺失时从文件名/正文提取。
 */
export function parseDocToDraft(
  docPath: string,
  raw: string,
): { slug: string; body: string } & Partial<Omit<PostDraft, 'slug' | 'body'>> {
  const { fm, body } = parseFrontmatter(raw)
  const fileTitle = basename(docPath, extname(docPath))
  const headingTitle = extractFirstHeading(body)
  const title = String(fm.title ?? headingTitle ?? fileTitle)

  const slug =
    typeof fm.slug === 'string' && fm.slug.trim()
      ? fm.slug.trim()
      : slugFromFileName(docPath)

  const pubDate =
    typeof fm.pubDate === 'string' && fm.pubDate.trim()
      ? fm.pubDate.trim()
      : new Date().toISOString().slice(0, 10)

  return {
    title,
    slug,
    pubDate,
    category: String(fm.category ?? '随笔'),
    tags: coerceTags(fm.tags),
    description: fm.description ? String(fm.description) : undefined,
    series: fm.series ? String(fm.series) : undefined,
    draft: fm.draft === false ? false : true,
    featured: fm.featured === true,
    body,
  }
}

/**
 * 把文档库中的一篇文档发布为文章。
 * 原文档保留不动，仅在 posts 目录新建/覆盖文章文件。
 */
export function publishDoc(
  docPath: string,
  overrides: Partial<PostDraft> = {},
): PostFile {
  const { name: _unused, content } = readDoc(docPath)
  void _unused
  const base = parseDocToDraft(docPath, content)

  const merged: Partial<PostDraft> & { slug: string } = {
    ...base,
    ...overrides,
    slug: overrides.slug?.trim() || base.slug,
    body: overrides.body ?? base.body,
  }

  // slug 冲突显式报错，避免隐式覆盖
  if (getPost(merged.slug) && !overrides.slug) {
    throw new Error(`slug「${merged.slug}」已被占用，请修改后重试`)
  }

  return savePost(merged)
}
