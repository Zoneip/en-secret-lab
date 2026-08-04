// 生成 4 主题 × 深浅 = 8 张动态像素风壁纸 SVG → public/wallpapers/(v2 细化布景)
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
const G = (anim = '') => `<g${anim ? ` class="${anim}"` : ''}>`

/** 后处理:整图放大 k 倍(坐标/尺寸/位移/原点 ×k),提升像素密度 */
function scaleSvg(svg, k) {
  const scaleAttr = (attr) => {
    const re = new RegExp(`${attr}="(-?\\d+(?:\\.\\d+)?)"`, 'g')
    return svg.replace(re, (m, v) => `${attr}="${(parseFloat(v) * k).toFixed(2).replace(/\\.?0+$/, '')}"`)
  }
  for (const a of ['x', 'y', 'width', 'height', 'rx', 'cx', 'cy', 'r']) svg = scaleAttr(a)
  svg = svg.replace(/(-?\d+(?:\.\d+)?)px/g, (m, v) => `${parseFloat(v) * k}px`)
  svg = svg.replace(/viewBox="0 0 320 180"/, `viewBox="0 0 ${320 * k} ${180 * k}"`)
  return svg
}

const CSS = (rules) => `<style>${rules}</style>`

const stars = (ys, color, count, animBase = 'tw') =>
  Array.from({ length: count }, (_, i) => {
    const x = (i * 37 + 13) % 300
    const y = ys[i % ys.length]
    return R(x, y, 1, 1, color, animBase + (i % 3))
  }).join('')
const moon = (x, y, r, color, craters = '') =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" class="moonp"/>` +
  `<circle cx="${x}" cy="${y}" r="${r + 4}" fill="${color}" opacity="0.16" class="moonp"/>` +
  `<circle cx="${x}" cy="${y}" r="${r + 9}" fill="${color}" opacity="0.07" class="moonp"/>` +
  craters

// 通用:像素树(远/近两版)
const tree = (x, y, h, leaf, trunk, leafW) =>
  R(x - 1, y + h - 2, leafW + 2, 2, '#3E3215') +
  R(x + Math.floor(leafW / 2) - 1, y + h - 4, 2, 2, trunk) +
  R(x, y, leafW, h, leaf) +
  R(x + 2, y - 1, leafW - 4, 2, leaf)

// 通用:像素云(带底影)
const cloud = (x, y, s, main, shadow) =>
  R(x, y + 2, 20 * s, 4 * s, shadow) +
  R(x, y, 20 * s, 4 * s, main) +
  R(x + 3 * s, y - 2 * s, 14 * s, 3 * s, main) +
  R(x + 6 * s, y - 4 * s, 8 * s, 3 * s, main)

// ---------- 1/2. DCH · 8bit 科技 ----------
function techLight() {
  const sky = ['#DFF0F8', '#D2E9F4', '#C4E0EF', '#B7D8EA'].map((c, i) => R(0, i * 22, 320, 22, c)).join('')
  // 航迹云 + 像素太阳(光芒线)
  const sun = G() +
    R(270, 22, 34, 34, '#FFD23F', 'sunspin') + R(278, 30, 18, 18, '#FFE98A') +
    R(266, 36, 3, 6, '#FFE98A', 'tw0') + R(305, 36, 3, 6, '#FFE98A', 'tw0') + R(283, 16, 6, 3, '#FFE98A', 'tw0') + R(283, 59, 6, 3, '#FFE98A', 'tw0') +
    '</g>'
  const contrail = R(20, 18, 26, 2, '#FFFFFF', 'cf2') + R(30, 16, 14, 2, '#FFFFFF', 'cf2')
  const clouds = G() + cloud(44, 42, 1, '#FFFFFF', '#D8ECF5') + cloud(186, 56, 1, '#F7FBFF', '#D8ECF5') + cloud(96, 24, 1, '#FFFFFF', '#D8ECF5') + '</g>'
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
  // 屋顶细节:水塔/天线/排烟
  city += R(24, 36, 5, 3, '#4A6A92') + R(25, 33, 3, 3, '#2F4A6B')
  city += R(92, 28, 4, 3, '#4A6A92') + R(93, 25, 2, 3, '#4A6A92')
  city += R(168, 38, 3, 3, '#4A6A92') + R(169, 36, 1, 2, '#4A6A92')
  city += R(240, 32, 5, 3, '#4A6A92') + R(242, 29, 2, 3, '#4A6A92')
  // 天线 + 信号塔(闪烁灯)
  city += R(102, 26, 2, 6, '#4A6A92') + R(101, 24, 4, 2, '#FF5C5C', 'tw0') + R(104, 26, 4, 4, '#4A6A92') + R(103, 24, 3, 3, '#FF5C5C', 'tw1')
  // 像素招牌 DCH
  city += R(92, 48, 14, 9, '#1F2F47') + R(94, 50, 10, 5, '#FF5C5C', 'sign1') + R(94, 50, 2, 5, '#FFD9D9') + R(97, 50, 1, 5, '#FFD9D9') + R(100, 50, 2, 5, '#FFD9D9') + R(95, 51, 1, 1, '#FFF')
  city += R(166, 52, 12, 8, '#1F2F47') + R(168, 54, 8, 4, '#4AF6D4', 'sign2') + R(168, 54, 2, 4, '#C9FFEF') + R(171, 54, 2, 4, '#C9FFEF') + R(174, 54, 2, 4, '#C9FFEF')
  // 电路板前景(焊点/过孔/分支)
  const pcb = (() => {
    let s = ''
    s += R(0, 118, 320, 62, '#1E7A46')
    s += R(0, 118, 320, 4, '#2E9A5C')
    const trace = (pts, w = 2) => pts.map(([x, y]) => R(x, y, w, w, '#37B06B')).join('')
    s += trace([[0, 128], [26, 128], [26, 140], [70, 140], [70, 128], [118, 128], [118, 152], [176, 152], [176, 126], [240, 126], [240, 138], [318, 138]])
    s += trace([[10, 148], [44, 148], [44, 136], [92, 136], [92, 154], [150, 154], [150, 130], [210, 130], [210, 150], [280, 150], [280, 126], [318, 126]], 2)
    s += trace([[0, 160], [60, 160], [60, 172], [130, 172], [130, 158], [200, 158], [200, 168], [260, 168], [260, 156], [318, 156]])
    // 分支走线 + 焊点
    s += trace([[70, 140], [70, 148], [84, 148], [84, 166]])
    s += trace([[176, 152], [176, 164], [196, 164]])
    s += trace([[240, 138], [240, 146], [258, 146]])
    s += R(84, 166, 2, 2, '#8FD9A8') + R(196, 164, 2, 2, '#8FD9A8') + R(258, 146, 2, 2, '#8FD9A8')
    s += R(70, 140, 3, 3, '#8FD9A8') + R(176, 152, 3, 3, '#8FD9A8') + R(240, 138, 3, 3, '#8FD9A8')
    // LED 灯点
    s += R(30, 126, 2, 2, '#FF8A5C', 'tw0') + R(120, 170, 2, 2, '#FFD23F', 'tw1') + R(208, 158, 2, 2, '#FF8A5C', 'tw0')
    return s
  })()
  const flow = [0, 1, 2, 3, 4, 5].map((i) => R(0, 0, 2, 2, i % 2 ? '#B8FFE0' : '#FFFFFF', `fl${i}`)).join('')
  // 芯片(引脚/纹理)
  const chip = G() + R(140, 100, 40, 26, '#0F3B24') + R(144, 104, 32, 18, '#145033') +
    R(152, 110, 16, 6, '#37B06B') + R(154, 112, 4, 2, '#8FD9A8') + R(160, 112, 4, 2, '#8FD9A8') + R(166, 112, 4, 2, '#8FD9A8') +
    R(140, 108, 3, 3, '#B8FFE0', 'tw0') + R(177, 108, 3, 3, '#B8FFE0', 'tw1') + R(140, 116, 3, 3, '#B8FFE0', 'tw1') + R(177, 116, 3, 3, '#B8FFE0', 'tw0') +
    '</g>'
  const term = G() + R(8, 126, 60, 8, '#0E3A22', 'tx1') +
    R(10, 128, 4, 1, '#7DFFE8') + R(15, 128, 1, 1, '#7DFFE8') + R(18, 128, 3, 1, '#7DFFE8') + R(22, 128, 1, 1, '#7DFFE8') + R(25, 128, 2, 1, '#7DFFE8') + R(30, 128, 1, 1, '#7DFFE8') + R(33, 128, 4, 1, '#7DFFE8') + R(40, 128, 1, 1, '#7DFFE8') + R(43, 128, 3, 1, '#7DFFE8') + R(48, 128, 1, 1, '#7DFFE8') + R(51, 128, 4, 1, '#7DFFE8') +
    R(10, 130, 2, 1, '#7DFFE8') + R(14, 130, 3, 1, '#7DFFE8') + R(19, 130, 1, 1, '#7DFFE8') + R(22, 130, 5, 1, '#7DFFE8') + R(29, 130, 2, 1, '#7DFFE8') + R(33, 130, 1, 1, '#7DFFE8') + R(36, 130, 4, 1, '#7DFFE8') +
    R(52, 129, 3, 3, '#B8FFE0', 'cursor') +
    '</g>'
  const term2 = G() + R(258, 160, 54, 8, '#0E3A22', 'tx2') +
    R(260, 162, 5, 1, '#37B06B') + R(266, 162, 2, 1, '#37B06B') + R(270, 162, 4, 1, '#37B06B') + R(276, 162, 1, 1, '#37B06B') + R(279, 162, 3, 1, '#37B06B') + R(284, 162, 2, 1, '#37B06B') + R(288, 162, 6, 1, '#37B06B') +
    R(296, 163, 3, 3, '#B8FFE0', 'cursor') + '</g>'
  // UFO 飘过
  const ufo = G('ufo') +
    R(258, 52, 16, 3, '#9BB6D4') + R(262, 50, 8, 2, '#C9DBEA') + R(262, 55, 8, 2, '#C9DBEA') +
    R(265, 53, 2, 2, '#FF5C5C', 'tw0') + R(270, 54, 2, 1, '#FFE98A') +
    '</g>'
  const css = CSS(`
    @keyframes cf1 { from { transform: translateX(0) } to { transform: translateX(-36px) } }
    @keyframes cf2 { from { transform: translateX(-30px) } to { transform: translateX(8px) } }
    @keyframes tw0 { 0%, 62% { opacity: 1 } 63%, 100% { opacity: .15 } }
    @keyframes tw1 { 0%, 62% { opacity: .15 } 63%, 100% { opacity: 1 } }
    @keyframes tw2 { 0%, 45% { opacity: .2 } 46%, 100% { opacity: 1 } }
    @keyframes sign1 { 0%, 55% { opacity: 1 } 56%, 100% { opacity: .55 } }
    @keyframes sign2 { 0%, 55% { opacity: .55 } 56%, 100% { opacity: 1 } }
    @keyframes fl0 { from { transform: translate(0, 126px) } to { transform: translate(318px, 126px) } }
    @keyframes fl1 { from { transform: translate(318px, 136px) } to { transform: translate(0, 136px) } }
    @keyframes fl2 { from { transform: translate(0, 146px) } to { transform: translate(318px, 146px) } }
    @keyframes fl3 { from { transform: translate(318px, 158px) } to { transform: translate(0, 158px) } }
    @keyframes fl4 { from { transform: translate(0, 170px) } to { transform: translate(318px, 170px) } }
    @keyframes fl5 { from { transform: translate(318px, 128px) } to { transform: translate(0, 128px) } }
    @keyframes tx1 { from { transform: translateX(0) } to { transform: translateX(-68px) } }
    @keyframes tx2 { from { transform: translateX(0) } to { transform: translateX(-112px) } }
    @keyframes sunspin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
    @keyframes cursor { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
    @keyframes ufofly { from { transform: translate(0, 0) } 25% { transform: translate(-20px, -3px) } 50% { transform: translate(-40px, 0) } 75% { transform: translate(-60px, -3px) } to { transform: translate(-80px, 0) } }
    .cf1 { animation: cf1 26s linear infinite }
    .cf2 { animation: cf2 34s linear infinite }
    .tw0 { animation: tw0 1.4s steps(1) infinite }
    .tw1 { animation: tw1 1.4s steps(1) infinite }
    .tw2 { animation: tw2 2.2s steps(1) infinite }
    .sign1 { animation: sign1 1.8s steps(1) infinite }
    .sign2 { animation: sign2 1.8s steps(1) infinite }
    .fl0 { animation: fl0 6s linear infinite }
    .fl1 { animation: fl1 7s linear infinite .8s }
    .fl2 { animation: fl2 8s linear infinite 1.4s }
    .fl3 { animation: fl3 9s linear infinite .4s }
    .fl4 { animation: fl4 10s linear infinite 1.1s }
    .fl5 { animation: fl5 5.4s linear infinite 2s }
    .tx1 { animation: tx1 3.4s linear infinite }
    .tx2 { animation: tx2 4.2s linear infinite 1s }
    .cursor { animation: cursor .9s steps(1) infinite }
    .sunspin { animation: sunspin 22s linear infinite; transform-origin: 287px 39px; transform-box: fill-box }
    .ufo { animation: ufofly 14s linear infinite }
  `)
  return { css, body: `${sky}${sun}${contrail}${clouds}${city}${pcb}${chip}${flow}${term}${term2}${ufo}` }
}

