import { f as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { g as getAllPosts } from '../../chunks/data_DmO6YxUu.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_BhjJlmHi.mjs';
import { a as aggregateByKey } from '../../chunks/taxonomy_BRvcM95l.mjs';
import { $ as $$PostCard } from '../../chunks/PostCard_x519BhxO.mjs';
import { $ as $$EmptyState } from '../../chunks/EmptyState_DBDcoNNz.mjs';
/* empty css                                         */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://example.com");
const getStaticPaths = (async () => {
  const posts = await getAllPosts();
  return aggregateByKey(posts, "category").map((cat) => ({
    params: { category: cat.name },
    props: {
      category: cat.name,
      posts: posts.filter((p) => p.category === cat.name)
    }
  }));
});
const $$category = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$category;
  const { category, posts } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": category, "description": `\u5206\u7C7B ${category} \u7684\u6587\u7AE0`, "data-astro-cid-2pzlju63": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-enter container" data-astro-cid-2pzlju63> <header class="page-head" data-astro-cid-2pzlju63> <h1 data-astro-cid-2pzlju63>${category}</h1> <p data-astro-cid-2pzlju63>${posts.length} 篇文章</p> </header> ${posts.length > 0 ? renderTemplate`<div class="grid" data-astro-cid-2pzlju63> ${posts.map((p) => renderTemplate`${renderComponent($$result2, "PostCard", $$PostCard, { "slug": p.slug, "title": p.title, "description": p.description, "pubDate": p.pubDate, "category": p.category, "tags": p.tags, "cover": p.cover, "data-astro-cid-2pzlju63": true })}`)} </div>` : renderTemplate`${renderComponent($$result2, "EmptyState", $$EmptyState, { "data-astro-cid-2pzlju63": true })}`} </div> ` })} `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/categories/[category].astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/categories/[category].astro";
const $$url = "/categories/[category]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$category,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
