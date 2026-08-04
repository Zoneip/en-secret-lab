import { i as isServer } from '../../chunks/utils_CtBiJGkK.mjs';
import { g as getAllPosts, f as fsReadPost } from '../../chunks/data_DmO6YxUu.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = !isServer;
const GET = async () => {
  if (!isServer) return new Response("Not Found", { status: 404 });
  const posts = await getAllPosts();
  const index = await Promise.all(
    posts.map(async (p) => {
      const full = await fsReadPost(p.slug);
      return {
        slug: p.slug,
        title: p.title,
        description: p.description ?? "",
        tags: p.tags,
        pubDate: p.pubDate.toISOString(),
        body: full?.body ?? ""
      };
    })
  );
  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
