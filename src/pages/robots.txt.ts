import type { APIRoute } from 'astro'

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL(import.meta.env.SITE_URL)).origin
  const sitemap = `${base}/sitemap-index.xml`
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
