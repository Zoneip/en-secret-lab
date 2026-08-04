'use client'

import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../lib/api'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Skeleton } from '../ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

interface ColumnData {
  id: string
  title: string
  subtitle: string
  description: string
  theme: string
  category: string
}

interface OcData {
  id: string
  name: string
  theme: string
  subtitle: string
  description: string
  traits: string[]
  quote?: string
  quoteEffect: string
  quoteSpeed: string
  art?: string
}

interface ResourceData {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  size?: string
  file?: string
  externalUrl?: string
  pubDate: string
  downloads: number
}

interface AboutData {
  nickname: string
  tagline: string
  avatar?: string
  intro: string[]
  links: Array<{ label: string; url: string }>
}

const THEME_LABEL: Record<string, string> = {
  gray: '灰糖',
  yellow: '蜜糖',
  purple: '葡萄',
  white: '棉花糖',
}

const ROLE_LABEL: Record<string, string> = {
  gray: 'DCH',
  yellow: 'FWB',
  purple: 'Coulyer',
  white: 'Zoneip',
}

export default function ContentPage() {
  const [columns, setColumns] = useState<ColumnData[] | null>(null)
  const [ocs, setOcs] = useState<OcData[] | null>(null)
  const [about, setAbout] = useState<AboutData | null>(null)
  const [resources, setResources] = useState<ResourceData[] | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () =>
    api<{ columns: ColumnData[]; ocs: OcData[]; about: AboutData | null; resources: ResourceData[] }>(
      '/admin/api/content'
    )
      .then((d: { columns: ColumnData[]; ocs: OcData[]; about: AboutData | null; resources: ResourceData[] }) => {
        const order = ['gray', 'yellow', 'purple', 'white']
        setColumns([...d.columns].sort((a, b) => order.indexOf(a.theme) - order.indexOf(b.theme)))
        setOcs([...d.ocs].sort((a, b) => order.indexOf(a.theme) - order.indexOf(b.theme)))
        setAbout(d.about)
        setResources(d.resources)
      })
      .catch((e: Error) => toast.error(e.message))

  useEffect(() => {
    load()
  }, [])

  if (!columns || !ocs || !about || !resources) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  async function save(part: 'columns' | 'ocs' | 'about' | 'resources') {
    setSaving(true)
    try {
      await api('/admin/api/content', {
        method: 'PUT',
        body: JSON.stringify({
          [part]:
            part === 'columns'
              ? toMap(columns!)
              : part === 'ocs'
                ? toMap(ocs!)
                : part === 'resources'
                  ? toMap(resources!)
                  : about,
        }),
      })
      toast.success('已保存')
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Tabs defaultValue="columns">
        <TabsList>
          <TabsTrigger value="columns">栏目</TabsTrigger>
          <TabsTrigger value="ocs">角色</TabsTrigger>
          <TabsTrigger value="about">关于</TabsTrigger>
          <TabsTrigger value="resources">资源</TabsTrigger>
        </TabsList>

        {/* 栏目 */}
        <TabsContent value="columns" className="flex flex-col gap-4">
          {columns.map((c) => (
            <Card key={c.id} className="gap-4 p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">{ROLE_LABEL[c.theme]}</span>
                  {c.title}
                  <span className="text-[11px] font-normal text-muted-foreground">/ {c.id}</span>
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  {THEME_LABEL[c.theme]} · {c.category}分类
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>标题</Label>
                  <Input
                    value={c.title}
                    onChange={(e) => setColumns(columns.map((x) => (x.id === c.id ? { ...x, title: e.target.value } : x)))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>副标题</Label>
                  <Input
                    value={c.subtitle}
                    onChange={(e) => setColumns(columns.map((x) => (x.id === c.id ? { ...x, subtitle: e.target.value } : x)))}
                  />
                </div>
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label>描述</Label>
                  <Textarea
                    value={c.description}
                    rows={2}
                    onChange={(e) => setColumns(columns.map((x) => (x.id === c.id ? { ...x, description: e.target.value } : x)))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>主题 / 角色</Label>
                  <Select
                    value={c.theme}
                    onValueChange={(v) => setColumns(columns.map((x) => (x.id === c.id ? { ...x, theme: v } : x)))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gray">灰糖 · DCH</SelectItem>
                      <SelectItem value="yellow">蜜糖 · FWB</SelectItem>
                      <SelectItem value="purple">葡萄 · Coulyer</SelectItem>
                      <SelectItem value="white">棉花糖 · Zoneip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>文章分类</Label>
                  <Input
                    value={c.category}
                    onChange={(e) => setColumns(columns.map((x) => (x.id === c.id ? { ...x, category: e.target.value } : x)))}
                  />
                </div>
              </div>
            </Card>
          ))}
          <div className="flex justify-end">
            <Button onClick={() => save('columns')} disabled={saving}>
              <Save />
              保存栏目
            </Button>
          </div>
        </TabsContent>

        {/* 角色 */}
        <TabsContent value="ocs" className="flex flex-col gap-4">
          {ocs.map((oc) => (
            <Card key={oc.id} className="gap-4 p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <span
                    className="size-3 rounded-full border border-black/10"
                    style={{ background: { gray: '#5c677d', yellow: '#e59b2e', purple: '#8b5cf6', white: '#8fa3b8' }[oc.theme] }}
                  />
                  {oc.name}
                  <span className="text-[11px] font-normal text-muted-foreground">/ {oc.id}</span>
                </h3>
                <span className="text-[11px] text-muted-foreground">{THEME_LABEL[oc.theme]}主题</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>名字</Label>
                  <Input
                    value={oc.name}
                    onChange={(e) => setOcs(ocs.map((x) => (x.id === oc.id ? { ...x, name: e.target.value } : x)))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>主题</Label>
                  <Select
                    value={oc.theme}
                    onValueChange={(v) => setOcs(ocs.map((x) => (x.id === oc.id ? { ...x, theme: v } : x)))}
                  >
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
                <div className="grid gap-1.5">
                  <Label>副标题</Label>
                  <Input
                    value={oc.subtitle}
                    onChange={(e) => setOcs(ocs.map((x) => (x.id === oc.id ? { ...x, subtitle: e.target.value } : x)))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>名言</Label>
                  <Input
                    value={oc.quote ?? ''}
                    onChange={(e) => setOcs(ocs.map((x) => (x.id === oc.id ? { ...x, quote: e.target.value } : x)))}
                    placeholder="「口头禅」(可留空)"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>名言动效</Label>
                  <Select
                    value={oc.quoteEffect || 'typing'}
                    onValueChange={(v) => setOcs(ocs.map((x) => (x.id === oc.id ? { ...x, quoteEffect: v } : x)))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无</SelectItem>
                      <SelectItem value="typing">打字机</SelectItem>
                      <SelectItem value="fade">淡入呼吸</SelectItem>
                      <SelectItem value="float">上下浮动</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>动效速度</Label>
                  <Select
                    value={oc.quoteSpeed || 'normal'}
                    onValueChange={(v) => setOcs(ocs.map((x) => (x.id === oc.id ? { ...x, quoteSpeed: v } : x)))}
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
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label>描述</Label>
                  <Textarea
                    value={oc.description}
                    rows={3}
                    onChange={(e) => setOcs(ocs.map((x) => (x.id === oc.id ? { ...x, description: e.target.value } : x)))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>性格标签(逗号分隔)</Label>
                  <Input
                    value={oc.traits.join(', ')}
                    onChange={(e) =>
                      setOcs(
                        ocs.map((x) =>
                          x.id === oc.id
                            ? {
                                ...x,
                                traits: e.target.value
                                  .split(/[,，]/)
                                  .map((t) => t.trim())
                                  .filter(Boolean),
                              }
                            : x
                        )
                      )
                    }
                    placeholder="冷静, 可靠"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>插图 URL(可选)</Label>
                  <Input
                    value={oc.art ?? ''}
                    onChange={(e) => setOcs(ocs.map((x) => (x.id === oc.id ? { ...x, art: e.target.value } : x)))}
                    placeholder="留空则使用像素吉祥物"
                  />
                </div>
              </div>
            </Card>
          ))}
          <div className="flex justify-end">
            <Button onClick={() => save('ocs')} disabled={saving}>
              <Save />
              保存角色
            </Button>
          </div>
        </TabsContent>

        {/* 关于 */}
        <TabsContent value="about">
          <Card className="gap-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>昵称</Label>
                <Input value={about.nickname} onChange={(e) => setAbout({ ...about, nickname: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>标语</Label>
                <Input value={about.tagline} onChange={(e) => setAbout({ ...about, tagline: e.target.value })} />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label>头像 URL</Label>
                <Input value={about.avatar ?? ''} onChange={(e) => setAbout({ ...about, avatar: e.target.value })} placeholder="留空则显示吉祥物" />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label>介绍(每行一条)</Label>
                <Textarea
                  value={about.intro.join('\n')}
                  rows={4}
                  onChange={(e) => setAbout({ ...about, intro: e.target.value.split('\n') })}
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label>链接(label url 每行一对,空格分隔)</Label>
                <Textarea
                  value={about.links.map((l) => `${l.label} ${l.url}`).join('\n')}
                  rows={3}
                  onChange={(e) =>
                    setAbout({
                      ...about,
                      links: e.target.value
                        .split('\n')
                        .map((line) => {
                          const [label, ...rest] = line.trim().split(/\s+/)
                          return label && rest.length ? { label, url: rest.join('') } : null
                        })
                        .filter((l): l is { label: string; url: string } => l !== null),
                    })
                  }
                  placeholder={'GitHub https://github.com\nBilibili https://bilibili.com'}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => save('about')} disabled={saving}>
                <Save />
                保存关于
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* 资源 */}
        <TabsContent value="resources" className="flex flex-col gap-4">
          {resources.map((r) => (
            <Card key={r.id} className="gap-4 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  {r.title}
                  <span className="ml-2 text-[11px] font-normal text-muted-foreground">/ {r.id}</span>
                </h3>
                <span className="text-[11px] text-muted-foreground">下载 {r.downloads} 次</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>标题</Label>
                  <Input
                    value={r.title}
                    onChange={(e) =>
                      setResources(resources.map((x) => (x.id === r.id ? { ...x, title: e.target.value } : x)))
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>分类</Label>
                  <Input
                    value={r.category}
                    onChange={(e) =>
                      setResources(resources.map((x) => (x.id === r.id ? { ...x, category: e.target.value } : x)))
                    }
                  />
                </div>
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label>描述</Label>
                  <Textarea
                    value={r.description}
                    rows={2}
                    onChange={(e) =>
                      setResources(resources.map((x) => (x.id === r.id ? { ...x, description: e.target.value } : x)))
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>大小显示(如 12.4 MB)</Label>
                  <Input
                    value={r.size ?? ''}
                    onChange={(e) =>
                      setResources(resources.map((x) => (x.id === r.id ? { ...x, size: e.target.value } : x)))
                    }
                    placeholder="12.4 MB"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>标签(逗号分隔)</Label>
                  <Input
                    value={r.tags.join(', ')}
                    onChange={(e) =>
                      setResources(
                        resources.map((x) =>
                          x.id === r.id
                            ? {
                                ...x,
                                tags: e.target.value
                                  .split(/[,，]/)
                                  .map((t) => t.trim())
                                  .filter(Boolean),
                              }
                            : x
                        )
                      )
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>上传文件路径(/uploads/...)</Label>
                  <Input
                    value={r.file ?? ''}
                    onChange={(e) =>
                      setResources(resources.map((x) => (x.id === r.id ? { ...x, file: e.target.value } : x)))
                    }
                    placeholder="先在资产页上传,再填入路径"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>外部下载链接(可选)</Label>
                  <Input
                    value={r.externalUrl ?? ''}
                    onChange={(e) =>
                      setResources(resources.map((x) => (x.id === r.id ? { ...x, externalUrl: e.target.value } : x)))
                    }
                    placeholder="https://…(优先于文件)"
                  />
                </div>
              </div>
            </Card>
          ))}
          <div className="flex justify-end">
            <Button onClick={() => save('resources')} disabled={saving}>
              <Save />
              保存资源
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function toMap<T extends { id: string }>(list: T[]): Record<string, T> {
  const map: Record<string, T> = {}
  for (const item of list) {
    const { id, ...rest } = item
    map[id] = rest as T
  }
  return map
}
