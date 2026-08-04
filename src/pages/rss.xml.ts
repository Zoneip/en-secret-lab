import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getAllPosts } from '../lib/content/data'
import { getSiteConfig } from '../lib/config'

export async function GET(context: APIContext) {
  const config = getSiteConfig()
  const posts = await getAllPosts()
  return rss({
    title: config.title,
    description: config.description,
    site: context.site ?? import.meta.env.SITE_URL,
    items: posts.map((post) => ({
      title: post.title,
      description: post.description,
      pubDate: post.pubDate,
      link: `/blog/${post.slug}/`,
      categories: post.tags,
    })),
    customData: `<language>zh-CN</language>`,
  })
}
