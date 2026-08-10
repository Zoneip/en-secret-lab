// 本地静态站预览服务器:支持 GitHub Pages 子路径 base(/en-secret-lab/)与 404 fallback
// 用法:node scripts/serve-static.mjs [端口] [base]
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname, normalize } from 'node:path'

const PORT = Number(process.argv[2] || process.env.PORT || 4322)
const BASE = (process.argv[3] || process.env.ASTRO_BASE || '/en-secret-lab').replace(/\/+$/, '')
const ROOT = join(process.cwd(), 'dist-static')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
}

createServer(async (req, res) => {
  try {
    let pathname = new URL(req.url, 'http://localhost').pathname
    // 剥离子路径前缀(无前缀请求直接落到根)
    if (BASE && pathname.startsWith(BASE + '/')) pathname = pathname.slice(BASE.length) || '/'
    else if (BASE && pathname === BASE) pathname = '/'
    if (pathname.endsWith('/')) pathname += 'index.html'
    // 防目录穿越
    const file = normalize(join(ROOT, pathname))
    if (!file.startsWith(ROOT)) {
      res.writeHead(403)
      return res.end('Forbidden')
    }
    let data
    try {
      data = await readFile(file)
    } catch {
      // 无尾斜杠的目录路径(/knowledge → knowledge/index.html)
      try {
        data = await readFile(join(ROOT, pathname, 'index.html'))
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        return res.end(data)
      } catch {
        data = await readFile(join(ROOT, '404.html'))
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
        return res.end(data)
      }
    }
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' })
    res.end(data)
  } catch (e) {
    res.writeHead(500)
    res.end(String(e))
  }
}).listen(PORT, () => console.log(`静态站预览: http://localhost:${PORT}${BASE}/ (根目录: ${ROOT})`))
