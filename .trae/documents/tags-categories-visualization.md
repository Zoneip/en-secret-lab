# 标签页动态云图 + 分类页思维导图重构

## Context（背景与目标）

现状:`/tags` 与 `/categories` 两个总览页几乎用不了——标签页只是一个按数量映射字号的 flex 列表,分类页只是 grid 卡片,缺乏视觉表现力与信息层次感。

目标:

1. **标签页** → 3D 旋转球面云:标签均匀分布在球面上,缓慢自转,鼠标位置驱动旋转方向,前后标签有深度感,点击跳转归档页。
2. **分类页** → 放射状径向树思维导图:中心"全站文章"节点向四周生长出分类→系列→文章的层级结构,带"生长"动画,节点可点击跳转。

参考了 `dynamic-ui` skill 的视觉 token / SVG 几何 / 可访问性契约,以及 `frontend-design-ui-ux` skill 的设计规划方法论,但所有视觉用项目自有 CSS 变量(`--primary`/`--accent`/`--surface` 等),适配四套主题与深浅模式。

**约束**:零新依赖(纯 Canvas 2D + SVG)、SSR/静态构建均需降级可用、支持 `prefers-reduced-motion`、移动端触控适配、键盘可达。当前在 `lab` 分支开发。

---

## 文件清单

| 文件                                        | 操作 | 说明                                                                       |
| ------------------------------------------- | ---- | -------------------------------------------------------------------------- |
| `src/lib/content/taxonomy.ts`               | 修改 | 新增 `CategoryTreeNode` 类型族 + `buildCategoryTree(posts)` 纯函数         |
| `src/components/blog/TagCloud3D.astro`      | 新建 | 3D 球面标签云(Canvas)                                                      |
| `src/components/blog/CategoryMindmap.astro` | 新建 | 径向树思维导图(SVG)                                                        |
| `src/pages/tags/index.astro`                | 修改 | 用 `<TagCloud3D>` 替换 `<TagCloud>`(旧组件保留,作 reduced-motion/降级备用) |
| `src/pages/categories/index.astro`          | 修改 | 用 `<CategoryMindmap>` 替换 grid 卡片                                      |

不动:`global.css`、主题生成脚本、`PostLike` 定义、`aggregateByKey`(复用)。

---

## 一、数据层 `buildCategoryTree`（`src/lib/content/taxonomy.ts`）

复用现有 `PostLike`（`src/lib/content/posts.ts:6-18`,含 `slug/title/pubDate/category/series?/tags`）与 `aggregateByKey`。

```ts
export type CategoryTreeNode =
  CategoryRootNode | CategoryBranchNode | PostLeafNode

export interface CategoryRootNode {
  type: 'root'
  name: string // '全站文章'
  count: number
  children: CategoryBranchNode[]
}
export interface CategoryBranchNode {
  type: 'category' | 'series'
  name: string
  count: number
  href?: string // category 有(/categories/xxx),series 无(站内无 series 归档页)
  children: CategoryBranchNode[] | PostLeafNode[]
}
export interface PostLeafNode {
  type: 'post'
  name: string // 文章 title
  slug: string
  href: string // /blog/slug
  pubDate: Date
}
export function buildCategoryTree(posts: PostLike[]): CategoryRootNode
```

**算法**:按 `category` 分桶 → 每个 category 内按 `series` 二次分桶 → 有 series 的文章挂到 series 节点下(系列内按 `pubDate` 倒序),无 series 的直接作为 category 叶子 → series 节点排前(按 count 降序),叶子排后(按时间倒序)。纯函数,可单测。

---

## 二、TagCloud3D.astro（3D 球面标签云）

**数据**:复用 `aggregateByKey(posts, 'tags')`,SSR 阶段把 `[{name, count, href, w(count/maxCount)}]` 序列化给客户端。

**核心算法**:

