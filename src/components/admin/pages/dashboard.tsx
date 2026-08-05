'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  Archive,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  ImageIcon,
  PenSquare,
  Settings,
  Tags,
  Upload,
  ArrowRight,
  FilePlus2,
  Eye,
  Palette,
} from 'lucide-react'
import { api, fmtDate, timeAgo } from '../lib/api'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

interface SiteState {
  site: {
    title: string
    defaultTheme: string
    themeByMode: { light: string; dark: string }
  }
  stats: {
    posts: number
    published: number
    drafts: number
    tags: number
    categories: number
    assets: number
  }
  system: {
    mode: string
    node: string
    uploads: number
    uploadBytes: number
  }
  activity: Array<{
    kind: 'publish' | 'draft' | 'upload'
    title: string
    time: number
    meta?: string
  }>
  presets: Array<{
    id: string
    name: string
    palette: { light: Record<string, string> }
  }>
}

interface PostLite {
  slug: string
  title: string
  category: string
  pubDate: string
  draft: boolean
}

const STAT_CARDS = [
  { key: 'posts', label: '全部文章', icon: BookOpen, color: '#5c677d' },
  { key: 'published', label: '已发布', icon: CheckCircle2, color: '#3fae6a' },
  { key: 'drafts', label: '草稿', icon: Clock3, color: '#d9a514' },
  { key: 'tags', label: '标签', icon: Tags, color: '#8b5cf6' },
  { key: 'categories', label: '分类', icon: FolderOpen, color: '#e59b2e' },
  { key: 'assets', label: '资产', icon: ImageIcon, color: '#4a90d9' },
] as const

const ACTIVITY_META = {
  publish: { label: '发布', dot: 'bg-emerald-500', icon: CheckCircle2 },
  draft: { label: '草稿', dot: 'bg-amber-500', icon: Clock3 },
  upload: { label: '上传', dot: 'bg-blue-500', icon: Upload },
} as const

function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

function StatCard({ stat, value, index }: { stat: (typeof STAT_CARDS)[number]; value: number; index: number }) {
  const num = useCountUp(value)
  const Icon = stat.icon
  return (
    <Card className="flex min-h-[76px] items-center animate-in fade-in slide-in-from-bottom-2 duration-300 transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex w-full items-center gap-3 px-5">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ background: `linear-gradient(135deg, ${stat.color}, color-mix(in srgb, ${stat.color} 60%, #fff))` }}
        >
          <Icon className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col">
          <p className="text-xl font-bold tabular-nums leading-none">{num}</p>
          <p className="mt-1.5 truncate text-xs text-muted-foreground">{stat.label}</p>
        </div>
      </div>
    </Card>
  )
}

function Mascot({ colors }: { colors: Record<string, string> }) {
  const px = 3
  const cells = [
    '..111......111..',
    '..1111....1111..',
    '..1221....1221..',
    '...111....111...',
    '....1111111111..',
    '..111111111111..',
    '..1ffffffffffff1',
    '..1ff55....55ff1',
    '..1ff55....55ff1',
    '..1f.22....22.f1',
    '..1wwwwwwwwwwww1',
    '..1www..55..www1',
    '..1wwwwwwwwwwww1',
    '...1ffffffffffff',
    '....ffffffffff...',
  ]
  const map: Record<string, string> = {
    '1': colors.primary,
    '2': colors.accent,
    f: '#F5EFE6',
    '5': '#332F36',
    w: '#FFFFFF',
  }
  return (
    <svg
      width={cells[0].length * px}
      height={cells.length * px}
      viewBox={`0 0 ${cells[0].length * px} ${cells.length * px}`}
      shapeRendering="crispEdges"
      className="animate-in fade-in duration-500"
      style={{ animation: 'mascot-bob 3.6s ease-in-out infinite' }}
      aria-hidden="true"
    >
      {cells.flatMap((row, y) =>
        [...row].map((ch, x) => {
          const fill = map[ch]
          return fill ? <rect key={`${x}-${y}`} x={x * px} y={y * px} width={px} height={px} fill={fill} /> : null
        })
      )}
      <style>{`@keyframes mascot-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }`}</style>
    </svg>
  )
}

