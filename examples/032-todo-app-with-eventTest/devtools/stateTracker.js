// stateTracker.js — OCP-friendly utility widget
// Purpose: When imported, renders a floating button you can click to cycle between
// the four corners of the viewport. Double-click toggles a full-height sidebar
// that opens on the left or right depending on the button's current horizontal corner.
//
// Design:
// - No external deps. Pure JS + a single <style> tag for cosmetics.
// - Open/Closed: exposes installStateTracker(opts) returning an uninstall function.
//   Auto-installs on import with defaults, but can be disabled via global flag.
// - Minimal footprint and no global CSS leakage (scoped class names).

(function(){
  const AUTO_INSTALL = true; // set to false if you prefer manual install only

  const STYLE_CSS = `
    .stt-pill { pointer-events: auto; position: fixed; display: inline-flex; gap: 6px; padding: 4px; border-radius: 999px;
      background: rgba(17,17,17,.9); backdrop-filter: saturate(120%) blur(4px); box-shadow: 0 2px 10px rgba(0,0,0,.25);
      border: 1px solid rgba(255,255,255,.12); z-index: 2147483600;
    }
    .stt-btn { width: 36px; height: 36px; border-radius: 18px; display: grid; place-items: center;
      font: 600 12px/1 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #fff; background: #111;
      border: 1px solid rgba(255,255,255,.15); cursor: pointer; user-select: none;
    }
    .stt-btn:hover { background: #1a1a1a; }
    .stt-btn:active { transform: translateY(1px); }

    .stt-corner-top-left { top: 12px; left: 12px; }
    .stt-corner-top-right { top: 12px; right: 12px; }
    .stt-corner-bottom-right { bottom: 12px; right: 12px; }
    .stt-corner-bottom-left { bottom: 12px; left: 12px; }

    .stt-sidebar { pointer-events: auto; position: fixed; top: 0; height: 100vh; width: min(80vw, 320px);
      background: var(--stt-sidebar-bg, #181818); color: var(--stt-sidebar-fg, #eee);
      border-inline: 1px solid rgba(255,255,255,.12); box-shadow: 0 0 24px rgba(0,0,0,.25);
      transform: translateX(var(--stt-x, 0)); transition: transform 180ms ease, opacity 180ms ease;
      opacity: var(--stt-opacity, 0); will-change: transform, opacity; z-index: 2147483600;
    }
    .stt-sidebar.right { right: 0; --stt-x: 100%; }
    .stt-sidebar.left { left: 0; --stt-x: -100%; }
    .stt-open .stt-sidebar { --stt-x: 0; --stt-opacity: 1; }

    .stt-sidebar header { padding: 8px 10px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,.08);
      display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .stt-header-title { font-size: 12px; font-weight: 700; letter-spacing: .3px; opacity: .9; }
    .stt-header-actions { display: inline-flex; gap: 6px; }
    .stt-icon-btn { width: 26px; height: 26px; border-radius: 6px; display: grid; place-items: center;
      font: 600 12px/1 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #eee; background: #222;
      border: 1px solid rgba(255,255,255,.12); cursor: pointer; user-select: none; }
    .stt-icon-btn:hover { background: #2a2a2a; }
    .stt-sidebar .stt-content { padding: 12px 14px; font-size: 12px; line-height: 1.35;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      white-space: pre; overflow: auto; max-height: calc(100vh - 48px);
    }
    /* Inline tools inside sidebar */
    .stt-row { display: flex; gap: 6px; padding: 6px 0; flex-wrap: wrap; }
    .stt-btn-sm { height: 28px; padding: 4px 10px; border-radius: 6px;
      font: 600 12px/1 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #eee; background: #222;
      border: 1px solid rgba(255,255,255,.12); cursor: pointer; user-select: none; }
    .stt-btn-sm:hover { background: #2a2a2a; }
  `;

  const CORNERS = ['top-left','top-right','bottom-right','bottom-left'];

  function createEl(tag, cls){ const el = document.createElement(tag); if (cls) el.className = cls; return el; }

  function installStateTracker({
    corner = 'bottom-right',
    appendTo = document.body,
    title = 'ST',
    store = undefined,
    pathPrefix = 'ui.stateTracker',
  } = {}){
    if (!appendTo) appendTo = document.body;
    // Allow global opt-in binding without importing store here (keeps OCP)
    if (!store && typeof window !== 'undefined' && window.stateTrackerStore){
      store = window.stateTrackerStore;
    }

    // Inject style once
    let styleEl = document.getElementById('stt-style');
    if (!styleEl){
      styleEl = document.createElement('style');
      styleEl.id = 'stt-style';
      styleEl.textContent = STYLE_CSS;
      document.head.appendChild(styleEl);
    }

    const pill = createEl('div', 'stt-pill');
    const btnMove = createEl('button', 'stt-btn stt-btn-move');
    btnMove.type = 'button'; btnMove.title = 'Move'; btnMove.textContent = '◷';
    const btnToggle = createEl('button', 'stt-btn stt-btn-toggle');
    btnToggle.type = 'button'; btnToggle.title = 'Toggle'; btnToggle.textContent = title;
    pill.appendChild(btnMove);
    pill.appendChild(btnToggle);

    const sidebar = createEl('aside', 'stt-sidebar');
    const header = createEl('header');
    const hTitle = createEl('div', 'stt-header-title'); hTitle.textContent = 'State Tracker';
    const hActions = createEl('div', 'stt-header-actions');
    const btnCopy = createEl('button', 'stt-icon-btn'); btnCopy.type = 'button'; btnCopy.title = 'Copy state'; btnCopy.textContent = '⎘';
    const btnClose = createEl('button', 'stt-icon-btn'); btnClose.type = 'button'; btnClose.title = 'Close'; btnClose.textContent = '×';
    hActions.appendChild(btnCopy); hActions.appendChild(btnClose);
    header.appendChild(hTitle); header.appendChild(hActions);
    const content = createEl('div', 'stt-content');
    // Helper to create a button with safe handler
    function mkBtn(label, title, handler){
      const b = document.createElement('button');
      b.className = 'stt-btn-sm'; b.type = 'button'; b.textContent = label; if (title) b.title = title;
      b.addEventListener('click', (e) => { try { handler && handler(e); } catch(err){ console.warn('[stateTracker]', err); } });
      return b;
    }

    // State JSON directly visible (no accordion)
    const pre = document.createElement('pre');
    pre.className = 'stt-pre';
    pre.textContent = 'Loading state…';
    content.appendChild(pre);
    sidebar.appendChild(header); sidebar.appendChild(content);

    document.body.appendChild(pill);
    document.body.appendChild(sidebar);

    function applyCorner(){
      pill.classList.remove(
        'stt-corner-top-left','stt-corner-top-right','stt-corner-bottom-right','stt-corner-bottom-left'
      );
      const cls = `stt-corner-${corner}`;
      pill.classList.add(cls);
      const isRight = corner.includes('right');
      sidebar.classList.toggle('right', isRight);
      sidebar.classList.toggle('left', !isRight);
    }

    let open = false;
    function setOpen(v){
      open = !!v;
      document.documentElement.classList.toggle('stt-open', open);
      if (store && typeof store.set === 'function'){
        try { store.set(`${pathPrefix}.open`, open); } catch {}
      }
    }

    applyCorner();

    // Render full state tree (if store provided), throttled to animation frame
    let scheduled = false;
    function renderState(){
      if (!store) return;
      try {
        const obj = store.get();
        pre.textContent = JSON.stringify(obj, null, 2);
      } catch (e) {
        pre.textContent = '[stateTracker] Unable to render state: ' + (e && e.message ? e.message : e);
      }
    }
    function scheduleRender(){
      if (scheduled) return; scheduled = true;
      requestAnimationFrame(() => { scheduled = false; renderState(); });
    }
    if (store){ renderState(); }

    // Left button: move between corners
    btnMove.addEventListener('click', (e) => {
      console.log('[stateTracker] move click', { corner });
      const idx = CORNERS.indexOf(corner);
      corner = CORNERS[(idx + 1) % CORNERS.length];
      applyCorner();
      if (store && typeof store.set === 'function'){
        try { store.set(`${pathPrefix}.corner`, corner); } catch {}
      }
    });

    // Right button: toggle sidebar
    btnToggle.addEventListener('click', (e) => {
      console.log('[stateTracker] toggle click', { openBefore: open });
      setOpen(!open);
      console.log('[stateTracker] toggle result', { openAfter: open });
      if (open && store) scheduleRender();
    });

    // Close via header close button or ESC
    btnClose.addEventListener('click', () => setOpen(false));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

    // Copy state structure
    async function copyState(){
      try {
        // ensure latest state text
        renderState();
        const text = pre.textContent || '';
        if (navigator.clipboard && navigator.clipboard.writeText){
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); ta.remove();
        }
        const old = btnCopy.textContent; btnCopy.textContent = '✓';
        setTimeout(() => { btnCopy.textContent = old; }, 900);
      } catch(err){
        console.warn('[stateTracker] copy failed', err);
      }
    }
    btnCopy.addEventListener('click', copyState);

    // Subscribe to all store changes to refresh view (if store provided)
    let unsubscribe = null;
    if (store && typeof store.subscribe === 'function'){
      try {
        unsubscribe = store.subscribe('*', () => { if (open) scheduleRender(); });
      } catch {}
    }

    // Clean up function
    const uninstall = () => {
      try { pill.remove(); } catch {}
      try { sidebar.remove(); } catch {}
      window.removeEventListener('keydown', () => {});
      if (unsubscribe){ try { unsubscribe(); } catch {} }
    };

    return {
      setCorner(next){ if (CORNERS.includes(next)){ corner = next; applyCorner(); } },
      getCorner(){ return corner; },
      isOpen(){ return open; },
      open(){ setOpen(true); },
      close(){ setOpen(false); },
      toggle(){ setOpen(!open); },
      uninstall,
      elements: { pill, btnMove, btnToggle, sidebar },
    };
  }

  // Auto-install on import (but still export installer)
  const api = { installStateTracker };
  if (AUTO_INSTALL) {
    // Guard against SSR/non-DOM contexts
    if (typeof document !== 'undefined' && document.body){
      api.instance = installStateTracker();
    }
  }

  // UMD-lite export
  if (typeof module !== 'undefined' && module.exports){ module.exports = api; }
  else if (typeof window !== 'undefined'){ window.stateTracker = api; }
})();
