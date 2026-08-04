import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { getCollection } from '../chunks/_astro_content_Dt6JQA9-.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BhjJlmHi.mjs';
import { g as getAllPosts, b as featured } from '../chunks/data_DmO6YxUu.mjs';
import { a as aggregateByKey } from '../chunks/taxonomy_BRvcM95l.mjs';
import { g as getSiteConfig } from '../chunks/config_C3U3sL-u.mjs';
import { f as formatDate } from '../chunks/utils_CtBiJGkK.mjs';
import { $ as $$Mascot } from '../chunks/Mascot_DfaDqNdc.mjs';
import { $ as $$PostCard } from '../chunks/PostCard_x519BhxO.mjs';
import { $ as $$TagCloud } from '../chunks/TagCloud_BYp8bU1B.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const config = getSiteConfig();
  const visible = await getAllPosts();
  const featuredPosts = featured(visible);
  const recent = [...featuredPosts, ...visible.filter((p) => !p.featured)].slice(0, 6);
  const categories = aggregateByKey(visible, "category");
  const themeIds = ["gray", "yellow", "purple", "white"];
  const [about] = await getCollection("about");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": config.title, "description": config.description, "data-astro-cid-j7pv25f6": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-enter container" data-astro-cid-j7pv25f6> <section class="hero" data-astro-cid-j7pv25f6> <div class="hero-text" data-astro-cid-j7pv25f6> ${about?.data.avatar ? renderTemplate`<img${addAttribute(about.data.avatar, "src")}${addAttribute(about.data.nickname, "alt")} class="hero-avatar" data-astro-cid-j7pv25f6>` : renderTemplate`<p class="hero-greet" data-astro-cid-j7pv25f6>这里的主人回来啦</p>`} <h1 data-astro-cid-j7pv25f6>${config.title}</h1> <p class="hero-desc" data-astro-cid-j7pv25f6>${config.description}</p> <div class="hero-actions" data-astro-cid-j7pv25f6> <a class="btn" href="/blog" data-astro-cid-j7pv25f6>看文章</a> <a class="btn btn-ghost" href="/about" data-astro-cid-j7pv25f6>认识一下</a> </div> </div> <div class="hero-mascot" data-astro-cid-j7pv25f6> ${themeIds.map((t) => renderTemplate`<div class="mascot-group"${addAttribute(t, "data-mascot-group")} data-astro-cid-j7pv25f6> ${renderComponent($$result2, "Mascot", $$Mascot, { "role": "furry", "theme": t, "pixel": 10, "data-astro-cid-j7pv25f6": true })} ${renderComponent($$result2, "Mascot", $$Mascot, { "role": "boy", "theme": t, "pixel": 8, "data-astro-cid-j7pv25f6": true })} </div>`)} </div> </section> ${featuredPosts.length > 0 && renderTemplate`<section class="featured card" data-astro-cid-j7pv25f6> <h2 class="section-title" data-astro-cid-j7pv25f6>精选</h2> <div class="featured-list" data-astro-cid-j7pv25f6> ${featuredPosts.map((p) => renderTemplate`<a${addAttribute(`/blog/${p.slug}`, "href")} class="featured-item underline-tail" data-astro-cid-j7pv25f6> <span class="featured-title" data-astro-cid-j7pv25f6>${p.title}</span> <time${addAttribute(p.pubDate.toISOString(), "datetime")} data-astro-cid-j7pv25f6>${formatDate(p.pubDate)}</time> </a>`)} </div> </section>`} <section class="recent" data-astro-cid-j7pv25f6> <h2 class="section-title" data-astro-cid-j7pv25f6>
最新文章
<a class="more underline-tail" href="/blog" data-astro-cid-j7pv25f6>全部文章</a> </h2> <div class="grid" data-astro-cid-j7pv25f6> ${recent.map((p) => renderTemplate`${renderComponent($$result2, "PostCard", $$PostCard, { "slug": p.slug, "title": p.title, "description": p.description, "pubDate": p.pubDate, "category": p.category, "tags": p.tags, "cover": p.cover, "data-astro-cid-j7pv25f6": true })}`)} </div> </section> <section class="taxonomy card" data-astro-cid-j7pv25f6> <h2 class="section-title" data-astro-cid-j7pv25f6>逛逛</h2> <div class="cats" data-astro-cid-j7pv25f6> ${categories.map((c) => renderTemplate`<a class="chip"${addAttribute(`/categories/${encodeURIComponent(c.name)}`, "href")} data-astro-cid-j7pv25f6> ${c.name} · ${c.count} </a>`)} </div> ${renderComponent($$result2, "TagCloud", $$TagCloud, { "posts": visible, "data-astro-cid-j7pv25f6": true })} </section> </div> ` })} `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/index.astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
