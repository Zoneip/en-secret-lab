import { c as createComponent, e as renderHead, b as renderScript, a as renderTemplate } from '../../chunks/astro/server_CcxDCTKC.mjs';
import 'piccolore';
import 'clsx';
import { i as isServer } from '../../chunks/utils_CtBiJGkK.mjs';
import { e as ensureAdminPassword } from '../../chunks/auth_BDJs2_rs.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const prerender = !isServer;
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  if (isServer) ensureAdminPassword();
  return renderTemplate`<html lang="zh-CN"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>登录 · 控制台</title><link rel="icon" href="/favicon.svg" type="image/svg+xml">${renderHead()}</head> <body> <form class="login-card" data-login-form> <p class="login-title">EN 的秘密实验室</p> <p class="login-sub">站长控制台</p> <div class="field"> <input type="text" name="username" placeholder="用户名" autocomplete="username" required> </div> <div class="field"> <input type="password" name="password" placeholder="密码" autocomplete="current-password" required> </div> <button class="submit" type="submit">登 录</button> <p class="error" data-error></p> </form> ${renderScript($$result, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/admin/login.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/home/fwb/EN--\u7684\u79D8\u5BC6\u5B9E\u9A8C\u5BA4/src/pages/admin/login.astro", void 0);

const $$file = "/home/fwb/EN--的秘密实验室/src/pages/admin/login.astro";
const $$url = "/admin/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
