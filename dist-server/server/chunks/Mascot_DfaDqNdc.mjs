import { f as createAstro, c as createComponent, m as maybeRenderHead, d as addAttribute, u as unescapeHTML, a as renderTemplate, r as renderComponent } from './astro/server_CcxDCTKC.mjs';
import 'piccolore';
import { C as CHARACTERS, p as paletteFor, T as THEME_TO_CHARACTER } from './BaseLayout_BhjJlmHi.mjs';
import 'clsx';
/* empty css                           */
import { g as getTheme } from './presets_Dwkdm1KE.mjs';

const $$Astro$1 = createAstro("https://example.com");
const $$PixelSprite = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$PixelSprite;
  const { art, palette, pixel = 8, role } = Astro2.props;
  const colorMap = {
    "1": palette.primary,
    "2": palette.secondary,
    "3": palette.light,
    "4": palette.dark,
    "5": palette.eye,
    f: palette.skin,
    F: palette.skinShadow,
    w: palette.white
  };
  let cells = "";
  for (let y = 0; y < art.height; y++) {
    const row = art.rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const fill = colorMap[ch];
      if (!fill) continue;
      cells += `<rect x="${x * pixel}" y="${y * pixel}" width="${pixel}" height="${pixel}" fill="${fill}"/>`;
    }
  }
  const viewBox = `0 0 ${art.width * pixel} ${art.height * pixel}`;
  const label = role ? role : "pixel-art";
  return renderTemplate`${maybeRenderHead()}<svg class="pixel-sprite"${addAttribute(art.width * pixel, "width")}${addAttribute(art.height * pixel, "height")}${addAttribute(viewBox, "viewBox")} shape-rendering="crispEdges" role="img"${addAttribute(label, "aria-label")} aria-hidden="true" data-astro-cid-mctjt6dg> <title>${label}</title> <g data-astro-cid-mctjt6dg>${unescapeHTML(cells)}</g> </svg> `;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/mascot/PixelSprite.astro", void 0);

const $$Astro = createAstro("https://example.com");
const $$Mascot = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Mascot;
  const { role, theme = "gray", character, pixel = 8 } = Astro2.props;
  const set = CHARACTERS[THEME_TO_CHARACTER[theme] ?? "gray"];
  const label = character ?? set.name;
  const art = role === "boy" ? set.boy : set.furry;
  const preset = getTheme(theme);
  const palette = paletteFor(preset.mascot);
  return renderTemplate`${renderComponent($$result, "PixelSprite", $$PixelSprite, { "art": art, "palette": palette, "pixel": pixel, "role": label })}`;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/components/mascot/Mascot.astro", void 0);

export { $$Mascot as $, $$PixelSprite as a };
