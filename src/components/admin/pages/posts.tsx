'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ExternalLink,
  FilePlus2,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  Upload,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  X,
  Tag,
  FolderOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import { api, fmtDate } from '../lib/api'
import DocsManager from './docs-manager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'

interface PostRow {
  slug: string
  title: string
  description?: string
  category: string
  tags: string[]
  pubDate: string
  updatedDate?: string
  draft: boolean
  featured: boolean
}

interface PaginationInfo {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface MetaInfo {
  categories: { name: string; count: number }[]
  tags: { name: string; count: number }[]
}

type Filter = 'all' | 'published' | 'draft'
type SortBy = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'updated-desc'

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'date-desc', label: '最新发布' },
  { value: 'date-asc', label: '最早发布' },
  { value: 'updated-desc', label: '最近更新' },
  { value: 'title-asc', label: '标题 A-Z' },
  { value: 'title-desc', label: '标题 Z-A' },
]

export default function PostsPage() {
  const [posts, setPosts] = useState<PostRow[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({ total: 0, page: 1, pageSize: 20, totalPages: 1 })
  const [meta, setMeta] = useState<MetaInfo>({ categories: [], tags: [] })
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [tagFilter, setTagFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortBy>('date-desc')
  const [page, setPage] = useState(1)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PostRow | null>(null)
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false)
  const [batchPublish, setBatchPublish] = useState<'publish' | 'draft' | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search,
        status: filter,
        sortBy,
        page: String(page),
        pageSize: '20',
      })
      if (categoryFilter) params.set('category', categoryFilter)
      if (tagFilter) params.set('tag', tagFilter)

      const d = await api<{ posts: PostRow[]; pagination: PaginationInfo }>(
        `/admin/api/posts?${params}`
      )
      setPosts(d.posts)
      setPagination(d.pagination)
      setSelected(new Set())
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [search, filter, categoryFilter, tagFilter, sortBy, page])

  const loadMeta = useCallback(async () => {
    try {
      const d = await api<MetaInfo>('/admin/api/posts-meta')
      setMeta(d)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    loadMeta()
  }, [loadMeta])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, filter, categoryFilter, tagFilter, sortBy])

  const activeFilters = useMemo(() => {
    const f: string[] = []
    if (search) f.push(`搜索: ${search}`)
    if (categoryFilter) f.push(`分类: ${categoryFilter}`)
    if (tagFilter) f.push(`标签: #${tagFilter}`)
    if (filter !== 'all') f.push(filter === 'draft' ? '草稿' : '已发布')
    return f
  }, [search, categoryFilter, tagFilter, filter])

  function clearFilters() {
    setSearch('')
    setCategoryFilter('')
    setTagFilter('')
    setFilter('all')
  }

  function toggleSelect(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === posts.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(posts.map((p) => p.slug)))
    }
  }

  async function toggleDraft(p: PostRow) {
    try {
      await api(`/admin/api/posts/${p.slug}`, {
        method: 'PUT',
        body: JSON.stringify({ draft: !p.draft }),
      })
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

  async function doBatchDelete() {
    try {
      await api('/admin/api/posts', {
        method: 'PATCH',
        body: JSON.stringify({ action: 'delete', slugs: Array.from(selected) }),
      })
      toast.success(`已删除 ${selected.size} 篇文章`)
      setBatchDeleteOpen(false)
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function doBatchPublish() {
    if (!batchPublish) return
    const isDraft = batchPublish === 'draft'
    try {
      await api('/admin/api/posts', {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'update',
          slugs: Array.from(selected),
          draft: isDraft,
        }),
      })
      toast.success(`已${isDraft ? '转为草稿' : '发布'} ${selected.size} 篇文章`)
      setBatchPublish(null)
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const allSelected = selected.size === posts.length && posts.length > 0
  const someSelected = selected.size > 0 && !allSelected

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <Tabs defaultValue="articles">
        <TabsList className="grid w-64 grid-cols-2">
          <TabsTrigger value="articles">文章</TabsTrigger>
          <TabsTrigger value="docs">文档库</TabsTrigger>
        </TabsList>
        <TabsContent value="docs" className="mt-4">
          <DocsManager />
        </TabsContent>
        <TabsContent value="articles" className="mt-4">
          {/* 工具栏 */}
          <Card className="gap-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
              <div className="flex flex-wrap items-center gap-2">
                {/* 搜索框 */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索文章标题、标签..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 w-60 pl-8 pr-8"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                {/* 筛选状态 */}
                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {activeFilters.map((f, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {f}
                        <button
                          onClick={() => {
                            if (f.startsWith('搜索:')) setSearch('')
                            else if (f.startsWith('分类:')) setCategoryFilter('')
                            else if (f.startsWith('标签:')) setTagFilter('')
                            else if (f === '草稿' || f === '已发布') setFilter('all')
                          }}
                          className="hover:text-foreground"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      清空筛选
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* 排序 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown />
                      排序
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {SORT_OPTIONS.map((opt) => (
                      <DropdownMenuItem
                        key={opt.value}
                        onClick={() => setSortBy(opt.value)}
                        className={sortBy === opt.value ? 'bg-accent' : ''}
                      >
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 筛选 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setFiltersOpen(!filtersOpen)}>
                      <Filter />
                      筛选
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <div className="p-2">
                      <Label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium">
                        <FolderOpen className="size-3.5" />
                        分类
                      </Label>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">全部分类</option>
                        {meta.categories.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name} ({c.count})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="p-2">
                      <Label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium">
                        <Tag className="size-3.5" />
                        标签
                      </Label>
                      <select
                        value={tagFilter}
                        onChange={(e) => setTagFilter(e.target.value)}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">全部标签</option>
                        {meta.tags.map((t) => (
                          <option key={t.name} value={t.name}>
                            #{t.name} ({t.count})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="border-t p-2">
                      <Label className="mb-1.5 text-xs font-medium">状态</Label>
                      <div className="flex gap-1">
                        {(['all', 'published', 'draft'] as const).map((f) => (
                          <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 rounded-md px-2 py-1.5 text-xs transition-colors ${
                              filter === f ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
                            }`}
                          >
                            {f === 'all' ? '全部' : f === 'draft' ? '草稿' : '已发布'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button onClick={() => setCreateOpen(true)}>
                  <FilePlus2 />
                  写新文章
                </Button>
              </div>
            </div>

            {/* 批量操作栏 */}
            {selected.size > 0 && (
              <div className="flex items-center justify-between border-b bg-accent/50 px-5 py-2">
                <span className="text-sm text-muted-foreground">
                  已选择 <span className="font-medium text-foreground">{selected.size}</span> 篇文章
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBatchPublish('publish')}
                  >
                    <Upload className="text-emerald-500" />
                    批量发布
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBatchPublish('draft')}
                  >
                    转草稿
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setBatchDeleteOpen(true)}
                  >
                    <Trash2 />
                    批量删除
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                    取消选择
                  </Button>
                </div>
              </div>
            )}

            {/* 文章列表 */}
            {loading ? (
              <div className="p-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="mb-2 h-12" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-14 text-center">
                <p className="text-sm text-muted-foreground">没有匹配的文章</p>
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <FilePlus2 />
                  写新文章
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-10 pl-5">
                        <Checkbox
                          checked={allSelected}
                          data-state={someSelected ? 'indeterminate' : allSelected ? 'checked' : 'unchecked'}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>标题</TableHead>
                      <TableHead className="hidden md:table-cell">分类</TableHead>
                      <TableHead className="hidden sm:table-cell">标签</TableHead>
                      <TableHead className="hidden lg:table-cell">日期</TableHead>
                      <TableHead className="hidden sm:table-cell">状态</TableHead>
                      <TableHead className="pr-5 text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((p) => (
                      <TableRow key={p.slug} className={selected.has(p.slug) ? 'bg-accent/30' : ''}>
                        <TableCell className="pl-5">
                          <Checkbox
                            checked={selected.has(p.slug)}
                            onCheckedChange={() => toggleSelect(p.slug)}
                          />
                        </TableCell>
                        <TableCell>
                          <a
                            href={`/admin/posts/${p.slug}`}
                            className="font-medium hover:text-primary hover:underline"
                          >
                            {p.title}
                          </a>
                          {p.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            {p.category}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {p.tags.slice(0, 3).map((t) => (
                              <Badge key={t} variant="secondary" className="text-xs">
                                #{t}
                              </Badge>
                            ))}
                            {p.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{p.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {fmtDate(p.pubDate)}
                          {p.updatedDate && p.updatedDate !== p.pubDate && (
                            <span className="ml-1 text-xs text-muted-foreground">(更新于 {fmtDate(p.updatedDate)})</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1">
                            <Badge variant={p.draft ? 'warning' : 'success'}>
                              {p.draft ? '草稿' : '已发布'}
                            </Badge>
                            {p.featured && (
                              <Badge variant="outline" className="border-amber-500 text-amber-500">
                                精选
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="pr-5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label={`操作 ${p.title}`}>
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => (window.location.href = `/admin/posts/${p.slug}`)}
                              >
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
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteTarget(p)}
                              >
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

                {/* 分页 */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t px-5 py-3">
                    <span className="text-sm text-muted-foreground">
                      共 {pagination.total} 篇 · 第 {pagination.page} / {pagination.totalPages} 页
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page <= 1}
                        onClick={() => setPage(pagination.page - 1)}
                      >
                        <ChevronLeft />
                        上一页
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => setPage(pagination.page + 1)}
                      >
                        下一页
                        <ChevronRight />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* 新建文章 */}
          <CreatePostDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={load} />

          {/* 单篇删除确认 */}
          <AlertDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除?</AlertDialogTitle>
                <AlertDialogDescription>
                  「{deleteTarget?.title}」将被永久删除,此操作不可恢复。
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

          {/* 批量删除确认 */}
          <AlertDialog
            open={batchDeleteOpen}
            onOpenChange={setBatchDeleteOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认批量删除?</AlertDialogTitle>
                <AlertDialogDescription>
                  将删除 <strong>{selected.size}</strong> 篇文章,此操作不可恢复。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-white hover:bg-destructive/90"
                  onClick={doBatchDelete}
                >
                  <Trash2 />
                  批量删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* 批量发布/转草稿确认 */}
          <AlertDialog
            open={batchPublish !== null}
            onOpenChange={(open) => !open && setBatchPublish(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  确认{batchPublish === 'publish' ? '批量发布' : '批量转草稿'}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  将对 <strong>{selected.size}</strong> 篇文章执行此操作。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={doBatchPublish}>
                  确认
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>
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
                <Input
                  id="np-cat"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
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
              <Input
                id="np-tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="furry, 随笔"
              />
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
