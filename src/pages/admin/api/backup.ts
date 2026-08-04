/**
 * GET /admin/api/backup/state — 备份配置 + 列表
 * POST /admin/api/backup/run — 立即备份或内容导出 { action: 'backup' | 'export' }
 * PUT /admin/api/backup/config — 设置定时/冗余
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import {
  getBackupConfig,
  setBackupConfig,
  createBackup,
  exportContent,
  listBackups,
  listExports,
} from '../../../lib/admin/backup'

export const prerender = !isServer

export const GET: APIRoute = () => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  return new Response(
    JSON.stringify({ config: getBackupConfig(), backups: listBackups(), exports: listExports() }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

export const POST: APIRoute = async ({ request }) => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const body = (await request.json().catch(() => null)) as { action?: 'backup' | 'export' } | null
  try {
    if (body?.action === 'export') {
      const entry = await exportContent()
      return new Response(JSON.stringify({ ok: true, entry }))
    }
    const entry = await createBackup()
    return new Response(JSON.stringify({ ok: true, entry }))
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 })
  }
}

export const PUT: APIRoute = async ({ request }) => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const body = (await request.json().catch(() => null)) as {
    intervalHours?: number
    keep?: number
    enabled?: boolean
  } | null
  if (!body) return new Response(JSON.stringify({ error: '请求体无效' }), { status: 400 })
  const cfg = getBackupConfig()
  const next = {
    intervalHours: Number(body.intervalHours ?? cfg.intervalHours),
    keep: Number(body.keep ?? cfg.keep),
    enabled: body.enabled ?? cfg.enabled,
  }
  if (next.intervalHours < 1 || next.intervalHours > 720) {
    return new Response(JSON.stringify({ error: '备份间隔需在 1-720 小时之间' }), { status: 400 })
  }
  if (next.keep < 1 || next.keep > 100) {
    return new Response(JSON.stringify({ error: '保留份数需在 1-100 之间' }), { status: 400 })
  }
  setBackupConfig(next)
  return new Response(JSON.stringify({ ok: true, config: next }))
}
