/**
 * 内容管理存储(动态版):栏目 / 角色(OC)/ 关于 数据的文件读写
 * 与控制台"内容"页联动,前台数据驱动
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

export interface ColumnData {
  id: string
  title: string
  subtitle: string
  description: string
  theme: 'gray' | 'yellow' | 'purple' | 'white'
  category: string
}

export interface OcData {
  id: string
  name: string
  theme: 'gray' | 'yellow' | 'purple' | 'white'
  subtitle: string
  description: string
  traits: string[]
  quote?: string
  art?: string
}

export interface AboutData {
  nickname: string
  tagline: string
  avatar?: string
  intro: string[]
  links: Array<{ label: string; url: string }>
}

const contentRoot = () => process.env.CONTENT_DIR ?? join(process.cwd(), 'src', 'content')
const columnsDir = () => join(contentRoot(), 'columns')
const ocsDir = () => join(contentRoot(), 'ocs')
const aboutFile = () => join(contentRoot(), 'about', 'me.json')

/* ---------- 栏目 ---------- */

export function listColumns(): ColumnData[] {
  mkdirSync(columnsDir(), { recursive: true })
  const files = readdirSync(columnsDir()).filter((f) => f.endsWith('.yaml'))
  return files
    .map((f) => {
      try {
        const raw = parseYaml(readFileSync(join(columnsDir(), f), 'utf8')) as Partial<ColumnData>
        return { id: f.replace(/\.yaml$/, ''), ...raw } as ColumnData
      } catch {
        return null
      }
    })
    .filter((c): c is ColumnData => c !== null)
}

export function saveColumn(id: string, data: Omit<ColumnData, 'id'>): ColumnData {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error('栏目 id 仅允许小写字母、数字与连字符')
  mkdirSync(columnsDir(), { recursive: true })
  writeFileSync(join(columnsDir(), `${id}.yaml`), stringifyYaml(data))
  return { id, ...data }
}

/* ---------- 角色(OC) ---------- */

export function listOcs(): OcData[] {
  mkdirSync(ocsDir(), { recursive: true })
  const files = readdirSync(ocsDir()).filter((f) => f.endsWith('.yaml'))
  return files
    .map((f) => {
      try {
        const raw = parseYaml(readFileSync(join(ocsDir(), f), 'utf8')) as Partial<OcData>
        return { id: f.replace(/\.yaml$/, ''), traits: [], ...raw } as OcData
      } catch {
        return null
      }
    })
    .filter((o): o is OcData => o !== null)
}

export function saveOc(id: string, data: Omit<OcData, 'id'>): OcData {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error('角色 id 仅允许小写字母、数字与连字符')
  mkdirSync(ocsDir(), { recursive: true })
  writeFileSync(join(ocsDir(), `${id}.yaml`), stringifyYaml(data))
  return { id, ...data }
}

/* ---------- 关于 ---------- */

export function getAbout(): AboutData | null {
  if (!existsSync(aboutFile())) return null
  try {
    return JSON.parse(readFileSync(aboutFile(), 'utf8')) as AboutData
  } catch {
    return null
  }
}

export function saveAbout(data: AboutData): void {
  mkdirSync(join(contentRoot(), 'about'), { recursive: true })
  writeFileSync(aboutFile(), JSON.stringify(data, null, 2) + '\n')
}
