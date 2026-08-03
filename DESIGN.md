# Kemono 多主题个人博客 — 设计方案

> 版本:v0.2
> 状态:设计已确认,进入实现
> 项目目录:`/home/fwb/EN--的秘密实验室`

---

## 1. 项目目标与用户画像

**目标:** 一个具有 Kemono(furry)风格的现代化个人博客,支持多套配色主题、深浅模式、站长深度自定义控制台,并能在未来平滑扩展为资源站。

**用户画像(3 类):**

| 角色 | 需求 |
|------|------|
| **访客** | 浏览文章、搜索、切换主题/深浅模式、RSS 订阅 |
| **站长(你)** | 管理文章、站点配置、主题资产上传、友链、未来管理资源下载 |
| **未来访客(资源站)** | 浏览资源分类、直链下载(预留) |

**核心原则:**

1. **Kemono 优先** — 圆润、柔和、可爱,兽系元素点缀,少用 emoji,必要时用自制像素资产
2. **主题即产品** — 4 套配色是核心卖点,必须各有性格,不是换色那么简单
3. **深度自定义** — 站长控制台独立于前台,可覆盖默认配置
4. **双站复用** — 同一代码库出静态版(GitHub Pages)和动态版(云服务器),内容按需裁剪

---

## 2. 需求基线(已确认)

| 类别 | 内容 |
|------|------|
| 技术栈 | Astro(静态构建)+ 未来 SSR(动态版) |
| 配色主题 | 灰、黄、紫、白 4 套 + 各自暗色方案(白色暗色需单独设计) |
| 模式 | 深色 / 浅色(与配色主题正交叠加 = 8 种组合) |
| 壁纸 | 背景壁纸切换,每主题有专属壁纸 |
| 控制台 | 站长管理后台(独立于前台) |
| 布局 | 卡片流布局主题 |
| 功能 | 标签/分类、全站搜索、评论、RSS、关于页、友链页 |
| 字体 | 圆体标题 + 无衬线正文,控制台支持字体导入 |
| 部署 | GitHub Pages 静态版(纯博客)+ 云服务器动态版(博客+资源站) |
| 资源站 | 仅预留架构位置(TODO) |
| 风格 | 吉祥物 mascot、圆润柔和、兽系装饰、少 emoji、自制像素资产 |

---

## 3. 系统架构

### 3.0 生产级目录结构

