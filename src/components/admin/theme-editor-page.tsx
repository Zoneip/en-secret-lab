'use client'

import { useEffect, useMemo, useState } from 'react'
import { ImagePlus, RotateCcw, Save } from 'lucide-react'
import { toast } from 'sonner'
import { api } from './lib/api'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Skeleton } from './ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'

interface Preset {
  id: string
  name: string
  description: string
  palette: { light: Record<string, string>; dark: Record<string, string> }
  wallpaper: { light: string; dark: string }
  override: { palette?: Record<string, string>; wallpaper?: { light?: string; dark?: string } } | null
}

interface SiteConfig {
  themeOverrides: Record<string, unknown>
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
  const [isDark, setIsDark] = useState(false)

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
      })
      .catch((e) => toast.error(e.message))
  }, [])

  const current = useMemo(() => presets?.find((p) => p.id === active), [presets, active])

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
      const overrides = state.site.themeOverrides as Record<string, { palette?: Record<string, string>; wallpaper?: { light?: string; dark?: string } }>
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
      merged[current.id] = { ...merged[current.id], palette, wallpaper: wp }

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
                      placeholder="渐变 CSS 或留空"
                    />
                    <Button type="button" variant="outline" size="icon" title="上传图片" onClick={() => uploadWallpaper(mode)}>
                      <ImagePlus />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
