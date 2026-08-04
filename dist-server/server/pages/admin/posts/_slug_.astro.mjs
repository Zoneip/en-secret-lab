import { f as createAstro, c as createComponent, r as renderComponent, a as renderTemplate } from '../../../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { i as isServer } from '../../../chunks/utils_CtBiJGkK.mjs';
import { $ as $$AdminLayout } from '../../../chunks/AdminLayout_WQPBkFvq.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://example.com");
const prerender = !isServer;
function getStaticPaths() {
  return [];
}
const $$slug = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "\u7F16\u8F91\u6587\u7AE0", "active": "posts" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "PostEditorPage", null, { "isNew": false, "slug": Astro2.params.slug, "client:only": "react", "client:component-hydration": "only", "client:component-path": "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/admin/post-editor-page", "client:component-export": "default" })} ` })}`;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/admin/posts/[slug].astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/admin/posts/[slug].astro";
const $$url = "/admin/posts/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  getStaticPaths,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
