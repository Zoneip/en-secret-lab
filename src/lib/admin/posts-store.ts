/**
 * 文章文件存储(动态版):直接读写内容目录下的 posts/*.md
 * 内容目录优先取 CONTENT_DIR 环境变量(Docker 部署用),否则为运行目录下的 src/content
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync, unlinkSync, statSync } from 'node:fs'
import { join } from 'node:path'

const postsDir = join(
  process.env.CONTENT_DIR ?? join(process.cwd(), 'src', 'content'),
  'posts'
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

const REQUIRED: Array<keyof PostDraft> = ['slug', 'title', 'pubDate', 'category']

function assertValid(draft: Partial<PostDraft>): asserts draft is PostDraft {
  for (const key of REQUIRED) {
    if (!draft[key]) throw new Error(`缺少必填字段:${key}`)
  }
  if (!/^[a-z0-9-]+$/.test(draft.slug!)) {
    throw new Error('slug 仅允许小写字母、数字与连字符')
  }
}

export function serializePost(d: PostDraft): string {
  const lines = [
    '---',
    `title: ${d.title}`,
    `pubDate: ${d.pubDate}`,
  ]
  if (d.description) lines.push(`description: ${d.description}`)
  if (d.updatedDate) lines.push(`updatedDate: ${d.updatedDate}`)
  lines.push(`category: ${d.category}`)
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
        // 兼容 YAML 数组与简单列表:先取 [ ] 内内容,再逐个匹配引号/裸词
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
      tags: (fm.tags as string[]) ?? [],
      draft: Boolean(fm.draft),
      featured: Boolean(fm.featured),
      body: m?.[2]?.trim() ?? raw,
    },
  }
}

export function listPosts(): PostFile[] {
  mkdirSync(postsDir, { recursive: true })
  const files = readdirSync(postsDir).filter((f) => /\.(md|mdx)$/.test(f) && statSync(join(postsDir, f)).isFile())
  return files
    .map((f) => parsePostFile(f, readFileSync(join(postsDir, f), 'utf8')))
    .sort((a, b) => +new Date(b.draft.pubDate) - +new Date(a.draft.pubDate))
}

export function getPost(slug: string): PostFile | null {
  return listPosts().find((p) => p.slug === slug) ?? null
}

export function savePost(draft: Partial<PostDraft> & { slug: string }): PostFile {
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

/** 供编辑页读取单个文章全文 */
export function getPostPath(slug: string): string | null {
  const post = getPost(slug)
  return post ? join(postsDir, post.fileName) : null
}
