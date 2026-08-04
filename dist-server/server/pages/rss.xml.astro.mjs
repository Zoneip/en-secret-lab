import rss from '@astrojs/rss';
import { g as getAllPosts } from '../chunks/data_DmO6YxUu.mjs';
import { g as getSiteConfig } from '../chunks/config_C3U3sL-u.mjs';
export { renderers } from '../renderers.mjs';

async function GET(context) {
  const config = getSiteConfig();
  const posts = await getAllPosts();
  return rss({
    title: config.title,
    description: config.description,
    site: context.site ?? undefined                        ,
    items: posts.map((post) => ({
      title: post.title,
      description: post.description,
      pubDate: post.pubDate,
      link: `/blog/${post.slug}/`,
      categories: post.tags
    })),
    customData: `<language>zh-CN</language>`
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
