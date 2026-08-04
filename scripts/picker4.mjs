import puppeteer from 'puppeteer'
const exe = '/home/fwb/.cache/puppeteer/chrome-headless-shell/linux-148.0.7778.97/chrome-headless-shell-linux64/chrome-headless-shell'
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'], executablePath: exe })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto('http://localhost:4321/admin/login', { waitUntil: 'domcontentloaded', timeout: 15000 })
await page.type('input[name="username"]', 'admin')
await page.type('input[name="password"]', '123456')
await page.click('.submit')
await new Promise((r) => setTimeout(r, 1500))
await page.goto('http://localhost:4321/admin/settings?tab=themes', { waitUntil: 'domcontentloaded', timeout: 15000 })
await new Promise((r) => setTimeout(r, 1500))

// 打开浅色选择器(真实点击)
const pos1 = await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button[title="从资产库选择"]')][0]
  const r = btn.getBoundingClientRect()
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
})
await page.mouse.click(pos1.x, pos1.y)
await new Promise((r) => setTimeout(r, 600))

// 真实点击第一个资产项
const pos2 = await page.evaluate(() => {
  const dlg = document.querySelector('[data-slot="dialog-content"]')
  const item = dlg.querySelector('button[type="button"]')
  const r = item.getBoundingClientRect()
  return { x: r.x + r.width / 2, y: r.y + r.height / 2, firstAsset: item.querySelector('img')?.src.slice(0, 40) }
})
console.log('资产项:', JSON.stringify(pos2))
await page.mouse.click(pos2.x, pos2.y)
await new Promise((r) => setTimeout(r, 600))

const after = await page.evaluate(() => {
  const card = [...document.querySelectorAll('[data-slot="card"]')].find((c) => c.querySelector('h4')?.textContent === '背景壁纸')
  const inputs = [...card.querySelectorAll('input')]
  return { light: inputs[0]?.value, dark: inputs[1]?.value, previewImgs: card.querySelectorAll('img').length }
})
console.log('选择后:', JSON.stringify(after), after.light.startsWith('url:') ? '✓' : '✗')
console.log('JS 错误:', errors.length ? errors : '无')
await browser.close()
