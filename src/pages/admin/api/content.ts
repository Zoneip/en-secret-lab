/**
 * GET /admin/api/content — 栏目/角色/关于 数据
 * PUT /admin/api/content — 部分更新(columns/ocs/about)
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import {
  listColumns,
  saveColumn,
  listOcs,
  saveOc,
  getAbout,
  saveAbout,
  type ColumnData,
  type OcData,
  type AboutData,
} from '../../../lib/admin/content-store'

export const prerender = !isServer

const THEMES = ['gray', 'yellow', 'purple', 'white']

function validTheme(v: unknown): v is 'gray' | 'yellow' | 'purple' | 'white' {
  return typeof v === 'string' && THEMES.includes(v)
}

export const GET: APIRoute = () => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  return new Response(
    JSON.stringify({
      columns: listColumns(),
      ocs: listOcs(),
      about: getAbout(),
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}

export const PUT: APIRoute = async ({ request }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const body = (await request.json().catch(() => null)) as {
    columns?: Record<string, Partial<ColumnData>>
    ocs?: Record<string, Partial<OcData>>
    about?: AboutData
  } | null
  if (!body)
    return new Response(JSON.stringify({ error: '请求体无效' }), {
      status: 400,
    })

  try {
    if (body.columns) {
      for (const [id, data] of Object.entries(body.columns)) {
        if (
          !validTheme(data.theme) ||
          !data.title?.trim() ||
          !data.category?.trim()
        ) {
          throw new Error(`栏目「${id}」缺少必填字段或主题无效`)
        }
        saveColumn(id, {
          title: data.title.trim(),
          subtitle: (data.subtitle ?? '').trim(),
          description: (data.description ?? '').trim(),
          theme: data.theme,
          category: data.category.trim(),
        })
      }
    }
    if (body.ocs) {
      for (const [id, data] of Object.entries(body.ocs)) {
        if (!validTheme(data.theme) || !data.name?.trim()) {
          throw new Error(`角色「${id}」缺少必填字段或主题无效`)
        }
        const effect = data.quoteEffect ?? 'typing'
        const speed = data.quoteSpeed ?? 'normal'
        if (!['none', 'typing', 'fade', 'float'].includes(effect))
          throw new Error(`角色「${id}」动效类型无效`)
        if (!['slow', 'normal', 'fast'].includes(speed))
          throw new Error(`角色「${id}」动效速度无效`)
        saveOc(id, {
          name: data.name.trim(),
          theme: data.theme,
          subtitle: (data.subtitle ?? '').trim(),
          description: (data.description ?? '').trim(),
          traits: Array.isArray(data.traits)
            ? data.traits.map((t) => String(t).trim()).filter(Boolean)
            : [],
          quote: data.quote?.trim() || undefined,
          quoteEffect: effect,
          quoteSpeed: speed,
          art: data.art?.trim() || undefined,
        })
      }
    }
    if (body.about) {
      if (!body.about.nickname?.trim()) throw new Error('关于页缺少昵称')
      saveAbout({
        nickname: body.about.nickname.trim(),
        tagline: (body.about.tagline ?? '').trim(),
        avatar: body.about.avatar?.trim() || undefined,
        intro: Array.isArray(body.about.intro)
          ? body.about.intro.map((l) => String(l).trim()).filter(Boolean)
          : [],
        links: Array.isArray(body.about.links)
          ? body.about.links
              .filter((l) => l?.label && l?.url)
              .map((l) => ({
                label: String(l.label).trim(),
                url: String(l.url).trim(),
              }))
          : [],
      })
    }
    return new Response(JSON.stringify({ ok: true }))
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 422,
    })
  }
}
