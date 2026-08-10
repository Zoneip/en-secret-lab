/**
 * POST /admin/api/login
 * body: { username, password }
 * 仅站主(owner)账号可登录控制台
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import {
  ensureOwnerAccount,
  verifyLogin,
  createSession,
  clientIp,
  loginBlocked,
  recordLoginFailure,
  clearLoginFailures,
  SESSION_COOKIE,
} from '../../../lib/admin/auth'

export const prerender = !isServer

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  ensureOwnerAccount() // 幂等:首次请求时迁移/初始化站主账号
  const ip = clientIp(request)
  if (loginBlocked(ip)) {
    return new Response(
      JSON.stringify({ error: '尝试次数过多,请稍后再试' }),
      { status: 429 },
    )
  }
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
    recordLoginFailure(ip)
    return new Response(JSON.stringify({ error: result.error }), {
      status: 401,
    })
  }
  if (result.user.role !== 'owner') {
    recordLoginFailure(ip)
    return new Response(JSON.stringify({ error: '该账号无控制台权限' }), {
      status: 401,
    })
  }
  clearLoginFailures(ip)
  const token = createSession(result.user.id)
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
