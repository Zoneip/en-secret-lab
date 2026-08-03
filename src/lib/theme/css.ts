/** 主题覆盖 → 运行时 CSS 变量(控制台修改即时生效,无需重建)
 * 使用 :root:root 提高特异性,确保覆盖内置生成的 theme-tokens CSS */
import type { ThemeOverride } from './engine'

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
