#!/usr/bin/env bash
# 静态站全量构建(fallback)
# 静态版不含控制台,构建时临时移出 admin 路由:
#   - 避免 admin API 的文件/目录同名冲突(EISDIR)
#   - 避免 admin 页面被静态化为空壳
# 构建结束无论成败都会恢复目录(trap EXIT)
set -e
cd "$(dirname "$0")/.."

npm run gen:themes

# 导出动态版 DB 的站点配置(控制台顶部栏调度/主题覆盖),
# 静态构建以此为 L2 配置源,保证静态顶栏与动态版一致
node scripts/export-site-config.mjs

if [ -d src/pages/admin ]; then
  mv src/pages/admin .admin-build-tmp
  trap 'mv .admin-build-tmp src/pages/admin 2>/dev/null || true' EXIT
  echo "[build:static] admin 路由已临时移出"
fi

ASTRO_MODE=static astro build
node scripts/clean-static.mjs
pagefind --site dist-static

echo "[build:static] 完成"
