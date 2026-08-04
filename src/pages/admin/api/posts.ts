/**
 * GET /admin/api/posts — 文章列表(含草稿)
 * POST /admin/api/posts — 新建文章
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import { listPosts, savePost, type PostDraft } from '../../../lib/admin/posts-store'

export const prerender = !isServer

export const GET: APIRoute = () => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const posts = listPosts()
  return new Response(
    JSON.stringify({
      posts: posts.map((post) => ({
        ...post.draft,
        slug: post.slug,
        fileName: post.fileName,
        body: undefined,
      })),
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
export const POST: APIRoute = async ({ request }) => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const body = (await request.json().catch(() => null)) as Partial<PostDraft> | null
  if (!body) return new Response(JSON.stringify({ error: '请求体无效' }), { status: 400 })
  try {
    const saved = savePost(body as Partial<PostDraft> & { slug: string })
    return new Response(JSON.stringify({ ok: true, post: saved }))
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 422 })
  }
}
