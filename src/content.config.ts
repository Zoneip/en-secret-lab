import { defineCollection, z } from 'astro:content'

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    cover: z.string().optional(),
    category: z.string().default('随笔'),
    series: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
})

const friends = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    url: z.string().url(),
    avatar: z.string().optional(),
    description: z.string().optional(),
    group: z.string().default('其他'),
  }),
})

const about = defineCollection({
  type: 'data',
  schema: z.object({
    nickname: z.string(),
    tagline: z.string(),
    avatar: z.string().optional(),
    intro: z.array(z.string()),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        })
      )
      .default([]),
  }),
})

const columns = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    theme: z.enum(['gray', 'yellow', 'purple', 'white']),
    category: z.string(),
  }),
})

const ocs = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    theme: z.enum(['gray', 'yellow', 'purple', 'white']),
    subtitle: z.string(),
    description: z.string(),
    traits: z.array(z.string()).default([]),
    quote: z.string().optional(),
    quoteEffect: z.enum(['none', 'typing', 'fade', 'float']).default('typing'),
    quoteSpeed: z.enum(['slow', 'normal', 'fast']).default('normal'),
    art: z.string().optional(),
  }),
})

const resources = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    category: z.string().default('其他'),
    tags: z.array(z.string()).default([]),
    /** 文件大小显示文本(如 12.4 MB) */
    size: z.string().optional(),
    /** 动态版上传的文件(/uploads/...) */
    file: z.string().optional(),
    /** 外部下载链接(静态版) */
    externalUrl: z.string().url().optional(),
    pubDate: z.coerce.date(),
    downloads: z.number().default(0),
  }),
})

export const collections = { posts, friends, about, columns, ocs, resources }
