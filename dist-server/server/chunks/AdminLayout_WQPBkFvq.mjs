import { f as createAstro, c as createComponent, a as renderTemplate, b as renderScript, r as renderComponent, g as renderSlot, d as addAttribute, e as renderHead } from './astro/server_CcxDCTKC.mjs';
import 'piccolore';
/* empty css                          */
import { Toaster } from 'sonner';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://example.com");
const $$AdminLayout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AdminLayout;
  const { title, active } = Astro2.props;
  const nav = [
    { key: "dashboard", label: "\u4EEA\u8868\u76D8", href: "/admin", icon: "layout-dashboard" },
    { key: "posts", label: "\u6587\u7AE0", href: "/admin/posts", icon: "file-text" },
    { key: "content", label: "\u5185\u5BB9", href: "/admin/content", icon: "layout" },
    { key: "themes", label: "\u4E3B\u9898", href: "/admin/themes", icon: "palette" },
    { key: "site", label: "\u7AD9\u70B9\u8BBE\u7F6E", href: "/admin/site", icon: "settings" },
    { key: "assets", label: "\u8D44\u4EA7", href: "/admin/assets", icon: "image" }
  ];
  return renderTemplate(_a || (_a = __template(['<html lang="zh-CN"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>', ` \xB7 \u63A7\u5236\u53F0</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><style>
      body {
        font-family: 'Noto Sans SC', ui-sans-serif, system-ui, sans-serif;
      }
    </style><script>
      try {
        if (localStorage.getItem('enlab:admin-theme') === 'dark') {
          document.documentElement.classList.add('dark')
        }
      } catch {
        /* ignore */
      }
    <\/script>`, '</head> <body class="bg-background text-foreground antialiased"> <div class="flex min-h-screen"> <aside class="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r bg-sidebar px-3 py-4 lg:flex"> <a href="/admin" class="flex items-center gap-2.5 px-2 pb-5"> <svg width="30" height="30" viewBox="0 0 32 32" class="shrink-0" aria-hidden="true"> <defs> <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1"> <stop offset="0" stop-color="#5c677d"></stop> <stop offset="1" stop-color="#9aa5b5"></stop> </linearGradient> </defs> <rect width="32" height="32" rx="9" fill="url(#logo-g)"></rect> <g fill="#fff" opacity="0.95"> <rect x="5" y="5" width="5" height="5" rx="1.5"></rect> <rect x="13.5" y="3" width="5" height="5" rx="1.5"></rect> <rect x="22" y="5" width="5" height="5" rx="1.5"></rect> <rect x="9.5" y="13" width="5" height="5" rx="1.5"></rect> <rect x="17.5" y="13" width="5" height="5" rx="1.5"></rect> </g> <g fill="#e8ebf0" opacity="0.9"> <rect x="7" y="20" width="4" height="4" rx="1.5"></rect> <rect x="12" y="19" width="4" height="4" rx="1.5"></rect> <rect x="17" y="19" width="4" height="4" rx="1.5"></rect> <rect x="22" y="20" width="4" height="4" rx="1.5"></rect> <rect x="9" y="24.5" width="6" height="3" rx="1.5"></rect> <rect x="18" y="24.5" width="6" height="3" rx="1.5"></rect> <rect x="13" y="23" width="7" height="5" rx="2.5"></rect> </g> </svg> <span class="text-sm font-semibold tracking-tight">\u79D8\u5BC6\u5B9E\u9A8C\u5BA4</span> </a> <nav class="flex flex-1 flex-col gap-0.5"> ', ' </nav> <div class="mt-auto flex flex-col gap-0.5 border-t pt-3"> <a href="/" target="_blank" class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60">\n\u67E5\u770B\u524D\u53F0\n</a> <button data-logout class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-destructive/80 transition-colors hover:bg-destructive/10">\n\u9000\u51FA\u767B\u5F55\n</button> </div> </aside> <div class="flex min-w-0 flex-1 flex-col lg:pl-56"> <header class="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur lg:px-8"> <div class="flex items-center gap-3"> <a href="/admin" class="flex items-center gap-2 lg:hidden"> <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#5c677d"></rect><g fill="#fff" opacity="0.95"><rect x="5" y="5" width="5" height="5" rx="1.5"></rect><rect x="13.5" y="3" width="5" height="5" rx="1.5"></rect><rect x="22" y="5" width="5" height="5" rx="1.5"></rect><rect x="9.5" y="13" width="5" height="5" rx="1.5"></rect><rect x="17.5" y="13" width="5" height="5" rx="1.5"></rect></g><g fill="#e8ebf0" opacity="0.9"><rect x="7" y="20" width="4" height="4" rx="1.5"></rect><rect x="12" y="19" width="4" height="4" rx="1.5"></rect><rect x="17" y="19" width="4" height="4" rx="1.5"></rect><rect x="22" y="20" width="4" height="4" rx="1.5"></rect><rect x="9" y="24.5" width="6" height="3" rx="1.5"></rect><rect x="18" y="24.5" width="6" height="3" rx="1.5"></rect><rect x="13" y="23" width="7" height="5" rx="2.5"></rect></g></svg> </a> <h1 class="text-base font-semibold tracking-tight">', '</h1> </div> <div class="flex items-center gap-2"> <span class="hidden rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground sm:inline">\u52A8\u6001\u7248</span> <kbd class="hidden rounded-md border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline" aria-hidden="true">\u2318K</kbd> ', ' <button data-mobile-nav class="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent lg:hidden" aria-label="\u83DC\u5355"> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"></path></svg> </button> </div> </header> <main class="min-w-0 flex-1 px-4 py-6 lg:px-8"> ', " </main> </div> </div> ", " ", " ", " </body> </html>"])), title, renderHead(), nav.map((item) => renderTemplate`<a${addAttribute(item.href, "href")}${addAttribute([
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active === item.key ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
  ], "class:list")}> ${item.label} </a>`), title, renderComponent($$result, "DarkToggle", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/admin/dark-toggle", "client:component-export": "default" }), renderSlot($$result, $$slots["default"]), renderComponent($$result, "Toaster", Toaster, { "position": "top-center", "richColors": true, "closeButton": true }), renderComponent($$result, "CommandMenu", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/admin/command-menu", "client:component-export": "default" }), renderScript($$result, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/layouts/AdminLayout.astro?astro&type=script&index=0&lang.ts"));
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/layouts/AdminLayout.astro", void 0);

export { $$AdminLayout as $ };
