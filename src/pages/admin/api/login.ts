/**
 * POST /admin/api/login
 * body: { username, password }
 */
import type { APIRoute } from 'astro'
import { loadEnv } from '../../../lib/env'
import { isServer } from '../../../lib/utils'
import { ensureAdminPassword, verifyPassword, createSession, SESSION_COOKIE } from '../../../lib/admin/auth'

export const prerender = !isServer

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  ensureAdminPassword() // 幂等:首次请求时用环境变量初始化密码哈希
  const body = (await request.json().catch(() => null)) as { username?: string; password?: string } | null
  const env = loadEnv(process.env)
  if (!body?.username || !body.password) {
    return new Response(JSON.stringify({ error: '用户名和密码不能为空' }), { status: 400 })
  }
  if (body.username !== env.ADMIN_USERNAME || !verifyPassword(body.password)) {
    return new Response(JSON.stringify({ error: '用户名或密码错误' }), { status: 401 })
  }
  const token = createSession()
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // 生产由反代处理 HTTPS
    path: '/',
    maxAge: 30 * 24 * 3600,
  })
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

/** 静态构建占位:静态站无 POST,返回 404 */
export const GET: APIRoute = () => new Response(null, { status: 404 })

