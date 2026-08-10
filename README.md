# EN 的秘密实验室

一个生产级 Kemono(furry)像素风个人博客。基于 **Astro 5**(静态 + SSR 双构建),控制台由 **React 19 + shadcn/Radix** 驱动,SQLite 持久化配置与内容。

> 用爱和像素搭的 — 巫女静静地在孤岛上守望,樱花萌芽,几度轮回春?

## ✨ 特性

- **5 套主题** × 深浅模式:灰糖(DCH · 8bit 科技)/ 蜜糖(FWB · 麦田稻草人)/ 葡萄(Coulyer · 图书馆)/ 棉花糖(Zoneip · 海洋)/ 樱花(巫女孤岛)
- **动态像素壁纸**:精灵分层渲染(静态底图 + inline SVG 动画层,GPU 合成流畅)
- **关于页**:横向滚动 + 切屏动态切换全局主题(与栏目页同机制)
- **控制台**:文章管理(文档库文件树 + TOAST UI 编辑器 + 自动保存)、账号管理(站主/访客账号、登录统计、封禁与密码重置)、资源管理(独立资源站,新建/编辑/删除/下载统计)、主题编辑器(色板/顶部栏/壁纸)、资产库、备份与导出、友链审批、像素封面
- **像素资产**:26 个文章封面占位(13 图案 × 深浅)、5 主题动态壁纸、kemono mascot
- **标签云 / 分类**:像素标签墙(3 档权重)、分类系列卡(玻璃化主题融合)
- **SEO**:RSS、sitemap、OpenGraph、Pagefind 离线搜索
- **双构建**:`dist-static`(纯静态站)与 `dist-server`(动态版 SSR)共用一份源码

## 🚀 快速开始

```bash
npm install

# 静态版
npm run build:static
npx serve dist-static

# 动态版(SSR + 控制台)
npm run build:server
SITE_URL=http://localhost:4321 \
ADMIN_USERNAME=admin ADMIN_PASSWORD=your-pass \
SESSION_SECRET=your-secret \
DATABASE_PATH=./data/enlab.db \
node dist-server/server/entry.mjs
```

控制台位于 `/admin`,登录后可在「设置 → 站点」调整标题、作者、主题默认等。

> 管理员账号首次启动时由 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 初始化并写入 SQLite,之后改密请在控制台「账号」中操作(环境变量不再生效)。

## 📁 目录结构

```
src/
├── pages/          # 路由(前台 + /admin 控制台)
├── components/
│   ├── admin/      # 控制台(React 客户端组件)
│   ├── blog/       # 文章卡、标签云、分类卡
│   ├── about/      # 关于页组件
│   ├── theme/      # 主题切换器
│   └── layout/     # 布局、壁纸层
├── lib/
│   ├── theme/      # 主题引擎(preset/override/变量)
│   ├── admin/      # 控制台数据层(SQLite/文件)
│   └── content/    # 内容集合访问
├── content/        # 文章/栏目/角色/友链/资源(Markdown/YAML)
├── themes/presets/ # 主题预设 JSON(配色/壁纸/顶部栏)
└── assets/         # 像素美术(壁纸/封面/mascot)
```

## 🖌 主题系统

- **L1 预设**:`src/themes/presets/*.json`(配色、壁纸、顶部栏、mascot)
- **L2 覆盖**:控制台主题编辑器写入 `themeOverrides`,运行时注入 CSS 变量
- **L3 访客偏好**:localStorage(`enlab:prefs`),支持锁定主题与深浅模式

壁纸为程序化生成:改 `scripts/gen-pixel-wallpapers.mjs` 后运行,产出动画版 + 静态帧 + 精灵分层(bg/anim),20 张覆盖 5 主题 × 2 模式。

## 📄 文档

- [DESIGN.md](./DESIGN.md) — 架构与设计方案
- `docs/` — 专项设计文档(文档库、像素封面等)

## 📦 脚本

| 命令                                    | 说明                   |
| --------------------------------------- | ---------------------- |
| `npm run gen:themes`                    | 主题预设 → CSS 变量    |
| `npm run build:static` / `build:server` | 双构建                 |
| `npm run check` / `lint` / `test`       | 类型 / 规范 / 测试(37) |
| `npm run format`                        | Prettier 全量格式化    |

## ⚖️ 协议

[MIT](./LICENSE) © 2026 Zoneip (Elapsed Nine)