function techDark() {
  const sky = ['#050A16', '#081021', '#0B1529', '#0E1A33'].map((c, i) => R(0, i * 22, 320, 22, c)).join('')
  const moonG = moon(268, 38, 9, '#D9E8FF') +
    R(265, 35, 2, 2, '#B7C9EC') + R(271, 40, 2, 2, '#B7C9EC') + R(266, 43, 1, 1, '#B7C9EC')
  const tw = stars([6, 12, 18, 24, 30, 48], '#9FC0E8') +
    R(10, 8, 1, 1, '#FFFFFF', 'shoot') + R(11, 8, 3, 1, '#9FC0E8', 'shoot')
  // 卫星(带信号波)
  const sat = G('sat') +
    R(36, 16, 8, 6, '#1E3A5F') + R(38, 12, 4, 4, '#2E5A8F') + R(38, 22, 4, 3, '#0C1528') +
    R(36, 12, 2, 6, '#2E5A8F') + R(46, 12, 2, 6, '#2E5A8F') +
    R(43, 17, 1, 1, '#FF5C5C', 'tw0') + R(43, 15, 1, 1, '#FF5C5C', 'tw1') + R(43, 13, 1, 1, '#FF5C5C', 'tw0') +
    '</g>'
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
    // 霓虹招牌
    s += R(92, 48, 14, 9, '#0B1529') + R(94, 50, 10, 5, '#FF5CE1', 'sign2') + R(94, 50, 2, 5, '#FFB8F2') + R(97, 50, 1, 5, '#FFB8F2') + R(100, 50, 2, 5, '#FFB8F2')
    s += R(166, 52, 12, 8, '#0B1529') + R(168, 54, 8, 4, '#4AF6D4', 'sign1') + R(168, 54, 2, 4, '#C9FFEF') + R(171, 54, 2, 4, '#C9FFEF') + R(174, 54, 2, 4, '#C9FFEF')
    s += R(58, 60, 10, 7, '#0B1529') + R(60, 62, 6, 3, '#FFD23F', 'sign2') + R(60, 62, 2, 3, '#FFF0B8') + R(63, 62, 3, 3, '#FFF0B8')
    // 屋顶细节
    s += R(24, 36, 5, 3, '#1A2F4F') + R(25, 33, 3, 3, '#12223A')
    s += R(92, 28, 4, 3, '#1A2F4F') + R(93, 25, 2, 3, '#12223A')
    s += R(168, 38, 3, 3, '#1A2F4F') + R(169, 36, 1, 2, '#12223A')
    s += R(240, 32, 5, 3, '#1A2F4F') + R(242, 29, 2, 3, '#12223A')
    return s
  })()
  const pcb = (() => {
    let s = R(0, 118, 320, 62, '#04101C')
    s += R(0, 118, 320, 4, '#0B2438')
    const trace = (pts) => pts.map(([x, y]) => R(x, y, 2, 2, '#0E3350')).join('')
    s += trace([[0, 128], [26, 128], [26, 140], [70, 140], [70, 128], [118, 128], [118, 152], [176, 152], [176, 126], [240, 126], [240, 138], [318, 138]])
    s += trace([[10, 148], [44, 148], [44, 136], [92, 136], [92, 154], [150, 154], [150, 130], [210, 130], [210, 150], [280, 150], [280, 126], [318, 126]])
    s += trace([[0, 160], [60, 160], [60, 172], [130, 172], [130, 158], [200, 158], [200, 168], [260, 168], [260, 156], [318, 156]])
    s += trace([[70, 140], [70, 148], [84, 148], [84, 166]])
    s += trace([[176, 152], [176, 164], [196, 164]])
    s += trace([[240, 138], [240, 146], [258, 146]])
    // 霓虹节点
    s += R(84, 166, 2, 2, '#4AF6D4', 'tw0') + R(196, 164, 2, 2, '#FF5CE1', 'tw1') + R(258, 146, 2, 2, '#4AF6D4', 'tw1')
    s += R(70, 140, 3, 3, '#7DFFE8', 'pulse') + R(176, 152, 3, 3, '#FF7BDD', 'pulse') + R(240, 138, 3, 3, '#7DFFE8', 'pulse')
    s += R(30, 126, 2, 2, '#FF8A5C', 'tw0') + R(120, 170, 2, 2, '#FFD23F', 'tw1') + R(208, 158, 2, 2, '#FF8A5C', 'tw0')
    return s
  })()
  const flow = [0, 1, 2, 3, 4, 5].map((i) => R(0, 0, 2, 2, '#7DFFE8', `fl${i}`)).join('')
  const chip = G() +
    R(140, 100, 40, 26, '#04101C') + R(144, 104, 32, 18, '#06202F') +
    R(150, 108, 20, 10, '#0E3350') + R(152, 110, 16, 6, '#7DFFE8', 'pulse') +
    R(154, 112, 4, 2, '#B8FFE0') + R(160, 112, 4, 2, '#B8FFE0') + R(166, 112, 4, 2, '#B8FFE0') +
    R(140, 108, 3, 3, '#4AF6D4', 'tw0') + R(177, 108, 3, 3, '#4AF6D4', 'tw1') + R(140, 116, 3, 3, '#FF5CE1', 'tw1') + R(177, 116, 3, 3, '#FF5CE1', 'tw0') +
    '</g>'
  const term = G() + R(8, 126, 60, 8, '#04101C', 'tx1') +
    R(10, 128, 4, 1, '#33FF99') + R(15, 128, 1, 1, '#33FF99') + R(18, 128, 3, 1, '#33FF99') + R(22, 128, 1, 1, '#33FF99') + R(25, 128, 2, 1, '#33FF99') + R(30, 128, 1, 1, '#33FF99') + R(33, 128, 4, 1, '#33FF99') + R(40, 128, 1, 1, '#33FF99') + R(43, 128, 3, 1, '#33FF99') + R(48, 128, 1, 1, '#33FF99') + R(51, 128, 4, 1, '#33FF99') +
    R(10, 130, 2, 1, '#33FF99') + R(14, 130, 3, 1, '#33FF99') + R(19, 130, 1, 1, '#33FF99') + R(22, 130, 5, 1, '#33FF99') + R(29, 130, 2, 1, '#33FF99') + R(33, 130, 1, 1, '#33FF99') + R(36, 130, 4, 1, '#33FF99') +
    R(52, 129, 3, 3, '#B8FFE0', 'cursor') +
    '</g>'
  const term2 = G() + R(258, 160, 54, 8, '#04101C', 'tx2') +
    R(260, 162, 5, 1, '#33FF99') + R(266, 162, 2, 1, '#33FF99') + R(270, 162, 4, 1, '#33FF99') + R(276, 162, 1, 1, '#33FF99') + R(279, 162, 3, 1, '#33FF99') + R(284, 162, 2, 1, '#33FF99') + R(288, 162, 6, 1, '#33FF99') +
    R(296, 163, 3, 3, '#B8FFE0', 'cursor') + '</g>'
  const css = CSS(`
    @keyframes tw0 { 0%, 62% { opacity: 1 } 63%, 100% { opacity: .12 } }
    @keyframes tw1 { 0%, 62% { opacity: .12 } 63%, 100% { opacity: 1 } }
    @keyframes tw2 { 0%, 45% { opacity: .25 } 46%, 100% { opacity: 1 } }
    @keyframes sign1 { 0%, 55% { opacity: 1 } 56%, 100% { opacity: .5 } }
    @keyframes sign2 { 0%, 55% { opacity: .5 } 56%, 100% { opacity: 1 } }
    @keyframes fl0 { from { transform: translate(0, 126px) } to { transform: translate(318px, 126px) } }
    @keyframes fl1 { from { transform: translate(318px, 136px) } to { transform: translate(0, 136px) } }
    @keyframes fl2 { from { transform: translate(0, 146px) } to { transform: translate(318px, 146px) } }
    @keyframes fl3 { from { transform: translate(318px, 158px) } to { transform: translate(0, 158px) } }
    @keyframes fl4 { from { transform: translate(0, 170px) } to { transform: translate(318px, 170px) } }
    @keyframes fl5 { from { transform: translate(318px, 128px) } to { transform: translate(0, 128px) } }
    @keyframes tx1 { from { transform: translateX(0) } to { transform: translateX(-68px) } }
    @keyframes tx2 { from { transform: translateX(0) } to { transform: translateX(-112px) } }
    @keyframes pulse { 0%, 100% { opacity: .9 } 25% { opacity: .6 } 50% { opacity: .3 } 75% { opacity: .65 } }
    @keyframes cursor { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
    @keyframes shoot { from { transform: translate(0, 0); opacity: 1 } to { transform: translate(-30px, 18px); opacity: 0 } }
    @keyframes satfly { from { transform: translate(0, 0) } to { transform: translate(26px, 3px) } }
    .tw0 { animation: tw0 1.4s steps(1) infinite }
    .tw1 { animation: tw1 1.4s steps(1) infinite }
    .tw2 { animation: tw2 2.2s steps(1) infinite }
    .sign1 { animation: sign1 1.8s steps(1) infinite }
    .sign2 { animation: sign2 1.8s steps(1) infinite }
    .fl0 { animation: fl0 6s linear infinite }
    .fl1 { animation: fl1 7s linear infinite .8s }
    .fl2 { animation: fl2 8s linear infinite 1.4s }
    .fl3 { animation: fl3 9s linear infinite .4s }
    .fl4 { animation: fl4 10s linear infinite 1.1s }
    .fl5 { animation: fl5 5.4s linear infinite 2s }
    .tx1 { animation: tx1 3.4s linear infinite }
    .tx2 { animation: tx2 4.2s linear infinite 1s }
    .cursor { animation: cursor .9s steps(1) infinite }
    .pulse { animation: pulse 2s ease-in-out infinite }
    .moonp { animation: pulse 5s ease-in-out infinite }
    .shoot { animation: shoot 7s linear infinite }
    .sat { animation: satfly 12s ease-in-out infinite alternate }
  `)
  return { css, body: `${sky}${moonG}${tw}${sat}${city}${pcb}${chip}${flow}${term}${term2}` }
}

