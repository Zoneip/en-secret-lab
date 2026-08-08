// 从动画壁纸分离"顶层动画元素" → 底图(bg.svg,静态)+ 动画层(anim.svg,inline SVG 元素级合成)
// 同 class 元素合并为组(共享同一动画,减少合成层数量)
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'public', 'wallpapers')

// 各场景顶层动画 class(前缀匹配)
const TOP_CLASSES = {
  'gray-tech': [
    'fl',
    'tx1',
    'tx2',
    'cursor',
    'ufo',
    'sign1',
    'sign2',
    'tw0',
    'tw1',
    'tw2',
    'sunspin',
  ],
  'yellow-field': [
    'bfly1',
    'bfly2',
    'wing',
    'bf1',
    'bf2',
    'glow',
    'halo',
    'warm',
    'bg0',
    'bg1',
    'bg2',
    'bg3',
    'moonp',
  ],
  'purple-library': ['beam', 'mbeam', 'dust', 'sheen', 'tw0', 'tw1', 'tw2'],
  'white-sea': [
    'f1',
    'f2',
    'gl1',
    'gl2',
    'wing1',
    'wing2',
    'jump',
    'splash',
    'boat',
    'lantern',
    'sweep',
    'mp0',
    'mp1',
    'warm',
  ],
  'friends-shrine': [
    'pt',
    'pf',
    'bg0',
    'bg1',
    'bg2',
    'bg3',
    'lantern',
    'lhalo',
    'lhalo2',
    'mp0',
    'mp1',
    'shoot',
  ],
}

function extractTop(svg, tops) {
  const grouped = new Map()
  // 自闭合 <rect class="X" .../>
  let bg = svg.replace(/<rect[^>]*\/>/g, (m) => {
    const cm = m.match(/class="([a-z0-9]+)"/)
    if (cm && tops.some((c) => cm[1].startsWith(c))) {
      if (!grouped.has(cm[1])) grouped.set(cm[1], [])
      grouped.get(cm[1]).push(m)
      return ''
    }
    return m
  })
  // <g class="X">...</g>(不跨嵌套 g)
  bg = bg.replace(/<g class="([a-z0-9]+)">(.*?)<\/g>/gs, (m, cls) => {
    if (tops.some((c) => cls.startsWith(c))) {
      if (!grouped.has(cls)) grouped.set(cls, [])
      grouped.get(cls).push(m)
      return ''
    }
    return m
  })
  // 组内元素也按各自 class 归组(嵌套情况:组 class 已是顶层则整体保留)
  const animParts = []
  for (const [cls, els] of grouped) {
    animParts.push(`<g class="${cls}">${els.join('\n')}</g>`)
  }
  return { bg, anim: animParts.join('\n'), groups: grouped.size }
}

for (const file of readdirSync(dir).filter(
  (f) =>
    f.endsWith('.svg') &&
    !f.includes('-static') &&
    !f.includes('-bg') &&
    !f.includes('-anim'),
)) {
  const scene = file.replace(/(?:-light|-dark|-day|-night)\.svg$/, '')
  const tops = TOP_CLASSES[scene] ?? []
  if (!tops.length) continue
  const svg = readFileSync(join(dir, file), 'utf8')
  const { bg, anim, groups } = extractTop(svg, tops)
  if (!anim) {
    console.log(`⚠ ${file}: 无顶层动画元素`)
    continue
  }
  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" shape-rendering="crispEdges">\n${bg}\n</svg>`
  const styleMatch = svg.match(/<style>[\s\S]*?<\/style>/)
  const animSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">\n${styleMatch ? styleMatch[0] : ''}\n${anim}\n</svg>`
  writeFileSync(join(dir, file.replace('.svg', '-bg.svg')), bgSvg)
  writeFileSync(join(dir, file.replace('.svg', '-anim.svg')), animSvg)
  console.log(
    `✓ ${file} → bg(${Math.round(bgSvg.length / 1024)}KB) + anim(${Math.round(animSvg.length / 1024)}KB, ${groups} 组)`,
  )
}
console.log('done')
