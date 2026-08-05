/**
 * /admin/api/friends/[id] — 申请审核 / 友链删除
 * PUT  body: { action: 'approve' | 'reject' | 'update', friend?: {...} }
 * DELETE 删除展示友链(或待审申请)
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../../lib/utils'
import {
  getRequest,
  setRequestStatus,
  deleteRequest,
  saveFriend,
  deleteFriend,
  type FriendData,
} from '../../../../lib/admin/friends-store'

export const prerender = !isServer

export function getStaticPaths() {
  return []
}

export const PUT: APIRoute = async ({ params, request }) => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const id = params.id ?? ''
  const body = (await request.json().catch(() => null)) as {
    action?: 'approve' | 'reject' | 'update'
    friend?: Partial<FriendData>
  } | null
  if (!body?.action) return new Response(JSON.stringify({ error: '缺少操作类型' }), { status: 400 })

  if (body.action === 'approve' || body.action === 'reject') {
    const req = getRequest(id)
    if (!req || req.status !== 'pending') {
      return new Response(JSON.stringify({ error: '申请不存在或已处理' }), { status: 404 })
    }
    if (body.action === 'approve') {
      // 通过:写入展示友链(用申请 UUID 作 id,保证唯一合法)
      saveFriend(req.id, {
        name: req.name,
        url: req.url,
        avatar: req.avatar,
        description: req.description,
      })
    }
    setRequestStatus(id, body.action === 'approve' ? 'approved' : 'rejected')
    return new Response(JSON.stringify({ ok: true }))
  }

  if (body.action === 'update') {
    if (!body.friend?.name?.trim() || !body.friend?.url?.trim()) {
      return new Response(JSON.stringify({ error: '名称和链接必填' }), { status: 400 })
    }
    saveFriend(id, {
      name: body.friend.name.trim(),
      url: body.friend.url.trim(),
      avatar: body.friend.avatar?.trim() || undefined,
      description: body.friend.description?.trim() || undefined,
    })
    return new Response(JSON.stringify({ ok: true }))
  }

  return new Response(JSON.stringify({ error: '未知操作' }), { status: 400 })
}

export const DELETE: APIRoute = ({ params }) => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const id = params.id ?? ''
  // 先试展示友链,再试申请
  const ok = deleteFriend(id)
  if (ok) return new Response(JSON.stringify({ ok: true }))
  const req = getRequest(id)
  if (req) {
    deleteRequest(id)
    return new Response(JSON.stringify({ ok: true }))
  }
  return new Response(JSON.stringify({ error: '未找到' }), { status: 404 })
}
