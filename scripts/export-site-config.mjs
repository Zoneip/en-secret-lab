#!/usr/bin/env node
/**
 * 站点配置导出器:动态版 DB(控制台维护) → public/site-config.json
 *
 * 静态构建时 src/lib/config.ts 读取 public/site-config.json 作为 L2 配置源,
 * 控制台的顶部栏调度(themeOverrides.*.topbar)、主题色覆盖、壁纸覆盖等
 * 只有写入 DB,必须经本脚本导出后静态站才能拿到,否则顶栏等回退默认样式。
 *
 * 用法:
 *   node scripts/export-site-config.mjs          # 导出(build:static 已自动调用)
 *   DATABASE_PATH=/path/to.db node scripts/export-site-config.mjs
 *
 * DB 中无配置时保留现有文件不动(避免用空配置覆盖手工维护的值)。
 */
import { writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dbPath =
  process.env.DATABASE_PATH ?? join(root, 'data', 'enlab.db')
const outFile = join(root, 'public', 'site-config.json')

if (!existsSync(dbPath)) {
  console.warn(`[export-config] 数据库不存在(${dbPath}),跳过导出`)
  process.exit(0)
}

const Database = require('better-sqlite3')
const db = new Database(dbPath, { readonly: true })
const row = db
  .prepare('SELECT value FROM settings WHERE key = ?')
  .get('site_config')
db.close()

if (!row?.value) {
  console.warn('[export-config] DB 中无 site_config,保留现有 public/site-config.json')
  process.exit(0)
}

let cfg
try {
  cfg = JSON.parse(row.value)
} catch (e) {
  console.error('[export-config] DB 配置解析失败:', e.message)
  process.exit(1)
}

// 归一化输出:与现有文件保持 2 空格缩进,便于 diff 与 git 追踪
writeFileSync(outFile, JSON.stringify(cfg, null, 2) + '\n')

const themes = Object.keys(cfg.themeOverrides ?? {})
const topbarCount = themes.filter(
  (t) => cfg.themeOverrides[t]?.topbar,
).length
console.log(
  `[export-config] 已导出 ${themes.length} 个主题覆盖(含 ${topbarCount} 个顶部栏调度) → public/site-config.json`,
)
