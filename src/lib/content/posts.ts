/** 文章查询层:统一排序、草稿过滤、分页、归档(接受 Astro content entries) */
import type { CollectionEntry } from 'astro:content'

export type PostEntry = CollectionEntry<'posts'>

export interface PostLike {
  id: string
  slug: string
  title: string
  pubDate: Date
  category: string
  tags: string[]
  featured: boolean
  draft: boolean
  description?: string
  cover?: string
}

/** 把 Astro entry 映射为扁平结构,供聚合/卡片等纯逻辑使用 */
export function toPostLike(post: PostEntry): PostLike {
  return {
    id: post.id,
    slug: post.slug,
    title: post.data.title,
    pubDate: post.data.pubDate,
    category: post.data.category,
    tags: post.data.tags,
    featured: post.data.featured,
    draft: post.data.draft,
    description: post.data.description,
    cover: post.data.cover,
  }
}

export function published(posts: PostEntry[]): PostLike[] {
  return posts
    .map(toPostLike)
    .filter((p) => !p.draft)
    .sort((a, b) => +b.pubDate - +a.pubDate)
}

export function featured(posts: PostLike[]): PostLike[] {
  return posts.filter((p) => p.featured)
}

export interface PageSlice<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** 纯分页逻辑 */
export function paginate<T>(items: T[], page: number, pageSize: number): PageSlice<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  return {
    items: items.slice((safePage - 1) * pageSize, safePage * pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  }
}