// ---------- 3/4. FWB · 麦田稻草人 ----------
function fieldLight() {
  const sky = ['#FFF6D8', '#FFF0C0', '#FDE9A6', '#FBDC8A'].map((c, i) => R(0, i * 22, 320, 22, c)).join('')
  const sun = G() +
    R(16, 24, 36, 36, '#F59E0B') + R(24, 32, 20, 20, '#FFE08A') + R(28, 36, 12, 12, '#FFF0C0') +
    R(10, 39, 3, 6, '#FDE68A') + R(55, 39, 3, 6, '#FDE68A') + R(31, 16, 6, 3, '#FDE68A') + R(31, 65, 6, 3, '#FDE68A') +
    '</g>'
  const clouds = G() + cloud(64, 44, 1, '#FFFFFF', '#F3E2B8') + cloud(206, 58, 1, '#FFF9EC', '#F3E2B8') + cloud(128, 30, 1, '#FFFFFF', '#F3E2B8') + '</g>'
  const birds = G() +
    R(150, 32, 4, 2, '#8A6B3F', 'bf1') + R(158, 28, 4, 2, '#8A6B3F', 'bf2') + R(246, 38, 4, 2, '#8A6B3F', 'bf2') +
    R(120, 52, 4, 2, '#8A6B3F', 'bf1') + '</g>'
  // 远处:小木屋 + 树
  const house = R(238, 78, 20, 14, '#E8DCC4') + R(234, 74, 28, 5, '#B85C38') + R(234, 74, 8, 2, '#C96A42') + R(254, 74, 8, 2, '#C96A42') +
    R(244, 82, 6, 8, '#7A5230') + R(246, 84, 2, 4, '#2F2318') + R(246, 86, 2, 2, '#FFD98A') +
    R(238, 82, 4, 4, '#2F2318') + R(240, 82, 2, 4, '#FFD98A') +
    R(252, 82, 4, 4, '#2F2318') + R(254, 82, 2, 4, '#FFD98A') + R(240, 92, 14, 4, '#B85C38')
  const trees = G() + tree(216, 66, 16, '#5E9B4C', '#4A3A1F', 12) + tree(204, 62, 14, '#6FAE59', '#4A3A1F', 10) + '</g>'
  // 栅栏
  const fence = [30, 48, 66, 84, 102, 120, 138, 156].map((x) => R(x, 88, 2, 14, '#B8945A')).join('') + R(26, 92, 134, 2, '#C8A468')
  // 麦田:更多分层条带(三层麦浪反向)
  const field = [
    ['#F0C247', 90, 96, 22, 'w1'], ['#E9B93C', 96, 97, 18, 'w2'], ['#F2C54E', 104, 98, 16, 'w1'],
    ['#DFA933', 112, 98, 14, 'w2'], ['#E6B538', 124, 100, 12, 'w1'], ['#D89F2C', 136, 102, 10, 'w2'],
    ['#E0AC33', 146, 104, 9, 'w1'], ['#C8911F', 155, 106, 8, 'w2'],
  ]
    .map(([c, y, y2, h, a]) => R(0, y, 320, h, c, a) + R(0, y2, 320, 3, '#B37F17', a))
    .join('')
  // 麦芒:密度加倍
  const ears = G('w1') +
    [3, 9, 15, 21, 27, 33, 39, 45, 51, 57, 63, 69, 75, 81, 87, 93, 99, 105, 111, 117, 123, 129, 135, 141, 147, 153, 159, 165, 171, 177, 183, 189, 195, 201, 207, 213, 219, 225, 231, 237, 243, 249, 255, 261, 267, 273, 279, 285, 291, 297, 303, 309, 315]
      .map((x, i) => R(x, 90 + (i % 2) * 3, 1, 7, i % 2 ? '#D89F2C' : '#E9B93C'))
      .join('') + '</g>'
  // 前景大麦穗(轮廓)
  const bigEar = (x, y) =>
    R(x, y, 2, 3, '#C8911F') + R(x - 1, y + 3, 4, 2, '#C8911F') + R(x, y + 5, 2, 4, '#B37F17') + R(x, y + 9, 2, 3, '#B37F17')
  // 稻草人(细化:帽/脸/围巾/衬衫/手)
  const sc = G() +
    // 木杆
    R(184, 121, 3, 8, '#8B5A2B') + R(176, 129, 3, 10, '#8B5A2B') + R(192, 129, 3, 10, '#8B5A2B') +
    // 帽子(双层檐 + 装饰带)
    R(176, 62, 22, 3, '#F2C94C') + R(170, 65, 34, 3, '#E5B93D') + R(178, 58, 18, 5, '#E5B93D') + R(182, 56, 10, 2, '#F2C94C') + R(172, 68, 30, 2, '#D9A82F') +
    // 头
    R(178, 70, 18, 14, '#E8C97A') + R(181, 73, 12, 8, '#D9B25F') +
    // 脸:眼/嘴/腮红/针脚
    R(183, 75, 2, 2, '#4A2F18') + R(190, 75, 2, 2, '#4A2F18') + R(183, 75, 1, 1, '#FFF2D9') + R(190, 75, 1, 1, '#FFF2D9') +
    R(185, 79, 5, 1, '#4A2F18') + R(186, 78, 3, 2, '#7A5A2A') +
    R(181, 72, 2, 1, '#B78A4A') + R(191, 72, 2, 1, '#B78A4A') +
    R(176, 82, 2, 2, '#D9A87A') + R(196, 82, 2, 2, '#D9A87A') +
    // 围巾(飘动)
    R(178, 84, 18, 3, '#D96C3F', 'scarf') + R(180, 87, 4, 4, '#D96C3F', 'scarf') + R(187, 87, 3, 3, '#B85530', 'scarf') +
    // 衬衫(格子 + 补丁 + 纽扣)
    R(170, 88, 34, 30, '#C0482F') +
    R(172, 90, 5, 5, '#D98B7A') + R(181, 90, 5, 5, '#D98B7A') + R(190, 90, 5, 5, '#D98B7A') + R(197, 90, 5, 5, '#D98B7A') +
    R(172, 99, 5, 5, '#D98B7A') + R(181, 99, 5, 5, '#D98B7A') + R(190, 99, 5, 5, '#D98B7A') + R(197, 99, 5, 5, '#D98B7A') +
    R(172, 108, 5, 5, '#D98B7A') + R(181, 108, 5, 5, '#D98B7A') + R(190, 108, 5, 5, '#D98B7A') + R(197, 108, 5, 5, '#D98B7A') +
    R(176, 96, 6, 6, '#4A6A92') + R(192, 96, 6, 6, '#4A6A92') + R(184, 105, 6, 6, '#4A6A92') +
    R(181, 100, 2, 2, '#F5EFE6') + R(189, 100, 2, 2, '#F5EFE6') + R(185, 108, 2, 2, '#F5EFE6') +
    // 袖子 + 手(3 指)
    R(164, 88, 6, 22, '#C0482F') + R(164, 92, 6, 3, '#D98B7A') + R(161, 110, 4, 3, '#E8C97A') + R(160, 111, 2, 2, '#E8C97A') + R(162, 112, 2, 2, '#E8C97A') +
    R(204, 88, 6, 22, '#C0482F') + R(204, 92, 6, 3, '#D98B7A') + R(209, 110, 4, 3, '#E8C97A') + R(212, 111, 2, 2, '#E8C97A') + R(210, 112, 2, 2, '#E8C97A') +
    // 横杆
    R(170, 88, 34, 3, '#8B5A2B') +
    '</g>'
  // 蝴蝶(2 只,八字飞)
  const bt1 = G('bfly1') + R(96, 78, 2, 2, '#E8922E', 'wing') + R(98, 78, 2, 2, '#C86A1E', 'wing') + R(97, 79, 1, 1, '#5A3A1A') + '</g>'
  const bt2 = G('bfly2') + R(140, 66, 2, 2, '#7A6AB8', 'wing') + R(142, 66, 2, 2, '#5A4A96', 'wing') + R(141, 67, 1, 1, '#3A2A5A') + '</g>'
  const css = CSS(`
    @keyframes w1 { 0% { transform: translateX(0) } 25% { transform: translateX(-7px) } 50% { transform: translateX(-14px) } 75% { transform: translateX(-20px) } 100% { transform: translateX(-26px) } }
    @keyframes w2 { 0% { transform: translateX(-22px) } 25% { transform: translateX(-15px) } 50% { transform: translateX(-7px) } 75% { transform: translateX(0px) } 100% { transform: translateX(6px) } }
    @keyframes cf1 { from { transform: translateX(0) } to { transform: translateX(-40px) } }
    @keyframes cf2 { from { transform: translateX(-34px) } to { transform: translateX(10px) } }
    @keyframes bf1 { from { transform: translate(0, 0) } to { transform: translate(14px, -6px) } }
    @keyframes bf2 { from { transform: translate(10px, -6px) } to { transform: translate(0, 0) } }
    @keyframes scarf { from { transform: rotate(-3deg) translateX(0) } to { transform: rotate(3deg) translateX(2px) } }
    @keyframes wing { 0%, 100% { opacity: 1 } 50% { opacity: .15 } }
    @keyframes bfly1 { 0% { transform: translate(0, 0) } 25% { transform: translate(6px, -5px) } 50% { transform: translate(12px, 0) } 75% { transform: translate(6px, 5px) } 100% { transform: translate(0, 0) } }
    @keyframes bfly2 { 0% { transform: translate(0, 0) } 25% { transform: translate(-5px, -4px) } 50% { transform: translate(-10px, 0) } 75% { transform: translate(-5px, 4px) } 100% { transform: translate(0, 0) } }
    .w1 { animation: w1 3.6s ease-in-out infinite alternate }
    .w2 { animation: w2 4.4s ease-in-out infinite alternate }
    .cf1 { animation: cf1 26s linear infinite }
    .cf2 { animation: cf2 30s linear infinite }
    .bf1 { animation: bf1 2.8s ease-in-out infinite alternate }
    .bf2 { animation: bf2 3.2s ease-in-out infinite alternate }
    .scarf { animation: scarf 3s ease-in-out infinite alternate; transform-origin: 185px 85px; transform-box: fill-box }
    .wing { animation: wing .5s steps(1) infinite }
    .bfly1 { animation: bfly1 4s ease-in-out infinite }
    .bfly2 { animation: bfly2 5s ease-in-out infinite 1s }
  `)
  return { css, body: `${sky}${sun}${clouds}${birds}${trees}${house}${fence}${field}${ears}${bigEar(46, 128)}${bigEar(286, 124)}${sc}${bt1}${bt2}` }
}

