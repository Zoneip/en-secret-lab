'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  Download,
  ExternalLink,
  FileText,
  HardDrive,
  Layers,
  Link2,
  Package,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../lib/api'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Skeleton } from '../ui/skeleton'
import { Textarea } from '../ui/textarea'
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

interface Resource {
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

const emptyForm = {
  title: '',
  description: '',
  category: '',
  tags: '',
  size: '',
  file: '',
  externalUrl: '',
  pubDate: new Date().toISOString().slice(0, 10),
}

/** 表单字符串 → 提交数据 */
function parseForm(f: typeof emptyForm) {
  return {
    title: f.title.trim(),
    description: f.description.trim(),
    category: f.category.trim() || '其他',
    tags: f.tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean),
    size: f.size.trim() || undefined,
    file: f.file.trim() || undefined,
    externalUrl: f.externalUrl.trim() || undefined,
    pubDate: f.pubDate,
  }
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[] | null>(null)
  const [filter, setFilter] = useState('all')
  const [creating, setCreating] = useState(false)
  const [newId, setNewId] = useState('')
  const [newForm, setNewForm] = useState(emptyForm)
  const [createBusy, setCreateBusy] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [saveBusy, setSaveBusy] = useState(false)
  const [deleting, setDeleting] = useState<Resource | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const load = () =>
    api<{ resources: Resource[] }>('/admin/api/resources')
      .then((d) => setResources(d.resources))
      .catch((e: Error) => toast.error(e.message))

  useEffect(() => {
    load()
  }, [])

  const categories = useMemo(
    () => [...new Set((resources ?? []).map((r) => r.category))],
    [resources],
  )
  const stats = useMemo(() => {
    const list = resources ?? []
    return {
      total: list.length,
      categories: new Set(list.map((r) => r.category)).size,
      downloads: list.reduce((s, r) => s + r.downloads, 0),
      latest: list.length
        ? [...list].sort((a, b) => b.pubDate.localeCompare(a.pubDate))[0]
            .pubDate
        : null,
    }
  }, [resources])
  const visible =
    filter === 'all'
      ? (resources ?? [])
      : (resources ?? []).filter((r) => r.category === filter)

  async function createResource(e: React.SubmitEvent) {
    e.preventDefault()
    setCreateBusy(true)
    try {
      await api('/admin/api/resources', {
        method: 'POST',
        body: JSON.stringify({ id: newId.trim(), ...parseForm(newForm) }),
      })
      toast.success('资源已创建')
      setCreating(false)
      setNewId('')
      setNewForm(emptyForm)
      await load()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setCreateBusy(false)
    }
  }

  function startEdit(r: Resource) {
    setEditingId(r.id)
    setEditForm({
      title: r.title,
      description: r.description,
      category: r.category,
      tags: r.tags.join(', '),
      size: r.size ?? '',
      file: r.file ?? '',
      externalUrl: r.externalUrl ?? '',
      pubDate: r.pubDate,
    })
  }