```
EN--的秘密实验室/
├── .github/
│   └── workflows/
│       ├── ci.yml                # 每次推送:lint → typecheck → test → 静态构建
│       ├── deploy-pages.yml      # main 合并 → 构建 → 发布 gh-pages 分支(静态版)
│       └── deploy-server.yml     # main 合并 → Docker 镜像 → 推送云服务器(动态版)
├── docker/
│   ├── Dockerfile                # 动态版多阶段构建(构建 → 运行时)
│   └── nginx.conf                # 反代 + 缓存 + 安全头
├── scripts/                      # 工具脚本(CI 与本地共用)
│   ├── gen-theme-css.mjs         # 主题预设 JSON → CSS 变量(构建前)
│   ├── validate-content.mjs      # 内容质量门禁(重复 slug/坏引用/格式)
│   └── deploy/
│       └── server.sh             # 服务器一键部署
├── public/                       # 原样拷贝的静态资产
│   ├── assets/
│   │   ├── themes/{gray,yellow,purple,white}/   # 按主题归档(壁纸/mascot 变体)
│   │   ├── mascots/              # 像素吉祥物源文件(双角色 × 4 配色)
│   │   ├── pixel/                # 自制像素装饰(爪印/分隔线/404)
│   │   ├── fonts/                # 站长导入字体(控制台上传落地)
│   │   ├── blog/{slug}/          # 文章配图
│   │   └── shared/               # OG 图/favicon/通用
│   ├── favicon.svg
│   └── site-config.json          # L2 站长配置(静态版 = 手改提交;动态版 = DB 导出)
├── src/
│   ├── assets/                   # 经 astro:assets 管线处理的源资产(压缩/格式转换)
│   ├── components/
│   │   ├── ui/                   # 原子组件(Button/Chip/EmptyState…)
│   │   ├── layout/               # 结构组件(Header/Footer/Nav/WallpaperLayer/SkipLink)
│   │   ├── theme/                # 主题系统(ThemeProvider/ThemeSwitcher)
│   │   ├── blog/                 # PostCard/TagCloud/CategoryCloud/Pagination/TOC
│   │   ├── search/               # SearchModal(pagefind)
│   │   └── mascot/               # Mascot/PixelDivider/PixelPaw
│   ├── content/                  # 内容集合
│   │   ├── posts/                # 文章(.md/.mdx,frontmatter 驱动)
│   │   ├── friends/              # 友链(data)
│   │   └── about/                # 关于页(data)
│   ├── content.config.ts         # 集合 Schema(构建期校验)
│   ├── layouts/                  # BaseLayout / PostLayout / AdminLayout
│   ├── lib/                      # 纯逻辑层(可单测,不碰 Astro API 也可)
│   │   ├── theme/                # presets 注册 + 三层配置合并引擎 + 客户端偏好
│   │   ├── content/              # 文章查询/归档/分页/标签聚合
│   │   ├── admin/                # 服务端专属:auth(会话/密码)/db(SQLite)/配置存储/资产
│   │   ├── config.ts             # L1/L2/L3 站点配置读取
│   │   ├── env.ts                # 环境变量 zod 校验(启动即失败)
│   │   ├── seo.ts                # meta/OG/RSS 生成
│   │   └── utils.ts
│   ├── middleware.ts             # (仅动态版)请求日志/安全头/admin 守卫
│   ├── pages/                    # 路由
│   │   ├── index.astro / 404.astro / search.astro / about.astro / friends.astro
│   │   ├── blog/{index,[...slug]}.astro
│   │   ├── tags/  categories/    # 索引 + 归档
│   │   ├── rss.xml.ts / robots.txt.ts / sitemap(集成)
│   │   └── admin/                # 控制台(静态模式整目录不产出)
│   ├── styles/                   # global.css / prose.css / theme-tokens.generated.css
│   ├── themes/presets/           # 4 套主题预设 JSON(配置即产品)
│   └── env.d.ts
├── data/                         # 运行时数据(动态版,gitingore)
│   └── enlab.db                  # SQLite(控制台配置/资产索引/下载统计)
├── tests/
│   ├── unit/                     # vitest:主题引擎/配置合并/归档工具
│   ├── e2e/                      # Playwright(渐进):主题切换/搜索
│   └── fixtures/
├── .env.example                  # 环境变量模板
├── eslint.config.js              # flat config + astro 插件
├── astro.config.mjs              # 双模式构建(static | server)
├── tsconfig.json / vitest.config.ts
├── package.json / .gitignore / .npmrc / README.md / DESIGN.md
```

**生产级设计要点:**

| 关注点 | 落地方式 |
|---|---|
| 分层 | `lib/` 纯逻辑可单测;`components/` 按域分目(ui/layout/theme/blog/search/mascot) |
| 资产双轨 | `public/` 原样拷贝(主题资产、字体、像素图);`src/assets/` 走管线(自动优化) |
| 配置三层 | L1 预设 JSON → L2 `site-config.json`/DB → L3 localStorage;合并引擎在 `lib/theme/engine.ts` |
| 环境安全 | `env.ts` zod 校验,启动即抛错;`.env.example` 模板,敏感项不进 git |
| 内容门禁 | `validate-content.mjs` 在 CI 拦截坏内容;`astro check` 类型把关 |
| CI/CD | 三流水线:质量门禁 / 静态版发 gh-pages / 动态版发 Docker |
| 动态版安全 | 中间件安全头、登录限流、bcrypt 密码、SQLite 单机部署 |
| 渐进质量 | 单元测试先行(vitest),E2E(Playwright)作为 M6 后续补充 |
| 单命令验证 | `npm run check` = lint + typecheck + test + build,本地等于 CI |

### 3.1 总体结构(逻辑视图)

```
kemono-blog/
├── src/
│   ├── content/              # Markdown 内容(文章/友链/关于,双站共享)
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   │   ├── index.astro       # 首页(卡片流)
│   │   ├── blog/             # 文章列表/详情
│   │   ├── tags/  categories/
│   │   ├── about/  friends/
│   │   ├── search.astro
│   │   ├── rss.xml.ts
│   │   ├── 404.astro
│   │   └── admin/            # 站长控制台(动态版专属)
│   ├── themes/               # 主题系统核心
│   │   ├── presets/          # 4 套内置主题定义(JSON)
│   │   └── registry.ts
│   ├── lib/                  # 配置读取、主题引擎、工具
│   └── styles/
├── public/
│   └── assets/
│       ├── themes/           # 按主题组织的资产(见 §7)
│       ├── mascots/
│       ├── pixel/            # 自制像素资产
│       └── fonts/
├── packages/                 # 预留:资源站模块
│   └── resources/            # TODO:数据模型+路由占位
└── docs/
```

