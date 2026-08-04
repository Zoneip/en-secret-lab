import gray from '../../themes/presets/gray.json'
import yellow from '../../themes/presets/yellow.json'
import purple from '../../themes/presets/purple.json'
import white from '../../themes/presets/white.json'
import { isThemeId } from './engine'
import type { ThemePreset } from './engine'

export const themes: ThemePreset[] = [gray, yellow, purple, white]

export const DEFAULT_THEME = 'gray'

export function getTheme(id: string): ThemePreset {
  return themes.find((t) => t.id === (isThemeId(id) ? id : DEFAULT_THEME)) ?? themes[0]
}
