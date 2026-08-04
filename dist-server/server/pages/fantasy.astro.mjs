import { c as createComponent, r as renderComponent, a as renderTemplate } from '../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { $ as $$ColumnPage } from '../chunks/ColumnPage_Cq1Xb8tO.mjs';
export { renderers } from '../renderers.mjs';

const title = "fantasy";
const $$Fantasy = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "ColumnPage", $$ColumnPage, { "id": "fantasy" })}`;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/fantasy.astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/fantasy.astro";
const $$url = "/fantasy";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Fantasy,
	file: $$file,
	title,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
