// eventState.plus.js — Open/Closed extension over eventState.js without modifying core
// Provides: safety guards, stricter validation, unsubscribe helper, and a light batch API
// NOTE: This module composes the existing './eventState.js' implementation and returns
// an enhanced facade. The original fine-grained semantics (per-path events) remain intact.

import createEventStateBase from '../core/eventState.js';

/**
 * Create an enhanced EventState store while preserving the original semantics.
 * - Safety: destroyed-guard to prevent use-after-destroy
 * - Validation: strict argument checks for subscribe/off
 * - Ergonomics: off(unsub) helper
 * - Batch: coalesce multiple set() calls by path within a batch() section
 *
 * Important: batching here deduplicates per-path updates within the batch,
 * but still dispatches one notification per unique path at flush time.
 * This preserves fine-grained observability while reducing churn.
 */
export function createEventStatePlus(initial = {}, options = {}){
  const base = createEventStateBase(initial);
  let destroyed = false;

  // Track subscriptions we create (optional, for destroy hygiene)
  const _subscriptions = new Set();

  function assertNotDestroyed(){
    if (destroyed) throw new Error('EventState store has been destroyed');
  }

  // Batching support: collect last value per path and flush at end
  let batching = false;
  let buffer = new Map(); // path -> value (last write wins)

  function flushBuffer(){
    if (buffer.size === 0) return;
    const entries = Array.from(buffer.entries());
    buffer.clear();
    for (const [path, value] of entries){
      base.set(path, value);
    }
  }

  function batch(fn){
    assertNotDestroyed();
    const wasBatching = batching;
    batching = true;
    try {
      fn();
    } finally {
      batching = wasBatching; // support nested batches: only flush on outermost
      if (!batching) flushBuffer();
    }
  }

  // Facade methods
  function get(path){
    return base.get(path);
  }

  function set(path, value){
    assertNotDestroyed();
    if (!path) return value;
    if (batching){
      buffer.set(path, value);
      return value;
    }
    return base.set(path, value);
  }

  function subscribe(path, handler){
    assertNotDestroyed();
    if (typeof path !== 'string' || typeof handler !== 'function'){
      throw new TypeError('subscribe(path, handler) requires a string path and function handler');
    }
    // eventState.js invokes callback(detail, path). We adapt the signature to (detail, meta)
    // where meta mimics an event-like shape with type=path for ergonomics.
    const wrapped = (detail /* from base */, subscribedPath /* string */) => {
      handler(detail, { type: subscribedPath, detail });
    };
    const unsubscribe = base.subscribe(path, wrapped);
    _subscriptions.add(unsubscribe);
    return function off(){
      _subscriptions.delete(unsubscribe);
      return unsubscribe();
    };
  }

  function off(unsubscribe){
    if (typeof unsubscribe !== 'function'){
      throw new TypeError('off(unsubscribe) requires a function returned by subscribe');
    }
    return unsubscribe();
  }

  function setMany(entries){
    assertNotDestroyed();
    if (!entries) return;
    // Accept Array<[path,value]>, Map, or plain object
    batch(() => {
      if (Array.isArray(entries)){
        for (const [p, v] of entries) set(p, v);
      } else if (entries instanceof Map){
        for (const [p, v] of entries.entries()) set(p, v);
      } else if (typeof entries === 'object'){
        for (const p of Object.keys(entries)) set(p, entries[p]);
      }
    });
  }

  function destroy(){
    if (destroyed) return;
    // Best-effort unsubscribe of known subs created via this facade
    for (const unsub of Array.from(_subscriptions)){
      try { unsub(); } catch {}
      _subscriptions.delete(unsub);
    }
    // Forward to base.destroy if present
    if (typeof base.destroy === 'function'){
      try { base.destroy(); } catch {}
    }
    destroyed = true;
    // Drop buffered writes (safer than flushing after destroy)
    buffer.clear();
  }

  return {
    // Core parity
    get,
    set,
    subscribe,
    // Added ergonomics
    off,
    destroy,
    // Batching utilities
    batch,
    setMany,
    // Introspection
    get destroyed(){ return destroyed; },
  };
}

/**
 * Upgrade an existing base store into a Plus facade, without duplicating state.
 * Accepts any object implementing { get, set, subscribe, destroy? }.
 */
export function upgradeEventState(base){
  // Wrap an existing store with the same facade used above. This avoids creating a new base.
  // Reuse the createEventStatePlus mechanics but without constructing a new base store.
  // Implementation mirrors createEventStatePlus, substituting `base` for the newly created one.

  let destroyed = false;
  const _subscriptions = new Set();
  const assertNotDestroyed = () => { if (destroyed) throw new Error('EventState store has been destroyed'); };

  let batching = false;
  let buffer = new Map();
  const flushBuffer = () => {
    if (buffer.size === 0) return;
    const entries = Array.from(buffer.entries());
    buffer.clear();
    for (const [path, value] of entries){ base.set(path, value); }
  };
  const batch = (fn) => {
    assertNotDestroyed();
    const wasBatching = batching;
    batching = true;
    try { fn(); } finally { batching = wasBatching; if (!batching) flushBuffer(); }
  };

  const get = (path) => base.get(path);
  const set = (path, value) => { assertNotDestroyed(); if (!path) return value; if (batching){ buffer.set(path, value); return value; } return base.set(path, value); };
  const subscribe = (path, handler) => {
    assertNotDestroyed();
    if (typeof path !== 'string' || typeof handler !== 'function') throw new TypeError('subscribe(path, handler) requires a string path and function handler');
    const wrapped = (detail, subscribedPath) => { handler(detail, { type: subscribedPath, detail }); };
    const unsubscribe = base.subscribe(path, wrapped);
    _subscriptions.add(unsubscribe);
    return function off(){ _subscriptions.delete(unsubscribe); return unsubscribe(); };
  };
  const off = (unsubscribe) => {
    if (typeof unsubscribe !== 'function') throw new TypeError('off(unsubscribe) requires a function returned by subscribe');
    return unsubscribe();
  };
  const setMany = (entries) => {
    assertNotDestroyed();
    if (!entries) return;
    batch(() => {
      if (Array.isArray(entries)) for (const [p,v] of entries) set(p,v);
      else if (entries instanceof Map) for (const [p,v] of entries.entries()) set(p,v);
      else if (typeof entries === 'object') for (const p of Object.keys(entries)) set(p, entries[p]);
    });
  };
  const destroy = () => {
    if (destroyed) return;
    for (const unsub of Array.from(_subscriptions)){
      try { unsub(); } catch {}
      _subscriptions.delete(unsub);
    }
    if (typeof base.destroy === 'function') { try { base.destroy(); } catch {} }
    destroyed = true;
    buffer.clear();
  };

  return {
    get, set, subscribe, off, destroy, batch, setMany,
    get destroyed(){ return destroyed; },
  };
}

export default createEventStatePlus;
