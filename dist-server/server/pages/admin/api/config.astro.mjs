import { i as isServer } from '../../../chunks/utils_CtBiJGkK.mjs';
import { s as siteConfigSchema, i as invalidateSiteConfig } from '../../../chunks/config_C3U3sL-u.mjs';
import { s as settingSet } from '../../../chunks/db_CHiP_YOX.mjs';
export { renderers } from '../../../renderers.mjs';

const CONFIG_KEY = "site_config";
function saveSiteConfig(config) {
  const parsed = siteConfigSchema.parse(config);
  settingSet(CONFIG_KEY, JSON.stringify(parsed));
}

const prerender = !isServer;
const PUT = async ({ request }) => {
  if (!isServer) return new Response(JSON.stringify({ error: "不可用" }), { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body) return new Response(JSON.stringify({ error: "请求体无效" }), { status: 400 });
  try {
    const config = siteConfigSchema.parse(body);
    saveSiteConfig(config);
    invalidateSiteConfig();
    return new Response(JSON.stringify({ ok: true }));
  } catch (e) {
    return new Response(
      JSON.stringify({ error: `配置校验失败:${e.message}` }),
      { status: 422 }
    );
  }
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
