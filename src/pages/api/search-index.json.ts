/**
 * GET /api/search-index.json — 公开搜索索引(仅动态版;静态版用 pagefind)
 * 返回已发布文章的标题/摘要/标签/正文,供前端本地过滤
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../lib/utils'
import { getAllPosts } from '../../lib/content/data'
import { fsReadPost } from '../../lib/content/fs-posts'

export const prerender = !isServer

export const GET: APIRoute = async () => {
  if (!isServer) return new Response('Not Found', { status: 404 })
  const posts = await getAllPosts()
  const index = posts.map((p) => {
    const full = fsReadPost(p.slug)
    return {
      slug: p.slug,
      title: p.title,
      description: p.description ?? '',
      tags: p.tags,
      pubDate: p.pubDate.toISOString(),
      body: full?.body ?? '',
    }
  })
  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  })
}
