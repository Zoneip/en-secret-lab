/** 标签/分类聚合:纯函数,可单测 */

import type { PostLike } from './posts'

export interface TaxonomyItem {
  name: string
  count: number
}

export function aggregateByKey(
  posts: Array<{ tags?: string[]; category?: string }>,
  key: 'tags' | 'category',
): TaxonomyItem[] {
  const map = new Map<string, number>()
  for (const post of posts) {
    if (key === 'category') {
      if (post.category)
        map.set(post.category, (map.get(post.category) ?? 0) + 1)
    } else {
      for (const tag of post.tags ?? []) map.set(tag, (map.get(tag) ?? 0) + 1)
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'))
}

// ============ 分类思维导图:树结构 ============

export interface PostLeafNode {
  type: 'post'
  name: string
  slug: string
  href: string
  pubDate: Date
}

export interface CategoryBranchNode {
  type: 'category' | 'series'
  name: string
  count: number
  /** category 有归档页;series 无(站内无 series 归档路由) */
  href?: string
  children: Array<CategoryBranchNode | PostLeafNode>
}

export interface CategoryRootNode {
  type: 'root'
  name: string
  count: number
  children: CategoryBranchNode[]
}

export type CategoryTreeNode =
  CategoryRootNode | CategoryBranchNode | PostLeafNode

function toPostLeaf(p: PostLike): PostLeafNode {
  return {
    type: 'post',
    name: p.title,
    slug: p.slug,
    href: `/blog/${p.slug}`,
    pubDate: p.pubDate,
  }
}

/**
 * 构建「分类 → 系列 → 文章」的径向树结构(纯函数,可单测)。
 * - 按 category 分桶(按 count 降序,同序复用 aggregateByKey)
 * - category 内按 series 二次分桶:有 series 的文章挂到 series 节点下(系列内按 pubDate 倒序),
 *   无 series 的直接作为 category 叶子(按 pubDate 倒序)
 * - category 的 children 中 series 节点排前(按 count 降序),叶子排后(按时间倒序)
 * - series 节点不设 href(站内无 series 归档页)
 */
export function buildCategoryTree(posts: PostLike[]): CategoryRootNode {
  const root: CategoryRootNode = {
    type: 'root',
    name: '全站文章',
    count: posts.length,
    children: [],
  }

  // 按 category 分桶,顺序复用 aggregateByKey(count 降序 → 名称)
  const catOrder = aggregateByKey(posts, 'category').map((c) => c.name)
  const byCategory = new Map<string, PostLike[]>()
  for (const p of posts) {
    const arr = byCategory.get(p.category) ?? []
    arr.push(p)
    byCategory.set(p.category, arr)
  }

  for (const catName of catOrder) {
    const catPosts = byCategory.get(catName) ?? []
    const catNode: CategoryBranchNode = {
      type: 'category',
      name: catName,
      count: catPosts.length,
      href: `/categories/${encodeURIComponent(catName)}`,
      children: [],
    }

    // category 内按 series 分桶(undefined/null 归为独立文章)
    const bySeries = new Map<string, PostLike[]>()
    for (const p of catPosts) {
      const key = p.series ?? ''
      const arr = bySeries.get(key) ?? []
      arr.push(p)
      bySeries.set(key, arr)
    }

    const seriesNodes: CategoryBranchNode[] = []
    const standaloneLeaves: PostLeafNode[] = []

    for (const [seriesName, sPosts] of bySeries) {
      const sorted = [...sPosts].sort((a, b) => +b.pubDate - +a.pubDate)
      if (seriesName === '') {
        standaloneLeaves.push(...sorted.map(toPostLeaf))
      } else {
        seriesNodes.push({
          type: 'series',
          name: seriesName,
          count: sorted.length,
          children: sorted.map(toPostLeaf),
        })
      }
    }

    // series 节点排前(按 count 降序 → 名称),叶子排后(已按时间倒序)
    seriesNodes.sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'),
    )
    catNode.children = [...seriesNodes, ...standaloneLeaves]
    root.children.push(catNode)
  }

  return root
}
