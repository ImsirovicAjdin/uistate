/**
 * @uistate/core — eventTest-based integration tests
 *
 * Merged from test-batch.js and test-batch-dogfood.js.
 * Tests batch, setMany, setAsync, destroy, and core regression tests
 * using @uistate/event-test.
 */

import { createEventTest, runTests } from '@uistate/event-test';
import { createEventState } from '@uistate/core';

const results = runTests({

  // ── batch ─────────────────────────────────────────────────────────

  'batch: coalesces — same-path deduplication': () => {
    const t = createEventTest({ count: 0 });
    t.store.batch(() => {
      t.trigger('count', 1);
      t.trigger('count', 2);
      t.trigger('count', 3);
    });
    t.assertPath('count', 3);
    t.assertEventFired('count', 1);
  },

  'batch: fires once per unique path after flush': () => {
    const t = createEventTest({ user: { name: 'Alice', email: 'a@b.com' } });
    t.store.batch(() => {
      t.trigger('user.name', 'Bob');
      t.trigger('user.email', 'bob@b.com');
    });
    t.assertPath('user.name', 'Bob');
    t.assertPath('user.email', 'bob@b.com');
    t.assertEventFired('user.name', 1);
    t.assertEventFired('user.email', 1);
  },

  'batch: no notifications during, only after': () => {
    const store = createEventState({ x: 0 });
    const seen = [];
    store.subscribe('x', (v) => seen.push(v));
    store.batch(() => {
      store.set('x', 1);
      if (seen.length !== 0) throw new Error('Notification fired during batch');
      store.set('x', 2);
      if (seen.length !== 0) throw new Error('Notification fired during batch');
    });
    if (seen.length !== 1) throw new Error(`Expected 1 notification after batch, got ${seen.length}`);
    if (seen[0] !== 2) throw new Error(`Expected final value 2, got ${seen[0]}`);
    store.destroy();
  },

  'batch: nested — only outermost flushes': () => {
    const t = createEventTest({ a: 0, b: 0 });
    t.store.batch(() => {
      t.trigger('a', 1);
      t.store.batch(() => {
        t.trigger('b', 2);
      });
    });
    t.assertPath('a', 1);
    t.assertPath('b', 2);
    t.assertEventFired('a', 1);
    t.assertEventFired('b', 1);
  },

  'batch: get() during batch reads committed state (not buffer)': () => {
    const store = createEventState({ v: 'old' });
    store.batch(() => {
      store.set('v', 'new');
      const read = store.get('v');
      if (read !== 'old') {
        throw new Error(`get() during batch should read committed state, got "${read}"`);
      }
    });
    if (store.get('v') !== 'new') {
      throw new Error('After batch, get() should read new value');
    }
    store.destroy();
  },

  // ── setMany ───────────────────────────────────────────────────────

  'setMany: plain object': () => {
    const t = createEventTest({});
    t.store.setMany({
      'ui.route.view': 'home',
      'ui.route.path': '/',
      'ui.route.params': {},
    });
    t.assertPath('ui.route.view', 'home');
    t.assertPath('ui.route.path', '/');
    t.assertType('ui.route.view', 'string');
    t.assertType('ui.route.path', 'string');
    t.assertShape('ui.route.params', {});
  },

  'setMany: array of [path, value] pairs': () => {
    const t = createEventTest({});
    t.store.setMany([
      ['a.b', 1],
      ['a.c', 2],
    ]);
    t.assertPath('a.b', 1);
    t.assertPath('a.c', 2);
    t.assertType('a.b', 'number');
    t.assertType('a.c', 'number');
  },

  'setMany: Map': () => {
    const t = createEventTest({});
    const m = new Map([['x.y', 'hello'], ['x.z', 'world']]);
    t.store.setMany(m);
    t.assertPath('x.y', 'hello');
    t.assertPath('x.z', 'world');
  },

  // ── setAsync ──────────────────────────────────────────────────────

  'setAsync: batches loading phase writes': () => {
    const store = createEventState({});
    let wildcardFires = 0;
    store.subscribe('users.*', () => { wildcardFires++; });

    const promise = store.setAsync('users', async (signal) => {
      return [{ id: 1, name: 'Alice' }];
    });

    if (wildcardFires !== 2) {
      throw new Error(`Loading phase: expected 2 wildcard fires, got ${wildcardFires}`);
    }
    if (store.get('users.status') !== 'loading') {
      throw new Error(`Expected status=loading, got ${store.get('users.status')}`);
    }
    if (store.get('users.error') !== null) {
      throw new Error(`Expected error=null, got ${store.get('users.error')}`);
    }

    promise.catch(() => {});
    store.destroy();
  },

  'setAsync: batches success phase writes': async () => {
    const store = createEventState({});
    await store.setAsync('data', async () => ({ result: 42 }));

    if (store.get('data.status') !== 'success') {
      throw new Error(`Expected status=success, got ${store.get('data.status')}`);
    }
    if (store.get('data.data')?.result !== 42) {
      throw new Error('Expected data.result=42');
    }
    store.destroy();
  },

  'setAsync: full wildcard fire count': async () => {
    const store = createEventState({});
    let wildcardFires = 0;
    store.subscribe('users.*', () => { wildcardFires++; });

    await store.setAsync('users', async (signal) => {
      return [{ id: 1, name: 'Alice' }];
    });

    // Loading: status+error = 2, Success: data+status = 2, Total = 4
    if (wildcardFires !== 4) {
      throw new Error(`Expected 4 wildcard fires, got ${wildcardFires}`);
    }
    if (store.get('users.status') !== 'success') {
      throw new Error(`Expected status=success`);
    }
    if (!Array.isArray(store.get('users.data'))) {
      throw new Error('Expected data to be array');
    }
    store.destroy();
  },

  // ── destroy ───────────────────────────────────────────────────────

  'destroy: batch throws after destroy': () => {
    const store = createEventState({ z: 0 });
    store.destroy();
    let threw = false;
    try { store.batch(() => {}); } catch { threw = true; }
    if (!threw) throw new Error('batch() should throw after destroy');
  },

  'destroy: setMany throws after destroy': () => {
    const store = createEventState({ z: 0 });
    store.destroy();
    let threw = false;
    try { store.setMany({ a: 1 }); } catch { threw = true; }
    if (!threw) throw new Error('setMany() should throw after destroy');
  },

  // ── core regression ───────────────────────────────────────────────

  'core: basic get/set/subscribe': () => {
    const t = createEventTest({ name: 'Alice' });
    t.trigger('name', 'Bob');
    t.assertPath('name', 'Bob');
    t.assertType('name', 'string');
    t.assertEventFired('name', 1);
  },

  'core: wildcard subscription': () => {
    const t = createEventTest({ user: { name: 'Alice', age: 30 } });
    t.trigger('user.name', 'Bob');
    t.trigger('user.age', 31);
    t.assertPath('user.name', 'Bob');
    t.assertPath('user.age', 31);
  },

  'core: nested path auto-creation': () => {
    const t = createEventTest({});
    t.trigger('deep.nested.path', 'value');
    t.assertPath('deep.nested.path', 'value');
    t.assertType('deep.nested.path', 'string');
  },

  'core: type assertions for type generation': () => {
    const t = createEventTest({
      count: 0,
      user: { name: 'Alice', active: true },
      items: [{ id: 1, text: 'Todo' }],
    });
    t.assertType('count', 'number');
    t.assertShape('user', { name: 'string', active: 'boolean' });
    t.assertArrayOf('items', { id: 'number', text: 'string' });

    const types = t.getTypeAssertions();
    if (types.length !== 3) throw new Error(`Expected 3 type assertions, got ${types.length}`);
  },
});

if (results.failed > 0) process.exit(1);
