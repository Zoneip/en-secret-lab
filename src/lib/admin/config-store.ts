/**
 * 站点配置存储(动态版 L2):读取/写入 DB,与静态版 public/site-config.json 同构
 */
import { siteConfigSchema, type SiteConfig } from '../config'
import { settingGet, settingSet } from './db'

const CONFIG_KEY = 'site_config'

export function loadSiteConfig(): SiteConfig {
  const raw = settingGet(CONFIG_KEY)
  if (!raw) return siteConfigSchema.parse({})
  try {
    return siteConfigSchema.parse(JSON.parse(raw))
  } catch (e) {
    console.warn('[config] DB 配置解析失败,使用默认:', (e as Error).message)
    return siteConfigSchema.parse({})
  }
}

export function saveSiteConfig(config: SiteConfig): void {
  const parsed = siteConfigSchema.parse(config)
  settingSet(CONFIG_KEY, JSON.stringify(parsed))
}

/** 删除主题覆盖(重置某主题到内置预设) */
export function clearThemeOverride(themeId: string): void {
  const cfg = loadSiteConfig()
  const { [themeId]: _removed, ...rest } = cfg.themeOverrides
  void _removed
  cfg.themeOverrides = rest
  saveSiteConfig(cfg)
}
