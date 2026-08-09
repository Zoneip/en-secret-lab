import type { APIRoute } from 'astro'

export const GET: APIRoute = ({ site }) => {
  const baseUrl = site ?? new URL(import.meta.env.SITE_URL)
  // 子路径部署时 sitemap 完整 URL 必须带 base 前缀,不能只取 origin
  const sitemap = `${baseUrl.origin}${baseUrl.pathname.replace(/\/+$/, '')}/sitemap-index.xml`
  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    `Sitemap: ${sitemap}`,
  ].join('\n')
  return new Response(robots, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
