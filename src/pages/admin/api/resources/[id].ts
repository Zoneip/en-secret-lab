/**
 * DELETE /admin/api/resources/[id] — 删除资源(含下载计数)
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../../lib/utils'
import {
  deleteResource,
  getResource,
} from '../../../../lib/admin/resources-store'

export const prerender = !isServer

export function getStaticPaths() {
  return []
}

export const DELETE: APIRoute = ({ params }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const id = params.id ?? ''
  if (!getResource(id))
    return new Response(JSON.stringify({ error: `资源「${id}」不存在` }), {
      status: 404,
    })
  if (!deleteResource(id))
    return new Response(JSON.stringify({ error: `资源「${id}」删除失败` }), {
      status: 500,
    })
  return new Response(JSON.stringify({ ok: true }))
}

/** 静态构建占位:静态站无 DELETE,返回 404 */
export const GET: APIRoute = () => new Response(null, { status: 404 })
