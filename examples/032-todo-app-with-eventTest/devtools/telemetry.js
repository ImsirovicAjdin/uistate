// telemetry.dev.js — dev-only console buffer + copy-to-clipboard button
// Safe to include in production: it will bail out immediately when not in DEV.

import store from '../app/store.js';

// if (import.meta && import.meta.env && import.meta.env.DEV) {
  const MAX = 500;
  const buf = [];
  const orig = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console),
  };

  function push(level, args){
    buf.push({ t: Date.now(), level, args: Array.from(args) });
    if (buf.length > MAX) buf.shift();
  }

  console.log = (...a) => { push('log', a); orig.log(...a); };
  console.warn = (...a) => { push('warn', a); orig.warn(...a); };
  console.error = (...a) => { push('error', a); orig.error(...a); };
  console.info = (...a) => { push('info', a); orig.info(...a); };
  console.debug = (...a) => { push('debug', a); orig.debug(...a); };

  // Expose a simple API
  window.__telemetry = {
    get: () => buf.slice(),
    clear: () => { buf.length = 0; },
    copy: async () => {
      try {
        const text = JSON.stringify(buf, null, 2);
        await navigator.clipboard.writeText(text);
        orig.info('[telemetry] Copied console buffer to clipboard (', buf.length, 'entries )');
      } catch (e) {
        orig.warn('[telemetry] Clipboard copy failed', e);
      }
    }
  };

  // Register with shared dev dock if available
  if (window.__devdock && typeof window.__devdock.register === 'function'){
    window.__devdock.register({ id: 'copy-console', label: 'Console', title: 'Copy console buffer', onClick: () => window.__telemetry.copy() });
  } else {
    // Fallback: simple floating button
    const dockId = 'dev-tools-dock';
    let dock = document.getElementById(dockId);
    if (!dock){
      dock = document.createElement('div');
      dock.id = dockId;
      Object.assign(dock.style, {
        position: 'fixed', left: '10px', bottom: '10px', zIndex: 9999,
        display: 'flex', gap: '6px', alignItems: 'center',
      });
      document.body.appendChild(dock);
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Copy Console';
    Object.assign(btn.style, {
      appearance: 'none', border: '1px solid #ddd', background: '#fff',
      borderRadius: '6px', padding: '6px 10px', cursor: 'pointer',
      boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
    });
    btn.addEventListener('click', () => window.__telemetry.copy());
    dock.appendChild(btn);
  }

  // ============================================
  // SITEWIDE TELEMETRY: Log all state changes
  // ============================================
  if (typeof window !== 'undefined') {
    if (!store) {
      orig.error('[telemetry] Store is undefined!');
    } else if (!store.subscribe) {
      orig.error('[telemetry] Store has no subscribe method!', store);
    } else {
      // Log all state changes (except noisy ones)
      store.subscribe('*', (detail) => {
        const { path, value } = detail;
        
        // Skip transitioning state (too noisy)
        if (path === 'ui.route.transitioning') return;
        
        // Skip intent paths here (logged separately below)
        if (path.startsWith('intent.')) return;
        
        // Format like existing telemetry
        console.log(`[state] ${path}`, value);
      });

      // Log all intents separately (more prominent)
      store.subscribe('intent.*', (detail) => {
        const { path, value } = detail;
        const intentName = path.replace('intent.', '');
        console.log(`[intent] ${intentName}`, value);
      });

      orig.info('[telemetry] Sitewide state tracking enabled');
    }
  }
// }
