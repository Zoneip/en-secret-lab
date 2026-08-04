/**
 * 动态版前台数据源:SSR 模式实时读取内容目录文件
 * (Astro 内容集合在构建时固化,控制台新增文章无法即时生效,故动态版前台走文件系统)
 * 仅 server 模式调用;静态版继续使用 astro:content
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { PostLike } from './posts'
import type { PostDraft } from '../admin/posts-store'
import { parsePostFile, postsDirOf } from '../admin/posts-store'

export function fsPostsDir(): string {
  return postsDirOf()
}

export function fsReadPost(slug: string): { post: PostLike; body: string } | null {
  const dir = fsPostsDir()
  const mdPath = join(dir, `${slug}.md`)
  const mdxPath = join(dir, `${slug}.mdx`)
  const file = existsSync(mdPath) ? mdPath : existsSync(mdxPath) ? mdxPath : null
  if (!file) return null
  const parsed = parsePostFile(file.split('/').pop()!, readFileSync(file, 'utf8'))
  return {
    post: toPostLike(parsed),
    body: parsed.draft.body,
  }
}

export function toPostLike(parsed: { slug: string; draft: PostDraft }): PostLike {
  return {
    id: parsed.slug,
    slug: parsed.slug,
    title: parsed.draft.title,
    pubDate: new Date(parsed.draft.pubDate),
    category: parsed.draft.category,
    series: parsed.draft.series,
    tags: parsed.draft.tags,
    featured: parsed.draft.featured,
    draft: parsed.draft.draft,
    description: parsed.draft.description,
    cover: undefined,
  }
}
