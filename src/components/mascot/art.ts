/**
 * 像素吉祥物画稿(20 列宽,含全身)
 *
 * 四个角色,对应四套主题,每个角色有 男孩(boy)与 furry 双形态 = 8 幅画:
 *   gray   → DCH      (冷静整洁:呆毛/垂耳)
 *   yellow → FWB      (元气开朗:尖发大耳/咧嘴大笑)
 *   purple → Coulyer  (神秘优雅:侧发长耳/斜刘海)
 *   white  → Zoneip   (纯净雪白:兜帽围巾/耳簇绒)
 *
 * 调色板字符:
 *   '1' 主色(发/毛/衣)   '2' 辅色(内耳/饰物)   '3' 主色提亮(高光/描边)
 *   '4' 主色压暗(阴影)   '5' 眼/鼻深色         'f' 皮肤
 *   'F' 皮肤阴影         'w' 白色(口吻/领子)   '.' 透明
 */

export interface PixelArt {
  width: number
  height: number
  rows: string[]
}

const WIDTH = 20

function art(rows: string[], width = WIDTH): PixelArt {
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].length !== width) {
      throw new Error(`像素画稿行宽错误:第 ${i} 行长度 ${rows[i].length} ≠ ${width} -> "${rows[i]}"`)
    }
  }
  return { width, height: rows.length, rows }
}

function applyPatches(base: string[], patches: Record<number, string>): string[] {
  const out = base.slice()
  for (const [i, row] of Object.entries(patches)) out[Number(i)] = row
  return out
}

/* ============ 基础模板 ============ */

/** 男孩基础:圆头 + 刘海 + 全身 */
const BOY_BASE = [
  '.........11.........', // 0  头顶
  '.......111111.......', // 1
  '.....1111111111.....', // 2
  '....111111111111....', // 3
  '....111111111111....', // 4
  '....1111....1111....', // 5  刘海分缝
  '....111111111111....', // 6  额头
  '...1ffffffffffff1...', // 7  脸(两侧头发)
  '...1ff55....55ff1...', // 8  眼睛
  '...1ff55....55ff1...', // 9
  '...1f.22......221...', // 10 腮红
  '...1ff...44...ff1...', // 11 嘴
  '...1ffffffffffff1...', // 12
  '....ffffffffffff....', // 13 下巴
  '.....ffffffffff.....', // 14
  '.....1111111111.....', // 15 领口
  '....111111111111....', // 16 肩
  '...11111111111111...', // 17
  '...11111111111111...', // 18
  '....111111111111....', // 19
  '......11111111......', // 20 身体收尾
]

/** furry 基础:立耳 + 口吻 + 全身 */
const FURRY_BASE = [
  '..111..........111..', // 0  耳尖
  '..1111........1111..', // 1
  '..1221........1221..', // 2  内耳
  '...111........111...', // 3
  '....111111111111....', // 4  头顶
  '....111111111111....', // 5
  '....111111111111....', // 6  额头
  '...1ffffffffffff1...', // 7  脸
  '...1ff55....55ff1...', // 8  眼睛
  '...1ff55....55ff1...', // 9
  '...1f.22......221...', // 10 腮红
  '...1wwwwwwwwwwww1...', // 11 口吻
  '...1www..55..www1...', // 12 鼻
  '...1wwwwwwwwwwww1...', // 13
  '...1ffffffffffff1...', // 14 脸侧
  '....ffffffffffff....', // 15
  '.....ffffffffff.....', // 16
  '.....1111111111.....', // 17 肩
  '...11111111111111...', // 18
  '....111111111111....', // 19
  '......11111111......', // 20
]

/* ============ 角色补丁 ============ */

const P_DCH_BOY: Record<number, string> = {
  0: '........1111........', // 呆毛
  5: '....111111111111....', // 齐刘海
  15: '.....wwwwwwwwww.....', // 白领
  16: '....11wwwwwwww11....', // 衬衫
}

const P_FWB_BOY: Record<number, string> = {
  0: '........1111........', // 尖发
  1: '......11111111......',
  5: '....111111111111....', // 齐刘海
  11: '...1ff..4444..ff1...', // 咧嘴大笑
  15: '.....1wwwwwwww1.....', // 翻领
  16: '....11wwwwwwww11....',
}

const P_COULYER_BOY: Record<number, string> = {
  5: '....1111.....111....', // 斜刘海(左长右短)
  7: '...3ffffffffffff3...', // 侧发垂落(亮色)
  8: '...3ff55....55ff3...',
  9: '...3ff55....55ff3...',
}

