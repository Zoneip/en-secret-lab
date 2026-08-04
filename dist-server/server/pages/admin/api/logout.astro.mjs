import { i as isServer } from '../../../chunks/utils_CtBiJGkK.mjs';
import { S as SESSION_COOKIE, d as destroySession } from '../../../chunks/auth_BDJs2_rs.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = !isServer;
const POST = async ({ cookies }) => {
  if (!isServer) return new Response(JSON.stringify({ ok: false }), { status: 404 });
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (token) destroySession(token);
  cookies.delete(SESSION_COOKIE, { path: "/" });
  return new Response(JSON.stringify({ ok: true }));
};
const GET = () => new Response(null, { status: 404 });

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
