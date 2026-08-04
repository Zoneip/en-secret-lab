'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, ExternalLink, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { api } from './lib/api'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Skeleton } from './ui/skeleton'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
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

interface Friend {
  id: string
  name: string
  url: string
  avatar?: string
  description?: string
  group?: string
}

interface FriendRequest {
  id: string
  name: string
  url: string
  avatar?: string
  description?: string
  email?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: number
}

const fmtTime = (t: number) => new Date(t).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[] | null>(null)
  const [requests, setRequests] = useState<FriendRequest[] | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Friend | null>(null)

  const load = useCallback(async () => {
    const d = await api<{ friends: Friend[]; requests: FriendRequest[] }>('/admin/api/friends')
    setFriends(d.friends)
    setRequests(d.requests)
  }, [])

  useEffect(() => {
    load().catch((e) => toast.error(e.message))
  }, [load])

  async function review(r: FriendRequest, action: 'approve' | 'reject') {
    try {
      await api(`/admin/api/friends/${r.id}`, { method: 'PUT', body: JSON.stringify({ action }) })
      toast.success(action === 'approve' ? `已通过「${r.name}」` : '已拒绝')
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function removeRequest(r: FriendRequest) {
    try {
      await api(`/admin/api/friends/${r.id}`, { method: 'DELETE' })
      toast.success('已删除申请')
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function removeFriend() {
    if (!deleteTarget) return
    try {
      await api(`/admin/api/friends/${deleteTarget.id}`, { method: 'DELETE' })
      toast.success('已移除')
      setDeleteTarget(null)
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">申请管理({requests?.filter((r) => r.status === 'pending').length ?? 0})</TabsTrigger>
          <TabsTrigger value="friends">已展示({friends?.length ?? 0})</TabsTrigger>
        </TabsList>

        {/* 申请管理 */}
        <TabsContent value="requests" className="flex flex-col gap-4">
          {!requests ? (
            <Skeleton className="h-48" />
          ) : requests.filter((r) => r.status === 'pending').length === 0 ? (
            <Card className="p-10 text-center text-sm text-muted-foreground">没有待审核的申请</Card>
          ) : (
            requests
              .filter((r) => r.status === 'pending')
              .map((r) => (
                <Card key={r.id} className="gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <a href={r.url} target="_blank" rel="noreferrer" className="font-medium hover:text-primary hover:underline">
                          {r.name}
                        </a>
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {r.url} · {fmtTime(r.created_at)}
                      </p>
                      {r.description && <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>}
                      {r.email && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          联系: <a href={`mailto:${r.email}`} className="text-primary hover:underline">{r.email}</a>
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" onClick={() => review(r, 'approve')}>
                        <Check />
                        通过
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => review(r, 'reject')}>
                        <X />
                        拒绝
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeRequest(r)}>
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
          )}
          {requests?.some((r) => r.status !== 'pending') && (
            <div className="text-xs text-muted-foreground">已处理记录: {requests.filter((r) => r.status !== 'pending').length} 条(点击垃圾箱可清除)</div>
          )}
        </TabsContent>

        {/* 已展示友链 */}
        <TabsContent value="friends" className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Button onClick={() => setAddOpen(true)}>
              <Plus />
              添加友链
            </Button>
          </div>
          {!friends ? (
            <Skeleton className="h-48" />
          ) : friends.length === 0 ? (
            <Card className="p-10 text-center text-sm text-muted-foreground">还没有展示友链</Card>
          ) : (
            friends.map((f) => (
              <Card key={f.id} className="gap-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-semibold text-primary">
                    {f.avatar ? <img src={f.avatar} alt="" className="size-10 rounded-xl object-cover" /> : f.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <a href={f.url} target="_blank" rel="noreferrer" className="font-medium hover:text-primary hover:underline">
                      {f.name}
                    </a>
                    <p className="truncate text-xs text-muted-foreground">
                      {f.description ?? '—'}
                      {f.group ? ` · 分组:${f.group}` : ''} · {f.id}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteTarget(f)}>
                    <Trash2 />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* 添加友链 */}
      <AddFriendDialog open={addOpen} onOpenChange={setAddOpen} onAdded={load} />

      {/* 删除确认 */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>移除友链?</AlertDialogTitle>
            <AlertDialogDescription>「{deleteTarget?.name}」将从友链中移除。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={removeFriend}>
              <Trash2 />
              移除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function AddFriendDialog({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onAdded: () => void
}) {
  const [form, setForm] = useState({ name: '', url: '', avatar: '', description: '', group: '' })
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api('/admin/api/friends', { method: 'POST', body: JSON.stringify(form) })
      toast.success('已添加')
      setForm({ name: '', url: '', avatar: '', description: '', group: '' })
      onOpenChange(false)
      onAdded()
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
          <DialogTitle>添加友链</DialogTitle>
          <DialogDescription>手动添加展示友链(不经过申请流程)。</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="grid gap-1.5">
            <Label>名称 *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid gap-1.5">
            <Label>链接 *</Label>
            <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required placeholder="https://…" />
          </div>
          <div className="grid gap-1.5">
            <Label>头像 URL</Label>
            <Input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label>简介</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label>分组</Label>
            <Input value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} placeholder="如:技术 / 生活(默认 其他)" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={submitting}>
              添加
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