### 3.2 双构建模式

| | 静态版 | 动态版 |
|---|---|---|
| 部署 | GitHub Pages(Actions 构建) | 云服务器(Astro SSR + node adapter) |
| 内容 | 全部 Markdown 文章 | 同样 Markdown + 管理后台数据(DB) |
| 控制台 | 无(隐藏 `/admin` 路由) | 有,数据存 DB |
| 特性开关 | `FEATURE_RESOURCES=false` | `FEATURE_RESOURCES=true`(未来) |
| 构建 | `npm run build:static` | `npm run build:server` |

**同一代码库**通过环境变量 `ASTRO_MODE=static|server` 与特性开关决定构建产物,内容目录共享。

### 3.3 配置分层(三层覆盖)

```
┌─────────────────────────────────────────────┐
│ L1 代码内置默认配置 (themes/presets/*.json)  │ ← 所有环境生效
├─────────────────────────────────────────────┤
│ L2 站长控制台配置 (动态版 DB / 静态版 JSON)   │ ← 覆盖 L1
├─────────────────────────────────────────────┤
│ L3 访客偏好 (localStorage,可选启用)           │ ← 覆盖 L1/L2
└─────────────────────────────────────────────┘
```

- **静态版**:L2 = `public/site-config.json`(可手改并随仓库提交)
- **动态版**:L2 = 数据库,控制台写入;前台通过接口获取

### 3.4 未来资源站预留

- `packages/resources/` 目录占位,内含:
  - 数据模型草案(资源表、分类表、下载统计)
  - 路由占位(`/resources`, `/resources/[id]`)
  - 直链下载 + 计数打点设计
- 仅架构预留,不实现功能

---

## 4. 主题系统设计(核心)

### 4.1 主题 = 配色皮肤 + 模式 + 壁纸 + 字体

一个"主题配置"是完整的 JSON,前台 UI 全部由 CSS 变量驱动:

```typescript
interface ThemeConfig {
  id: string;                    // 'gray' | 'yellow' | 'purple' | 'white'
  name: string;                  // 显示名(灰糖/蜜糖/葡萄/棉花糖)
  persona: string;               // 性格关键词(可配置,已模糊物种倾向)
  mascotColor: string;           // mascot 主色变体
  wallpaper: {
    light: string;               // 壁纸 URL 或 CSS 渐变 key
    dark: string;
  };
  palette: {
    light: ColorTokens;          // 见 §4.4
    dark: ColorTokens;
  };
  fonts?: {                      // 控制台导入后覆盖
    display?: string;            // 圆体标题
    body?: string;               // 正文
  };
}
```

### 4.2 四套主题人设(已确认)

> 命名刻意**模糊物种倾向**,不指向具体兽种,统一走 furry + 可爱/元气风格;
> 四套名字均为甜食系,风格统一且可爱(显示名是配置,随时可改)。

| ID | 配色 | 名字 | 性格 | 壁纸方向 |
|----|------|------|------|----------|
| `gray` | 灰 | 灰糖 | 冷静、软糯 | 灰调云海山峦 |
| `yellow` | 黄 | 蜜糖 | 温暖、元气 | 秋日蜜色光野 |
| `purple` | 紫 | 葡萄 | 梦幻、神秘 | 星空薰衣草田 |
| `white` | 白 | 棉花糖 | 纯净、清冽 | 雪原薄雾 |

### 4.3 白色主题的暗色方案(已确认:「雪夜」)

> 白色主题暗色**不做简单反色**,单独设计为「雪夜」方案:
> 冷调蓝黑夜空 + 冰蓝月光强调色,营造雪夜静谧感,
> 与灰色主题的暗色(石墨暖灰)形成明确区分。

### 4.4 Design Tokens — 色板草案

每主题定义完整语义色板(浅色 + 深色各一套),组件只用语义 token(background / foreground / primary / accent / border / surface / muted…),不直接用色值。

