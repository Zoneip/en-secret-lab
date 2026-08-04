'use client'

import { useEffect, useMemo, useState } from 'react'
import { FolderOpen, ImagePlus, RotateCcw, Save } from 'lucide-react'
import { toast } from 'sonner'
import { ImageIcon, Settings2 } from 'lucide-react'
import { api } from '../lib/api'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Skeleton } from '../ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface Asset {
  id: string
  kind: string
  themeId: string | null
  fileName: string
  path: string
  size: number
}

interface Preset {
  id: string
  name: string
  description: string
  palette: { light: Record<string, string>; dark: Record<string, string> }
  wallpaper: { light: string; dark: string }
  override: {
    palette?: Record<string, string>
    wallpaper?: { light?: string; dark?: string }
    topbar?: { style?: string; accent?: boolean; ornament?: string; height?: number }
  } | null
  topbar?: { style?: string; accent?: boolean; ornament?: string; height?: number }
}

interface SiteConfig {
  themeOverrides: Record<string, unknown>
  features?: Record<string, unknown>
}

const SWATCH_ORDER: Array<{ key: string; label: string }> = [
  { key: 'bg', label: '页面背景' },
  { key: 'surface', label: '卡片' },
  { key: 'elevated', label: '悬浮层' },
  { key: 'fg', label: '主文本' },
  { key: 'fg-muted', label: '次级文本' },
  { key: 'fg-subtle', label: '弱文本' },
  { key: 'border', label: '描边' },
  { key: 'border-strong', label: '强描边' },
  { key: 'primary', label: '主色' },
  { key: 'primary-soft', label: '主色浅底' },
  { key: 'primary-fg', label: '主色文字' },
  { key: 'accent', label: '点缀色' },
  { key: 'accent-soft', label: '点缀浅底' },
  { key: 'accent-fg', label: '点缀文字' },
  { key: 'wallpaper-overlay', label: '壁纸遮罩' },
  { key: 'shadow', label: '阴影' },
]