const P_ZONEIP_BOY: Record<number, string> = {
  2: '...31111111111113...', // 兜帽翼
  3: '...31111111111113...',
  5: '....111111111111....', // 齐刘海
  15: '.....wwwwwwwwww.....', // 围巾
  16: '....11wwwwwwww11....',
}

const P_DCH_FURRY: Record<number, string> = {
  0: '....................', // 无立耳 → 垂耳
  1: '....................',
  2: '..1111........1111..', // 垂耳根
  3: '..1111........1111..', // 垂耳
  4: '...111........111...',
  5: '....111111111111....', // 头顶(整体下移)
  6: '....111111111111....',
  7: '....111111111111....',
  8: '...1ffffffffffff1...',
  9: '...1ff55....55ff1...',
  10: '...1ff55....55ff1...',
  11: '...1f.22......221...',
  12: '...1wwwwwwwwwwww1...',
  13: '...1www..55..www1...',
  14: '...1wwwwwwwwwwww1...',
  15: '...1ffffffffffff1...',
  16: '....ffffffffffff....',
  17: '.....1111111111.....',
  18: '...11111111111111...',
  19: '....111111111111....',
  20: '......11111111......',
}

const P_FWB_FURRY: Record<number, string> = {
  0: '..1111........1111..', // 大立耳
  1: '..11111......11111..',
  2: '..12211......11221..',
  3: '..11111......11111..',
  4: '...111........111...',
  12: '...1wwwwwwwwwwwwww1.', // 宽口吻
  13: '...1www...55...www1.',
  14: '...1wwwwwwwwwwwwww1.',
  19: '....111111111111..11', // 尾巴伸出
  20: '......11111111...22.', // 尾尖
}

const P_COULYER_FURRY: Record<number, string> = {
  0: '..331..........133..', // 耳尖亮色流苏
  8: '...3ff55....55ff3...', // 侧鬓(亮色)
  9: '...3ff55....55ff3...',
}

const P_ZONEIP_FURRY: Record<number, string> = {
  0: '..1w1..........1w1..', // 耳尖白簇绒
  17: '.....1wwwwwwww1.....', // 围巾
  18: '...111wwwwwwww111...',
}

/* ============ 角色注册表 ============ */

export interface CharacterSet {
  name: string
  boy: PixelArt
  furry: PixelArt
}

export const CHARACTERS: Record<'gray' | 'yellow' | 'purple' | 'white', CharacterSet> = {
  gray: {
    name: 'DCH',
    boy: art(applyPatches(BOY_BASE, P_DCH_BOY)),
    furry: art(applyPatches(FURRY_BASE, P_DCH_FURRY)),
  },
  yellow: {
    name: 'FWB',
    boy: art(applyPatches(BOY_BASE, P_FWB_BOY)),
    furry: art(applyPatches(FURRY_BASE, P_FWB_FURRY)),
  },
  purple: {
    name: 'Coulyer',
    boy: art(applyPatches(BOY_BASE, P_COULYER_BOY)),
    furry: art(applyPatches(FURRY_BASE, P_COULYER_FURRY)),
  },
  white: {
    name: 'Zoneip',
    boy: art(applyPatches(BOY_BASE, P_ZONEIP_BOY)),
    furry: art(applyPatches(FURRY_BASE, P_ZONEIP_FURRY)),
  },
}

export const THEME_TO_CHARACTER: Record<string, keyof typeof CHARACTERS> = {
  gray: 'gray',
  yellow: 'yellow',
  purple: 'purple',
  white: 'white',
}

/* ============ 爪印(小装饰) ============ */

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
], 12)

/* ============ 调色板 ============ */

export interface PixelPalette {
  primary: string
  secondary: string
  light: string
  dark: string
  eye: string
  skin: string
  skinShadow: string
  white: string
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function toHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

/** 颜色混合:t=0 → a,t=1 → b */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a)
  const [br, bg, bb] = hexToRgb(b)
  return toHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t)
}

export function paletteFor(mascot: { primary: string; secondary: string }): PixelPalette {
  return {
    primary: mascot.primary,
    secondary: mascot.secondary,
    light: mix(mascot.primary, '#FFFFFF', 0.45),
    dark: mix(mascot.primary, '#1A1C22', 0.4),
    eye: '#332F36',
    skin: '#F5EFE6',
    skinShadow: '#E3D8C9',
    white: '#FFFFFF',
  }
}
