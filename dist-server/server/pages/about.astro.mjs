import { c as createComponent, r as renderComponent, b as renderScript, a as renderTemplate, m as maybeRenderHead, F as Fragment, d as addAttribute } from '../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_BhjJlmHi.mjs';
import { $ as $$Mascot } from '../chunks/Mascot_DfaDqNdc.mjs';
import { g as getSiteConfig } from '../chunks/config_C3U3sL-u.mjs';
import { g as getSiteAbout, a as getSiteOcs } from '../chunks/site-content_BHK4DpBs.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$About = createComponent(async ($$result, $$props, $$slots) => {
  const about = await getSiteAbout();
  const siteConfig = getSiteConfig();
  const siteAuthor = siteConfig.author;
  const ocs = (await getSiteOcs()).sort(
    (a, b) => ["gray", "yellow", "purple", "white"].indexOf(a.theme) - ["gray", "yellow", "purple", "white"].indexOf(b.theme)
  );
  const themeNames = {
    gray: "\u7070\u7CD6",
    yellow: "\u871C\u7CD6",
    purple: "\u8461\u8404",
    white: "\u68C9\u82B1\u7CD6"
  };
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u5173\u4E8E", "description": "\u5173\u4E8E\u8FD9\u4E2A\u7AD9\u70B9\u548C\u5B83\u7684\u4E3B\u4EBA", "hideFooter": true, "data-astro-cid-kh7btl4r": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="snap-wrap" data-astro-cid-kh7btl4r> <div class="snap-scroller" data-snap-scroller data-astro-cid-kh7btl4r> <!-- 屏1:hero --> <section class="snap-section hero-screen" data-screen data-astro-cid-kh7btl4r> <div class="hero-inner" data-astro-cid-kh7btl4r> ${about && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-kh7btl4r": true }, { "default": async ($$result3) => renderTemplate` <div class="hero-avatar-wrap" data-astro-cid-kh7btl4r> ${about.avatar ? renderTemplate`<img${addAttribute(about.avatar, "src")}${addAttribute(about.nickname, "alt")} class="hero-avatar" data-astro-cid-kh7btl4r>` : renderTemplate`<div class="hero-mascots" aria-hidden="true" data-astro-cid-kh7btl4r> ${renderComponent($$result3, "Mascot", $$Mascot, { "role": "furry", "pixel": 7, "data-astro-cid-kh7btl4r": true })} ${renderComponent($$result3, "Mascot", $$Mascot, { "role": "boy", "pixel": 6, "data-astro-cid-kh7btl4r": true })} </div>`} </div> <p class="hero-nickname" data-astro-cid-kh7btl4r>${about.nickname}</p> <p class="hero-tagline" data-astro-cid-kh7btl4r>${about.tagline}</p> <ul class="hero-intro" data-astro-cid-kh7btl4r> ${about.intro.map((line) => renderTemplate`<li data-astro-cid-kh7btl4r>${line}</li>`)} </ul> ${about.links.length > 0 && renderTemplate`<div class="hero-links" data-astro-cid-kh7btl4r> ${about.links.map((link) => renderTemplate`<a class="chip"${addAttribute(link.url, "href")} target="_blank" rel="noopener noreferrer" data-astro-cid-kh7btl4r> ${link.label} </a>`)} </div>`}` })}`} <div class="hero-scroll-hint" aria-hidden="true" data-astro-cid-kh7btl4r> <span data-astro-cid-kh7btl4r>左右滑动看看四位伙伴</span> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" data-astro-cid-kh7btl4r><path d="M9 6l-5 6 5 6M19 6l-5 6 5 6" data-astro-cid-kh7btl4r></path></svg> </div> </div> <footer class="screen-footer" data-astro-cid-kh7btl4r> <span data-astro-cid-kh7btl4r>© ${(/* @__PURE__ */ new Date()).getFullYear()} ${siteAuthor} · 秘密实验室</span> <a href="/rss.xml" data-astro-cid-kh7btl4r>RSS</a> </footer> </section> <!-- 屏2-5:四个 OC --> ${ocs.map((oc, i) => renderTemplate`<section class="snap-section oc-screen" data-screen${addAttribute(oc.theme, "data-oc-theme")}${addAttribute(`--oc-index:${i}`, "style")} data-astro-cid-kh7btl4r> <div class="oc-bg" aria-hidden="true" data-astro-cid-kh7btl4r></div> <div class="oc-inner" data-astro-cid-kh7btl4r> <div class="oc-art" aria-hidden="true" data-astro-cid-kh7btl4r> ${oc.art ? renderTemplate`<img${addAttribute(oc.art, "src")} alt="" class="oc-art-img" data-astro-cid-kh7btl4r>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-kh7btl4r": true }, { "default": async ($$result3) => renderTemplate` ${renderComponent($$result3, "Mascot", $$Mascot, { "role": "furry", "theme": oc.theme, "pixel": 9, "data-astro-cid-kh7btl4r": true })} ${renderComponent($$result3, "Mascot", $$Mascot, { "role": "boy", "theme": oc.theme, "pixel": 7, "data-astro-cid-kh7btl4r": true })} ` })}`} </div> <div class="oc-text" data-astro-cid-kh7btl4r> <p class="oc-theme-tag" data-astro-cid-kh7btl4r>主题 · ${themeNames[oc.theme]}</p> <h2 class="oc-name" data-astro-cid-kh7btl4r>${oc.name}</h2> <p class="oc-subtitle" data-astro-cid-kh7btl4r>${oc.subtitle}</p> <p class="oc-desc" data-astro-cid-kh7btl4r>${oc.description}</p> <div class="oc-traits" data-astro-cid-kh7btl4r> ${oc.traits.map((t) => renderTemplate`<span class="oc-trait" data-astro-cid-kh7btl4r>${t}</span>`)} </div> ${oc.quote && renderTemplate`<p class="oc-quote" data-astro-cid-kh7btl4r>「${oc.quote}」</p>`} </div> </div> <footer class="screen-footer" data-astro-cid-kh7btl4r> <span data-astro-cid-kh7btl4r>© ${(/* @__PURE__ */ new Date()).getFullYear()} ${siteAuthor} · 秘密实验室</span> <a href="/rss.xml" data-astro-cid-kh7btl4r>RSS</a> </footer> </section>`)} </div> <!-- 底部指示条(横向滑动) --> <nav class="snap-dots" aria-label="页面导航" data-astro-cid-kh7btl4r> ${[0, 1, 2, 3, 4].map((i) => renderTemplate`<button class="snap-dot"${addAttribute(i, "data-dot")}${addAttribute(`\u8DF3\u8F6C\u5230\u7B2C ${i + 1} \u5C4F`, "aria-label")} data-astro-cid-kh7btl4r></button>`)} </nav> <div class="snap-track" aria-hidden="true" data-astro-cid-kh7btl4r> <div class="snap-track-fill" data-track-fill data-astro-cid-kh7btl4r></div> </div> </div> ` })}  ${renderScript($$result, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/about.astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/about.astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/about.astro";
const $$url = "/about";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$About,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
