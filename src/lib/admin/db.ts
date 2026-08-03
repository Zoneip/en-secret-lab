/**
 * SQLite 数据层:配置、会话、资产索引(未来资源站数据也在此扩展)
 * 仅 server 模式加载;静态构建不引入本模块
 */
import Database from 'better-sqlite3'
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
  `)
}

export function settingGet(key: string): string | null {
  const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(key) as
    | { value: string }
    | undefined
  return row?.value ?? null
}

export function settingSet(key: string, value: string): void {
  getDb()
    .prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(key, value)
}

export function sessionCreate(token: string, ttlMs: number): void {
  const now = Date.now()
  getDb()
    .prepare('INSERT INTO sessions (token, created_at, expires_at) VALUES (?, ?, ?)')
    .run(token, now, now + ttlMs)
}

export function sessionValid(token: string): boolean {
  const row = getDb().prepare('SELECT expires_at FROM sessions WHERE token = ?').get(token) as
    | { expires_at: number }
    | undefined
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
