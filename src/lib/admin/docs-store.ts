/** 文档库:content/docs/ 文件树(txt/md 混合,支持嵌套文件夹) */
import { mkdirSync, readdirSync, readFileSync, writeFileSync, renameSync, rmSync, statSync, existsSync } from 'node:fs'
import { join, relative, normalize, sep, extname, basename } from 'node:path'

export interface DocNode {
  id: string
  name: string
  type: 'file' | 'dir'
  path: string
  size?: number
  children?: DocNode[]
}

const DOCS_EXTS = ['.md', '.mdx', '.txt', '.text', '.markdown']

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
      .sort((a, b) => (a.isDirectory() === b.isDirectory() ? a.name.localeCompare(b.name) : a.isDirectory() ? -1 : 1))
      .map((d): DocNode => {
        const abs = join(dir, d.name)
        const relPath = rel ? `${rel}/${d.name}` : d.name
        if (d.isDirectory()) {
          return { id: `dir:${relPath}`, name: d.name, type: 'dir', path: relPath, children: walk(abs, relPath) }
        }
        if (!DOCS_EXTS.includes(extname(d.name).toLowerCase())) return null as unknown as DocNode
        return { id: `file:${relPath}`, name: d.name, type: 'file', path: relPath, size: statSync(abs).size }
      })
      .filter(Boolean)
  return walk(root, '')
}

export function readDoc(path: string): { name: string; content: string } {
  const abs = safeJoin(path)
  if (!existsSync(abs) || statSync(abs).isDirectory()) throw new Error('文件不存在')
  return { name: basename(abs), content: readFileSync(abs, 'utf8') }
}

export function writeDoc(path: string, content: string): void {
  const abs = safeJoin(path)
  if (!existsSync(abs) || statSync(abs).isDirectory()) throw new Error('文件不存在')
  writeFileSync(abs, content, 'utf8')
}

export function createDoc(parent: string, name: string, type: 'file' | 'dir'): void {
  const abs = safeJoin(parent, name)
  if (existsSync(abs)) throw new Error('同名文件或文件夹已存在')
  if (type === 'dir') mkdirSync(abs)
  else writeFileSync(abs, '', 'utf8')
}

export function renameDoc(path: string, newName: string): void {
  if (newName.includes('/') || newName.includes('\\') || !newName) throw new Error('名称无效')
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

export function isDocsPath(path: string): boolean {
  return DOCS_EXTS.includes(extname(path).toLowerCase())
}

export { relative, sep }
