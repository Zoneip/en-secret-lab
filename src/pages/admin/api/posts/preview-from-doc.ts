/**
 * GET /admin/api/posts/preview-from-doc — 把文档库文档解析为文章草稿预览
 * 查询参数: ?path=docs/relative/path.md
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../../lib/utils'
import { parseDocToDraft } from '../../../../lib/admin/posts-store'
import { readDoc } from '../../../../lib/admin/docs-store'

export const prerender = !isServer

export const GET: APIRoute = ({ url }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })

  const path = url.searchParams.get('path') ?? ''
  if (!path) {
    return new Response(JSON.stringify({ error: '缺少 path 参数' }), {
      status: 400,
    })
  }

  try {
    const { content } = readDoc(path)
    const draft = parseDocToDraft(path, content)
    return new Response(
      JSON.stringify({
        ok: true,
        draft: {
          slug: draft.slug,
          title: draft.title,
          category: draft.category,
          tags: Array.isArray(draft.tags) ? draft.tags.join(', ') : '',
          description: draft.description,
          pubDate: draft.pubDate,
          series: draft.series,
          draft: draft.draft,
          featured: draft.featured,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
    })
  }
}
