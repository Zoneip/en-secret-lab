/**
 * 服务端中间件(仅动态版生效):
 *  - CSRF 同源校验(自实现,容错端口:本地直连与反代场景均可用)
 *  - /uploads/* 资产静态服务(长缓存)
 *  - /admin/* 登录守卫(login 与 API 内部校验除外)
 *  - 安全头
 * 静态构建不会加载本文件
 */
import { readFileSync } from 'node:fs'
import { extname } from 'node:path'
import { defineMiddleware } from 'astro:middleware'
import { isServer } from './lib/utils'
import { SESSION_COOKIE, getSessionUser } from './lib/admin/auth'
import { assetFileOnDisk, MIME_BY_EXT } from './lib/admin/assets'

const PUBLIC_ADMIN = new Set([
  '/admin/login',
  '/admin/api/login',
  '/admin/api/logout',
])
const MUTATING = ['POST', 'PUT', 'PATCH', 'DELETE']

/**
 * 同源校验:浏览器跨站请求会携带 Origin 头。
 * 比较 hostname(忽略端口,避免 Astro 内置检查的端口丢失误判),
 * 无 Origin 头(非浏览器/同站表单)放行。
 * 覆盖所有 mutating 请求(含 JSON API),不依赖 SameSite cookie 单兵作战
 */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  try {
    return new URL(origin).hostname === new URL(request.url).hostname
  } catch {
    return false
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (!isServer) return next()

  const url = new URL(context.request.url)

  // CSRF 校验(替代 Astro 内置 checkOrigin):所有 mutating 请求均要求同源
  if (MUTATING.includes(context.request.method) && !isSameOrigin(context.request)) {
    return new Response('Cross-site mutating requests are forbidden', {
      status: 403,
    })
  }

  // 上传资产静态服务
  if (url.pathname.startsWith('/uploads/')) {
    const file = assetFileOnDisk(url.pathname)
    if (!file) return new Response('Not Found', { status: 404 })
    const ext = extname(file)
    const mime = MIME_BY_EXT[ext] ?? 'application/octet-stream'
    const body = readFileSync(file)
    return new Response(new Uint8Array(body), {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  }

  // admin 守卫:仅站主(owner)可访问,访客会话一律拒绝(防越权)
  if (url.pathname.startsWith('/admin') && !PUBLIC_ADMIN.has(url.pathname)) {
    const token = context.cookies.get(SESSION_COOKIE)?.value
    const user = getSessionUser(token)
    const isOwner = user?.role === 'owner'
    const isApi = url.pathname.startsWith('/admin/api')
    if (isApi) {
      if (!isOwner) {
        return new Response(JSON.stringify({ error: '未登录' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    } else if (!isOwner) {
      return context.redirect('/admin/login', 302)
    }
  }

  const response = await next()

  // HTML 页面不缓存(防止旧页面引用构建后失效的字体/资源)
  const ct = response.headers.get('Content-Type') ?? ''
  if (ct.includes('text/html')) {
    response.headers.set('Cache-Control', 'no-cache')
  }

  // 安全头
  if (!response.headers.has('X-Content-Type-Options')) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
  }
  if (!response.headers.has('X-Frame-Options')) {
    response.headers.set('X-Frame-Options', 'DENY')
  }
  if (!response.headers.has('Referrer-Policy')) {
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  }
  return response
})
