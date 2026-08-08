/**
 * GET /admin/api/state — 登录态 + 当前配置 + 主题预设 + 资产列表
 */
import type { APIRoute } from 'astro'
import { isServer } from '../../../lib/utils'
import { SESSION_COOKIE, isAuthed } from '../../../lib/admin/auth'
import { listAssets } from '../../../lib/admin/assets'
import { listPosts } from '../../../lib/admin/posts-store'
import { autoBackupIfDue } from '../../../lib/admin/backup'
import { themes } from '../../../lib/theme/presets'
import { getSiteConfig } from '../../../lib/config'
import { getCollection, type CollectionEntry } from 'astro:content'

export const prerender = !isServer

export const GET: APIRoute = async ({ cookies }) => {
  if (!isServer)
    return new Response(JSON.stringify({ error: '不可用' }), { status: 404 })
  const authed = isAuthed(cookies.get(SESSION_COOKIE)?.value)
  if (authed) autoBackupIfDue()
  const siteConfig = getSiteConfig()
  const [posts, friends]: [
    CollectionEntry<'posts'>[],
    CollectionEntry<'friends'>[],
  ] = await Promise.all([
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
  const fsPosts = listPosts()

  // 最近动态:文章(发布/草稿)+ 资产上传,按时间合并
  const activity: Array<{
    kind: 'publish' | 'draft' | 'upload'
    title: string
    time: number
    meta?: string
  }> = []
  for (const p of fsPosts) {
    activity.push({
      kind: p.draft.draft ? 'draft' : 'publish',
      title: p.draft.title,
      time: +new Date(p.draft.pubDate),
      meta: p.draft.category,
    })
  }
  for (const a of assets) {
    activity.push({
      kind: 'upload',
      title: a.fileName,
      time: a.created_at,
      meta: a.kind,
    })
  }
  activity.sort((a, b) => b.time - a.time)

  return new Response(
    JSON.stringify({
      authed,
      site: {
        title: siteConfig.title,
        description: siteConfig.description,
        author: siteConfig.author,
        defaultTheme: siteConfig.defaultTheme,
        themeByMode: siteConfig.themeByMode,
        features: siteConfig.features,
        wallpaperEnabled: siteConfig.wallpaperEnabled,
        nav: siteConfig.nav,
        fonts: siteConfig.fonts,
        icp: siteConfig.icp,
        police: siteConfig.police,
        homepage: siteConfig.homepage,
        themeOverrides: siteConfig.themeOverrides,
        mascots: siteConfig.mascots,
        favicon: siteConfig.favicon,
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
      activity: activity.slice(0, 8),
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
    { headers: { 'Content-Type': 'application/json' } },
  )
}
