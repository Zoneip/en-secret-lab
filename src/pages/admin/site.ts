/** 旧路由重定向 → 合并后的设置页 */
import type { APIRoute } from 'astro'
import { isServer } from '../../lib/utils'

export const prerender = !isServer

export const GET: APIRoute = ({ redirect }) => {
  if (!isServer) return new Response('Not Found', { status: 404 })
  return redirect('/admin/settings?tab=site', 301)
}