**语义 token 结构:**

```
--bg           页面背景
--surface      卡片/面板
--elevated     悬浮/弹层
--fg           主文本
--fg-muted     次级文本
--fg-subtle    占位/提示
--border       描边
--border-strong
--primary      主题主色(按钮/链接/强调)
--primary-hover
--primary-soft 主色浅底(标签背景)
--accent       点缀色(与主色对偶)
--accent-soft
--success/-warning/-error/-info  状态色
--shadow       柔和阴影
```

**灰「灰糖」gray:**

| Token | 浅色 | 深色 |
|---|---|---|
| bg | `#F4F5F7` 冷灰 | `#15171C` |
| surface | `#FFFFFF` | `#1E2128` |
| fg | `#2B2E35` | `#E2E4EA` |
| primary | `#5C677D` 蓝灰 | `#93A3BC` |
| accent | `#9AA5B5` | `#7C8CA3` |

**黄「蜜糖」yellow:**

| Token | 浅色 | 深色 |
|---|---|---|
| bg | `#FFF9EC` 奶油 | `#1B1510` 焦糖 |
| surface | `#FFFFFF` | `#261E14` |
| fg | `#3A2E1C` | `#F2E6CE` |
| primary | `#E59B2E` 蜂蜜 | `#F0B65A` |
| accent | `#C97B2D` 焦糖 | `#D99A52` |

**紫「葡萄」purple:**

| Token | 浅色 | 深色 |
|---|---|---|
| bg | `#F7F2FC` 薰衣草 | `#171320` |
| surface | `#FFFFFF` | `#211A2E` |
| fg | `#332B42` | `#E8E1F5` |
| primary | `#8B5CF6` 紫罗兰 | `#A78BFA` |
| accent | `#C084FC` 淡紫 | `#8B5CF6` |

**白「棉花糖」white:**

| Token | 浅色 | 深色(雪夜) |
|---|---|---|
| bg | `#FFFFFF` 纯白 | `#0E1420` 夜空蓝黑 |
| surface | `#FAFAF8` 暖白 | `#182032` |
| fg | `#2F2F2E` | `#DCE4F2` |
| primary | `#8FA3B8` 冰银 | `#9CC0EE` 冰蓝月光 |
| accent | `#C9D4E0` | `#7BA7DC` |

### 4.5 字体系统

| 角色 | 默认方案 | 控制台能力 |
|---|---|---|
| 标题 display | 圆体(思源圆体/优设标题黑),内嵌子集 | 上传字体文件,支持 woff2,自动生成 `@font-face` |
| 正文 body | 无衬线(思源黑体/鸿蒙),系统回退 | 同上 |
| 等宽 mono | 代码块用 | 同上(可选) |

- 字体文件存 `public/assets/fonts/`,配置 JSON 记录 family 名与文件路径
- 前台用 `font-display: swap`,避免 FOIT
- 控制台可导入(动态版)、静态版直接改 JSON + 放文件

### 4.6 壁纸系统(站长控制)

- 每主题提供浅/深两套壁纸(key 标识),支持两种形态:
  1. **静态图片** — 站长上传,按主题归档(§7)
  2. **CSS 渐变生成** — 无图片时的内置兜底(每主题预置渐变 key)
- 壁纸渲染:固定 `position: fixed` 背景层,上叠半透明遮罩保证可读性(遮罩色随主题 token 走)
- **访客不可切换壁纸**(已确认权限收窄):壁纸跟随主题由站长配置;站长的"关闭壁纸"开关(纯色模式)全局生效

### 4.7 权限分工(已确认:访客权限收窄)

| 能力 | 访客 | 站长控制台 |
|---|---|---|
| 切换配色主题 | ✅(存 localStorage) | — |
| 深浅模式 | ✅(跟随系统/手动) | — |
| 壁纸开关/切换 | ❌(跟随主题) | ✅ |
| 字体导入 | — | ✅ |
| 自定义主色/强调色 | — | ✅(色盘) |
| 上传壁纸/资产 | — | ✅ |
| 站点文案/友链/链接 | — | ✅ |
| 全局开关(搜索/评论/暗色默认值…) | — | ✅ |

### 4.8 Kemono 视觉细节

