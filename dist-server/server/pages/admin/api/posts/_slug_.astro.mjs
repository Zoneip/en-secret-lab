import { i as isServer } from '../../../../chunks/utils_CtBiJGkK.mjs';
import { d as deletePost, g as getPost, s as savePost } from '../../../../chunks/posts-store_DhDx5TWr.mjs';
export { renderers } from '../../../../renderers.mjs';

const prerender = !isServer;
function getStaticPaths() {
  return [];
}
const GET = ({ params }) => {
  if (!isServer) return new Response(JSON.stringify({ error: "不可用" }), { status: 404 });
  const post = getPost(params.slug ?? "");
  if (!post) return new Response(JSON.stringify({ error: "文章不存在" }), { status: 404 });
  return new Response(JSON.stringify({ ok: true, ...post }), {
    headers: { "Content-Type": "application/json" }
  });
};
const PUT = async ({ params, request }) => {
  if (!isServer) return new Response(JSON.stringify({ error: "不可用" }), { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body) return new Response(JSON.stringify({ error: "请求体无效" }), { status: 400 });
  try {
    const target = body.slug ?? params.slug ?? "";
    if (target !== params.slug && getPost(target)) {
      return new Response(JSON.stringify({ error: `slug「${target}」已被占用` }), { status: 422 });
    }
    const existing = getPost(params.slug ?? "");
    if (!existing) return new Response(JSON.stringify({ error: "文章不存在" }), { status: 404 });
    if (target !== params.slug) deletePost(params.slug);
    const merged = {
      ...existing.draft,
      ...body,
      slug: target
    };
    const saved = savePost(merged);
    return new Response(JSON.stringify({ ok: true, post: saved }));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 422 });
  }
};
const DELETE = ({ params }) => {
  if (!isServer) return new Response(JSON.stringify({ error: "不可用" }), { status: 404 });
  const ok = deletePost(params.slug ?? "");
  if (!ok) return new Response(JSON.stringify({ error: "文章不存在" }), { status: 404 });
  return new Response(JSON.stringify({ ok: true }));
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PUT,
  getStaticPaths,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