- **斐波那契球面分布**(均匀,避免两极聚集):`y=1-(2i+1)/N; r=√(1-y²); θ=i·π(3-√5); x=r·cosθ; z=r·sinθ`
- **旋转**:绕 Y 轴后绕 X 轴(顺序固定),维护 `rotY/rotX` 状态
- **透视投影**:`depth=z+camZ(2.4); scale=focal(2.0)/depth`;屏幕坐标 `sx=cx+x·R·scale, sy=cy-y·R·scale`
- **深度视觉**:`t=(z+1)/2∈[0,1]`(前=1),`fontSize=lerp(min,max,t)`、`opacity=lerp(0.32,1,t)`;`count` 越高字越粗(`weight=400+w·300`)、颜色越偏 accent(`lerpRGB(primary,accent,w)`)
- **深度排序**:每帧按 `z` 升序绘制(后→前),前部自然覆盖后部
- **球面半径**:`R=min(cssW,cssH)·0.42`;`maxFS=min(用户值, R·0.22)` 防挤压

**交互**:

- 鼠标移入容器(未按下):指针相对中心归一化坐标 `(nx,ny)` 驱动 `targetVelY=0.0035+nx·0.02`、`targetRotX=clamp(-ny·0.6,-0.5,0.5)`;状态用弹性逼近(`*=0.08`)平滑
- 移动端触控拖拽:`pointerdown/move` 直接增量改 `rotY/rotX`,`touch-action:none` 防滚动;统一 Pointer Events 覆盖鼠标/触摸/笔
- 点击:缓存每帧 `{tag,sx,sy,w,h}`,click 时取命中矩形最小距离标签跳转

**性能/响应式**:

- DPR 上限 2(`Math.min(devicePixelRatio,2)`);`ctx.setTransform(dpr,...)` 后按 CSS 像素绘制
- `ResizeObserver` 重算 `R/cx/cy` 与画布尺寸
- 后部 `opacity<0.15` 标签可跳过绘制;禁用 `shadowBlur`

**可访问性(关键)**:

- SSR 输出 `visually-hidden` 的 `<ul><li><a href="/tags/...">名称 (n)</a></li></ul>` 作 SEO/屏幕阅读器 fallback
- `<canvas role="img" aria-label="3D 标签云,共 N 枚,可旋转可点击">`
- `prefers-reduced-motion: reduce`:不启动 rAF,只画一帧静态快照(仍可点击)
- 主题切换:监听 `enlab:theme-change` 重读 `getComputedStyle` 的 `--primary/--accent/--fg-muted` 重绘

---

## 三、CategoryMindmap.astro（径向树思维导图）

**径向布局**:

- root 在中心 `(cx,cy)`;level1(category)均匀分布半径 `R1=140`;level2/3 按**子树叶子数加权分配扇形角**(避免大系列挤死),半径 `R2=280, R3=420`
- 递归两遍:先算 `subtreeLeaves`,再按 `w = wedge·(leaves/total)` 分配子节点角度
- 叶子标签角宽不足时:标题截断(level3 取 8 字+…)+ 标签沿切向旋转(`rotate(angle)`)

**SVG**:`viewBox` 按所有节点 `x±labelHalfW` 极值 + 60px 安全边距动态计算;`width=100% height=auto preserveAspectRatio="xMidYMid meet"`;移动端容器 `overflow:auto` 可横向滚动。

**连接线**:父到子三次贝塞尔,控制点沿径向(`polar(root, Rp+dr·0.4, 父角)` 与 `polar(root, Rp+dr·0.6, 子角)`),`stroke=var(--border-strong) stroke-width=1.5 fill=none`。

**节点视觉**(全 CSS 变量):

- root:圆 r=30,`fill=--primary`,白字加粗
- category:圆角矩形,`fill=--surface stroke=--primary`,名称+计数
- series:`fill=--accent-soft stroke=--accent`
- post 叶子:`fill=--elevated stroke=--border`,截断标题
- 矩形宽按 `name.length·9+16` 估算(中文 9px/字 @12px)

**生长动画(核心诉求)**:

