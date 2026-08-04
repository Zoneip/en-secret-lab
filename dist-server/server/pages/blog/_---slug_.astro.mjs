import { f as createAstro, c as createComponent, m as maybeRenderHead, d as addAttribute, a as renderTemplate, g as renderSlot, r as renderComponent, F as Fragment, u as unescapeHTML } from '../../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { getCollection, render as renderEntry } from '../../chunks/_astro_content_Dt6JQA9-.mjs';
import { $ as $$BaseLayout, a as $$PixelDivider } from '../../chunks/BaseLayout_BhjJlmHi.mjs';
import { i as isServer, f as formatDate, r as readingTime } from '../../chunks/utils_CtBiJGkK.mjs';
import { a as getPostContent, g as getAllPosts } from '../../chunks/data_DmO6YxUu.mjs';
import MarkdownIt from 'markdown-it';
import 'clsx';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

let md = null;
function getMd() {
  if (md) return md;
  md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: false,
    typographer: true
  });
  return md;
}
function renderBody(body) {
  const parser = getMd();
  const html = parser.render(body);
  const headings = [];
  for (const match of html.matchAll(/<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/g)) {
    const depth = Number(match[1]);
    const text = match[3].replace(/<[^>]+>/g, "").trim();
    headings.push({ depth, slug: slugifyHeading(text), text });
  }
  return { html, headings };
}
function slugifyHeading(text) {
  return text.trim().toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, "-").replace(/^-+|-+$/g, "") || "section";
}

const $$Astro$2 = createAstro("https://example.com");
const $$TableOfContents = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$TableOfContents;
  const { headings } = Astro2.props;
  const visible = headings.filter((h) => h.depth <= 3);
  return renderTemplate`${visible.length > 0 && renderTemplate`${maybeRenderHead()}<nav class="toc" aria-label="文章目录" data-astro-cid-ymbpksfa><p class="toc-title" data-astro-cid-ymbpksfa>目录</p><ul data-astro-cid-ymbpksfa>${visible.map((h) => renderTemplate`<li${addAttribute(`depth-${h.depth}`, "class")} data-astro-cid-ymbpksfa><a${addAttribute(`#${h.slug}`, "href")} class="toc-link underline-tail" data-astro-cid-ymbpksfa>${h.text}</a></li>`)}</ul></nav>`}`;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/blog/TableOfContents.astro", void 0);

const $$Astro$1 = createAstro("https://example.com");
const $$Chip = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Chip;
  const { href } = Astro2.props;
  return renderTemplate`${href ? renderTemplate`${maybeRenderHead()}<a class="chip"${addAttribute(href, "href")}>${renderSlot($$result, $$slots["default"])}</a>` : renderTemplate`<span class="chip">${renderSlot($$result, $$slots["default"])}</span>`}`;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/ui/Chip.astro", void 0);

const $$Astro = createAstro("https://example.com");
const getStaticPaths = (async () => {
  if (isServer) return [];
  const { getCollection: getCollection2 } = await import('../../chunks/_astro_content_Dt6JQA9-.mjs');
  const posts = await getCollection2("posts");
  return posts.filter((p) => !p.data.draft).map((post) => ({ params: { slug: post.slug }, props: { post } }));
});
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const slug = Astro2.params.slug;
  const content = await getPostContent(slug);
  if (!content) {
    return Astro2.redirect("/404", 302);
  }
  const post = content.post;
  const all = await getAllPosts();
  const idx = all.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : void 0;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : void 0;
  let contentHtml = "";
  let contentHeadings;
  let ContentComponent = null;
  if (isServer) {
    const r = renderBody(content.body);
    contentHtml = r.html;
    contentHeadings = r.headings;
  } else {
    const entry = (await getCollection("posts")).find((p) => p.slug === slug);
    const rendered = await renderEntry(entry);
    ContentComponent = rendered.Content;
    contentHeadings = rendered.headings;
  }
  const words = content.body;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": post.title, "description": post.description, "type": "article", "data-astro-cid-7jjqptxk": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<article class="post page-enter container" data-astro-cid-7jjqptxk> <header class="post-head" data-astro-cid-7jjqptxk> <div class="post-meta" data-astro-cid-7jjqptxk> ${renderComponent($$result2, "Chip", $$Chip, { "href": `/categories/${encodeURIComponent(post.category)}`, "data-astro-cid-7jjqptxk": true }, { "default": async ($$result3) => renderTemplate`${post.category}` })} <time${addAttribute(post.pubDate.toISOString(), "datetime")} data-astro-cid-7jjqptxk>${formatDate(post.pubDate)}</time> <span class="reading" data-astro-cid-7jjqptxk>${readingTime(words)} 分钟阅读</span> </div> <h1 data-astro-cid-7jjqptxk>${post.title}</h1> ${post.description && renderTemplate`<p class="subtitle" data-astro-cid-7jjqptxk>${post.description}</p>`} <div class="tags" data-astro-cid-7jjqptxk> ${post.tags.map((tag) => renderTemplate`<a class="chip"${addAttribute(`/tags/${encodeURIComponent(tag)}`, "href")} data-astro-cid-7jjqptxk>
#${tag} </a>`)} </div> </header> ${renderComponent($$result2, "PixelDivider", $$PixelDivider, { "data-astro-cid-7jjqptxk": true })} <div class="post-body" data-astro-cid-7jjqptxk> <div class="toc-wrap" data-astro-cid-7jjqptxk> ${renderComponent($$result2, "TableOfContents", $$TableOfContents, { "headings": contentHeadings ?? [], "data-astro-cid-7jjqptxk": true })} </div> <div class="prose" data-astro-cid-7jjqptxk> ${ContentComponent ? renderTemplate`${renderComponent($$result2, "ContentComponent", ContentComponent, { "data-astro-cid-7jjqptxk": true })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`${unescapeHTML(contentHtml)}` })}`} </div> </div> </article> <div class="container" data-astro-cid-7jjqptxk> <nav class="adjacent" aria-label="上下篇文章" data-astro-cid-7jjqptxk> ${prev ? renderTemplate`<a class="adj card"${addAttribute(`/blog/${prev.slug}`, "href")} data-astro-cid-7jjqptxk> <span class="adj-label" data-astro-cid-7jjqptxk>上一篇</span> <span class="adj-title" data-astro-cid-7jjqptxk>${prev.title}</span> </a>` : renderTemplate`<span data-astro-cid-7jjqptxk></span>`} ${next ? renderTemplate`<a class="adj card adj-next"${addAttribute(`/blog/${next.slug}`, "href")} data-astro-cid-7jjqptxk> <span class="adj-label" data-astro-cid-7jjqptxk>下一篇</span> <span class="adj-title" data-astro-cid-7jjqptxk>${next.title}</span> </a>` : renderTemplate`<span data-astro-cid-7jjqptxk></span>`} </nav> </div> ` })} `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/blog/[...slug].astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/blog/[...slug].astro";
const $$url = "/blog/[...slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
