import { i as isServer } from '../../../chunks/utils_CtBiJGkK.mjs';
import { l as listPosts, s as savePost } from '../../../chunks/posts-store_DhDx5TWr.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = !isServer;
const GET = () => {
  if (!isServer) return new Response(JSON.stringify({ error: "不可用" }), { status: 404 });
  const posts = listPosts();
  return new Response(
    JSON.stringify({
      posts: posts.map((post) => ({
        ...post.draft,
        slug: post.slug,
        fileName: post.fileName,
        body: void 0
      }))
    }),
    { headers: { "Content-Type": "application/json" } }
  );
};
const POST = async ({ request }) => {
  if (!isServer) return new Response(JSON.stringify({ error: "不可用" }), { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body) return new Response(JSON.stringify({ error: "请求体无效" }), { status: 400 });
  try {
    const saved = savePost(body);
    return new Response(JSON.stringify({ ok: true, post: saved }));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 422 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