- 每个节点 `<g>` 注入 `style="--mm-depth:d; --mm-index:i"`
- `@media (prefers-reduced-motion: no-preference)`:
  - 节点 `transform:scale(0) opacity:0` → `scale(1) opacity:1`,`animation: mm-grow .5s var(--ease-spring) both`,`delay=calc(d·200ms + i·50ms)`
  - 连接线 `<path pathLength="1">` + `stroke-dasharray:1 stroke-dashoffset:1→0`,`delay` 比子节点早 100ms(枝条先伸出、节点再弹出)
- `transform-box:fill-box; transform-origin:center` 让 scale 以节点自身中心为原点
- `pathLength="1"` 归一化路径长度,SSR 友好无需 JS 测长
- reduced-motion:终态由默认值承担,无动画

**交互**:

- category 与 post 节点用 `<a href>` 包裹(键盘 Tab 可达、Enter 跳转);root/series 用 `<g role="treeitem" aria-disabled>`
- hover 路径高亮:容器委托 `mouseover/mouseout`,沿 `data-parent` 链收集祖先,加 `.is-active`/`.is-active-link` class(只改 stroke/fill/width,**不改 transform**,避免打断生长动画)
- v1 不做折叠/展开(样本仅 5 篇,且会破坏"完整生长"诉求)

**可访问性**:

- `<svg role="tree" aria-label="全站分类思维导图,共 N 篇">`;每个节点 `role="treeitem" aria-label="分类:技术,共 2 篇" / "文章:xxx"`
- `:focus-visible { outline:2px solid var(--primary); outline-offset:2px }`

---

## 关键风险与应对

| 风险                      | 应对                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------- |
| 3D 标签前部挤压           | `maxFS=min(用户值, R·0.22)`;本站 N≈10 无虞                                             |
| Canvas 满帧性能           | DPR 上限 2;跳过后部低透明度标签;禁 shadowBlur                                          |
| 静态构建降级              | Canvas 空画布 SSR 输出 + `<script>` 仅 client 跑;`<ul>` fallback 进静态 HTML(SEO 可抓) |
| 主题切换重绘延迟          | 监听 `enlab:theme-change` + `matchMedia(dark)` 兜底,同步重读变量下一帧生效             |
| 径向树叶子重叠            | 切向旋转标签 + 截断标题 + post-hoc AABB 检测后缩字号                                   |
| 生长动画与 hover 高亮冲突 | hover 只改 stroke/fill,绝不改 transform                                                |
| 移动端 mindmap 溢出       | 容器 `overflow:auto` + `preserveAspectRatio=meet`                                      |

---

## 实现顺序

1. **数据层**:`buildCategoryTree` + vitest 单测(用 5 篇样本断言结构)
2. **CategoryMindmap**:SVG 静态版(布局+可点击) → 生长动画 → hover 高亮
3. **TagCloud3D**:Canvas 静态帧(分布→旋转→投影→排序→绘制) → rAF 自转 → 鼠标跟随 → 触控拖拽 → 主题切换/reduced-motion
4. **集成**:替换两个 `index.astro`,端到端验证

---

## 验证方式

**单元测试**(`src/lib/content/__tests__/`):

- `buildCategoryTree.test.ts`:5 篇样本断言 root.count=5、4 个 category、技术下有 series="主题系统"(2 篇)、独立文章直接挂 category;边界:空数组、无 series、同 series 跨 category 不合并

**手测**(`npm run dev`,访问 `/tags` `/categories`):

1. 标签云自转;鼠标移入驱动偏转,移出恢复;点击跳 `/tags/<name>`
2. 思维导图按深度逐层生长,连接线先于子节点画出;点击 category/post 跳转
3. reduced-motion:3D 静态快照可点击;mindmap 直接呈现终态
4. 主题切换(灰糖↔葡萄、深↔浅):3D 颜色即时变;mindmap 随 CSS 变量变
5. 移动端:3D 单指拖动旋转页面不滚;mindmap 横向滚动;点击区≥44px
6. 键盘:Tab 遍历可见焦点环,Enter 跳转
7. SR:VoiceOver 朗读标签 `<ul>` 与 mindmap treeitem

**构建**:`npm run check` + `npm run lint` 0 错误;`npm run build:static` 产物含 `<ul>` fallback;`npm run build:server` 通过
