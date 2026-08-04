/** DELETE /admin/api/assets/[id] — 删除资产(DB + 磁盘文件) */
import type { APIRoute } from 'astro'
import { isServer } from '../../../../lib/utils'
import { deleteAsset } from '../../../../lib/admin/assets'

export const prerender = !isServer

export function getStaticPaths() {
  return []
}

export const DELETE: APIRoute = ({ params }) => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const ok = deleteAsset(params.id ?? '')
  if (!ok) return new Response(JSON.stringify({ error: '资产不存在' }), { status: 404 })
  return new Response(JSON.stringify({ ok: true }))
}
