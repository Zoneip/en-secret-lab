import { describe, it, expect } from 'vitest'
import { parsePostFile, serializePost, type PostDraft } from '../../src/lib/admin/posts-store'

const draft: PostDraft = {
  slug: 'test-post',
  title: '测试文章',
  description: '摘要',
  pubDate: '2026-08-04',
  category: '技术',
  tags: ['前端', 'furry', '随笔'],
  draft: false,
  featured: true,
  body: '# 正文\n\n内容',
}

describe('posts-store 序列化往返', () => {
  it('serialize → parse 保持字段一致', () => {
    const raw = serializePost(draft)
    const parsed = parsePostFile('test-post.md', raw)
    expect(parsed.draft.title).toBe('测试文章')
    expect(parsed.draft.category).toBe('技术')
    expect(parsed.draft.tags).toEqual(['前端', 'furry', '随笔'])
    expect(parsed.draft.draft).toBe(false)
    expect(parsed.draft.featured).toBe(true)
    expect(parsed.draft.pubDate).toBe('2026-08-04')
    expect(parsed.draft.description).toBe('摘要')
  })

  it('解析无引号 YAML 数组(手工书写)', () => {
    const raw = [
      '---',
      'title: 手动文章',
      'pubDate: 2026-08-01',
      'category: 随笔',
      'tags: [前端, furry, 碎碎念]',
      'draft: false',
      '---',
      '',
      '正文',
    ].join('\n')
    const parsed = parsePostFile('manual.md', raw)
    expect(parsed.draft.tags).toEqual(['前端', 'furry', '碎碎念'])
  })

  it('解析带引号 YAML 数组(控制台生成)', () => {
    const raw = [
      '---',
      'title: 控制台文章',
      'pubDate: 2026-08-02',
      'category: 生活',
      "tags: ['开站', '前端']",
      'draft: false',
      '---',
      '',
      '正文',
    ].join('\n')
    const parsed = parsePostFile('console.md', raw)
    expect(parsed.draft.tags).toEqual(['开站', '前端'])
  })

  it('解析单个标签', () => {
    const raw = '---\ntitle: t\npubDate: 2026-01-01\ncategory: c\ntags: [furry]\ndraft: false\n---\n'
    const parsed = parsePostFile('single.md', raw)
    expect(parsed.draft.tags).toEqual(['furry'])
  })
})
