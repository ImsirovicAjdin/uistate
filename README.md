# @uistate/core

Path-based state management with wildcard subscriptions and async support.

[![npm version](https://img.shields.io/npm/v/@uistate/core.svg)](https://www.npmjs.com/package/@uistate/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

## Install

```bash
npm install @uistate/core
```

## Quick Start

```javascript
import { createEventState } from '@uistate/core';

const store = createEventState({ user: { name: 'Alice' }, count: 0 });

// Exact path
store.subscribe('count', (value) => console.log('Count:', value));

// Wildcard — fires on any child of 'user'
store.subscribe('user.*', ({ path, value }) => console.log(path, value));

// Global — fires on every change
store.subscribe('*', ({ path, value }) => console.log(path, value));

store.set('user.name', 'Bob');
store.set('count', 1);
```

## API

### `createEventState(initialState)`

Returns a store with `get`, `set`, `batch`, `setMany`, `subscribe`, `setAsync`, `cancel`, `destroy`.

### `store.get(path?)`

```javascript
store.get('user.name');  // 'Alice'
store.get('user');       // { name: 'Alice' }
store.get();             // entire state
```

### `store.set(path, value)`

Sets a value and notifies subscribers. Creates intermediate objects if needed.

```javascript
store.set('user.email', 'alice@example.com');
// state.user.email now exists even if it didn't before
```

### `store.subscribe(path, handler)`

Returns an unsubscribe function. Exact subscribers get `(value, detail)`. Wildcard/global subscribers get `(detail)` where detail is `{ path, value, oldValue }`.

```javascript
const unsub = store.subscribe('count', (value, { oldValue }) => {
  console.log(`${oldValue} → ${value}`);
});
unsub(); // cleanup
```

### `store.batch(fn)`

Batch multiple `set()` calls. Subscribers fire once per unique path after the batch completes, not during. Supports nesting.

```javascript
store.batch(() => {
  store.set('ui.route.view', 'user');
  store.set('ui.route.path', '/users/42');
  store.set('ui.route.params', { id: '42' });
});
// Subscribers fire here, once per path, all state consistent
```

### `store.setMany(entries)`

Set multiple paths atomically. Shorthand for `batch` + a loop of `set` calls. Accepts a plain object, an array of `[path, value]` pairs, or a `Map`.

```javascript
store.setMany({
  'ui.route.view': 'user',
  'ui.route.path': '/users/42',
  'ui.route.params': { id: '42' },
});
```

### `store.setAsync(path, fetcher)`

Manages async state at `${path}.status`, `${path}.data`, `${path}.error`. Supports abort on re-call.

```javascript
await store.setAsync('users', async (signal) => {
  const res = await fetch('/api/users', { signal });
  return res.json();
});
// store.get('users.data')   → [...]
// store.get('users.status') → 'success'
```

### `store.cancel(path)` / `store.destroy()`

Cancel an in-flight async operation, or tear down the entire store.

## Query Client

Convenience wrapper around `setAsync` for data-fetching patterns.

```javascript
import { createQueryClient } from '@uistate/core/query';

const qc = createQueryClient(store);
await qc.query('users', (signal) => fetch('/api/users', { signal }).then(r => r.json()));
qc.getData('users');
qc.getStatus('users');
qc.cancel('users');
qc.invalidate('users');
```

## Ecosystem

| Package | Description | License |
|---|---|---|
| [@uistate/core](https://www.npmjs.com/package/@uistate/core) | Path-based state management with wildcard subscriptions and async support | MIT |
| [@uistate/react](https://www.npmjs.com/package/@uistate/react) | React adapter — `usePath`, `useIntent`, `useAsync` hooks and `EventStateProvider` | MIT |
| [@uistate/css](https://www.npmjs.com/package/@uistate/css) | CSS-native state via custom properties and data attributes | MIT |
| [@uistate/event-test](https://www.npmjs.com/package/@uistate/event-test) | Event-sequence testing for UIstate stores | Proprietary |
| [@uistate/examples](https://www.npmjs.com/package/@uistate/examples) | Example applications and patterns | MIT |
| [@uistate/renderer](https://www.npmjs.com/package/@uistate/renderer) | Direct-binding reactive renderer: `bind-*`, `set`, `each` attributes. Zero build step | Proprietary |
| [@uistate/aliases](https://www.npmjs.com/package/@uistate/aliases) | Ergonomic single-character and short-name DOM aliases for vanilla JS | MIT |

📖 **Documentation:** [uistate.com](https://uistate.com)

## License

MIT — see [LICENSE](./LICENSE).

Copyright © 2025 Ajdin Imsirovic

## Links

- [Documentation](https://uistate.com)
- [GitHub](https://github.com/ImsirovicAjdin/uistate)
- [npm](https://www.npmjs.com/package/@uistate/core)
- [Issues](https://github.com/ImsirovicAjdin/uistate/issues)
