const PREFS_KEY = "enlab:prefs";
function wallpaperCss(value) {
  if (value.startsWith("gradient:")) return value.slice("gradient:".length);
  if (value.startsWith("url:")) return `url(${value.slice("url:".length)})`;
  return value;
}
function isThemeId(value) {
  return value === "gray" || value === "yellow" || value === "purple" || value === "white";
}

const id$3 = "gray";
const name$3 = "灰糖";
const description$3 = "冷静、软糯的灰色调,像雨后云层一样温柔";
const mascot$3 = {"primary":"#5C677D","secondary":"#9AA5B5"};
const wallpaper$3 = {"light":"gradient:linear-gradient(180deg, #F7F8FA 0%, #F1F3F6 60%, #E8EBEF 100%)","dark":"gradient:linear-gradient(180deg, #17191E 0%, #121419 55%, #0D0F13 100%)"};
const palette$3 = {"light":{"bg":"#F4F5F7","surface":"#FFFFFF","elevated":"#FCFCFD","fg":"#2B2E35","fg-muted":"#5C6170","fg-subtle":"#8A8F9E","border":"#E3E5EA","border-strong":"#C9CDD6","primary":"#5C677D","primary-soft":"#EAEDF2","primary-fg":"#FFFFFF","accent":"#9AA5B5","accent-soft":"#F0F2F6","accent-fg":"#2B2E35","wallpaper-overlay":"rgba(250, 251, 252, 0.82)","shadow":"0 8px 24px rgba(43, 46, 53, 0.08)"},"dark":{"bg":"#15171C","surface":"#1E2128","elevated":"#262A33","fg":"#E2E4EA","fg-muted":"#A2A7B3","fg-subtle":"#6E7380","border":"#2C303A","border-strong":"#3D424E","primary":"#93A3BC","primary-soft":"#2A3140","primary-fg":"#15171C","accent":"#7C8CA3","accent-soft":"#242B38","accent-fg":"#E2E4EA","wallpaper-overlay":"rgba(21, 23, 28, 0.78)","shadow":"0 8px 24px rgba(0, 0, 0, 0.35)"}};
const gray = {
  id: id$3,
  name: name$3,
  description: description$3,
  mascot: mascot$3,
  wallpaper: wallpaper$3,
  palette: palette$3,
};

const id$2 = "yellow";
const name$2 = "蜜糖";
const description$2 = "温暖、元气的蜂蜜色,晒过太阳的甜味";
const mascot$2 = {"primary":"#E59B2E","secondary":"#C97B2D"};
const wallpaper$2 = {"light":"gradient:linear-gradient(180deg, #FFFBEF 0%, #FFF5DC 55%, #F9EBC4 100%)","dark":"gradient:linear-gradient(180deg, #221A10 0%, #1B140C 55%, #140E08 100%)"};
const palette$2 = {"light":{"bg":"#FFF9EC","surface":"#FFFFFF","elevated":"#FFFEF9","fg":"#3A2E1C","fg-muted":"#7A6A4D","fg-subtle":"#A8977A","border":"#F0E5CE","border-strong":"#DCCBA8","primary":"#E59B2E","primary-soft":"#FCF0DC","primary-fg":"#3A2E1C","accent":"#C97B2D","accent-soft":"#F8E9D8","accent-fg":"#3A2E1C","wallpaper-overlay":"rgba(255, 251, 241, 0.82)","shadow":"0 8px 24px rgba(122, 106, 77, 0.10)"},"dark":{"bg":"#1B1510","surface":"#261E14","elevated":"#312718","fg":"#F2E6CE","fg-muted":"#C2B194","fg-subtle":"#8A7C63","border":"#3A2E1E","border-strong":"#52422B","primary":"#F0B65A","primary-soft":"#3A2C18","primary-fg":"#1B1510","accent":"#D99A52","accent-soft":"#35281A","accent-fg":"#F2E6CE","wallpaper-overlay":"rgba(27, 21, 16, 0.78)","shadow":"0 8px 24px rgba(0, 0, 0, 0.4)"}};
const yellow = {
  id: id$2,
  name: name$2,
  description: description$2,
  mascot: mascot$2,
  wallpaper: wallpaper$2,
  palette: palette$2,
};

