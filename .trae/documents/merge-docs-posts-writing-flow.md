# 合并控制台文章与文档库写作流程

## 背景与目标

当前控制台「文章」页用 Tabs 同时挂载了文章列表与文档库，但两者完全隔离：

- **文章区**有完整的发布路由 `/admin/api/posts`、frontmatter 编辑器，但管理功能只有表格列表。
- **文档库**有树形目录、拖拽、重命名、搜索等先进管理功能，却只能存/看 `content/docs/` 下的文本文件，无法把文档发布成文章，也不能与旁边的文章区互通。

本次改造要：

1. 保留文档库的树形管理能力。
2. 保留文章区的发布路由，让文档库里的 Markdown 能一键发布为文章。
3. 为文档库增加本地文件上传（可多选）和文件夹上传（保留目录结构）。
4. 上传的 Markdown 默认只进文档库，由用户手动选择发布为文章。
5. 发布为文章时保留原文档。

## 关键设计决策

- **不合并物理存储**：文章仍放在 `src/content/posts/*.md`，文档仍放在 `content/docs/`。只在操作层面打通。
- **发布动作走现有 `/admin/api/posts` POST**：新增 `sourceDocPath` 分支，复用 `savePost` 序列化逻辑。
- **上传独立新端点 `/admin/api/docs-upload`**：因为 multipart/form-data 与现有 JSON CRUD 差异大，单独路由更清晰。
- **元数据表单组件化**：把 `CreatePostDialog` 里的表单抽成 `PostMetaForm`，创建文章与发布文档共用。
- **两 Tab 通信**：`PostsPage` 通过 `onDocPublished={load}` 把刷新函数传给 `DocsManager`，发布成功后文章列表自动刷新。

## 后端变更

### 1. 扩展现有 `POST /admin/api/posts`

文件：`src/pages/admin/api/posts.ts`

在现有 JSON 创建逻辑之前增加分支：当请求体含 `sourceDocPath` 时，表示从文档库发布。

请求体形状：

```ts
{
  sourceDocPath: string   // 文档库相对路径，如 "notes/idea.md"
  title?: string
  slug?: string
  category?: string
  tags?: string[]
  description?: string
  pubDate?: string
  updatedDate?: string
  series?: string
  draft?: boolean
  featured?: boolean
}
```

行为：

1. 校验 `sourceDocPath` 是 `content/docs/` 下的合法文档路径（复用 `docs-store.safeJoin` 与 `isDocsPath`）。
2. 调用 `posts-store.publishDoc(sourceDocPath, overrides)`。
3. 原文档保留不动，仅在 `src/content/posts/{slug}.md` 新建/覆盖文章。
4. 返回与现有创建接口一致：`{ ok: true, post: { slug, fileName } }`。
5. slug 冲突时返回 422，提示用户修改 slug（不自动重命名，避免隐式覆盖）。

### 2. 新增 `GET /admin/api/posts/preview-from-doc`

文件：`src/pages/admin/api/posts/preview-from-doc.ts`

查询参数：`?path=notes/idea.md`

返回建议的 post 元数据，用于发布对话框预填充：

```ts
{
  ok: true
  draft: {
    slug: string
    title: string
    category: string
    tags: string[]
    description?: string
    pubDate: string
    body?: string
  }
}
```

内部复用 `posts-store.parseDocToDraft()`。

### 3. 新增 `POST /admin/api/docs-upload`

文件：`src/pages/admin/api/docs-upload.ts`

Content-Type：`multipart/form-data`。

字段：多个 `files`。客户端用 `formData.append('files', file, file.webkitRelativePath || file.name)` 保留相对路径。

处理流程：

1. 读取 `request.formData()`。
2. 遍历所有 `files` 条目：
   - 统一路径分隔符为 `/`，拒绝 `..`、绝对路径、空路径。
   - 扩展名必须在 `docs-store.DOCS_EXTS` 白名单内。
   - 通过 `docs-store.safeJoin()` 校验不逃出 `content/docs/`。
3. 父目录不存在时自动创建。
4. 写入文件。

返回：

```ts
{
  ok: true
  created: string[]  // 成功写入的相对路径
  skipped: string[]  // 因扩展名/路径非法被跳过的文件
}
```

## Store / 工具函数变更

### 1. `src/lib/admin/posts-store.ts`

新增导出：

- `parseDocToDraft(docPath: string, raw: string): Partial<PostDraft> & { body: string }`
  - 先用 `yaml` 库尝试解析 `---` frontmatter；无 frontmatter 时从正文第一级 `# 标题` 提取标题。
  - 标题回退：文件名去扩展名。
  - slug 优先级：frontmatter.slug → slugify(文件名) → slugify(标题)。
  - 默认 `category: '随笔'`，`tags: []`，`draft: true`，`featured: false`。
  - 返回 `body` 为去除 frontmatter 后的正文。

- `publishDoc(docPath: string, overrides: Partial<PostDraft>): PostFile`
  - 通过 `docs-store.readDoc(docPath)` 读取原文。
  - 调用 `parseDocToDraft` 得到基础元数据，再与 `overrides` 合并。
  - 复用现有 `assertValid()` 校验必填字段与 slug 格式。
  - 调用 `savePost()` 写入文章目录。
  - **不删除、不移动原文档**。

### 2. `src/lib/admin/docs-store.ts`

新增导出：

