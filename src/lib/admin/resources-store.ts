/**
 * 资源站存储(动态版):读写 src/content/resources/*.yaml
 * 与控制台"资源"管理联动;下载计数写入 SQLite
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { settingGet, settingSet } from './db'

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

const resourcesDir = () => join(process.env.CONTENT_DIR ?? join(process.cwd(), 'src', 'content'), 'resources')

export function listResources(): ResourceData[] {
  mkdirSync(resourcesDir(), { recursive: true })
  const files = readdirSync(resourcesDir()).filter((f) => f.endsWith('.yaml'))
  return files
    .map((f) => {
      try {
        const raw = parseYaml(readFileSync(join(resourcesDir(), f), 'utf8')) as Partial<ResourceData>
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

export function saveResource(id: string, data: Omit<ResourceData, 'id' | 'downloads'>): ResourceData {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error('资源 id 仅允许小写字母、数字与连字符')
  mkdirSync(resourcesDir(), { recursive: true })
  const existing = getResource(id)
  const downloads = existing?.downloads ?? 0
  writeFileSync(join(resourcesDir(), `${id}.yaml`), stringifyYaml({ ...data, downloads }))
  return { id, downloads, ...data }
}

export function getResource(id: string): ResourceData | null {
  return listResources().find((r) => r.id === id) ?? null
}

/* ---------- 下载计数(DB 持久化) ---------- */

const DOWNLOAD_KEY = (id: string) => `resource_dl_${id}`

export function getDownloads(id: string): number {
  const n = settingGet(DOWNLOAD_KEY(id))
  return n ? Number(n) : 0
}

export function incrementDownloads(id: string): number {
  const next = getDownloads(id) + 1
  settingSet(DOWNLOAD_KEY(id), String(next))
  return next
}
