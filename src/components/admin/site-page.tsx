'use client'

import { useEffect, useState } from 'react'
import { KeyRound, Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from './lib/api'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Switch } from './ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Skeleton } from './ui/skeleton'

interface Site {
  title: string
  description: string
  author: string
  defaultTheme: string
  features: Record<string, boolean>
  nav: Array<{ label: string; url: string }>
  homepage: {
    announcement: string
    showAnnouncement: boolean
    showTechStack: boolean
    showOcSection: boolean
    showColumnOverview: boolean
    motion: {
      hero: string
      mascot: string
      cards: string
      topbar: string
      ambient: string
      speed: string
    }
  }
}

const MOTION_GROUPS = [
  { key: 'mascot', label: '吉祥物动效', options: [['none', '无'], ['bob', '呼吸漂浮'], ['ear-tip', '耳朵抖动'], ['tail-wag', '尾巴摆动'], ['wobble', '呆萌摇摆']] },
  { key: 'cards', label: '卡片动效', options: [['none', '无'], ['card-lift', '悬浮浮起'], ['card-tilt', '3D 倾斜'], ['card-sheen', '光泽扫过'], ['card-border-flow', '边框流光'], ['card-float-in', '入场浮入']] },
  { key: 'topbar', label: '顶部栏动效', options: [['none', '无'], ['topbar-gradient', '渐变流动'], ['nav-underline', '导航下划线']] },
  { key: 'ambient', label: '环境动效', options: [['none', '无'], ['pulse-soft', '柔和脉冲'], ['scroll-hint', '滚动提示'], ['float-slow', '大漂浮']] },
  { key: 'hero', label: 'Hero 动效', options: [['none', '无'], ['float-slow', '大漂浮'], ['spin-slow', '缓慢旋转']] },
]

const FEATURES = [
  { key: 'search', label: '全站搜索' },
  { key: 'comments', label: '评论(预留)' },
  { key: 'rss', label: 'RSS 订阅' },
  { key: 'wallpapers', label: '背景壁纸' },
  { key: 'resources', label: '资源站(预留)' },
]

export default function SitePage() {
  const [site, setSite] = useState<Site | null>(null)
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api<{ site: Site }>('/admin/api/state')
      .then((d) => setSite(d.site))
      .catch((e) => toast.error(e.message))
  }, [])

  if (!site) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Skeleton className="h-96" />
      </div>
    )
  }

  async function save() {
    setSaving(true)
    try {
      await api('/admin/api/config', { method: 'PUT', body: JSON.stringify(site) })
      toast.success('已保存')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function changePassword() {
    if (password.length < 8) {
      toast.error('密码至少 6 位')
      return
    }
    try {
      await api('/admin/api/password', { method: 'PUT', body: JSON.stringify({ password }) })
      toast.success('密码已更新')
      setPassword('')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Card className="gap-5 p-5 sm:p-6">
        <h3 className="text-sm font-semibold">基础信息</h3>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>站点标题</Label>
            <Input value={site.title} onChange={(e) => setSite({ ...site, title: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label>站点描述</Label>
            <Textarea value={site.description} onChange={(e) => setSite({ ...site, description: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>作者署名</Label>
              <Input value={site.author} onChange={(e) => setSite({ ...site, author: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>默认主题</Label>
              <Select value={site.defaultTheme} onValueChange={(v) => setSite({ ...site, defaultTheme: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gray">灰糖</SelectItem>
                  <SelectItem value="yellow">蜜糖</SelectItem>
                  <SelectItem value="purple">葡萄</SelectItem>
                  <SelectItem value="white">棉花糖</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <Card className="gap-5 p-5 sm:p-6">
        <h3 className="text-sm font-semibold">功能开关</h3>
        <div className="flex flex-col gap-3">
          {FEATURES.map((f) => (
            <label key={f.key} className="flex cursor-pointer items-center justify-between">
              <span className="text-sm">{f.label}</span>
              <Switch checked={Boolean(site.features[f.key])} onCheckedChange={(v) => setSite({ ...site, features: { ...site.features, [f.key]: v } })} />
            </label>
          ))}
        </div>
      </Card>

      <Card className="gap-5 p-5 sm:p-6">
        <h3 className="text-sm font-semibold">主页</h3>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>公告内容(留空隐藏)</Label>
            <Textarea
              value={site.homepage.announcement}
              rows={2}
              onChange={(e) =>
                setSite({ ...site, homepage: { ...site.homepage, announcement: e.target.value } })
              }
              placeholder="欢迎来到实验室…"
            />
          </div>
          <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-between text-sm">
              <span>显示公告</span>
              <Switch
                checked={site.homepage.showAnnouncement}
                onCheckedChange={(v) => setSite({ ...site, homepage: { ...site.homepage, showAnnouncement: v } })}
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between text-sm">
              <span>显示四栏目鸟瞰</span>
              <Switch
                checked={site.homepage.showColumnOverview}
                onCheckedChange={(v) => setSite({ ...site, homepage: { ...site.homepage, showColumnOverview: v } })}
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between text-sm">
              <span>显示 OC 展示区</span>
              <Switch
                checked={site.homepage.showOcSection}
                onCheckedChange={(v) => setSite({ ...site, homepage: { ...site.homepage, showOcSection: v } })}
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between text-sm">
              <span>显示技术栈区</span>
              <Switch
                checked={site.homepage.showTechStack}
                onCheckedChange={(v) => setSite({ ...site, homepage: { ...site.homepage, showTechStack: v } })}
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {MOTION_GROUPS.map((g) => (
              <div key={g.key} className="grid gap-1.5">
                <Label>{g.label}</Label>
                <Select
                  value={site.homepage.motion[g.key]}
                  onValueChange={(v) =>
                    setSite({ ...site, homepage: { ...site.homepage, motion: { ...site.homepage.motion, [g.key]: v } } })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {g.options.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div className="grid gap-1.5">
              <Label>动效速度</Label>
              <Select
                value={site.homepage.motion.speed}
                onValueChange={(v) =>
                  setSite({ ...site, homepage: { ...site.homepage, motion: { ...site.homepage.motion, speed: v } } })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">慢</SelectItem>
                  <SelectItem value="normal">正常</SelectItem>
                  <SelectItem value="fast">快</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <Card className="gap-5 p-5 sm:p-6">
        <h3 className="text-sm font-semibold">导航</h3>
        <div className="flex flex-col gap-2">
          {site.nav.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={item.label}
                onChange={(e) => {
                  const nav = site.nav.map((n, j) => (j === i ? { ...n, label: e.target.value } : n))
                  setSite({ ...site, nav })
                }}
                placeholder="名称"
              />
              <Input
                value={item.url}
                onChange={(e) => {
                  const nav = site.nav.map((n, j) => (j === i ? { ...n, url: e.target.value } : n))
                  setSite({ ...site, nav })
                }}
                placeholder="/路径"
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 text-destructive"
                onClick={() => setSite({ ...site, nav: site.nav.filter((_, j) => j !== i) })}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => setSite({ ...site, nav: [...site.nav, { label: '新页面', url: '/' }] })}
          >
            <Plus />
            添加导航项
          </Button>
        </div>
      </Card>

      <Card className="gap-5 p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <KeyRound className="size-4" />
          管理员密码
        </h3>
        <div className="flex gap-2">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="新密码(≥8 位)" />
          <Button variant="outline" onClick={changePassword}>
            更新密码
          </Button>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          <Save />
          {saving ? '保存中…' : '保存站点设置'}
        </Button>
      </div>
    </div>
  )
}
