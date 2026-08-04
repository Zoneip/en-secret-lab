import { l as loadEnv } from '../../../chunks/db_CHiP_YOX.mjs';
import { i as isServer } from '../../../chunks/utils_CtBiJGkK.mjs';
import { e as ensureAdminPassword, v as verifyPassword, c as createSession, S as SESSION_COOKIE } from '../../../chunks/auth_BDJs2_rs.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = !isServer;
const POST = async ({ request, cookies }) => {
  if (!isServer) return new Response(JSON.stringify({ error: "不可用" }), { status: 404 });
  ensureAdminPassword();
  const body = await request.json().catch(() => null);
  const env = loadEnv(process.env);
  if (!body?.username || !body.password) {
    return new Response(JSON.stringify({ error: "用户名和密码不能为空" }), { status: 400 });
  }
  if (body.username !== env.ADMIN_USERNAME || !verifyPassword(body.password)) {
    return new Response(JSON.stringify({ error: "用户名或密码错误" }), { status: 401 });
  }
  const token = createSession();
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    // 生产由反代处理 HTTPS
    path: "/",
    maxAge: 30 * 24 * 3600
  });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
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
