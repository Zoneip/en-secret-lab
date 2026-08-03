# EN 的秘密实验室

一个生产级 Kemono(furry)风格多主题个人博客,基于 Astro 5。

## 特性

- 4 套配色主题(灰糖 / 蜜糖 / 葡萄 / 棉花糖)× 深浅模式 = 8 种视觉组合
- 每主题专属壁纸(渐变兜底 + 站长可上传图片)
- 像素风吉祥物(小男孩 + furry 双角色 × 4 配色)
- 标签 / 分类 / 全站搜索 / RSS / 友链 / 关于页
- 站长控制台(动态版):色板、字体导入、壁纸上传、站点设置
- 双站部署:GitHub Pages 静态版(纯博客)+ 云服务器动态版(博客 + 控制台 + 未来资源站)

## 快速开始

```bash
npm install
npm run dev        # 本地开发
npm run verify     # 本地完整质量门禁(lint + typecheck + test + build)
```

## 脚本

| 命令 | 说明 |
|---|---|
| `npm run dev` | 开发服务器 |
| `npm run build:static` | 构建静态版(GitHub Pages) |
| `npm run build:server` | 构建动态版(云服务器) |
| `npm run gen:themes` | 主题预设 JSON → CSS 变量(改 preset 后运行) |
| `npm run validate:content` | 内容质量门禁(CI 同款) |
| `npm run lint` / `check` / `test` / `format` | ESLint / astro check / vitest / prettier |

## 目录结构

见 `DESIGN.md` §3.0(生产级目录结构 + 设计要点)。

## 内容管理

文章放 `src/content/posts/`,支持 `.md` / `.mdx`,frontmatter 字段:

```yaml
---
title: 文章标题
description: 摘要
pubDate: 2026-08-03
updatedDate: 2026-08-04
category: 随笔
tags: ["furry", "随笔"]
cover: cover.webp        # 相对 public/assets/blog/<slug>/ 的文件
featured: false
draft: false
---
```

友链放 `src/content/friends/`,关于页数据放 `src/content/about/`。

## 部署

- **静态版**:合并 main 后 CI 自动构建发布到 GitHub Pages
- **动态版**:CI 构建 Docker 镜像推送服务器,`docker compose up` 即上线(配置见 `docker/`)

环境变量模板见 `.env.example`,上线前必须修改 `ADMIN_PASSWORD` 与 `SESSION_SECRET`。

## 设计文档

完整设计(需求基线 / 主题系统 / 组件规格 / 资产规范 / 路线图):`DESIGN.md`
