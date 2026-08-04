import { c as createComponent, r as renderComponent, a as renderTemplate } from '../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { i as isServer } from '../chunks/utils_CtBiJGkK.mjs';
import { $ as $$AdminLayout } from '../chunks/AdminLayout_WQPBkFvq.mjs';
export { renderers } from '../renderers.mjs';

const prerender = !isServer;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "\u4EEA\u8868\u76D8", "active": "dashboard" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Dashboard", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/admin/dashboard", "client:component-export": "default" })} ` })}`;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/admin/index.astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
