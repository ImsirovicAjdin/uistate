// helpers.js
export const intent = (store, name, payload = true) => store.set(`intent.${name}`, payload);

export const bindIntentClicks = (root, store, payloadFromEvent) => {
  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-intent]');
    if (!t) return;
    const name = t.dataset.intent;
    const payload = payloadFromEvent ? payloadFromEvent(e, t) : true;
    store.set(`intent.${name}`, payload);
  });
};

export const mount = (a, b) => {
  // Overloads:
  // - mount(selectorsMap) -> root defaults to document
  // - mount(root, selectorsMap)
  let root, selectors;
  if (typeof b === 'undefined') {
    selectors = a;
    root = document;
  } else {
    root = a;
    selectors = b;
  }
  const entries = Object.entries(selectors).map(([k, sel]) => {
    const el = typeof sel === 'string' ? root.querySelector(sel) : sel;
    return [k, el];
  });
  return Object.fromEntries(entries);
};

export const renderJson = (el, getSnapshot) => {
  try { el.textContent = JSON.stringify(getSnapshot(), null, 2); }
  catch { el.textContent = String(getSnapshot()); }
};

// Simple plug-and-play state panel. Attempts to use a provided target (selector or element),
// then '#state' if present, otherwise creates a floating <pre> panel in the bottom-right.
export const showStatePanel = (store, target) => {
  let el = null;
  if (typeof target === 'string') {
    el = document.querySelector(target);
  } else if (target && target.nodeType === 1) {
    el = target; // DOM Element
  }
  if (!el) {
    el = document.querySelector('#state');
  }
  if (!el) {
    el = document.createElement('pre');
    el.setAttribute('id', 'state');
    Object.assign(el.style, {
      position: 'fixed', right: '8px', bottom: '8px',
      minWidth: '240px', maxWidth: '40vw', maxHeight: '40vh', overflow: 'auto',
      padding: '8px', background: 'rgba(0,0,0,0.7)', color: '#0f0',
      font: '12px/1.4 monospace', borderRadius: '6px', zIndex: 99999,
      boxShadow: '0 2px 12px rgba(0,0,0,0.35)'
    });
    document.body.appendChild(el);
  }
  const render = () => {
    try { el.textContent = JSON.stringify(store.get(), null, 2); }
    catch { el.textContent = String(store.get()); }
  };
  store.subscribe('*', render);
  render();
  return el;
};

// Subscribe multiple path/handler pairs at once. Returns a SubGroup with:
// - dispose(): unsubscribe all
// - unsubs: individual unsubscribe functions (in pair order)
// - byPath: Record<string, Function[]> to selectively dispose by path
// - size: number of subscriptions created
export const groupSubs = (store, ...args) => {
  if (args.length % 2 !== 0) {
    throw new Error('groupSubs expects alternating path/handler pairs');
  }
  const unsubs = [];
  const byPath = Object.create(null);
  for (let i = 0; i < args.length; i += 2) {
    const path = args[i];
    const handler = args[i + 1];
    const unsub = store.subscribe(path, handler);
    unsubs.push(unsub);
    (byPath[path] || (byPath[path] = [])).push(unsub);
  }
  const dispose = () => {
    for (let i = unsubs.length - 1; i >= 0; i--) {
      try { unsubs[i](); } catch (_) { /* noop */ }
    }
  };
  return { dispose, unsubs, byPath, size: unsubs.length };
};

// Console logger for state changes; subscribes to '*' wildcard and logs path/value.
// Optional custom formatter receives the event object `{ path, value }`.
export const consoleLogState = (store, formatter) => {
  const handler = (evt) => {
    const payload = evt && typeof evt === 'object' && 'path' in evt ? evt : { path: '*', value: store.get() };
    if (formatter) return formatter(payload);
    console.log('[state]', payload.path, payload.value);
  };
  return store.subscribe('*', handler);
};

// JS-only wiring helpers (no DOM data-* exposure)
export const onClick = (el, handler) => {
  el.addEventListener('click', handler);
  return () => el.removeEventListener('click', handler);
};

