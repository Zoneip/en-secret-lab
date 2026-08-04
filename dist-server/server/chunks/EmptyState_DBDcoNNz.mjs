import { f as createAstro, c as createComponent, m as maybeRenderHead, r as renderComponent, a as renderTemplate } from './astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { $ as $$Mascot } from './Mascot_DfaDqNdc.mjs';
/* empty css                           */

const $$Astro = createAstro("https://example.com");
const $$EmptyState = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$EmptyState;
  const { title = "\u8FD9\u91CC\u7A7A\u7A7A\u5982\u4E5F", description = "\u8FD8\u6CA1\u6709\u5185\u5BB9,\u8FC7\u9635\u5B50\u518D\u6765\u770B\u770B\u5427" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="empty-state card" data-astro-cid-hi2kfju5> <div class="empty-mascot" data-astro-cid-hi2kfju5> ${renderComponent($$result, "Mascot", $$Mascot, { "role": "furry", "pixel": 6, "data-astro-cid-hi2kfju5": true })} </div> <p class="empty-title" data-astro-cid-hi2kfju5>${title}</p> <p class="empty-desc" data-astro-cid-hi2kfju5>${description}</p> <a class="btn btn-ghost" href="/" data-astro-cid-hi2kfju5>回首页</a> </div> `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/ui/EmptyState.astro", void 0);

export { $$EmptyState as $ };
