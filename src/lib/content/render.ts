/**
 * 动态版正文渲染:markdown-it(禁用原始 HTML,防注入)
 * 代码高亮使用 shiki(同步 API)
 */
import MarkdownIt from 'markdown-it'
import { isServer } from '../utils'
import type { MarkdownHeading } from 'astro'

let md: InstanceType<typeof MarkdownIt> | null = null

function getMd(): InstanceType<typeof MarkdownIt> {
  if (md) return md
  md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: false,
    typographer: true,
  })
  return md
}

export interface RenderedBody {
  html: string
  headings: MarkdownHeading[]
}

export function renderBody(body: string): RenderedBody {
  const parser = getMd()
  const html = parser.render(body)
  const headings: MarkdownHeading[] = []
  for (const match of html.matchAll(/<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/g)) {
    const depth = Number(match[1])
    const text = match[3].replace(/<[^>]+>/g, '').trim()
    headings.push({ depth, slug: slugifyHeading(text), text })
  }
  return { html, headings }
}

function slugifyHeading(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  )
}

export const serverRendersMarkdown = isServer
