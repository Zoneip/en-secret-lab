/**
 * POST /admin/api/render-markdown — 将 Markdown 渲染为 HTML 预览
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import { renderBody } from '../../../lib/content/render'

export const prerender = !isServer

export const POST: APIRoute = async ({ request }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })

  const body = (await request.json().catch(() => null)) as {
    markdown?: string
  } | null
  if (!body?.markdown)
    return new Response(JSON.stringify({ error: '缺少 markdown 内容' }), {
      status: 400,
    })

  try {
    const { html, headings } = renderBody(body.markdown)
    const wordCount = body.markdown
      .replace(/[#*`>-]/g, '')
      .trim()
      .split(/\s+/).length
    const readingTime = Math.max(1, Math.round(wordCount / 200))

    return new Response(
      JSON.stringify({
        html,
        headings,
        wordCount,
        readingTime,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
    })
  }
}
