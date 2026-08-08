import { describe, it, expect } from 'vitest'
import { aggregateByKey } from '../../src/lib/content/taxonomy'
import {
  published,
  featured,
  paginate,
  toPostLike,
} from '../../src/lib/content/posts'
import type { PostEntry } from '../../src/lib/content/posts'

function entry(slug: string, over: Partial<PostEntry['data']> = {}): PostEntry {
  return {
    id: slug,
    slug,
    collection: 'posts',
    data: {
      title: slug,
      description: '',
      pubDate: new Date('2026-01-01'),
      category: '随笔',
      tags: [],
      draft: false,
      featured: false,
      ...over,
    },
  } as PostEntry
}

const posts = [
  entry('a', {
    pubDate: new Date('2026-01-01'),
    tags: ['furry', '随笔'],
    category: '生活',
  }),
  entry('b', {
    pubDate: new Date('2026-02-01'),
    tags: ['furry'],
    category: '技术',
    featured: true,
  }),
  entry('c', {
    pubDate: new Date('2026-03-01'),
    tags: [],
    category: '技术',
    draft: true,
  }),
]

const flat = posts.map(toPostLike)

describe('taxonomy', () => {
  it('按标签聚合且按数量降序', () => {
    const tags = aggregateByKey(flat, 'tags')
    expect(tags).toEqual([
      { name: 'furry', count: 2 },
      { name: '随笔', count: 1 },
    ])
  })

  it('按分类聚合', () => {
    const cats = aggregateByKey(flat, 'category')
    expect(cats).toEqual([
      { name: '技术', count: 2 },
      { name: '生活', count: 1 },
    ])
  })

  it('忽略无该字段的条目', () => {
    const result = aggregateByKey(
      [{ tags: undefined, category: undefined }],
      'category',
    )
    expect(result).toEqual([])
  })
})

describe('posts', () => {
  it('published 过滤草稿并按日期降序', () => {
    const result = published(posts)
    expect(result.map((p) => p.slug)).toEqual(['b', 'a'])
  })

  it('featured 只在已发布中筛选', () => {
    expect(featured(published(posts)).map((p) => p.slug)).toEqual(['b'])
  })

  it('paginate 边界安全(越界页收敛到有效页)', () => {
    const page = paginate(flat, 99, 1)
    expect(page.page).toBe(3)
    expect(page.totalPages).toBe(3)
    expect(page.items.map((p) => p.id)).toEqual(['c'])
  })

  it('paginate 空数据总页数为 1', () => {
    const page = paginate([], 1, 10)
    expect(page.totalPages).toBe(1)
    expect(page.items).toEqual([])
  })
})
