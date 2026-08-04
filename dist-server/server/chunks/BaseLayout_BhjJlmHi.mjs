import { f as createAstro, c as createComponent, m as maybeRenderHead, d as addAttribute, a as renderTemplate, u as unescapeHTML, r as renderComponent, b as renderScript, g as renderSlot, e as renderHead, v as spreadAttributes } from './astro/server_CcxDCTKC.mjs';
/* empty css                           */
import { g as getSiteConfig, a as getThemeOverrides } from './config_C3U3sL-u.mjs';
import { a as absoluteUrl } from './utils_CtBiJGkK.mjs';
import { P as PREFS_KEY, g as getTheme, w as wallpaperCss, t as themes } from './presets_Dwkdm1KE.mjs';
import 'piccolore';
import 'clsx';

function buildMeta(opts) {
  const fullTitle = opts.title === opts.siteTitle ? opts.title : `${opts.title} · ${opts.siteTitle}`;
  const meta = [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { title: fullTitle },
    { name: "description", content: opts.description ?? "" },
    { property: "og:title", content: fullTitle },
    { property: "og:type", content: opts.type ?? "website" },
    { property: "og:site_name", content: opts.siteTitle }
  ];
  if (opts.url) meta.push({ property: "og:url", content: opts.url });
  if (opts.description) meta.push({ property: "og:description", content: opts.description });
  if (opts.image) {
    meta.push({ property: "og:image", content: opts.image });
    meta.push({ name: "twitter:card", content: "summary_large_image" });
  } else {
    meta.push({ name: "twitter:card", content: "summary" });
  }
  return meta;
}

const DEFAULT_PREFS = { theme: "gray", mode: "system" };
function bootScript() {
  return `(function(){
  var K='${PREFS_KEY}';
  var t='${DEFAULT_PREFS.theme}', m='${DEFAULT_PREFS.mode}';
  var ft=document.documentElement.dataset.forceTheme;
  if(ft){t=ft;m='light';}
  try{var p=JSON.parse(localStorage.getItem(K)||'null'); if(p){if(!ft&&p.theme)t=p.theme; if(p.mode)m=p.mode;}}catch(e){}
  var dark=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme=t;
  document.documentElement.dataset.mode=dark?'dark':'light';
  document.documentElement.dataset.modePref=m;
})();`;
}

function themeOverrideCss(overrides) {
  const rules = [];
  for (const [themeId, ov] of Object.entries(overrides)) {
    if (ov.palette && Object.keys(ov.palette).length > 0) {
      const decls = Object.entries(ov.palette).map(([k, v]) => `--${k}: ${v};`).join("");
      for (const mode of ["light", "dark"]) {
        rules.push(`:root:root[data-theme="${themeId}"][data-mode="${mode}"]{${decls}}`);
      }
    }
    if (ov.wallpaper) {
      for (const mode of ["light", "dark"]) {
        const src = ov.wallpaper[mode];
        if (!src) continue;
        const cssVal = src.startsWith("gradient:") ? src.slice("gradient:".length) : src.startsWith("url:") ? `url(${src.slice("url:".length)})` : src;
        rules.push(`:root:root[data-theme="${themeId}"]{--wallpaper-${mode}-src: ${cssVal};}`);
      }
    }
  }
  return rules.join("\n");
}

