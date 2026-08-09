import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getAllPosts } from '../lib/content/data'
import { getSiteConfig } from '../lib/config'
import { withBase } from '../lib/utils'

export async function GET(context: APIContext) {
  const config = getSiteConfig()
  const posts = await getAllPosts()
  return rss({
    title: config.title,
    description: config.description,
    site:
      // 注意用 || 而非 ??:Actions 未配置 vars.SITE_URL 时 env 是空字符串,?? 不兑底
      process.env.SITE_URL || context.site?.toString() || 'https://example.com',
    items: posts.map((post) => ({
      title: post.title,
      description: post.description,
      pubDate: post.pubDate,
      // 子路径部署时 link 必须带 base 前缀,否则 new URL(link, site) 会丢掉路径
      link: withBase(`/blog/${post.slug}/`),
      categories: post.tags,
    })),
    customData: `<language>zh-CN</language>`,
  })
}
