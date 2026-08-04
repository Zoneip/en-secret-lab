/** 访客偏好(L3):localStorage 读写,客户端专用 */
import { PREFS_KEY, type ThemePrefs, type ThemeId, type ColorMode } from './engine'

export const DEFAULT_PREFS: ThemePrefs = { theme: 'gray', mode: 'system' }

export function readPrefs(storage: Storage): ThemePrefs {
  try {
    const raw = storage.getItem(PREFS_KEY)
    if (!raw) return DEFAULT_PREFS
    const parsed = JSON.parse(raw) as Partial<ThemePrefs>
    return {
      theme: parsed.theme === undefined ? DEFAULT_PREFS.theme : parsed.theme,
      mode: parsed.mode === undefined ? DEFAULT_PREFS.mode : parsed.mode,
    }
  } catch {
    return DEFAULT_PREFS
  }
}

export function writePrefs(storage: Storage, prefs: ThemePrefs): void {
  storage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

/** 解析模式:system → 跟随操作系统 */
export function resolveMode(mode: ColorMode | 'system', systemDark: boolean): ColorMode {
  return mode === 'system' ? (systemDark ? 'dark' : 'light') : mode
}

/** 构建防 FOUC 内联脚本(在首帧渲染前执行);data-force-theme 存在时锁定该主题(栏目页) */
export function bootScript(): string {
  return `(function(){
  var K='${PREFS_KEY}';
  var t='${DEFAULT_PREFS.theme}', m='${DEFAULT_PREFS.mode}';
  var ft=document.documentElement.dataset.forceTheme;
  if(ft){t=ft;m='light';}
  try{var p=JSON.parse(localStorage.getItem(K)||'null'); if(p){if(!ft&&p.theme)t=p.theme; if(p.mode)m=p.mode;}}catch(e){}
  var dark=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme=t;
  document.documentElement.dataset.mode=dark?'dark':'light';
  document.documentElement.dataset.modePref=m;
})();`
}

export type { ThemeId, ColorMode }
