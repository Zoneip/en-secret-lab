import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync, statSync } from 'node:fs';
import { extname, join, dirname } from 'node:path';
import { l as loadEnv, g as getDb } from './db_CHiP_YOX.mjs';

const MIME_BY_EXT = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".otf": "font/otf"
};
function saveUpload(kind, themeId, file) {
  const env = loadEnv(process.env);
  const ext = extname(file.name).toLowerCase();
  if (!MIME_BY_EXT[ext]) throw new Error(`不支持的文件类型:${ext}`);
  const id = randomUUID();
  const subDir = kind === "font" ? "fonts" : kind === "wallpaper" ? `themes/${themeId ?? "shared"}` : "misc";
  const safeName = file.name.replace(/[^\w.\-\u4e00-\u9fff]/g, "_");
  const dir = join(dirname(env.DATABASE_PATH), "uploads", subDir);
  mkdirSync(dir, { recursive: true });
  const path = `/uploads/${subDir}/${id}${ext}`;
  writeFileSync(join(dir, `${id}${ext}`), file.data);
  const asset = {
    id,
    kind,
    themeId,
    fileName: safeName,
    path,
    size: file.data.length,
    mime: MIME_BY_EXT[ext] ?? file.type,
    created_at: Date.now()
  };
  getDb().prepare(
    `INSERT INTO assets (id, kind, theme_id, file_name, path, size, mime, created_at)
       VALUES (@id, @kind, @themeId, @fileName, @path, @size, @mime, @createdAt)`
  ).run({ ...asset, createdAt: asset.created_at });
  return asset;
}
function listAssets(kind) {
  const rows = getDb().prepare("SELECT * FROM assets ORDER BY created_at DESC").all();
  return rows;
}
function assetFileOnDisk(path) {
  const env = loadEnv(process.env);
  const rel = path.replace(/^\/uploads\//, "");
  const file = join(dirname(env.DATABASE_PATH), "uploads", rel);
  try {
    if (statSync(file).isFile()) return file;
  } catch {
  }
  return null;
}

export { MIME_BY_EXT as M, assetFileOnDisk as a, listAssets as l, saveUpload as s };
