# UIstate v5

**Lightweight event-driven state management for modern web applications**

[![npm version](https://img.shields.io/npm/v/@uistate/core.svg)](https://www.npmjs.com/package/@uistate/core)
[![License: MIT + Commercial](https://img.shields.io/badge/License-MIT%20%2B%20Commercial-blue.svg)](#license)

After many experiments exploring different state management paradigms, UIstate v5 emerges as a focused, production-ready solution for complex UIs. Born from real-world challenges like building data tables, dashboards, and interactive applications.

## What's New in v5

- **EventState Core**: Path-based subscriptions with wildcard support (~80 LOC)
- **Slot Orchestration**: Atomic component swapping without layout shift
- **Intent-Driven**: Declarative command handling for decoupled architecture
- **Zero Dependencies**: Pure JavaScript, works in any modern browser
- **Framework-Free**: No build step required (but works great with Vite)

## Installation

```bash
npm install @uistate/core
```

## Quick Start

```javascript
import { createEventState } from '@uistate/core';

const store = createEventState({
  user: { name: 'Alice' },
  count: 0
});

// Subscribe to specific paths
store.subscribe('user.name', (value) => {
  console.log('Name changed:', value);
});

// Subscribe with wildcards
store.subscribe('user.*', ({ path, value }) => {
  console.log(`${path} changed to:`, value);
});

// Update state
store.set('user.name', 'Bob');  // → Name changed: Bob
store.set('count', 1);
```

## Core API

### `createEventState(initial?)`

Creates a new reactive store.

```javascript
const store = createEventState({ count: 0 });
```

### `store.get(path)`

Retrieves a value by path.

```javascript
const count = store.get('count');
const user = store.get('user');  // Returns entire user object
const all = store.get();          // Returns entire store
```

### `store.set(path, value)`

Sets a value and triggers subscriptions.

```javascript
store.set('count', 42);
store.set('user.email', 'alice@example.com');
```

### `store.subscribe(path, handler)`

Subscribes to changes. Returns an unsubscribe function.

```javascript
// Exact path
const unsub = store.subscribe('count', (value) => {
  console.log('Count:', value);
});

// Wildcard (child changes)
store.subscribe('user.*', ({ path, value }) => {
  console.log(`User property ${path} changed`);
});

// Global wildcard (all changes)
store.subscribe('*', ({ path, value }) => {
  console.log('Something changed');
});

// Cleanup
unsub();
```

### `store.destroy()`

Cleans up the event bus and prevents further updates.

```javascript
store.destroy();
```

# Changelog

## [5.0.0] - 2025-12-09

### Breaking Changes
- eventState is now primary export (was cssState)
- DOM element event bus replaced with EventTarget
- ...

### Added
- Slot orchestration pattern
- Intent-driven architecture
- Event-sequence testing (experimental)
- Example 009: Financial dashboard
- Example 010: Event testing

## Architecture Patterns

UIstate v5 introduces battle-tested patterns from many experiments:

### 1. **Intent-Driven Updates** (Declarative Commands)

Intents are just regular state paths—no special API needed. Components subscribe to intent paths and execute logic when triggered:

```javascript
// Subscribe to an intent path
store.subscribe('intent.todo.add', ({ text }) => {
  const items = store.get('todos.items') || [];
  store.set('todos.items', [...items, { id: Date.now(), text, done: false }]);
});

// Trigger intent from UI by setting the path
button.addEventListener('click', () => {
  store.set('intent.todo.add', { text: input.value });
});
```

**Key insight**: Intents are paths, not events. This means:
- Subscribe once at component mount
- Multiple components can listen to the same intent
- Easy to test (just `set()` the intent path)
- No special event emitter needed

### 2. **Slot Orchestration** (Flicker-free component loading)

Load layouts and components separately for atomic, layout-shift-free updates:

```javascript
// 1. Mount persistent layout once
async function mountMaster(master) {
  const layout = await fetchHTML(master.layout);
  document.getElementById('app').innerHTML = layout;
}

// 2. Load components into slots atomically
async function loadSlot({ slot, url }) {
  const config = await fetchJSON(url);
  const html = await fetchHTML(config.component);

  // Find slot container
  const slotHost = document.querySelector(`[data-slot="${slot}"]`);

  // Atomic replacement - no layout shift!
  const fragment = createFragment(html);
  slotHost.replaceChildren(fragment);

  // Wire up component subscriptions
  wireComponent(slotHost, config.bindings);
}

// Trigger slot loading via intent
store.subscribe('intent.slot.load', loadSlot);
store.set('intent.slot.load', { slot: 'main', url: '/slots/todo.json' });
```

**Key insight**: Separate layout (skeleton) from content (slots):
- Layout provides stable structure
- Slots swap atomically without reflow
- Each component manages its own subscriptions
- Clean separation of concerns

### 3. **Component Bindings** (Path-based reactivity)

Components subscribe to specific state paths, not global wildcards:

```javascript
function wireComponent(root, bindings) {
  const input = root.querySelector('#input');
  const list = root.querySelector('#list');
  const itemsPath = bindings.items || 'domain.items';

  // Subscribe to specific path for this component
  const unsubscribe = store.subscribe(itemsPath, (items) => {
    list.replaceChildren();
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.text;
      list.appendChild(li);
    });
  });

  // Initial render
  const items = store.get(itemsPath);
  if (items) store.set(itemsPath, items);

  // Return cleanup function
  return unsubscribe;
}
```

**Key insight**: Each component subscribes to its own paths:
- No global `*` wildcards in production code
- Components are isolated and testable
- Easy cleanup when unmounting
- Clear data dependencies

### 4. **Component Lifecycle Pattern**

Proper mount/unmount with subscription cleanup:

```javascript
const componentRegistry = new Map();

async function loadSlot({ slot, url }) {
  // Cleanup previous component in this slot
  const existing = componentRegistry.get(slot);
  if (existing?.cleanup) {
    existing.cleanup();
  }

  // Load and mount new component
  const config = await fetchJSON(url);
  const html = await fetchHTML(config.component);
  const slotHost = document.querySelector(`[data-slot="${slot}"]`);
  slotHost.replaceChildren(createFragment(html));

  // Wire up with cleanup function
  const cleanup = wireComponent(slotHost, config.bindings);

  // Store for later cleanup
  componentRegistry.set(slot, { cleanup });
}
```

**Key insight**: Always clean up subscriptions:
- Prevents memory leaks
- Allows safe component swapping
- Components are truly hot-swappable
- No zombie subscriptions

### 5. **Content-Driven Layout** (Layout morphs based on active content)

One layout HTML can adapt to different use cases by subscribing to state and toggling CSS classes:

```javascript
function wireLayout(root, bindings) {
  // ...existing button wiring...

  // Layout adapts based on which slot is active
  store.subscribe('ui.view.active', (active) => {
    const kpiCol = root.querySelector('[data-slot="kpi"]').closest('.col-12');
    const newsCol = root.querySelector('[data-slot="news"]').closest('.col-12');
    const positionsCol = root.querySelector('[data-slot="positions"]').closest('.col-12');

    if (active === 'todos') {
      // Full-width editing mode
      kpiCol.classList.add('d-none');
      newsCol.classList.add('d-none');
      positionsCol.classList.remove('col-md-6', 'col-lg-4');
      positionsCol.classList.add('col-md-12', 'col-lg-8');
    } else {
      // Multi-column dashboard mode
      kpiCol.classList.remove('d-none');
      newsCol.classList.remove('d-none');
      positionsCol.classList.remove('col-md-12', 'col-lg-8');
      positionsCol.classList.add('col-md-6', 'col-lg-4');
    }
  });
}
```

**Key insight**: Content configures layout, not the other way around:
- One layout HTML handles all scenarios
- Panels show/hide based on active content
- Sections expand/collapse responsively
- Pure CSS class manipulation - no DOM restructuring
- Declarative layout rules via state subscription

**Real-world applications**:
```javascript
// E-commerce: hide sidebar, expand product grid
if (active === 'products') hideSlots(['filters', 'cart']); expandSlot('grid');

// Admin: hide navigation, expand table
if (active === 'report') hideSlots(['nav', 'sidebar']); expandSlot('table');

// Editor: focus mode - hide everything except content
if (active === 'editor') hideSlots(['toolbar', 'preview']); expandSlot('content');
```

This pattern eliminates the "rigid layout" criticism - UIstate layouts are as flexible as any framework, with zero VDOM overhead.

## Complete Example

See `examples/009-financial-dashboard` for a real-world application featuring:

- Multi-slot dashboard layout
- TodoList with filtering
- Financial data tables (KPI, Positions, Debts, Sales, News)
- Intent-driven architecture
- Atomic slot swapping
- State inspector

Run the example:

```bash
cd node_modules/@uistate/core/examples/009-financial-dashboard
npx serve .
```

Open http://localhost:3000 and explore the multi-slot dashboard!

## Why UIstate v5?

### vs. React/Vue

- ✅ **No VDOM overhead** - Direct DOM manipulation with surgical updates
- ✅ **No build step required** - Works in browsers directly
- ✅ **Simpler mental model** - Paths + subscriptions, not components + lifecycle hooks
- ✅ **Smaller bundle** - ~3KB core vs ~40KB+ frameworks
- ✅ **Explicit reactivity** - Know exactly what triggers what
- ❌ No component ecosystem
- ❌ Manual DOM updates (but that's the point!)

### vs. Alpine.js

- ✅ **Better for complex state** - Nested paths, cross-component communication
- ✅ **First-class SPA patterns** - Slot orchestration, intent-driven updates
- ✅ **More powerful subscriptions** - Path-based, wildcard support, granular control
- ✅ **Explicit data flow** - No magic, clear cause and effect
- ❌ More JavaScript required (Alpine is more declarative HTML)

### vs. Zustand/Jotai

- ✅ **Framework-agnostic** - Not tied to React
- ✅ **Path-based state** - More intuitive for deeply nested data
- ✅ **Wildcard subscriptions** - Subscribe to entire subtrees when needed
- ✅ **Simpler API** - Just get/set/subscribe, no atoms or stores
- ❌ Smaller ecosystem
- ❌ No React DevTools integration

## Use Cases

UIstate v5 excels at:

- ✅ **Internal dashboards** - Complex state, multiple data sources
- ✅ **Admin panels** - CRUD operations, forms, data tables
- ✅ **Financial applications** - Real-time updates, calculations
- ✅ **Data-heavy UIs** - Large datasets, filtered views
- ✅ **Multi-pane interfaces** - Independent but coordinated components
- ✅ **Progressive enhancement** - Add interactivity to server-rendered HTML

## Browser Support

- Chrome 60+
- Firefox 54+
- Safari 10.1+
- Edge 79+

## Migration from v4

UIstate v5 shifts focus from CSS-driven state to event-driven state. Key changes:

1. **eventState is now primary** - Import from root or `/eventState`
2. **cssState still available** - Import from `/cssState`
3. **New examples** - See `009-financial-dashboard`
4. **Breaking changes** - Major version bump

## Philosophy

UIstate challenges traditional assumptions:

- **State should be simple** - Paths + subscriptions, not selectors + reducers
- **Reactivity should be explicit** - Know what updates what
- **DOM updates can be fast** - Atomic replacements beat VDOM for many use cases
- **Components should own their subscriptions** - No global wildcards in production
- **Frameworks aren't always needed** - Pure JS + patterns can go far
- **Build steps should be optional** - ESM works in browsers
- **Intents are just paths** - No special event system needed

UIstate v5 represents lessons learned from building:
- Data tables with 1M+ rows
- Multi-tab synchronized state
- Workflowy-style nested lists
- Financial dashboards
- Admin panels

The core insight: **Most web UIs need reactive state and component orchestration, not a full framework.**

## Testing (Experimental)

UIstate includes `eventTest.js` for event-sequence testing:

**Note:** `eventTest.js` is dual-licensed. Free for personal/OSS use. Commercial use requires a separate license. See LICENSE-eventTest.md for details.

```javascript
import { createEventTest } from '@uistate/core/eventTest';

const test = createEventTest({ count: 0 });

test
  .trigger('intent.increment')
  .assertPath('count', 1)
  .assertEventFired('count', 1);
```

See `examples/010-event-testing` for more.

## License

**@uistate/core** is licensed under the **MIT License**, with an exception, as decribed next.

**Exception:** `eventTest.js` is licensed under a **proprietary license** that permits:
- ✅ Personal use
- ✅ Open-source projects
- ✅ Educational use

For **commercial use** of `eventTest.js`, please contact: [ajdika@live.com](mailto:ajdika@live.com)

See the file header in `eventTest.js` for full terms.

---

Copyright © 2025 Ajdin Imsirovic (ajdika@live.com)

- Core library: MIT License
- eventTest.js: Commercial License (free for personal/OSS)

## Links

- [GitHub](https://github.com/ImsirovicAjdin/uistate)
- [npm](https://www.npmjs.com/package/@uistate/core)
- [Issues](https://github.com/ImsirovicAjdin/uistate/issues)
