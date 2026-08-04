import { f as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, d as addAttribute } from './astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { f as formatDate } from './utils_CtBiJGkK.mjs';
import { g as getTheme } from './presets_Dwkdm1KE.mjs';
import { p as paletteFor, P as PAW } from './BaseLayout_BhjJlmHi.mjs';
import { a as $$PixelSprite } from './Mascot_DfaDqNdc.mjs';
/* empty css                           */

const $$Astro$1 = createAstro("https://example.com");
const $$PixelPaw = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$PixelPaw;
  const { theme = "gray", pixel = 3 } = Astro2.props;
  const preset = getTheme(theme);
  const palette = paletteFor(preset.mascot);
  return renderTemplate`${renderComponent($$result, "PixelSprite", $$PixelSprite, { "art": PAW, "palette": palette, "pixel": pixel, "role": "paw-print" })}`;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/mascot/PixelPaw.astro", void 0);

const $$Astro = createAstro("https://example.com");
const $$PostCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PostCard;
  const { slug, title, description, pubDate, category, tags = [], cover } = Astro2.props;
  const coverUrl = cover ? `/assets/blog/${slug}/${cover}` : void 0;
  return renderTemplate`${maybeRenderHead()}<article class="post-card card" data-astro-cid-73h5nvzy> <a${addAttribute(`/blog/${slug}`, "href")} class="post-link"${addAttribute(title, "aria-label")} data-astro-cid-73h5nvzy> ${coverUrl ? renderTemplate`<div class="cover" data-astro-cid-73h5nvzy> <img${addAttribute(coverUrl, "src")} alt="" loading="lazy" decoding="async" data-astro-cid-73h5nvzy> </div>` : renderTemplate`<div class="cover cover-placeholder" data-astro-cid-73h5nvzy> ${renderComponent($$result, "PixelPaw", $$PixelPaw, { "pixel": 4, "data-astro-cid-73h5nvzy": true })} </div>`} <div class="body" data-astro-cid-73h5nvzy> <div class="meta" data-astro-cid-73h5nvzy> ${category && renderTemplate`<span class="chip" data-astro-cid-73h5nvzy>${category}</span>`} <time${addAttribute(pubDate.toISOString(), "datetime")} data-astro-cid-73h5nvzy>${formatDate(pubDate)}</time> </div> <h2 class="title" data-astro-cid-73h5nvzy>${title}</h2> ${description && renderTemplate`<p class="desc" data-astro-cid-73h5nvzy>${description}</p>`} <div class="tags" data-astro-cid-73h5nvzy> ${tags.map((tag) => renderTemplate`<span class="tag" data-astro-cid-73h5nvzy>
#${tag} </span>`)} </div> </div> </a> </article> `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/blog/PostCard.astro", void 0);

export { $$PostCard as $ };
