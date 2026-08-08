# DESIGN — EN 的秘密实验室

> 版本:v1.0 · 架构与设计方案
> 状态:已实现并运行(server 分支)

## 1. 项目定位

Kemono 像素风个人博客:内容创作(文章/栏目/角色)+ 深度主题定制 + 完整控制台。同一份源码产出**纯静态站**与**动态版(SSR + 管理)**。

## 2. 双构建模型

```
源码 → dist-static(静态:页面 + Pagefind + RSS)
     → dist-server(SSR:动态版,控制台/表单/计数)
```

- 静态版:文章、栏目、角色等纯内容页面
- 动态版:控制台(React SPA 岛屿)、友链申请、资源下载计数、备份导出
- 内容源:静态版读 `src/content`(MD/YAML);动态版控制台写入同一目录 + SQLite(`data/enlab.db`)

## 3. 主题引擎(三层)

| 层          | 载体                        | 说明                                                                              |
| ----------- | --------------------------- | --------------------------------------------------------------------------------- |
| **L1 预设** | `src/themes/presets/*.json` | 配色(light/dark 全 token)、壁纸、顶部栏、mascot                                   |
| **L2 覆盖** | SQLite `themeOverrides`     | 控制台主题编辑器写入,运行时 `themeOverrideCss` 注入 `:root:root[data-theme]` 变量 |
| **L3 偏好** | localStorage `enlab:prefs`  | 访客主题锁定 / 深浅模式                                                           |

- 5 个预设:灰糖/蜜糖/葡萄/棉花糖/樱花,前 4 个可被前台切换,樱花仅友链页使用(forceTheme)
- 栏目页 `forceTheme` 锁定主题;关于页横向切屏时动态切换全局主题(同机制)
- 顶部栏像素化:主题色条纹、毛玻璃(style/accent/ornament/height 均可配置)

## 4. 壁纸渲染(精灵分层)

background-image 的 SVG 动画会导致**整屏重栅格化**(性能瓶颈)。方案:

```
静态底图(bg.svg,background-image)→ 一次栅格化,纹理复用
+ inline SVG 动画层(anim.svg,SSR 内联 DOM)→ 元素级合成,transform 走 GPU
```

- `scripts/gen-pixel-wallpapers.mjs` 生成动画 SVG → `gen-sprite-layers.mjs` 拆出顶层动画元素为独立动画层
- 同 class 元素合并为组(数百浪花 → 7 组,每组一个合成层)
- 仅当前主题+模式渲染(其余 `display:none`,零动画开销)

## 5. 控制台架构

- **文章管理**:列表(筛选/排序)+ **文档库**(文件树浏览 txt/md,TOAST UI 编辑器,自动保存恢复,后端 `content/docs/` CRUD)
- **主题编辑器**:色板(16 token × 深浅)、顶部栏配置、壁纸上传/资产选择、像素封面配置
- **资产库**:上传(壁纸/字体/其他)、筛选搜索、删除(磁盘+DB 同步)
- **备份与导出**:完整备份(SQLite+uploads+content)、内容导出(纯内容包,相对路径可直接合并静态版)、定时懒触发、冗余清理、下载
- **友链**:展示墙 + 申请审批(IP 限流)
- 全部 API:`src/pages/admin/api/*`(登录会话 + CSRF 同源校验)

## 6. 像素资产管线

- 壁纸:程序化生成(像素网格 DSL)→ 640×360 SVG × 5 主题 × 2 模式 ×(动画/静态/分层)
- 封面:26 个占位(13 图案 × 深浅),文章缺封面按分类自动匹配
- mascot/paw:字符画调色板映射组件

## 7. 前台体验

- **关于页**:横向 scroll-snap 单页,切屏动态换全局主题(壁纸/配色/顶部栏跟随),屏外裁剪 + 动画暂停,滚轮不劫持(原生横滑)
- **标签**:像素标签墙(3 档权重)
- **分类**:分类系列卡(分类 → 系列 → 文章)
- **搜索**:Pagefind 离线
- 动效:控制台可调(mascot/cards/topbar/ambient/hero 预设)

## 8. 安全与运维

- 管理登录:bcrypt + 会话 cookie(8 位密码下限)
- CSRF:自实现同源校验(Origin hostname 比较)
- 上传:类型白名单(MIME + 扩展名)、路径逃逸防护
- HTML no-cache + 静态资源 immutable 缓存
- Docker:`docker/Dockerfile` + nginx 反代示例

## 9. 已知边界

- 静态版与动态版内容由控制台写入同步(单机部署假设)
- 樱花主题不参与前台切换(仅友链页)
- Pagefind 索引在静态构建时生成

## 10. 质量

- `npm run check`(tsc)0 错误 · `npm run lint` 0 错误 · `npm run test` 33 通过
- 双构建(static/server)通过
