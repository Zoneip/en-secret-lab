/**
 * 备份与导出(动态版):
 *  - 完整备份:SQLite + 上传资产 + 内容文件 → data/backups/
 *  - 内容导出:内容 + 站点配置 → data/exports/(静态版可用的内容源)
 *  - 定时备份(懒触发:admin 访问时检查)+ 冗余自动清理
 */
import { mkdirSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { createRequire } from 'node:module'
import { loadEnv } from '../env'
import { settingGet, settingSet } from './db'

const require = createRequire(import.meta.url)

export interface BackupEntry {
  name: string
  kind: 'backup' | 'export'
  size: number
  createdAt: number
}

const dataDir = () => {
  const env = loadEnv(process.env)
  return dirname(env.DATABASE_PATH)
}
const backupsDir = () => join(dataDir(), 'backups')
const exportsDir = () => join(dataDir(), 'exports')

/** 归档目录(支持不存在目录容错) */
async function tarGz(sources: Array<{ path: string; base: string }>, outFile: string): Promise<void> {
  const tar = require('tar') as { c: (opts: Record<string, unknown>, files: string[]) => Promise<void> }
  await tar.c({ gzip: true, file: outFile, portable: true, cwd: process.cwd() }, sources.filter((s) => existsSync(s.path)).map((s) => s.path))
}

export async function createBackup(): Promise<BackupEntry> {
  const env = loadEnv(process.env)
  mkdirSync(backupsDir(), { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const name = `backup-${ts}.tar.gz`
  const outFile = join(backupsDir(), name)
  const contentRoot = process.env.CONTENT_DIR ?? join(process.cwd(), 'src', 'content')
  await tarGz(
    [
      { path: env.DATABASE_PATH, base: 'data' },
      { path: join(dataDir(), 'uploads'), base: 'data' },
      { path: contentRoot, base: 'content' },
    ],
    outFile
  )
  const entry = { name, kind: 'backup' as const, size: statSync(outFile).size, createdAt: Date.now() }
  // 记录备份时间 + 冗余清理
  settingSet('backup_last_at', String(entry.createdAt))
  pruneBackups()
  return entry
}

export async function exportContent(): Promise<BackupEntry> {
  mkdirSync(exportsDir(), { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const name = `export-${ts}.tar.gz`
  const outFile = join(exportsDir(), name)
  const contentRoot = process.env.CONTENT_DIR ?? join(process.cwd(), 'src', 'content')
  const siteConfig = join(process.cwd(), 'public', 'site-config.json')
  await tarGz(
    [
      { path: contentRoot, base: 'content' },
      { path: siteConfig, base: 'config' },
    ],
    outFile
  )
  return { name, kind: 'export', size: statSync(outFile).size, createdAt: Date.now() }
}

export function listBackups(): BackupEntry[] {
  mkdirSync(backupsDir(), { recursive: true })
  return readdirSync(backupsDir())
    .filter((f) => f.endsWith('.tar.gz'))
    .map((name) => {
      const stat = statSync(join(backupsDir(), name))
      return { name, kind: 'backup' as const, size: stat.size, createdAt: stat.mtimeMs }
    })
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function listExports(): BackupEntry[] {
  mkdirSync(exportsDir(), { recursive: true })
  return readdirSync(exportsDir())
    .filter((f) => f.endsWith('.tar.gz'))
    .map((name) => {
      const stat = statSync(join(exportsDir(), name))
      return { name, kind: 'export' as const, size: stat.size, createdAt: stat.mtimeMs }
    })
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function backupFile(kind: 'backup' | 'export', name: string): string | null {
  const dir = kind === 'backup' ? backupsDir() : exportsDir()
  const file = join(dir, name)
  if (name.includes('..') || !existsSync(file)) return null
  return file
}

/* ---------- 定时与冗余 ---------- */

export function getBackupConfig(): { intervalHours: number; keep: number; enabled: boolean } {
  return {
    intervalHours: Number(settingGet('backup_interval_hours') ?? 24),
    keep: Number(settingGet('backup_keep') ?? 5),
    enabled: settingGet('backup_enabled') !== 'false',
  }
}

export function setBackupConfig(cfg: { intervalHours: number; keep: number; enabled: boolean }): void {
  settingSet('backup_interval_hours', String(cfg.intervalHours))
  settingSet('backup_keep', String(cfg.keep))
  settingSet('backup_enabled', String(cfg.enabled))
}

/** 懒触发:若到点则自动备份(admin 访问时调用) */
export function autoBackupIfDue(): void {
  const cfg = getBackupConfig()
  if (!cfg.enabled) return
  const last = Number(settingGet('backup_last_at') ?? 0)
  if (Date.now() - last < cfg.intervalHours * 3600_000) return
  createBackup().catch((e) => console.error('[backup] 自动备份失败:', (e as Error).message))
}

/** 冗余清理:保留最近 keep 个备份,删除更旧的 */
export function pruneBackups(): void {
  const cfg = getBackupConfig()
  const backups = listBackups()
  const overflow = backups.slice(cfg.keep)
  for (const b of overflow) {
    const file = join(backupsDir(), b.name)
    try {
      require('node:fs').unlinkSync(file)
    } catch {
      /* 忽略 */
    }
  }
}
