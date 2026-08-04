import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { g as getAllPosts } from '../chunks/data_DmO6YxUu.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BhjJlmHi.mjs';
import { $ as $$TagCloud } from '../chunks/TagCloud_BYp8bU1B.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const posts = await getAllPosts();
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u6807\u7B7E", "description": "\u5168\u7AD9\u6807\u7B7E\u603B\u89C8", "data-astro-cid-os4i7owy": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-enter container" data-astro-cid-os4i7owy> <header class="page-head" data-astro-cid-os4i7owy> <h1 data-astro-cid-os4i7owy>标签</h1> <p data-astro-cid-os4i7owy>共 ${posts.reduce((n, p) => n + p.tags.length, 0)} 枚标签</p> </header> <div class="card cloud-card" data-astro-cid-os4i7owy> ${renderComponent($$result2, "TagCloud", $$TagCloud, { "posts": posts, "maxSize": 1.9, "data-astro-cid-os4i7owy": true })} </div> </div> ` })} `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/tags/index.astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/tags/index.astro";
const $$url = "/tags";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
