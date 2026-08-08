/**
 * GET  /admin/api/resources        — 资源列表
 * POST /admin/api/resources        — 新建资源(缺失字段走默认值)
 * PUT  /admin/api/resources        — 全量更新资源(单条,按 body.id)
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import {
  listResources,
  saveResource,
  getResource,
  type ResourceData,
} from '../../../lib/admin/resources-store'

export const prerender = !isServer

export const GET: APIRoute = () => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  return new Response(JSON.stringify({ resources: listResources() }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

const ID_RE = /^[a-z0-9-]+$/

/** 提交数据(全量更新语义:缺失字段按默认值重置) */
type ResourcePayload = Omit<ResourceData, 'id' | 'downloads'>

function cleanResource(
  id: string,
  data: Partial<ResourcePayload>,
): ResourcePayload {
  if (data.file && !String(data.file).startsWith('/uploads/')) {
    throw new Error(`资源「${id}」文件路径无效`)
  }
  return {
    title: (data.title ?? '').trim(),
    description: (data.description ?? '').trim(),
    category: (data.category ?? '其他').trim(),
    tags: Array.isArray(data.tags)
      ? data.tags.map((t) => String(t).trim()).filter(Boolean)
      : [],
    size: data.size?.trim() || undefined,
    file: data.file?.trim() || undefined,
    externalUrl: data.externalUrl?.trim() || undefined,
    pubDate: data.pubDate ?? new Date().toISOString().slice(0, 10),
  }
}

export const POST: APIRoute = async ({ request }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const body = (await request.json().catch(() => null)) as
    ({ id?: string; title?: string } & Partial<ResourcePayload>) | null
  if (!body)
    return new Response(JSON.stringify({ error: '请求体无效' }), {
      status: 400,
    })
  const id = (body.id ?? '').trim()
  if (!ID_RE.test(id))
    return new Response(
      JSON.stringify({ error: '资源 id 仅允许小写字母、数字与连字符' }),
      { status: 400 },
    )
  if (!body.title?.trim())
    return new Response(JSON.stringify({ error: '资源缺少标题' }), {
      status: 400,
    })
  if (getResource(id))
    return new Response(JSON.stringify({ error: `资源「${id}」已存在` }), {
      status: 409,
    })
  try {
    const resource = saveResource(id, cleanResource(id, body))
    return new Response(JSON.stringify({ ok: true, resource }))
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 422,
    })
  }
}

export const PUT: APIRoute = async ({ request }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const body = (await request.json().catch(() => null)) as
    ({ id?: unknown } & Partial<ResourcePayload>) | null
  if (!body || typeof body.id !== 'string' || !body.id.trim())
    return new Response(JSON.stringify({ error: '缺少资源 id' }), {
      status: 400,
    })
  const id = body.id.trim()
  if (!ID_RE.test(id))
    return new Response(
      JSON.stringify({ error: '资源 id 仅允许小写字母、数字与连字符' }),
      { status: 400 },
    )
  if (!getResource(id))
    return new Response(JSON.stringify({ error: `资源「${id}」不存在` }), {
      status: 404,
    })
  try {
    const resource = saveResource(id, cleanResource(id, body))
    return new Response(JSON.stringify({ ok: true, resource }))
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 422,
    })
  }
}