export default function Dashboard() {
  const [state, setState] = useState<SiteState | null>(null)
  const [posts, setPosts] = useState<PostLite[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([api<SiteState>('/admin/api/state'), api<{ posts: PostLite[] }>('/admin/api/posts')])
      .then(([s, p]) => {
        setState(s)
        setPosts(p.posts)
      })
      .catch(() => setError(true))
  }, [])

  if (error) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-muted-foreground">数据加载失败,请刷新重试</p>
      </Card>
    )
  }

  const hour = new Date().getHours()
  const greet = hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'
  const pubRatio = state?.stats.posts ? Math.round((state.stats.published / state.stats.posts) * 100) : 0
  const defaultPreset = state?.presets.find((p) => p.id === state.site.themeByMode.light)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      {/* 欢迎区 */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {state ? greet : '—'}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              {state?.site.title ?? '加载中…'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
            <div className="mt-5 flex gap-2.5">
              <Button asChild>
                <a href="/admin/posts/new">
                  <FilePlus2 />
                  写新文章
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin/themes">
                  <Palette />
                  调主题
                </a>
              </Button>
            </div>
          </div>
          {defaultPreset && (
            <div className="hidden rounded-2xl border bg-background/70 p-3 shadow-sm sm:block">
              <Mascot colors={defaultPreset.palette.light} />
            </div>
          )}
        </div>
      </section>

      {/* 统计 */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_CARDS.map((stat, i) => (
          <StatCard key={stat.key} stat={stat} value={state?.stats[stat.key] ?? 0} index={i} />
        ))}
      </section>
      {state && state.stats.posts > 0 && (
        <p className="-mt-2 px-1 text-xs text-muted-foreground">
          已发布占比 {pubRatio}%
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        {/* 文章概览 */}
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between border-b px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="size-4 text-primary" />
              文章概览
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <a href="/admin/posts">
                全部 <ArrowRight className="size-3.5" />
              </a>
            </Button>
          </div>
          <div className="p-2">
            {!state ? (
              <>
                <Skeleton className="mx-2 my-2 h-11" />
                <Skeleton className="mx-2 my-2 h-11" />
                <Skeleton className="mx-2 my-2 h-11" />
              </>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <PenSquare className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">还没有文章,写一篇吧</p>
                <Button asChild size="sm">
                  <a href="/admin/posts/new">写新文章</a>
                </Button>
              </div>
            ) : (
              <ul>
                {posts.slice(0, 6).map((p, i) => (
                  <li key={p.slug}>
                    <a
                      href={`/admin/posts/${p.slug}`}
                      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/50 animate-in fade-in slide-in-from-left-1 duration-200"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                        {p.title.slice(0, 1)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{p.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {p.category} · {fmtDate(p.pubDate)}
                        </span>
                      </span>
                      <Badge variant={p.draft ? 'warning' : 'success'}>{p.draft ? '草稿' : '已发布'}</Badge>
                      <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* 主题速览 */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Palette className="size-4 text-primary" />
              主题色板
            </h3>
            <div className="flex items-center gap-3">
              {/* 圆点图例 */}
              <span className="hidden items-center gap-2 text-[10px] text-muted-foreground sm:flex">
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-amber-300 dark:bg-amber-200/80" />
                  浅色默认
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-violet-400/80 dark:bg-violet-300/70" />
                  深色默认
                </span>
              </span>
              <Button variant="ghost" size="sm" asChild>
                <a href="/admin/themes">编辑</a>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 p-4">
            {!state
              ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)
              : (() => {
                  const filtered = state.presets.filter((t) => t.id !== 'friends')
                  const lightDef = state.site.themeByMode.light
                  const darkDef = state.site.themeByMode.dark
                  const items = [
                    ...filtered.map((t, i) => ({
                      key: t.id,
                      name: t.name,
                      palette: t.palette,
                      href: '/admin/themes',
                      isLightDefault: t.id === lightDef,
                      isDarkDefault: t.id === darkDef,
                      animDelay: i * 50,
                    })),
                    {
                      key: 'random',
                      name: '随机',
                      href: '/admin/settings?tab=site',
                      isLightDefault: lightDef === 'random',
                      isDarkDefault: darkDef === 'random',
                      animDelay: filtered.length * 50,
                      isRandom: true,
                    },
                  ]
                  return items.map(
                    (item: {
                      key: string
                      name: string
                      palette?: { light: Record<string, string> }
                      href: string
                      isLightDefault: boolean
                      isDarkDefault: boolean
                      animDelay: number
                      isRandom?: boolean
                    }) => (
                    <a
                      key={item.key}
                      href={item.href}
                      className="group relative flex items-center gap-2.5 rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm animate-in fade-in zoom-in-95 duration-200"
                      style={{ animationDelay: `${item.animDelay}ms` }}
                      title={
                        item.isLightDefault && item.isDarkDefault
                          ? `${item.name} · 浅色/深色模式默认`
                          : item.isLightDefault
                            ? `${item.name} · 浅色模式默认`
                            : item.isDarkDefault
                              ? `${item.name} · 深色模式默认`
                              : item.name
                      }
                    >
                      {item.isRandom ? (
                        <span className="flex size-5 items-center justify-center rounded-md border border-black/5 bg-muted text-xs">
                          <Palette className="size-3" />
                        </span>
                      ) : (
                        <span className="flex -space-x-1.5">
                          {(['bg', 'surface', 'primary', 'accent'] as const).map((k, j) => (
                            <span
                              key={k}
                              className="size-4 rounded-md border border-black/5"
                              style={{ background: item.palette?.light[k] ?? '#ccc', zIndex: 4 - j }}
                            />
                          ))}
                        </span>
                      )}
                      <span className="text-sm font-medium">{item.name}</span>
                      {/* 底部双圆点指示器:左=浅色默认(淡黄),右=深色默认(淡紫) */}
                      <span className="absolute bottom-1.5 right-2 flex items-center gap-1">
                        <span
                          className={`size-1.5 rounded-full ring-1 ring-inset transition-all ${
                            item.isLightDefault
                              ? 'bg-amber-300/90 ring-amber-300/40 shadow-[0_0_3px_rgba(252,211,77,0.4)] dark:bg-amber-200/80 dark:ring-amber-200/30'
                              : 'bg-transparent ring-muted-foreground/25'
                          }`}
                          aria-label={item.isLightDefault ? '浅色模式默认' : '非浅色模式默认'}
                        />
                        <span
                          className={`size-1.5 rounded-full ring-1 ring-inset transition-all ${
                            item.isDarkDefault
                              ? 'bg-violet-400/80 ring-violet-400/40 shadow-[0_0_3px_rgba(167,139,250,0.4)] dark:bg-violet-300/70 dark:ring-violet-300/30'
                              : 'bg-transparent ring-muted-foreground/25'
                          }`}
                          aria-label={item.isDarkDefault ? '深色模式默认' : '非深色模式默认'}
                        />
                      </span>
                    </a>
                  ))
                })()}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* 最近动态 */}
        <Card className="lg:col-span-3">
          <div className="flex items-center gap-2 border-b px-5 py-3.5">
            <Activity className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">最近动态</h3>
          </div>
          <div className="p-4">
            {!state ? (
              <>
                <Skeleton className="my-2 h-9" />
                <Skeleton className="my-2 h-9" />
                <Skeleton className="my-2 h-9" />
              </>
            ) : state.activity.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">还没有动态</p>
            ) : (
              <ol className="relative space-y-4 before:absolute before:left-[3.5px] before:top-1 before:bottom-1 before:w-px before:bg-border">
                {state.activity.map((a, i) => {
                  const meta = ACTIVITY_META[a.kind]
                  return (
                    <li key={`${a.kind}-${a.title}-${i}`} className="relative flex gap-3 pl-5 animate-in fade-in slide-in-from-bottom-1 duration-300" style={{ animationDelay: `${i * 60}ms` }}>
                      <span className={`absolute left-0 top-1.5 size-2 rounded-full ${meta.dot} ring-4 ring-background`} aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {meta.label}
                          {a.meta ? ` · ${a.meta}` : ''} · {timeAgo(a.time)}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </Card>

        {/* 系统状态 */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 border-b px-5 py-3.5">
            <Settings className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">系统状态</h3>
          </div>
          <div className="flex flex-col gap-4 p-5">
            <div className="flex items-center gap-3">
              <span className="size-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15" aria-hidden="true" />
              <div>
                <p className="text-xs text-muted-foreground">运行模式</p>
                <p className="text-sm font-medium">{state?.system.mode ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Activity className="size-4" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">Node 版本</p>
                <p className="text-sm font-medium">{state?.system.node ?? '—'}</p>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Upload className="size-4" />
                </span>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">上传占用</p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(2, ((state?.system.uploadBytes ?? 0) / 1024 / 1024) * 4))}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {state?.system.uploads ?? 0} 个文件 · {((state?.system.uploadBytes ?? 0) / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-1 flex gap-2 border-t pt-4">
              {[
                { href: '/admin/posts/new', title: '写文章', icon: FilePlus2 },
                { href: '/admin/themes', title: '主题', icon: Palette },
                { href: '/admin/settings', title: '设置', icon: Settings },
                { href: '/admin/backup', title: '备份', icon: Archive },
                { href: '/admin/assets', title: '资产', icon: ImageIcon },
                { href: '/', title: '前台', icon: Eye },
              ].map((qa) => (
                <a
                  key={qa.title}
                  href={qa.href}
                  title={qa.title}
                  className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-white"
                >
                  <qa.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