const id$1 = "purple";
const name$1 = "葡萄";
const description$1 = "梦幻、神秘的薰衣草紫,像星空下的葡萄园";
const mascot$1 = {"primary":"#8B5CF6","secondary":"#C084FC"};
const wallpaper$1 = {"light":"gradient:linear-gradient(180deg, #F9F5FD 0%, #F1E7FB 55%, #E6D8F5 100%)","dark":"gradient:linear-gradient(180deg, #1A1526 0%, #151120 55%, #100C19 100%)"};
const palette$1 = {"light":{"bg":"#F7F2FC","surface":"#FFFFFF","elevated":"#FCFAFE","fg":"#332B42","fg-muted":"#6E6284","fg-subtle":"#9A8FB0","border":"#E9E0F3","border-strong":"#D2C2E5","primary":"#8B5CF6","primary-soft":"#F0E8FD","primary-fg":"#FFFFFF","accent":"#C084FC","accent-soft":"#F7EFFE","accent-fg":"#332B42","wallpaper-overlay":"rgba(251, 248, 254, 0.84)","shadow":"0 8px 24px rgba(110, 98, 132, 0.12)"},"dark":{"bg":"#171320","surface":"#211A2E","elevated":"#2A2139","fg":"#E8E1F5","fg-muted":"#B4A8CA","fg-subtle":"#7E7393","border":"#332A44","border-strong":"#463A5C","primary":"#A78BFA","primary-soft":"#2D2147","primary-fg":"#171320","accent":"#8B5CF6","accent-soft":"#2A1E3E","accent-fg":"#E8E1F5","wallpaper-overlay":"rgba(23, 19, 32, 0.8)","shadow":"0 8px 24px rgba(0, 0, 0, 0.42)"}};
const purple = {
  id: id$1,
  name: name$1,
  description: description$1,
  mascot: mascot$1,
  wallpaper: wallpaper$1,
  palette: palette$1,
};

const id = "white";
const name = "棉花糖";
const description = "纯净、清冽的雪白色,像踩进刚落的初雪";
const mascot = {"primary":"#8FA3B8","secondary":"#C9D4E0"};
const wallpaper = {"light":"gradient:linear-gradient(180deg, #FFFFFF 0%, #F9F9F7 55%, #F2F2EF 100%)","dark":"gradient:linear-gradient(180deg, #101827 0%, #0D1421 55%, #0A101B 100%)"};
const palette = {"light":{"bg":"#FFFFFF","surface":"#FAFAF8","elevated":"#F5F5F2","fg":"#2F2F2E","fg-muted":"#6B6B68","fg-subtle":"#9B9B97","border":"#ECECEA","border-strong":"#D6D6D2","primary":"#8FA3B8","primary-soft":"#EFF3F7","primary-fg":"#FFFFFF","accent":"#C9D4E0","accent-soft":"#F2F5F8","accent-fg":"#2F2F2E","wallpaper-overlay":"rgba(255, 255, 255, 0.78)","shadow":"0 8px 24px rgba(47, 47, 46, 0.07)"},"dark":{"bg":"#0E1420","surface":"#182032","elevated":"#1F2A40","fg":"#DCE4F2","fg-muted":"#A3B1C8","fg-subtle":"#72809A","border":"#232D42","border-strong":"#33405A","primary":"#9CC0EE","primary-soft":"#1C2A44","primary-fg":"#0E1420","accent":"#7BA7DC","accent-soft":"#1B2940","accent-fg":"#DCE4F2","wallpaper-overlay":"rgba(14, 20, 32, 0.8)","shadow":"0 8px 24px rgba(0, 0, 0, 0.45)"}};
const white = {
  id,
  name,
  description,
  mascot,
  wallpaper,
  palette,
};

const themes = [gray, yellow, purple, white];
const DEFAULT_THEME = "gray";
function getTheme(id) {
  return themes.find((t) => t.id === (isThemeId(id) ? id : DEFAULT_THEME)) ?? themes[0];
}

export { PREFS_KEY as P, getTheme as g, themes as t, wallpaperCss as w };
