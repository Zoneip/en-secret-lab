# 动效资产库(motion assets)

> 版本:v1.0.0
> 状态:可用
> 性质:规范化、可配置、纯 CSS 动效资产,无 JS、无外部库

为像素风(kemono/furry)个人博客提供的动效资产库。控制台通过 `presets.json` 读取预设,以 `data-motion` 属性 + 动效类控制每个元素启用/停用动效。

## 目录结构

```
src/assets/motion/
├── keyframes/
│   ├── mascot.css     # 吉祥物动效(呼吸/耳朵/尾巴/眨眼/摇摆)
│   ├── cards.css      # 卡片动效(hover 浮起/倾斜/光泽/流光/交错入场)
│   ├── topbar.css     # 顶部栏动效(渐变流动/滚动收缩/导航下划线)
│   └── ambient.css    # 环境动效(漂浮/旋转/脉冲/跑马灯/滚动提示)
├── presets.json       # 动效注册表(控制台读取)
└── README.md          # 本文件
```

## 命名规范

- 所有类以 `.motion-` 前缀开头:`motion-bob`、`motion-card-lift`…
- 关键帧动画名与类名一致(`@keyframes motion-bob`),语义为"作用对象 + 效果"
- 分组:吉祥物 `mascot` / 卡片 `cards` / 顶部栏 `topbar` / 环境 `ambient`
- `presets.json` 中 `className` 字段必须与 CSS 类名一一对应;`none` 项 className 为空字符串
- 同一元素只挂一个动效类(`animation` 属性会互相覆盖),交错入场例外(见下文)

## 接入方式

### 1. 引入样式

在 `BaseLayout.astro` 中与 `global.css` 一并引入(顺序无关,各文件自带 `:root` 默认值兜底):

```ts
import '../assets/motion/keyframes/mascot.css'
import '../assets/motion/keyframes/cards.css'
import '../assets/motion/keyframes/topbar.css'
import '../assets/motion/keyframes/ambient.css'
```

也可用 Astro 的 glob 引入:`import '../assets/motion/keyframes/*.css'`。

### 2. 元素启用动效

给元素加 `data-motion` 属性(值 = 分组名,供控制台定位)+ 对应动效类:

```html
<!-- 吉祥物:呼吸漂浮 -->
<div class="pixel-sprite motion-bob" data-motion="mascot"></div>

<!-- 卡片:悬浮浮起 -->
<article class="card motion-card-lift" data-motion="cards">…</article>

<!-- 卡片:交错入场(容器挂 stagger,子卡片挂 float-in) -->
<div class="motion-stagger" data-motion="cards">
  <article class="card motion-card-float-in">…</article>
  <article class="card motion-card-float-in">…</article>
</div>
```

控制台停用动效 = 移除 className(恢复为 `presets.json` 中 `none` 的 className)。

### 3. 速度与强度控制

两个全局旋钮,默认值在 `mascot.css` 的 `:root` 中定义,可对单个元素行内覆盖:

```html
<!-- 这个吉祥物:节奏更快、幅度更大 -->
<div
  class="pixel-sprite motion-bob"
  style="--motion-duration: 5s; --motion-intensity: 1.6"
></div>
```

| 变量                 | 默认 | 作用                                                                  |
| -------------------- | ---- | --------------------------------------------------------------------- |
| `--motion-duration`  | `3s` | 基础时长,全库唯一旋钮;各动效用 `calc()` 取倍率(如跑马灯 ×6.667 ≈ 20s) |
| `--motion-intensity` | `1`  | 强度系数;px/deg 幅度一律经 `calc(N × var(--motion-intensity))`        |

各动效的实际默认时长 = `--motion-duration × 倍率`:

| 动效                                           | 倍率   | ≈ 默认              |
| ---------------------------------------------- | ------ | ------------------- |
| bob / ear-tip / tail-wag / wobble / sheen      | ×1     | 3s                  |
| bob-fast                                       | ×0.4   | 1.2s                |
| blink                                          | ×1.333 | 4s(间隔,0.15s 完成) |
| card-lift / card-tilt / nav-underline / shrink | ×0.1   | 0.3s                |
| card-float-in                                  | ×0.2   | 0.6s                |
| topbar-gradient                                | ×4     | 12s                 |
| float-slow                                     | ×2.667 | 8s                  |
| spin-slow                                      | ×4     | 12s                 |
| pulse-soft                                     | ×0.8   | 2.4s                |
| marquee                                        | ×6.667 | 20s                 |
| scroll-hint                                    | ×0.7   | ≈ 2.1s              |

### 4. 特殊说明

- **`.motion-card-tilt`**:`perspective` 由父级提供(如 `perspective: 1000px`),本类只负责 `rotateX/rotateY` 过渡
- **`.motion-card-sheen` / `.motion-card-border-flow`**:基于 `::before/::after`,所在元素须保持 `position: relative`(类内已设);边框流光依赖 `@property`,不支持的环境降级为静态渐变描边
- **`.motion-topbar-gradient`**:占用 `background-image`,元素底色请用 `background-color`,勿用 `background` 简写
- **`.motion-topbar-shrink`**:纯 CSS 无法感知滚动,由项目 JS 在滚动后给元素加 `data-motion-shrunk` 属性,本类负责过渡与收缩态(64px → 52px + 阴影)
- **`.motion-nav-underline`**:当前页以 `aria-current="page"` 保持下划线,无需手动加类
- **`.motion-marquee`**:无缝循环需在 HTML 中复制一份内容;直接子元素为单条内容块
- **吉祥物拆分部件**(如只摆耳朵/尾巴):`PixelSprite` 是整体 SVG,`ear-tip/tail-wag` 需拆成独立子元素挂类,或整身挂载(整身抖动效果);`blink` 建议挂在眼部子元素

## prefers-reduced-motion 约定

每个 keyframes 文件末尾统一包含同一段 `@media (prefers-reduced-motion: reduce)` 块:

- 所有 `.motion-*` 类:`animation: none !important; transition: none !important;`
- 伪元素与子元素的动画单独点名(`.motion-card-sheen::after`、`.motion-card-border-flow::before`、`.motion-marquee > *`、`.motion-stagger > *`),因为父级 `animation: none` 不会停止它们
- 任一文件被单独引入时,该块均完整生效(与 `global.css` 中的全局 `*` 降级规则叠加,双保险)

## 版本记录

| 版本   | 日期       | 变更                                      |
| ------ | ---------- | ----------------------------------------- |
| v1.0.0 | 2026-08-04 | 初版:4 组 21 个动效类 + 注册表 + 使用规范 |
