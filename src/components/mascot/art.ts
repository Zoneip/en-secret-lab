/**
 * 像素吉祥物画稿(16 列宽)
 * 调色板字符:
 *  '1' 主色(fur/头发)  '2' 辅色(耳内/花冠)  '3' 腮红
 *  '4' 眼/口(深色)      'f' 脸部肤色           '.' 透明
 */

export interface PixelArt {
  width: number
  height: number
  rows: string[]
}

function art(rows: string[]): PixelArt {
  const width = Math.max(...rows.map((r) => r.length))
  return { width, height: rows.length, rows }
}

/** 小男孩(人类角色) */
export const BOY: PixelArt = art([
  '....11111111....',
  '...1111111111...',
  '..111111111111..',
  '..111111111111..',
  '..111.1111.111..',
  '..111111111111..',
  '..ffffffffffff..',
  '..ff.44..44.ff..',
  '..ff.44..44.ff..',
  '..ff.33..33.ff..',
  '..ffffffffffff..',
  '..ffff..ffffff..',
  '..ffffffffffff..',
  '....ffffffff....',
])

/** furry 角色(物种模糊,耳朵 + 口吻) */
export const FURRY: PixelArt = art([
  '..111......111..',
  '..1111....1111..',
  '..1221....1221..',
  '..1111....1111..',
  '...111....111...',
  '....11111111....',
  '..111111111111..',
  '..111111111111..',
  '..1.44....44.1..',
  '..1.44....44.1..',
  '..1..3....3..1..',
  '..1.11....11.1..',
  '..1.222.4.222.1..',
  '..1.111..111.1..',
  '...1111111111...',
  '....11111111....',
])

/** 爪印(小,用于角标/装饰) */
export const PAW: PixelArt = art([
  '..1.1..1.1..',
  '...1....1...',
  '..1.1..1.1..',
  '.1..1..1..1.',
  '....1111....',
  '...111111...',
  '..11111111..',
  '...111111...',
  '....1111....',
])

/** 像素调色板:由主题 mascot 色推导 */
export interface PixelPalette {
  primary: string
  secondary: string
  blush: string
  eye: string
  face: string
}

export function paletteFor(mascot: { primary: string; secondary: string }): PixelPalette {
  return {
    primary: mascot.primary,
    secondary: mascot.secondary,
    blush: mascot.secondary,
    eye: '#332F36',
    face: '#F5EFE6',
  }
}