export const bump = (store, path, delta = 1) => {
  const n = (store.get(path) || 0) + delta;
  store.set(path, n);
};
export const inc = (store, path) => bump(store, path, 1);
export const dec = (store, path) => bump(store, path, -1);

// Intent wiring without using data-* attributes
export const bindIntent = (store, el, name, payloadFromEvent) => {
  const listener = (e) => {
    const payload = payloadFromEvent ? payloadFromEvent(e, el) : true;
    store.set(`intent.${name}`, payload);
  };
  el.addEventListener('click', listener);
  return () => el.removeEventListener('click', listener);
};

export const bindIntents = (store, tuples) => {
  const unsubs = tuples.map(([el, name, payloadFromEvent]) => bindIntent(store, el, name, payloadFromEvent));
  return () => { for (let i = unsubs.length - 1; i >= 0; i--) { try { unsubs[i](); } catch (_) {} } };
};

// Orchestrator: initialize a view by mounting elements, subscribing handlers, wiring events, and optional dev tools.
// API:
// initView({
//   store,                         // required
//   mount: selectors | [root, selectors],
//   paths: { ALIAS: 'a.b.c' },     // optional path aliases
//   view: [ ['path', (value, els, store, p) => { /* render */ }], ... ],
//   dev: { log: true, panel: true },
//   events: (els, store, p) => [ /* array of unsubs */ ],
// })
export const initView = (cfg) => {
  if (!cfg || !cfg.store) throw new Error('initView: cfg.store is required');
  const store = cfg.store;
  const mountCfg = cfg.mount;
  const p = Object.assign({}, cfg.paths || {});
  const dev = cfg.dev || {};

  // Resolve elements once
  const els = Array.isArray(mountCfg) ? mount(mountCfg[0], mountCfg[1]) : mount(mountCfg || {});

  // Build grouped subscriptions from view tuples, wrapping to inject (els, store, p)
  const viewTuples = (cfg.view || []).flatMap(([path, handler]) => {
    let wrapped;
    if (typeof handler === 'string') {
      const key = handler;
      wrapped = (value) => {
        const el = els[key];
        if (el) el.textContent = String(value);
      };
    } else {
      wrapped = (value) => handler && handler(value, els, store, p);
    }
    return [path, wrapped];
  });
  const subs = viewTuples.length ? groupSubs(store, ...viewTuples) : { dispose(){} };

  // Dev tools
  const devUnsubs = [];
  if (dev.log) {
    try { devUnsubs.push(consoleLogState(store)); } catch (_) {}
  }
  let panelEl = null;
  if (dev.panel) {
    try { panelEl = showStatePanel(store); } catch (_) {}
  }

  // Events wiring
  let eventUnsubs = [];
  if (typeof cfg.events === 'function') {
    try { eventUnsubs = cfg.events(els, store, p) || []; } catch (_) { eventUnsubs = []; }
  } else if (cfg.events && typeof cfg.events === 'object') {
    // Sugar: events map { elKey: (store, paths, el) => void | unsub }
    const map = cfg.events;
    eventUnsubs = Object.entries(map).map(([key, fn]) => {
      const el = els[key];
      if (!el || typeof fn !== 'function') return () => {};
      // Default to click wiring; allow handler to return its own unsub.
      const handler = () => fn(store, p, el);
      el.addEventListener('click', handler);
      return () => el.removeEventListener('click', handler);
    });
  }

  // Unified disposer
  const dispose = () => {
    try { subs && subs.dispose && subs.dispose(); } catch (_) {}
    for (let i = eventUnsubs.length - 1; i >= 0; i--) {
      try { eventUnsubs[i] && eventUnsubs[i](); } catch (_) {}
    }
    for (let i = devUnsubs.length - 1; i >= 0; i--) {
      try { devUnsubs[i] && devUnsubs[i](); } catch (_) {}
    }
    // Note: showStatePanel returns an element; we do not auto-remove it by default.
  };

  return { els, paths: p, subs, eventUnsubs, devUnsubs, dispose };
};
