import { f as createAstro, c as createComponent, m as maybeRenderHead, d as addAttribute, g as renderSlot, a as renderTemplate, r as renderComponent } from './astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { g as getAllPosts } from './data_DmO6YxUu.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BhjJlmHi.mjs';
import { g as getSiteConfig } from './config_C3U3sL-u.mjs';
import { $ as $$PostCard } from './PostCard_x519BhxO.mjs';
import 'clsx';
/* empty css                         */
import { $ as $$EmptyState } from './EmptyState_DBDcoNNz.mjs';

const $$Astro$1 = createAstro("https://example.com");
const $$Button = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Button;
  const { href, variant = "primary", type = "button", disabled = false, ariaLabel } = Astro2.props;
  const cls = `btn ${variant === "ghost" ? "btn-ghost" : ""}`;
  return renderTemplate`${href ? renderTemplate`${maybeRenderHead()}<a${addAttribute(href, "href")}${addAttribute(cls, "class")}${addAttribute(ariaLabel, "aria-label")}>${renderSlot($$result, $$slots["default"])}</a>` : renderTemplate`<button${addAttribute(type, "type")}${addAttribute(cls, "class")}${addAttribute(disabled, "disabled")}${addAttribute(ariaLabel, "aria-label")}>${renderSlot($$result, $$slots["default"])}</button>`}`;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/ui/Button.astro", void 0);

const $$Astro = createAstro("https://example.com");
const $$Pagination = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Pagination;
  const { page, totalPages, base } = Astro2.props;
  function hrefFor(p) {
    return p <= 1 ? base : `${base}/page/${p}`;
  }
  return renderTemplate`${maybeRenderHead()}<nav class="pagination" aria-label="分页" data-astro-cid-guyvhosu> ${renderComponent($$result, "Button", $$Button, { "href": page > 1 ? hrefFor(page - 1) : void 0, "variant": "ghost", "disabled": page <= 1, "data-astro-cid-guyvhosu": true }, { "default": ($$result2) => renderTemplate`
上一页
` })} <span class="info" data-astro-cid-guyvhosu>
第 ${page} / ${totalPages} 页
</span> ${renderComponent($$result, "Button", $$Button, { "href": page < totalPages ? hrefFor(page + 1) : void 0, "variant": "ghost", "disabled": page >= totalPages, "data-astro-cid-guyvhosu": true }, { "default": ($$result2) => renderTemplate`
下一页
` })} </nav> `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/blog/Pagination.astro", void 0);

const PAGE_SIZE = 9;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const config = getSiteConfig();
  const all = await getAllPosts();
  const page = 1;
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const posts = all.slice(0, PAGE_SIZE);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u6587\u7AE0", "description": `${config.title} \u7684\u6587\u7AE0\u5217\u8868`, "data-astro-cid-5tznm7mj": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-enter container" data-astro-cid-5tznm7mj> <header class="page-head" data-astro-cid-5tznm7mj> <h1 data-astro-cid-5tznm7mj>文章</h1> <p data-astro-cid-5tznm7mj>第 ${page} 页 · 共 ${totalPages} 页</p> </header> ${posts.length > 0 ? renderTemplate`<div class="grid" data-astro-cid-5tznm7mj> ${posts.map((p) => renderTemplate`${renderComponent($$result2, "PostCard", $$PostCard, { "slug": p.slug, "title": p.title, "description": p.description, "pubDate": p.pubDate, "category": p.category, "tags": p.tags, "cover": p.cover, "data-astro-cid-5tznm7mj": true })}`)} </div>` : renderTemplate`${renderComponent($$result2, "EmptyState", $$EmptyState, { "data-astro-cid-5tznm7mj": true })}`} ${renderComponent($$result2, "Pagination", $$Pagination, { "page": page, "totalPages": totalPages, "base": "/blog", "data-astro-cid-5tznm7mj": true })} </div> ` })} `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/blog/index.astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/blog/index.astro";
const $$url = "/blog";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PAGE_SIZE,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { $$Pagination as $, PAGE_SIZE as P, _page as _ };
