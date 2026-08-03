#!/usr/bin/env node
/** 静态构建后清理:剔除 admin 控制台产物(server 专属,静态站不应存在) */
import { rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const targets = ['dist/admin']
for (const t of targets) {
  rmSync(join(root, t), { recursive: true, force: true })
  console.log(`cleaned ${t}`)
}
