// forms/computed.js — explicit-deps computed helper for eventState-like stores
// Requirements for store: get(path), set(path, value), subscribe(path, handler)
// Features: explicit deps, loop-avoidance, optional debounce, optional memo by dep tuple, optional gatePath, immediate compute

import { withBatch } from '../extensions/hydrate.js';

function tupleKey(vals) {
  // Simple, deterministic key for small tuples
  try { return JSON.stringify(vals); } catch { return String(vals); }
}

/**
 * Register a computed field derived from explicit dependencies.
 * @param {any} store
 * @param {string} targetPath
 * @param {string[]} deps
 * @param {(get:(p:string)=>any)=>any} fn
 * @param {{ debounce?: number, memo?: boolean, immediate?: boolean, gatePath?: string }} options
 * @returns {() => void} unsubscribe function
 */
export function computed(store, targetPath, deps, fn, options = {}) {
  const { debounce = 0, memo = false, immediate = true, gatePath } = options;
  let timer = null;
  let lastKey = undefined;
  let destroyed = false;

  const get = (p) => store.get(p);

  const doCompute = () => {
    if (destroyed) return;
    if (gatePath) {
      const gateVal = store.get(gatePath);
      if (!gateVal) return; // gate closed
    }
    const depVals = deps.map((d) => store.get(d));
    if (memo) {
      const k = tupleKey(depVals);
      if (k === lastKey) return;
      lastKey = k;
    }
    const nextVal = fn(get);
    // Loop avoidance: only write if value actually changed (best-effort)
    const prev = store.get(targetPath);
    if (prev !== nextVal) {
      withBatch(store, () => {
        store.set(targetPath, nextVal);
      });
    }
  };

  const schedule = () => {
    if (debounce > 0) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(doCompute, debounce);
    } else {
      doCompute();
    }
  };

  const unsubs = deps.map((d) => store.subscribe(d, () => schedule()));
  // Ignore self-updates if someone else sets targetPath explicitly
  const unsubSelf = store.subscribe(targetPath, () => {
    // no-op; presence prevents some stores from GC-ing path observers
  });
  // If a gate is used, subscribe to it so opening/closing the gate retriggers compute
  if (gatePath) {
    unsubs.push(store.subscribe(gatePath, () => schedule()));
  }

  if (immediate) schedule();

  return () => {
    destroyed = true;
    if (timer) { try { clearTimeout(timer); } catch {} }
    for (const u of unsubs) { try { u && u(); } catch {} }
    try { unsubSelf && unsubSelf(); } catch {}
  };
}
