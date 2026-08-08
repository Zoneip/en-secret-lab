import { describe, it, expect } from 'vitest'
import {
  formatDate,
  readingTime,
  absoluteUrl,
  slugify,
} from '../../src/lib/utils'

describe('formatDate', () => {
  it('输出中文日期', () => {
    expect(formatDate(new Date('2026-08-03'))).toContain('2026')
  })
})

describe('readingTime', () => {
  it('中文按 300 字/分钟估算', () => {
    const zh = '好'.repeat(600)
    expect(readingTime(zh)).toBe(2)
  })
  it('至少 1 分钟', () => {
    expect(readingTime('')).toBe(1)
  })
})

describe('absoluteUrl', () => {
  it('拼接相对路径', () => {
    expect(absoluteUrl('https://example.com', '/blog/a')).toBe(
      'https://example.com/blog/a',
    )
  })
  it('站点地址带尾斜杠也正确', () => {
    expect(absoluteUrl('https://example.com/', '/rss.xml')).toBe(
      'https://example.com/rss.xml',
    )
  })
  it('绝对链接原样返回', () => {
    expect(absoluteUrl('https://example.com', 'https://other.com/x')).toBe(
      'https://other.com/x',
    )
  })
})

describe('slugify', () => {
  it('空格与下划线转连字符', () => {
    expect(slugify('Hello World_Test')).toBe('hello-world-test')
  })
  it('保留中文与数字', () => {
    expect(slugify('我的 2026 计划')).toBe('我的-2026-计划')
  })
})
