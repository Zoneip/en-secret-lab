/** 通用工具:环境判定、格式化、URL 助手 */

export const isServer = import.meta.env.ASTRO_MODE === 'server'

/** 站点子路径前缀(部署在 GitHub Pages 子路径时由 ASTRO_BASE 注入,base 为 / 时原样返回) */
export function withBase(path: string): string {
  // 完整 URL/data URI/锚点无需加前缀
  if (/^(https?:|data:|#)/.test(path)) return path
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '')
  return path.startsWith('/') ? base + path : `${base}/${path}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/** 估算阅读时长(中文按 300 字/分钟) */
export function readingTime(text: string): number {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length
  const latin = (text.match(/[a-zA-Z0-9]+/g) ?? []).length
  return Math.max(1, Math.ceil(cjk / 300 + latin / 200))
}

/** 绝对 URL(用于 RSS/OG/sitemap) */
export function absoluteUrl(siteUrl: string, path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return new URL(path, siteUrl.replace(/\/$/, '') + '/').toString()
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')
}
