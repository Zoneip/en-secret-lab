import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { e as defineMiddleware, s as sequence } from './chunks/render-context_GIbJ0OMz.mjs';
import { i as isServer } from './chunks/utils_CtBiJGkK.mjs';
import { S as SESSION_COOKIE, i as isAuthed } from './chunks/auth_BDJs2_rs.mjs';
import { a as assetFileOnDisk, M as MIME_BY_EXT } from './chunks/assets_HQu2MOD5.mjs';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_Cn-slpRJ.mjs';
import 'piccolore';
import './chunks/astro/server_CcxDCTKC.mjs';
import 'clsx';

const PUBLIC_ADMIN = /* @__PURE__ */ new Set(["/admin/login", "/admin/api/login", "/admin/api/logout"]);
const FORM_LIKE = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"];
const MUTATING = ["POST", "PUT", "PATCH", "DELETE"];
function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).hostname === new URL(request.url).hostname;
  } catch {
    return false;
  }
}
const onRequest$1 = defineMiddleware(async (context, next) => {
  if (!isServer) return next();
  const url = new URL(context.request.url);
  if (MUTATING.includes(context.request.method)) {
    const ct = context.request.headers.get("content-type")?.toLowerCase() ?? "";
    if (FORM_LIKE.some((t) => ct.includes(t)) && !isSameOrigin(context.request)) {
      return new Response("Cross-site POST form submissions are forbidden", { status: 403 });
    }
  }
  if (url.pathname.startsWith("/uploads/")) {
    const file = assetFileOnDisk(url.pathname);
    if (!file) return new Response("Not Found", { status: 404 });
    const ext = extname(file);
    const mime = MIME_BY_EXT[ext] ?? "application/octet-stream";
    const body = readFileSync(file);
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  }
  if (url.pathname.startsWith("/admin") && !PUBLIC_ADMIN.has(url.pathname)) {
    const token = context.cookies.get(SESSION_COOKIE)?.value;
    const authed = isAuthed(token);
    const isApi = url.pathname.startsWith("/admin/api");
    if (isApi) {
      if (!authed) {
        return new Response(JSON.stringify({ error: "未登录" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    } else if (!authed) {
      return context.redirect("/admin/login", 302);
    }
  }
  const response = await next();
  if (!response.headers.has("X-Content-Type-Options")) {
    response.headers.set("X-Content-Type-Options", "nosniff");
  }
  if (!response.headers.has("X-Frame-Options")) {
    response.headers.set("X-Frame-Options", "DENY");
  }
  if (!response.headers.has("Referrer-Policy")) {
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }
  return response;
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
