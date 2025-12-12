// SPDX-License-Identifier: Apache-2.0
// hydrate.js — general JSON→store utilities
// Minimal, framework-agnostic helpers that operate on a simple store interface:
//   - store.get(path: string): any
//   - store.set(path: string, value: any): void
// Options are defensive and production-oriented but remain tiny.

/**
 * @typedef {Object} Store
 * @property {(path:string)=>any} get
 * @property {(path:string, value:any)=>void} set
 * @property {(path:string, fn:(v:any)=>void)=>(()=>void)=} subscribe
 */

/**
 * Execute a function intended to perform multiple set() calls.
 * Note: Without native store batching, this is a semantic wrapper.
 * Consumers may swap this with a true batch if available.
 *
 * @template T
 * @param {Store} store
 * @param {() => T} fn
 * @returns {T}
 */
export function withBatch(store, fn) {
  return fn();
}

function inWhitelist(path, whitelistPaths) {
  if (!whitelistPaths || whitelistPaths.length === 0) return true;
  return whitelistPaths.some((p) => path === p || path.startsWith(p + '.'));
}

/**
 * Replace top-level subtrees.
 *
 * @param {Store} store
 * @param {Record<string, any>} payload - e.g. { demo: {...}, ui: {...} }
 * @param {Object} [opts]
 * @param {string[]} [opts.whitelistPaths] - Allowed path prefixes (e.g., ['form'])
 * @param {boolean} [opts.batch] - If true, wraps changes in {@link withBatch}
 * @returns {void}
 */
export function hydrateReplace(store, payload, opts = {}) {
  const { whitelistPaths, batch } = opts;
  const apply = () => {
    for (const [k, v] of Object.entries(payload || {})) {
      if (!inWhitelist(k, whitelistPaths)) continue;
      store.set(k, v);
    }
  };
  return batch ? withBatch(store, apply) : apply();
}

/**
 * Deep merge a payload into the store, starting from a root path.
 *
 * Arrays: `replace` (default) or `keyedMerge` by a `keyField` (default: `id`).
 * Conflicts: optional `onConflict(path, prev, next)` on leaf writes.
 * Version: optional guard to avoid stale apply via `version` + `getVersion()`.
 *
 * @param {Store} store
 * @param {string} root - Path prefix to merge under (e.g., 'demo')
 * @param {any} payload - Arbitrary JSON-compatible structure
 * @param {Object} [opts]
 * @param {(path:string, prev:any, next:any)=>any} [opts.onConflict]
 * @param {('replace'|'keyedMerge')} [opts.arrayStrategy]
 * @param {string} [opts.keyField]
 * @param {string[]} [opts.whitelistPaths]
 * @param {number} [opts.version]
 * @param {()=>number} [opts.getVersion]
 * @param {boolean} [opts.batch]
 * @returns {void}
 */
export function hydrateMerge(store, root, payload, opts = {}) {
  const {
    onConflict,
    arrayStrategy = 'replace',
    keyField = 'id',
    whitelistPaths,
    version,
    getVersion,
    batch,
  } = opts;

  if (version != null && typeof getVersion === 'function') {
    const current = getVersion();
    if (current != null && version <= current) {
      // Incoming is stale or equal; skip.
      return;
    }
  }

  const setLeaf = (path, nextVal) => {
    if (!inWhitelist(path, whitelistPaths)) return;
    const prev = store.get(path);
    if (onConflict && typeof nextVal !== 'object') {
      if (typeof prev !== 'undefined') {
        const resolved = onConflict(path, prev, nextVal);
        store.set(path, resolved);
        return;
      }
    }
    store.set(path, nextVal);
  };

  const mergeArray = (path, incomingArr) => {
    if (arrayStrategy === 'replace') {
      setLeaf(path, incomingArr);
      return;
    }
    // keyedMerge
    const local = store.get(path) || [];
    const byKey = new Map();
    for (const item of local) {
      const k = item && typeof item === 'object' ? item[keyField] : undefined;
      if (k != null) byKey.set(String(k), item);
    }
    const result = [...local];
    for (const inc of incomingArr) {
      const k = inc && typeof inc === 'object' ? inc[keyField] : undefined;
      if (k == null) { result.push(inc); continue; }
      const sk = String(k);
      const existingIdx = result.findIndex((x) => x && x[keyField] != null && String(x[keyField]) === sk);
      if (existingIdx >= 0) {
        const old = result[existingIdx];
        // shallow merge; objects only
        if (old && typeof old === 'object' && inc && typeof inc === 'object') {
          result[existingIdx] = { ...old, ...inc };
        } else {
          result[existingIdx] = inc;
        }
      } else {
        result.push(inc);
      }
    }
    setLeaf(path, result);
  };

  const recurse = (prefix, value) => {
    if (Array.isArray(value)) {
      mergeArray(prefix, value);
      return;
    }
    if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        const path = prefix ? `${prefix}.${k}` : k;
        recurse(path, v);
      }
    } else {
      setLeaf(prefix, value);
    }
  };

  const apply = () => recurse(root || '', payload);
  return batch ? withBatch(store, apply) : apply();
}
