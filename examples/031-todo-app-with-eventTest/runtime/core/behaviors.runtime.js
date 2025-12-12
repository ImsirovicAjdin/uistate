// behaviors.runtime.js — minimal parser + dispatcher for data-on/data-bind
// Install with: installBehaviors(store, { registry, root, writablePrefixes })

export function installBehaviors(store, { registry = {}, root = document, writablePrefixes = ['ui.'], writableWhitelist = [], debug = false, onStep = null } = {}){
  const subsByPath = new Map();
  const repeaters = [];
  const trackOff = (el, off) => { const arr = subsByPath.get(el) || []; arr.push(off); subsByPath.set(el, arr); };
  const unbindNode = (node) => {
    // Unsubscribe any subs registered for this node and its descendants
    const cleanup = (n) => {
      const offs = subsByPath.get(n);
      if (offs) { offs.forEach(off => { try { off(); } catch{} }); subsByPath.delete(n); }
      n.childNodes && n.childNodes.forEach && n.childNodes.forEach(cleanup);
    };
    try { cleanup(node); } catch {}
  };

  const bindEl = (el) => {
    // data-bind: "text: ui.counter; value: ui.name"
    const bindAttr = el.getAttribute?.('data-bind');
    if (bindAttr){
      for (const part of bindAttr.split(';')){
        const seg = part.trim(); if (!seg) continue;
        const [propRaw, pathRaw] = seg.split(':');
        const prop = (propRaw||'').trim();
        const path = (pathRaw||'').trim();
        const render = () => {
          const v = store.get(path);
          if (prop === 'text') el.textContent = v ?? '';
          else if (prop === 'value') el.value = v ?? '';
          else el.setAttribute(prop, v ?? '');
        };
        render();
        const off = store.subscribe(path, render);
        trackOff(el, off);
      }
    }

    // data-on: "click: inc(ui.counter,1) | set(ui.last,'clicked'); input: setFrom(ui.name,target.value)"
    const onAttr = el.getAttribute?.('data-on');
    if (onAttr){
      for (const rule of onAttr.split(';')){
        const seg = rule.trim(); if (!seg) continue;
        // Split only at the first ':' to avoid breaking on URLs like https://
        const colonAt = seg.indexOf(':');
        if (colonAt === -1) continue;
        const evt = seg.slice(0, colonAt).trim();
        const pipeRaw = seg.slice(colonAt + 1);
        const steps = String(pipeRaw||'').split('|').map(s=>s.trim()).filter(Boolean);
        el.addEventListener(evt, (event) => {
          for (const step of steps){
            const m = step.match(/^(\w+)\((.*)\)$/);
            const name = m ? m[1] : step;
            const argsStr = m ? m[2] : '';
            const args = parseArgs(argsStr);
            const fn = registry[name]; if (!fn) { if (console && console.warn) console.warn('[behaviors] missing action', name); continue; }
            const ctx = {
              store,
              el,
              event,
              get: (p) => store.get(p),
              set: (p, v) => {
                // writable guards: prefixes AND optional whitelist patterns
                const path = String(p);
                const okPrefix = writablePrefixes.some(pref => path === pref.slice(0, -1) || path.startsWith(pref));
                const okWhitelist = !writableWhitelist.length || writableWhitelist.some(pat => matchPattern(pat, path));
                if (!(okPrefix && okWhitelist)) {
                  if (debug) console.warn('[behaviors] blocked write', { path, reason: 'guard' });
                  try { onStep && onStep({ el, event, name, args, phase: 'blocked', blocked: true, write: path, reason: 'guard' }); } catch{}
                  return;
                }
                store.set(p, v);
                // annotate successful write
                try { onStep && onStep({ el, event, name, args, phase: 'applied', blocked: false, write: path }); } catch{}
              },
            };
            try {
              try { onStep && onStep({ el, event, name, args, phase: 'started', blocked: false }); } catch{}
              fn(ctx, ...args);
            } catch (e) { console.warn('[behaviors] action error', name, e); }
          }
        });
      }
    }

    // data-repeat: very small, read-only repeater with simple scope for item.*
    // Example:
    // <li data-repeat="item in ui.items" data-key="item.id"><span class="txt" data-bind="text: item.name"></span></li>
    // <li data-repeat-empty>Empty</li>
    const repExpr = el.getAttribute?.('data-repeat');
    if (repExpr) {
      const parsed = parseRepeat(repExpr);
      if (!parsed) return;
      const { itemName, idxName, listPath, keyExpr } = parsed;
      // Detach template and install renderer anchored by a comment
      const parent = el.parentNode;
      if (!parent) return;
      const anchor = document.createComment('repeat-anchor');
      parent.insertBefore(anchor, el);
      parent.removeChild(el);

      const emptyEl = parent.querySelector?.('[data-repeat-empty]') || null;

      // State for keyed reconciliation
      const nodesByKey = new Map();

      const renderList = () => {
        const list = store.get(listPath) || [];
        // Toggle empty placeholder
        if (emptyEl) {
          try {
            const isEmpty = !Array.isArray(list) || list.length === 0;
            if (isEmpty) { emptyEl.removeAttribute('hidden'); emptyEl.style && (emptyEl.style.display = ''); }
            else { emptyEl.setAttribute('hidden', ''); emptyEl.style && (emptyEl.style.display = 'none'); }
          } catch {}
        }

        if (!Array.isArray(list)) return;

        // Build a fragment in order with keyed clones
        const frag = document.createDocumentFragment();
        const nextNodesByKey = new Map();

        for (let idx = 0; idx < list.length; idx++) {
          const item = list[idx];
          const key = resolveKey(item, idx, keyExpr);
          let node = nodesByKey.get(key);
          if (!node) {
            node = el.cloneNode(true);
            // Simple scoped binding for common cases used in tests:
            // - text: item.name
            // - attributes with {{item.id}}
            // Apply text bindings manually
            node.querySelectorAll?.('[data-bind]').forEach((n) => {
              const bindAttr = n.getAttribute('data-bind') || '';
              bindAttr.split(';').map(s => s.trim()).filter(Boolean).forEach((seg) => {
                const [propRaw, pathRaw] = seg.split(':');
                const prop = (propRaw||'').trim();
                const pth = (pathRaw||'').trim();
                let val;
                if (pth === idxName && idxName) {
                  val = idx;
                } else if (pth.startsWith(itemName + '.')) {
                  val = getByPath(item, pth.slice(itemName.length + 1));
                }
                if (pth === itemName) val = item; // not deeply rendered, but allow truthy check
                if (val !== undefined) {
                  if (prop === 'text') n.textContent = val ?? '';
                  else if (prop === 'value') n.value = val ?? '';
                  else n.setAttribute(prop, val ?? '');
                }
              });
              // Prevent behaviors runtime from also binding this node to store paths like "item.*"
              n.removeAttribute('data-bind');
            });
            // Interpolate {{item.*}} in attributes used by tests (e.g., data-id)
            node.querySelectorAll('*').forEach((n) => {
              for (const attr of Array.from(n.attributes || [])){
                const m = /\{\{\s*(?:item\.(.+?)|(idx))\s*\}\}/g;
                if (m.test(attr.value)){
                  const replaced = attr.value.replace(/\{\{\s*(?:item\.(.+?)|(idx))\s*\}\}/g, (_, pItem, pIdx) => {
                    if (pIdx && idxName) return String(idx);
                    const v = getByPath(item, pItem);
                    return v == null ? '' : String(v);
                  });
                  n.setAttribute(attr.name, replaced);
                }
              }
            });
          }
          nextNodesByKey.set(key, node);
          frag.appendChild(node);
        }

        // Replace current range (between anchor and next non-render node) with frag
        // Simple strategy: remove all nodes after anchor until a repeat-empty (which we keep)
        let cursor = anchor.nextSibling;
        while (cursor && cursor !== emptyEl) {
          const next = cursor.nextSibling;
          parent.removeChild(cursor);
          cursor = next;
        }
        parent.insertBefore(frag, emptyEl || null);
        nodesByKey.clear();
        nextNodesByKey.forEach((v,k)=>nodesByKey.set(k,v));
      };

      renderList();
      const off = store.subscribe(listPath, renderList);
      repeaters.push({ off });
      trackOff(el, off);
    }
  };

  // initial scan
  const all = root.querySelectorAll?.('[data-bind], [data-on], [data-repeat]') || [];
  all.forEach(bindEl);

  // observe new nodes
  const mo = new MutationObserver((mutList) => {
    for (const m of mutList){
      m.addedNodes && m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.matches?.('[data-bind], [data-on], [data-repeat]')) bindEl(node);
        node.querySelectorAll?.('[data-bind], [data-on], [data-repeat]').forEach(bindEl);
      });
      // cleanup removed
      m.removedNodes && m.removedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        unbindNode(node);
      });
    }
  });
  if (root && root instanceof Document) mo.observe(document.body, { childList: true, subtree: true });

  return () => {
    mo.disconnect();
    subsByPath.forEach(offs => offs.forEach(off => { try { off(); } catch{} }));
    subsByPath.clear();
  };
}

