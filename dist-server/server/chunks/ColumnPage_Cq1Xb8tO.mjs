import { f as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from './astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { $ as $$BaseLayout } from './BaseLayout_BhjJlmHi.mjs';
import { g as getAllPosts } from './data_DmO6YxUu.mjs';
import { b as getSiteColumns } from './site-content_BHK4DpBs.mjs';
import { $ as $$Mascot } from './Mascot_DfaDqNdc.mjs';
import { $ as $$PostCard } from './PostCard_x519BhxO.mjs';
import { $ as $$EmptyState } from './EmptyState_DBDcoNNz.mjs';
/* empty css                           */

const $$Astro = createAstro("https://example.com");
const $$ColumnPage = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$ColumnPage;
  const { id } = Astro2.props;
  const columns = await getSiteColumns();
  const column = columns.find((c) => c.id === id);
  if (!column) {
    return Astro2.redirect("/404", 302);
  }
  const { title, subtitle, description, theme, category } = column;
  const posts = (await getAllPosts()).filter((p) => p.category === category);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description, "forceTheme": theme, "data-astro-cid-f7n4dlsw": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-enter container" data-astro-cid-f7n4dlsw> <section class="column-hero" data-astro-cid-f7n4dlsw> <div class="column-mascot" aria-hidden="true" data-astro-cid-f7n4dlsw> ${renderComponent($$result2, "Mascot", $$Mascot, { "role": "furry", "theme": theme, "pixel": 9, "data-astro-cid-f7n4dlsw": true })} </div> <div class="column-text" data-astro-cid-f7n4dlsw> <p class="column-sub" data-astro-cid-f7n4dlsw>${subtitle}</p> <h1 data-astro-cid-f7n4dlsw>${title}</h1> <p class="column-desc" data-astro-cid-f7n4dlsw>${description}</p> <div class="column-meta" data-astro-cid-f7n4dlsw> <span class="chip" data-astro-cid-f7n4dlsw>${category}分类</span> <span class="count" data-astro-cid-f7n4dlsw>${posts.length} 篇</span> </div> </div> </section> ${posts.length > 0 ? renderTemplate`<div class="grid" data-astro-cid-f7n4dlsw> ${posts.map((p) => renderTemplate`${renderComponent($$result2, "PostCard", $$PostCard, { "slug": p.slug, "title": p.title, "description": p.description, "pubDate": p.pubDate, "category": p.category, "tags": p.tags, "cover": p.cover, "data-astro-cid-f7n4dlsw": true })}`)} </div>` : renderTemplate`${renderComponent($$result2, "EmptyState", $$EmptyState, { "title": `\u300C${title}\u300D\u8FD8\u6CA1\u6709\u6587\u7AE0`, "description": `\u5199\u4E00\u7BC7\u5206\u7C7B\u4E3A\u300C${category}\u300D\u7684\u6587\u7AE0,\u5C31\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC`, "data-astro-cid-f7n4dlsw": true })}`} </div> ` })} `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/blog/ColumnPage.astro", void 0);

export { $$ColumnPage as $ };