export default function ThemeEditorPage() {
  const [presets, setPresets] = useState<Preset[] | null>(null)
  const [active, setActive] = useState('gray')
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [wallpaper, setWallpaper] = useState<{ light: string; dark: string }>({ light: '', dark: '' })
  const [saving, setSaving] = useState(false)
  const [pickerMode, setPickerMode] = useState<'light' | 'dark' | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [isDark, setIsDark] = useState(false)
  const [friendsWallpaper, setFriendsWallpaper] = useState(true)
  const [fwSaving, setFwSaving] = useState(false)
  const [topbar, setTopbar] = useState({ style: 'glass', accent: false, ornament: 'none', height: 56 })

  // 跟随控制台暗色模式:预览使用对应色板
  useEffect(() => {
    const html = document.documentElement
    const update = () => setIsDark(html.classList.contains('dark'))
    update()
    const obs = new MutationObserver(update)
    obs.observe(html, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    api<{ presets: Preset[] }>('/admin/api/state')
      .then((d) => {
        setPresets(d.presets)
        setActive(d.presets[0].id)
        setAssets((d.assets ?? []).filter((a: Asset) => a.kind === 'wallpaper'))
        setFriendsWallpaper(d.site?.features?.friendsWallpaper ?? true)
      })
      .catch((e) => toast.error(e.message))
  }, [])

  const current = useMemo(() => presets?.find((p) => p.id === active), [presets, active])

  useEffect(() => {
    if (!current) return
    setTopbar(current.override?.topbar ?? {
      style: current.topbar?.style ?? 'glass',
      accent: current.topbar?.accent ?? false,
      ornament: current.topbar?.ornament ?? 'none',
      height: current.topbar?.height ?? 56,
    })
  }, [current])

  useEffect(() => {
    if (!current) return
    const merged: Record<string, string> = {}
    for (const mode of ['light', 'dark'] as const) {
      for (const [k, v] of Object.entries(current.palette[mode])) {
        merged[`${mode}.${k}`] = v
      }
    }
    setEdits(merged)
    setWallpaper({
      light: current.override?.wallpaper?.light ?? current.wallpaper.light.replace(/^gradient:/, ''),
      dark: current.override?.wallpaper?.dark ?? current.wallpaper.dark.replace(/^gradient:/, ''),
    })
  }, [current])

  // 实时预览:仅在预览容器作用域内应用(不污染控制台全局样式)
  const previewMode = isDark ? 'dark' : 'light'
  const previewVars = useMemo(() => {
    if (!current) return {}
    const vars: Record<string, string> = {}
    for (const mode of ['light', 'dark'] as const) {
      for (const s of SWATCH_ORDER) {
        const edited = edits[`${mode}.${s.key}`]
        if (edited) vars[`--pv-${mode}-${s.key}`] = edited
      }
    }
    return vars
  }, [current, edits])
  const pv = (token: string) => `var(--pv-${previewMode}-${token})`

  if (!current) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-72" />
      </div>
    )
  }

  async function save() {
    if (!current) return
    setSaving(true)
    try {
      const state = await api<{ presets: Preset[]; site: SiteConfig }>('/admin/api/state')
      const overrides = state.site.themeOverrides as Record<
        string,
        { palette?: Record<string, string>; wallpaper?: { light?: string; dark?: string }; topbar?: { style?: string; accent?: boolean; ornament?: string; height?: number } }
      >
      const merged = { ...overrides }

      // 收集本主题改动:与内置值对比
      const palette: Record<string, string> = {}
      for (const mode of ['light', 'dark'] as const) {
        for (const s of SWATCH_ORDER) {
          const edited = edits[`${mode}.${s.key}`]
          const base = current.palette[mode][s.key]
          if (edited && edited !== base) palette[s.key] = edited
        }
      }
      const wp: { light?: string; dark?: string } = {}
      for (const mode of ['light', 'dark'] as const) {
        const val = wallpaper[mode].trim()
        const base = current.wallpaper[mode]
        if (val && `gradient:${val}` !== base && val !== base) {
          wp[mode] = val.startsWith('linear-gradient') ? `gradient:${val}` : val
        }
      }
      const tb = current.override?.topbar
      const topbarChanged =
        (topbar.style ?? 'glass') !== (tb?.style ?? current.topbar?.style ?? 'glass') ||
        (topbar.accent ?? false) !== (tb?.accent ?? current.topbar?.accent ?? false) ||
        (topbar.ornament ?? 'none') !== (tb?.ornament ?? current.topbar?.ornament ?? 'none') ||
        (topbar.height ?? 56) !== (tb?.height ?? current.topbar?.height ?? 56)
      merged[current.id] = {
        ...merged[current.id],
        palette,
        wallpaper: wp,
        ...(topbarChanged ? { topbar } : { topbar: undefined }),
      }

      await api('/admin/api/config', {
        method: 'PUT',
        body: JSON.stringify({ ...state.site, themeOverrides: merged }),
      })
      toast.success('已保存')
      setTimeout(() => window.location.reload(), 400)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function reset() {
    if (!current) return
    if (!window.confirm(`确认将「${current.name}」重置为内置预设?`)) return
    try {
      const state = await api<{ presets: Preset[]; site: SiteConfig }>('/admin/api/state')
      const overrides = state.site.themeOverrides as Record<string, unknown>
      const { [current.id]: _removed, ...rest } = overrides
      void _removed
      await api('/admin/api/config', {
        method: 'PUT',
        body: JSON.stringify({ ...state.site, themeOverrides: rest }),
      })
      toast.success('已重置')
      setTimeout(() => window.location.reload(), 400)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function uploadWallpaper(mode: 'light' | 'dark') {
    if (!current) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const fd = new FormData()
      fd.append('kind', 'wallpaper')
      fd.append('themeId', current.id)
      fd.append('file', file)
      try {
        const res = await fetch('/admin/api/assets', { method: 'POST', body: fd })
        if (!res.ok) throw new Error((await res.json()).error ?? '上传失败')
        const d = await res.json()
        setWallpaper((w) => ({ ...w, [mode]: `url:${d.asset.path}` }))
        toast.success('壁纸已上传')
      } catch (e) {
        toast.error((e as Error).message)
      }
    }
    input.click()
  }

  async function saveFriendsWallpaper(v: boolean) {
    setFwSaving(true)
    try {
      const state = await api<{ presets: Preset[]; site: SiteConfig }>('/admin/api/state')
      const site = { ...state.site, features: { ...(state.site.features ?? {}), friendsWallpaper: v } }
      await api('/admin/api/config', {
        method: 'PUT',
        body: JSON.stringify(site),
      })
      setFriendsWallpaper(v)
      toast.success(v ? '友链壁纸已启用' : '友链壁纸已关闭')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setFwSaving(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">{current.name}</h3>
            <p className="text-xs text-muted-foreground">{current.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset}>
              <RotateCcw />
              重置此主题
            </Button>
            <Button onClick={save} disabled={saving}>
              <Save />
              {saving ? '保存中…' : '保存修改'}
            </Button>
          </div>
        </div>

        {/* 局部作用域实时预览 */}
        <div
          className="mt-4 flex items-center gap-4 rounded-xl border p-4 transition-colors"
          style={{
            ...(previewVars as React.CSSProperties),
            background: pv('bg'),
          }}
        >
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold shadow-sm transition-colors"
            style={{ background: pv('primary'), color: pv('primary-fg') }}
          >
            E
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium transition-colors" style={{ color: pv('fg') }}>
              预览示例 · {previewMode === 'dark' ? '深色模式' : '浅色模式'}
            </p>
            <p className="truncate text-xs transition-colors" style={{ color: pv('fg-muted') }}>
              这是卡片文本 · 主色 {edits[`${previewMode}.primary`] ?? ''}
            </p>
          </div>
          <span
            className="hidden shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors sm:inline"
            style={{ background: pv('primary'), color: pv('primary-fg') }}
          >
            按钮
          </span>
          <span
            className="hidden shrink-0 rounded-full px-3 py-1 text-xs transition-colors sm:inline"
            style={{ background: pv('accent-soft'), color: pv('accent-fg') }}
          >
            标签
          </span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-4">
        <Tabs value={active} onValueChange={setActive} className="lg:col-span-1">
          <TabsList className="h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0">
            {presets?.map((p) => (
              <TabsTrigger
                key={p.id}
                value={p.id}
                className="h-11 justify-start gap-2.5 rounded-lg border px-3 data-[state=active]:border-primary/40 data-[state=active]:bg-primary/5 data-[state=active]:shadow-none"
              >
                <span className="flex -space-x-1">
                  {(['bg', 'primary', 'accent'] as const).map((k) => (
                    <span key={k} className="size-3.5 rounded-full border border-black/5" style={{ background: p.palette.light[k] }} />
                  ))}
                </span>
                {p.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid gap-4 lg:col-span-3">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <ImageIcon className="size-4" />
                友链页专属壁纸
              </h4>
              <Switch
                checked={friendsWallpaper}
                onCheckedChange={(v) => saveFriendsWallpaper(v)}
                disabled={fwSaving}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              巫女静静地在孤岛上守望,樱花萌芽,几度轮回春?独立主题,不出现在访客主题切换栏。
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="overflow-hidden rounded-lg border">
                <img src="/wallpapers/friends-shrine-day-static.svg" alt="友链壁纸·白天" className="aspect-video w-full object-cover" />
                <p className="px-2 py-1 text-[11px] text-muted-foreground">白天</p>
              </div>
              <div className="overflow-hidden rounded-lg border">
                <img src="/wallpapers/friends-shrine-night-static.svg" alt="友链壁纸·黑夜" className="aspect-video w-full object-cover" />
                <p className="px-2 py-1 text-[11px] text-muted-foreground">黑夜</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 sm:p-6">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Settings2 className="size-4" />
              顶部栏美化
            </h4>
            <p className="mb-4 text-xs text-muted-foreground">
              背景样式 · 主题渐变线 · 像素装饰,随主题切换即时生效
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>背景样式</Label>
                <Select value={topbar.style} onValueChange={(v) => setTopbar({ ...topbar, style: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="glass">毛玻璃(半透明+模糊)</SelectItem>
                    <SelectItem value="solid">实色</SelectItem>
                    <SelectItem value="gradient">主题渐变</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>像素装饰</Label>
                <Select value={topbar.ornament} onValueChange={(v) => setTopbar({ ...topbar, ornament: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无</SelectItem>
                    <SelectItem value="dots">圆点</SelectItem>
                    <SelectItem value="wave">波浪</SelectItem>
                    <SelectItem value="leaf">樱花瓣</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>底部渐变线</Label>
                <div className="flex h-9 items-center gap-2">
                  <Switch checked={topbar.accent} onCheckedChange={(v) => setTopbar({ ...topbar, accent: v })} />
                  <span className="text-xs text-muted-foreground">{topbar.accent ? '启用' : '关闭'}</span>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>高度(px)</Label>
                <Input type="number" min={44} max={96} value={topbar.height} onChange={(e) => setTopbar({ ...topbar, height: Number(e.target.value) })} />
              </div>
            </div>
          </Card>
          <Card className="p-5 sm:p-6">
            <h4 className="mb-3 text-sm font-semibold">色板</h4>
            {(['light', 'dark'] as const).map((mode) => (
              <div key={mode} className="mb-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">{mode === 'light' ? '浅色模式' : '深色模式'}</p>
                <div className="grid gap-x-5 gap-y-2 sm:grid-cols-2">
                  {SWATCH_ORDER.map((s) => (
                    <div key={`${mode}.${s.key}`} className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-[13px]" title={s.key}>
                        {s.label}
                      </span>
                      <input
                        type="color"
                        value={edits[`${mode}.${s.key}`] ?? '#888888'}
                        onChange={(e) => setEdits((prev) => ({ ...prev, [`${mode}.${s.key}`]: e.target.value }))}
                        className="size-7 cursor-pointer rounded-md border bg-transparent p-0.5"
                        aria-label={`${s.label}(${mode})`}
                      />
                      <Input
                        value={edits[`${mode}.${s.key}`] ?? ''}
                        onChange={(e) => setEdits((prev) => ({ ...prev, [`${mode}.${s.key}`]: e.target.value }))}
                        className="h-7 w-24 font-mono text-xs"
                        spellCheck={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>

          <Card className="p-5 sm:p-6">
            <h4 className="mb-3 text-sm font-semibold">背景壁纸</h4>
            <p className="mb-3 text-xs text-muted-foreground">
              渐变格式:linear-gradient(180deg, #fff 0%, #000 100%);或上传图片
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(['light', 'dark'] as const).map((mode) => (
                <div key={mode} className="grid gap-1.5">
                  <Label>{mode === 'light' ? '浅色壁纸' : '深色壁纸'}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={wallpaper[mode]}
                      onChange={(e) => setWallpaper((w) => ({ ...w, [mode]: e.target.value }))}
                      className="font-mono text-xs"
                      placeholder="渐变 CSS 或 url:/uploads/…"
                    />
                    <Button type="button" variant="outline" size="icon" title="从资产库选择" onClick={() => setPickerMode(mode)}>
                      <FolderOpen />
                    </Button>
                    <Button type="button" variant="outline" size="icon" title="上传新壁纸" onClick={() => uploadWallpaper(mode)}>
                      <ImagePlus />
                    </Button>
                  </div>
                  {wallpaper[mode].startsWith('url:') && (
                    <div className="mt-1 h-16 overflow-hidden rounded-lg border bg-muted/40">
                      <img
                        src={wallpaper[mode].slice(4)}
                        alt=""
                        className="size-full object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              建议流程:先在「资产」页上传壁纸 → 回到这里用文件夹按钮从资产库选中,更稳定。
            </p>
          </Card>

          {/* 壁纸资产选择器 */}
          <Dialog open={pickerMode !== null} onOpenChange={(o) => !o && setPickerMode(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>从资产库选择壁纸</DialogTitle>
                <DialogDescription>选择一张已上传的壁纸(pickerMode ? 浅色 : 深色)</DialogDescription>
              </DialogHeader>
              {assets.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  资产库还没有壁纸,先到「资产」页上传,或点上传按钮直接上传
                </div>
              ) : (
                <div className="grid max-h-[380px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
                  {assets.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        if (pickerMode) setWallpaper((w) => ({ ...w, [pickerMode]: `url:${a.path}` }))
                        setPickerMode(null)
                      }}
                      className="group overflow-hidden rounded-xl border text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                    >
                      <div className="h-20 overflow-hidden bg-muted/40">
                        <img
                          src={a.path}
                          alt={a.fileName}
                          className="size-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-2">
                        <p className="truncate text-xs font-medium" title={a.fileName}>
                          {a.fileName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {a.themeId ?? '通用'} · {Math.round(a.size / 1024)}KB
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
