/**
 * 前台站点内容数据源:栏目/角色/关于
 * 动态版实时读文件(控制台修改即时生效),静态版用内容集合
 */
import { getCollection } from 'astro:content'
import { isServer } from '../utils'
import {
  listColumns,
  listOcs,
  getAbout,
  type ColumnData,
  type OcData,
  type AboutData,
} from '../admin/content-store'

export async function getSiteColumns(): Promise<ColumnData[]> {
  if (isServer) return listColumns()
  const cols = await getCollection('columns')
  return cols.map((c) => ({ id: c.id, ...c.data }))
}

export async function getSiteOcs(): Promise<OcData[]> {
  if (isServer) return listOcs()
  const ocs = await getCollection('ocs')
  return ocs.map((o) => ({ id: o.id, ...o.data }))
}

export async function getSiteAbout(): Promise<AboutData | null> {
  if (isServer) return getAbout()
  const [about] = await getCollection('about')
  return about ? { ...about.data } : null
}
