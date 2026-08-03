---
title: 用 CSS 变量做一套能换肤的主题系统
description: 四套配色 × 深浅模式,全靠一个 data-theme 属性和几十个 CSS 变量。
pubDate: 2026-08-02
category: 技术
tags: ["css", "前端", "主题"]
featured: true
---

这个站的主题系统核心就两件事:**语义化 CSS 变量** + **一个属性选择器**。

## 语义 token

组件里永远不写死颜色,只用语义 token:

```css
.card {
  background: var(--surface);
  color: var(--fg);
  border: 1px solid var(--border);
}
```

## 主题 = 属性选择器

生成的 CSS 长这样:

```css
:root[data-theme="gray"][data-mode="light"] {
  --bg: #f4f5f7;
  --primary: #5c677d;
}

:root[data-theme="gray"][data-mode="dark"] {
  --bg: #15171c;
  --primary: #93a3bc;
}
```

切换主题只是改 `<html>` 上的两个属性,所有颜色瞬间跟着变。

## 为什么不用 Tailwind 的 dark:

因为我们要的不只是"深浅两档",而是 **4 套配色 × 2 个模式 = 8 种组合**,任何"类名双份"的方案都会爆炸。CSS 变量天然正交。

## 防闪烁

主题脚本必须内联在 `<head>` 里、在首帧渲染前执行:

```html
<script>
  /* 读 localStorage → 设置 data-theme / data-mode */
</script>
```

这样页面打开的一瞬间就是正确的主题,不会白屏闪一下。
