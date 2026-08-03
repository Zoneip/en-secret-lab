import { describe, it, expect } from 'vitest'
import { resolveTheme, wallpaperCss, isThemeId, isColorMode } from '../../src/lib/theme/engine'
import type { ThemePreset } from '../../src/lib/theme/engine'

const preset: ThemePreset = {
  id: 'gray',
  name: '灰糖',
  description: '',
  mascot: { primary: '#5C677D', secondary: '#9AA5B5' },
  wallpaper: {
    light: 'gradient:linear-gradient(#eee, #ddd)',
    dark: 'gradient:linear-gradient(#111, #000)',
  },
  palette: {
    light: {
      bg: '#F4F5F7',
      surface: '#FFFFFF',
      elevated: '#FCFCFD',
      fg: '#2B2E35',
      'fg-muted': '#5C6170',
      'fg-subtle': '#8A8F9E',
      border: '#E3E5EA',
      'border-strong': '#C9CDD6',
      primary: '#5C677D',
      'primary-soft': '#EAEDF2',
      'primary-fg': '#FFFFFF',
      accent: '#9AA5B5',
      'accent-soft': '#F0F2F6',
      'accent-fg': '#2B2E35',
      'wallpaper-overlay': 'rgba(0,0,0,0.1)',
      shadow: 'none',
    },
    dark: {
      bg: '#15171C',
      surface: '#1E2128',
      elevated: '#262A33',
      fg: '#E2E4EA',
      'fg-muted': '#A2A7B3',
      'fg-subtle': '#6E7380',
      border: '#2C303A',
      'border-strong': '#3D424E',
      primary: '#93A3BC',
      'primary-soft': '#2A3140',
      'primary-fg': '#15171C',
      accent: '#7C8CA3',
      'accent-soft': '#242B38',
      'accent-fg': '#E2E4EA',
      'wallpaper-overlay': 'rgba(0,0,0,0.5)',
      shadow: 'none',
    },
  },
}

describe('resolveTheme', () => {
  it('无覆盖时返回原预设', () => {
    expect(resolveTheme(preset)).toBe(preset)
  })

  it('覆盖色值作用于两个模式', () => {
    const r = resolveTheme(preset, { palette: { primary: '#123456' } })
    expect(r.palette.light.primary).toBe('#123456')
    expect(r.palette.dark.primary).toBe('#123456')
    expect(r.palette.light.bg).toBe('#F4F5F7')
  })

  it('覆盖壁纸只改对应字段', () => {
    const r = resolveTheme(preset, { wallpaper: { dark: 'url:/x.png' } })
    expect(r.wallpaper.light).toBe(preset.wallpaper.light)
    expect(r.wallpaper.dark).toBe('url:/x.png')
  })
})

describe('wallpaperCss', () => {
  it('剥离 gradient: 前缀', () => {
    expect(wallpaperCss('gradient:linear-gradient(#eee, #ddd)')).toBe('linear-gradient(#eee, #ddd)')
  })
  it('url: 转为 url()', () => {
    expect(wallpaperCss('url:/assets/x.png')).toBe('url(/assets/x.png)')
  })
  it('原样返回未知格式', () => {
    expect(wallpaperCss('#ff0000')).toBe('#ff0000')
  })
})

describe('type guards', () => {
  it('isThemeId', () => {
    expect(isThemeId('gray')).toBe(true)
    expect(isThemeId('purple')).toBe(true)
    expect(isThemeId('red')).toBe(false)
  })
  it('isColorMode', () => {
    expect(isColorMode('light')).toBe(true)
    expect(isColorMode('system')).toBe(false)
  })
})
