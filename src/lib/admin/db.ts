/**
 * SQLite 数据层:配置、会话、资产索引(未来资源站数据也在此扩展)
 * 仅 server 模式加载;静态构建不引入本模块
 */
import Database from 'better-sqlite3'
import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { loadEnv } from '../env'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db
  const env = loadEnv(process.env)
  mkdirSync(dirname(env.DATABASE_PATH), { recursive: true })
  db = new Database(env.DATABASE_PATH)
  db.pragma('journal_mode = WAL')
  migrate(db)
  return db
}

function migrate(d: Database.Database): void {
  d.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS friend_requests (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      url        TEXT NOT NULL,
      avatar     TEXT,
      description TEXT,
      email      TEXT,
      status     TEXT NOT NULL DEFAULT 'pending',
      ip         TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assets (
      id        TEXT PRIMARY KEY,
      kind      TEXT NOT NULL,             -- wallpaper | font | mascot | blog
      theme_id  TEXT,                      -- 关联主题(可选)
      file_name TEXT NOT NULL,
      path      TEXT NOT NULL,
      size      INTEGER NOT NULL,
      mime      TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      username      TEXT NOT NULL UNIQUE,
      display_name  TEXT,
      password_hash TEXT NOT NULL,
      email         TEXT,
      role          TEXT NOT NULL DEFAULT 'visitor',   -- owner(站主) | visitor(访客)
      status        TEXT NOT NULL DEFAULT 'active',    -- active | banned
      created_at    INTEGER NOT NULL,
      last_login_at INTEGER,
      login_count   INTEGER NOT NULL DEFAULT 0
    );
  `)
}

export function settingGet(key: string): string | null {
  const row = getDb()
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get(key) as { value: string } | undefined
  return row?.value ?? null
}

export function settingSet(key: string, value: string): void {
  getDb()
    .prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    )
    .run(key, value)
}

export function settingDelete(key: string): void {
  getDb().prepare('DELETE FROM settings WHERE key = ?').run(key)
}

export interface UserRow {
  id: string
  username: string
  display_name: string | null
  password_hash: string
  email: string | null
  role: 'owner' | 'visitor'
  status: 'active' | 'banned'
  created_at: number
  last_login_at: number | null
  login_count: number
}

export function userGetById(id: string): UserRow | undefined {
  return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as
    UserRow | undefined
}

export function userGetByUsername(username: string): UserRow | undefined {
  return getDb()
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(username) as UserRow | undefined
}

export function userList(): UserRow[] {
  return getDb()
    .prepare(
      "SELECT * FROM users ORDER BY CASE role WHEN 'owner' THEN 0 ELSE 1 END, created_at ASC",
    )
    .all() as UserRow[]
}

export function userCreate(input: {
  username: string
  display_name: string | null
  password_hash: string
  email: string | null
  role: 'owner' | 'visitor'
}): void {
  getDb()
    .prepare(
      'INSERT INTO users (id, username, display_name, password_hash, email, role, status, created_at, login_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)',
    )
    .run(
      randomUUID(),
      input.username,
      input.display_name,
      input.password_hash,
      input.email,
      input.role,
      'active',
      Date.now(),
    )
}

export function userUpdate(
  id: string,
  fields: {
    username?: string
    display_name?: string | null
    email?: string | null
    status?: 'active' | 'banned'
  },
): void {
  const sets: string[] = []
  const values: unknown[] = []
  if (fields.username !== undefined) {
    sets.push('username = ?')
    values.push(fields.username)
  }
  if (fields.display_name !== undefined) {
    sets.push('display_name = ?')
    values.push(fields.display_name)
  }
  if (fields.email !== undefined) {
    sets.push('email = ?')
    values.push(fields.email)
  }
  if (fields.status !== undefined) {
    sets.push('status = ?')
    values.push(fields.status)
  }
  if (!sets.length) return
  values.push(id)
  getDb()
    .prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`)
    .run(...values)
}

export function userSetPassword(id: string, passwordHash: string): void {
  getDb()
    .prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .run(passwordHash, id)
}

export function userTouchLogin(id: string): void {
  getDb()
    .prepare(
      'UPDATE users SET last_login_at = ?, login_count = login_count + 1 WHERE id = ?',
    )
    .run(Date.now(), id)
}

export function sessionCreate(token: string, ttlMs: number): void {
  const now = Date.now()
  getDb()
    .prepare(
      'INSERT INTO sessions (token, created_at, expires_at) VALUES (?, ?, ?)',
    )
    .run(token, now, now + ttlMs)
}

export function sessionValid(token: string): boolean {
  const row = getDb()
    .prepare('SELECT expires_at FROM sessions WHERE token = ?')
    .get(token) as { expires_at: number } | undefined
  if (!row) return false
  if (row.expires_at < Date.now()) {
    getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token)
    return false
  }
  return true
}

export function sessionDestroy(token: string): void {
  getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token)
}
