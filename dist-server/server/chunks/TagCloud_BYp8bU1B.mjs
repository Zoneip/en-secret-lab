import { f as createAstro, c as createComponent, m as maybeRenderHead, a as renderTemplate, d as addAttribute } from './astro/server_CcxDCTKC.mjs';
import 'piccolore';
import 'clsx';
import { a as aggregateByKey } from './taxonomy_BRvcM95l.mjs';
/* empty css                         */

const $$Astro = createAstro("https://example.com");
const $$TagCloud = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$TagCloud;
  const { posts, maxSize = 1.6 } = Astro2.props;
  const tags = aggregateByKey(posts, "tags");
  const max = Math.max(1, ...tags.map((t) => t.count));
  return renderTemplate`${maybeRenderHead()}<div class="tag-cloud" data-astro-cid-z4y3suxz> ${tags.length === 0 && renderTemplate`<p class="empty" data-astro-cid-z4y3suxz>还没有标签</p>`} ${tags.map((tag) => {
    const size = 0.85 + tag.count / max * (maxSize - 0.85);
    return renderTemplate`<a${addAttribute(`/tags/${encodeURIComponent(tag.name)}`, "href")} class="tag-link underline-tail"${addAttribute(`font-size:${size.toFixed(2)}rem`, "style")} data-astro-cid-z4y3suxz> ${tag.name} <span class="count" data-astro-cid-z4y3suxz>${tag.count}</span> </a>`;
  })} </div> `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/blog/TagCloud.astro", void 0);

export { $$TagCloud as $ };
