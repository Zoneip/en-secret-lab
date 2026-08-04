import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_DBXB66Ze.mjs';
import { manifest } from './manifest_CKLAOVPr.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/about.astro.mjs');
const _page3 = () => import('./pages/admin/api/assets.astro.mjs');
const _page4 = () => import('./pages/admin/api/config.astro.mjs');
const _page5 = () => import('./pages/admin/api/content.astro.mjs');
const _page6 = () => import('./pages/admin/api/login.astro.mjs');
const _page7 = () => import('./pages/admin/api/logout.astro.mjs');
const _page8 = () => import('./pages/admin/api/password.astro.mjs');
const _page9 = () => import('./pages/admin/api/posts/_slug_.astro.mjs');
const _page10 = () => import('./pages/admin/api/posts.astro.mjs');
const _page11 = () => import('./pages/admin/api/state.astro.mjs');
const _page12 = () => import('./pages/admin/assets.astro.mjs');
const _page13 = () => import('./pages/admin/content.astro.mjs');
const _page14 = () => import('./pages/admin/login.astro.mjs');
const _page15 = () => import('./pages/admin/posts/new.astro.mjs');
const _page16 = () => import('./pages/admin/posts/_slug_.astro.mjs');
const _page17 = () => import('./pages/admin/posts.astro.mjs');
const _page18 = () => import('./pages/admin/site.astro.mjs');
const _page19 = () => import('./pages/admin/themes.astro.mjs');
const _page20 = () => import('./pages/admin.astro.mjs');
const _page21 = () => import('./pages/api/search-index.json.astro.mjs');
const _page22 = () => import('./pages/blog/page/_page_.astro.mjs');
const _page23 = () => import('./pages/blog.astro.mjs');
const _page24 = () => import('./pages/blog/_---slug_.astro.mjs');
const _page25 = () => import('./pages/categories/_category_.astro.mjs');
const _page26 = () => import('./pages/categories.astro.mjs');
const _page27 = () => import('./pages/fantasy.astro.mjs');
const _page28 = () => import('./pages/friends.astro.mjs');
const _page29 = () => import('./pages/journal.astro.mjs');
const _page30 = () => import('./pages/knowledge.astro.mjs');
const _page31 = () => import('./pages/robots.txt.astro.mjs');
const _page32 = () => import('./pages/rss.xml.astro.mjs');
const _page33 = () => import('./pages/search.astro.mjs');
const _page34 = () => import('./pages/tags/_tag_.astro.mjs');
const _page35 = () => import('./pages/tags.astro.mjs');
const _page36 = () => import('./pages/thinking.astro.mjs');
const _page37 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/about.astro", _page2],
    ["src/pages/admin/api/assets.ts", _page3],
    ["src/pages/admin/api/config.ts", _page4],
    ["src/pages/admin/api/content.ts", _page5],
    ["src/pages/admin/api/login.ts", _page6],
    ["src/pages/admin/api/logout.ts", _page7],
    ["src/pages/admin/api/password.ts", _page8],
    ["src/pages/admin/api/posts/[slug].ts", _page9],
    ["src/pages/admin/api/posts.ts", _page10],
    ["src/pages/admin/api/state.ts", _page11],
    ["src/pages/admin/assets.astro", _page12],
    ["src/pages/admin/content.astro", _page13],
    ["src/pages/admin/login.astro", _page14],
    ["src/pages/admin/posts/new.astro", _page15],
    ["src/pages/admin/posts/[slug].astro", _page16],
    ["src/pages/admin/posts.astro", _page17],
    ["src/pages/admin/site.astro", _page18],
    ["src/pages/admin/themes.astro", _page19],
    ["src/pages/admin/index.astro", _page20],
    ["src/pages/api/search-index.json.ts", _page21],
    ["src/pages/blog/page/[page].astro", _page22],
    ["src/pages/blog/index.astro", _page23],
    ["src/pages/blog/[...slug].astro", _page24],
    ["src/pages/categories/[category].astro", _page25],
    ["src/pages/categories/index.astro", _page26],
    ["src/pages/fantasy.astro", _page27],
    ["src/pages/friends.astro", _page28],
    ["src/pages/journal.astro", _page29],
    ["src/pages/knowledge.astro", _page30],
    ["src/pages/robots.txt.ts", _page31],
    ["src/pages/rss.xml.ts", _page32],
    ["src/pages/search.astro", _page33],
    ["src/pages/tags/[tag].astro", _page34],
    ["src/pages/tags/index.astro", _page35],
    ["src/pages/thinking.astro", _page36],
    ["src/pages/index.astro", _page37]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///home/fwb/EN--%E7%9A%84%E7%A7%98%E5%AF%86%E5%AE%9E%E9%AA%8C%E5%AE%A4/dist-server/client/",
    "server": "file:///home/fwb/EN--%E7%9A%84%E7%A7%98%E5%AF%86%E5%AE%9E%E9%AA%8C%E5%AE%A4/dist-server/server/",
    "host": false,
    "port": 4321,
    "assets": "_astro",
    "experimentalStaticHeaders": false
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
