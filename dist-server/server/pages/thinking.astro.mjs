import { c as createComponent, r as renderComponent, a as renderTemplate } from '../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { $ as $$ColumnPage } from '../chunks/ColumnPage_Cq1Xb8tO.mjs';
export { renderers } from '../renderers.mjs';

const title = "thinking";
const $$Thinking = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "ColumnPage", $$ColumnPage, { "id": "thinking" })}`;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/thinking.astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/thinking.astro";
const $$url = "/thinking";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Thinking,
	file: $$file,
	title,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
