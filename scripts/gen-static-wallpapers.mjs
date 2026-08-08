// 从动画壁纸生成静态帧(剥离 <style> 与 class,供滚动场景使用)
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'public', 'wallpapers')

for (const f of readdirSync(dir).filter(
  (f) => f.endsWith('.svg') && !f.includes('-static'),
)) {
  let s = readFileSync(join(dir, f), 'utf8')
  s = s.replace(/<style>[\s\S]*?<\/style>/g, '')
  s = s.replace(/ class="[\w ]+"/g, '')
  const out = join(dir, f.replace('.svg', '-static.svg'))
  writeFileSync(out, s)
  console.log('✓', f.replace('.svg', '-static.svg'))
}
console.log('静态帧生成完成')
