import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { z } from 'zod';

const schema = z.object({
  ASTRO_MODE: z.enum(["static", "server"]).default("static"),
  SITE_URL: z.url().transform((u) => u.toString()).default("http://localhost:4321"),
  ADMIN_USERNAME: z.string().min(1).default("admin"),
  ADMIN_PASSWORD: z.string().min(6).default("change-me"),
  SESSION_SECRET: z.string().min(16).default("dev-secret-do-not-use-in-prod"),
  DATABASE_PATH: z.string().default("./data/enlab.db")
});
function loadEnv(env) {
  const result = schema.safeParse({
    ASTRO_MODE: env.ASTRO_MODE,
    SITE_URL: env.SITE_URL,
    ADMIN_USERNAME: env.ADMIN_USERNAME,
    ADMIN_PASSWORD: env.ADMIN_PASSWORD,
    SESSION_SECRET: env.SESSION_SECRET,
    DATABASE_PATH: env.DATABASE_PATH
  });
  if (!result.success) {
    const detail = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`环境变量配置无效:${detail}`);
  }
  return result.data;
}

let db = null;
function getDb() {
  if (db) return db;
  const env = loadEnv(process.env);
  mkdirSync(dirname(env.DATABASE_PATH), { recursive: true });
  db = new Database(env.DATABASE_PATH);
  db.pragma("journal_mode = WAL");
  migrate(db);
  return db;
}
function migrate(d) {
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
  `);
}
function settingGet(key) {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key);
  return row?.value ?? null;
}
function settingSet(key, value) {
  getDb().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);
}
function sessionCreate(token, ttlMs) {
  const now = Date.now();
  getDb().prepare("INSERT INTO sessions (token, created_at, expires_at) VALUES (?, ?, ?)").run(token, now, now + ttlMs);
}
function sessionValid(token) {
  const row = getDb().prepare("SELECT expires_at FROM sessions WHERE token = ?").get(token);
  if (!row) return false;
  if (row.expires_at < Date.now()) {
    getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return false;
  }
  return true;
}
function sessionDestroy(token) {
  getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export { settingGet as a, sessionCreate as b, sessionDestroy as c, sessionValid as d, getDb as g, loadEnv as l, settingSet as s };