- **圆角体系**:卡片 `18px`、按钮 `9999px`(药丸)、输入框 `12px`,全局禁用尖锐角
- **阴影**:低不透明度、大模糊的柔影(如 `0 8px 24px rgb(0 0 0 / 0.08)`)
- **兽系装饰**(CSS/SVG 实现,非 emoji):
  - 页面底部分隔线用像素爪印图案(自制 pixel art,`public/assets/pixel/`)
  - 404 页:像素吉祥物 + 爪印引导
  - 加载动画:呼吸感肉垫
  - 链接 hover:尾巴状下划线
- **吉祥物 mascot(已确认)**:自制**像素风**吉祥物,两个角色:
  - 小男孩(人类角色)+ furry 角色(兽系,物种模糊)
  - 各 4 套配色变体(对应 4 主题)= 共 **8 个形象**
  - 静态站内置 SVG 占位,未来替换为正式像素插画
- **少用 emoji**:默认关闭 emoji 装饰,需要处用自制像素资产替代

---

## 5. 页面清单与用户流

### 5.1 页面清单

| 路由 | 说明 | 静态版 | 动态版 |
|---|---|---|---|
| `/` | 首页卡片流(文章 + 侧栏简介) | ✅ | ✅ |
| `/blog` | 文章列表(分页) | ✅ | ✅ |
| `/blog/[slug]` | 文章详情(目录、代码高亮、评论) | ✅ | ✅ |
| `/tags` `/tags/[tag]` | 标签云 + 标签归档 | ✅ | ✅ |
| `/categories` `/categories/[cat]` | 分类 + 归档 | ✅ | ✅ |
| `/search` | 全站搜索(pagefind 或自建索引) | ✅ | ✅ |
| `/about` | 关于页(兽设/OC 展示) | ✅ | ✅ |
| `/friends` | 友链页 | ✅ | ✅ |
| `/rss.xml` | RSS 订阅 | ✅ | ✅ |
| `/404` | 像素风 404 | ✅ | ✅ |
| `/admin/*` | 站长控制台 | ❌(路由隐藏) | ✅ |
| `/resources*` | 资源站(TODO) | ❌ | 预留 |

### 5.2 核心用户流

**访客:浏览 → 自定义 → 阅读**
```
进入首页 → 读取 L1/L2 配置 + localStorage 偏好 → 应用主题渲染
  → 打开主题切换器(浮动按钮) → 选配色/模式 → 即时生效,持久化 localStorage
  → 浏览卡片流 → 点卡片进文章 → 目录导航 + 代码高亮 → 评论(预留) → RSS 订阅
```

**站长:控制台配置(动态版)**
```
/ → /admin 登录(账号密码,服务端 session) → 仪表盘
  → 主题管理:选主题、改色板、传壁纸、导字体 → 预览(实时) → 保存
  → 内容管理(未来):文章/友链/资源
  → 站点设置:标题、描述、开关、默认主题
```

### 5.3 状态覆盖

- 主题加载前:首屏用内联 `@font-face` + 默认 token,避免闪烁(FOUC)
- 壁纸加载失败:回落 CSS 渐变
- 字体导入失败:回落系统字体栈
- 动态版接口失败:回落 L1 内置配置
- 搜索空结果 / 评论加载失败 / 404:各有明确降级

---

## 6. 组件规格(核心清单)

| 组件 | 要点 |
|---|---|
| `ThemeProvider` | 读取 3 层配置 → 注入 `data-theme` + `data-mode` 到 `<html>`,CSS 变量切换;防 FOUC 内联脚本 |
| `ThemeSwitcher` | 浮动切换器:4 主题 × 深浅;预览缩略图;键盘可访问 |
| `WallpaperLayer` | fixed 背景层 + 遮罩(站长配置,访客不可切换),`prefers-reduced-motion` 下禁用动效 |
| `PostCard` | 卡片流单元:封面、标题、摘要、标签、日期、爪印角标(像素) |
| `TagCloud` | 标签云,大小/颜色映射 |
| `Mascot` | SVG 吉祥物,接收主题色变体;`loading=lazy` |
| `PixelDivider` | 像素爪印分隔线(SVG repeat) |
| `SearchModal` | 全站搜索(command-k 唤起 + 搜索按钮) |
| `Pagination` | 上下页 + 页码 |
| `TableOfContents` | 文章目录,滚动高亮 |
| `AdminLayout/AdminLogin/ThemeEditor/FontUploader/WallpaperUploader/AssetManager` | 控制台组件(动态版专属) |

