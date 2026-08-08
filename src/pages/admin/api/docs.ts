/**
 * /admin/api/docs — 文档库文件树 CRUD
 * GET  ?action=tree | read&path=
 * POST { action: write|create, ... }
 * PUT  { action: rename|move, ... }
 * DELETE ?path=
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import {
  listDocs,
  readDoc,
  writeDoc,
  createDoc,
  renameDoc,
  moveDoc,
  deleteDoc,
  deleteDocs,
} from '../../../lib/admin/docs-store'

export const prerender = !isServer

export const GET: APIRoute = ({ url }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const action = url.searchParams.get('action')
  try {
    if (action === 'read') {
      const path = url.searchParams.get('path') ?? ''
      return new Response(JSON.stringify({ ok: true, ...readDoc(path) }))
    }
    return new Response(JSON.stringify({ ok: true, tree: listDocs() }))
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
    })
  }
}

export const POST: APIRoute = async ({ request }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const body = (await request.json().catch(() => null)) as {
    action?: string
    path?: string
    content?: string
    parent?: string
    name?: string
    type?: 'file' | 'dir'
    paths?: string[]
  } | null
  if (!body?.action)
    return new Response(JSON.stringify({ error: '参数无效' }), { status: 400 })
  try {
    if (body.action === 'write') {
      if (!body.path) throw new Error('路径无效')
      writeDoc(body.path, body.content ?? '')
      return new Response(JSON.stringify({ ok: true }))
    }
    if (body.action === 'create') {
      if (!body.name) throw new Error('名称无效')
      createDoc(body.parent ?? '', body.name, body.type ?? 'file')
      return new Response(JSON.stringify({ ok: true }))
    }
    if (body.action === 'delete-batch') {
      const paths = body.paths
      if (!Array.isArray(paths) || paths.length === 0)
        throw new Error('未选择要删除的项目')
      const result = deleteDocs(paths)
      return new Response(JSON.stringify({ ok: true, ...result }))
    }
    return new Response(JSON.stringify({ error: '未知操作' }), { status: 400 })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
    })
  }
}

export const PUT: APIRoute = async ({ request }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const body = (await request.json().catch(() => null)) as {
    action?: string
    path?: string
    name?: string
    toDir?: string
  } | null
  if (!body?.action || !body.path)
    return new Response(JSON.stringify({ error: '参数无效' }), { status: 400 })
  try {
    if (body.action === 'rename') {
      renameDoc(body.path, body.name ?? '')
      return new Response(JSON.stringify({ ok: true }))
    }
    if (body.action === 'move') {
      moveDoc(body.path, body.toDir ?? '')
      return new Response(JSON.stringify({ ok: true }))
    }
    return new Response(JSON.stringify({ error: '未知操作' }), { status: 400 })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
    })
  }
}

export const DELETE: APIRoute = ({ url }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const path = url.searchParams.get('path') ?? ''
  try {
    deleteDoc(path)
    return new Response(JSON.stringify({ ok: true }))
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
    })
  }
}