function fieldDark() {
  const sky = ['#0E1433', '#121938', '#161E40', '#1B234A'].map((c, i) => R(0, i * 22, 320, 22, c)).join('')
  const moonG = moon(52, 40, 9, '#F5E7B0') +
    R(49, 37, 2, 2, '#E4D190') + R(55, 42, 2, 2, '#E4D190') + R(50, 45, 1, 1, '#E4D190')
  const tw = stars([6, 12, 18, 24, 30, 36, 42], '#DDE4FF')
  // 远处木屋:窗口灯光
  const house = R(238, 78, 20, 14, '#2A2418') + R(234, 74, 28, 5, '#4A3323') + R(234, 74, 8, 2, '#5C3E2A') + R(254, 74, 8, 2, '#5C3E2A') +
    R(244, 82, 6, 8, '#1C170F') + R(246, 84, 2, 4, '#FFD98A', 'warm') + R(246, 86, 2, 2, '#FFE9B0') +
    R(238, 82, 4, 4, '#1C170F') + R(240, 82, 2, 4, '#FFD98A', 'warm') +
    R(252, 82, 4, 4, '#1C170F') + R(254, 82, 2, 4, '#FFD98A', 'warm') + R(240, 92, 14, 4, '#4A3323')
  const trees = G() + tree(216, 66, 16, '#1D2E1C', '#241D12', 12) + tree(204, 62, 14, '#243720', '#241D12', 10) + '</g>'
  const fence = [30, 48, 66, 84, 102, 120, 138, 156].map((x) => R(x, 88, 2, 14, '#3A2C1A')).join('') + R(26, 92, 134, 2, '#453521')
  const field = [
    ['#4A3D1C', 90, 96, 22, 'w1'], ['#443818', 96, 97, 18, 'w2'], ['#51441F', 104, 98, 16, 'w1'],
    ['#3E3215', 112, 98, 14, 'w2'], ['#4A3D1C', 124, 100, 12, 'w1'], ['#382D12', 136, 102, 10, 'w2'],
    ['#443818', 146, 104, 9, 'w1'], ['#352B10', 155, 106, 8, 'w2'],
  ]
    .map(([c, y, y2, h, a]) => R(0, y, 320, h, c, a) + R(0, y2, 320, 3, '#2A2310', a))
    .join('')
  // 月光高光条
  const glowBand = R(0, 96, 320, 2, '#7A6A2A', 'w1') + R(0, 112, 320, 2, '#6A5C24', 'w2') + R(0, 136, 320, 2, '#5A4E20', 'w1')
  // 稻草人剪影(带月光描边 + 发光眼)
  const sc = G() +
    R(184, 121, 3, 8, '#3A2C18') + R(176, 129, 3, 10, '#3A2C18') + R(192, 129, 3, 10, '#3A2C18') +
    // 帽子(月光高光顶)
    R(176, 62, 22, 3, '#4E3E22') + R(170, 65, 34, 3, '#3A2C18') + R(178, 58, 18, 5, '#3A2C18') + R(182, 56, 10, 2, '#4E3E22') + R(172, 68, 30, 2, '#2E2312') +
    R(170, 65, 34, 1, '#6A5832') +
    // 头
    R(178, 70, 18, 14, '#2A2418') + R(181, 73, 12, 8, '#221D13') +
    // 眼睛(发光 + 光晕)
    R(179, 76, 3, 3, '#FFE066', 'glow') + R(186, 76, 3, 3, '#FFE066', 'glow') +
    R(178, 75, 5, 5, '#FFE066', 'halo') + R(185, 75, 5, 5, '#FFE066', 'halo') +
    R(179, 76, 1, 1, '#FFF7CC') + R(186, 76, 1, 1, '#FFF7CC') +
    // 嘴缝线
    R(184, 81, 5, 1, '#4E3E22') +
    // 围巾
    R(178, 84, 18, 3, '#5A3A24', 'scarf') + R(180, 87, 4, 4, '#4A2E1C', 'scarf') + R(187, 87, 3, 3, '#3E2615', 'scarf') +
    // 衬衫
    R(170, 88, 34, 30, '#1E1810') + R(172, 90, 5, 5, '#2E2418') + R(181, 90, 5, 5, '#2E2418') + R(190, 90, 5, 5, '#2E2418') + R(197, 90, 5, 5, '#2E2418') +
    R(172, 99, 5, 5, '#2E2418') + R(181, 99, 5, 5, '#2E2418') + R(190, 99, 5, 5, '#2E2418') + R(197, 99, 5, 5, '#2E2418') +
    R(172, 108, 5, 5, '#2E2418') + R(181, 108, 5, 5, '#2E2418') + R(190, 108, 5, 5, '#2E2418') + R(197, 108, 5, 5, '#2E2418') +
    R(176, 96, 6, 6, '#20293A') + R(192, 96, 6, 6, '#20293A') + R(184, 105, 6, 6, '#20293A') +
    R(181, 100, 2, 2, '#4E4A40') + R(189, 100, 2, 2, '#4E4A40') + R(185, 108, 2, 2, '#4E4A40') +
    // 袖/手
    R(164, 88, 6, 22, '#1E1810') + R(164, 92, 6, 3, '#2E2418') + R(161, 110, 4, 3, '#3A2C18') +
    R(204, 88, 6, 22, '#1E1810') + R(204, 92, 6, 3, '#2E2418') + R(209, 110, 4, 3, '#3A2C18') +
    R(170, 88, 34, 3, '#3A2C18') +
    '</g>'
  // 萤火虫(10 只)
  const bugs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) =>
    R(20 + i * 30, 56 + ((i * 17) % 34), 2, 2, '#D8F04C', `bg${i % 4}`)).join('')
  // 草丛
  const grass = G('w2') + [8, 30, 52, 74, 96, 118, 140, 162, 184, 206, 228, 250, 272, 294].map((x, i) =>
    R(x, 168, 2, 6, i % 2 ? '#2E2410' : '#3A2C14')).join('') + '</g>'
  const css = CSS(`
    @keyframes w1 { 0% { transform: translateX(0) } 25% { transform: translateX(-5px) } 50% { transform: translateX(-11px) } 75% { transform: translateX(-16px) } 100% { transform: translateX(-20px) } }
    @keyframes w2 { 0% { transform: translateX(-18px) } 25% { transform: translateX(-12px) } 50% { transform: translateX(-6px) } 75% { transform: translateX(-1px) } 100% { transform: translateX(4px) } }
    @keyframes glow { 0%, 100% { opacity: .25 } 25% { opacity: .7 } 50% { opacity: 1 } 75% { opacity: .55 } }
    @keyframes halo { 0%, 100% { opacity: 0 } 30% { opacity: .3 } 50% { opacity: .5 } 70% { opacity: .3 } }
    @keyframes warm { 0%, 100% { opacity: .6 } 30% { opacity: .95 } 60% { opacity: 1 } 80% { opacity: .8 } }
    @keyframes scarf { from { transform: rotate(-3deg) translateX(0) } to { transform: rotate(3deg) translateX(2px) } }
    @keyframes tw0 { 0%, 55% { opacity: 1 } 56%, 100% { opacity: .2 } }
    @keyframes tw1 { 0%, 40% { opacity: .2 } 41%, 100% { opacity: 1 } }
    @keyframes tw2 { 0%, 65% { opacity: 1 } 66%, 100% { opacity: .25 } }
    @keyframes bg0 { 0% { transform: translate(0, 0); opacity: .2 } 25% { opacity: 1 } 50% { transform: translate(4px, -14px); opacity: .4 } 75% { opacity: 1 } 100% { transform: translate(9px, 2px); opacity: .2 } }
    @keyframes bg1 { 0% { transform: translate(0, 0); opacity: .5 } 30% { transform: translate(-5px, -10px); opacity: 1 } 70% { transform: translate(-2px, 6px); opacity: .3 } 100% { transform: translate(5px, -4px); opacity: .5 } }
    @keyframes bg2 { 0% { transform: translate(0, 0); opacity: 1 } 40% { transform: translate(6px, 8px); opacity: .25 } 80% { transform: translate(-4px, -6px); opacity: .8 } 100% { transform: translate(0, 0); opacity: 1 } }
    @keyframes bg3 { 0% { transform: translate(0, 0); opacity: .35 } 25% { transform: translate(-4px, -5px); opacity: .8 } 50% { transform: translate(-7px, -8px); opacity: 1 } 75% { transform: translate(-2px, 0px); opacity: .6 } 100% { transform: translate(3px, 4px); opacity: .5 } }
    .w1 { animation: w1 4.8s ease-in-out infinite alternate }
    .w2 { animation: w2 5.6s ease-in-out infinite alternate }
    .glow { animation: glow 1.6s ease-in-out infinite }
    .halo { animation: halo 1.6s ease-in-out infinite }
    .warm { animation: warm 2.4s ease-in-out infinite }
    .scarf { animation: scarf 3.6s ease-in-out infinite alternate; transform-origin: 185px 85px; transform-box: fill-box }
    .tw0 { animation: tw0 2.4s steps(1) infinite }
    .tw1 { animation: tw1 3s steps(1) infinite }
    .tw2 { animation: tw2 2s steps(1) infinite }
    .bg0 { animation: bg0 5s ease-in-out infinite }
    .bg1 { animation: bg1 6.5s ease-in-out infinite 1s }
    .bg2 { animation: bg2 5.5s ease-in-out infinite 2s }
    .bg3 { animation: bg3 7s ease-in-out infinite .5s }
    .moonp { animation: glow 5s ease-in-out infinite }
  `)
  return { css, body: `${sky}${moonG}${tw}${trees}${house}${fence}${field}${glowBand}${sc}${bugs}${grass}` }
}

