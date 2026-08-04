/**
 * GET /admin/api/friends — 展示友链 + 申请列表
 * POST /admin/api/friends — 新增展示友链(站长手动添加)
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import { listFriends, saveFriend, listRequests, type FriendData } from '../../../lib/admin/friends-store'

export const prerender = !isServer

export const GET: APIRoute = () => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  return new Response(
    JSON.stringify({ friends: listFriends(), requests: listRequests() }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

export const POST: APIRoute = async ({ request }) => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const body = (await request.json().catch(() => null)) as Partial<FriendData> | null
  if (!body?.name?.trim() || !body?.url?.trim()) {
    return new Response(JSON.stringify({ error: '名称和链接必填' }), { status: 400 })
  }
  if (!/^https?:\/\/.+/.test(body.url.trim())) {
    return new Response(JSON.stringify({ error: '链接需以 http(s):// 开头' }), { status: 400 })
  }
  const id = body.id ?? body.name.trim().toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-')
  const friend = saveFriend(id, {
    name: body.name.trim(),
    url: body.url.trim(),
    avatar: body.avatar?.trim() || undefined,
    description: body.description?.trim() || undefined,
    group: body.group?.trim() || '其他',
  })
  return new Response(JSON.stringify({ ok: true, friend }))
}
