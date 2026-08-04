/** 文章缺失封面时的像素封面回退:按分类匹配图案,深浅模式各一版 */
export const COVER_PATTERNS = [
  { slug: 'knowledge-book', label: '知识 · 书本' },
  { slug: 'knowledge-gear', label: '知识 · 齿轮' },
  { slug: 'fantasy-magic', label: '幻想 · 魔法瓶' },
  { slug: 'fantasy-dragon', label: '幻想 · 小龙' },
  { slug: 'thinking-bulb', label: '思考 · 灯泡' },
  { slug: 'thinking-puzzle', label: '思考 · 拼图' },
  { slug: 'journal-camera', label: '记录 · 相机' },
  { slug: 'journal-moon', label: '记录 · 月亮' },
  { slug: 'kemono-ear', label: 'Kemono · 兽耳' },
  { slug: 'kemono-paw', label: 'Kemono · 爪印' },
  { slug: 'tech-robot', label: '科技 · 机器人' },
  { slug: 'tech-terminal', label: '科技 · 终端' },
  { slug: 'dream-comet', label: '梦幻 · 彗星' },
] as const

/** 分类关键词 → 图案 slug(优先匹配,未命中用默认) */
const CATEGORY_PATTERN: Array<[string, string]> = [
  ['知识', 'knowledge-book'],
  ['幻想', 'fantasy-magic'],
  ['思考', 'thinking-bulb'],
  ['记录', 'journal-moon'],
  ['科技', 'tech-terminal'],
  ['技术', 'tech-terminal'],
  ['梦', 'dream-comet'],
  ['kemono', 'kemono-ear'],
  ['Kemono', 'kemono-ear'],
]

export function resolveCoverPattern(category: string | undefined, fallback: string): string {
  for (const [kw, slug] of CATEGORY_PATTERN) {
    if (category?.includes(kw)) return slug
  }
  return fallback
}

/** 返回深浅两版封面 URL */
export function coverFallback(category: string | undefined, pattern: string) {
  const slug = resolveCoverPattern(category, pattern)
  return {
    slug,
    light: `/assets/covers/${slug}-light.svg`,
    dark: `/assets/covers/${slug}-dark.svg`,
  }
}
