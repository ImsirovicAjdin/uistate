// converge.js — last-write-wins (or last-local-wins) convergence helpers
// Expects a store with get/set APIs.

function pathKey(path) {
  return String(path || '');
}

/**
 * Apply an inbound change if its clock is newer than the local clock.
 * @param {any} store
 * @param {{ path: string, value: any, clock: number }} change
 * @param {{ clocksPath?: string, arrayStrategy?: 'replace'|'keyedMerge', keyField?: string }} opts
 */
export function applyConverge(store, change, opts = {}) {
  const { path, value, clock } = change || {};
  if (!path) return false;
  const { clocksPath = 'clocks', arrayStrategy = 'replace', keyField = 'id' } = opts;

  const ck = pathKey(path);
  const localClock = store.get(`${clocksPath}.${ck}`) || 0;
  if (!(clock > localClock)) return false; // reject stale or equal

  // Apply the value with optional array strategy
  if (Array.isArray(value)) {
    if (arrayStrategy === 'replace') {
      store.set(path, value);
    } else {
      const local = store.get(path) || [];
      const result = [...local];
      for (const inc of value) {
        const k = inc && typeof inc === 'object' ? inc[keyField] : undefined;
        if (k == null) { result.push(inc); continue; }
        const sk = String(k);
        const idx = result.findIndex((x) => x && x[keyField] != null && String(x[keyField]) === sk);
        if (idx >= 0) {
          const old = result[idx];
          result[idx] = (old && typeof old === 'object' && inc && typeof inc === 'object')
            ? { ...old, ...inc }
            : inc;
        } else {
          result.push(inc);
        }
      }
      store.set(path, result);
    }
  } else {
    store.set(path, value);
  }

  // Update clock
  store.set(`${clocksPath}.${ck}`, clock);
  return true;
}

/**
 * Build an outbound change with clock and origin-id (for crossTabSync).
 */
export function publishChange(store, path, value, { clocksPath = 'clocks', now = () => Date.now(), origin } = {}) {
  const clock = Number(now());
  store.set(path, value);
  store.set(`${clocksPath}.${pathKey(path)}`, clock);
  return { path, value, clock, origin };
}
