import { randomBytes, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { a as settingGet, l as loadEnv, s as settingSet, b as sessionCreate, c as sessionDestroy, g as getDb, d as sessionValid } from './db_CHiP_YOX.mjs';

const SESSION_COOKIE = "enlab_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1e3;
const PASSWORD_KEY = "admin_password_hash";
function hashPassword(plain) {
  return bcrypt.hashSync(plain, 10);
}
function ensureAdminPassword() {
  if (settingGet(PASSWORD_KEY)) return;
  const env = loadEnv(process.env);
  if (env.ADMIN_PASSWORD === "change-me") {
    console.warn("[admin] ADMIN_PASSWORD 仍是默认值,请立即修改!");
  }
  settingSet(PASSWORD_KEY, hashPassword(env.ADMIN_PASSWORD));
}
function verifyPassword(plain) {
  const hash = settingGet(PASSWORD_KEY);
  if (!hash) return false;
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
}
function changePassword(plain) {
  if (plain.length < 6) return false;
  settingSet(PASSWORD_KEY, hashPassword(plain));
  return true;
}
function createSession() {
  const token = randomBytes(32).toString("hex");
  sessionCreate(token, SESSION_TTL_MS);
  return token;
}
function destroySession(token) {
  sessionDestroy(token);
}
function isAuthed(token) {
  if (!token) return false;
  const sessions = getDb().prepare("SELECT token FROM sessions").all();
  const target = Buffer.from(token);
  for (const s of sessions) {
    if (s.token.length === target.length && timingSafeEqual(Buffer.from(s.token), target)) {
      return sessionValid(s.token);
    }
  }
  return false;
}

export { SESSION_COOKIE as S, changePassword as a, createSession as c, destroySession as d, ensureAdminPassword as e, isAuthed as i, verifyPassword as v };