// ---------- 5/6. Coulyer · 图书馆落地窗 ----------
const SHELF_COLORS = ['#A78BFA', '#F0ABFC', '#FDE68A', '#93C5FD', '#FCA5A5', '#86EFAC', '#C4B5FD', '#FDBA74', '#B8A7E0', '#F9A8D4']
const shelf = (x, colors, wood, shelfC, top) => {
  let s = R(x, 24, 96, 96, wood) + R(x + 2, 26, 92, 6, top)
  for (let row = 0; row < 5; row++) {
    const y = 32 + row * 18
    let bx = x + 4
    while (bx < x + 88) {
      const w = 4 + ((bx * 7) % 6)
      const h = 11 + (((bx + row * 3) % 3))
      const c = colors[(bx + row) % colors.length]
      s += R(bx, y + 4 - h + 10, w, h, c)
      if ((bx + row) % 5 === 0) s += R(bx + w - 1, y + 4 - h + 10, 1, h, '#FFFFFF') // 书脊高光
      if ((bx + row) % 7 === 3) s += R(bx + 1, y + 4 - h + 10, 1, 3, '#FFFFFF') // 书签
      bx += w + 1
    }
    s += R(x + 2, y + 15, 92, 3, shelfC)
  }
  return s + R(x + 96, 24, 2, 96, shelfC)
}
const rug = (colors) =>
  R(40, 146, 240, 30, colors[0]) + R(52, 152, 216, 18, colors[1]) + R(64, 156, 192, 10, colors[2]) +
  R(100, 149, 8, 8, colors[3]) + R(212, 149, 8, 8, colors[3]) + R(156, 149, 8, 8, colors[4]) +
  R(156, 165, 8, 8, colors[3]) + R(100, 165, 8, 8, colors[4]) + R(212, 165, 8, 8, colors[4])