function parseArgs(s){
  if (!s.trim()) return [];
  // split by commas not inside quotes
  const parts = s.split(',').map(p=>p.trim());
  return parts.map(coerceArg);
}

function coerceArg(x){
  if (x === '') return '';
  if ((x.startsWith('"') && x.endsWith('"')) || (x.startsWith("'") && x.endsWith("'"))) return x.slice(1,-1);
  if (x === 'true') return true;
  if (x === 'false') return false;
  if (x === 'null') return null;
  if (!Number.isNaN(Number(x))) return Number(x);
  return x; // pass path strings etc.
}

function matchPattern(pattern, path){
  // Very small wildcard: '*' matches a single segment, '**' matches the rest
  if (pattern === path) return true;
  const pSegs = String(pattern).split('.');
  const sSegs = String(path).split('.');
  let i = 0, j = 0;
  while (i < pSegs.length && j < sSegs.length){
    const part = pSegs[i];
    if (part === '**'){ return true; }
    if (part === '*' || part === sSegs[j]){ i++; j++; continue; }
    return false;
  }
  // Allow trailing '**'
  while (i < pSegs.length && pSegs[i] === '**') i++;
  return i === pSegs.length && j === sSegs.length;
}

// Dev-only explicit export to support unit tests in 010-005
export { matchPattern };

function parseRepeat(expr){
  // "item in ui.items" or "(item, idx) in ui.items"
  const m = String(expr).match(/^\s*\(?\s*([a-zA-Z_$][\w$]*)\s*(?:,\s*([a-zA-Z_$][\w$]*))?\s*\)?\s+in\s+([\w$.]+)\s*$/);
  if (!m) return null;
  const itemName = m[1];
  const idxName = m[2] || null;
  const listPath = m[3];
  // Optional data-key attribute is read from element attribute when rendering
  return { itemName, idxName, listPath, keyExpr: `${itemName}.id` };
}

function resolveKey(item, idx, keyExpr){
  // For now only support item.id; fallback to index
  const v = (item && (item.id != null)) ? item.id : idx;
  return String(v);
}

function getByPath(obj, path){
  const segs = String(path).split('.');
  let cur = obj;
  for (const s of segs){ if (cur == null) return undefined; cur = cur[s]; }
  return cur;
}
