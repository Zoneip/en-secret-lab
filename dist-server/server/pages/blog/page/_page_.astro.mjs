import { f as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../../../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { g as getAllPosts } from '../../../chunks/data_DmO6YxUu.mjs';
import { $ as $$BaseLayout } from '../../../chunks/BaseLayout_BhjJlmHi.mjs';
import { g as getSiteConfig } from '../../../chunks/config_C3U3sL-u.mjs';
import { $ as $$PostCard } from '../../../chunks/PostCard_x519BhxO.mjs';
import { P as PAGE_SIZE, $ as $$Pagination } from '../../../chunks/index_CtCPh_TP.mjs';
import { $ as $$EmptyState } from '../../../chunks/EmptyState_DBDcoNNz.mjs';
/* empty css                                        */
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://example.com");
async function getStaticPaths() {
  const all = await getAllPosts();
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  return Array.from({ length: totalPages - 1 }, (_, i) => {
    const page = i + 2;
    return {
      params: { page: String(page) },
      props: { page, totalPages, posts: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) }
    };
  });
}
const $$page = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$page;
  const config = getSiteConfig();
  const { page, totalPages, posts } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `\u6587\u7AE0 \xB7 \u7B2C ${page} \u9875`, "description": `${config.title} \u7684\u6587\u7AE0\u5217\u8868`, "data-astro-cid-hzrsv7ue": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-enter container" data-astro-cid-hzrsv7ue> <header class="page-head" data-astro-cid-hzrsv7ue> <h1 data-astro-cid-hzrsv7ue>文章</h1> <p data-astro-cid-hzrsv7ue>第 ${page} 页 · 共 ${totalPages} 页</p> </header> ${posts.length > 0 ? renderTemplate`<div class="grid" data-astro-cid-hzrsv7ue> ${posts.map((p) => renderTemplate`${renderComponent($$result2, "PostCard", $$PostCard, { "slug": p.slug, "title": p.title, "description": p.description, "pubDate": p.pubDate, "category": p.category, "tags": p.tags, "cover": p.cover, "data-astro-cid-hzrsv7ue": true })}`)} </div>` : renderTemplate`${renderComponent($$result2, "EmptyState", $$EmptyState, { "data-astro-cid-hzrsv7ue": true })}`} ${renderComponent($$result2, "Pagination", $$Pagination, { "page": page, "totalPages": totalPages, "base": "/blog", "data-astro-cid-hzrsv7ue": true })} </div> ` })} `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/blog/page/[page].astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/blog/page/[page].astro";
const $$url = "/blog/page/[page]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$page,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
