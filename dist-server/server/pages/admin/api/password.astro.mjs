import { i as isServer } from '../../../chunks/utils_CtBiJGkK.mjs';
import { a as changePassword } from '../../../chunks/auth_BDJs2_rs.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = !isServer;
const PUT = async ({ request }) => {
  if (!isServer) return new Response(JSON.stringify({ error: "不可用" }), { status: 404 });
  const body = await request.json().catch(() => null);
  const password = body?.password ?? "";
  if (password.length < 6) {
    return new Response(JSON.stringify({ error: "密码至少 6 位" }), { status: 400 });
  }
  const ok = changePassword(password);
  if (!ok) return new Response(JSON.stringify({ error: "密码更新失败" }), { status: 500 });
  return new Response(JSON.stringify({ ok: true }));
};
const GET = () => new Response(null, { status: 404 });

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  PUT,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
