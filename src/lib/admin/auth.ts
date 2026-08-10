/**
 * 认证与会话:bcrypt 密码校验 + HttpOnly cookie 会话
 * 账号体系基于 users 表(站主 owner / 访客 visitor);
 * 站主账号首次启动时从旧密码哈希或 ADMIN_PASSWORD 环境变量迁移创建
 * 会话绑定 user_id,鉴权时返回用户信息以供角色校验
 */
import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { loadEnv } from '../env'
import {
  settingGet,
  settingDelete,
  sessionCreate,
  sessionUserId,
  sessionPruneExpired,
  sessionDestroy,
  userGetById,
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
  if (!legacyHash && env.ADMIN_PASSWORD === 'change-me') {
    throw new Error(
      'ADMIN_PASSWORD 未配置(当前为默认值 change-me)。请设置至少 8 位的环境变量后重启,避免以公开已知的默认密码创建站主账号',
    )
  }
  const hash = legacyHash ?? hashPassword(env.ADMIN_PASSWORD)
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

/** 创建会话,返回 cookie 值;会话绑定用户,鉴权时可据此校验角色 */
export function createSession(userId: string): string {
  const token = randomBytes(32).toString('hex')
  sessionPruneExpired()
  sessionCreate(token, SESSION_TTL_MS, userId)
  return token
}

export function destroySession(token: string): void {
  sessionDestroy(token)
}

/**
 * 校验会话并返回对应用户;token 无效/过期、用户不存在或已封禁均返回 null。
 * token 为 256 位随机值,直接 SQL 主键查找(替代旧的 timingSafeEqual 全表扫描)
 */
export function getSessionUser(token: string | undefined): PublicUser | null {
  if (!token) return null
  const userId = sessionUserId(token)
  if (!userId) return null
  const user = userGetById(userId)
  if (!user || user.status !== 'active') return null
  return toPublicUser(user)
}

/* ---------- 登录限流(应用层内存计数,与 nginx limit_req 互补) ---------- */

const LOGIN_ATTEMPTS = new Map<
  string,
  { count: number; lockUntil: number; lastAt: number }
>()
const MAX_LOGIN_ATTEMPTS = 5
const LOGIN_LOCK_MS = 15 * 60 * 1000 // 连续失败后锁定 15 分钟

/** 提取客户端 IP:优先反代设置的 X-Real-IP,其次取 XFF 最右端(代理追加的可信值),避免最左值可伪造 */
export function clientIp(request: Request): string {
  const real = request.headers.get('x-real-ip')
  if (real?.trim()) return real.trim()
  const xff = request.headers.get('x-forwarded-for')
  if (xff) {
    const last = xff.split(',').pop()?.trim()
    if (last) return last
  }
  return 'unknown'
}

export function loginBlocked(ip: string): boolean {
  const e = LOGIN_ATTEMPTS.get(ip)
  return !!e && e.lockUntil > Date.now()
}

export function recordLoginFailure(ip: string): void {
  const now = Date.now()
  // 仅清理已过锁定期或长期静默的条目;不得误删进行中的计数
  for (const [key, e] of LOGIN_ATTEMPTS) {
    if ((e.lockUntil > 0 && e.lockUntil <= now) || now - e.lastAt > LOGIN_LOCK_MS) {
      LOGIN_ATTEMPTS.delete(key)
    }
  }
  const e = LOGIN_ATTEMPTS.get(ip) ?? { count: 0, lockUntil: 0, lastAt: now }
  e.count += 1
  e.lastAt = now
  if (e.count >= MAX_LOGIN_ATTEMPTS) {
    e.lockUntil = now + LOGIN_LOCK_MS
    e.count = 0
  }
  LOGIN_ATTEMPTS.set(ip, e)
}

export function clearLoginFailures(ip: string): void {
  LOGIN_ATTEMPTS.delete(ip)
}
