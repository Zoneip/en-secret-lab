import { c as createComponent, r as renderComponent, a as renderTemplate } from '../../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { i as isServer } from '../../chunks/utils_CtBiJGkK.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_WQPBkFvq.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = !isServer;
const $$Posts = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "\u6587\u7AE0\u7BA1\u7406", "active": "posts" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "PostsPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/admin/posts-page", "client:component-export": "default" })} ` })}`;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/admin/posts.astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/admin/posts.astro";
const $$url = "/admin/posts";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Posts,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
