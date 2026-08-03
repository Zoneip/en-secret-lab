/**
 * PUT /admin/api/config — 保存站点配置(主题覆盖/站点设置)
 * body: 完整 SiteConfig 结构(缺省字段自动填默认)
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import { siteConfigSchema, invalidateSiteConfig } from '../../../lib/config'
import { saveSiteConfig } from '../../../lib/admin/config-store'

export const prerender = !isServer

export const PUT: APIRoute = async ({ request }) => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const body = await request.json().catch(() => null)
  if (!body) return new Response(JSON.stringify({ error: '请求体无效' }), { status: 400 })
  try {
    const config = siteConfigSchema.parse(body)
    saveSiteConfig(config)
    invalidateSiteConfig()
    return new Response(JSON.stringify({ ok: true }))
  } catch (e) {
    return new Response(
      JSON.stringify({ error: `配置校验失败:${(e as Error).message}` }),
      { status: 422 }
    )
  }
}

/** 静态构建占位:静态站无 POST,返回 404 */
export const GET: APIRoute = () => new Response(null, { status: 404 })

