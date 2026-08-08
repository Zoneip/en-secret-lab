'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Ban,
  CheckCircle2,
  Edit,
  KeyRound,
  MoreHorizontal,
  Save,
  UserCog,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import { api, timeAgo } from '../lib/api'
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
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Skeleton } from '../ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

interface Account {
  id: string
  username: string
  display_name: string | null
  email: string | null
  role: 'owner' | 'visitor'
  status: 'active' | 'banned'
  created_at: number
  last_login_at: number | null
  login_count: number
}

const fmtTime = (t: number) =>
  new Date(t).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[] | null>(null)
  const [editTarget, setEditTarget] = useState<Account | null>(null)
  const [passwordTarget, setPasswordTarget] = useState<Account | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [banTarget, setBanTarget] = useState<Account | null>(null)

  const [tab, setTab] = useState<'owner' | 'visitors'>(() => {
    const t = new URLSearchParams(window.location.search).get('tab')
    if (t === 'visitors') return 'visitors'
    return 'owner'
  })

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.replaceState(null, '', url.toString())
  }, [tab])

  const load = useCallback(async () => {
    const d = await api<{ accounts: Account[] }>('/admin/api/accounts')
    setAccounts(d.accounts)
  }, [])

  useEffect(() => {
    load().catch((e) => toast.error(e.message))
  }, [load])

  const owner = accounts?.find((a) => a.role === 'owner') ?? null
  const visitors = accounts?.filter((a) => a.role !== 'owner') ?? []

  if (!accounts) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <Skeleton className="h-44" />
        <Skeleton className="h-72" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as 'owner' | 'visitors')}
      >
        <TabsList className="h-11 w-full gap-1 rounded-xl bg-muted/60 p-1 sm:w-auto">
          <TabsTrigger
            value="owner"
            className="h-9 rounded-lg data-[state=active]:shadow-md"
          >
            站主账号
          </TabsTrigger>
          <TabsTrigger
            value="visitors"
            className="h-9 rounded-lg data-[state=active]:shadow-md"
          >
            访客账号
          </TabsTrigger>
        </TabsList>
        <TabsContent value="owner" className="mt-4 flex flex-col gap-4">
          {owner ? (
            <OwnerProfile key={owner.id} owner={owner} onSaved={load} />
          ) : (
            <Card className="p-10 text-center text-sm text-muted-foreground">
              未找到站主账号
            </Card>
          )}
        </TabsContent>

        <TabsContent value="visitors" className="mt-4 flex flex-col gap-4">
          {/* ===== 访客账号 ===== */}
          <Card className="gap-4 rounded-2xl border-border/70 p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <UserCog className="size-4 text-primary" />
                访客账号
                <span className="text-xs font-normal text-muted-foreground">
                  ({visitors.length})
                </span>
              </h3>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <UserPlus />
                创建访客账号
              </Button>
            </div>

            {visitors.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                还没有访客账号,点击右上角创建
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>账号</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>注册时间</TableHead>
                    <TableHead>最后登录</TableHead>
                    <TableHead className="text-right">登录次数</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitors.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>
                        <p className="font-medium">
                          {v.display_name || v.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{v.username}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {v.email || '—'}
                      </TableCell>
                      <TableCell>
                        {v.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-600">
                            <CheckCircle2 className="size-3" />
                            正常
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] text-destructive">
                            <Ban className="size-3" />
                            已封禁
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmtTime(v.created_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {v.last_login_at ? timeAgo(v.last_login_at) : '从未'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {v.login_count}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`操作 ${v.username}`}
                            >
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditTarget(v)}>
                              <Edit />
                              编辑资料
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setPasswordTarget(v)}
                            >
                              <KeyRound />
                              重置密码
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setBanTarget(v)}
                            >
                              {v.status === 'active' ? (
                                <Ban />
                              ) : (
                                <CheckCircle2 />
                              )}
                              {v.status === 'active' ? '封禁账号' : '解除封禁'}
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
        </TabsContent>
      </Tabs>

      {/* 编辑资料 */}
      <EditAccountDialog
        target={editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
        onSaved={load}
      />

      {/* 重置密码 */}
      <ResetPasswordDialog
        target={passwordTarget}
        onOpenChange={(o) => !o && setPasswordTarget(null)}
      />

      {/* 创建访客账号 */}
      <CreateVisitorDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={load}
      />

      {/* 封禁/解封确认 */}
      <AlertDialog
        open={banTarget !== null}
        onOpenChange={(o) => !o && setBanTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {banTarget?.status === 'active'
                ? '封禁该账号?'
                : '解除该账号封禁?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {banTarget?.status === 'active'
                ? `「${banTarget?.username}」将无法登录,已登录会话也会在下次校验时失效。`
                : `「${banTarget?.username}」将恢复登录权限。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className={
                banTarget?.status === 'active'
                  ? 'bg-destructive text-white hover:bg-destructive/90'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }
              onClick={async () => {
                if (!banTarget) return
                try {
                  const next =
                    banTarget.status === 'active' ? 'banned' : 'active'
                  await api(`/admin/api/accounts/${banTarget.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: next }),
                  })
                  toast.success(
                    next === 'banned'
                      ? `已封禁「${banTarget.username}」`
                      : `已解除「${banTarget.username}」封禁`,
                  )
                  setBanTarget(null)
                  await load()
                } catch (e) {
                  toast.error((e as Error).message)
                }
              }}
            >
              {banTarget?.status === 'active' ? <Ban /> : <CheckCircle2 />}
              {banTarget?.status === 'active' ? '封禁' : '解封'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** 站主账号资料:平铺编辑(输入框直接铺开,不弹窗) */
function OwnerProfile({
  owner,
  onSaved,
}: {
  owner: Account
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    username: owner.username,
    display_name: owner.display_name ?? '',
    email: owner.email ?? '',
  })
  const [password, setPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  async function saveProfile(e: React.SubmitEvent) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const renamed = form.username !== owner.username
      await api(`/admin/api/accounts/${owner.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          username: form.username,
          display_name: form.display_name,
          email: form.email,
        }),
      })
      toast.success('资料已保存')
      if (renamed) toast.info('登录名已修改,下次登录请使用新用户名')
      onSaved()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePassword(e: React.SubmitEvent) {
    e.preventDefault()
    setSavingPassword(true)
    try {
      await api(`/admin/api/accounts/${owner.id}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password }),
      })
      toast.success('密码已更新')
      setPassword('')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <Card className="gap-5 rounded-2xl border-border/70 p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
          {form.username.slice(0, 1).toUpperCase() || '?'}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">
              {form.display_name || form.username}
            </p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
              站主
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            注册于 {fmtTime(owner.created_at)} · 登录 {owner.login_count} 次
            {owner.last_login_at
              ? ` · 最近登录 {timeAgo(owner.last_login_at)}`
              : ''}
          </p>
        </div>
      </div>

      <form onSubmit={saveProfile} className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label>登录名 *</Label>
          <Input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            placeholder="3-32 位字母/数字/下划线/短横线"
          />
        </div>
        <div className="grid gap-1.5">
          <Label>昵称</Label>
          <Input
            value={form.display_name}
            onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            placeholder="展示用昵称,留空则显示登录名"
          />
        </div>
        <div className="grid gap-1.5">
          <Label>绑定邮箱</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="user@example.com"
          />
        </div>
        <div className="flex items-end justify-end">
          <Button type="submit" disabled={savingProfile}>
            <Save />
            {savingProfile ? '保存中…' : '保存资料'}
          </Button>
        </div>
      </form>

      <form onSubmit={savePassword} className="border-t pt-4">
        <Label>修改密码</Label>
        <div className="mt-1.5 flex max-w-sm gap-2">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="新密码(≥8 位)"
            required
          />
          <Button
            type="submit"
            variant="outline"
            disabled={savingPassword || password.length < 8}
          >
            <KeyRound />
            {savingPassword ? '更新中…' : '更新密码'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

/** 编辑账号资料(站主/访客通用) */
function EditAccountDialog({
  target,
  onOpenChange,
  onSaved,
}: {
  target: Account | null
  onOpenChange: (o: boolean) => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    username: '',
    display_name: '',
    email: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (target) {
      setForm({
        username: target.username,
        display_name: target.display_name ?? '',
        email: target.email ?? '',
      })
    }
  }, [target])

  async function submit(e: React.SubmitEvent) {
    e.preventDefault()
    if (!target) return
    setSubmitting(true)
    try {
      await api(`/admin/api/accounts/${target.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          username: form.username,
          display_name: form.display_name,
          email: form.email,
        }),
      })
      toast.success('资料已更新')
      if (target.role === 'owner' && form.username !== target.username) {
        toast.info('登录名已修改,下次登录请使用新用户名')
      }
      onOpenChange(false)
      onSaved()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑账号资料</DialogTitle>
          <DialogDescription>
            修改「{target?.username}」的登录名、昵称与绑定邮箱。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="grid gap-1.5">
            <Label>登录名 *</Label>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              placeholder="3-32 位字母/数字/下划线/短横线"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>昵称</Label>
            <Input
              value={form.display_name}
              onChange={(e) =>
                setForm({ ...form, display_name: e.target.value })
              }
              placeholder="展示用昵称,留空则显示登录名"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>绑定邮箱</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="user@example.com"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '保存中…' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** 重置密码(站主改自己密码 / 管理员重置访客密码) */
function ResetPasswordDialog({
  target,
  onOpenChange,
}: {
  target: Account | null
  onOpenChange: (o: boolean) => void
}) {
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setPassword('')
  }, [target])

  async function submit(e: React.SubmitEvent) {
    e.preventDefault()
    if (!target) return
    setSubmitting(true)
    try {
      await api(`/admin/api/accounts/${target.id}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password }),
      })
      toast.success(
        target.role === 'owner'
          ? '密码已更新'
          : `已重置「${target.username}」的密码`,
      )
      setPassword('')
      onOpenChange(false)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {target?.role === 'owner' ? '修改密码' : '重置密码'}
          </DialogTitle>
          <DialogDescription>
            {target?.role === 'owner'
              ? '设置新的控制台登录密码。'
              : `为「${target?.username}」设置新密码,该账号下次登录需使用新密码。`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="grid gap-1.5">
            <Label>新密码 *</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="至少 8 位"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={submitting || password.length < 8}>
              {submitting ? '保存中…' : '确认'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** 创建访客账号(后台注册接口) */
function CreateVisitorDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: () => void
}) {
  const [form, setForm] = useState({
    username: '',
    display_name: '',
    password: '',
    email: '',
  })
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.SubmitEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api('/admin/api/accounts', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      toast.success(`已创建访客账号「${form.username}」`)
      setForm({ username: '', display_name: '', password: '', email: '' })
      onOpenChange(false)
      onCreated()
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
          <DialogTitle>创建访客账号</DialogTitle>
          <DialogDescription>
            访客账号用于前台评论等场景,创建后请将初始密码告知对方。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="grid gap-1.5">
            <Label>登录名 *</Label>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              placeholder="3-32 位字母/数字/下划线/短横线"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>昵称</Label>
            <Input
              value={form.display_name}
              onChange={(e) =>
                setForm({ ...form, display_name: e.target.value })
              }
              placeholder="展示用昵称,留空则显示登录名"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>初始密码 *</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="至少 8 位"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>邮箱</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="user@example.com"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                '创建中…'
              ) : (
                <>
                  <UserPlus />
                  创建
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