const $$Astro$4 = createAstro("https://example.com");
const $$SkipLink = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$SkipLink;
  const { href = "#main" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<a class="skip-link"${addAttribute(href, "href")} data-astro-cid-4svbv52e>跳到正文</a> `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/layout/SkipLink.astro", void 0);

const $$Astro$3 = createAstro("https://example.com");
const $$SiteHeader = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$SiteHeader;
  const { active } = Astro2.props;
  const config = getSiteConfig();
  const current = active ?? Astro2.url.pathname;
  return renderTemplate`${maybeRenderHead()}<header class="site-header" data-astro-cid-mwoppcd7> <div class="container header-inner" data-astro-cid-mwoppcd7> <a href="/" class="brand underline-tail" aria-label="回到首页" data-astro-cid-mwoppcd7> <span class="brand-mark" aria-hidden="true" data-astro-cid-mwoppcd7></span> <span class="brand-name" data-astro-cid-mwoppcd7>${config.title}</span> </a> <nav class="nav" aria-label="主导航" data-astro-cid-mwoppcd7> <ul data-astro-cid-mwoppcd7> ${config.nav.map((item) => renderTemplate`<li data-astro-cid-mwoppcd7> <a${addAttribute(item.url, "href")}${addAttribute(["nav-link underline-tail", { active: current === item.url }], "class:list")} data-astro-cid-mwoppcd7> ${item.label} </a> </li>`)} </ul> </nav> <div class="actions" data-astro-cid-mwoppcd7> <a href="/search" class="btn btn-ghost btn-icon" aria-label="搜索" data-astro-cid-mwoppcd7> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-astro-cid-mwoppcd7> <circle cx="11" cy="11" r="7" data-astro-cid-mwoppcd7></circle> <path d="m21 21-4.35-4.35" stroke-linecap="round" data-astro-cid-mwoppcd7></path> </svg> <span class="search-label" data-astro-cid-mwoppcd7>搜索</span> </a> </div> </div> </header> `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/layout/SiteHeader.astro", void 0);

const WIDTH = 20;
function art(rows, width = WIDTH) {
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].length !== width) {
      throw new Error(`像素画稿行宽错误:第 ${i} 行长度 ${rows[i].length} ≠ ${width} -> "${rows[i]}"`);
    }
  }
  return { width, height: rows.length, rows };
}
function applyPatches(base, patches) {
  const out = base.slice();
  for (const [i, row] of Object.entries(patches)) out[Number(i)] = row;
  return out;
}
const BOY_BASE = [
  ".........11.........",
  // 0  头顶
  ".......111111.......",
  // 1
  ".....1111111111.....",
  // 2
  "....111111111111....",
  // 3
  "....111111111111....",
  // 4
  "....1111....1111....",
  // 5  刘海分缝
  "....111111111111....",
  // 6  额头
  "...1ffffffffffff1...",
  // 7  脸(两侧头发)
  "...1ff55....55ff1...",
  // 8  眼睛
  "...1ff55....55ff1...",
  // 9
  "...1f.22......221...",
  // 10 腮红
  "...1ff...44...ff1...",
  // 11 嘴
  "...1ffffffffffff1...",
  // 12
  "....ffffffffffff....",
  // 13 下巴
  ".....ffffffffff.....",
  // 14
  ".....1111111111.....",
  // 15 领口
  "....111111111111....",
  // 16 肩
  "...11111111111111...",
  // 17
  "...11111111111111...",
  // 18
  "....111111111111....",
  // 19
  "......11111111......"
  // 20 身体收尾
];
const FURRY_BASE = [
  "..111..........111..",
  // 0  耳尖
  "..1111........1111..",
  // 1
  "..1221........1221..",
  // 2  内耳
  "...111........111...",
  // 3
  "....111111111111....",
  // 4  头顶
  "....111111111111....",
  // 5
  "....111111111111....",
  // 6  额头
  "...1ffffffffffff1...",
  // 7  脸
  "...1ff55....55ff1...",
  // 8  眼睛
  "...1ff55....55ff1...",
  // 9
  "...1f.22......221...",
  // 10 腮红
  "...1wwwwwwwwwwww1...",
  // 11 口吻
  "...1www..55..www1...",
  // 12 鼻
  "...1wwwwwwwwwwww1...",
  // 13
  "...1ffffffffffff1...",
  // 14 脸侧
  "....ffffffffffff....",
  // 15
  ".....ffffffffff.....",
  // 16
  ".....1111111111.....",
  // 17 肩
  "...11111111111111...",
  // 18
  "....111111111111....",
  // 19
  "......11111111......"
  // 20
];
const P_DCH_BOY = {
  0: "........1111........",
  // 呆毛
  5: "....111111111111....",
  // 齐刘海
  15: ".....wwwwwwwwww.....",
  // 白领
  16: "....11wwwwwwww11...."
  // 衬衫
};
const P_FWB_BOY = {
  0: "........1111........",
  // 尖发
  1: "......11111111......",
  5: "....111111111111....",
  // 齐刘海
  11: "...1ff..4444..ff1...",
  // 咧嘴大笑
  15: ".....1wwwwwwww1.....",
  // 翻领
  16: "....11wwwwwwww11...."
};
const P_COULYER_BOY = {
  5: "....1111.....111....",
  // 斜刘海(左长右短)
  7: "...3ffffffffffff3...",
  // 侧发垂落(亮色)
  8: "...3ff55....55ff3...",
  9: "...3ff55....55ff3..."
};
const P_ZONEIP_BOY = {
  2: "...31111111111113...",
  // 兜帽翼
  3: "...31111111111113...",
  5: "....111111111111....",
  // 齐刘海
  15: ".....wwwwwwwwww.....",
  // 围巾
  16: "....11wwwwwwww11...."
};
const P_DCH_FURRY = {
  0: "....................",
  // 无立耳 → 垂耳
  1: "....................",
  2: "..1111........1111..",
  // 垂耳根
  3: "..1111........1111..",
  // 垂耳
  4: "...111........111...",
  5: "....111111111111....",
  // 头顶(整体下移)
  6: "....111111111111....",
  7: "....111111111111....",
  8: "...1ffffffffffff1...",
  9: "...1ff55....55ff1...",
  10: "...1ff55....55ff1...",
  11: "...1f.22......221...",
  12: "...1wwwwwwwwwwww1...",
  13: "...1www..55..www1...",
  14: "...1wwwwwwwwwwww1...",
  15: "...1ffffffffffff1...",
  16: "....ffffffffffff....",
  17: ".....1111111111.....",
  18: "...11111111111111...",
  19: "....111111111111....",
  20: "......11111111......"
};
const P_FWB_FURRY = {
  0: "..1111........1111..",
  // 大立耳
  1: "..11111......11111..",
  2: "..12211......11221..",
  3: "..11111......11111..",
  4: "...111........111...",
  12: "...1wwwwwwwwwwwwww1.",
  // 宽口吻
  13: "...1www...55...www1.",
  14: "...1wwwwwwwwwwwwww1.",
  19: "....111111111111..11",
  // 尾巴伸出
  20: "......11111111...22."
  // 尾尖
};
const P_COULYER_FURRY = {
  0: "..331..........133..",
  // 耳尖亮色流苏
  8: "...3ff55....55ff3...",
  // 侧鬓(亮色)
  9: "...3ff55....55ff3..."
};
const P_ZONEIP_FURRY = {
  0: "..1w1..........1w1..",
  // 耳尖白簇绒
  17: ".....1wwwwwwww1.....",
  // 围巾
  18: "...111wwwwwwww111..."
};
const CHARACTERS = {
  gray: {
    name: "DCH",
    boy: art(applyPatches(BOY_BASE, P_DCH_BOY)),
    furry: art(applyPatches(FURRY_BASE, P_DCH_FURRY))
  },
  yellow: {
    name: "FWB",
    boy: art(applyPatches(BOY_BASE, P_FWB_BOY)),
    furry: art(applyPatches(FURRY_BASE, P_FWB_FURRY))
  },
  purple: {
    name: "Coulyer",
    boy: art(applyPatches(BOY_BASE, P_COULYER_BOY)),
    furry: art(applyPatches(FURRY_BASE, P_COULYER_FURRY))
  },
  white: {
    name: "Zoneip",
    boy: art(applyPatches(BOY_BASE, P_ZONEIP_BOY)),
    furry: art(applyPatches(FURRY_BASE, P_ZONEIP_FURRY))
  }
};
const THEME_TO_CHARACTER = {
  gray: "gray",
  yellow: "yellow",
  purple: "purple",
  white: "white"
};
const PAW = art([
  "..1.1..1.1..",
  "...1....1...",
  "..1.1..1.1..",
  ".1..1..1..1.",
  "....1111....",
  "...111111...",
  "..11111111..",
  "...111111...",
  "....1111...."
], 12);
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16)
  ];
}
function toHex(r, g, b) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function mix(a, b, t) {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return toHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}
function paletteFor(mascot) {
  return {
    primary: mascot.primary,
    secondary: mascot.secondary,
    light: mix(mascot.primary, "#FFFFFF", 0.45),
    dark: mix(mascot.primary, "#1A1C22", 0.4),
    eye: "#332F36",
    skin: "#F5EFE6",
    skinShadow: "#E3D8C9",
    white: "#FFFFFF"
  };
}

const $$Astro$2 = createAstro("https://example.com");
const $$PixelDivider = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$PixelDivider;
  const { theme = "gray", pixel = 2 } = Astro2.props;
  const preset = getTheme(theme);
  const palette = paletteFor(preset.mascot);
  let cells = "";
  for (let y = 0; y < PAW.height; y++) {
    const row = PAW.rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const fill = {
        "1": palette.primary,
        "2": palette.secondary,
        "3": palette.light,
        "4": palette.dark,
        "5": palette.eye,
        f: palette.skin,
        F: palette.skinShadow,
        w: palette.white
      }[ch];
      if (!fill) continue;
      cells += `<rect x="${x * pixel}" y="${y * pixel}" width="${pixel}" height="${pixel}" fill="${fill}"/>`;
    }
  }
  const width = PAW.width * pixel;
  const height = PAW.height * pixel;
  const patternId = `paw-pattern-${crypto.randomUUID()}`;
  return renderTemplate`${maybeRenderHead()}<div class="pixel-divider" role="presentation" data-astro-cid-qxffotjs> <svg width="100%"${addAttribute(height * 1.5, "height")} shape-rendering="crispEdges" preserveAspectRatio="xMidYMid meet" aria-hidden="true" data-astro-cid-qxffotjs> <pattern${addAttribute(patternId, "id")}${addAttribute(width * 3, "width")}${addAttribute(height * 2, "height")} patternUnits="userSpaceOnUse" data-astro-cid-qxffotjs> <g${addAttribute(`translate(0 0)`, "transform")} data-astro-cid-qxffotjs>${unescapeHTML(cells)}</g> <g${addAttribute(`translate(${width * 1.5} ${height * 0.5})`, "transform")} data-astro-cid-qxffotjs>${unescapeHTML(cells)}</g> </pattern> <rect width="100%" height="100%"${addAttribute(`url(#${patternId})`, "fill")} data-astro-cid-qxffotjs></rect> </svg> </div> `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/mascot/PixelDivider.astro", void 0);

const $$SiteFooter = createComponent(($$result, $$props, $$slots) => {
  const config = getSiteConfig();
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  return renderTemplate`${maybeRenderHead()}<footer class="site-footer" data-astro-cid-zizlwfnu> <div class="container" data-astro-cid-zizlwfnu> ${renderComponent($$result, "PixelDivider", $$PixelDivider, { "data-astro-cid-zizlwfnu": true })} <div class="footer-row" data-astro-cid-zizlwfnu> <p class="copyright" data-astro-cid-zizlwfnu>
© ${year} ${config.author} · ${config.title} </p> <p class="meta" data-astro-cid-zizlwfnu> <a href="/rss.xml" class="underline-tail" data-astro-cid-zizlwfnu>RSS</a> <span aria-hidden="true" data-astro-cid-zizlwfnu>·</span> <span data-astro-cid-zizlwfnu>用爱和像素搭的</span> </p> </div> </div> </footer> `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/layout/SiteFooter.astro", void 0);

const $$Astro$1 = createAstro("https://example.com");
const $$WallpaperLayer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$WallpaperLayer;
  const { theme, enabled = true } = Astro2.props;
  const preset = getTheme(theme);
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(["wallpaper", { "wallpaper-hidden": !enabled }], "class:list")} aria-hidden="true" data-astro-cid-hrkynom5> <div class="wallpaper-base" data-wallpaper-light${addAttribute(`background-image:${wallpaperCss(preset.wallpaper.light)}`, "style")} data-astro-cid-hrkynom5></div> <div class="wallpaper-base" data-wallpaper-dark${addAttribute(`background-image:${wallpaperCss(preset.wallpaper.dark)}`, "style")} data-astro-cid-hrkynom5></div> <div class="wallpaper-overlay" data-astro-cid-hrkynom5></div> </div> `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/layout/WallpaperLayer.astro", void 0);

const $$ThemeSwitcher = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="theme-switcher" data-theme-switcher data-astro-cid-f7blgu25> <button class="fab" data-fab aria-label="切换主题" aria-expanded="false" aria-haspopup="dialog" data-astro-cid-f7blgu25> <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-astro-cid-f7blgu25> <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.4 5.4 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" data-astro-cid-f7blgu25></path> </svg> </button> <div class="panel" role="dialog" aria-label="主题设置" hidden data-astro-cid-f7blgu25> <p class="panel-title" data-astro-cid-f7blgu25>换上喜欢的配色</p> <div class="theme-grid" data-astro-cid-f7blgu25> ${themes.map((t) => renderTemplate`<button class="theme-card"${addAttribute(t.id, "data-theme-id")} aria-pressed="false" data-astro-cid-f7blgu25> <span class="theme-preview" aria-hidden="true" data-astro-cid-f7blgu25> <i style="background:{t.palette.light.primary}" data-astro-cid-f7blgu25></i> <i style="background:{t.palette.light.accent}" data-astro-cid-f7blgu25></i> <i style="background:{t.palette.light.bg}" data-astro-cid-f7blgu25></i> </span> <span class="theme-name" data-astro-cid-f7blgu25>${t.name}</span> </button>`)} </div> <fieldset class="mode-group" data-astro-cid-f7blgu25> <legend data-astro-cid-f7blgu25>显示模式</legend> <div class="mode-segmented" role="radiogroup" aria-label="显示模式" data-astro-cid-f7blgu25> <button type="button" role="radio" data-mode="light" aria-checked="false" data-astro-cid-f7blgu25>浅色</button> <button type="button" role="radio" data-mode="dark" aria-checked="false" data-astro-cid-f7blgu25>深色</button> <button type="button" role="radio" data-mode="system" aria-checked="false" data-astro-cid-f7blgu25>跟随系统</button> </div> </fieldset> <p class="panel-hint" data-astro-cid-f7blgu25>选择会保存在你的浏览器里</p> </div> </div> ${renderScript($$result, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/theme/ThemeSwitcher.astro?astro&type=script&index=0&lang.ts")} `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/theme/ThemeSwitcher.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://example.com");
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const config = getSiteConfig();
  const overrideCss = themeOverrideCss(getThemeOverrides());
  const { title, description, image, type, forceTheme, hideFooter = false } = Astro2.props;
  const resolvedTheme = forceTheme ?? config.defaultTheme;
  const siteUrl = Astro2.site?.toString() ?? "http://localhost:4321";
  const pageUrl = absoluteUrl(siteUrl, Astro2.url.pathname);
  const meta = buildMeta({
    title,
    description: description ?? config.description,
    type,
    url: pageUrl,
    image,
    siteTitle: config.title});
  return renderTemplate(_a || (_a = __template(['<html lang="zh-CN"', "", '> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><title>', "</title>", "", "<script>", "<\/script>", "", "</head> <body> ", " ", " ", ' <main id="main"> ', " </main> ", " ", " </body></html>"])), addAttribute(resolvedTheme, "data-theme"), spreadAttributes(forceTheme ? { "data-force-theme": forceTheme } : {}), meta.find((m) => "title" in m)?.title ?? title, meta.filter((m) => !("title" in m)).map((m) => renderTemplate`<meta${spreadAttributes(m)}>`), overrideCss && renderTemplate`<style>${unescapeHTML(overrideCss)}</style>`, unescapeHTML(bootScript()), renderScript($$result, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts"), renderHead(), renderComponent($$result, "SkipLink", $$SkipLink, {}), renderComponent($$result, "WallpaperLayer", $$WallpaperLayer, { "theme": config.defaultTheme, "enabled": config.features.wallpapers }), renderComponent($$result, "SiteHeader", $$SiteHeader, {}), renderSlot($$result, $$slots["default"]), !hideFooter && renderTemplate`${renderComponent($$result, "SiteFooter", $$SiteFooter, {})}`, renderComponent($$result, "ThemeSwitcher", $$ThemeSwitcher, {}));
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $, CHARACTERS as C, PAW as P, THEME_TO_CHARACTER as T, $$PixelDivider as a, paletteFor as p };
