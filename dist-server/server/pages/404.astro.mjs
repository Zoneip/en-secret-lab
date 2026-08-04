import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BhjJlmHi.mjs';
import { $ as $$Mascot } from '../chunks/Mascot_DfaDqNdc.mjs';
/* empty css                               */
export { renderers } from '../renderers.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  const themes = ["gray", "yellow", "purple", "white"];
  const today = /* @__PURE__ */ new Date();
  const dayIndex = (today.getFullYear() * 12 + today.getMonth() * 31 + today.getDate()) % themes.length;
  const quote = [
    "\u8FD9\u7247\u96EA\u5730\u4E0A\u6CA1\u6709\u811A\u5370\u2026",
    "\u88AB\u722A\u5B50\u85CF\u8D77\u6765\u4E86\u5417?",
    "\u8FF7\u8DEF\u7684\u9875\u9762,\u6B63\u5728\u88AB\u627E\u56DE\u6765"
  ][today.getDate() % 3];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u9875\u9762\u8D70\u4E22\u4E86", "description": "404 \u9875\u9762\u8D70\u4E22\u4E86", "data-astro-cid-zetdm5md": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="nf" data-astro-cid-zetdm5md> <div class="nf-mascot" data-astro-cid-zetdm5md> ${renderComponent($$result2, "Mascot", $$Mascot, { "role": "furry", "theme": themes[dayIndex], "pixel": 12, "data-astro-cid-zetdm5md": true })} </div> <p class="nf-code" aria-hidden="true" data-astro-cid-zetdm5md>404</p> <h1 data-astro-cid-zetdm5md>页面走丢了</h1> <p class="nf-quote" data-astro-cid-zetdm5md>${quote}</p> <div class="nf-actions" data-astro-cid-zetdm5md> <a class="btn" href="/" data-astro-cid-zetdm5md>回首页</a> <a class="btn btn-ghost" href="/blog" data-astro-cid-zetdm5md>看文章</a> </div> </div> ` })} `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/404.astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
