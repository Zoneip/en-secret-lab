/**
 * 前台资源数据源:动态版实时读文件,静态版用内容集合
 */
import { getCollection } from 'astro:content'
import { isServer } from '../utils'
import { listResources, type ResourceData } from '../admin/resources-store'

export async function getSiteResources(): Promise<ResourceData[]> {
  if (isServer) return listResources()
  const items = await getCollection('resources')
  return items
    .map((r) => ({ id: r.id, pubDate: r.data.pubDate.toISOString().slice(0, 10), ...r.data }))
    .sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate))
}