function libraryDay() {
  const wallTop = ['#CEC2EC', '#C9BCE8', '#C0B2E2'].map((c, i) => R(0, i * 15, 320, 15, c)).join('')
  const wallMid = ['#B09BD6', '#A68FC9'].map((c, i) => R(0, 45 + i * 17, 320, 17, c)).join('')
  const wallLow = R(0, 79, 320, 22, '#9A84C4')
  const floor = R(0, 101, 320, 79, '#7E6BB0') + R(0, 101, 320, 4, '#8A77BC') + R(0, 116, 320, 2, '#7562A6') + R(0, 132, 320, 2, '#7562A6') + R(0, 150, 320, 2, '#7562A6')
  // 地毯
  const rugDay = rug(['#8A77BC', '#9684C6', '#A08FD0', '#C4B5FD', '#B8A7E0'])
  // 落地窗(窗景:紫色远山/太阳/云)
  const window_ = G() +
    R(118, 24, 84, 90, '#4A3A78') + R(122, 28, 76, 82, '#C4B2F5') +
    R(122, 28, 76, 82, 'url(#wlg)') +
    // 窗外:远山 + 太阳 + 云
    R(126, 86, 22, 20, '#8B6ED8') + R(148, 90, 26, 16, '#7C5CE0') + R(174, 84, 20, 22, '#8B6ED8') +
    R(140, 38, 10, 10, '#F5EDFF') + R(142, 40, 6, 6, '#FFFFFF') +
    R(162, 50, 18, 4, '#E8DCFF') + R(168, 47, 12, 4, '#E8DCFF') +
    R(132, 62, 14, 4, '#D9CBFF') + R(138, 59, 8, 4, '#D9CBFF') +
    // 玻璃反光
    R(128, 32, 26, 2, '#FFFFFF') + R(128, 35, 20, 1, '#FFFFFF', 'sheen') + R(190, 60, 2, 24, '#FFFFFF', 'sheen') +
    // 窗格
    R(122, 28, 4, 82, '#4A3A78') + R(194, 28, 4, 82, '#4A3A78') + R(122, 28, 76, 4, '#4A3A78') + R(122, 106, 76, 4, '#4A3A78') +
    R(158, 28, 4, 82, '#4A3A78') + R(122, 66, 76, 3, '#4A3A78') +
    '</g>'
  // 窗帘(两侧紫纱,微摆)
  const curtain = G('curtain') +
    R(106, 24, 12, 100, '#A78BFA') + R(108, 24, 10, 3, '#B8A7F0') + R(104, 26, 4, 98, '#8B6ED8') +
    R(202, 24, 12, 100, '#A78BFA') + R(202, 24, 10, 3, '#B8A7F0') + R(214, 26, 4, 98, '#8B6ED8') +
    R(110, 40, 6, 2, '#C4B5FD') + R(110, 56, 6, 2, '#C4B5FD') + R(204, 40, 6, 2, '#C4B5FD') + R(204, 56, 6, 2, '#C4B5FD') +
    '</g>'
  // 光柱(3 层 + 尘埃)
  const beam = `<g class="beam"><rect x="128" y="110" width="64" height="54" fill="#B9A6F5" opacity="0.3"/><rect x="148" y="110" width="24" height="54" fill="#C9B9F7" opacity="0.38"/><rect x="138" y="112" width="44" height="52" fill="#A78BFA" opacity="0.14"/></g>`
  const spot = `<rect x="124" y="150" width="72" height="10" fill="#D9CCF8" opacity="0.3" class="beam"/>`
  const dust = [0, 1, 2, 3, 4, 5].map((i) => R(140 + i * 8, 120 + ((i * 13) % 30), 1, 1, '#F3EDFF', `dust${i % 3}`)).join('')
  // 书架
  const shelfL = shelf(2, SHELF_COLORS, '#5C4A94', '#4A3A78', '#6F5CA8')
  const shelfR = shelf(222, SHELF_COLORS, '#5C4A94', '#4A3A78', '#6F5CA8')
  // 墙面挂画 + 盆栽
  const art = R(52, 36, 16, 14, '#4A3A78') + R(54, 38, 12, 10, '#B8A7E0') + R(56, 42, 8, 4, '#8B6ED8') + R(58, 40, 4, 2, '#6F5CA8')
  const plant = G('plant') + R(84, 88, 10, 10, '#6F5CA8') + R(86, 90, 6, 6, '#5C4A94') +
    R(88, 78, 3, 8, '#4C9B52') + R(86, 82, 2, 5, '#5FAE66') + R(90, 80, 2, 6, '#5FAE66') +
    '</g>'
  // 书桌:摊开的书(文字行)+ 墨水瓶 + 羽毛笔
  const desk = G() +
    R(96, 148, 128, 6, '#6F5CA8') + R(100, 154, 4, 16, '#5C4A94') + R(216, 154, 4, 16, '#5C4A94') +
    R(130, 126, 30, 22, '#9B8AD0') + R(132, 128, 12, 20, '#F3EDFF') + R(146, 128, 12, 20, '#F7F2FF') +
    R(134, 132, 8, 1, '#B8A7E0') + R(134, 136, 8, 1, '#B8A7E0') + R(134, 140, 8, 1, '#B8A7E0') + R(134, 144, 6, 1, '#B8A7E0') +
    R(148, 132, 8, 1, '#C4B5FD') + R(148, 136, 8, 1, '#C4B5FD') + R(148, 140, 8, 1, '#C4B5FD') + R(148, 144, 6, 1, '#C4B5FD') +
    R(130, 126, 32, 2, '#5C4A94') +
    R(172, 132, 10, 10, '#3A2A5A') + R(173, 133, 8, 4, '#7C5CE0') + R(173, 135, 8, 1, '#A78BFA') +
    R(168, 122, 2, 12, '#F3EDFF') + R(184, 122, 2, 12, '#F3EDFF') + R(170, 124, 14, 2, '#EFE7FF') + R(170, 128, 14, 1, '#EFE7FF') +
    '</g>'
  // 挂钟(细化:刻度)
  const clock = `<g class="clockspin"><rect x="46" y="58" width="16" height="16" fill="#4A3A78"/><rect x="48" y="60" width="12" height="12" fill="#F3EDFF"/><rect x="53" y="62" width="2" height="6" fill="#4A3A78"/><rect x="55" y="64" width="3" height="2" fill="#4A3A78"/><rect x="50" y="63" width="1" height="1" fill="#4A3A78"/><rect x="57" y="63" width="1" height="1" fill="#4A3A78"/></g>`
  const grad = `<defs><linearGradient id="wlg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A78BFA" stop-opacity="0.5"/><stop offset="1" stop-color="#7C5CE0" stop-opacity="0.28"/></linearGradient></defs>`
  const css = CSS(`
    @keyframes beam { 0%, 100% { opacity: .5 } 25% { opacity: .75 } 50% { opacity: .95 } 75% { opacity: .72 } }
    @keyframes sheen { 0%, 100% { opacity: .15 } 25% { opacity: .4 } 50% { opacity: .6 } 75% { opacity: .35 } }
    @keyframes curtain { from { transform: translateX(0) } to { transform: translateX(2px) } }
    @keyframes dust0 { from { transform: translate(0, 0); opacity: .3 } 50% { transform: translate(3px, -8px); opacity: .9 } to { transform: translate(0, 0); opacity: .3 } }
    @keyframes dust1 { from { transform: translate(0, 0); opacity: .5 } 50% { transform: translate(-3px, -6px); opacity: 1 } to { transform: translate(0, 0); opacity: .5 } }
    @keyframes dust2 { from { transform: translate(0, 0); opacity: .2 } 50% { transform: translate(2px, -10px); opacity: .7 } to { transform: translate(0, 0); opacity: .2 } }
    @keyframes plant { from { transform: rotate(-2deg) } to { transform: rotate(2deg) } }
    @keyframes clockspin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
    .beam { animation: beam 4s ease-in-out infinite }
    .sheen { animation: sheen 3.6s ease-in-out infinite }
    .curtain { animation: curtain 5s ease-in-out infinite alternate }
    .dust0 { animation: dust0 4.5s ease-in-out infinite }
    .dust1 { animation: dust1 5.5s ease-in-out infinite 1s }
    .dust2 { animation: dust2 6.5s ease-in-out infinite 2s }
    .plant { animation: plant 3.4s ease-in-out infinite alternate; transform-origin: 89px 96px; transform-box: fill-box }
    .clockspin { animation: clockspin 18s linear infinite; transform-origin: 54px 66px; transform-box: fill-box }
  `)
  return { css, body: `${grad}${wallTop}${wallMid}${wallLow}${floor}${rugDay}${curtain}${window_}${beam}${spot}${dust}${shelfL}${shelfR}${art}${plant}${desk}${clock}` }
}

function libraryNight() {
  const wall = R(0, 0, 320, 180, '#2A1B4E') + R(0, 45, 320, 34, '#241744') + R(0, 79, 320, 22, '#1F1238') +
    R(0, 101, 320, 79, '#1C1236') + R(0, 101, 320, 3, '#241744') + R(0, 116, 320, 2, '#17102C') + R(0, 132, 320, 2, '#17102C') + R(0, 150, 320, 2, '#17102C')
  const rugNight = rug(['#241744', '#2A1D4C', '#312254', '#4C3A7A', '#3E2E66'])
  // 落地窗:深紫夜空 + 月亮 + 微弱紫色灯光(重点)
  const window_ = G() +
    R(118, 24, 84, 90, '#3A2A60') + R(122, 28, 76, 82, '#18102E') +
    // 窗外:月亮 + 星 + 云影
    R(150, 38, 10, 10, '#E6D9FF') + R(152, 40, 6, 6, '#F4EEFF') + R(150, 38, 3, 3, '#C9B4F2') + R(156, 44, 2, 2, '#C9B4F2') + R(151, 45, 2, 2, '#C9B4F2') +
    R(138, 50, 4, 4, '#3E2E66') + R(146, 54, 4, 4, '#2E2160') + R(170, 48, 4, 4, '#332567') + R(178, 56, 4, 4, '#2E2160') + R(162, 62, 4, 4, '#332567') + R(186, 44, 4, 4, '#3E2E66') +
    R(130, 34, 12, 12, '#221840') + R(148, 34, 12, 12, '#2E2160') + R(166, 34, 12, 12, '#221840') + R(184, 34, 12, 12, '#2E2160') +
    R(130, 52, 12, 12, '#2E2160') + R(166, 52, 12, 12, '#221840') + R(184, 52, 12, 12, '#221840') +
    R(130, 70, 12, 12, '#221840') + R(148, 70, 12, 12, '#2E2160') + R(166, 70, 12, 12, '#332567') + R(184, 70, 12, 12, '#221840') +
    // ★ 落地窗紫色灯光:玻璃中央光晕 + 内缘描边(微弱呼吸)
    R(136, 34, 48, 58, 'url(#nlg)') +
    R(152, 44, 16, 16, '#8B5CF6', 'lglow') + R(156, 48, 8, 8, '#A78BFA', 'lglow') +
    R(124, 30, 72, 2, '#7C5CE0', 'lglow') + R(124, 102, 72, 2, '#7C5CE0', 'lglow') + R(124, 30, 2, 74, '#7C5CE0', 'lglow') + R(194, 30, 2, 74, '#7C5CE0', 'lglow') +
    R(160, 30, 2, 74, '#3A2A60') + R(124, 66, 72, 2, '#3A2A60') +
    R(122, 28, 4, 82, '#3A2A60') + R(194, 28, 4, 82, '#3A2A60') + R(122, 28, 76, 4, '#3A2A60') + R(122, 106, 76, 4, '#3A2A60') +
    '</g>'
  const windowStars = stars([32, 38, 44, 50, 56], '#B9A6F5', 6)
  // 窗帘(深紫)
  const curtain = G('curtain') +
    R(106, 24, 12, 100, '#3A2A60') + R(108, 24, 10, 3, '#4C3A7A') + R(104, 26, 4, 98, '#2E2154') +
    R(202, 24, 12, 100, '#3A2A60') + R(202, 24, 10, 3, '#4C3A7A') + R(214, 26, 4, 98, '#2E2154') +
    '</g>'
  // 月光柱(3 层)+ 窗台猫
  const beam = `<g class="mbeam"><rect x="136" y="110" width="48" height="56" fill="#B9A6F5" opacity="0.14"/><rect x="154" y="110" width="14" height="56" fill="#C9B9F7" opacity="0.18"/><rect x="146" y="112" width="28" height="54" fill="#A78BFA" opacity="0.08"/></g>`
  const spot = `<rect x="132" y="152" width="56" height="8" fill="#C9B9F7" opacity="0.13" class="mbeam"/>`
  const cat = G() +
    R(174, 106, 10, 4, '#141022') + R(176, 104, 6, 2, '#141022') + R(176, 103, 2, 1, '#141022') + R(180, 103, 2, 1, '#141022') +
    R(184, 106, 3, 2, '#141022', 'tail') + R(175, 105, 2, 1, '#2A2040') + R(179, 105, 2, 1, '#2A2040') +
    R(177, 107, 1, 1, '#FFE066', 'lamp') + R(180, 107, 1, 1, '#FFE066', 'lamp') +
    '</g>'
  // 书架(暗)
  const shelfL = shelf(2, ['#4C3A7A', '#5A3E8A', '#3E2E66', '#59409A', '#46346F', '#4A3A7A', '#3A2C5E'], '#241A44', '#1A1030', '#2E2354')
  const shelfR = shelf(222, ['#4C3A7A', '#5A3E8A', '#3E2E66', '#59409A', '#46346F', '#4A3A7A', '#3A2C5E'], '#241A44', '#1A1030', '#2E2354')
  // 台灯(亮)+ 书桌
  const desk = G() +
    R(96, 148, 128, 6, '#3A2A60') + R(100, 154, 4, 16, '#2A1B4E') + R(216, 154, 4, 16, '#2A1B4E') +
    R(134, 130, 26, 18, '#46346F') + R(130, 126, 34, 2, '#2A1B4E') + R(134, 132, 10, 14, '#5A3E8A') + R(146, 132, 12, 14, '#4C3A7A') + R(136, 134, 8, 1, '#8A77BC') + R(136, 138, 8, 1, '#8A77BC') + R(148, 134, 8, 1, '#7C6AA8') + R(148, 138, 8, 1, '#7C6AA8') +
    // 台灯
    R(172, 128, 10, 8, '#B49AE0', 'lamp') + R(174, 124, 6, 4, '#C9B4F2', 'lamp') + R(172, 136, 10, 2, '#8A77BC') + R(176, 138, 2, 8, '#8A77BC') +
    R(170, 124, 14, 2, '#FFE9B0', 'lamp') + R(172, 128, 10, 8, '#FFE9B0', 'lamp') + R(174, 130, 6, 4, '#FFD98A', 'lamp') +
    '</g>'
  // 挂画(暗)
  const art = R(52, 36, 16, 14, '#241A44') + R(54, 38, 12, 10, '#3E2E66') + R(56, 42, 8, 4, '#4C3A7A') + R(58, 40, 4, 2, '#5A3E8A')
  const grad = `<defs><linearGradient id="nlg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8B5CF6" stop-opacity="0.22"/><stop offset="1" stop-color="#6D3FD6" stop-opacity="0.1"/></linearGradient></defs>`
  const css = CSS(`
    @keyframes mbeam { 0%, 100% { opacity: .45 } 25% { opacity: .66 } 50% { opacity: .9 } 75% { opacity: .62 } }
    @keyframes lglow { 0%, 100% { opacity: .45 } 25% { opacity: .7 } 50% { opacity: .95 } 75% { opacity: .62 } }
    @keyframes lamp { 0%, 100% { opacity: .6 } 30% { opacity: .9 } 60% { opacity: 1 } 80% { opacity: .75 } }
    @keyframes tail { from { transform: rotate(0deg) } to { transform: rotate(24deg) } }
    @keyframes curtain { from { transform: translateX(0) } to { transform: translateX(2px) } }
    @keyframes tw0 { 0%, 60% { opacity: 1 } 61%, 100% { opacity: .2 } }
    @keyframes tw1 { 0%, 40% { opacity: .2 } 41%, 100% { opacity: 1 } }
    @keyframes tw2 { 0%, 70% { opacity: 1 } 71%, 100% { opacity: .3 } }
    .mbeam { animation: mbeam 6s ease-in-out infinite }
    .lglow { animation: lglow 3.4s ease-in-out infinite }
    .lamp { animation: lamp 3s ease-in-out infinite }
    .tail { animation: tail 3.2s ease-in-out infinite alternate; transform-origin: 186px 107px; transform-box: fill-box }
    .curtain { animation: curtain 6s ease-in-out infinite alternate }
    .tw0 { animation: tw0 2.4s steps(1) infinite }
    .tw1 { animation: tw1 3s steps(1) infinite }
    .tw2 { animation: tw2 2s steps(1) infinite }
  `)
  return { css, body: `${grad}${wall}${rugNight}${curtain}${window_}${windowStars}${beam}${spot}${cat}${shelfL}${shelfR}${desk}${art}` }
}

