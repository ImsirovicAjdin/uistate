// queryBinding.js — bind a URL query param to a store path (two-way, minimal loops)
// Usage:
//   import { bindQueryParam } from './queryBinding.js';
//   const unbind = bindQueryParam(store, { param: 'tab', path: 'ui.nav.tab', coerce: (v)=>v });
// Notes:
// - Reads current ui.route.query on navigation and applies to `path`.
// - When the store path changes, updates the URL query via history.replaceState.
// - Avoids re-entrancy loops with a tiny guard.

export function bindQueryParam(store, { param, path, coerce, defaultValue, omitDefault, mode = 'replace' } = {}){
  if (!param || !path) throw new Error('bindQueryParam: `param` and `path` are required');
  let internalUpdate = false;
  let lastValue; // track last store value to drive smart push/replace

  // Apply query -> store on any route query change
  const applyFromQuery = () => {
    const q = store.get('ui.route.query') || {};
    const raw = q[param];
    let val = typeof coerce === 'function' ? coerce(raw) : raw;
    if (typeof raw === 'undefined' && typeof defaultValue !== 'undefined') {
      val = defaultValue;
    }
    internalUpdate = true;
    try { if (typeof val !== 'undefined') store.set(path, val); }
    finally { internalUpdate = false; }
    lastValue = store.get(path);
  };

  // Apply store -> URL on path change
  const applyToUrl = () => {
    if (internalUpdate) return;
    const current = store.get(path);
    // Build next query object from ui.route.query, then set/clear our param
    const q = Object.assign({}, store.get('ui.route.query') || {});
    const isDefault = omitDefault && typeof defaultValue !== 'undefined' && current === defaultValue;
    if (typeof current === 'undefined' || current === null || current === '' || isDefault) delete q[param];
    else q[param] = String(current);
    // Write new query into URL (replaceState), and reflect into store.ui.route.query
    const p = store.get('ui.route.path') || location.pathname;
    const sp = new URLSearchParams(q);
    const next = p + (sp.toString() ? ('?' + sp.toString()) : '') + location.hash;
    // Decide push vs replace per mode
    let doPush = false;
    if (mode === 'push') doPush = true;
    else if (mode === 'replace') doPush = false;
    else if (mode === 'smart') {
      const prev = lastValue;
      if (isDefault) doPush = false; // returning to default cleans URL
      else if (typeof prev === 'undefined') doPush = true; // first set
      else if (prev !== current) doPush = true; // switching between non-defaults
      else doPush = false;
    }
    if (doPush) history.pushState({}, '', next); else history.replaceState({}, '', next);
    // Reflect new query map into store without recursion back to `path`
    internalUpdate = true;
    try { store.set('ui.route.query', Object.fromEntries(sp.entries())); }
    finally { internalUpdate = false; }
    lastValue = current;
  };

  // Subscriptions
  const unsubA = store.subscribe('ui.route.query', applyFromQuery);
  const unsubB = store.subscribe(path, applyToUrl);

  // Initial sync from query
  applyFromQuery();

  return () => { unsubA(); unsubB(); };
}