  async function saveEdit(id: string) {
    setSaveBusy(true)
    try {
      await api('/admin/api/resources', {
        method: 'PUT',
        body: JSON.stringify({ id, ...parseForm(editForm) }),
      })
      toast.success('已保存')
      setEditingId(null)
      await load()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaveBusy(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    setDeleteBusy(true)
    try {
      await api(`/admin/api/resources/${deleting.id}`, { method: 'DELETE' })
      toast.success(`资源「${deleting.title}」已删除`)
      setDeleting(null)
      await load()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setDeleteBusy(false)
    }
  }

  if (!resources) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 统计概览 */}
      <Card className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Package className="size-3.5" />
            资源总数
          </span>
          <span className="text-2xl font-semibold">{stats.total}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Layers className="size-3.5" />
            分类数量
          </span>
          <span className="text-2xl font-semibold">{stats.categories}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Download className="size-3.5" />
            累计下载
          </span>
          <span className="text-2xl font-semibold">{stats.downloads}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            最近发布
          </span>
          <span className="truncate text-lg font-semibold">
            {stats.latest ?? '—'}
          </span>
        </div>
      </Card>

      {/* 工具栏:筛选 + 新建 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
          >
            全部
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >
              {c}
            </button>
          ))}
        </div>
        <Button onClick={() => setCreating((v) => !v)} disabled={creating}>
          {creating ? <X /> : <Plus />}
          {creating ? '取消新建' : '新建资源'}
        </Button>
      </div>

      {/* 新建表单(平铺) */}
      {creating && (
        <Card className="gap-4 border-primary/30 p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Plus className="size-4 text-primary" />
            新建资源
          </h3>
          <form onSubmit={createResource} className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>资源 id(前台 URL 标识,小写字母数字连字符)</Label>
              <Input
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                placeholder="my-tool"
                required
                pattern="[a-z0-9-]+"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>分类</Label>
              <Input
                value={newForm.category}
                onChange={(e) =>
                  setNewForm({ ...newForm, category: e.target.value })
                }
                placeholder="工具"
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label>标题</Label>
              <Input
                value={newForm.title}
                onChange={(e) =>
                  setNewForm({ ...newForm, title: e.target.value })
                }
                placeholder="资源名称"
                required
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label>描述</Label>
              <Textarea
                value={newForm.description}
                rows={2}
                onChange={(e) =>
                  setNewForm({ ...newForm, description: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreating(false)}
              >
                取消
              </Button>
              <Button type="submit" disabled={createBusy}>
                <Save />
                {createBusy ? '创建中…' : '创建'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 资源列表 */}
      {visible.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          {resources.length === 0
            ? '还没有资源,点击「新建资源」添加第一个'
            : '该分类下暂无资源'}
        </Card>
      ) : (
        visible.map((r) =>
          editingId === r.id ? (
            <Card key={r.id} className="gap-4 border-primary/30 p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Pencil className="size-4 text-primary" />
                  编辑资源
                  <span className="text-[11px] font-normal text-muted-foreground">
                    / {r.id}
                  </span>
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  下载 {r.downloads} 次
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>标题</Label>
                  <Input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>分类</Label>
                  <Input
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label>描述</Label>
                  <Textarea
                    rows={2}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>大小显示(如 12.4 MB)</Label>
                  <Input
                    value={editForm.size}
                    onChange={(e) =>
                      setEditForm({ ...editForm, size: e.target.value })
                    }
                    placeholder="12.4 MB"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>标签(逗号分隔)</Label>
                  <Input
                    value={editForm.tags}
                    onChange={(e) =>
                      setEditForm({ ...editForm, tags: e.target.value })
                    }
                    placeholder="免费, 开源"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>上传文件路径(/uploads/...)</Label>
                  <Input
                    value={editForm.file}
                    onChange={(e) =>
                      setEditForm({ ...editForm, file: e.target.value })
                    }
                    placeholder="先在资产页上传,再填入路径"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>外部下载链接(可选)</Label>
                  <Input
                    value={editForm.externalUrl}
                    onChange={(e) =>
                      setEditForm({ ...editForm, externalUrl: e.target.value })
                    }
                    placeholder="https://…(优先于文件)"
                  />
                </div>
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label>发布日期</Label>
                  <Input
                    type="date"
                    value={editForm.pubDate}
                    onChange={(e) =>
                      setEditForm({ ...editForm, pubDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingId(null)}>
                  <X />
                  取消
                </Button>
                <Button onClick={() => saveEdit(r.id)} disabled={saveBusy}>
                  <Save />
                  {saveBusy ? '保存中…' : '保存'}
                </Button>
              </div>
            </Card>
          ) : (
            <Card key={r.id} className="gap-3 p-5">
              {/* 头部:图标 + 标题/id | 操作 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Package className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold leading-snug">
                      {r.title}
                    </h3>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      / {r.id}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <a
                    href={`/resources/${r.id}`}
                    target="_blank"
                    rel="noreferrer"
                    title="前台预览"
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(r)}
                  >
                    <Pencil />
                    编辑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleting(r)}
                  >
                    <Trash2 />
                    删除
                  </Button>
                </div>
              </div>

              {/* 描述 */}
              {r.description && (
                <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                  {r.description}
                </p>
              )}

              {/* 分类 + 标签 */}
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary">{r.category}</Badge>
                {r.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* 元信息:图标化 + 顶部描边分隔 */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <HardDrive className="size-3.5" />
                  {r.size ?? '大小未知'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Download className="size-3.5" />
                  下载 {r.downloads} 次
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  发布于 {r.pubDate}
                </span>
                {r.file && (
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="size-3.5" />
                    本站文件
                  </span>
                )}
                {r.externalUrl && (
                  <span className="inline-flex items-center gap-1.5">
                    <Link2 className="size-3.5" />
                    外链
                  </span>
                )}
              </div>
            </Card>
          ),
        )
      )}

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(v) => !v && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除资源「{deleting?.title}」？</AlertDialogTitle>
            <AlertDialogDescription>
              将删除 /resources/{deleting?.id}{' '}
              的元数据与下载计数,该操作不可恢复。上传的文件不会被删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white"
              disabled={deleteBusy}
              onClick={(e) => {
                e.preventDefault()
                confirmDelete()
              }}
            >
              {deleteBusy ? '删除中…' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
