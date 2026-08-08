/**
 * POST /api/auth/login — 访客账号登录(预留接口,供前台评论等后续功能复用)
 * body: { username, password }
 * 返回会话 token(由调用方自行存储),控制台登录请走 /admin/api/login
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import {
  ensureOwnerAccount,
  verifyLogin,
  createSession,
} from '../../../lib/admin/auth'

export const prerender = !isServer

export const POST: APIRoute = async ({ request }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  ensureOwnerAccount()
  const body = (await request.json().catch(() => null)) as {
    username?: string
    password?: string
  } | null
  if (!body?.username || !body.password) {
    return new Response(JSON.stringify({ error: '用户名和密码不能为空' }), {
      status: 400,
    })
  }
  const result = verifyLogin(body.username, body.password)
  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 401,
    })
  }
  const token = createSession()
  return new Response(JSON.stringify({ ok: true, token, user: result.user }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

/** 静态构建占位:静态站无 POST,返回 404 */
export const GET: APIRoute = () => new Response(null, { status: 404 })
