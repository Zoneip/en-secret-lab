/** 站点配置(L2)读取:静态版读 public/site-config.json,动态版走 SQLite(控制台写入) */
import { readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { createRequire } from 'node:module'
import { z } from 'zod'
import { isServer } from './utils'
import type { ThemeOverride } from './theme/engine'

const require = createRequire(import.meta.url)

export const siteConfigSchema = z.object({
  title: z.string().default('EN 的秘密实验室'),
  description: z.string().default('一个圆润可爱的 Kemono 风个人博客'),
  author: z.string().default('EN'),
  defaultTheme: z.enum(['gray', 'yellow', 'purple', 'white']).default('gray'),
  /** 全局开关 */
  features: z
    .object({
      search: z.boolean().default(true),
      comments: z.boolean().default(false),
      rss: z.boolean().default(true),
      wallpapers: z.boolean().default(true),
      admin: z.boolean().default(false),
      resources: z.boolean().default(false),
    })
    .default({
      search: true,
      comments: false,
      rss: true,
      wallpapers: true,
      admin: false,
      resources: false,
    }),
  /** 壁纸跟随主题渲染时是否使用图片(站长关闭则纯色/渐变) */
  wallpaperEnabled: z.boolean().default(true),
  /** 主题级覆盖(控制台写入) */
  themeOverrides: z.record(z.string(), z.any()).default({}),
  /** 页脚/导航自定义 */
  nav: z
    .array(z.object({ label: z.string(), url: z.string() }))
    .default([{ label: '首页', url: '/' }]),
  /** 控制台导入的字体 */
  fonts: z
    .array(
      z.object({
        family: z.string(),
        role: z.enum(['display', 'body', 'mono']),
        files: z.array(z.string()),
      })
    )
    .default([]),
})

export type SiteConfig = z.infer<typeof siteConfigSchema>

export const DEFAULT_SITE_CONFIG: SiteConfig = siteConfigSchema.parse({})

function resolveConfigPath(): string {
  const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
  if (isServer) {
    // 动态版:L2 在 DB(控制台);尚未初始化时回退到默认
    return ''
  }
  return `${repoRoot}public/site-config.json`
}

let cached: SiteConfig | null = null

/**
 * 动态版:从 SQLite settings 表读取配置
 * 用 createRequire 加载 better-sqlite3(打包产物中 node_modules 可解析),
 * 避免跨 chunk 的相对模块引用在 SSR bundle 中失效
 */
function readDbConfig(): SiteConfig {
  const Database = require('better-sqlite3') as new (path: string) => {
    pragma(s: string): void
    exec(s: string): void
    close(): void
    prepare(s: string): { get(...args: unknown[]): { value?: string } | undefined }
  }
  const dbPath = process.env.DATABASE_PATH ?? './data/enlab.db'
  mkdirSync(dirname(dbPath), { recursive: true })
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('site_config')
  db.close()
  if (!row?.value) return DEFAULT_SITE_CONFIG
  try {
    return siteConfigSchema.parse(JSON.parse(row.value))
  } catch (e) {
    console.warn('[config] DB 配置解析失败,使用默认:', (e as Error).message)
    return DEFAULT_SITE_CONFIG
  }
}

/** 读取 L2 配置;读取失败(缺文件/格式错)回退默认,不阻断构建 */
export function getSiteConfig(): SiteConfig {
  if (cached) return cached
  if (isServer) {
    cached = readDbConfig()
    return cached
  }
  const path = resolveConfigPath()
  if (!path) {
    cached = DEFAULT_SITE_CONFIG
    return cached
  }
  try {
    const raw = readFileSync(path, 'utf8')
    cached = siteConfigSchema.parse(JSON.parse(raw))
  } catch (e) {
    console.warn(`[config] 读取 ${path} 失败,使用默认配置:`, (e as Error).message)
    cached = DEFAULT_SITE_CONFIG
  }
  return cached
}

/** 保存配置后使缓存失效(控制台调用) */
export function invalidateSiteConfig(): void {
  cached = null
}

export function getThemeOverrides(): Record<string, ThemeOverride> {
  return getSiteConfig().themeOverrides as Record<string, ThemeOverride>
}
