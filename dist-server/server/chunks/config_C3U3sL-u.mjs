import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { createRequire } from 'node:module';
import { z } from 'zod';
import { i as isServer } from './utils_CtBiJGkK.mjs';

const require$1 = createRequire(import.meta.url);
const siteConfigSchema = z.object({
  title: z.string().default("EN 的秘密实验室"),
  description: z.string().default("一个圆润可爱的 Kemono 风个人博客"),
  author: z.string().default("EN"),
  defaultTheme: z.enum(["gray", "yellow", "purple", "white"]).default("gray"),
  /** 全局开关 */
  features: z.object({
    search: z.boolean().default(true),
    comments: z.boolean().default(false),
    rss: z.boolean().default(true),
    wallpapers: z.boolean().default(true),
    admin: z.boolean().default(false),
    resources: z.boolean().default(false)
  }).default({
    search: true,
    comments: false,
    rss: true,
    wallpapers: true,
    admin: false,
    resources: false
  }),
  /** 壁纸跟随主题渲染时是否使用图片(站长关闭则纯色/渐变) */
  wallpaperEnabled: z.boolean().default(true),
  /** 主题级覆盖(控制台写入) */
  themeOverrides: z.record(z.string(), z.any()).default({}),
  /** 页脚/导航自定义 */
  nav: z.array(z.object({ label: z.string(), url: z.string() })).default([
    { label: "首页", url: "/" },
    { label: "知识", url: "/knowledge" },
    { label: "幻想", url: "/fantasy" },
    { label: "思考", url: "/thinking" },
    { label: "记录", url: "/journal" },
    { label: "文章", url: "/blog" },
    { label: "标签", url: "/tags" },
    { label: "分类", url: "/categories" },
    { label: "关于", url: "/about" },
    { label: "友链", url: "/friends" }
  ]),
  /** 控制台导入的字体 */
  fonts: z.array(
    z.object({
      family: z.string(),
      role: z.enum(["display", "body", "mono"]),
      files: z.array(z.string())
    })
  ).default([])
});
const DEFAULT_SITE_CONFIG = siteConfigSchema.parse({});
function resolveConfigPath() {
  const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
  if (isServer) {
    return "";
  }
  return `${repoRoot}public/site-config.json`;
}
let cached = null;
function readDbConfig() {
  const Database = require$1("better-sqlite3");
  const dbPath = process.env.DATABASE_PATH ?? "./data/enlab.db";
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get("site_config");
  db.close();
  if (!row?.value) return DEFAULT_SITE_CONFIG;
  try {
    return siteConfigSchema.parse(JSON.parse(row.value));
  } catch (e) {
    console.warn("[config] DB 配置解析失败,使用默认:", e.message);
    return DEFAULT_SITE_CONFIG;
  }
}
function getSiteConfig() {
  if (cached) return cached;
  if (isServer) {
    cached = readDbConfig();
    return cached;
  }
  const path = resolveConfigPath();
  if (!path) {
    cached = DEFAULT_SITE_CONFIG;
    return cached;
  }
  try {
    const raw = readFileSync(path, "utf8");
    cached = siteConfigSchema.parse(JSON.parse(raw));
  } catch (e) {
    console.warn(`[config] 读取 ${path} 失败,使用默认配置:`, e.message);
    cached = DEFAULT_SITE_CONFIG;
  }
  return cached;
}
function invalidateSiteConfig() {
  cached = null;
}
function getThemeOverrides() {
  return getSiteConfig().themeOverrides;
}

export { getThemeOverrides as a, getSiteConfig as g, invalidateSiteConfig as i, siteConfigSchema as s };