---

## 7. 资产目录规范

> 需求点:「每种主题展现不同内容时伴随合理资产分类」

```
public/assets/
├── themes/
│   ├── gray/
│   │   ├── wallpaper-light.*   # 该主题专属壁纸
│   │   ├── wallpaper-dark.*
│   │   ├── mascot-boy.*        # 小男孩变体(4 配色之一)
│   │   └── mascot-furry.*      # furry 变体(4 配色之一)
│   ├── yellow/ ...
│   ├── purple/ ...
│   └── white/ ...
├── pixel/                      # 自制像素资产
│   ├── paw-divider.svg
│   ├── pawprint.svg
│   └── 404-fox.png
├── fonts/                      # 控制台导入字体
│   └── {font-name}/...
├── blog/                       # 文章配图
│   └── {post-slug}/...
└── shared/                     # 通用(OG 图、favicon、站点图标)
```

- 命名:全小写 kebab-case;主题资产必须放在对应主题目录,禁止散落
- 动态版上传的资产进 DB 关联存储路径(未来可迁移对象存储)

---

## 8. 技术决策与依赖

| 领域 | 选型 | 备注 |
|---|---|---|
| 框架 | Astro 5.x | 内容集合、view transitions、集成生态 |
| 主题渲染 | CSS 变量 + `data-theme` 属性 | 无 Tailwind 也可,建议原生 CSS + 变量(主题系统友好) |
| 搜索 | Pagefind | 静态友好,构建时索引 |
| 评论 | 预留组件位置,选型未来讨论 | 候选:Giscus / Gitalk / Waline |
| 代码高亮 | Shiki(Astro 内置) | |
| RSS | `astro:assets` + 手写 feed | 或 @astrojs/rss |
| 动态版 | `@astrojs/node` SSR + SQLite(自带表) | 控制台数据;文章仍为 MD |
| 认证 | 控制台:session cookie + bcrypt | 轻量自研,不引重型方案 |
| 字体 | `@fontsource` 备用 + 控制台上传 woff2 | |
| 像素资产 | 手工 SVG | 自绘,不依赖库 |

---

## 9. 实现路线图

| 里程碑 | 内容 | 验收 |
|---|---|---|
| **M1 骨架** | Astro 项目 + 双构建脚本 + 内容集合 + 布局/路由骨架 | `npm run build:static` 通过,所有页面可访问 |
| **M2 主题引擎** | 4 主题 preset JSON + CSS 变量系统 + ThemeProvider + ThemeSwitcher + 壁纸层 + 深浅模式 | 8 组合全可切换,无 FOUC,localStorage 持久化 |
| **M3 博客功能** | 卡片流首页、文章页(目录/高亮)、标签/分类、分页、RSS、搜索、404(像素风) | 全流程可用 |
| **M4 页面完善** | 关于页、友链页、mascot 与像素装饰全量接入 | 视觉达标 |
| **M5 控制台(动态版)** | 登录、仪表盘、主题编辑器(色板/字体导入/壁纸上传)、站点设置、资产管理 | 动态版配置可持久化并生效 |
| **M6 部署** | GitHub Actions 出静态版(gh-pages 分支)+ 服务器部署脚本 | 双站上线 |
| **M7 资源站(TODO)** | 数据模型 + 路由占位实装 | 预留转正式 |

---

## 10. 设计决策记录(已确认)

| # | 决策 | 结论 |
|---|---|---|
| 1 | 四套配色命名 | 模糊物种倾向,甜食系可爱/元气风格:灰糖(灰)/蜜糖(黄)/葡萄(紫)/棉花糖(白) |
| 2 | 白色主题暗色 | 「雪夜」:冷调蓝黑夜空 + 冰蓝月光强调 ✅ |
| 3 | 权限分工 | 访客仅切主题+深浅模式(localStorage);壁纸/字体/色板/资产归站长控制台 |
| 4 | 评论系统 | 暂不实现,预留组件位置,选型未来讨论 |
| 5 | 项目名 | `EN--的秘密实验室`(目录 /home/fwb/EN--的秘密实验室) |
| 6 | 吉祥物 | 自制像素风:小男孩 + furry 双角色 × 4 配色 = 8 形象;先 SVG 占位,未来换正式插画 |
