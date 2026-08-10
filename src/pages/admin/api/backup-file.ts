/**
 * GET /admin/api/backup/file?kind=backup|export&name=xxx.tar.gz — 下载备份/导出
 */
import type { APIRoute } from 'astro'
import { createReadStream, unlinkSync } from 'node:fs'
import { isServer } from '../../../lib/utils'
import { backupFile } from '../../../lib/admin/backup'

export const prerender = !isServer

export const DELETE: APIRoute = ({ url }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const kind = url.searchParams.get('kind')
  const name = url.searchParams.get('name')
  if ((kind !== 'backup' && kind !== 'export') || !name) {
    return new Response(JSON.stringify({ error: '参数无效' }), { status: 400 })
  }
  const file = backupFile(kind, name)
  if (!file)
    return new Response(JSON.stringify({ error: '文件不存在' }), {
      status: 404,
    })
  try {
    unlinkSync(file)
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
    })
  }
  return new Response(JSON.stringify({ ok: true }))
}

export const GET: APIRoute = ({ url }) => {
  if (!isServer) return new Response('Not Found', { status: 404 })
  const kind = url.searchParams.get('kind')
  const name = url.searchParams.get('name')
  if ((kind !== 'backup' && kind !== 'export') || !name) {
    return new Response('参数无效', { status: 400 })
  }
  const file = backupFile(kind, name)
  if (!file) return new Response('文件不存在', { status: 404 })
  // 净化文件名,防止响应头注入(只保留安全字符)
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const stream = createReadStream(file)
  return new Response(stream as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/gzip',
      'Content-Disposition': `attachment; filename="${safeName}"`,
      'Cache-Control': 'no-store',
    },
  })
}
