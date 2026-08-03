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
        friends: friends.length,
        themes: themes.length,
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
      assets: authed ? listAssets() : [],
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
