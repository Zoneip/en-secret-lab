'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { FileText, FilePlus, Folder, FolderOpen, FolderPlus, Pencil, Save, Trash2 } from 'lucide-react'
import { Tree, type NodeRendererProps } from 'react-arborist'
import { toast } from 'sonner'
import { api } from '../lib/api'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Skeleton } from '../ui/skeleton'
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
import Editor from '@toast-ui/editor'

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
      className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm ${
        node.isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
      }`}
      onClick={() => node.isInternal ? node.toggle() : node.select()}
    >
      {isDir ? (
        node.isOpen ? <FolderOpen className="size-4 text-primary" /> : <Folder className="size-4 text-primary" />
      ) : (
        <FileText className="size-4 text-muted-foreground" />
      )}
      <span className="truncate">{node.data.name}</span>
    </div>
  )
}

export default function DocsManager() {
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
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstance = useRef<Editor | null>(null)

  const load = useCallback(async () => {
    const d = await api<{ tree: DocNode[] }>('/admin/api/docs?action=tree')
    setTree(toTreeData(d.tree))
  }, [])

  useEffect(() => {
    load().catch((e) => toast.error(e.message))
  }, [load])

  const openDoc = useCallback(async (path: string) => {
    const d = await api<{ name: string; content: string }>(`/admin/api/docs?action=read&path=${encodeURIComponent(path)}`)
    setDoc(d)
    setSelectedPath(path)
    setDirty(false)
    if (editorInstance.current) {
      editorInstance.current.setMarkdown(d.content)
    }
  }, [])

  // TOAST UI 编辑器挂载
  useEffect(() => {
    if (!editorRef.current || editorInstance.current) return
    const ed = new Editor({
      el: editorRef.current,
      initialValue: '',
      previewStyle: 'vertical',
      height: '100%',
      initialEditType: 'wysiwyg',
      language: 'zh-CN',
      hideModeSwitch: false,
    })
    editorInstance.current = ed
    ed.on('change', () => setDirty(true))
    return () => {
      ed.destroy()
      editorInstance.current = null
    }
  }, [])

  async function save() {
    if (!selectedPath || !editorInstance.current) return
    setSaving(true)
    try {
      const content = editorInstance.current.getMarkdown()
      await api('/admin/api/docs', { method: 'POST', body: JSON.stringify({ action: 'write', path: selectedPath, content }) })
      setDirty(false)
      toast.success('已保存')
      await load()
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
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  async function create() {
    if (!createName) return
    try {
      await api('/admin/api/docs', {
        method: 'POST',
        body: JSON.stringify({ action: 'create', parent: createParent, name: createName, type: creating }),
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
      await api('/admin/api/docs', { method: 'PUT', body: JSON.stringify({ action: 'rename', path: renaming, name: renameValue }) })
      setRenaming(null)
      toast.success('已重命名')
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function doDelete() {
    if (!deleteTarget) return
    try {
      await api(`/admin/api/docs?path=${encodeURIComponent(deleteTarget.path)}`, { method: 'DELETE' })
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

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[480px] gap-4">
      {/* 文件树 */}
      <Card className="flex w-72 shrink-0 flex-col gap-2 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">文档库</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="size-7" title="新建文件" onClick={() => { setCreating('file'); setCreateParent(''); setCreateName('') }}>
              <FilePlus />
            </Button>
            <Button variant="ghost" size="icon" className="size-7" title="新建文件夹" onClick={() => { setCreating('dir'); setCreateParent(''); setCreateName('') }}>
              <FolderPlus />
            </Button>
          </div>
        </div>
        {creating && (
          <div className="flex gap-1.5">
            <Input
              autoFocus
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder={creating === 'dir' ? '文件夹名' : '文件名.md'}
              className="h-8 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && create()}
            />
            <Button size="sm" className="h-8" onClick={create}>建</Button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-auto">
          {!tree ? (
            <Skeleton className="h-full" />
          ) : tree.length === 0 ? (
            <p className="p-4 text-center text-xs text-muted-foreground">文档库为空,点右上角新建</p>
          ) : (
            <Tree<TreeData>
              data={tree}
              openByDefault
              rowHeight={30}
              indent={14}
              onSelect={(nodes) => {
                const n = nodes[0]
                if (n?.data.type === 'file') openDoc(n.data.path).catch((e) => toast.error(e.message))
              }}
              onMove={async ({ dragIds, parentId }) => {
                const parent = tree ? findNode(tree, parentId ?? '') : null
                const toDir = parent && parent.type === 'dir' ? parent.path : ''
                for (const id of dragIds) {
                  const src = findNode(tree ?? [], id)
                  if (src) {
                    try {
                      await api('/admin/api/docs', { method: 'PUT', body: JSON.stringify({ action: 'move', path: src.path, toDir }) })
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
      </Card>

      {/* 编辑器 */}
      <Card className="flex min-w-0 flex-1 flex-col p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-medium">{doc?.name ?? '未选择文档'}</span>
            {dirty && <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">未保存</span>}
          </div>
          <div className="flex shrink-0 gap-1">
            {selectedPath && (
              <>
                <Button variant="ghost" size="icon" className="size-8" title="重命名" onClick={() => { setRenaming(selectedPath); setRenameValue(doc?.name ?? '') }}>
                  <Pencil />
                </Button>
                <Button variant="ghost" size="icon" className="size-8 text-destructive" title="删除" onClick={() => setDeleteTarget({ id: selectedPath, name: doc?.name ?? '', type: 'file', path: selectedPath })}>
                  <Trash2 />
                </Button>
              </>
            )}
            <Button size="sm" onClick={save} disabled={!selectedPath || !dirty || saving}>
              <Save />
              {saving ? '保存中…' : '保存'}
            </Button>
          </div>
        </div>
        {renaming && (
          <div className="mb-2 flex gap-1.5">
            <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="h-8 text-xs" autoFocus onKeyDown={(e) => e.key === 'Enter' && doRename()} />
            <Button size="sm" className="h-8" onClick={doRename}>确定</Button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
          <div ref={editorRef} className="h-full [&_.toastui-editor-defaultUI]:h-full [&_.toastui-editor-main]:h-[calc(100%-40px)]" />
        </div>
      </Card>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除「{deleteTarget?.name}」?</AlertDialogTitle>
            <AlertDialogDescription>{deleteTarget?.type === 'dir' ? '整个文件夹及其内容将被删除。' : '文件将被永久删除。'}</AlertDialogDescription>
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
