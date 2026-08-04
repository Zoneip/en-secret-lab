const isServer = process.env.ASTRO_MODE === "server";
function formatDate(date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}
function readingTime(text) {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const latin = (text.match(/[a-zA-Z0-9]+/g) ?? []).length;
  return Math.max(1, Math.ceil(cjk / 300 + latin / 200));
}
function absoluteUrl(siteUrl, path) {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(path, siteUrl.replace(/\/$/, "") + "/").toString();
}

export { absoluteUrl as a, formatDate as f, isServer as i, readingTime as r };
