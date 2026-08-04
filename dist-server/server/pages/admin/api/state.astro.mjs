import { i as isServer } from '../../../chunks/utils_CtBiJGkK.mjs';
import { i as isAuthed, S as SESSION_COOKIE } from '../../../chunks/auth_BDJs2_rs.mjs';
import { l as listAssets } from '../../../chunks/assets_HQu2MOD5.mjs';
import { l as listPosts } from '../../../chunks/posts-store_DhDx5TWr.mjs';
import { t as themes } from '../../../chunks/presets_Dwkdm1KE.mjs';
import { g as getSiteConfig } from '../../../chunks/config_C3U3sL-u.mjs';
import { getCollection } from '../../../chunks/_astro_content_Dt6JQA9-.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = !isServer;
const GET = async ({ cookies }) => {
  if (!isServer) return new Response(JSON.stringify({ error: "不可用" }), { status: 404 });
  const authed = isAuthed(cookies.get(SESSION_COOKIE)?.value);
  const siteConfig = getSiteConfig();
  const [posts, friends] = await Promise.all([
    getCollection("posts").catch(() => []),
    getCollection("friends").catch(() => [])
  ]);
  const allTags = /* @__PURE__ */ new Set();
  const allCats = /* @__PURE__ */ new Set();
  for (const p of posts) {
    for (const t of p.data.tags) allTags.add(t);
    allCats.add(p.data.category);
  }
  const assets = listAssets();
  const fsPosts = listPosts();
  const activity = [];
  for (const p of fsPosts) {
    activity.push({
      kind: p.draft.draft ? "draft" : "publish",
      title: p.draft.title,
      time: +new Date(p.draft.pubDate),
      meta: p.draft.category
    });
  }
  for (const a of assets) {
    activity.push({ kind: "upload", title: a.fileName, time: a.created_at, meta: a.kind });
  }
  activity.sort((a, b) => b.time - a.time);
  return new Response(
    JSON.stringify({
      authed,
      site: {
        title: siteConfig.title,
        description: siteConfig.description,
        author: siteConfig.author,
        defaultTheme: siteConfig.defaultTheme,
        features: siteConfig.features,
        wallpaperEnabled: siteConfig.wallpaperEnabled,
        nav: siteConfig.nav,
        fonts: siteConfig.fonts
      },
      stats: {
        posts: posts.length,
        published: posts.filter((p) => !p.data.draft).length,
        drafts: posts.filter((p) => p.data.draft).length,
        tags: allTags.size,
        categories: allCats.size,
        friends: friends.length,
        themes: themes.length,
        assets: assets.length
      },
      system: {
        mode: "server",
        node: process.version,
        uploads: assets.length,
        uploadBytes: assets.reduce((n, a) => n + a.size, 0)
      },
      activity: activity.slice(0, 8),
      presets: themes.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        palette: t.palette,
        wallpaper: t.wallpaper,
        mascot: t.mascot,
        override: siteConfig.themeOverrides[t.id] ?? null
      })),
      assets: authed ? assets : []
    }),
    { headers: { "Content-Type": "application/json" } }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
