/** 访客偏好(L3):localStorage 读写,客户端专用 */
import { PREFS_KEY, type ThemePrefs, type ThemeId, type ColorMode } from './engine'

export const DEFAULT_PREFS: ThemePrefs = { themeLocked: false, mode: 'system' }

export function readPrefs(storage: Storage): ThemePrefs {
  try {
    const raw = storage.getItem(PREFS_KEY)
    if (!raw) return DEFAULT_PREFS
    const parsed = JSON.parse(raw) as Partial<ThemePrefs>
    return {
      theme: parsed.theme,
      themeLocked: parsed.themeLocked ?? false,
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

/** 构建防 FOUC 内联脚本;深浅模式各有默认主题,手动锁定主题则保持 */
export function bootScript(lightDefault: string, darkDefault: string): string {
  return `(function(){
  var K='${PREFS_KEY}';
  var m='${DEFAULT_PREFS.mode}';
  var ft=document.documentElement.dataset.forceTheme;
  var p=null;
  try{p=JSON.parse(localStorage.getItem(K)||'null');}catch(e){}
  if(p&&p.mode)m=p.mode;
  var dark=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
  var mode=dark?'dark':'light';
  var t;
  if(ft){t=ft;}
  else if(p&&p.themeLocked&&p.theme){t=p.theme;}
  else{t=mode==='dark'?'${darkDefault}':'${lightDefault}';}
  // 随机主题解析
  if(t==='random'){var pool=['gray','yellow','purple','white'];t=pool[Math.floor(Math.random()*pool.length)];}
  document.documentElement.dataset.theme=t;
  document.documentElement.dataset.mode=mode;
  document.documentElement.dataset.modePref=m;
  document.documentElement.dataset.themeLocked=String(!!(ft||(p&&p.themeLocked)));
})();`
}

export type { ThemeId, ColorMode }
