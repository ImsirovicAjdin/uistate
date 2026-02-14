/**
 * @uistate/core — self-test
 *
 * Standalone test of core EventState functionality. No dependencies beyond eventState.js.
 * Runs on `node self-test.js` or as a postinstall hook.
 */

import { createEventState } from './eventState.js';

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`);
  }
}

console.log('\n1. get / set');
const s1 = createEventState({ count: 0, user: { name: 'Alice', age: 30 } });

assert('get: primitive', s1.get('count') === 0);
assert('get: nested', s1.get('user.name') === 'Alice');
assert('get: object', s1.get('user')?.name === 'Alice');
assert('get: entire state', s1.get('')?.count === 0);
assert('get: missing path → undefined', s1.get('nonexistent') === undefined);
assert('get: deep missing → undefined', s1.get('user.email') === undefined);

s1.set('count', 5);
assert('set: primitive', s1.get('count') === 5);

s1.set('user.name', 'Bob');
assert('set: nested', s1.get('user.name') === 'Bob');

s1.set('user.email', 'bob@example.com');
assert('set: auto-creates path', s1.get('user.email') === 'bob@example.com');

s1.set('deep.nested.path', 'value');
assert('set: deep auto-create', s1.get('deep.nested.path') === 'value');

s1.destroy();

console.log('\n2. subscribe: exact path');
const s2 = createEventState({ count: 0 });
let lastValue = null;
let fireCount = 0;

const unsub = s2.subscribe('count', (value) => {
  lastValue = value;
  fireCount++;
});

s2.set('count', 1);
assert('subscribe: fires on change', fireCount === 1);
assert('subscribe: receives value', lastValue === 1);

s2.set('count', 2);
assert('subscribe: fires again', fireCount === 2);
assert('subscribe: receives new value', lastValue === 2);

unsub();
s2.set('count', 3);
assert('unsubscribe: stops firing', fireCount === 2);
assert('unsubscribe: value unchanged in handler', lastValue === 2);
assert('set still works after unsub', s2.get('count') === 3);

s2.destroy();

console.log('\n3. subscribe: wildcard');
const s3 = createEventState({ user: { name: 'Alice', age: 30 } });
let wildcardFires = 0;
let wildcardDetail = null;

s3.subscribe('user.*', (detail) => {
  wildcardFires++;
  wildcardDetail = detail;
});

s3.set('user.name', 'Bob');
assert('wildcard: fires on child change', wildcardFires === 1);
assert('wildcard: detail has path', wildcardDetail?.path === 'user.name');
assert('wildcard: detail has value', wildcardDetail?.value === 'Bob');

s3.set('user.age', 31);
assert('wildcard: fires on other child', wildcardFires === 2);

s3.destroy();

console.log('\n4. subscribe: global');
const s4 = createEventState({ a: 1, b: { c: 2 } });
let globalFires = 0;

s4.subscribe('*', () => { globalFires++; });

s4.set('a', 10);
assert('global: fires on root path', globalFires === 1);

s4.set('b.c', 20);
assert('global: fires on nested path', globalFires === 2);

s4.destroy();

console.log('\n5. batch');
const s5 = createEventState({ x: 0, y: 0 });
let batchFires = 0;
s5.subscribe('*', () => { batchFires++; });

s5.batch(() => {
  s5.set('x', 1);
  s5.set('y', 2);
});
assert('batch: fires after (not during)', batchFires === 2);
assert('batch: x set', s5.get('x') === 1);
assert('batch: y set', s5.get('y') === 2);

// Deduplication
batchFires = 0;
s5.batch(() => {
  s5.set('x', 10);
  s5.set('x', 20);
  s5.set('x', 30);
});
assert('batch: deduplicates same path (1 fire)', batchFires === 1);
assert('batch: last write wins', s5.get('x') === 30);

// Nested batch
batchFires = 0;
s5.batch(() => {
  s5.set('x', 100);
  s5.batch(() => {
    s5.set('y', 200);
  });
});
assert('nested batch: both fire after outermost', batchFires === 2);
assert('nested batch: x', s5.get('x') === 100);
assert('nested batch: y', s5.get('y') === 200);

// No notifications during batch
const seen = [];
const s5b = createEventState({ v: 0 });
s5b.subscribe('v', (val) => seen.push(val));
s5b.batch(() => {
  s5b.set('v', 1);
  s5b.set('v', 2);
});
assert('batch: no mid-batch notifications', seen.length === 1);
assert('batch: final value delivered', seen[0] === 2);

s5.destroy();
s5b.destroy();

console.log('\n6. setMany');
const s6 = createEventState({});

// Plain object
s6.setMany({ 'a.b': 1, 'a.c': 2 });
assert('setMany object: a.b', s6.get('a.b') === 1);
assert('setMany object: a.c', s6.get('a.c') === 2);

// Array of pairs
s6.setMany([['x.y', 'hello'], ['x.z', 'world']]);
assert('setMany array: x.y', s6.get('x.y') === 'hello');
assert('setMany array: x.z', s6.get('x.z') === 'world');

// Map
s6.setMany(new Map([['m.a', true], ['m.b', false]]));
assert('setMany Map: m.a', s6.get('m.a') === true);
assert('setMany Map: m.b', s6.get('m.b') === false);

s6.destroy();

console.log('\n7. destroy');
const s7 = createEventState({ z: 0 });
s7.destroy();

let threw = false;
try { s7.get('z'); } catch { threw = true; }
assert('destroy: get throws', threw);

threw = false;
try { s7.set('z', 1); } catch { threw = true; }
assert('destroy: set throws', threw);

threw = false;
try { s7.batch(() => {}); } catch { threw = true; }
assert('destroy: batch throws', threw);

threw = false;
try { s7.setMany({ a: 1 }); } catch { threw = true; }
assert('destroy: setMany throws', threw);

threw = false;
try { s7.subscribe('z', () => {}); } catch { threw = true; }
assert('destroy: subscribe throws', threw);

console.log('\n8. subscribe: detail object');
const s8 = createEventState({ count: 10 });
let detail = null;
s8.subscribe('count', (value, d) => { detail = d; });
s8.set('count', 20);
assert('detail: has path', detail?.path === 'count');
assert('detail: has value', detail?.value === 20);
assert('detail: has oldValue', detail?.oldValue === 10);

s8.destroy();

// Results

console.log(`\n@uistate/core v5.6.1 — self-test`);
console.log(`✓ ${passed} assertions passed${failed ? `, ✗ ${failed} failed` : ''}\n`);

if (failed > 0) process.exit(1);
