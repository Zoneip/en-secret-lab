/**
 * GET  /admin/api/accounts — 账号列表(站主在前,不含密码哈希)
 * POST /admin/api/accounts — 创建访客账号(注册接口,仅控制台后台调用)
 * body: { username, display_name?, password, email? }
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import {
  ensureOwnerAccount,
  hashPassword,
  toPublicUser,
} from '../../../lib/admin/auth'
import { userGetByUsername, userList, userCreate } from '../../../lib/admin/db'

export const prerender = !isServer

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,32}$/

export const GET: APIRoute = () => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  ensureOwnerAccount()
  return new Response(
    JSON.stringify({ accounts: userList().map(toPublicUser) }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

export const POST: APIRoute = async ({ request }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  ensureOwnerAccount()
  const body = (await request.json().catch(() => null)) as {
    username?: string
    display_name?: string
    password?: string
    email?: string
  } | null
  const username = body?.username?.trim() ?? ''
  if (!USERNAME_RE.test(username)) {
    return new Response(
      JSON.stringify({ error: '用户名需为 3-32 位字母/数字/下划线/短横线' }),
      { status: 400 },
    )
  }
  const password = body?.password ?? ''
  if (password.length < 8) {
    return new Response(JSON.stringify({ error: '密码至少 8 位' }), {
      status: 400,
    })
  }
  if (userGetByUsername(username)) {
    return new Response(JSON.stringify({ error: '用户名已存在' }), {
      status: 400,
    })
  }
  userCreate({
    username,
    display_name: body?.display_name?.trim() || null,
    password_hash: hashPassword(password),
    email: body?.email?.trim() || null,
    role: 'visitor',
  })
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

/** 静态构建占位:静态站无 POST,返回 404 */
export const ALL: APIRoute = () => new Response(null, { status: 404 })
