/** 文档库:content/docs/ 文件树(txt/md 混合,支持嵌套文件夹) */
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  rmSync,
  statSync,
  existsSync,
} from 'node:fs'
import { join, relative, normalize, sep, basename, dirname } from 'node:path'

export interface DocNode {
  id: string
  name: string
  type: 'file' | 'dir'
  path: string
  size?: number
  children?: DocNode[]
}

/** 文档库不再按扩展名限制文件类型,由用户自行决定文件用途 */
export const DOCS_EXTS: string[] = []

export function docsRoot(): string {
  return join(process.cwd(), 'content', 'docs')
}

/** 安全拼接:禁止逃逸出 docs 根 */
function safeJoin(...parts: string[]): string {
  const root = docsRoot()
  const p = normalize(join(root, ...parts))
  if (!p.startsWith(root + sep) && p !== root) throw new Error('非法路径')
  return p
}

export function listDocs(): DocNode[] {
  const root = docsRoot()
  mkdirSync(root, { recursive: true })
  const walk = (dir: string, rel: string): DocNode[] =>
    readdirSync(dir, { withFileTypes: true })
      .filter((d) => !d.name.startsWith('.'))
      .sort((a, b) =>
        a.isDirectory() === b.isDirectory()
          ? a.name.localeCompare(b.name)
          : a.isDirectory()
            ? -1
            : 1,
      )
      .map((d): DocNode => {
        const abs = join(dir, d.name)
        const relPath = rel ? `${rel}/${d.name}` : d.name
        if (d.isDirectory()) {
          return {
            id: `dir:${relPath}`,
            name: d.name,
            type: 'dir',
            path: relPath,
            children: walk(abs, relPath),
          }
        }
        return {
          id: `file:${relPath}`,
          name: d.name,
          type: 'file',
          path: relPath,
          size: statSync(abs).size,
        }
      })
      .filter(Boolean)
  return walk(root, '')
}

export function readDoc(path: string): { name: string; content: string } {
  const abs = safeJoin(path)
  if (!existsSync(abs) || statSync(abs).isDirectory())
    throw new Error('文件不存在')
  return { name: basename(abs), content: readFileSync(abs, 'utf8') }
}

export function writeDoc(path: string, content: string): void {
  const abs = safeJoin(path)
  if (!existsSync(abs) || statSync(abs).isDirectory())
    throw new Error('文件不存在')
  writeFileSync(abs, content, 'utf8')
}

export function createDoc(
  parent: string,
  name: string,
  type: 'file' | 'dir',
): void {
  const abs = safeJoin(parent, name)
  if (existsSync(abs)) throw new Error('同名文件或文件夹已存在')
  if (type === 'dir') mkdirSync(abs)
  else writeFileSync(abs, '', 'utf8')
}

export function renameDoc(path: string, newName: string): void {
  if (newName.includes('/') || newName.includes('\\') || !newName)
    throw new Error('名称无效')
  const abs = safeJoin(path)
  const to = safeJoin(join(dirnameOf(path), newName))
  if (existsSync(to)) throw new Error('同名文件或文件夹已存在')
  renameSync(abs, to)
}

function dirnameOf(path: string): string {
  const parts = path.split('/')
  parts.pop()
  return parts.join('/')
}

export function moveDoc(path: string, toDir: string): void {
  const abs = safeJoin(path)
  const target = safeJoin(toDir, basename(path))
  if (existsSync(target)) throw new Error('目标位置已有同名文件或文件夹')
  renameSync(abs, target)
}

export function deleteDoc(path: string): void {
  const abs = safeJoin(path)
  if (!existsSync(abs)) throw new Error('不存在')
  rmSync(abs, { recursive: true, force: true })
}

/** 批量删除；任意一项失败则抛出,已删除的不回滚 */
export function deleteDocs(paths: string[]): {
  deleted: string[]
  missing: string[]
} {
  const deleted: string[] = []
  const missing: string[] = []
  for (const path of paths) {
    const abs = safeJoin(path)
    if (!existsSync(abs)) {
      missing.push(path)
      continue
    }
    rmSync(abs, { recursive: true, force: true })
    deleted.push(path)
  }
  return { deleted, missing }
}

export function isDocsPath(_path: string): boolean {
  void _path // 占位:当前放行所有路径,后续可接入白名单校验
  return true
}

export { relative, sep }

/** 上传多个文件到文档库，保留相对路径 */
export function uploadDocs(
  entries: { relativePath: string; data: Uint8Array }[],
): { created: string[]; skipped: string[] } {
  const created: string[] = []
  const skipped: string[] = []

  for (const entry of entries) {
    // 统一分隔符并拒绝路径逃逸
    const rel = entry.relativePath.replace(/\\/g, '/').replace(/^\/+/, '')
    if (!rel || rel.includes('..') || rel.startsWith('/')) {
      skipped.push(entry.relativePath)
      continue
    }
    if (!isDocsPath(rel)) {
      skipped.push(rel)
      continue
    }
    try {
      const abs = safeJoin(rel)
      mkdirSync(dirname(abs), { recursive: true })
      writeFileSync(abs, entry.data)
      created.push(rel)
    } catch {
      skipped.push(rel)
    }
  }

  return { created, skipped }
}
