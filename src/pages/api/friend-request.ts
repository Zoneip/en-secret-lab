/**
 * POST /api/friend-request — 访客提交友链申请(动态版)
 * 校验 + 防滥用(同 IP 每日 3 条)
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../lib/utils'
import {
  createRequest,
  countRequestsToday,
} from '../../lib/admin/friends-store'

export const prerender = !isServer

/** 静态构建占位 */
export const GET: APIRoute = () => new Response(null, { status: 404 })

export const POST: APIRoute = async ({ request }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const body = (await request.json().catch(() => null)) as {
    name?: string
    url?: string
    avatar?: string
    description?: string
    email?: string
  } | null
  if (!body)
    return new Response(JSON.stringify({ error: '请求体无效' }), {
      status: 400,
    })

  const name = body.name?.trim() ?? ''
  const url = body.url?.trim() ?? ''
  const email = body.email?.trim() ?? ''
  if (!name || !url)
    return new Response(JSON.stringify({ error: '站点名称和链接必填' }), {
      status: 400,
    })
  if (!/^https?:\/\/.+/.test(url))
    return new Response(JSON.stringify({ error: '链接需以 http(s):// 开头' }), {
      status: 400,
    })
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: '邮箱格式不正确' }), {
      status: 400,
    })
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  if (countRequestsToday(ip) >= 3) {
    return new Response(
      JSON.stringify({ error: '今天提交的申请太多了,明天再来吧' }),
      { status: 429 },
    )
  }

  const req = createRequest(
    {
      name,
      url,
      avatar: body.avatar?.trim() || undefined,
      description: body.description?.trim() || undefined,
      email: email || undefined,
    },
    ip,
  )
  return new Response(JSON.stringify({ ok: true, id: req.id }))
}
