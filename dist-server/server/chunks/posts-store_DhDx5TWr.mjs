import { unlinkSync, mkdirSync, writeFileSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const postsDir = join(
  process.env.CONTENT_DIR ?? join(process.cwd(), "src", "content"),
  "posts"
);
function postsDirOf() {
  return postsDir;
}
const REQUIRED = ["slug", "title", "pubDate", "category"];
function assertValid(draft) {
  for (const key of REQUIRED) {
    if (!draft[key]) throw new Error(`缺少必填字段:${key}`);
  }
  if (!/^[a-z0-9-]+$/.test(draft.slug)) {
    throw new Error("slug 仅允许小写字母、数字与连字符");
  }
}
function serializePost(d) {
  const lines = [
    "---",
    `title: ${d.title}`,
    `pubDate: ${d.pubDate}`
  ];
  if (d.description) lines.push(`description: ${d.description}`);
  if (d.updatedDate) lines.push(`updatedDate: ${d.updatedDate}`);
  lines.push(`category: ${d.category}`);
  if (d.tags.length > 0) {
    lines.push(`tags: ${JSON.stringify(d.tags).replace(/"/g, "'")}`);
  }
  lines.push(`draft: ${d.draft}`);
  if (d.featured) lines.push(`featured: ${d.featured}`);
  lines.push("---");
  lines.push("");
  lines.push(d.body.trim());
  lines.push("");
  return lines.join("\n");
}
function parsePostFile(fileName, raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  const fm = {};
  if (m) {
    for (const line of m[1].split("\n")) {
      const eq = line.match(/^([a-zA-Z]+):\s*(.*)$/);
      if (!eq) continue;
      const [, key, value] = eq;
      if (key === "tags") {
        const inner = value.match(/\[(.*)\]/)?.[1] ?? value;
        fm.tags = [...inner.matchAll(/'([^']+)'|"([^"]+)"|([^,\s[]+)/g)].map((g) => (g[1] ?? g[2] ?? g[3]).trim()).filter(Boolean);
      } else if (value === "true" || value === "false") {
        fm[key] = value === "true";
      } else {
        fm[key] = value;
      }
    }
  }
  return {
    slug: fileName.replace(/\.(md|mdx)$/, ""),
    fileName,
    draft: {
      slug: fileName.replace(/\.(md|mdx)$/, ""),
      title: String(fm.title ?? "未命名"),
      description: fm.description ? String(fm.description) : void 0,
      pubDate: String(fm.pubDate ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)),
      updatedDate: fm.updatedDate ? String(fm.updatedDate) : void 0,
      category: String(fm.category ?? "随笔"),
      tags: fm.tags ?? [],
      draft: Boolean(fm.draft),
      featured: Boolean(fm.featured),
      body: m?.[2]?.trim() ?? raw
    }
  };
}
function listPosts() {
  mkdirSync(postsDir, { recursive: true });
  const files = readdirSync(postsDir).filter((f) => /\.(md|mdx)$/.test(f) && statSync(join(postsDir, f)).isFile());
  return files.map((f) => parsePostFile(f, readFileSync(join(postsDir, f), "utf8"))).sort((a, b) => +new Date(b.draft.pubDate) - +new Date(a.draft.pubDate));
}
function getPost(slug) {
  return listPosts().find((p) => p.slug === slug) ?? null;
}
function savePost(draft) {
  assertValid(draft);
  mkdirSync(postsDir, { recursive: true });
  const fileName = `${draft.slug}.md`;
  writeFileSync(join(postsDir, fileName), serializePost(draft));
  return { slug: draft.slug, fileName, draft };
}
function deletePost(slug) {
  const post = getPost(slug);
  if (!post) return false;
  unlinkSync(join(postsDir, post.fileName));
  return true;
}

export { postsDirOf as a, deletePost as d, getPost as g, listPosts as l, parsePostFile as p, savePost as s };
