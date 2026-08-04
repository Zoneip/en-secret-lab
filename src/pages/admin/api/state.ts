/**
 * GET /admin/api/state — 登录态 + 当前配置 + 主题预设 + 资产列表
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import { SESSION_COOKIE, isAuthed } from '../../../lib/admin/auth'
import { listAssets } from '../../../lib/admin/assets'
import { themes } from '../../../lib/theme/presets'
import { getSiteConfig } from '../../../lib/config'
import { getCollection } from 'astro:content'

export const prerender = !isServer

export const GET: APIRoute = async ({ cookies }) => {
  if (!isServer) return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const authed = isAuthed(cookies.get(SESSION_COOKIE)?.value)
  const siteConfig = getSiteConfig()
  const [posts, friends] = await Promise.all([
    getCollection('posts').catch(() => []),
    getCollection('friends').catch(() => []),
  ])
  const allTags = new Set<string>()
  const allCats = new Set<string>()
  for (const p of posts) {
    for (const t of p.data.tags) allTags.add(t)
    allCats.add(p.data.category)
  }
  const assets = listAssets()
  return new Response(
    JSON.stringify({
      authed,
      site: {
        title: siteConfig.title,
        description: siteConfig.description,
        author: siteConfig.author,
        defaultTheme: siteConfig.defaultTheme,
        features: siteConfig.features,
        wallpaperEnabled: siteConfig.wallpaperEnabled,
        nav: siteConfig.nav,
        fonts: siteConfig.fonts,
      },
      stats: {
        posts: posts.length,
        published: posts.filter((p) => !p.data.draft).length,
        drafts: posts.filter((p) => p.data.draft).length,
        tags: allTags.size,
        categories: allCats.size,
        friends: friends.length,
        themes: themes.length,
        assets: assets.length,
      },
      system: {
        mode: 'server',
        node: process.version,
        uploads: assets.length,
        uploadBytes: assets.reduce((n, a) => n + a.size, 0),
      },
      presets: themes.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        palette: t.palette,
        wallpaper: t.wallpaper,
        mascot: t.mascot,
        override: siteConfig.themeOverrides[t.id] ?? null,
      })),
      assets: authed ? assets : [],
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
