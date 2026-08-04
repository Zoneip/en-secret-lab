'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ExternalLink,
  FilePlus2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { api, fmtDate } from '../lib/api'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

interface PostRow {
  slug: string
  title: string
  category: string
  tags: string[]
  pubDate: string
  draft: boolean
}

type Filter = 'all' | 'published' | 'draft'

export default function PostsPage() {
  const [posts, setPosts] = useState<PostRow[] | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PostRow | null>(null)

  const load = useCallback(async () => {
    const d = await api<{ posts: PostRow[] }>('/admin/api/posts')
    setPosts(d.posts)
  }, [])

  useEffect(() => {
    load().catch((e) => toast.error(e.message))
  }, [load])

  const visible = useMemo(() => {
    if (!posts) return []
    if (filter === 'all') return posts
    return posts.filter((p) => (filter === 'draft' ? p.draft : !p.draft))
  }, [posts, filter])

  async function toggleDraft(p: PostRow) {
    try {
      await api(`/admin/api/posts/${p.slug}`, { method: 'PUT', body: JSON.stringify({ draft: !p.draft }) })
      toast.success(p.draft ? '已发布' : '已转为草稿')
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function doDelete() {
    if (!deleteTarget) return
    try {
      await api(`/admin/api/posts/${deleteTarget.slug}`, { method: 'DELETE' })
      toast.success('已删除')
      setDeleteTarget(null)
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <Card className="gap-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            {(
              [
                { key: 'all', label: '全部' },
                { key: 'published', label: '已发布' },
                { key: 'draft', label: '草稿' },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <FilePlus2 />
            写新文章
          </Button>
        </div>

        {!posts ? (
          <div className="p-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="mb-2 h-12" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <p className="text-sm text-muted-foreground">没有匹配的文章</p>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <FilePlus2 />
              写新文章
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">标题</TableHead>
                <TableHead className="hidden md:table-cell">分类</TableHead>
                <TableHead className="hidden sm:table-cell">标签</TableHead>
                <TableHead>日期</TableHead>
                <TableHead className="hidden sm:table-cell">状态</TableHead>
                <TableHead className="pr-5 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((p) => (
                <TableRow key={p.slug}>
                  <TableCell className="pl-5">
                    <a href={`/admin/posts/${p.slug}`} className="font-medium hover:text-primary hover:underline">
                      {p.title}
                    </a>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{p.category}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {p.tags.slice(0, 3).map((t) => `#${t}`).join(' ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{fmtDate(p.pubDate)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={p.draft ? 'warning' : 'success'}>{p.draft ? '草稿' : '已发布'}</Badge>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`操作 ${p.title}`}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => (window.location.href = `/admin/posts/${p.slug}`)}>
                          <Pencil />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleDraft(p)}>
                          <Upload className={p.draft ? 'text-emerald-500' : 'text-amber-500'} />
                          {p.draft ? '发布' : '转草稿'}
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">
                            <ExternalLink />
                            查看前台
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(p)}>
                          <Trash2 />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* 新建文章 */}
      <CreatePostDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={load} />

      {/* 删除确认 */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除?</AlertDialogTitle>
            <AlertDialogDescription>
              「{deleteTarget?.title}」将被永久删除,此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={doDelete}>
              <Trash2 />
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CreatePostDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: '随笔',
    pubDate: new Date().toISOString().slice(0, 10),
    tags: '',
    draft: true,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm((f) => ({ ...f, pubDate: new Date().toISOString().slice(0, 10), draft: true }))
    }
  }, [open])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const d = await api<{ post: { slug: string } }>('/admin/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          slug: form.slug.trim(),
          title: form.title.trim(),
          tags: form.tags
            .split(/[,，]/)
            .map((t) => t.trim())
            .filter(Boolean),
          body: '',
        }),
      })
      toast.success('已创建')
      onOpenChange(false)
      onCreated()
      window.location.href = `/admin/posts/${d.post.slug}`
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>写新文章</DialogTitle>
          <DialogDescription>填写基本信息,创建后进入编辑器。</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="np-title">标题 *</Label>
              <Input
                id="np-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="文章标题"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="np-slug">slug(URL 标识)*</Label>
              <Input
                id="np-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="my-new-post"
                pattern="[a-z0-9-]+"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="np-cat">分类</Label>
                <Input id="np-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="np-date">日期</Label>
                <Input
                  id="np-date"
                  type="date"
                  value={form.pubDate}
                  onChange={(e) => setForm({ ...form, pubDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="np-tags">标签(逗号分隔)</Label>
              <Input id="np-tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="furry, 随笔" />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.draft}
                onChange={(e) => setForm({ ...form, draft: e.target.checked })}
                className="size-4 accent-primary"
              />
              保存为草稿
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={submitting}>
              创建并编辑
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
