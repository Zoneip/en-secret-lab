/** 旧路由重定向 → 合并后的设置页 */
import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = ({ redirect }) => redirect('/admin/settings?tab=site', 301)
