/**
 * 动态版前台统一数据源:server 模式实时读文件系统,static 模式用 Astro 内容集合
 * 返回统一的 PostLike 扁平结构
 * 注意:astro:content 必须顶层静态导入(动态 import 在 SSR 构建会被错误转换)
 */
import { getCollection } from 'astro:content'
import { isServer } from '../utils'
import { published, type PostLike } from './posts'
import { fsPostsDir, fsReadPost, toPostLike } from './fs-posts'
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parsePostFile } from '../admin/posts-store'

/** 全部已发布文章(按日期降序) */
export async function getAllPosts(): Promise<PostLike[]> {
  if (isServer) {
    const dir = fsPostsDir()
    // 尚未发布任何文章时目录可能不存在,视为空列表
    if (!existsSync(dir)) return []
    const files = readdirSync(dir).filter(
      (f) => /\.(md|mdx)$/.test(f) && statSync(join(dir, f)).isFile(),
    )
    const parsed = files
      .map((f) => parsePostFile(f, readFileSync(join(dir, f), 'utf8')))
      .filter((p) => !p.draft.draft)
      .map(toPostLike)
    return parsed.sort((a, b) => +b.pubDate - +a.pubDate)
  }
  return published(await getCollection('posts'))
}

/** 单篇文章 + 原始正文 */
export async function getPostContent(
  slug: string,
): Promise<{ post: PostLike; body: string } | null> {
  if (isServer) return fsReadPost(slug)
  const entry = (await getCollection('posts')).find(
    (p) => p.slug === slug && !p.data.draft,
  )
  if (!entry) return null
  return {
    post: toPostLike({ slug: entry.slug, draft: entry.data } as never),
    body: entry.body,
  }
}
