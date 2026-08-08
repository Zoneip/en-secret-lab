/**
 * POST /admin/api/docs-upload — 批量上传文件/文件夹到文档库
 * Content-Type: multipart/form-data
 * 字段: 多个 files（文件夹上传时 file.name 应为相对路径）
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import { uploadDocs } from '../../../lib/admin/docs-store'

export const prerender = !isServer

export const POST: APIRoute = async ({ request }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })

  try {
    const form = await request.formData()
    const entries: { relativePath: string; data: Uint8Array }[] = []

    for (const entry of form.getAll('files')) {
      if (!(entry instanceof File)) continue
      const relativePath = entry.name
      const data = new Uint8Array(await entry.arrayBuffer())
      entries.push({ relativePath, data })
    }

    if (entries.length === 0) {
      return new Response(JSON.stringify({ error: '没有可上传的文件' }), {
        status: 400,
      })
    }

    const { created, skipped } = uploadDocs(entries)

    return new Response(JSON.stringify({ ok: true, created, skipped }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
    })
  }
}
