import { c as createComponent, a as renderTemplate, b as renderScript, r as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BhjJlmHi.mjs';
import { g as getSiteConfig } from '../chunks/config_C3U3sL-u.mjs';
import { i as isServer } from '../chunks/utils_CtBiJGkK.mjs';
/* empty css                                  */
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Search = createComponent(async ($$result, $$props, $$slots) => {
  const config = getSiteConfig();
  return renderTemplate(_a || (_a = __template(["", ` <script>
  // \u52A8\u6001\u7248\u5B9E\u65F6\u641C\u7D22
  const liveInput = document.querySelector('[data-live-input]')
  if (liveInput) {
    const results = document.querySelector('[data-live-results]')
    let index = null

    const loadIndex = () =>
      fetch('/api/search-index.json')
        .then((r) => r.json())
        .then((d) => {
          index = d
        })

    const render = (list) => {
      if (list.length === 0) {
        results.innerHTML = '<p class="empty">\u6CA1\u6709\u627E\u5230\u76F8\u5173\u5185\u5BB9</p>'
        return
      }
      results.innerHTML = list
        .map(
          (p) => \`
          <a class="result card" href="/blog/\${p.slug}">
            <span class="result-title">\${p.title}</span>
            <span class="result-meta">\${p.tags.map((t) => \`#\${t}\`).join(' ')}</span>
          </a>\`
        )
        .join('')
    }

    liveInput.addEventListener('input', async () => {
      const q = liveInput.value.trim().toLowerCase()
      if (!q) {
        results.innerHTML = ''
        return
      }
      index ??= await loadIndex()
      const hits = index
        .filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.description ?? '').toLowerCase().includes(q) ||
            p.body.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        )
        .slice(0, 12)
      render(hits)
    })
    loadIndex()
  }
<\/script> `, " "], ["", ` <script>
  // \u52A8\u6001\u7248\u5B9E\u65F6\u641C\u7D22
  const liveInput = document.querySelector('[data-live-input]')
  if (liveInput) {
    const results = document.querySelector('[data-live-results]')
    let index = null

    const loadIndex = () =>
      fetch('/api/search-index.json')
        .then((r) => r.json())
        .then((d) => {
          index = d
        })

    const render = (list) => {
      if (list.length === 0) {
        results.innerHTML = '<p class="empty">\u6CA1\u6709\u627E\u5230\u76F8\u5173\u5185\u5BB9</p>'
        return
      }
      results.innerHTML = list
        .map(
          (p) => \\\`
          <a class="result card" href="/blog/\\\${p.slug}">
            <span class="result-title">\\\${p.title}</span>
            <span class="result-meta">\\\${p.tags.map((t) => \\\`#\\\${t}\\\`).join(' ')}</span>
          </a>\\\`
        )
        .join('')
    }

    liveInput.addEventListener('input', async () => {
      const q = liveInput.value.trim().toLowerCase()
      if (!q) {
        results.innerHTML = ''
        return
      }
      index ??= await loadIndex()
      const hits = index
        .filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.description ?? '').toLowerCase().includes(q) ||
            p.body.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        )
        .slice(0, 12)
      render(hits)
    })
    loadIndex()
  }
<\/script> `, " "])), renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u641C\u7D22", "description": "\u641C\u7D22\u5168\u7AD9\u5185\u5BB9", "data-astro-cid-ipsxrsrh": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-enter container" data-astro-cid-ipsxrsrh> <header class="page-head" data-astro-cid-ipsxrsrh> <h1 data-astro-cid-ipsxrsrh>搜索</h1> <p data-astro-cid-ipsxrsrh>在 ${config.title} 里找点什么</p> </header> ${isServer ? renderTemplate`<div class="search-wrap card" data-astro-cid-ipsxrsrh> <input type="search" class="live-input" data-live-input placeholder="输入关键词搜索…" data-astro-cid-ipsxrsrh> <div class="live-results" data-live-results data-astro-cid-ipsxrsrh></div> </div>` : renderTemplate`<div class="search-wrap card" data-astro-cid-ipsxrsrh> <div id="search" data-astro-cid-ipsxrsrh></div> </div>`} </div> ` }), renderScript($$result, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/search.astro?astro&type=script&index=0&lang.ts"));
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/search.astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/search.astro";
const $$url = "/search";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Search,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
