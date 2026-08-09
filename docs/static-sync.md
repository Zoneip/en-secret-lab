# 静态站增量同步(实验性)

`scripts/static-sync.mjs` 用动态版 SSR 产物直接渲染页面,按内容指纹只更新受影响的静态页,避免每次全量 `build:static`。适合"控制台改内容 → 增量同步 → 推送静态站"的工作流。

## 工作流

```bash
# 1. 首次初始化:复制构建资源 + 全量渲染(清空 dist-static)
npm run build:server && node scripts/static-sync.mjs --init

# 2. 日常增量:新增/修改/删除文章或数据后
node scripts/static-sync.mjs

# 3. 强制全量渲染(不复制资源)
node scripts/static-sync.mjs --full
```

## 原理

- 内容指纹:扫描 `src/content/{posts,about,columns,ocs,resources,friends}`、`public/site-config.json`、`src/themes/presets/*.json`,与 `.static-sync-state.json`(不入库)比对,得出新增/修改/删除的文章。
- 渲染:复用 `dist-server` 的 `manifest` + `entry.mjs` 的 `pageMap`,通过 `astro/app` 的 `App` 编程式渲染。脚本内设置 `ASTRO_MODE=server`,使产物中 `isServer` 为真,页面走文件系统读取,与真实 server 运行一致。
- 输出:HTML 写 `{path}/index.html`,`/404` 写 `404.html`;中文路径(分类/标签)按 URL 解码写目录。聚合页(首页/列表/归档)任何内容变化都重渲染,文章页按变化列表渲染。
- 清理:文章删除后删除对应静态页;分类/标签/分页/资源目录收缩后自动清理失效目录。

## fallback(全量打包)

`npm run build:static` 始终可用。构建脚本 `scripts/build-static.sh` 会临时移出 `src/pages/admin`(静态版无控制台,且 admin API 存在文件/目录同名冲突),构建后自动恢复。

## 已知限制

- Pagefind 搜索索引、sitemap 由构建期生成,增量同步不更新,需 `build:static` 重建。
- 主题预设/组件/路由代码变化需 `--full` 或 `build:static`。
- 增量同步前需保证 `dist-server` 与当前源码一致(`npm run build:server`)。

## 调试

- 渲染路径来自 `aggregatePaths`/`fullPaths`,与实际页面枚举一致。
- 渲染 404 时跳过并打印,文章详情页 404 通常意味着内容文件未被 `fsReadPost` 读取到(检查 slug 与 `CONTENT_DIR`)。
