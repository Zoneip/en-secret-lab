import { getCollection } from './_astro_content_Dt6JQA9-.mjs';
import { i as isServer } from './utils_CtBiJGkK.mjs';
import { g as getAbout, l as listOcs, a as listColumns } from './content-store_BGpuCi2c.mjs';

async function getSiteColumns() {
  if (isServer) return listColumns();
  const cols = await getCollection("columns");
  return cols.map((c) => ({ id: c.id, ...c.data }));
}
async function getSiteOcs() {
  if (isServer) return listOcs();
  const ocs = await getCollection("ocs");
  return ocs.map((o) => ({ id: o.id, ...o.data }));
}
async function getSiteAbout() {
  if (isServer) return getAbout();
  const [about] = await getCollection("about");
  return about ? { ...about.data } : null;
}

export { getSiteOcs as a, getSiteColumns as b, getSiteAbout as g };
