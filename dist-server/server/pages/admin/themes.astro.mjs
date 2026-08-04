import { c as createComponent, r as renderComponent, a as renderTemplate } from '../../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { i as isServer } from '../../chunks/utils_CtBiJGkK.mjs';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_WQPBkFvq.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = !isServer;
const $$Themes = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "\u4E3B\u9898\u7F16\u8F91\u5668", "active": "themes" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ThemeEditorPage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/admin/theme-editor-page", "client:component-export": "default" })} ` })}`;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/admin/themes.astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/admin/themes.astro";
const $$url = "/admin/themes";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Themes,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
