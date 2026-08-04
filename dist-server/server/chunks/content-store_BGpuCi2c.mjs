import { existsSync, readFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';

const contentRoot = () => process.env.CONTENT_DIR ?? join(process.cwd(), "src", "content");
const columnsDir = () => join(contentRoot(), "columns");
const ocsDir = () => join(contentRoot(), "ocs");
const aboutFile = () => join(contentRoot(), "about", "me.json");
function listColumns() {
  mkdirSync(columnsDir(), { recursive: true });
  const files = readdirSync(columnsDir()).filter((f) => f.endsWith(".yaml"));
  return files.map((f) => {
    try {
      const raw = parse(readFileSync(join(columnsDir(), f), "utf8"));
      return { id: f.replace(/\.yaml$/, ""), ...raw };
    } catch {
      return null;
    }
  }).filter((c) => c !== null);
}
function saveColumn(id, data) {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error("栏目 id 仅允许小写字母、数字与连字符");
  mkdirSync(columnsDir(), { recursive: true });
  writeFileSync(join(columnsDir(), `${id}.yaml`), stringify(data));
  return { id, ...data };
}
function listOcs() {
  mkdirSync(ocsDir(), { recursive: true });
  const files = readdirSync(ocsDir()).filter((f) => f.endsWith(".yaml"));
  return files.map((f) => {
    try {
      const raw = parse(readFileSync(join(ocsDir(), f), "utf8"));
      return { id: f.replace(/\.yaml$/, ""), traits: [], ...raw };
    } catch {
      return null;
    }
  }).filter((o) => o !== null);
}
function saveOc(id, data) {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error("角色 id 仅允许小写字母、数字与连字符");
  mkdirSync(ocsDir(), { recursive: true });
  writeFileSync(join(ocsDir(), `${id}.yaml`), stringify(data));
  return { id, ...data };
}
function getAbout() {
  if (!existsSync(aboutFile())) return null;
  try {
    return JSON.parse(readFileSync(aboutFile(), "utf8"));
  } catch {
    return null;
  }
}
function saveAbout(data) {
  mkdirSync(join(contentRoot(), "about"), { recursive: true });
  writeFileSync(aboutFile(), JSON.stringify(data, null, 2) + "\n");
}

export { listColumns as a, saveOc as b, saveAbout as c, getAbout as g, listOcs as l, saveColumn as s };
