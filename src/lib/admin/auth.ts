/**
 * 认证与会话:bcrypt 密码校验 + HttpOnly cookie 会话
 * 账号体系基于 users 表(站主 owner / 访客 visitor);
 * 站主账号首次启动时从旧密码哈希或 ADMIN_PASSWORD 环境变量迁移创建
 */
import { randomBytes, timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { loadEnv } from '../env'
import {
  getDb,
  settingGet,
  settingDelete,
  sessionCreate,
  sessionValid,
  sessionDestroy,
  userGetByUsername,
  userList,
  userCreate,
  userSetPassword,
  userTouchLogin,
  type UserRow,
} from './db'

export const SESSION_COOKIE = 'enlab_session'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 天
const PASSWORD_KEY = 'admin_password_hash'

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10)
}

/** 对外暴露的账号信息(不含密码哈希) */
export interface PublicUser {
  id: string
  username: string
  display_name: string | null
  email: string | null
  role: 'owner' | 'visitor'
  status: 'active' | 'banned'
  created_at: number
  last_login_at: number | null
  login_count: number
}

export function toPublicUser(u: UserRow): PublicUser {
  return {
    id: u.id,
    username: u.username,
    display_name: u.display_name,
    email: u.email,
    role: u.role,
    status: u.status,
    created_at: u.created_at,
    last_login_at: u.last_login_at,
    login_count: u.login_count,
  }
}

/** 迁移/初始化站主账号:users 表无 owner 时,从旧密码哈希或环境变量创建(幂等) */
export function ensureOwnerAccount(): void {
  if (userList().some((u) => u.role === 'owner')) return
  const env = loadEnv(process.env)
  const legacyHash = settingGet(PASSWORD_KEY)
  const hash = legacyHash ?? hashPassword(env.ADMIN_PASSWORD)
  if (env.ADMIN_PASSWORD === 'change-me' && !legacyHash) {
    console.warn('[admin] ADMIN_PASSWORD 仍是默认值,请立即修改!')
  }
  userCreate({
    username: env.ADMIN_USERNAME,
    display_name: env.ADMIN_USERNAME,
    password_hash: hash,
    email: null,
    role: 'owner',
  })
  if (legacyHash) settingDelete(PASSWORD_KEY) // 迁移后移除旧键,认证以 users 表为准
}

export type LoginResult =
  { ok: true; user: PublicUser } | { ok: false; error: string }

/** 校验账号密码(凭据错误优先返回;封禁账号凭据正确时提示封禁),成功时记录登录时间/次数 */
export function verifyLogin(username: string, password: string): LoginResult {
  const user = userGetByUsername(username)
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return { ok: false, error: '用户名或密码错误' }
  }
  if (user.status !== 'active') {
    return { ok: false, error: '账号已被封禁' }
  }
  userTouchLogin(user.id)
  return { ok: true, user: toPublicUser(user) }
}

/** 重置任意账号密码(≥8 位) */
export function resetPassword(userId: string, plain: string): boolean {
  if (plain.length < 8) return false
  userSetPassword(userId, hashPassword(plain))
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
    if (
      s.token.length === target.length &&
      timingSafeEqual(Buffer.from(s.token), target)
    ) {
      return sessionValid(s.token)
    }
  }
  return false
}
