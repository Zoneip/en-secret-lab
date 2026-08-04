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

const ocs = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    theme: z.enum(['gray', 'yellow', 'purple', 'white']),
    subtitle: z.string(),
    description: z.string(),
    traits: z.array(z.string()).default([]),
    quote: z.string().optional(),
    art: z.string().optional(),
  }),
})

export const collections = { posts, friends, about, ocs }
