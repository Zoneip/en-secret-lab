/**
 * GET /admin/api/posts-stats — 文章统计数据
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import { getStats } from '../../../lib/admin/posts-store'

export const prerender = !isServer

export const GET: APIRoute = () => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const stats = getStats()
  return new Response(JSON.stringify({ stats }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