// ---------- 7/8. Zoneip · 海洋 ----------
function seaDay() {
  const sky = ['#C6ECF9', '#BFE9F8', '#B5E4F6', '#ABDFF4'].map((c, i) => R(0, i * 18, 320, 18, c)).join('')
  const sun = G() +
    R(248, 24, 36, 36, '#FBD75E') + R(256, 32, 20, 20, '#FFEB9E') + R(260, 36, 12, 12, '#FFF6CC') +
    R(242, 39, 3, 6, '#FFE98A') + R(287, 39, 3, 6, '#FFE98A') + R(263, 17, 6, 3, '#FFE98A') + R(263, 64, 6, 3, '#FFE98A') +
    '</g>'
  const clouds = G() + cloud(28, 36, 1, '#FFFFFF', '#A9DDF0') + cloud(150, 44, 1, '#F7FDFF', '#A9DDF0') + cloud(96, 20, 1, '#FFFFFF', '#A9DDF0') + '</g>'
  // 海鸥(翅膀拍动)
  const gulls = G() +
    R(118, 24, 6, 2, '#4A6A92', 'gl1') + R(121, 22, 2, 2, '#4A6A92', 'wing1') + R(119, 26, 2, 2, '#4A6A92', 'wing2') +
    R(140, 18, 6, 2, '#4A6A92', 'gl2') + R(143, 16, 2, 2, '#4A6A92', 'wing2') + R(141, 20, 2, 2, '#4A6A92', 'wing1') +
    R(206, 28, 6, 2, '#4A6A92', 'gl2') + R(209, 26, 2, 2, '#4A6A92', 'wing1') + R(207, 30, 2, 2, '#4A6A92', 'wing2') +
    '</g>'
  // 小岛(远)+ 棕榈
  const isle = R(228, 60, 26, 8, '#E8D9B0') + R(226, 66, 30, 4, '#C9B88E') + R(231, 56, 20, 5, '#4C9B52') + R(236, 54, 10, 3, '#5FAE66') +
    R(234, 52, 3, 8, '#6A4A2A') + R(236, 48, 2, 2, '#4C9B52') + R(238, 46, 4, 2, '#5FAE66')
  // 海面:5 条带
  const sea = [
    ['#63C7EA', 68, 20, 's1'], ['#54B9E2', 88, 18, 's2'], ['#44ABD8', 106, 17, 's1'],
    ['#369DCF', 123, 15, 's2'], ['#2B8FC4', 138, 13, 's1'],
  ]
    .map(([c, y, h, a]) => R(0, y, 320, h, c, a)).join('')
  // 高光条
  const gloss = R(0, 70, 320, 1, '#D9F4FF', 's1') + R(0, 90, 320, 1, '#C9EEFD', 's2') + R(0, 108, 320, 1, '#C9EEFD', 's1') + R(0, 125, 320, 1, '#B8E6FA', 's2')
  // 浪花(密)
  const foam = (() => {
    let s = ''
    const rows = [
      [68, 'f1', ['#FFFFFF', '#E8FBFF']],
      [88, 'f2', ['#FFFFFF', '#DFF7FF']],
      [106, 'f1', ['#FFFFFF', '#D9F4FF']],
      [123, 'f2', ['#FFFFFF', '#D0F0FF']],
      [138, 'f1', ['#FFFFFF', '#C9EEFD']],
    ]
    for (const [y, a, cols] of rows) {
      let x = 0
      while (x < 316) {
        s += R(x, y, 3 + (x % 5), 2 + (x % 3), cols[x % 2], a)
        x += 6 + (x % 3)
      }
    }
    return s
  })()
  // 鱼跃
  const fish = G('jump') + R(64, 0, 5, 2, '#7AC4E8') + R(63, 0, 1, 2, '#B8E6FA') + R(69, 0, 2, 2, '#4A92B8', 'splash') + '</g>'
  // 船(帆影/旗)
  const boat = `<g class="boat">` +
    R(62, 116, 26, 3, '#7A4E2B') + R(62, 114, 26, 2, '#8A5E33') + R(60, 119, 3, 3, '#6A4023') + R(87, 119, 3, 3, '#6A4023') +
    R(68, 108, 16, 8, '#F7F3E8') + R(68, 112, 16, 2, '#EFE9DA') +
    R(86, 108, 2, 13, '#7A4E2B') + R(86, 106, 2, 3, '#8A5E33') + R(88, 106, 3, 2, '#C0482F', 'wing2') +
    R(70, 110, 10, 2, '#D9D2BE') + R(74, 107, 2, 8, '#B8B09A') +
    `</g>`
  // 岩礁(前景)
  const reef = G() + R(2, 150, 40, 30, '#8A7A5A') + R(0, 156, 6, 24, '#7A6A4C') + R(38, 156, 8, 24, '#7A6A4C') +
    R(4, 146, 30, 5, '#9B8B68') + R(10, 144, 8, 3, '#6FAE59') + R(18, 143, 6, 2, '#5E9B4C') + R(8, 148, 3, 2, '#B8D8B0') + '</g>'
  const css = CSS(`
    @keyframes s1 { from { transform: translateX(0) } to { transform: translateX(-40px) } }
    @keyframes s2 { from { transform: translateX(-34px) } to { transform: translateX(8px) } }
    @keyframes f1 { from { transform: translateX(0); opacity: .95 } 50% { opacity: .6 } to { transform: translateX(-40px); opacity: .95 } }
    @keyframes f2 { from { transform: translateX(-34px); opacity: .75 } 50% { opacity: 1 } to { transform: translateX(8px); opacity: .75 } }
    @keyframes boat { 0% { transform: rotate(-2.5deg) translateY(0) } 25% { transform: rotate(-1deg) translateY(1px) } 50% { transform: rotate(2.5deg) translateY(1px) } 75% { transform: rotate(1deg) translateY(0) } 100% { transform: rotate(-2.5deg) translateY(0) } }
    @keyframes cf1 { from { transform: translateX(0) } to { transform: translateX(-40px) } }
    @keyframes cf2 { from { transform: translateX(-32px) } to { transform: translateX(12px) } }
    @keyframes gl1 { from { transform: translate(0, 0) } to { transform: translate(10px, -5px) } }
    @keyframes gl2 { from { transform: translate(8px, -4px) } to { transform: translate(0, 0) } }
    @keyframes wing1 { 0%, 100% { opacity: 1 } 50% { opacity: .1 } }
    @keyframes wing2 { 0%, 100% { opacity: .1 } 50% { opacity: 1 } }
    @keyframes jump { 0% { transform: translate(0, 110px) rotate(0deg) } 15% { transform: translate(6px, 96px) rotate(-8deg) } 30% { transform: translate(12px, 88px) rotate(8deg) } 50% { transform: translate(20px, 92px) rotate(0deg) } 100% { transform: translate(40px, 130px) rotate(0deg); opacity: 0 } }
    .s1 { animation: s1 9s linear infinite }
    .s2 { animation: s2 11s linear infinite }
    .f1 { animation: f1 9s linear infinite }
    .f2 { animation: f2 11s linear infinite }
    .boat { animation: boat 3.4s ease-in-out infinite; transform-origin: 75px 118px; transform-box: fill-box }
    .cf1 { animation: cf1 28s linear infinite }
    .cf2 { animation: cf2 32s linear infinite }
    .gl1 { animation: gl1 2.6s ease-in-out infinite alternate }
    .gl2 { animation: gl2 3s ease-in-out infinite alternate }
    .wing1 { animation: wing1 .7s steps(1) infinite }
    .wing2 { animation: wing2 .7s steps(1) infinite }
    .jump { animation: jump 6s ease-in-out infinite }
  `)
  return { css, body: `${sky}${sun}${clouds}${gulls}${isle}${sea}${gloss}${foam}${fish}${boat}${reef}` }
}

