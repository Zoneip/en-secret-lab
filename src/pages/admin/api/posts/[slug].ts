/**
 * GET /admin/api/posts/[slug] — 单篇文章全文
 * PUT /admin/api/posts/[slug] — 更新文章(支持改 slug)
 * DELETE /admin/api/posts/[slug] — 删除文章
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../../lib/utils'
import { getPost, savePost, deletePost, type PostDraft } from '../../../../lib/admin/posts-store'

export const prerender = !isServer

/** 静态构建占位:不生成任何路径(admin 为 server 专属) */
export function getStaticPaths() {
  return []
}

export const GET: APIRoute = ({ params }) => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const post = getPost(params.slug ?? '')
  if (!post) return new Response(JSON.stringify({ error: '文章不存在' }), { status: 404 })
  return new Response(JSON.stringify({ ok: true, ...post }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const PUT: APIRoute = async ({ params, request }) => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const body = (await request.json().catch(() => null)) as Partial<PostDraft> | null
  if (!body) return new Response(JSON.stringify({ error: '请求体无效' }), { status: 400 })
  try {
    const target = body.slug ?? params.slug ?? ''
    if (target !== params.slug && getPost(target)) {
      return new Response(JSON.stringify({ error: `slug「${target}」已被占用` }), { status: 422 })
    }
    const existing = getPost(params.slug ?? '')
    if (!existing) return new Response(JSON.stringify({ error: '文章不存在' }), { status: 404 })
    // 改 slug 时删除旧文件
    if (target !== params.slug) deletePost(params.slug!)
    const merged: Partial<PostDraft> & { slug: string } = {
      ...existing.draft,
      ...body,
      slug: target,
    }
    const saved = savePost(merged)
    return new Response(JSON.stringify({ ok: true, post: saved }))
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 422 })
  }
}

export const DELETE: APIRoute = ({ params }) => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const ok = deletePost(params.slug ?? '')
  if (!ok) return new Response(JSON.stringify({ error: '文章不存在' }), { status: 404 })
  return new Response(JSON.stringify({ ok: true }))
}
