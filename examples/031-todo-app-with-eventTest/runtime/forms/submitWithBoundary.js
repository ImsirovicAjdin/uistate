// forms/submitWithBoundary.js — thin wrapper over runWithBoundary for forms
// Usage: submitWithBoundary(store, asyncFn, { submittingPath, errorPath, successPath })
// Ensures submitting flag toggles, errors are mapped to a path, and optional success payload is written.

import { runWithBoundary } from '../extensions/boundary.js';

/**
 * @template T
 * @param {any} store - eventState-like store with get/set
 * @param {() => Promise<T>} fn - async submit function
 * @param {{ submittingPath: string, errorPath?: string, successPath?: string, mapError?: (e:any)=>any }} opts
 * @returns {Promise<T|any|undefined>}
 */
export function submitWithBoundary(store, fn, opts) {
  const { submittingPath, errorPath, successPath, mapError } = opts || {};
  if (submittingPath) store.set(submittingPath, true);
  if (errorPath) store.set(errorPath, null);

  return runWithBoundary(fn, {
    setLoading: (b) => { if (submittingPath) store.set(submittingPath, b); },
    onError: (err) => { if (errorPath) store.set(errorPath, err); },
    mapError,
    finally: () => {}
  }).then((res) => {
    if (typeof successPath === 'string') store.set(successPath, res ?? null);
    return res;
  });
}
