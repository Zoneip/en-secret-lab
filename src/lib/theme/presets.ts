import gray from '../../themes/presets/gray.json'
import yellow from '../../themes/presets/yellow.json'
import purple from '../../themes/presets/purple.json'
import white from '../../themes/presets/white.json'
import friends from '../../themes/presets/friends.json'
import { isThemeId } from './engine'
import type { ThemePreset } from './engine'

export const themes: ThemePreset[] = [gray, yellow, purple, white, friends]

export const DEFAULT_THEME = 'gray'

export function getTheme(id: string): ThemePreset {
  // 'random' 不是实际预设,回退到 gray
  const lookupId = id === 'random' ? 'gray' : (isThemeId(id) ? id : DEFAULT_THEME)
  return themes.find((t) => t.id === lookupId) ?? themes[0]
}
