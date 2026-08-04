/** 主题覆盖 → 运行时 CSS 变量(控制台修改即时生效,无需重建)
 * 使用 :root:root 提高特异性,确保覆盖内置生成的 theme-tokens CSS */
import type { ThemeOverride } from './engine'

/** topbar 配置 → CSS 变量声明(与 scripts/gen-theme-css.mjs 的 topbarVars 保持一致) */
export function topbarVars(topbar: { style?: string; accent?: boolean; ornament?: string; height?: number }, mode: 'light' | 'dark'): string {
  const style = topbar?.style ?? 'glass'
  const accent = topbar?.accent ?? false
  const ornament = topbar?.ornament ?? 'none'
  const height = topbar?.height ?? 56
  const text = mode === 'light' ? '%233A3D45' : '%23ffffff'
  let bg: string
  let grad: string
  let blur: string
  let line = 'none'
  if (style === 'solid') {
    bg = 'var(--bg)'
    grad = 'none'
    blur = '0px'
  } else if (style === 'gradient') {
    bg = 'var(--bg)'
    grad = 'linear-gradient(180deg, color-mix(in srgb, var(--primary) 18%, transparent), transparent 78%)'
    blur = '0px'
  } else {
    bg = 'color-mix(in srgb, var(--bg) 76%, transparent)'
    grad = 'none'
    blur = '12px'
  }
  if (accent) {
    line = 'linear-gradient(90deg, transparent, var(--primary) 28%, var(--accent) 50%, var(--primary) 72%, transparent)'
  }
  let orn = 'none'
  if (ornament === 'dots') {
    orn = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='10' shape-rendering='crispEdges'%3E%3Crect x='4' y='4' width='2' height='2' fill='${text}' opacity='0.5'/%3E%3Crect x='17' y='4' width='2' height='2' fill='${text}' opacity='0.35'/%3E%3Crect x='30' y='4' width='2' height='2' fill='${text}' opacity='0.5'/%3E%3C/svg%3E")`
  } else if (ornament === 'wave') {
    orn = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='12' shape-rendering='crispEdges'%3E%3Crect x='2' y='8' width='4' height='2' fill='${text}' opacity='0.5'/%3E%3Crect x='8' y='6' width='4' height='4' fill='${text}' opacity='0.35'/%3E%3Crect x='14' y='4' width='4' height='6' fill='${text}' opacity='0.5'/%3E%3Crect x='20' y='6' width='4' height='4' fill='${text}' opacity='0.3'/%3E%3Crect x='26' y='8' width='4' height='2' fill='${text}' opacity='0.5'/%3E%3Crect x='32' y='5' width='4' height='5' fill='${text}' opacity='0.35'/%3E%3Crect x='38' y='7' width='4' height='3' fill='${text}' opacity='0.5'/%3E%3Crect x='44' y='8' width='4' height='2' fill='${text}' opacity='0.3'/%3E%3C/svg%3E")`
  } else if (ornament === 'leaf') {
    orn = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='14' shape-rendering='crispEdges'%3E%3Crect x='3' y='8' width='3' height='3' fill='%23F2A8C4' opacity='0.65'/%3E%3Crect x='4' y='9' width='1' height='1' fill='%23FFD8E6'/%3E%3Crect x='17' y='5' width='3' height='3' fill='%23F2A8C4' opacity='0.4'/%3E%3Crect x='30' y='9' width='3' height='3' fill='%23F2A8C4' opacity='0.6'/%3E%3Crect x='38' y='4' width='3' height='3' fill='%23F2A8C4' opacity='0.35'/%3E%3C/svg%3E")`
  }
  const tint = 'linear-gradient(180deg, color-mix(in srgb, var(--primary) 16%, transparent), color-mix(in srgb, var(--accent) 7%, transparent) 100%)'
  return `--topbar-bg: ${bg};--topbar-grad: ${grad};--topbar-blur: ${blur};--topbar-line: ${line};--topbar-ornament-src: ${orn};--topbar-height: ${height}px;--topbar-tint: ${tint};`
}

export function themeOverrideCss(overrides: Record<string, ThemeOverride>): string {
  const rules: string[] = []
  for (const [themeId, ov] of Object.entries(overrides)) {
    if (ov.palette && Object.keys(ov.palette).length > 0) {
      const decls = Object.entries(ov.palette)
        .map(([k, v]) => `--${k}: ${v};`)
        .join('')
      for (const mode of ['light', 'dark'] as const) {
        rules.push(`:root:root[data-theme="${themeId}"][data-mode="${mode}"]{${decls}}`)
      }
    }
    if (ov.topbar) {
      for (const mode of ['light', 'dark'] as const) {
        rules.push(`:root:root[data-theme="${themeId}"][data-mode="${mode}"]{${topbarVars(ov.topbar, mode)}}`)
      }
    }
    if (ov.wallpaper) {
      for (const mode of ['light', 'dark'] as const) {
        const src = ov.wallpaper[mode]
        if (!src) continue
        const cssVal = src.startsWith('gradient:')
          ? src.slice('gradient:'.length)
          : src.startsWith('url:')
            ? `url(${src.slice('url:'.length)})`
            : src
        rules.push(`:root:root[data-theme="${themeId}"]{--wallpaper-${mode}-src: ${cssVal};}`)
      }
    }
  }
  return rules.join('\n')
}
