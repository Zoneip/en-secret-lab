/**
 * GET /admin/api/posts — 文章列表(支持搜索、筛选、排序、分页)
 * POST /admin/api/posts — 新建文章
 * PATCH /admin/api/posts — 批量操作
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import {
  listPostsAdvanced,
  savePost,
  batchUpdate,
  batchDelete,
  type PostDraft,
  type ListPostsOptions,
} from '../../../lib/admin/posts-store'

export const prerender = !isServer

export const GET: APIRoute = ({ url }) => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })

  const params = new URLSearchParams(url.search)
  const options: ListPostsOptions = {
    search: params.get('search') ?? undefined,
    category: params.get('category') ?? undefined,
    tag: params.get('tag') ?? undefined,
    status: (params.get('status') as 'all' | 'draft' | 'published') ?? 'all',
    fromDate: params.get('fromDate') ?? undefined,
    toDate: params.get('toDate') ?? undefined,
    sortBy: (params.get('sortBy') as ListPostsOptions['sortBy']) ?? 'date-desc',
    page: Number(params.get('page') ?? '1'),
    pageSize: Number(params.get('pageSize') ?? '20'),
  }

  const result = listPostsAdvanced(options)

  return new Response(
    JSON.stringify({
      posts: result.posts.map((post) => ({
        ...post.draft,
        slug: post.slug,
        fileName: post.fileName,
        body: undefined,
      })),
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
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

/** 批量操作端点 */
export const PATCH: APIRoute = async ({ request }) => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const body = (await request.json().catch(() => null)) as
    | { action: 'delete'; slugs: string[] }
    | { action: 'update'; slugs: string[]; draft?: boolean; category?: string; featured?: boolean }
    | null

  if (!body) return new Response(JSON.stringify({ error: '请求体无效' }), { status: 400 })
  if (!body.slugs?.length) return new Response(JSON.stringify({ error: '请选择至少一篇文章' }), { status: 400 })

  try {
    if (body.action === 'delete') {
      const result = batchDelete(body.slugs)
      return new Response(JSON.stringify({ ok: true, ...result }))
    }

    if (body.action === 'update') {
      const result = batchUpdate({
        slugs: body.slugs,
        draft: body.draft,
        category: body.category,
        featured: body.featured,
      })
      return new Response(JSON.stringify({ ok: true, ...result }))
    }

    return new Response(JSON.stringify({ error: `未知操作:${(body as { action?: string })?.action}` }), { status: 400 })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 422 })
  }
}
