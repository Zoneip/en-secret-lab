import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getCollection } from 'astro:content'
import { published } from '../lib/content/posts'
import { getSiteConfig } from '../lib/config'

export async function GET(context: APIContext) {
  const config = getSiteConfig()
  const posts = published(await getCollection('posts'))
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
