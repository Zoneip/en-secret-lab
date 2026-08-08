/** SEO 元数据工具 */

export interface SeoOptions {
  title: string
  description?: string
  type?: 'website' | 'article'
  url?: string
  image?: string
  siteTitle: string
  siteUrl: string
}

export function buildMeta(opts: SeoOptions) {
  const fullTitle =
    opts.title === opts.siteTitle
      ? opts.title
      : `${opts.title} · ${opts.siteTitle}`
  const meta: Record<string, string>[] = [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { title: fullTitle },
    { name: 'description', content: opts.description ?? '' },
    { property: 'og:title', content: fullTitle },
    { property: 'og:type', content: opts.type ?? 'website' },
    { property: 'og:site_name', content: opts.siteTitle },
  ]
  if (opts.url) meta.push({ property: 'og:url', content: opts.url })
  if (opts.description)
    meta.push({ property: 'og:description', content: opts.description })
  if (opts.image) {
    meta.push({ property: 'og:image', content: opts.image })
    meta.push({ name: 'twitter:card', content: 'summary_large_image' })
  } else {
    meta.push({ name: 'twitter:card', content: 'summary' })
  }
  return meta
}
