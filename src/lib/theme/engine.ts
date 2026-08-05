/** 主题引擎:类型定义、三层配置合并、Token 映射 */

export interface ColorTokens {
  bg: string
  surface: string
  elevated: string
  fg: string
  'fg-muted': string
  'fg-subtle': string
  border: string
  'border-strong': string
  primary: string
  'primary-soft': string
  'primary-fg': string
  accent: string
  'accent-soft': string
  'accent-fg': string
  'wallpaper-overlay': string
  shadow: string
}

export interface ThemePreset {
  id: string
  name: string
  description: string
  mascot: { primary: string; secondary: string }
  wallpaper: { light: string; dark: string }
  palette: { light: ColorTokens; dark: ColorTokens }
}

export type ThemeId = 'gray' | 'yellow' | 'purple' | 'white' | 'random'
export type ColorMode = 'light' | 'dark'

/** 访客偏好 localStorage 键名 */
export const PREFS_KEY = 'enlab:prefs'

/** 可随机选取的主题池(排除 friends 和 random 自身) */
export const RANDOM_POOL: ThemeId[] = ['gray', 'yellow', 'purple', 'white']

/** L2 站长配置对主题的覆盖(控制台产出) */
export interface ThemeOverride {
  /** 覆盖后的色值,key 为 token 名 */
  palette?: Partial<ColorTokens> & Partial<Record<'wallpaper-overlay' | 'shadow', string>>
  /** 覆盖壁纸源,支持 gradient: / url: */
  wallpaper?: { light?: string; dark?: string }
  /** 顶部栏美化:style=glass/solid/gradient,accent=主题渐变线,ornament=none/dots/wave/leaf,height 像素 */
  topbar?: { style?: 'glass' | 'solid' | 'gradient'; accent?: boolean; ornament?: 'none' | 'dots' | 'wave' | 'leaf'; height?: number }
}

/** 访客偏好(L3) */
export interface ThemePrefs {
  theme?: ThemeId
  themeLocked: boolean
  mode: ColorMode | 'system'
}

/** 合并 L1 预设 + L2 站长覆盖,产出最终生效配置 */
export function resolveTheme(preset: ThemePreset, override?: ThemeOverride): ThemePreset {
  if (!override) return preset
  return {
    ...preset,
    palette: {
      light: { ...preset.palette.light, ...override.palette },
      dark: { ...preset.palette.dark, ...override.palette },
    },
    wallpaper: {
      light: override.wallpaper?.light ?? preset.wallpaper.light,
      dark: override.wallpaper?.dark ?? preset.wallpaper.dark,
    },
  }
}

/** 解析壁纸源字符串为可用的 background 值 */
export function wallpaperCss(value: string): string {
  if (value.startsWith('gradient:')) return value.slice('gradient:'.length)
  if (value.startsWith('url:')) return `url(${value.slice('url:'.length)})`
  return value
}

export function isThemeId(value: string): value is ThemeId {
  return value === 'gray' || value === 'yellow' || value === 'purple' || value === 'white' || value === 'random' || value === 'friends'
}

/** 从主题池随机选一个主题 */
export function randomTheme(): ThemeId {
  return RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)]
}

export function isColorMode(value: string): value is ColorMode {
  return value === 'light' || value === 'dark'
}
