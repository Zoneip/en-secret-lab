'use client'

import { useEffect, useState } from 'react'
import { FileText, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../lib/api'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Skeleton } from '../ui/skeleton'

interface Asset {
  id: string
  kind: string
  themeId: string | null
  fileName: string
  path: string
  size: number
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[] | null>(null)
  const [kind, setKind] = useState('wallpaper')
  const [themeId, setThemeId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    api<{ assets: Asset[] }>('/admin/api/state')
      .then((d) => setAssets(d.assets))
      .catch((e) => toast.error(e.message))
  }, [])

  async function upload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      toast.error('请选择文件')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('文件超过 20MB')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('kind', kind)
      if (kind === 'wallpaper' && themeId) fd.append('themeId', themeId)
      fd.append('file', file)
      const res = await fetch('/admin/api/assets', { method: 'POST', body: fd })
      if (!res.ok) throw new Error((await res.json()).error ?? '上传失败')
      toast.success('上传成功')
      setFile(null)
      const d = await api<{ assets: Asset[] }>('/admin/api/state')
      setAssets(d.assets)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Card className="p-5 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Upload className="size-4" />
          上传资产
        </h3>
        <form onSubmit={upload} className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label>类型</Label>
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wallpaper">壁纸</SelectItem>
                  <SelectItem value="font">字体(woff2/ttf/otf)</SelectItem>
                  <SelectItem value="misc">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {kind === 'wallpaper' && (
              <div className="grid gap-1.5">
                <Label>关联主题</Label>
                <Select value={themeId} onValueChange={setThemeId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="不关联" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">不关联</SelectItem>
                    <SelectItem value="gray">灰糖</SelectItem>
                    <SelectItem value="yellow">蜜糖</SelectItem>
                    <SelectItem value="purple">葡萄</SelectItem>
                    <SelectItem value="white">棉花糖</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-1.5">
              <Label>文件</Label>
              <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} accept="image/*,.woff2,.woff,.ttf,.otf" />
            </div>
          </div>
          <div>
            <Button type="submit" disabled={uploading}>
              <Upload />
              {uploading ? '上传中…' : '上传'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-5 sm:p-6">
        <h3 className="mb-4 text-sm font-semibold">已上传({assets?.length ?? 0})</h3>
        {!assets ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : assets.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">还没有上传过资产</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {assets.map((a) => (
              <a
                key={a.id}
                href={a.path}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-24 items-center justify-center bg-muted/50">
                  {a.kind === 'wallpaper' ? (
                    <img src={a.path} alt="" loading="lazy" className="size-full object-cover" />
                  ) : (
                    <FileText className="size-8 text-primary" />
                  )}
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-medium" title={a.fileName}>
                    {a.fileName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {a.kind} · {Math.round(a.size / 1024)}KB{a.themeId ? ` · ${a.themeId}` : ''}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
