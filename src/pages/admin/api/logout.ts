/**
 * POST /admin/api/logout
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import { destroySession, SESSION_COOKIE } from '../../../lib/admin/auth'

export const prerender = !isServer

export const POST: APIRoute = async ({ cookies }) => {
  if (!isServer)
    return new Response(JSON.stringify({ ok: false }), { status: 404 })
  const token = cookies.get(SESSION_COOKIE)?.value
  if (token) destroySession(token)
  cookies.delete(SESSION_COOKIE, { path: '/' })
  return new Response(JSON.stringify({ ok: true }))
}

/** 静态构建占位:静态站无 POST,返回 404 */
export const GET: APIRoute = () => new Response(null, { status: 404 })
