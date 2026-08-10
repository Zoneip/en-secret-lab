/**
 * 资产上传(动态版):壁纸/字体等写入 data/uploads/,DB 记录索引
 * 运行时通过 middleware 的 /uploads/* 静态路由提供访问
 */
import { randomUUID } from 'node:crypto'
import { mkdirSync, writeFileSync, statSync, unlinkSync } from 'node:fs'
import { join, dirname, extname, sep } from 'node:path'
import { loadEnv } from '../env'
import { getDb } from './db'

export const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
}

export interface SavedAsset {
  id: string
  kind: string
  themeId: string | null
  fileName: string
  path: string
  size: number
  mime: string
  created_at: number
}

export function saveUpload(
  kind: string,
  themeId: string | null,
  file: {
    name: string
    type: string
    data: Uint8Array
  },
): SavedAsset {
  const env = loadEnv(process.env)
  const ext = extname(file.name).toLowerCase()
  if (!MIME_BY_EXT[ext]) throw new Error(`不支持的文件类型:${ext}`)
  // themeId 白名单校验,防止拼接 ../ 逃逸出 uploads 目录
  if (themeId && !/^[a-z0-9-]+$/.test(themeId)) {
    throw new Error('themeId 仅允许小写字母、数字与连字符')
  }

  const id = randomUUID()
  const subDir =
    kind === 'font'
      ? 'fonts'
      : kind === 'wallpaper'
        ? `themes/${themeId ?? 'shared'}`
        : 'misc'
  const safeName = file.name.replace(/[^\w.\-\u4e00-\u9fff]/g, '_')
  const uploadsRoot = join(dirname(env.DATABASE_PATH), 'uploads')
  const dir = join(uploadsRoot, subDir)
  // 双保险:目标目录必须位于 uploads 根内(纵深防御)
  if (!dir.startsWith(uploadsRoot + sep)) throw new Error('非法上传路径')
  mkdirSync(dir, { recursive: true })
  const path = `/uploads/${subDir}/${id}${ext}`
  writeFileSync(join(dir, `${id}${ext}`), file.data)

  const asset: SavedAsset = {
    id,
    kind,
    themeId,
    fileName: safeName,
    path,
    size: file.data.length,
    mime: MIME_BY_EXT[ext] ?? file.type,
    created_at: Date.now(),
  }
  getDb()
    .prepare(
      `INSERT INTO assets (id, kind, theme_id, file_name, path, size, mime, created_at)
       VALUES (@id, @kind, @themeId, @fileName, @path, @size, @mime, @createdAt)`,
    )
    .run({ ...asset, createdAt: asset.created_at })
  return asset
}

export function listAssets(kind?: string): SavedAsset[] {
  const rows = kind
    ? getDb()
        .prepare('SELECT * FROM assets WHERE kind = ? ORDER BY created_at DESC')
        .all(kind)
    : getDb().prepare('SELECT * FROM assets ORDER BY created_at DESC').all()
  return rows as unknown as SavedAsset[]
}

export function deleteAsset(id: string): boolean {
  const row = getDb()
    .prepare('SELECT path FROM assets WHERE id = ?')
    .get(id) as { path: string } | undefined
  if (!row) return false
  getDb().prepare('DELETE FROM assets WHERE id = ?').run(id)
  // 清理磁盘文件
  const file = assetFileOnDisk(row.path)
  if (file) {
    try {
      unlinkSync(file)
    } catch {
      /* 文件可能已不存在 */
    }
  }
  return true
}

export function assetFileOnDisk(path: string): string | null {
  const env = loadEnv(process.env)
  const rel = path.replace(/^\/uploads\//, '')
  const uploadsRoot = join(dirname(env.DATABASE_PATH), 'uploads')
  const file = join(uploadsRoot, rel)
  // 包含性校验:解析后必须仍在 uploads 根内(纵深防御路径逃逸)
  if (!file.startsWith(uploadsRoot + sep)) return null
  try {
    if (statSync(file).isFile()) return file
  } catch {
    /* 不存在 */
  }
  return null
}
