# 010-006 Core Primitives (Public API)

This folder demonstrates a path‑first, browser‑native architecture. The public primitives are exposed via `core/index.js`.

## Public API

- `hydrateMerge(store, root, payload, opts)`
  - Deep merge payload into `store` under `root`.
  - Arrays: `opts.arrayStrategy` = `replace` (default) or `keyedMerge` with `opts.keyField` (default: `id`).
  - Guards: `opts.version` + `opts.getVersion()`, `opts.whitelistPaths`, optional `opts.onConflict(path, prev, next)`.
- `hydrateReplace(store, payload, opts)`
  - Replace top-level subtrees in `store`. Optional `opts.whitelistPaths` and `opts.batch`.
- `renderNode(desc, document)` / `replaceRoot(rootEl, desc)`
  - Safe JSON→DOM rendering with allowlists (structure‑only). Use `replaceRoot` to swap rendered content.
- `bindPaths(store, rootEl, bindings)`
  - Path→DOM projection. `bindings[path] = { selector, prop='textContent' | attr }`.
  - Subscribes to `path` and sets `el[prop]` or `el.setAttribute(attr, value)`.
- `bindArray(store, rootEl, arrayBindings, { renderNode })`
  - Array projection. `arrayBindings[path] = { container, renderItem(item) -> nodeDesc }`.
  - Renders items into `container` (defaults to `replaceChildren` strategy). Pass `renderNode` from renderer.
- `installBehaviors(store, options)`
  - Minimal `data-on`/`data-bind`/`data-repeat` runtime for demos and tests.

Import surface:
```js
import { hydrateMerge, hydrateReplace, renderNode, replaceRoot, bindPaths, bindArray, installBehaviors } from './core/index.js'
```

## Safe Renderer Contract (jsonTemplate.render.js)

- Allowed tags: `div, section, article, header, footer, main, aside, nav, span, p, h1..h6, ul, ol, li, button, input, label, strong, em, small, code, pre`
- Allowed attributes:
  - Global: `id, class, role`
  - ARIA: `aria-*`
  - Input-only: `type, value, placeholder, name, disabled`
- Disallowed: any event attributes (`onclick`, etc.), unknown tags/attrs.

## Template Bindings (externalized)

- `bindings/template-a.js`, `bindings/template-b.js`
- `views/jsonTemplateDemo.js` dynamically imports the binding map by template key.
- Array bindings are kept in the demo view for clarity: `ui.items → #items`, `demo.items → #demoItems`.

## Tests

- `vitest/jsonTemplate.render.spec.ts`: allowlist behavior; `replaceRoot` swap.
- `vitest/jsonTemplate.bind.spec.ts`: path binder behavior (initial + updates).
- Additional repeater/behaviors tests live under `vitest/`.

## Notes

- This is structure‑only rendering. Content (data) should arrive via `hydrateMerge/Replace` and be projected via `bindPaths/bindArray`.
- For large lists, you can add a keyed policy in `bindArray` or hydrate with `arrayStrategy: 'keyedMerge'` to minimize DOM churn.
- SPDX headers: core files include `Apache-2.0` identifiers. LICENSE is Apache‑2.0 for this folder.
