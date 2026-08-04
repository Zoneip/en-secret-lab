/**
 * 前台友链数据源:动态版实时读文件,静态版用内容集合
 */
import { getCollection } from 'astro:content'
import { isServer } from '../utils'
import { listFriends, type FriendData } from '../admin/friends-store'

export async function getSiteFriends(): Promise<FriendData[]> {
  if (isServer) return listFriends()
  const items = await getCollection('friends')
  return items.map((f) => ({ id: f.id, ...f.data }))
}