function seaDark() {
  const sky = ['#050F1D', '#081A2C', '#0A1E31', '#0D2540'].map((c, i) => R(0, i * 18, 320, 18, c)).join('')
  const moonG = moon(252, 40, 10, '#E8F2FF') +
    R(249, 37, 2, 2, '#D2E2F7') + R(255, 42, 2, 2, '#D2E2F7') + R(250, 45, 1, 1, '#D2E2F7')
  const tw = stars([5, 11, 17, 23, 29, 35], '#BFD8F2')
  const sea = [
    ['#0E2F52', 68, 20, 's1'], ['#0C2848', 88, 18, 's2'], ['#0A2140', 106, 17, 's1'],
    ['#081C38', 123, 15, 's2'], ['#071830', 138, 13, 's1'],
  ]
    .map(([c, y, h, a]) => R(0, y, 320, h, c, a)).join('')
  // 月光路径(更细)
  const path = `<g class="mpath">${[0, 1, 2, 3, 4, 5, 6].map((i) =>
    R(146 + i * 2, 72 + i * 11, 10 + (i % 2) * 6, 3, '#DFEEFF', 'mp' + (i % 2))).join('')}
    ${[0, 1, 2, 3].map((i) => R(140 + i * 6, 78 + i * 14, 3, 1, '#BFD8F2', 'mp' + ((i + 1) % 2))).join('')}</g>`
  // 浪花微光
  const foam = (() => {
    let s = ''
    const rows = [
      [68, 'f1'], [88, 'f2'], [106, 'f1'], [123, 'f2'], [138, 'f1'],
    ]
    for (const [y, a] of rows) {
      let x = 0
      while (x < 314) {
        s += R(x, y, 3 + (x % 5), 2, '#D9EFFF', a)
        x += 8 + (x % 3)
      }
    }
    return s
  })()
  // 灯塔(红白条纹 + 旋转光束 + 灯)
  const light = G() +
    R(22, 88, 22, 52, '#202C44') + R(24, 90, 18, 46, '#E8E3DA') +
    R(24, 96, 18, 7, '#C0392B') + R(24, 108, 18, 7, '#C0392B') + R(24, 120, 18, 7, '#C0392B') +
    R(26, 92, 14, 4, '#202C44') + R(30, 86, 6, 6, '#202C44') + R(30, 88, 4, 3, '#C0392B') +
    R(30, 100, 6, 3, '#FFE98A', 'lantern') + R(32, 118, 4, 4, '#202C44') + R(24, 128, 18, 2, '#202C44') +
    R(30, 103, 2, 2, '#FFFFFF', 'lantern') +
    `<g class="sweep"><rect x="32" y="98" width="34" height="3" fill="#FFE98A" opacity="0.45"/><rect x="32" y="100" width="26" height="2" fill="#FFE98A" opacity="0.3"/></g>` +
    '</g>'
  // 远处小船(一点灯)
  const boatFar = R(190, 122, 10, 2, '#0E1E34') + R(194, 116, 4, 6, '#0E1E34') + R(192, 118, 2, 4, '#1E3A5F') + R(195, 118, 1, 1, '#FFD98A', 'warm')
  // 礁石剪影
  const reef = R(2, 150, 44, 30, '#0B1826') + R(0, 156, 6, 24, '#08121E') + R(42, 158, 6, 22, '#08121E') + R(6, 148, 30, 3, '#101F30') + R(12, 146, 8, 2, '#0B1826')
  // 水母(发光,浮起)
  const jelly = (x, baseY, d) => G(`jelly${d}`) +
    R(x, baseY - 6, 6, 3, '#8FD9E8', 'jglow') + R(x + 1, baseY - 5, 4, 2, '#D9F4FF') +
    R(x, baseY - 3, 6, 2, '#B8E6F5') + R(x + 1, baseY - 1, 1, 3, '#B8E6F5') + R(x + 3, baseY - 1, 1, 3, '#B8E6F5') + R(x + 5, baseY - 1, 1, 2, '#B8E6F5') +
    '</g>'
  const css = CSS(`
    @keyframes s1 { from { transform: translateX(0) } to { transform: translateX(-36px) } }
    @keyframes s2 { from { transform: translateX(-30px) } to { transform: translateX(8px) } }
    @keyframes f1 { from { transform: translateX(0); opacity: .4 } 50% { opacity: .9 } to { transform: translateX(-36px); opacity: .4 } }
    @keyframes f2 { from { transform: translateX(-30px); opacity: .7 } 50% { opacity: .35 } to { transform: translateX(8px); opacity: .7 } }
    @keyframes lantern { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }
    @keyframes sweep { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
    @keyframes mp0 { 0%, 100% { opacity: .3 } 25% { opacity: .55 } 50% { opacity: .8 } 75% { opacity: .5 } }
    @keyframes mp1 { 0%, 100% { opacity: .7 } 25% { opacity: .45 } 50% { opacity: .25 } 75% { opacity: .5 } }
    @keyframes warm { 0%, 100% { opacity: .5 } 50% { opacity: 1 } }
    @keyframes tw0 { 0%, 55% { opacity: 1 } 56%, 100% { opacity: .2 } }
    @keyframes tw1 { 0%, 40% { opacity: .2 } 41%, 100% { opacity: 1 } }
    @keyframes tw2 { 0%, 65% { opacity: 1 } 66%, 100% { opacity: .25 } }
    @keyframes jelly0 { 0% { transform: translate(0, 0); opacity: .5 } 25% { transform: translate(0, -7px); opacity: .8 } 50% { transform: translate(0, -14px); opacity: 1 } 75% { transform: translate(0, -7px); opacity: .75 } 100% { transform: translate(0, 0); opacity: .5 } }
    @keyframes jelly1 { 0% { transform: translate(0, 0); opacity: .7 } 25% { transform: translate(0, -5px); opacity: .5 } 50% { transform: translate(0, -10px); opacity: .35 } 75% { transform: translate(0, -5px); opacity: .55 } 100% { transform: translate(0, 0); opacity: .7 } }
    @keyframes jelly2 { 0% { transform: translate(0, 0); opacity: .4 } 25% { transform: translate(0, -8px); opacity: .75 } 50% { transform: translate(0, -16px); opacity: 1 } 75% { transform: translate(0, -8px); opacity: .7 } 100% { transform: translate(0, 0); opacity: .4 } }
    @keyframes jglow { 0%, 100% { opacity: .4 } 50% { opacity: .95 } }
    .s1 { animation: s1 10s linear infinite }
    .s2 { animation: s2 12s linear infinite }
    .f1 { animation: f1 10s linear infinite }
    .f2 { animation: f2 12s linear infinite }
    .lantern { animation: lantern 1.8s steps(1) infinite }
    .sweep { animation: sweep 8s linear infinite; transform-origin: 32px 99px; transform-box: fill-box }
    .mp0 { animation: mp0 3.4s ease-in-out infinite }
    .mp1 { animation: mp1 4.2s ease-in-out infinite }
    .warm { animation: warm 2.6s ease-in-out infinite }
    .tw0 { animation: tw0 2.4s steps(1) infinite }
    .tw1 { animation: tw1 3s steps(1) infinite }
    .tw2 { animation: tw2 2s steps(1) infinite }
    .jelly0 { animation: jelly0 7s ease-in-out infinite }
    .jelly1 { animation: jelly1 8.5s ease-in-out infinite 1.5s }
    .jelly2 { animation: jelly2 6.5s ease-in-out infinite 3s }
    .jglow { animation: jglow 2.4s ease-in-out infinite }
    .moonp { animation: lantern 6s ease-in-out infinite }
  `)
  return { css, body: `${sky}${moonG}${tw}${sea}${path}${foam}${boatFar}${light}${jelly(258, 96, 0)}${jelly(272, 116, 1)}${jelly(38, 92, 2)}${reef}` }
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
  const out = scaleSvg(svg, 2)
  writeFileSync(join(outDir, name), out)
  console.log(`✓ ${name}  (${label}, ${Math.round(svg.length / 1024)}KB)`)
}
console.log('v2 细化版生成完成 →', outDir)
