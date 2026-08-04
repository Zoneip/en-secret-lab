export { renderers } from '../renderers.mjs';

const GET = ({ site }) => {
  const base = (site ?? new URL(undefined                        )).origin;
  const sitemap = `${base}/sitemap-index.xml`;
  const robots = ["User-agent: *", "Allow: /", "Disallow: /admin/", `Sitemap: ${sitemap}`].join("\n");
  return new Response(robots, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
