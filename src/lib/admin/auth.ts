/**
 * 认证与会话:bcrypt 密码校验 + HttpOnly cookie 会话
 * 密码哈希首次启动时从 ADMIN_PASSWORD 环境变量初始化
 */
import { randomBytes, timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { loadEnv } from '../env'
import { getDb, settingGet, settingSet, sessionCreate, sessionValid, sessionDestroy } from './db'

export const SESSION_COOKIE = 'enlab_session'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 天
const PASSWORD_KEY = 'admin_password_hash'

function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10)
}

/** 初始化/更新管理员密码哈希 */
export function ensureAdminPassword(): void {
  if (settingGet(PASSWORD_KEY)) return
  const env = loadEnv(process.env)
  if (env.ADMIN_PASSWORD === 'change-me') {
    console.warn('[admin] ADMIN_PASSWORD 仍是默认值,请立即修改!')
  }
  settingSet(PASSWORD_KEY, hashPassword(env.ADMIN_PASSWORD))
}

export function verifyPassword(plain: string): boolean {
  const hash = settingGet(PASSWORD_KEY)
  if (!hash) return false
  try {
    return bcrypt.compareSync(plain, hash)
  } catch {
    return false
  }
}

export function changePassword(plain: string): boolean {
  if (plain.length < 6) return false
  settingSet(PASSWORD_KEY, hashPassword(plain))
  return true
}

/** 创建会话,返回 cookie 值 */
export function createSession(): string {
  const token = randomBytes(32).toString('hex')
  sessionCreate(token, SESSION_TTL_MS)
  return token
}

export function destroySession(token: string): void {
  sessionDestroy(token)
}

/** 校验请求头中的会话;使用固定时间比较避免时序攻击 */
export function isAuthed(token: string | undefined): boolean {
  if (!token) return false
  const sessions = getDb()
    .prepare('SELECT token FROM sessions')
    .all() as Array<{ token: string }>
  const target = Buffer.from(token)
  for (const s of sessions) {
    if (s.token.length === target.length && timingSafeEqual(Buffer.from(s.token), target)) {
      return sessionValid(s.token)
    }
  }
  return false
}
