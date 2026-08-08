/**
 * POST /admin/api/assets — 资产上传(multipart/form-data)
 * fields: kind(wallpaper|font), themeId(可选), file
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import { saveUpload } from '../../../lib/admin/assets'

export const prerender = !isServer

export const POST: APIRoute = async ({ request }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  try {
    const form = await request.formData()
    const kind = String(form.get('kind') ?? 'misc')
    const themeId = form.get('themeId') ? String(form.get('themeId')) : null
    const fileEntry = form.get('file')
    if (!(fileEntry instanceof File)) {
      return new Response(JSON.stringify({ error: '缺少文件' }), {
        status: 400,
      })
    }
    const asset = saveUpload(kind, themeId, {
      name: fileEntry.name,
      type: fileEntry.type,
      data: new Uint8Array(await fileEntry.arrayBuffer()),
    })
    return new Response(JSON.stringify({ ok: true, asset }))
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
    })
  }
}

/** 静态构建占位:静态站无 POST,返回 404 */
export const GET: APIRoute = () => new Response(null, { status: 404 })
