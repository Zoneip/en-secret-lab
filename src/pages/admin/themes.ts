/** 旧路由重定向 → 设置页主题 Tab */
import type { APIRoute } from 'astro'
import { isServer } from '../../lib/utils'

export const prerender = !isServer

export const GET: APIRoute = ({ redirect }) => {
  if (!isServer) return new Response('Not Found', { status: 404 })
  return redirect('/admin/settings?tab=themes', 301)
}
