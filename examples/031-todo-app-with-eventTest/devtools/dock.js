// dev-dock.dev.js — shared dev dock for buttons (DEV only)
// if (import.meta && import.meta.env && import.meta.env.DEV) {
  const DOCK_ID = 'dev-dock-root';
  const STYLE_ID = 'dev-dock-style';
  const CSS = `
  #${DOCK_ID} { position: fixed; left: 10px; bottom: 10px; z-index: 2147483200; pointer-events: auto;
    display: inline-flex; flex-direction: row; gap: 6px; align-items: center; background: rgba(17,17,17,.85);
    border: 1px solid rgba(255,255,255,.12); border-radius: 10px; padding: 6px; box-shadow: 0 2px 10px rgba(0,0,0,.25); }
  #${DOCK_ID} .dock-btn { appearance: none; border: 1px solid rgba(255,255,255,.15); background: #222; color: #eee;
    font: 600 12px/1 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; border-radius: 8px; padding: 6px 10px; cursor: pointer; }
  #${DOCK_ID} .dock-btn:hover { background: #2a2a2a; }
  #${DOCK_ID} > button { cursor: pointer; }
  #${DOCK_ID} .dock-sep { width: 1px; height: 18px; background: rgba(255,255,255,.12); margin: 0 4px; }
  `;

  // Style
  let style = document.getElementById(STYLE_ID);
  if (!style){ style = document.createElement('style'); style.id = STYLE_ID; style.textContent = CSS; document.head.appendChild(style); }

  // Root
  let root = document.getElementById(DOCK_ID);
  if (!root){ root = document.createElement('div'); root.id = DOCK_ID; document.body.appendChild(root); }

  const registry = new Map();
  function register({ id, label, title = '', onClick }){
    // De-dup by id (helps during HMR)
    try { const exist = root.querySelector(`[data-dock-id="${id}"]`); if (exist) exist.remove(); } catch {}
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'dock-btn'; btn.textContent = label; if (title) btn.title = title;
    btn.setAttribute('data-dock-id', id);
    btn.addEventListener('click', (e) => { try { onClick?.(e); } catch (err) { console.warn('[dev-dock] button error', err); } });
    root.appendChild(btn);
    registry.set(id, btn);
    return () => { try { btn.remove(); } catch{}; registry.delete(id); };
  }
  function separator(){ const sep = document.createElement('div'); sep.className = 'dock-sep'; root.appendChild(sep); return () => sep.remove(); }

  window.__devdock = { register, separator, root };
  // Notify listeners that the dock is ready
  try { window.dispatchEvent(new CustomEvent('devdock:ready')); } catch {}
// }
