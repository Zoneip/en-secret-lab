'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FileText,
  FilePlus,
  Folder,
  FolderOpen,
  FolderPlus,
  Pencil,
  Save,
  Trash2,
  Eye,
  EyeOff,
  FileEdit,
  Clock,
  Type,
  Search,
  X,
  Upload,
  FolderUp,
  Send,
} from 'lucide-react'
import { Tree, type NodeRendererProps } from 'react-arborist'
import { toast } from 'sonner'
import { api } from '../lib/api'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Skeleton } from '../ui/skeleton'
import { Badge } from '../ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import PostMetaForm, { type PostMetaValues } from './post-meta-form'
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

interface DocNode {
  id: string
  name: string
  type: 'file' | 'dir'
  path: string
  size?: number
  children?: DocNode[]
}

interface TreeData {
  id: string
  name: string
  type: 'file' | 'dir'
  path: string
  children?: TreeData[]
}

interface RenderedPreview {
  html: string
  wordCount: number
  readingTime: number
}

type PreviewMode = 'edit' | 'split' | 'preview'

// 文档库不再限制文件扩展名,由用户自行决定文件用途

function isMarkdown(path: string): boolean {
  return /\.(md|mdx)$/i.test(path)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function toTreeData(nodes: DocNode[]): TreeData[] {
  return nodes.map((n) => ({
    id: n.id,
    name: n.name,
    type: n.type,
    path: n.path,
    children: n.children ? toTreeData(n.children) : undefined,
  }))
}

function NodeRow({ node, style, dragHandle }: NodeRendererProps<TreeData>) {
  const isDir = node.data.type === 'dir'
  return (
    <div
      style={style}
      ref={dragHandle}
      className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm ${
        node.isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
      }`}
      onClick={() => (node.isInternal ? node.toggle() : node.select())}
    >
      {isDir ? (
        node.isOpen ? (
          <FolderOpen className="size-4 shrink-0 text-primary" />
        ) : (
          <Folder className="size-4 shrink-0 text-primary" />
        )
      ) : (
        <FileText className="size-4 shrink-0 text-muted-foreground" />
      )}
      <span className="truncate">{node.data.name}</span>
    </div>
  )
}

interface DocsManagerProps {
  onDocPublished?: () => void
}

export default function DocsManager({ onDocPublished }: DocsManagerProps) {
  const [tree, setTree] = useState<TreeData[] | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [doc, setDoc] = useState<{ name: string; content: string } | null>(null)
  const [dirty, setDirty] = useState(false)
  const [creating, setCreating] = useState<'file' | 'dir' | null>(null)
  const [createParent, setCreateParent] = useState('')
  const [createName, setCreateName] = useState('')
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<TreeData | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('split')
  const [preview, setPreview] = useState<RenderedPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishDraft, setPublishDraft] = useState<PostMetaValues | null>(null)
  const [selectedPaths, setSelectedPaths] = useState<string[]>([])
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const folderInputRef = useRef<HTMLInputElement | null>(null)

  const load = useCallback(async () => {
    try {
      const d = await api<{ tree: DocNode[] }>('/admin/api/docs?action=tree')
      setTree(toTreeData(d.tree))
    } catch (e) {
      toast.error((e as Error).message)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openDoc = useCallback(async (path: string) => {
    try {
      const d = await api<{ name: string; content: string }>(
        `/admin/api/docs?action=read&path=${encodeURIComponent(path)}`,
      )
      setDoc(d)
      setSelectedPath(path)
      setDirty(false)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }, [])

  const renderPreview = useCallback(async (path: string, content: string) => {
    if (!content.trim()) {
      setPreview({ html: '', wordCount: 0, readingTime: 1 })
      return
    }
    setPreviewLoading(true)
    try {
      if (isMarkdown(path)) {
        const d = await api<{
          html: string
          wordCount: number
          readingTime: number
        }>('/admin/api/render-markdown', {
          method: 'POST',
          body: JSON.stringify({ markdown: content }),
        })
        setPreview(d)
      } else {
        const wordCount = content.split(/\s+/).filter(Boolean).length
        const readingTime = Math.max(1, Math.ceil(wordCount / 300))
        // 直出文本并做 HTML 转义,避免意外执行
        const html = `<pre class="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed">${escapeHtml(content)}</pre>`
        setPreview({ html, wordCount, readingTime })
      }
    } catch {
      /* ignore */
    } finally {
      setPreviewLoading(false)
    }
  }, [])

  useEffect(() => {
    if (previewMode === 'edit' || !doc?.content || !selectedPath) return
    const timer = setTimeout(() => {
      renderPreview(selectedPath, doc.content)
    }, 300)
    return () => clearTimeout(timer)
  }, [doc?.content, previewMode, selectedPath, renderPreview])

  async function save() {
    if (!selectedPath || !doc) return
    setSaving(true)
    try {
      await api('/admin/api/docs', {
        method: 'POST',
        body: JSON.stringify({
          action: 'write',
          path: selectedPath,
          content: doc.content,
        }),
      })
      setDirty(false)
      toast.success('已保存')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        save()
      }
      if (e.key === 'Escape') {
        if (creating) {
          setCreating(null)
          setCreateName('')
        }
        if (renaming) {
          setRenaming(null)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedPath, doc, creating, renaming])

  async function create() {
    if (!createName) return
    try {
      await api('/admin/api/docs', {
        method: 'POST',
        body: JSON.stringify({
          action: 'create',
          parent: createParent,
          name: createName,
          type: creating,
        }),
      })
      setCreating(null)
      setCreateName('')
      toast.success(creating === 'dir' ? '文件夹已创建' : '文件已创建')
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function doRename() {
    if (!renaming || !renameValue) return
    try {
      await api('/admin/api/docs', {
        method: 'PUT',
        body: JSON.stringify({
          action: 'rename',
          path: renaming,
          name: renameValue,
        }),
      })
      setRenaming(null)
      toast.success('已重命名')
      await load()
      if (selectedPath === renaming) {
        const newPath =
          renaming.substring(0, renaming.lastIndexOf('/')) + '/' + renameValue
        if (renaming.substring(0, renaming.lastIndexOf('/')) === '') {
          await openDoc(renameValue)
        } else {
          await openDoc(newPath)
        }
      }
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function doDelete() {
    if (!deleteTarget) return
    try {
      await api(
        `/admin/api/docs?path=${encodeURIComponent(deleteTarget.path)}`,
        { method: 'DELETE' },
      )
      toast.success('已删除')
      setDeleteTarget(null)
      if (selectedPath === deleteTarget.path) {
        setSelectedPath(null)
        setDoc(null)
      }
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function doBatchDelete() {
    if (selectedPaths.length === 0) return
    try {
      const d = await api<{ deleted: string[]; missing: string[] }>(
        '/admin/api/docs',
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'delete-batch',
            paths: selectedPaths,
          }),
        },
      )
      if (d.deleted.length) toast.success(`已删除 ${d.deleted.length} 个项目`)
      if (d.missing.length)
        toast.warning(`${d.missing.length} 个项目不存在或已删除`)
      setBatchDeleteOpen(false)
      setSelectedPaths([])
      if (selectedPath && d.deleted.includes(selectedPath)) {
        setSelectedPath(null)
        setDoc(null)
      }
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  function updateContent(newContent: string) {
    if (!doc) return
    setDoc({ ...doc, content: newContent })
    setDirty(true)
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    const form = new FormData()
    for (const file of Array.from(files)) {
      const relativePath =
        (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
        file.name
      form.append('files', file, relativePath)
    }
    try {
      const d = await fetch('/admin/api/docs-upload', {
        method: 'POST',
        body: form,
      }).then(async (r) => {
        const j = await r.json().catch(() => ({ error: '上传失败' }))
        if (!r.ok) throw new Error(j.error || `上传失败 ${r.status}`)
        return j as { created: string[]; skipped: string[] }
      })
      if (d.created.length) toast.success(`已上传 ${d.created.length} 个文件`)
      if (d.skipped.length)
        toast.warning(`跳过 ${d.skipped.length} 个不合规文件`)
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function openPublishDialog() {
    if (!selectedPath) return
    setPublishing(true)
    try {
      const d = await api<{ draft: PostMetaValues }>(
        `/admin/api/posts/preview-from-doc?path=${encodeURIComponent(selectedPath)}`,
      )
      setPublishDraft(d.draft)
      setPublishOpen(true)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setPublishing(false)
    }
  }

  async function submitPublish(form: PostMetaValues) {
    if (!selectedPath) return
    setPublishing(true)
    try {
      await api('/admin/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          sourceDocPath: selectedPath,
          title: form.title.trim(),
          slug: form.slug.trim(),
          category: form.category,
          pubDate: form.pubDate,
          tags: form.tags
            .split(/[,，]/)
            .map((t) => t.trim())
            .filter(Boolean),
          description: form.description,
          draft: form.draft,
          featured: form.featured,
        }),
      })
      toast.success('已发布为文章')
      setPublishOpen(false)
      onDocPublished?.()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setPublishing(false)
    }
  }

  const canPublish = !!selectedPath

  // 过滤树节点
  const filteredTree = useCallback(
    (nodes: TreeData[]): TreeData[] => {
      if (!searchTerm) return nodes
      const kw = searchTerm.toLowerCase()
      return nodes
        .map((n) => {
          if (n.type === 'dir' && n.children) {
            const filtered = filteredTree(n.children)
            if (filtered.length > 0 || n.name.toLowerCase().includes(kw)) {
              return { ...n, children: filtered }
            }
            return null
          }
          if (n.name.toLowerCase().includes(kw)) {
            return n
          }
          return null
        })
        .filter(Boolean) as TreeData[]
    },
    [searchTerm],
  )

  const displayTree = tree ? filteredTree(tree) : null

  const wordCount = doc?.content.trim()
    ? doc.content.trim().split(/\s+/).length
    : 0
  const readingTime = Math.max(1, Math.round(wordCount / 200))

  return (
    <div className="flex h-[calc(100vh-280px)] min-h-[500px] gap-4">
      {/* 文件树 */}
      <Card className="flex w-64 shrink-0 flex-col gap-2 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">文档库</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              title="上传文件"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              title="上传文件夹"
              onClick={() => folderInputRef.current?.click()}
            >
              <FolderUp className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              title="新建文件"
              onClick={() => {
                setCreating('file')
                setCreateParent(
                  selectedPath?.includes('/')
                    ? selectedPath.substring(0, selectedPath.lastIndexOf('/'))
                    : '',
                )
                setCreateName('')
                setSearchTerm('')
              }}
            >
              <FilePlus />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              title="新建文件夹"
              onClick={() => {
                setCreating('dir')
                setCreateParent(
                  selectedPath?.includes('/')
                    ? selectedPath.substring(0, selectedPath.lastIndexOf('/'))
                    : '',
                )
                setCreateName('')
                setSearchTerm('')
              }}
            >
              <FolderPlus />
            </Button>
            {selectedPaths.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-destructive hover:text-destructive"
                title="批量删除"
                onClick={() => setBatchDeleteOpen(true)}
              >
                <Trash2 className="size-3.5" />
                删除 {selectedPaths.length}
              </Button>
            )}
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索文档..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-7 pl-7 pr-6 text-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {creating && (
          <div className="flex items-center gap-1.5">
            <Input
              autoFocus
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder={creating === 'dir' ? '文件夹名' : '文件名.md'}
              className="h-7 flex-1 text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter') create()
                if (e.key === 'Escape') {
                  setCreating(null)
                  setCreateName('')
                }
              }}
            />
            <Button
              size="icon"
              variant="secondary"
              className="size-7 shrink-0"
              title="确认"
              onClick={create}
            >
              <Save className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 shrink-0"
              title="取消"
              onClick={() => {
                setCreating(null)
                setCreateName('')
              }}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-auto">
          {!tree ? (
            <Skeleton className="h-full" />
          ) : displayTree!.length === 0 ? (
            <p className="p-4 text-center text-xs text-muted-foreground">
              {searchTerm ? '没有匹配的文档' : '文档库为空,点右上角新建'}
            </p>
          ) : (
            <Tree<TreeData>
              data={displayTree!}
              openByDefault
              rowHeight={28}
              indent={12}
              onSelect={(nodes) => {
                const paths = nodes.map((n) => n.data.path)
                setSelectedPaths(paths)
                const n = nodes[0]
                if (n?.data.type === 'file')
                  openDoc(n.data.path).catch((e) => toast.error(e.message))
              }}
              onMove={async ({ dragIds, parentId }) => {
                const parent = tree ? findNode(tree, parentId ?? '') : null
                const toDir = parent && parent.type === 'dir' ? parent.path : ''
                for (const id of dragIds) {
                  const src = findNode(tree ?? [], id)
                  if (src) {
                    try {
                      await api('/admin/api/docs', {
                        method: 'PUT',
                        body: JSON.stringify({
                          action: 'move',
                          path: src.path,
                          toDir,
                        }),
                      })
                    } catch (e) {
                      toast.error((e as Error).message)
                    }
                  }
                }
                await load()
              }}
            >
              {(props) => <NodeRow {...props} />}
            </Tree>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => {
            handleUpload(e.target.files)
            e.target.value = ''
          }}
        />
        <input
          ref={folderInputRef}
          type="file"
          {...({ webkitdirectory: 'true', directory: 'true' } as Record<
            string,
            string
          >)}
          className="sr-only"
          onChange={(e) => {
            handleUpload(e.target.files)
            e.target.value = ''
          }}
        />
      </Card>

      {/* 编辑器 */}
      <Card className="flex min-w-0 flex-1 flex-col p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {selectedPath && doc ? (
              <>
                <span className="truncate text-sm font-medium">{doc.name}</span>
                {dirty && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-amber-500 text-amber-600 text-[10px]"
                  >
                    <span className="size-1.5 rounded-full bg-amber-500"></span>
                    未保存
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-sm text-muted-foreground">未选择文档</span>
            )}
          </div>

          {selectedPath && doc && (
            <div className="flex shrink-0 items-center gap-2">
              {/* 预览模式切换 */}
              <div className="flex items-center gap-0.5 rounded-md border px-1 py-0.5">
                <button
                  onClick={() => setPreviewMode('edit')}
                  className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
                    previewMode === 'edit'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="仅编辑"
                >
                  <EyeOff className="size-3" />
                </button>
                <button
                  onClick={() => setPreviewMode('split')}
                  className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
                    previewMode === 'split'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="分屏预览"
                >
                  <Eye className="size-3" />
                </button>
                <button
                  onClick={() => setPreviewMode('preview')}
                  className={`rounded px-1.5 py-0.5 text-xs transition-colors ${
                    previewMode === 'preview'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="仅预览"
                >
                  <FileEdit className="size-3" />
                </button>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Type className="size-3" />
                {preview?.wordCount ?? wordCount} 字
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />约{' '}
                {preview?.readingTime ?? readingTime} 分钟
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                title="重命名"
                onClick={() => {
                  setRenaming(selectedPath)
                  setRenameValue(doc.name)
                }}
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-destructive"
                title="删除"
                onClick={() =>
                  setDeleteTarget({
                    id: selectedPath,
                    name: doc.name,
                    type: 'file',
                    path: selectedPath,
                  })
                }
              >
                <Trash2 />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={!canPublish || publishing}
                onClick={openPublishDialog}
                title="发布为文章"
              >
                <Send className="size-3.5" />
                发布
              </Button>
              <Button
                size="sm"
                onClick={save}
                disabled={!selectedPath || !dirty || saving}
              >
                <Save />
                {saving ? '保存中…' : '保存'}
              </Button>
            </div>
          )}
        </div>

        {renaming && (
          <div className="mb-2 flex items-center gap-1.5">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="h-7 flex-1 text-xs"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') doRename()
                if (e.key === 'Escape') setRenaming(null)
              }}
            />
            <Button
              size="icon"
              variant="secondary"
              className="size-7 shrink-0"
              title="确认"
              onClick={doRename}
            >
              <Save className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 shrink-0"
              title="取消"
              onClick={() => setRenaming(null)}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        )}

        {/* 编辑区/预览区 */}
        {!selectedPath || !doc ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <FileText className="mx-auto mb-2 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                从左侧选择一个文档,或创建新文档
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`grid min-h-0 flex-1 gap-2 ${previewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}
          >
            {/* 编辑区 */}
            {previewMode !== 'preview' && (
              <div className="min-h-0 overflow-hidden rounded-lg border">
                <Textarea
                  value={doc.content}
                  onChange={(e) => updateContent(e.target.value)}
                  className="h-full min-h-[400px] resize-none border-0 font-mono text-[13px] leading-relaxed focus-visible:ring-0"
                  placeholder="# 开始写作..."
                />
              </div>
            )}

            {/* 预览区 */}
            {previewMode !== 'edit' && (
              <div className="min-h-0 overflow-auto rounded-lg border bg-muted/30">
                <div className="border-b bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
                  预览效果
                </div>
                <div className="p-3">
                  {previewLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
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
        )}
      </Card>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除「{deleteTarget?.name}」?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'dir'
                ? '整个文件夹及其内容将被删除。'
                : '文件将被永久删除。'}
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

      <AlertDialog
        open={batchDeleteOpen}
        onOpenChange={(o) => !o && setBatchDeleteOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              批量删除 {selectedPaths.length} 个项目?
            </AlertDialogTitle>
            <AlertDialogDescription>
              选中的文件/文件夹将被永久删除，包含文件夹下的所有内容。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBatchDeleteOpen(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={doBatchDelete}
            >
              <Trash2 />
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>发布为文章</DialogTitle>
            <DialogDescription>
              把当前文档发布到文章区，原文档仍保留在文档库。
            </DialogDescription>
          </DialogHeader>
          {publishDraft && (
            <PostMetaForm
              defaultValues={publishDraft}
              submitLabel={publishing ? '发布中…' : '发布'}
              onSubmit={submitPublish}
              onCancel={() => setPublishOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function findNode(nodes: TreeData[], id: string): TreeData | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const found = findNode(n.children, id)
      if (found) return found
    }
  }
  return null
}
