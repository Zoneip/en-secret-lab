'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
  Trash2,
  FileText,
  Clock,
  Type,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../lib/api'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { Skeleton } from '../ui/skeleton'
import { Badge } from '../ui/badge'
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

interface PostDraft {
  slug: string
  title: string
  description?: string
  pubDate: string
  updatedDate?: string
  category: string
  series?: string
  tags: string[]
  draft: boolean
  featured: boolean
  body: string
}

interface RenderedPreview {
  html: string
  wordCount: number
  readingTime: number
}

const AUTO_SAVE_KEY = 'post-editor-autosave'
const AUTO_SAVE_DELAY = 2000

export default function PostEditorPage({
  slug,
  isNew,
}: {
  slug?: string
  isNew: boolean
}) {
  const [form, setForm] = useState<PostDraft>({
    slug: '',
    title: '',
    pubDate: new Date().toISOString().slice(0, 10),
    category: '随笔',
    series: '',
    tags: [],
    draft: true,
    featured: false,
    body: '',
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [previewMode, setPreviewMode] = useState<'split' | 'preview' | 'edit'>(
    'split',
  )
  const [preview, setPreview] = useState<RenderedPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null)
  const [showAutoSaveIndicator, setShowAutoSaveIndicator] = useState(false)
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)

  // 加载文章
  useEffect(() => {
    if (isNew || !slug) {
      // 尝试恢复自动保存
      const saved = localStorage.getItem(AUTO_SAVE_KEY)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          if (isNew && data.form) {
            setForm(data.form)
            toast.info('已恢复上次未保存的内容')
          }
        } catch {
          /* ignore */
        }
      }
      setLoading(false)
      return
    }
    api<{ ok: boolean; draft: PostDraft }>(`/admin/api/posts/${slug}`)
      .then((d) => {
        setForm({ ...d.draft, tags: d.draft.tags })
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [slug, isNew])

  // Markdown 预览
  const renderPreview = useCallback(async (markdown: string) => {
    if (!markdown.trim()) {
      setPreview({ html: '', wordCount: 0, readingTime: 1 })
      return
    }
    setPreviewLoading(true)
    try {
      const d = await api<{
        html: string
        wordCount: number
        readingTime: number
      }>('/admin/api/render-markdown', {
        method: 'POST',
        body: JSON.stringify({ markdown }),
      })
      setPreview(d)
    } catch {
      /* ignore */
    } finally {
      setPreviewLoading(false)
    }
  }, [])

  // 预览节流
  useEffect(() => {
    if (previewMode === 'edit') return
    const timer = setTimeout(() => {
      renderPreview(form.body)
    }, 300)
    return () => clearTimeout(timer)
  }, [form.body, previewMode, renderPreview])

  // 自动保存到 localStorage
  useEffect(() => {
    if (isNew || !form.slug) return

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(
          AUTO_SAVE_KEY,
          JSON.stringify({
            form,
            savedAt: new Date().toISOString(),
          }),
        )
        setLastAutoSave(new Date())
        setShowAutoSaveIndicator(true)
        setTimeout(() => setShowAutoSaveIndicator(false), 2000)
      } catch {
        /* ignore */
      }
    }, AUTO_SAVE_DELAY)

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [form, isNew])

  const set = <K extends keyof PostDraft>(key: K, value: PostDraft[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

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
      const res = await api(
        isNew ? '/admin/api/posts' : `/admin/api/posts/${slug}`,
        {
          method: isNew ? 'POST' : 'PUT',
          body: JSON.stringify(payload),
        },
      )
      toast.success('已保存')
      // 清除自动保存
      localStorage.removeItem(AUTO_SAVE_KEY)
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

  // 统计信息
  const wordCount = form.body.trim() ? form.body.trim().split(/\s+/).length : 0
  const readingTime = Math.max(1, Math.round(wordCount / 200))

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
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      {/* 顶部工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <a href="/admin/posts">
            <ArrowLeft />
            返回列表
          </a>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          {/* 自动保存指示器 */}
          {showAutoSaveIndicator && lastAutoSave && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <RefreshCw className="size-3 animate-spin" />
              已自动保存 {lastAutoSave.toLocaleTimeString('zh-CN')}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">Ctrl + S 保存</span>

          {/* 预览模式切换 */}
          <div className="flex items-center gap-1 rounded-md border px-1 py-0.5">
            <button
              onClick={() => setPreviewMode('edit')}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                previewMode === 'edit'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <EyeOff className="size-3" />
              编辑
            </button>
            <button
              onClick={() => setPreviewMode('split')}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                previewMode === 'split'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <Eye className="size-3" />
              分屏
            </button>
            <button
              onClick={() => setPreviewMode('preview')}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                previewMode === 'preview'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              <FileText className="size-3" />
              预览
            </button>
          </div>

          {!isNew && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
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

      {/* 元数据表单 */}
      <Card className="gap-5 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="e-title">标题 *</Label>
            <Input
              id="e-title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="文章标题"
            />
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
            <Input
              id="e-category"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="e-date">发布日期</Label>
            <Input
              id="e-date"
              type="date"
              value={form.pubDate}
              onChange={(e) => set('pubDate', e.target.value)}
            />
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
            <Label htmlFor="e-series">
              系列(可选,同系列自动成组便于连续阅读)
            </Label>
            <Input
              id="e-series"
              value={form.series ?? ''}
              onChange={(e) => set('series', e.target.value || undefined)}
              placeholder="如:主题系统"
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
                    .filter(Boolean),
                )
              }
              placeholder="furry, 随笔"
            />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="e-desc">摘要</Label>
            <Textarea
              id="e-desc"
              value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.draft}
                onCheckedChange={(v) => set('draft', v)}
              />
              草稿(不发布)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.featured}
                onCheckedChange={(v) => set('featured', v)}
              />
              精选
            </label>
          </div>
        </div>
      </Card>

      {/* 编辑器主体 */}
      <Card className="p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <Label htmlFor="e-body" className="flex items-center gap-1.5">
            正文(Markdown)
          </Label>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Type className="size-3" />
              {preview?.wordCount ?? wordCount} 字
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />约{' '}
              {preview?.readingTime ?? readingTime} 分钟阅读
            </span>
          </div>
        </div>

        <div
          className={`grid gap-4 ${previewMode === 'split' ? 'lg:grid-cols-2' : ''}`}
        >
          {/* 编辑区 */}
          {previewMode !== 'preview' && (
            <div>
              <Textarea
                id="e-body"
                value={form.body}
                onChange={(e) => set('body', e.target.value)}
                rows={22}
                className="min-h-[400px] font-mono text-[13px] leading-relaxed"
                placeholder="# 开始写作…"
              />
            </div>
          )}

          {/* 预览区 */}
          {previewMode !== 'edit' && (
            <div className="min-h-[400px] rounded-md border bg-muted/30">
              <div className="border-b bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
                预览效果
              </div>
              <div className="p-4">
                {previewLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : preview?.html ? (
                  <div
                    className="prose prose-sm prose-slate max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-lg prose-h2:text-base prose-a:text-primary"
                    dangerouslySetInnerHTML={{ __html: preview.html }}
                  />
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    开始输入 Markdown 内容以查看预览
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 删除确认 */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除?</AlertDialogTitle>
            <AlertDialogDescription>
              「{form.title}」将被永久删除,此操作不可恢复。
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
