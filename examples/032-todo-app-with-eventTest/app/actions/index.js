// actions/index.js - minimal action registry (10 core ops)
// Each action is a pure function: (ctx, ...args) => any
// ctx: { store, get(path), set(path, value), event, el }

export function set(ctx, path, value){
  ctx.set(String(path), value);
}

export function inc(ctx, path, by = 1){
  const v = Number(ctx.get(String(path)) || 0);
  ctx.set(String(path), v + Number(by));
}

export function dec(ctx, path, by = 1){
  const v = Number(ctx.get(String(path)) || 0);
  ctx.set(String(path), v - Number(by));
}

export function toggle(ctx, path){
  const v = !!ctx.get(String(path));
  ctx.set(String(path), !v);
}

export function clamp(ctx, path, min, max){
  let v = Number(ctx.get(String(path)) || 0);
  if (min != null) v = Math.max(v, Number(min));
  if (max != null) v = Math.min(v, Number(max));
  ctx.set(String(path), v);
}

export function push(ctx, path, value){
  const arr = Array.isArray(ctx.get(String(path))) ? ctx.get(String(path)) : [];
  ctx.set(String(path), [...arr, value]);
}

export function pushFrom(ctx, toArrayPath, fromPath){
  const arr = Array.isArray(ctx.get(String(toArrayPath))) ? ctx.get(String(toArrayPath)) : [];
  const v = ctx.get(String(fromPath));
  ctx.set(String(toArrayPath), [...arr, v]);
}

export function pushFromIfNotEmpty(ctx, toArrayPath, fromPath){
  const arr = Array.isArray(ctx.get(String(toArrayPath))) ? ctx.get(String(toArrayPath)) : [];
  let v = ctx.get(String(fromPath));
  if (v == null) return;
  v = String(v).trim();
  if (v.length === 0) return;
  ctx.set(String(toArrayPath), [...arr, v]);
}

export function removeAt(ctx, path, index){
  const arr = Array.isArray(ctx.get(String(path))) ? ctx.get(String(path)) : [];
  const i = Number(index);
  if (i >= 0 && i < arr.length){
    const next = arr.slice(0, i).concat(arr.slice(i + 1));
    ctx.set(String(path), next);
  }
}

export function pop(ctx, path){
  const arr = Array.isArray(ctx.get(String(path))) ? ctx.get(String(path)) : [];
  if (arr.length === 0) return;
  ctx.set(String(path), arr.slice(0, -1));
}

export function sortBy(ctx, path, key){
  const arr = Array.isArray(ctx.get(String(path))) ? ctx.get(String(path)) : [];
  let next;
  if (key == null || key === ''){
    next = [...arr].sort();
  } else {
    next = [...arr].sort((a,b) => {
      const av = a?.[key]; const bv = b?.[key];
      if (av < bv) return -1; if (av > bv) return 1; return 0;
    });
  }
  ctx.set(String(path), next);
}

export function lengthTo(ctx, fromPath, toPath){
  const v = ctx.get(String(fromPath));
  const len = Array.isArray(v) || typeof v === 'string' ? v.length : (v && typeof v === 'object' ? Object.keys(v).length : 0);
  ctx.set(String(toPath), len);
}

export function setFrom(ctx, path, eventField){
  // eventField like 'target.value' or 'detail.value'
  let cur = ctx.event;
  for (const part of String(eventField).split('.')){
    if (cur == null) break;
    cur = cur[part];
  }
  ctx.set(String(path), cur);
}

export function fetchJson(ctx, url, toPath){
  // minimal fire-and-forget; caller can chain a separate set if desired
  fetch(String(url), { signal: ctx.event?.signal }).then(r => r.json()).then(data => {
    if (toPath) ctx.set(String(toPath), data);
  }).catch(() => {});
}

// Demo-only: mutate the global behaviors whitelist array (shared by installer)
export function guardWhitelist(ctx, ...patterns){
  const arr = (window && window.behaviorsWhitelist) || [];
  arr.splice(0, arr.length, ...patterns.map(String));
  try { ctx.set('ui.guard.whitelist', patterns.map(String)); } catch {}
}

export function clearWhitelist(){
  const arr = (window && window.behaviorsWhitelist) || [];
  arr.splice(0, arr.length);
  try { window.stateTrackerStore?.set?.('ui.guard.whitelist', []); } catch {}
}

export function resetWhitelist(){
  const def = (window && window.behaviorsWhitelistDefault) || [];
  const arr = (window && window.behaviorsWhitelist) || [];
  arr.splice(0, arr.length, ...def.map(String));
  try { window.stateTrackerStore?.set?.('ui.guard.whitelist', [...def]); } catch {}
}

export function mergeWhitelist(ctx, ...patterns){
  const arr = (window && window.behaviorsWhitelist) || [];
  const set = new Set(arr.map(String));
  patterns.map(String).forEach(p => set.add(p));
  const next = Array.from(set);
  arr.splice(0, arr.length, ...next);
  try { window.stateTrackerStore?.set?.('ui.guard.whitelist', [...next]); } catch {}
}

export function toggleTheme(ctx){
  try {
    const cur = ctx.get('ui.theme');
    const next = (cur === 'dark') ? 'light' : 'dark';
    ctx.set('ui.theme', next);
    console.log('[beh] theme ->', next);
  } catch {}
}

// Diagnostics
export function log(ctx, ...args){
  try { console.log('[beh]', ...args); } catch {}
}

export function logPath(ctx, path){
  try { console.log('[beh]', String(path), ctx.get(String(path))); } catch {}
}

export const registry = {
  set, inc, dec, toggle, clamp, push, pushFrom, pushFromIfNotEmpty, removeAt, pop, sortBy, setFrom, fetchJson, lengthTo,
  guardWhitelist, clearWhitelist, resetWhitelist, mergeWhitelist, toggleTheme, log, logPath,
};
