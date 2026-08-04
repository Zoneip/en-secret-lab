import { i as isServer } from '../../../chunks/utils_CtBiJGkK.mjs';
import { s as saveUpload } from '../../../chunks/assets_HQu2MOD5.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = !isServer;
const POST = async ({ request }) => {
  if (!isServer) return new Response(JSON.stringify({ error: "不可用" }), { status: 404 });
  try {
    const form = await request.formData();
    const kind = String(form.get("kind") ?? "misc");
    const themeId = form.get("themeId") ? String(form.get("themeId")) : null;
    const fileEntry = form.get("file");
    if (!(fileEntry instanceof File)) {
      return new Response(JSON.stringify({ error: "缺少文件" }), { status: 400 });
    }
    const asset = saveUpload(kind, themeId, {
      name: fileEntry.name,
      type: fileEntry.type,
      data: new Uint8Array(await fileEntry.arrayBuffer())
    });
    return new Response(JSON.stringify({ ok: true, asset }));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400 });
  }
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
