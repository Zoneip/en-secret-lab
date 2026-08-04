/**
 * PUT /admin/api/password — 修改管理员密码
 * body: { password }
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import { changePassword } from '../../../lib/admin/auth'

export const prerender = !isServer

export const PUT: APIRoute = async ({ request }) => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const body = (await request.json().catch(() => null)) as { password?: string } | null
  const password = body?.password ?? ''
  if (password.length < 6) {
    return new Response(JSON.stringify({ error: '密码至少 6 位' }), { status: 400 })
  }
  const ok = changePassword(password)
  if (!ok) return new Response(JSON.stringify({ error: '密码更新失败' }), { status: 500 })
  return new Response(JSON.stringify({ ok: true }))
}

/** 静态构建占位:静态站无 POST,返回 404 */
export const GET: APIRoute = () => new Response(null, { status: 404 })

