'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from './lib/api'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Switch } from './ui/switch'
import { Skeleton } from './ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'

interface PostDraft {
  slug: string
  title: string
  description?: string
  pubDate: string
  updatedDate?: string
  category: string
  tags: string[]
  draft: boolean
  featured: boolean
  body: string
}

export default function PostEditorPage({ slug, isNew }: { slug?: string; isNew: boolean }) {
  const [form, setForm] = useState<PostDraft>({
    slug: '',
    title: '',
    pubDate: new Date().toISOString().slice(0, 10),
    category: '随笔',
    tags: [],
    draft: true,
    featured: false,
    body: '',
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (isNew || !slug) return
    api<{ ok: boolean; draft: PostDraft }>(`/admin/api/posts/${slug}`)
      .then((d) => {
        setForm({ ...d.draft, tags: d.draft.tags })
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [slug, isNew])

  const set = <K extends keyof PostDraft>(key: K, value: PostDraft[K]) => setForm((f) => ({ ...f, [key]: value }))

  async function save() {
    setSaving(true)
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim(),
        tags: form.tags,
        description: form.description?.trim() || undefined,
      }
      const res = await api(isNew ? '/admin/api/posts' : `/admin/api/posts/${slug}`, {
        method: isNew ? 'POST' : 'PUT',
        body: JSON.stringify(payload),
      })
      toast.success('已保存')
      if (isNew) {
        const d = res as { post: { slug: string } }
        window.location.href = `/admin/posts/${d.post.slug}`
      }
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        save()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [form, isNew, slug])

  async function doDelete() {
    if (!slug) return
    try {
      await api(`/admin/api/posts/${slug}`, { method: 'DELETE' })
      toast.success('已删除')
      window.location.href = '/admin/posts'
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <a href="/admin/posts">
            <ArrowLeft />
            返回列表
          </a>
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Ctrl + S 保存</span>
          {!isNew && (
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 />
              删除
            </Button>
          )}
          <Button size="sm" onClick={save} disabled={saving}>
            <Save />
            {saving ? '保存中…' : '保存'}
          </Button>
        </div>
      </div>

      <Card className="gap-5 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="e-title">标题 *</Label>
            <Input id="e-title" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="文章标题" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="e-slug">slug *</Label>
            <Input
              id="e-slug"
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              pattern="[a-z0-9-]+"
              placeholder="my-post"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="e-category">分类</Label>
            <Input id="e-category" value={form.category} onChange={(e) => set('category', e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="e-date">发布日期</Label>
            <Input id="e-date" type="date" value={form.pubDate} onChange={(e) => set('pubDate', e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="e-updated">更新日期</Label>
            <Input
              id="e-updated"
              type="date"
              value={form.updatedDate ?? ''}
              onChange={(e) => set('updatedDate', e.target.value || undefined)}
            />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="e-tags">标签(逗号分隔)</Label>
            <Input
              id="e-tags"
              value={form.tags.join(', ')}
              onChange={(e) =>
                set(
                  'tags',
                  e.target.value
                    .split(/[,，]/)
                    .map((t) => t.trim())
                    .filter(Boolean)
                )
              }
              placeholder="furry, 随笔"
            />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="e-desc">摘要</Label>
            <Textarea id="e-desc" value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} rows={2} />
          </div>
          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.draft} onCheckedChange={(v) => set('draft', v)} />
              草稿(不发布)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.featured} onCheckedChange={(v) => set('featured', v)} />
              精选
            </label>
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="grid gap-1.5">
          <Label htmlFor="e-body">正文(Markdown)</Label>
          <Textarea
            id="e-body"
            value={form.body}
            onChange={(e) => set('body', e.target.value)}
            rows={22}
            className="font-mono text-[13px] leading-relaxed"
            placeholder="# 开始写作…"
          />
        </div>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除?</AlertDialogTitle>
            <AlertDialogDescription>「{form.title}」将被永久删除,此操作不可恢复。</AlertDialogDescription>
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
