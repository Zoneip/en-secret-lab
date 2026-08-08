'use client'

import { useState, useEffect } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { Button } from '../ui/button'

export interface PostMetaValues {
  title: string
  slug: string
  category: string
  pubDate: string
  tags: string
  description: string
  draft: boolean
  featured: boolean
}

interface PostMetaFormProps {
  defaultValues: PostMetaValues
  submitLabel: string
  onSubmit: (values: PostMetaValues) => void
  onCancel: () => void
}

export default function PostMetaForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
}: PostMetaFormProps) {
  const [form, setForm] = useState<PostMetaValues>(defaultValues)

  useEffect(() => {
    setForm(defaultValues)
  }, [defaultValues])

  const set = <K extends keyof PostMetaValues>(
    key: K,
    value: PostMetaValues[K],
  ) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(form)
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="pm-title">标题 *</Label>
          <Input
            id="pm-title"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="文章标题"
            required
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="pm-slug">slug(URL 标识) *</Label>
          <Input
            id="pm-slug"
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="my-new-post"
            pattern="[a-z0-9-]+"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="pm-cat">分类</Label>
            <Input
              id="pm-cat"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pm-date">发布日期</Label>
            <Input
              id="pm-date"
              type="date"
              value={form.pubDate}
              onChange={(e) => set('pubDate', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="pm-tags">标签（逗号分隔）</Label>
          <Input
            id="pm-tags"
            value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
            placeholder="furry, 随笔"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="pm-desc">摘要</Label>
          <Textarea
            id="pm-desc"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            placeholder="选填，用于列表展示"
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={form.draft}
              onCheckedChange={(v) => set('draft', v)}
            />
            保存为草稿
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

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
