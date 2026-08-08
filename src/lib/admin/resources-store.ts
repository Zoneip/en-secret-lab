/**
 * 资源站存储(动态版):读写 src/content/resources/*.yaml
 * 与控制台"资源"管理联动;下载计数写入 SQLite
 */
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  renameSync,
} from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { settingGet, settingDelete, getDb } from './db'

export interface ResourceData {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  size?: string
  file?: string
  externalUrl?: string
  pubDate: string
  downloads: number
}

const ID_RE = /^[a-z0-9-]+$/

const resourcesDir = () =>
  join(
    process.env.CONTENT_DIR ?? join(process.cwd(), 'src', 'content'),
    'resources',
  )

export function listResources(): ResourceData[] {
  mkdirSync(resourcesDir(), { recursive: true })
  const files = readdirSync(resourcesDir()).filter((f) => f.endsWith('.yaml'))
  return files
    .map((f) => {
      try {
        const raw = parseYaml(
          readFileSync(join(resourcesDir(), f), 'utf8'),
        ) as Partial<ResourceData>
        return {
          id: f.replace(/\.yaml$/, ''),
          description: '',
          category: '其他',
          tags: [],
          downloads: 0,
          ...raw,
        } as ResourceData
      } catch {
        return null
      }
    })
    .filter((r): r is ResourceData => r !== null)
    .map((r) => ({ ...r, downloads: getDownloads(r.id) }))
}

export function saveResource(
  id: string,
  data: Omit<ResourceData, 'id' | 'downloads'>,
): ResourceData {
  if (!ID_RE.test(id)) throw new Error('资源 id 仅允许小写字母、数字与连字符')
  mkdirSync(resourcesDir(), { recursive: true })
  const existing = getResource(id)
  const downloads = existing?.downloads ?? 0
  // 先写临时文件再原子替换,避免中断产生半写 YAML
  const tmp = join(resourcesDir(), `.${id}.${process.pid}.tmp`)
  writeFileSync(tmp, stringifyYaml({ ...data, downloads }))
  renameSync(tmp, join(resourcesDir(), `${id}.yaml`))
  return { id, downloads, ...data }
}

export function getResource(id: string): ResourceData | null {
  return listResources().find((r) => r.id === id) ?? null
}

/**
 * 删除资源及其下载计数。文件不存在视为幂等成功;
 * 仅当 IO/DB 错误时返回 false。
 */
export function deleteResource(id: string): boolean {
  if (!ID_RE.test(id)) throw new Error('资源 id 仅允许小写字母、数字与连字符')
  const file = join(resourcesDir(), `${id}.yaml`)
  try {
    unlinkSync(file)
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') return false
    // ENOENT:文件已不存在,幂等视为删除成功
  }
  try {
    settingDelete(DOWNLOAD_KEY(id))
  } catch {
    return false
  }
  return true
}

/* ---------- 下载计数(DB 持久化) ---------- */

const DOWNLOAD_KEY = (id: string) => `resource_dl_${id}`

export function getDownloads(id: string): number {
  const n = settingGet(DOWNLOAD_KEY(id))
  return n ? Number(n) : 0
}

export function incrementDownloads(id: string): number {
  // SQL 原子自增,避免并发下载丢失计数
  getDb()
    .prepare(
      `INSERT INTO settings (key, value) VALUES (?, '1')
       ON CONFLICT(key) DO UPDATE SET value = CAST(value AS INTEGER) + 1`,
    )
    .run(DOWNLOAD_KEY(id))
  return getDownloads(id)
}
