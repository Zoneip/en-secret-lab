'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Archive,
  Download,
  FileArchive,
  HardDriveDownload,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '../lib/api'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
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

interface Entry {
  name: string
  kind: 'backup' | 'export'
  size: number
  createdAt: number
}

interface BackupState {
  config: { intervalHours: number; keep: number; enabled: boolean }
  backups: Entry[]
  exports: Entry[]
}

const fmtSize = (b: number) => (b / 1024 / 1024).toFixed(2) + ' MB'
const fmtTime = (t: number) =>
  new Date(t).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function BackupPage() {
  const [state, setState] = useState<BackupState | null>(null)
  const [config, setConfig] = useState({
    intervalHours: 24,
    keep: 5,
    enabled: true,
  })
  const [running, setRunning] = useState<'backup' | 'export' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Entry | null>(null)

  const load = useCallback(async () => {
    const d = await api<BackupState>('/admin/api/backup')
    setState(d)
    setConfig(d.config)
  }, [])

  useEffect(() => {
    load().catch((e) => toast.error(e.message))
  }, [load])

  async function run(action: 'backup' | 'export') {
    setRunning(action)
    try {
      await api('/admin/api/backup', {
        method: 'POST',
        body: JSON.stringify({ action }),
      })
      toast.success(action === 'backup' ? '备份完成' : '内容导出完成')
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setRunning(null)
    }
  }

  async function saveConfig() {
    try {
      await api('/admin/api/backup', {
        method: 'PUT',
        body: JSON.stringify({
          ...config,
          intervalHours: Number(config.intervalHours),
          keep: Number(config.keep),
        }),
      })
      toast.success('已保存')
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function doDelete() {
    if (!deleteTarget) return
    try {
      await api(
        `/admin/api/backup-file?kind=${deleteTarget.kind}&name=${encodeURIComponent(deleteTarget.name)}`,
        {
          method: 'DELETE',
        },
      )
      toast.success('已删除')
      setDeleteTarget(null)
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      {/* 操作区 */}
      <Card className="gap-4 p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Archive className="size-4" />
          备份与导出
        </h3>
        <p className="text-xs text-muted-foreground">
          完整备份 = SQLite 配置 + 上传资产 + 全部内容文件;内容导出 =
          纯内容包,可直接合并到静态版仓库。
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => run('backup')} disabled={running !== null}>
            <HardDriveDownload />
            {running === 'backup' ? '备份中…' : '立即备份'}
          </Button>
          <Button
            variant="outline"
            onClick={() => run('export')}
            disabled={running !== null}
          >
            <FileArchive />
            {running === 'export' ? '导出中…' : '内容导出'}
          </Button>
        </div>
      </Card>

      {/* 定时配置 */}
      <Card className="gap-4 p-5 sm:p-6">
        <h3 className="text-sm font-semibold">自动备份</h3>
        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label>备份间隔(小时)</Label>
            <Input
              type="number"
              min={1}
              max={720}
              value={config.intervalHours}
              onChange={(e) =>
                setConfig({ ...config, intervalHours: Number(e.target.value) })
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label>保留份数(自动清理更旧的)</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={config.keep}
              onChange={(e) =>
                setConfig({ ...config, keep: Number(e.target.value) })
              }
            />
          </div>
          <div className="grid items-end gap-1.5">
            <Label>启用定时备份</Label>
            <div className="flex h-9 items-center">
              <Switch
                checked={config.enabled}
                onCheckedChange={(v) => setConfig({ ...config, enabled: v })}
              />
            </div>
          </div>
        </div>
        <div>
          <Button variant="outline" onClick={saveConfig}>
            <RefreshCw />
            保存设置
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          定时备份在控制台访问时检查触发(懒执行);删除冗余备份的操作见下方列表。
        </p>
      </Card>

      {/* 备份列表 */}
      <Card className="gap-0">
        <div className="border-b px-5 py-3.5">
          <h3 className="text-sm font-semibold">
            备份列表({state?.backups.length ?? 0})
          </h3>
        </div>
        <div className="flex flex-col divide-y">
          {!state ? (
            <Skeleton className="m-4 h-24" />
          ) : state.backups.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              还没有备份,点上方「立即备份」
            </p>
          ) : (
            state.backups.map((b) => (
              <div key={b.name} className="flex items-center gap-3 px-5 py-3">
                <Archive className="size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" title={b.name}>
                    {b.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fmtTime(b.createdAt)} · {fmtSize(b.size)}
                  </p>
                </div>
                <a
                  href={`/admin/api/backup-file?kind=backup&name=${encodeURIComponent(b.name)}`}
                  download
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  title="下载"
                >
                  <Download className="size-4" />
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => setDeleteTarget(b)}
                  title="删除"
                >
                  <Trash2 />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 导出列表 */}
      <Card className="gap-0">
        <div className="border-b px-5 py-3.5">
          <h3 className="text-sm font-semibold">
            内容导出({state?.exports.length ?? 0})
          </h3>
        </div>
        <div className="flex flex-col divide-y">
          {!state ? (
            <Skeleton className="m-4 h-24" />
          ) : state.exports.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              还没有导出
            </p>
          ) : (
            state.exports.map((b) => (
              <div key={b.name} className="flex items-center gap-3 px-5 py-3">
                <FileArchive className="size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" title={b.name}>
                    {b.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fmtTime(b.createdAt)} · {fmtSize(b.size)}
                  </p>
                </div>
                <a
                  href={`/admin/api/backup-file?kind=export&name=${encodeURIComponent(b.name)}`}
                  download
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  title="下载"
                >
                  <Download className="size-4" />
                </a>
              </div>
            ))
          )}
        </div>
      </Card>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除文件?</AlertDialogTitle>
            <AlertDialogDescription>
              「{deleteTarget?.name}」将被永久删除。
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
