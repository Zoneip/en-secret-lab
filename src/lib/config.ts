/** 站点配置(L2)读取:静态版读 public/site-config.json,动态版走控制台存储 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import { isServer } from './utils'
import type { ThemeOverride } from './theme/engine'

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

/** 读取 L2 配置;读取失败(缺文件/格式错)回退默认,不阻断构建 */
export function getSiteConfig(): SiteConfig {
  if (cached) return cached
  if (isServer) {
    cached = DEFAULT_SITE_CONFIG
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

export function getThemeOverrides(): Record<string, ThemeOverride> {
  return getSiteConfig().themeOverrides as Record<string, ThemeOverride>
}