- `uploadDocs(entries: { relativePath: string; data: Uint8Array }[]): { created: string[]; skipped: string[] }`
  - 对每条 `relativePath` 调用 `safeJoin()`，确保不逃逸根目录。
  - 扩展名校验使用已有 `isDocsPath()`。
  - 父目录不存在时自动 `mkdirSync({ recursive: true })`。
  - 写入文件，返回分类结果。

保持 `DOCS_EXTS` 导出，上传端点直接引用。

## 前端组件变更

### 1. 新建 `src/components/admin/pages/post-meta-form.tsx`

把 `CreatePostDialog` 中的表单字段抽成独立组件 `PostMetaForm`。

Props：

```ts
interface PostMetaValues {
  title: string
  slug: string
  category: string
  pubDate: string
  tags: string // 逗号分隔，便于输入
  description: string
  draft: boolean
  featured: boolean
}

interface PostMetaFormProps {
  defaultValues: PostMetaValues
  submitLabel: string
  onSubmit: (values: PostMetaValues) => void
  onCancel: () => void
}
```

包含字段：标题、slug、分类、发布日期、标签（逗号分隔）、摘要、草稿开关、精选开关。

### 2. `src/components/admin/pages/posts.tsx`

- `CreatePostDialog` 内部改为渲染 `<PostMetaForm ... />`，提交逻辑保持不变（调用 `/admin/api/posts` JSON 创建）。
- `<DocsManager />` 增加回调：

  ```tsx
  <DocsManager onDocPublished={load} />
  ```

### 3. `src/components/admin/pages/docs-manager.tsx`

修改点：

1. **props 接口**

   ```ts
   interface DocsManagerProps {
     onDocPublished?: () => void
   }
   ```

2. **文档库工具栏新增上传按钮**
   - 「上传文件」：触发隐藏 `<input type="file" multiple accept=".md,.mdx,.txt,.text,.markdown" />`。
   - 「上传文件夹」：触发隐藏 `<input type="file" webkitdirectory directory />`。
   - 选中后统一进入 `handleUpload(files)`：
     - 构建 `FormData`，对每个 `File` 使用 `formData.append('files', file, file.webkitRelativePath || file.name)`。
     - `fetch('/admin/api/docs-upload', { method: 'POST', body: formData })`。
     - 成功后 `toast.success()` 并 `load()` 刷新文件树。

3. **编辑器工具栏新增「发布为文章」按钮**
   - 仅在选中文件且扩展名属于 `DOCS_EXTS` 时可用。
   - 点击打开 `PublishDocDialog`。

4. **新增 `PublishDocDialog` 组件（放在同一文件内）**
   - 打开时调用 `GET /admin/api/posts/preview-from-doc?path=${selectedPath}` 获取预填充值。
   - 使用 `<PostMetaForm defaultValues={preview} ... />`。
   - 提交时调用：

     ```ts
     api('/admin/api/posts', {
       method: 'POST',
       body: JSON.stringify({ sourceDocPath: selectedPath, ...formValues }),
     })
     ```

   - 成功后：
     - `toast.success('已发布为文章')`
     - 关闭对话框
     - 调用 `onDocPublished?.()`

## 安全考虑

- **路径逃逸**：所有写盘都通过 `docs-store.safeJoin()` 校验根目录前缀；上传文件名先做 normalize 并拒绝 `..`。
- **文件类型**：上传端点与文档库 CRUD 共用 `DOCS_EXTS` 白名单，非白名单文件直接 skipped。
- **slug 安全**：复用 `assertValid()` 的 `^[a-z0-9-]+$` 校验；发布时若 slug 已存在返回 422，让用户修改。
- **CSRF**：multipart POST 会经过 `middleware.ts` 的 `FORM_LIKE` 同源校验；使用同域 `fetch` 即可通过。
- **认证**：所有 `/admin/api/*` 路由仍由 `middleware.ts` 登录守卫保护。

## 端到端验证步骤

1. 启动动态开发服务器：`npm run dev`（已设置 `ASTRO_MODE=server`）。
2. 登录后进入 `/admin/posts`，切换到「文档库」Tab。
3. 点击「上传文件」，选择多个 `.md`/`.txt` 文件，确认文件出现在根目录。
4. 点击「上传文件夹」，选择一个含嵌套子文件夹的目录，确认相对目录结构被保留。
5. 尝试上传 `.exe` 或含 `../` 路径的文件，确认被跳过/报错。
6. 选中一篇 markdown 文档，点击「发布为文章」。
7. 在弹出的对话框中确认标题、slug、分类、标签等预填充正确；修改 slug 为已存在的值，确认后端返回冲突提示。
8. 提交后确认：
   - 原文档仍在 `content/docs/` 中。
   - `src/content/posts/{slug}.md` 已生成且 frontmatter 完整。
9. 切换到「文章」Tab，确认新文章出现在列表顶部。
10. 点击「写新文章」，确认原有创建流程不受影响。

## 待修改文件清单

- `src/pages/admin/api/posts.ts` — 增加 `sourceDocPath` 发布分支。
- `src/pages/admin/api/posts/preview-from-doc.ts` — 新增。
- `src/pages/admin/api/docs-upload.ts` — 新增。
- `src/lib/admin/posts-store.ts` — 新增 `parseDocToDraft`、`publishDoc`。
- `src/lib/admin/docs-store.ts` — 新增 `uploadDocs`。
- `src/components/admin/pages/post-meta-form.tsx` — 新建共用表单组件。
- `src/components/admin/pages/posts.tsx` — 复用 `PostMetaForm`，传入 `onDocPublished`。
- `src/components/admin/pages/docs-manager.tsx` — 增加上传按钮、发布对话框、`onDocPublished` 回调。
