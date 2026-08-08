/**
 * GET /admin/api/posts-meta — 获取所有分类和标签
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import { getCategories, getTags } from '../../../lib/admin/posts-store'

export const prerender = !isServer

export const GET: APIRoute = () => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const categories = getCategories()
  const tags = getTags()
  return new Response(JSON.stringify({ categories, tags }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
