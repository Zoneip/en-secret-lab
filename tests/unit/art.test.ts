import { describe, it, expect } from 'vitest'
import {
  CHARACTERS,
  PAW,
  paletteFor,
  mix,
} from '../../src/components/mascot/art'

describe('吉祥物画稿', () => {
  const names = ['DCH', 'FWB', 'Coulyer', 'Zoneip']

  it('四个角色 × 双形态 = 8 幅画', () => {
    expect(Object.keys(CHARACTERS)).toHaveLength(4)
    for (const [theme, set] of Object.entries(CHARACTERS)) {
      expect(names).toContain(set.name)
      expect(set.boy.rows.length).toBeGreaterThan(15)
      expect(set.furry.rows.length).toBeGreaterThan(15)
      expect(theme).toMatch(/gray|yellow|purple|white/)
    }
  })

  it('每幅画行宽一致且不超过 20', () => {
    const all = [
      ...Object.values(CHARACTERS).flatMap((c) => [c.boy, c.furry]),
      PAW,
    ]
    for (const a of all) {
      expect(a.rows.every((r) => r.length === a.width)).toBe(true)
    }
  })

  it('只使用合法调色板字符', () => {
    const valid = new Set(['1', '2', '3', '4', '5', 'f', 'F', 'w', '.'])
    const all = Object.values(CHARACTERS).flatMap((c) => [
      ...c.boy.rows,
      ...c.furry.rows,
    ])
    for (const row of all) {
      for (const ch of row) expect(valid.has(ch)).toBe(true)
    }
  })

  it('角色间造型互不相同', () => {
    const sig = (rows: string[]) => rows.join('')
    const sigs = new Set(
      Object.values(CHARACTERS).flatMap((c) => [
        sig(c.boy.rows),
        sig(c.furry.rows),
      ]),
    )
    expect(sigs.size).toBe(8)
  })
})

describe('调色板', () => {
  it('mix 混合正确', () => {
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080')
    expect(mix('#FF0000', '#FFFFFF', 0)).toBe('#ff0000')
    expect(mix('#000000', '#FFFFFF', 1)).toBe('#ffffff')
  })

  it('paletteFor 生成全色阶', () => {
    const p = paletteFor({ primary: '#8B5CF6', secondary: '#C084FC' })
    expect(p.primary).toBe('#8B5CF6')
    expect(p.light).not.toBe(p.primary)
    expect(p.dark).not.toBe(p.primary)
    expect(p.eye).toMatch(/^#[0-9a-f]{6}$/i)
    expect(p.white).toBe('#FFFFFF')
  })
})
