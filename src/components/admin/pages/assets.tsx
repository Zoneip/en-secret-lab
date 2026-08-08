'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Check,
  Copy,
  ExternalLink,
  FileText,
  ImageIcon,
  MoreHorizontal,
  Search,
  Trash2,
  Type,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../lib/api'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Skeleton } from '../ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'

interface Asset {
  id: string
  kind: string
  themeId: string | null
  fileName: string
  path: string
  size: number
  created_at?: number
}

const KIND_LABEL: Record<string, string> = {
  wallpaper: '壁纸',
  font: '字体',
  misc: '其他',
}
const KIND_ICON: Record<string, typeof ImageIcon> = {
  wallpaper: ImageIcon,
  font: Type,
  misc: FileText,
}
const KIND_COLOR: Record<string, string> = {
  wallpaper: 'bg-blue-100 text-blue-700',
  font: 'bg-purple-100 text-purple-700',
  misc: 'bg-gray-100 text-gray-600',
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[] | null>(null)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [kind, setKind] = useState('wallpaper')
  const [themeId, setThemeId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    const d = await api<{ assets: Asset[] }>('/admin/api/state')
    setAssets(d.assets)
  }, [])

  useEffect(() => {
    load().catch((e) => toast.error(e.message))
  }, [load])

  const visible = useMemo(() => {
    if (!assets) return []
    return assets.filter((a) => {
      if (filter !== 'all' && a.kind !== filter) return false
      if (query && !a.fileName.toLowerCase().includes(query.toLowerCase()))
        return false
      return true
    })
  }, [assets, filter, query])

  async function upload(e: React.SubmitEvent) {
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
      await load()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  async function doDelete() {
    if (!deleteTarget) return
    try {
      await api(`/admin/api/assets/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success('已删除')
      setDeleteTarget(null)
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function copyPath(a: Asset) {
    try {
      await navigator.clipboard.writeText(a.path)
      setCopied(a.id)
      toast.success('路径已复制')
      setTimeout(() => setCopied(null), 1500)
    } catch {
      toast.error('复制失败')
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      {/* 上传区 */}
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
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                accept="image/*,.woff2,.woff,.ttf,.otf"
              />
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

      {/* 资产库 */}
      <Card className="gap-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            {(
              [
                ['all', '全部'],
                ['wallpaper', '壁纸'],
                ['font', '字体'],
                ['misc', '其他'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  filter === key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索文件名…"
              className="h-9 w-52 pl-9 text-sm"
            />
          </div>
        </div>

        <div className="p-4">
          {!assets ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="py-14 text-center text-sm text-muted-foreground">
              {assets.length === 0 ? '还没有上传过资产' : '没有匹配的资产'}
            </div>
          ) : (
            <>
              <div className="mb-3 text-xs text-muted-foreground">
                共 {visible.length} 项
                {filter !== 'all' ? ` · ${KIND_LABEL[filter]}` : ''}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {visible.map((a) => {
                  const Icon = KIND_ICON[a.kind] ?? FileText
                  return (
                    <div
                      key={a.id}
                      className="group relative overflow-hidden rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex h-24 items-center justify-center bg-muted/40">
                        {a.kind === 'wallpaper' ? (
                          <img
                            src={a.path}
                            alt=""
                            loading="lazy"
                            className="size-full object-cover"
                          />
                        ) : (
                          <Icon className="size-8 text-primary" />
                        )}
                        <span
                          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${KIND_COLOR[a.kind] ?? KIND_COLOR.misc}`}
                        >
                          {KIND_LABEL[a.kind] ?? a.kind}
                        </span>
                        {copied === a.id && (
                          <span className="absolute inset-0 grid place-items-center bg-background/80">
                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                              <Check className="size-3.5" />
                              已复制
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p
                          className="truncate text-xs font-medium"
                          title={a.fileName}
                        >
                          {a.fileName}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {a.themeId ?? '通用'} · {Math.round(a.size / 1024)}KB
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1.5 top-1.5 size-7 rounded-lg bg-background/70 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                            aria-label={`操作 ${a.fileName}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => window.open(a.path, '_blank')}
                          >
                            <ExternalLink />
                            打开
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyPath(a)}>
                            <Copy />
                            复制路径
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteTarget(a)}
                          >
                            <Trash2 />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* 删除确认 */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除资产?</AlertDialogTitle>
            <AlertDialogDescription>
              「{deleteTarget?.fileName}
              」将从资产库和磁盘中永久删除,使用它的主题壁纸会失效。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={doDelete}
            >
              <Trash2 />
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
