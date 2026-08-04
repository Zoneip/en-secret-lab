import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { g as getAllPosts } from '../chunks/data_DmO6YxUu.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BhjJlmHi.mjs';
import { a as aggregateByKey } from '../chunks/taxonomy_BRvcM95l.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const posts = await getAllPosts();
  const categories = aggregateByKey(posts, "category");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u5206\u7C7B", "description": "\u5168\u7AD9\u5206\u7C7B\u603B\u89C8", "data-astro-cid-dzaffv5d": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-enter container" data-astro-cid-dzaffv5d> <header class="page-head" data-astro-cid-dzaffv5d> <h1 data-astro-cid-dzaffv5d>分类</h1> <p data-astro-cid-dzaffv5d>${categories.length} 个分类</p> </header> <div class="cats" data-astro-cid-dzaffv5d> ${categories.map((c) => renderTemplate`<a class="cat-card card"${addAttribute(`/categories/${encodeURIComponent(c.name)}`, "href")} data-astro-cid-dzaffv5d> <span class="cat-name" data-astro-cid-dzaffv5d>${c.name}</span> <span class="cat-count" data-astro-cid-dzaffv5d>${c.count} 篇</span> </a>`)} </div> </div> ` })} `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/categories/index.astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/categories/index.astro";
const $$url = "/categories";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
