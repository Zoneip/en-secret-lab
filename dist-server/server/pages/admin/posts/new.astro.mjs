import { c as createComponent, r as renderComponent, a as renderTemplate } from '../../../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { i as isServer } from '../../../chunks/utils_CtBiJGkK.mjs';
import { $ as $$AdminLayout } from '../../../chunks/AdminLayout_WQPBkFvq.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = !isServer;
const $$New = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "\u5199\u65B0\u6587\u7AE0", "active": "posts" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "PostEditorPage", null, { "isNew": true, "client:only": "react", "client:component-hydration": "only", "client:component-path": "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/admin/post-editor-page", "client:component-export": "default" })} ` })}`;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/admin/posts/new.astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/admin/posts/new.astro";
const $$url = "/admin/posts/new";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$New,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
