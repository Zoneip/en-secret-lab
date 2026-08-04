// 生成 4 主题 × 深浅 = 8 张动态像素风壁纸 SVG → public/wallpapers/
// DCH 8bit 科技 / FWB 麦田稻草人 / Coulyer 图书馆落地窗 / Zoneip 海洋浪花
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'wallpapers')
mkdirSync(outDir, { recursive: true })

const R = (x, y, w, h, fill, anim = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}"${anim ? ` class="${anim}"` : ''} fill="${fill}"/>`
const Rd = (x, y, w, h, rx, fill, anim = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"${anim ? ` class="${anim}"` : ''} fill="${fill}"/>`
const G = (open, anim = '') => `<g${anim ? ` class="${anim}"` : ''}>`

const CSS = (rules) => `<style>${rules}</style>`

// 通用:星星 + 月亮
const stars = (ys, color, count, animBase = 'tw') =>
  Array.from({ length: count }, (_, i) => {
    const x = (i * 37 + 13) % 300
    const y = ys[i % ys.length]
    return R(x, y, 1, 1, color, animBase + (i % 3))
  }).join('')
const moon = (x, y, r, color) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" class="moonp"/>` +
  `<circle cx="${x}" cy="${y}" r="${r + 4}" fill="${color}" opacity="0.18" class="moonp"/>` +
  `<circle cx="${x}" cy="${y}" r="${r + 8}" fill="${color}" opacity="0.08" class="moonp"/>`

// ---------- 1/2. DCH · 8bit 科技 ----------
function techLight() {
  const sky = ['#D8EDF7', '#CFE7F3', '#C2DEEE'].map((c, i) => R(0, i * 30, 320, 30, c)).join('')
  const sun = `<g><rect x="272" y="24" width="30" height="30" fill="#FFD23F" class="sunspin"/><rect x="278" y="30" width="18" height="18" fill="#FFE98A"/></g>`
  const clouds = `<g>${R(40, 40, 28, 7, '#FFFFFF', 'cf1')}${R(50, 34, 20, 7, '#FFFFFF', 'cf1')}${R(190, 52, 26, 6, '#FFFFFF', 'cf2')}${R(198, 47, 16, 6, '#FFFFFF', 'cf2')}</g>`
  let city = ''
  const bld = (x, w, h, col, windows) => {
    let s = ''
    for (let wy = 0; wy < h - 4; wy += 5)
      for (let wx = 2; wx < w - 3; wx += 5) s += R(x + wx, 90 - h + 3 + wy, 2, 2, windows[((wx / 5 + wy / 5) % 2) | 0])
    return R(x, 90 - h, w, h, col) + s
  }
  city += bld(8, 34, 52, '#8FB3D9', ['#FFFFFF', '#F3F9FF'])
  city += bld(48, 26, 38, '#6E93BD', ['#FFFFFF'])
  city += bld(80, 40, 60, '#55789F', ['#FFFFFF', '#E8F1FA'])
  city += bld(126, 24, 34, '#8FB3D9', ['#FFFFFF'])
  city += bld(156, 34, 50, '#6E93BD', ['#FFFFFF'])
  city += bld(196, 26, 40, '#55789F', ['#FFFFFF', '#E8F1FA'])
  city += bld(228, 40, 56, '#8FB3D9', ['#FFFFFF'])
  city += bld(274, 28, 34, '#6E93BD', ['#FFFFFF'])
  // 天线 + 信号塔
  city += R(102, 26, 2, 6, '#4A6A92') + R(101, 24, 4, 2, '#FF5C5C', 'tw0') + R(104, 26, 4, 4, '#4A6A92') + R(103, 24, 3, 3, '#FF5C5C', 'tw1')
  // 电路板前景
  const pcb = (() => {
    let s = ''
    s += R(0, 118, 320, 62, '#1E7A46')
    s += R(0, 118, 320, 4, '#2E9A5C')
    const trace = (pts, w = 2) => pts.map(([x, y]) => R(x, y, w, w, '#37B06B')).join('')
    s += trace([[0, 128], [26, 128], [26, 140], [70, 140], [70, 128], [118, 128], [118, 152], [176, 152], [176, 126], [240, 126], [240, 138], [318, 138]])
    s += trace([[10, 148], [44, 148], [44, 136], [92, 136], [92, 154], [150, 154], [150, 130], [210, 130], [210, 150], [280, 150], [280, 126], [318, 126]], 2)
    s += trace([[0, 160], [60, 160], [60, 172], [130, 172], [130, 158], [200, 158], [200, 168], [260, 168], [260, 156], [318, 156]])
    return s
  })()
  // 数据流粒子(沿线路移动)
  const flow = [0, 1, 2, 3, 4].map((i) => R(0, 0, 2, 2, '#B8FFE0', `fl${i}`)).join('')
  // 芯片
  const chip = G('') + R(140, 100, 40, 26, '#0F3B24') + R(144, 104, 32, 18, '#145033') + R(152, 110, 16, 6, '#37B06B') + R(140, 108, 3, 3, '#B8FFE0', 'tw0') + R(177, 108, 3, 3, '#B8FFE0', 'tw1') + R(140, 116, 3, 3, '#B8FFE0', 'tw1') + R(177, 116, 3, 3, '#B8FFE0', 'tw0') + '</g>'
  const term = G('') + R(8, 126, 60, 8, '#0E3A22', 'tx') + R(10, 128, 6, 1, '#7DFFE8') + R(18, 128, 1, 1, '#7DFFE8') + R(22, 128, 3, 1, '#7DFFE8') + R(30, 128, 1, 1, '#7DFFE8') + R(34, 128, 5, 1, '#7DFFE8') + R(46, 128, 1, 1, '#7DFFE8') + R(50, 128, 4, 1, '#7DFFE8') + '</g>'
  const css = CSS(`
    @keyframes cf1 { from { transform: translateX(0) } to { transform: translateX(-36px) } }
    @keyframes cf2 { from { transform: translateX(-30px) } to { transform: translateX(8px) } }
    @keyframes tw0 { 0%, 62% { opacity: 1 } 63%, 100% { opacity: .15 } }
    @keyframes tw1 { 0%, 62% { opacity: .15 } 63%, 100% { opacity: 1 } }
    @keyframes fl0 { from { transform: translate(0, 126px) } to { transform: translate(318px, 126px) } }
    @keyframes fl1 { from { transform: translate(320px, 136px) } to { transform: translate(0, 136px) } }
    @keyframes fl2 { from { transform: translate(0, 146px) } to { transform: translate(318px, 146px) } }
    @keyframes fl3 { from { transform: translate(320px, 158px) } to { transform: translate(0, 158px) } }
    @keyframes fl4 { from { transform: translate(0, 170px) } to { transform: translate(318px, 170px) } }
    @keyframes tx { from { transform: translateX(0) } to { transform: translateX(-320px) } }
    @keyframes sunspin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
    .cf1 { animation: cf1 26s linear infinite }
    .cf2 { animation: cf2 34s linear infinite }
    .tw0 { animation: tw0 1.4s steps(1) infinite }
    .tw1 { animation: tw1 1.4s steps(1) infinite }
    .fl0 { animation: fl0 6s linear infinite }
    .fl1 { animation: fl1 7s linear infinite .8s }
    .fl2 { animation: fl2 8s linear infinite 1.4s }
    .fl3 { animation: fl3 9s linear infinite .4s }
    .fl4 { animation: fl4 10s linear infinite 1.1s }
    .tx { animation: tx 3.2s linear infinite }
    .sunspin { animation: sunspin 22s linear infinite; transform-origin: 287px 39px; transform-box: fill-box }
  `)
  return { css, body: `${sky}${sun}${clouds}${city}${pcb}${chip}${flow}${term}` }
}

function techDark() {
  const sky = ['#070D1B', '#0A1428', '#0D1830'].map((c, i) => R(0, i * 30, 320, 30, c)).join('')
  const moonG = moon(268, 40, 9, '#D9E8FF')
  const city = (() => {
    let s = ''
    const bld = (x, w, h, col, n) => {
      let t = ''
      for (let wy = 4; wy < h - 4; wy += 6)
        for (let wx = 3; wx < w - 4; wx += 6) {
          const idx = (wx / 6 + wy / 6) % 3
          if (idx === 2) t += R(x + wx, 90 - h + wy, 2, 2, '#FF5CE1', 'tw0')
          else if (idx === 0) t += R(x + wx, 90 - h + wy, 2, 2, '#4AF6D4', 'tw1')
          else t += R(x + wx, 90 - h + wy, 2, 2, '#1E3A5F')
        }
      return R(x, 90 - h, w, h, col) + t
    }
    s += bld(6, 32, 54, '#0C1528')
    s += bld(44, 26, 40, '#0E1930')
    s += bld(76, 42, 62, '#0C1528')
    s += bld(124, 24, 34, '#0E1930')
    s += bld(154, 34, 50, '#0C1528')
    s += bld(194, 26, 42, '#0E1930')
    s += bld(226, 40, 58, '#0C1528')
    s += bld(272, 28, 36, '#0E1930')
    s += R(100, 26, 2, 6, '#1A2F4F') + R(99, 24, 4, 2, '#FF5C5C', 'tw0') + R(104, 26, 4, 4, '#1A2F4F') + R(103, 24, 3, 3, '#FF5C5C', 'tw1')
    return s
  })()
  const pcb = (() => {
    let s = R(0, 118, 320, 62, '#05121F')
    s += R(0, 118, 320, 4, '#0B2438')
    const trace = (pts) => pts.map(([x, y]) => R(x, y, 2, 2, '#0E3350')).join('')
    s += trace([[0, 128], [26, 128], [26, 140], [70, 140], [70, 128], [118, 128], [118, 152], [176, 152], [176, 126], [240, 126], [240, 138], [318, 138]])
    s += trace([[10, 148], [44, 148], [44, 136], [92, 136], [92, 154], [150, 154], [150, 130], [210, 130], [210, 150], [280, 150], [280, 126], [318, 126]])
    s += trace([[0, 160], [60, 160], [60, 172], [130, 172], [130, 158], [200, 158], [200, 168], [260, 168], [260, 156], [318, 156]])
    return s
  })()
  const flow = [0, 1, 2, 3, 4].map((i) => R(0, 0, 2, 2, '#7DFFE8', `fl${i}`)).join('')
  const chip = G('') + R(140, 100, 40, 26, '#04101C') + R(144, 104, 32, 18, '#06202F') + R(152, 110, 16, 6, '#7DFFE8', 'pulse') + R(140, 108, 3, 3, '#4AF6D4', 'tw0') + R(177, 108, 3, 3, '#4AF6D4', 'tw1') + R(140, 116, 3, 3, '#FF5CE1', 'tw1') + R(177, 116, 3, 3, '#FF5CE1', 'tw0') + '</g>'
  const term = G('') + R(8, 126, 60, 8, '#04101C', 'tx') + R(10, 128, 6, 1, '#33FF99') + R(18, 128, 1, 1, '#33FF99') + R(22, 128, 3, 1, '#33FF99') + R(30, 128, 1, 1, '#33FF99') + R(34, 128, 5, 1, '#33FF99') + R(46, 128, 1, 1, '#33FF99') + R(50, 128, 4, 1, '#33FF99') + '</g>'
  const twinkle = stars([8, 14, 20, 26, 32], '#9FC0E8')
  const css = CSS(`
    @keyframes tw0 { 0%, 62% { opacity: 1 } 63%, 100% { opacity: .12 } }
    @keyframes tw1 { 0%, 62% { opacity: .12 } 63%, 100% { opacity: 1 } }
    @keyframes tw2 { 0%, 45% { opacity: .25 } 46%, 100% { opacity: 1 } }
    @keyframes fl0 { from { transform: translate(0, 126px) } to { transform: translate(318px, 126px) } }
    @keyframes fl1 { from { transform: translate(320px, 136px) } to { transform: translate(0, 136px) } }
    @keyframes fl2 { from { transform: translate(0, 146px) } to { transform: translate(318px, 146px) } }
    @keyframes fl3 { from { transform: translate(320px, 158px) } to { transform: translate(0, 158px) } }
    @keyframes fl4 { from { transform: translate(0, 170px) } to { transform: translate(318px, 170px) } }
    @keyframes tx { from { transform: translateX(0) } to { transform: translateX(-320px) } }
    @keyframes pulse { 0%, 100% { opacity: .9 } 50% { opacity: .3 } }
    .tw0 { animation: tw0 1.4s steps(1) infinite }
    .tw1 { animation: tw1 1.4s steps(1) infinite }
    .tw2 { animation: tw2 2.2s steps(1) infinite }
    .fl0 { animation: fl0 6s linear infinite }
    .fl1 { animation: fl1 7s linear infinite .8s }
    .fl2 { animation: fl2 8s linear infinite 1.4s }
    .fl3 { animation: fl3 9s linear infinite .4s }
    .fl4 { animation: fl4 10s linear infinite 1.1s }
    .tx { animation: tx 3.2s linear infinite }
    .pulse { animation: pulse 2s ease-in-out infinite }
    .moonp { animation: pulse 5s ease-in-out infinite }
  `)
  return { css, body: `${sky}${moonG}${twinkle}${city}${pcb}${chip}${flow}${term}` }
}

// ---------- 3/4. FWB · 麦田稻草人 ----------
function fieldLight() {
  const sky = ['#FFF0C4', '#FDE9A6', '#FBDC8A'].map((c, i) => R(0, i * 30, 320, 30, c)).join('')
  const sun = `<g><rect x="22" y="30" width="34" height="34" fill="#F59E0B"/><rect x="30" y="38" width="18" height="18" fill="#FFE08A"/></g>`
  const clouds = `<g>${R(70, 44, 30, 7, '#FFFFFF', 'cf1')}${R(82, 38, 22, 7, '#FFFFFF', 'cf1')}${R(200, 56, 26, 6, '#FFF7E0', 'cf2')}${R(210, 51, 16, 6, '#FFF7E0', 'cf2')}</g>`
  const birds = `<g>${R(150, 34, 4, 2, '#8A6B3F', 'bf1')}${R(158, 30, 4, 2, '#8A6B3F', 'bf2')}${R(246, 40, 4, 2, '#8A6B3F', 'bf2')}</g>`
  // 麦田:横向条带(上下两层麦浪反向平移)
  const field = [
    ['#E9B93C', 90, 96, 22, 'w1'], ['#DFA933', 96, 97, 18, 'w2'], ['#E6B538', 104, 98, 16, 'w1'],
    ['#D89F2C', 112, 98, 14, 'w2'], ['#C8911F', 124, 100, 12, 'w1'], ['#BF881B', 136, 102, 10, 'w2'],
  ]
    .map(([c, y, y2, h, a]) => R(0, y, 320, h, c, a) + R(0, y2, 320, 4, '#B37F17', a))
    .join('')
  // 麦芒
  const ears = G('', 'w1') +
    [6, 40, 74, 108, 142, 176, 210, 244, 278, 308].map((x, i) =>
      R(x, 92, 1, 8, i % 2 ? '#D89F2C' : '#E9B93C')).join('') + '</g>'
  // 稻草人(居中偏右 x≈180)
  const sc = G('') +
    R(178, 74, 12, 12, '#E8C97A') + R(182, 78, 4, 4, '#5A3A1A') + R(180, 72, 8, 2, '#D9B25F') +
    R(176, 64, 18, 6, '#E5B93D') + R(170, 66, 30, 3, '#D9A82F') + R(174, 62, 22, 3, '#F2C94C') +
    R(182, 86, 6, 2, '#7A5A2A') + R(170, 88, 30, 3, '#8B5A2B') + R(168, 91, 34, 30, '#C0482F') +
    R(168, 91, 34, 30, '#C0482F') + R(174, 95, 6, 6, '#D98B7A') + R(190, 95, 6, 6, '#D98B7A') +
    R(174, 105, 6, 6, '#D98B7A') + R(190, 105, 6, 6, '#D98B7A') +
    R(174, 115, 6, 6, '#D98B7A') + R(190, 115, 6, 6, '#D98B7A') +
    R(174, 113, 22, 2, '#8B5A2B') + R(180, 100, 2, 2, '#5A3A1A') + R(188, 100, 2, 2, '#5A3A1A') + R(184, 108, 2, 2, '#5A3A1A') +
    R(184, 121, 3, 8, '#8B5A2B') + R(176, 129, 3, 10, '#8B5A2B') + R(192, 129, 3, 10, '#8B5A2B') +
    R(164, 88, 4, 22, '#C0482F') + R(201, 88, 4, 22, '#C0482F') +
    '</g>'
  const css = CSS(`
    @keyframes w1 { from { transform: translateX(0) } to { transform: translateX(-26px) } }
    @keyframes w2 { from { transform: translateX(-22px) } to { transform: translateX(6px) } }
    @keyframes cf1 { from { transform: translateX(0) } to { transform: translateX(-40px) } }
    @keyframes cf2 { from { transform: translateX(-34px) } to { transform: translateX(10px) } }
    @keyframes bf1 { from { transform: translate(0, 0) } to { transform: translate(14px, -6px) } }
    @keyframes bf2 { from { transform: translate(10px, -6px) } to { transform: translate(0, 0) } }
    .w1 { animation: w1 3.6s ease-in-out infinite alternate }
    .w2 { animation: w2 4.4s ease-in-out infinite alternate }
    .cf1 { animation: cf1 26s linear infinite }
    .cf2 { animation: cf2 30s linear infinite }
    .bf1 { animation: bf1 2.8s ease-in-out infinite alternate }
    .bf2 { animation: bf2 3.2s ease-in-out infinite alternate }
  `)
  return { css, body: `${sky}${sun}${clouds}${birds}${field}${ears}${sc}` }
}

function fieldDark() {
  const sky = ['#141B3C', '#181F45', '#1C234E'].map((c, i) => R(0, i * 30, 320, 30, c)).join('')
  const moonG = moon(52, 42, 9, '#F5E7B0')
  const tw = stars([9, 15, 21, 27, 33], '#DDE4FF')
  const field = [
    ['#4A3D1C', 90, 96, 22, 'w1'], ['#443818', 96, 97, 18, 'w2'], ['#51441F', 104, 98, 16, 'w1'],
    ['#3E3215', 112, 98, 14, 'w2'], ['#4A3D1C', 124, 100, 12, 'w1'], ['#382D12', 136, 102, 10, 'w2'],
  ]
    .map(([c, y, y2, h, a]) => R(0, y, 320, h, c, a) + R(0, y2, 320, 4, '#2E2510', a))
    .join('')
  // 稻草人剪影
  const sc = G('') +
    R(178, 74, 12, 12, '#2A2418') + R(176, 64, 18, 6, '#3A2F1C') + R(170, 66, 30, 3, '#33291A') + R(174, 62, 22, 3, '#423623') +
    R(170, 88, 30, 3, '#3A2F1C') + R(168, 91, 34, 30, '#251F14') + R(184, 121, 3, 8, '#3A2F1C') +
    R(176, 129, 3, 10, '#3A2F1C') + R(192, 129, 3, 10, '#3A2F1C') + R(164, 88, 4, 22, '#251F14') + R(201, 88, 4, 22, '#251F14') +
    // 眼睛(发光)
    R(179, 78, 3, 3, '#FFE066', 'glow') + R(186, 78, 3, 3, '#FFE066', 'glow') +
    R(178, 77, 5, 5, '#FFE066', 'halo') + R(185, 77, 5, 5, '#FFE066', 'halo') +
    '</g>'
  // 萤火虫
  const bugs = [0, 1, 2, 3, 4, 5].map((i) =>
    R(30 + i * 44, 60 + ((i * 17) % 30), 2, 2, '#D8F04C', `bg${i % 3}`)).join('')
  const css = CSS(`
    @keyframes w1 { from { transform: translateX(0) } to { transform: translateX(-20px) } }
    @keyframes w2 { from { transform: translateX(-18px) } to { transform: translateX(4px) } }
    @keyframes glow { 0%, 100% { opacity: .25 } 50% { opacity: 1 } }
    @keyframes halo { 0%, 100% { opacity: 0 } 50% { opacity: .5 } }
    @keyframes tw0 { 0%, 55% { opacity: 1 } 56%, 100% { opacity: .2 } }
    @keyframes tw1 { 0%, 40% { opacity: .2 } 41%, 100% { opacity: 1 } }
    @keyframes tw2 { 0%, 65% { opacity: 1 } 66%, 100% { opacity: .25 } }
    @keyframes bg0 { 0% { transform: translate(0, 0); opacity: .2 } 25% { opacity: 1 } 50% { transform: translate(4px, -14px); opacity: .4 } 75% { opacity: 1 } 100% { transform: translate(9px, 2px); opacity: .2 } }
    @keyframes bg1 { 0% { transform: translate(0, 0); opacity: .5 } 30% { transform: translate(-5px, -10px); opacity: 1 } 70% { transform: translate(-2px, 6px); opacity: .3 } 100% { transform: translate(5px, -4px); opacity: .5 } }
    @keyframes bg2 { 0% { transform: translate(0, 0); opacity: 1 } 40% { transform: translate(6px, 8px); opacity: .25 } 80% { transform: translate(-4px, -6px); opacity: .8 } 100% { transform: translate(0, 0); opacity: 1 } }
    .w1 { animation: w1 4.8s ease-in-out infinite alternate }
    .w2 { animation: w2 5.6s ease-in-out infinite alternate }
    .glow { animation: glow 1.6s ease-in-out infinite }
    .halo { animation: halo 1.6s ease-in-out infinite }
    .tw0 { animation: tw0 2.4s steps(1) infinite }
    .tw1 { animation: tw1 3s steps(1) infinite }
    .tw2 { animation: tw2 2s steps(1) infinite }
    .bg0 { animation: bg0 5s ease-in-out infinite }
    .bg1 { animation: bg1 6.5s ease-in-out infinite 1s }
    .bg2 { animation: bg2 5.5s ease-in-out infinite 2s }
    .moonp { animation: glow 5s ease-in-out infinite }
  `)
  return { css, body: `${sky}${moonG}${tw}${field}${sc}${bugs}` }
}

// ---------- 5/6. Coulyer · 图书馆落地窗 ----------
function libraryDay() {
  const wallTop = ['#C9BCE8', '#C0B2E2'].map((c, i) => R(0, i * 20, 320, 20, c)).join('')
  const wallBottom = ['#B09BD6', '#A68FC9'].map((c, i) => R(0, 40 + i * 20, 320, 20, c)).join('')
  const floor = R(0, 80, 320, 100, '#7E6BB0') + R(0, 80, 320, 4, '#8A77BC')
  // 中央落地窗(120-200)
  const window_ = G('') +
    R(118, 24, 84, 90, '#4A3A78') + R(122, 28, 76, 82, '#B8A7F0') +
    R(122, 28, 76, 82, 'url(#lg)') +
    R(128, 34, 12, 12, '#EADDFF') + R(128, 52, 12, 12, '#EADDFF') + R(128, 70, 12, 12, '#EADDFF') +
    R(146, 34, 12, 12, '#D9C9FF') + R(146, 52, 12, 12, '#D9C9FF') + R(146, 70, 12, 12, '#D9C9FF') +
    R(164, 34, 12, 12, '#C9B4FF') + R(164, 52, 12, 12, '#C9B4FF') + R(164, 70, 12, 12, '#C9B4FF') +
    R(182, 34, 12, 12, '#EADDFF') + R(182, 52, 12, 12, '#EADDFF') + R(182, 70, 12, 12, '#EADDFF') +
    R(122, 28, 4, 82, '#4A3A78') + R(194, 28, 4, 82, '#4A3A78') + R(122, 28, 76, 4, '#4A3A78') + R(122, 106, 76, 4, '#4A3A78') +
    R(158, 28, 4, 82, '#4A3A78') + R(122, 66, 76, 3, '#4A3A78') +
    '</g>'
  // 光柱(从窗斜射)
  const beam = `<g class="beam"><rect x="132" y="110" width="56" height="54" fill="#B9A6F5" opacity="0.34"/><rect x="152" y="110" width="22" height="54" fill="#C9B9F7" opacity="0.4"/></g>`
  const spot = `<rect x="126" y="150" width="68" height="10" fill="#D9CCF8" opacity="0.3" class="beam"/>`
  // 左右书架
  const shelf = (x) => {
    let s = R(x, 24, 96, 96, '#5C4A94') + R(x + 2, 26, 92, 6, '#6F5CA8')
    const colors = ['#A78BFA', '#F0ABFC', '#FDE68A', '#93C5FD', '#FCA5A5', '#86EFAC', '#C4B5FD', '#FDBA74']
    for (let row = 0; row < 5; row++) {
      const y = 32 + row * 18
      let bx = x + 4
      while (bx < x + 88) {
        const w = 4 + ((bx * 7) % 6)
        s += R(bx, y + 2, w, 13, colors[(bx + row) % colors.length])
        bx += w + 1
      }
      s += R(x + 2, y + 15, 92, 3, '#4A3A78')
    }
    return s + R(x + 96, 24, 2, 96, '#4A3A78')
  }
  // 前景书桌
  const desk = G('') +
    R(96, 148, 128, 6, '#6F5CA8') + R(100, 154, 4, 16, '#5C4A94') + R(216, 154, 4, 16, '#5C4A94') +
    R(132, 128, 28, 20, '#9B8AD0') + R(134, 130, 10, 18, '#F3EDFF') + R(148, 130, 10, 18, '#F3EDFF') +
    R(130, 126, 32, 2, '#5C4A94') + R(170, 132, 14, 4, '#8A77BC') +
    '</g>'
  // 挂钟
  const clock = `<g class="clockspin"><rect x="48" y="60" width="14" height="14" fill="#4A3A78"/><rect x="50" y="62" width="10" height="10" fill="#F3EDFF"/><rect x="54" y="64" width="2" height="5" fill="#4A3A78"/></g>`
  const grad = `<defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A78BFA" stop-opacity="0.55"/><stop offset="1" stop-color="#7C5CE0" stop-opacity="0.3"/></linearGradient></defs>`
  const css = CSS(`
    @keyframes beam { 0%, 100% { opacity: .45 } 50% { opacity: .9 } }
    @keyframes clockspin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
    .beam { animation: beam 4s ease-in-out infinite }
    .clockspin { animation: clockspin 18s linear infinite; transform-origin: 55px 67px; transform-box: fill-box }
  `)
  return { css, body: `${grad}${wallTop}${wallBottom}${floor}${window_}${shelf(2)}${shelf(222)}${beam}${spot}${desk}${clock}` }
}

function libraryNight() {
  const wall = R(0, 0, 320, 180, '#2A1B4E') + R(0, 80, 320, 100, '#1C1236') + R(0, 80, 320, 4, '#241744')
  // 落地窗:深紫夜空 + 月亮
  const window_ = G('') +
    R(118, 24, 84, 90, '#3A2A60') + R(122, 28, 76, 82, '#1B1240') +
    R(150, 40, 10, 10, '#E6D9FF') + R(152, 42, 6, 6, '#F4EEFF') +
    R(136, 34, 12, 12, '#2E2160') + R(136, 52, 12, 12, '#2E2160') + R(136, 70, 12, 12, '#2E2160') +
    R(154, 34, 12, 12, '#332567') + R(154, 52, 12, 12, '#332567') + R(154, 70, 12, 12, '#332567') +
    R(172, 34, 12, 12, '#2E2160') + R(172, 52, 12, 12, '#2E2160') + R(172, 70, 12, 12, '#2E2160') +
    R(190, 34, 12, 12, '#332567') + R(190, 52, 12, 12, '#332567') + R(190, 70, 12, 12, '#332567') +
    R(122, 28, 4, 82, '#3A2A60') + R(194, 28, 4, 82, '#3A2A60') + R(122, 28, 76, 4, '#3A2A60') + R(122, 106, 76, 4, '#3A2A60') +
    R(158, 28, 4, 82, '#3A2A60') + R(122, 66, 76, 3, '#3A2A60') +
    '</g>'
  const skyStars = stars([32, 38, 44, 50, 56], '#B9A6F5', 4)
  // 月光柱
  const beam = `<g class="mbeam"><rect x="140" y="112" width="44" height="56" fill="#B9A6F5" opacity="0.16"/><rect x="156" y="112" width="14" height="56" fill="#C9B9F7" opacity="0.2"/></g>`
  const spot = `<rect x="134" y="152" width="56" height="8" fill="#C9B9F7" opacity="0.14" class="mbeam"/>`
  const shelf = (x) => {
    let s = R(x, 24, 96, 96, '#241A44') + R(x + 2, 26, 92, 6, '#2E2354')
    const colors = ['#4C3A7A', '#5A3E8A', '#3E2E66', '#59409A', '#46346F']
    for (let row = 0; row < 5; row++) {
      const y = 32 + row * 18
      let bx = x + 4
      while (bx < x + 88) {
        const w = 4 + ((bx * 7) % 6)
        s += R(bx, y + 2, w, 13, colors[(bx + row) % colors.length])
        bx += w + 1
      }
      s += R(x + 2, y + 15, 92, 3, '#1A1030')
    }
    return s
  }
  const desk = G('') +
    R(96, 148, 128, 6, '#3A2A60') + R(100, 154, 4, 16, '#2A1B4E') + R(216, 154, 4, 16, '#2A1B4E') +
    R(134, 130, 26, 18, '#46346F') + R(130, 126, 34, 2, '#2A1B4E') +
    R(172, 134, 4, 8, '#B49AE0') + R(170, 128, 8, 8, '#B49AE0') + R(172, 132, 4, 4, '#FFE9B0', 'lamp') +
    '</g>'
  // 窗台睡猫
  const cat = G('') +
    R(174, 106, 10, 4, '#141022') + R(176, 104, 6, 2, '#141022') + R(184, 106, 3, 2, '#141022', 'tail') +
    '</g>'
  const css = CSS(`
    @keyframes mbeam { 0%, 100% { opacity: .4 } 50% { opacity: .85 } }
    @keyframes lamp { 0%, 100% { opacity: .6 } 50% { opacity: 1 } }
    @keyframes tail { from { transform: rotate(0deg) } to { transform: rotate(24deg) } }
    @keyframes tw0 { 0%, 60% { opacity: 1 } 61%, 100% { opacity: .2 } }
    @keyframes tw1 { 0%, 40% { opacity: .2 } 41%, 100% { opacity: 1 } }
    @keyframes tw2 { 0%, 70% { opacity: 1 } 71%, 100% { opacity: .3 } }
    .mbeam { animation: mbeam 6s ease-in-out infinite }
    .lamp { animation: lamp 3s ease-in-out infinite }
    .tail { animation: tail 3.2s ease-in-out infinite alternate; transform-origin: 186px 107px; transform-box: fill-box }
    .tw0 { animation: tw0 2.4s steps(1) infinite }
    .tw1 { animation: tw1 3s steps(1) infinite }
    .tw2 { animation: tw2 2s steps(1) infinite }
  `)
  return { css, body: `${wall}${window_}${skyStars}${shelf(2)}${shelf(222)}${beam}${spot}${desk}${cat}` }
}

// ---------- 7/8. Zoneip · 海洋 ----------
function seaDay() {
  const sky = ['#BFE9F8', '#B5E4F6', '#A9DEF3'].map((c, i) => R(0, i * 24, 320, 24, c)).join('')
  const sun = `<g><rect x="250" y="26" width="34" height="34" fill="#FBD75E"/><rect x="258" y="34" width="18" height="18" fill="#FFEB9E"/></g>`
  const clouds = `<g>${R(34, 38, 30, 7, '#FFFFFF', 'cf1')}${R(46, 32, 20, 7, '#FFFFFF', 'cf1')}${R(176, 46, 26, 6, '#FFFFFF', 'cf2')}${R(184, 41, 16, 6, '#FFFFFF', 'cf2')}</g>`
  const gulls = `<g>${R(120, 26, 6, 2, '#4A6A92', 'gl1')}${R(140, 20, 6, 2, '#4A6A92', 'gl2')}${R(204, 30, 6, 2, '#4A6A92', 'gl2')}</g>`
  // 海面:4 条带 + 流动
  const sea = [
    ['#5FC3E8', 72, 24, 's1'], ['#4BB3DE', 96, 22, 's2'], ['#3AA4D3', 118, 20, 's1'], ['#2E95C6', 138, 18, 's2'],
  ]
    .map(([c, y, h, a]) => R(0, y, 320, h, c, a)).join('')
  // 浪花(白色锯齿,飘动)
  const foam = (() => {
    let s = ''
    const rows = [
      [72, 'f1', ['#FFFFFF', '#E8FBFF']],
      [96, 'f2', ['#FFFFFF', '#DFF7FF']],
      [118, 'f1', ['#FFFFFF', '#D9F4FF']],
      [138, 'f2', ['#FFFFFF', '#D0F0FF']],
    ]
    for (const [y, a, cols] of rows) {
      let x = 0
      while (x < 320) {
        s += R(x, y, 3 + (x % 5), 3, cols[x % 2], a)
        x += 7 + (x % 3)
      }
    }
    return s
  })()
  // 船
  const boat = `<g class="boat">${R(66, 118, 22, 3, '#7A4E2B')}${R(70, 112, 14, 6, '#F7F3E8')}${R(84, 112, 2, 10, '#7A4E2B')}${R(72, 114, 8, 2, '#EFE9DA')}</g>`
  const css = CSS(`
    @keyframes s1 { from { transform: translateX(0) } to { transform: translateX(-40px) } }
    @keyframes s2 { from { transform: translateX(-34px) } to { transform: translateX(8px) } }
    @keyframes f1 { from { transform: translateX(0); opacity: .95 } 50% { opacity: .6 } to { transform: translateX(-40px); opacity: .95 } }
    @keyframes f2 { from { transform: translateX(-34px); opacity: .75 } 50% { opacity: 1 } to { transform: translateX(8px); opacity: .75 } }
    @keyframes boat { from { transform: rotate(-2.5deg) translateY(0) } 50% { transform: rotate(2.5deg) translateY(1px) } to { transform: rotate(-2.5deg) translateY(0) } }
    @keyframes cf1 { from { transform: translateX(0) } to { transform: translateX(-40px) } }
    @keyframes cf2 { from { transform: translateX(-32px) } to { transform: translateX(12px) } }
    @keyframes gl1 { from { transform: translate(0, 0) } to { transform: translate(10px, -5px) } }
    @keyframes gl2 { from { transform: translate(8px, -4px) } to { transform: translate(0, 0) } }
    .s1 { animation: s1 9s linear infinite }
    .s2 { animation: s2 11s linear infinite }
    .f1 { animation: f1 9s linear infinite }
    .f2 { animation: f2 11s linear infinite }
    .boat { animation: boat 3.4s ease-in-out infinite; transform-origin: 77px 118px; transform-box: fill-box }
    .cf1 { animation: cf1 28s linear infinite }
    .cf2 { animation: cf2 32s linear infinite }
    .gl1 { animation: gl1 2.6s ease-in-out infinite alternate }
    .gl2 { animation: gl2 3s ease-in-out infinite alternate }
  `)
  return { css, body: `${sky}${sun}${clouds}${gulls}${sea}${foam}${boat}` }
}

function seaDark() {
  const sky = ['#081826', '#0A1E31', '#0D2540'].map((c, i) => R(0, i * 24, 320, 24, c)).join('')
  const moonG = moon(252, 42, 10, '#E8F2FF')
  const tw = stars([8, 14, 20, 26, 32], '#BFD8F2')
  const sea = [
    ['#0E2F52', 72, 24, 's1'], ['#0C2848', 96, 22, 's2'], ['#0A2140', 118, 20, 's1'], ['#081A36', 138, 18, 's2'],
  ]
    .map(([c, y, h, a]) => R(0, y, 320, h, c, a)).join('')
  // 月光路径(水面)
  const path = `<g class="mpath">${[0, 1, 2, 3, 4, 5, 6].map((i) => R(150 + i * 2, 76 + i * 12, 8 + (i % 2) * 4, 3, '#DFEEFF', 'mp' + (i % 2))).join('')}</g>`
  // 浪花微光
  const foam = (() => {
    let s = ''
    const rows = [
      [72, 'f1'], [96, 'f2'], [118, 'f1'], [138, 'f2'],
    ]
    for (const [y, a] of rows) {
      let x = 0
      while (x < 314) {
        s += R(x, y, 3 + (x % 5), 2, '#D9EFFF', a)
        x += 8 + (x % 3); if (x > 316) break
      }
    }
    return s
  })()
  // 灯塔
  const light = G('') +
    R(24, 92, 20, 46, '#202C44') + R(26, 94, 16, 40, '#E8E3DA') +
    R(26, 96, 16, 8, '#C0392B') + R(28, 92, 12, 4, '#202C44') +
    R(30, 100, 8, 4, '#FFE98A', 'lantern') + R(32, 118, 4, 8, '#202C44') +
    `<g class="sweep"><rect x="34" y="100" width="26" height="3" fill="#FFE98A" opacity="0.5"/></g>` +
    '</g>'
  const css = CSS(`
    @keyframes s1 { from { transform: translateX(0) } to { transform: translateX(-36px) } }
    @keyframes s2 { from { transform: translateX(-30px) } to { transform: translateX(8px) } }
    @keyframes f1 { from { transform: translateX(0); opacity: .4 } 50% { opacity: .9 } to { transform: translateX(-36px); opacity: .4 } }
    @keyframes f2 { from { transform: translateX(-30px); opacity: .7 } 50% { opacity: .35 } to { transform: translateX(8px); opacity: .7 } }
    @keyframes lantern { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }
    @keyframes sweep { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
    @keyframes mp0 { 0%, 100% { opacity: .3 } 50% { opacity: .8 } }
    @keyframes mp1 { 0%, 100% { opacity: .7 } 50% { opacity: .25 } }
    @keyframes tw0 { 0%, 55% { opacity: 1 } 56%, 100% { opacity: .2 } }
    @keyframes tw1 { 0%, 40% { opacity: .2 } 41%, 100% { opacity: 1 } }
    @keyframes tw2 { 0%, 65% { opacity: 1 } 66%, 100% { opacity: .25 } }
    .s1 { animation: s1 10s linear infinite }
    .s2 { animation: s2 12s linear infinite }
    .f1 { animation: f1 10s linear infinite }
    .f2 { animation: f2 12s linear infinite }
    .lantern { animation: lantern 1.8s steps(1) infinite }
    .sweep { animation: sweep 8s linear infinite; transform-origin: 34px 101px; transform-box: fill-box }
    .mp0 { animation: mp0 3.4s ease-in-out infinite }
    .mp1 { animation: mp1 4.2s ease-in-out infinite }
    .tw0 { animation: tw0 2.4s steps(1) infinite }
    .tw1 { animation: tw1 3s steps(1) infinite }
    .tw2 { animation: tw2 2s steps(1) infinite }
    .moonp { animation: lantern 6s ease-in-out infinite }
  `)
  return { css, body: `${sky}${moonG}${tw}${sea}${path}${foam}${light}` }
}

// ---------- 输出 ----------
const specs = [
  ['gray-tech-light.svg', 'DCH 8bit 科技 · 白天', techLight()],
  ['gray-tech-dark.svg', 'DCH 8bit 科技 · 黑夜', techDark()],
  ['yellow-field-light.svg', 'FWB 麦田 · 白天', fieldLight()],
  ['yellow-field-dark.svg', 'FWB 麦田 · 黑夜', fieldDark()],
  ['purple-library-day.svg', 'Coulyer 图书馆 · 阅读', libraryDay()],
  ['purple-library-night.svg', 'Coulyer 图书馆 · 睡眠', libraryNight()],
  ['white-sea-day.svg', 'Zoneip 海洋 · 白天', seaDay()],
  ['white-sea-dark.svg', 'Zoneip 海洋 · 黑夜', seaDark()],
]

for (const [name, label, { css, body }] of specs) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" shape-rendering="crispEdges">\n${css}\n${body}\n</svg>`
  writeFileSync(join(outDir, name), svg)
  console.log(`✓ ${name}  (${label}, ${Math.round(svg.length / 1024)}KB)`)
}
console.log('全部生成 →', outDir)
