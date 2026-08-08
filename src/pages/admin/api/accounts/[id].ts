/**
 * PUT /admin/api/accounts/[id] — 更新账号资料/状态
 * body: { username?, display_name?, email?, status? }
 * 站主账号不可封禁(role 与 status 受保护)
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../../lib/utils'
import { toPublicUser } from '../../../../lib/admin/auth'
import {
  userGetById,
  userGetByUsername,
  userUpdate,
} from '../../../../lib/admin/db'

export const prerender = !isServer

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,32}$/
const STATUSES = ['active', 'banned'] as const

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
    username?: string
    display_name?: string
    email?: string
    status?: string
  } | null
  if (!body) {
    return new Response(JSON.stringify({ error: '请求体无效' }), {
      status: 400,
    })
  }

  const fields: {
    username?: string
    display_name?: string | null
    email?: string | null
    status?: 'active' | 'banned'
  } = {}

  if (body.username !== undefined) {
    const username = body.username.trim()
    if (!USERNAME_RE.test(username)) {
      return new Response(
        JSON.stringify({ error: '用户名需为 3-32 位字母/数字/下划线/短横线' }),
        { status: 400 },
      )
    }
    const dup = userGetByUsername(username)
    if (dup && dup.id !== target.id) {
      return new Response(JSON.stringify({ error: '用户名已存在' }), {
        status: 400,
      })
    }
    fields.username = username
  }
  if (body.display_name !== undefined) {
    fields.display_name = body.display_name.trim() || null
  }
  if (body.email !== undefined) {
    fields.email = body.email.trim() || null
  }
  if (body.status !== undefined) {
    if (target.role === 'owner') {
      return new Response(JSON.stringify({ error: '站主账号不可封禁' }), {
        status: 400,
      })
    }
    if (!STATUSES.includes(body.status as (typeof STATUSES)[number])) {
      return new Response(JSON.stringify({ error: '无效的账号状态' }), {
        status: 400,
      })
    }
    fields.status = body.status as 'active' | 'banned'
  }

  userUpdate(target.id, fields)
  return new Response(
    JSON.stringify({
      ok: true,
      account: toPublicUser(userGetById(target.id)!),
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}

/** 静态构建占位 */
export const ALL: APIRoute = () => new Response(null, { status: 404 })
