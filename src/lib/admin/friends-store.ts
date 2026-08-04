/**
 * 友链存储:展示友链(friends/*.yaml,控制台可管理)
 * 友链申请(SQLite friend_requests:待审/通过/拒绝)
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { randomUUID } from 'node:crypto'
import { getDb } from './db'

export interface FriendData {
  id: string
  name: string
  url: string
  avatar?: string
  description?: string
}

export interface FriendRequest {
  id: string
  name: string
  url: string
  avatar?: string
  description?: string
  email?: string
  status: 'pending' | 'approved' | 'rejected'
  ip?: string
  created_at: number
}

const friendsDir = () => join(process.env.CONTENT_DIR ?? join(process.cwd(), 'src', 'content'), 'friends')

/* ---------- 展示友链 ---------- */

export function listFriends(): FriendData[] {
  mkdirSync(friendsDir(), { recursive: true })
  const files = readdirSync(friendsDir()).filter((f) => f.endsWith('.yaml'))
  return files
    .map((f) => {
      try {
        const raw = parseYaml(readFileSync(join(friendsDir(), f), 'utf8')) as Omit<FriendData, 'id'>
        return { id: f.replace(/\.yaml$/, ''), ...raw }
      } catch {
        return null
      }
    })
    .filter((f): f is FriendData => f !== null)
}

export function saveFriend(id: string, data: Omit<FriendData, 'id'>): FriendData {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error('友链 id 仅允许小写字母、数字与连字符')
  mkdirSync(friendsDir(), { recursive: true })
  writeFileSync(join(friendsDir(), `${id}.yaml`), stringifyYaml(data))
  return { id, ...data }
}

export function deleteFriend(id: string): boolean {
  const file = join(friendsDir(), `${id}.yaml`)
  try {
    unlinkSync(file)
    return true
  } catch {
    return false
  }
}

/* ---------- 友链申请 ---------- */

export function createRequest(
  data: { name: string; url: string; avatar?: string; description?: string; email?: string },
  ip?: string
): FriendRequest {
  const req: FriendRequest = {
    id: randomUUID(),
    ...data,
    status: 'pending',
    ip,
    created_at: Date.now(),
  }
  getDb()
    .prepare(
      `INSERT INTO friend_requests (id, name, url, avatar, description, email, status, ip, created_at)
       VALUES (@id, @name, @url, @avatar, @description, @email, @status, @ip, @createdAt)`
    )
    .run({ ...req, createdAt: req.created_at })
  return req
}

export function listRequests(status?: string): FriendRequest[] {
  const rows = status
    ? getDb().prepare('SELECT * FROM friend_requests WHERE status = ? ORDER BY created_at DESC').all(status)
    : getDb().prepare('SELECT * FROM friend_requests ORDER BY created_at DESC').all()
  return rows as unknown as FriendRequest[]
}

export function getRequest(id: string): FriendRequest | null {
  const row = getDb().prepare('SELECT * FROM friend_requests WHERE id = ?').get(id) as FriendRequest | undefined
  return row ?? null
}

export function setRequestStatus(id: string, status: 'approved' | 'rejected'): void {
  getDb().prepare('UPDATE friend_requests SET status = ? WHERE id = ?').run(status, id)
}

export function deleteRequest(id: string): void {
  getDb().prepare('DELETE FROM friend_requests WHERE id = ?').run(id)
}

/** 同一 IP 当日申请数(防滥用) */
export function countRequestsToday(ip: string): number {
  const dayStart = new Date()
  dayStart.setHours(0, 0, 0, 0)
  const row = getDb()
    .prepare('SELECT COUNT(*) as n FROM friend_requests WHERE ip = ? AND created_at >= ?')
    .get(ip, +dayStart) as { n: number }
  return row.n
}
