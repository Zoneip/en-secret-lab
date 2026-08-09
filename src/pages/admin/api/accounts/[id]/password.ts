/**
 * PUT /admin/api/accounts/[id]/password — 重置账号密码
 * body: { password }
 * 站主修改自己的密码 / 管理员重置访客密码均走此接口
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../../../lib/utils'
import { resetPassword } from '../../../../../lib/admin/auth'
import { userGetById } from '../../../../../lib/admin/db'

export const prerender = !isServer

export function getStaticPaths() {
  return []
}

export const PUT: APIRoute = async ({ request, params }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const target = userGetById(params.id ?? '')
  if (!target) {
    return new Response(JSON.stringify({ error: '账号不存在' }), {
      status: 404,
    })
  }
  const body = (await request.json().catch(() => null)) as {
    password?: string
  } | null
  const password = body?.password ?? ''
  if (password.length < 8) {
    return new Response(JSON.stringify({ error: '密码至少 8 位' }), {
      status: 400,
    })
  }
  if (!resetPassword(target.id, password)) {
    return new Response(JSON.stringify({ error: '密码更新失败' }), {
      status: 500,
    })
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

/** 静态构建占位 */
export const ALL: APIRoute = () => new Response(null, { status: 404 })
