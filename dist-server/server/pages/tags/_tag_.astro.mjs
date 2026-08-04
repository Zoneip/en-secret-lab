import { f as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { g as getAllPosts } from '../../chunks/data_DmO6YxUu.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_BhjJlmHi.mjs';
import { a as aggregateByKey } from '../../chunks/taxonomy_BRvcM95l.mjs';
import { $ as $$PostCard } from '../../chunks/PostCard_x519BhxO.mjs';
import { $ as $$EmptyState } from '../../chunks/EmptyState_DBDcoNNz.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://example.com");
const getStaticPaths = (async () => {
  const posts = await getAllPosts();
  return aggregateByKey(posts, "tags").map((tag) => ({
    params: { tag: tag.name },
    props: {
      tag: tag.name,
      posts: posts.filter((p) => p.tags.includes(tag.name))
    }
  }));
});
const $$tag = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$tag;
  const { tag, posts } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `#${tag}`, "description": `\u6807\u7B7E ${tag} \u7684\u6587\u7AE0`, "data-astro-cid-tge3q7ae": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-enter container" data-astro-cid-tge3q7ae> <header class="page-head" data-astro-cid-tge3q7ae> <h1 data-astro-cid-tge3q7ae> <span class="hash" data-astro-cid-tge3q7ae>#</span> ${tag} </h1> <p data-astro-cid-tge3q7ae>${posts.length} 篇文章</p> </header> ${posts.length > 0 ? renderTemplate`<div class="grid" data-astro-cid-tge3q7ae> ${posts.map((p) => renderTemplate`${renderComponent($$result2, "PostCard", $$PostCard, { "slug": p.slug, "title": p.title, "description": p.description, "pubDate": p.pubDate, "category": p.category, "tags": p.tags, "cover": p.cover, "data-astro-cid-tge3q7ae": true })}`)} </div>` : renderTemplate`${renderComponent($$result2, "EmptyState", $$EmptyState, { "title": "\u8FD9\u4E2A\u6807\u7B7E\u4E0B\u8FD8\u6CA1\u6709\u6587\u7AE0", "data-astro-cid-tge3q7ae": true })}`} </div> ` })} `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/tags/[tag].astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/tags/[tag].astro";
const $$url = "/tags/[tag]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$tag,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
