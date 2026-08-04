import { getCollection } from './_astro_content_Dt6JQA9-.mjs';
import { i as isServer } from './utils_CtBiJGkK.mjs';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { p as parsePostFile, a as postsDirOf } from './posts-store_DhDx5TWr.mjs';

function toPostLike$1(post) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.data.title,
    pubDate: post.data.pubDate,
    category: post.data.category,
    tags: post.data.tags,
    featured: post.data.featured,
    draft: post.data.draft,
    description: post.data.description,
    cover: post.data.cover
  };
}
function published(posts) {
  return posts.map(toPostLike$1).filter((p) => !p.draft).sort((a, b) => +b.pubDate - +a.pubDate);
}
function featured(posts) {
  return posts.filter((p) => p.featured);
}

function fsPostsDir() {
  return postsDirOf();
}
function fsReadPost(slug) {
  const dir = fsPostsDir();
  const mdPath = join(dir, `${slug}.md`);
  const mdxPath = join(dir, `${slug}.mdx`);
  const file = existsSync(mdPath) ? mdPath : existsSync(mdxPath) ? mdxPath : null;
  if (!file) return null;
  const parsed = parsePostFile(file.split("/").pop(), readFileSync(file, "utf8"));
  return {
    post: toPostLike(parsed),
    body: parsed.draft.body
  };
}
function toPostLike(parsed) {
  return {
    id: parsed.slug,
    slug: parsed.slug,
    title: parsed.draft.title,
    pubDate: new Date(parsed.draft.pubDate),
    category: parsed.draft.category,
    tags: parsed.draft.tags,
    featured: parsed.draft.featured,
    draft: parsed.draft.draft,
    description: parsed.draft.description,
    cover: void 0
  };
}

async function getAllPosts() {
  if (isServer) {
    const dir = fsPostsDir();
    const files = readdirSync(dir).filter(
      (f) => /\.(md|mdx)$/.test(f) && statSync(join(dir, f)).isFile()
    );
    const parsed = files.map((f) => parsePostFile(f, readFileSync(join(dir, f), "utf8"))).filter((p) => !p.draft.draft).map(toPostLike);
    return parsed.sort((a, b) => +b.pubDate - +a.pubDate);
  }
  return published(await getCollection("posts"));
}
async function getPostContent(slug) {
  if (isServer) return fsReadPost(slug);
  const entry = (await getCollection("posts")).find((p) => p.slug === slug && !p.data.draft);
  if (!entry) return null;
  return { post: toPostLike({ slug: entry.slug, draft: entry.data }), body: entry.body };
}

export { getPostContent as a, featured as b, fsReadPost as f, getAllPosts as g };
