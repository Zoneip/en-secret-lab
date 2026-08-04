import { i as isServer } from '../../../chunks/utils_CtBiJGkK.mjs';
import { g as getAbout, l as listOcs, a as listColumns, s as saveColumn, b as saveOc, c as saveAbout } from '../../../chunks/content-store_BGpuCi2c.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = !isServer;
const THEMES = ["gray", "yellow", "purple", "white"];
function validTheme(v) {
  return typeof v === "string" && THEMES.includes(v);
}
const GET = () => {
  if (!isServer) return new Response(JSON.stringify({ error: "不可用" }), { status: 404 });
  return new Response(
    JSON.stringify({ columns: listColumns(), ocs: listOcs(), about: getAbout() }),
    { headers: { "Content-Type": "application/json" } }
  );
};
const PUT = async ({ request }) => {
  if (!isServer) return new Response(JSON.stringify({ error: "不可用" }), { status: 404 });
  const body = await request.json().catch(() => null);
  if (!body) return new Response(JSON.stringify({ error: "请求体无效" }), { status: 400 });
  try {
    if (body.columns) {
      for (const [id, data] of Object.entries(body.columns)) {
        if (!validTheme(data.theme) || !data.title?.trim() || !data.category?.trim()) {
          throw new Error(`栏目「${id}」缺少必填字段或主题无效`);
        }
        saveColumn(id, {
          title: data.title.trim(),
          subtitle: (data.subtitle ?? "").trim(),
          description: (data.description ?? "").trim(),
          theme: data.theme,
          category: data.category.trim()
        });
      }
    }
    if (body.ocs) {
      for (const [id, data] of Object.entries(body.ocs)) {
        if (!validTheme(data.theme) || !data.name?.trim()) {
          throw new Error(`角色「${id}」缺少必填字段或主题无效`);
        }
        saveOc(id, {
          name: data.name.trim(),
          theme: data.theme,
          subtitle: (data.subtitle ?? "").trim(),
          description: (data.description ?? "").trim(),
          traits: Array.isArray(data.traits) ? data.traits.map((t) => String(t).trim()).filter(Boolean) : [],
          quote: data.quote?.trim() || void 0,
          art: data.art?.trim() || void 0
        });
      }
    }
    if (body.about) {
      if (!body.about.nickname?.trim()) throw new Error("关于页缺少昵称");
      saveAbout({
        nickname: body.about.nickname.trim(),
        tagline: (body.about.tagline ?? "").trim(),
        avatar: body.about.avatar?.trim() || void 0,
        intro: Array.isArray(body.about.intro) ? body.about.intro.map((l) => String(l).trim()).filter(Boolean) : [],
        links: Array.isArray(body.about.links) ? body.about.links.filter((l) => l?.label && l?.url).map((l) => ({ label: String(l.label).trim(), url: String(l.url).trim() })) : []
      });
    }
    return new Response(JSON.stringify({ ok: true }));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 422 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  PUT,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
