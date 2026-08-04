import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { getCollection } from '../chunks/_astro_content_Dt6JQA9-.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BhjJlmHi.mjs';
import { $ as $$EmptyState } from '../chunks/EmptyState_DBDcoNNz.mjs';
/* empty css                                   */
export { renderers } from '../renderers.mjs';

const $$Friends = createComponent(async ($$result, $$props, $$slots) => {
  const friends = await getCollection("friends");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u53CB\u94FE", "description": "\u4EA4\u6362\u53CB\u94FE\u7684\u4F19\u4F34\u4EEC", "data-astro-cid-spp2p3no": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-enter container" data-astro-cid-spp2p3no> <header class="page-head" data-astro-cid-spp2p3no> <h1 data-astro-cid-spp2p3no>友链</h1> <p data-astro-cid-spp2p3no>目前有 ${friends.length} 位伙伴</p> </header> ${friends.length === 0 ? renderTemplate`${renderComponent($$result2, "EmptyState", $$EmptyState, { "title": "\u8FD8\u6CA1\u6709\u53CB\u94FE", "description": "\u60F3\u4EA4\u6362\u53CB\u94FE\u7684\u8BDD,\u7559\u8A00\u7ED9\u4E3B\u4EBA\u5427", "data-astro-cid-spp2p3no": true })}` : renderTemplate`<div class="grid" data-astro-cid-spp2p3no> ${friends.map((f) => renderTemplate`<a class="friend card"${addAttribute(f.data.url, "href")} target="_blank" rel="noopener noreferrer" data-astro-cid-spp2p3no> <span class="avatar" aria-hidden="true" data-astro-cid-spp2p3no> ${f.data.avatar ? renderTemplate`<img${addAttribute(f.data.avatar, "src")} alt="" loading="lazy" data-astro-cid-spp2p3no>` : renderTemplate`<span class="avatar-fallback" data-astro-cid-spp2p3no>${f.data.name.slice(0, 1)}</span>`} </span> <span class="friend-info" data-astro-cid-spp2p3no> <span class="name" data-astro-cid-spp2p3no>${f.data.name}</span> <span class="desc" data-astro-cid-spp2p3no>${f.data.description ?? "\u8FD9\u4F4D\u4F19\u4F34\u8FD8\u6CA1\u6709\u7B80\u4ECB"}</span> </span> </a>`)} </div>`} </div> ` })} `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/friends.astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/friends.astro";
const $$url = "/friends";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Friends,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
