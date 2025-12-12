// bridges.app.js
// App-level intent → domain bridges and derived wildcard bridges
// Mirrors patterns proven in examples 300d (intent bridge) and 300e (derived wildcard).

import store from './store.js';

// ------------------------------
// Selection: intent → domain
// ------------------------------
store.subscribe('intent.selection.toggle', (payload) => {
  const cur = store.get('ui.selection.ids') || [];
  const set = new Set(Array.isArray(cur) ? cur : []);
  let id, checked;
  if (payload && typeof payload === 'object') { id = payload.id; checked = payload.checked; }
  else { id = payload; checked = undefined; }
  const key = String(id);
  if (checked === undefined) {
    // toggle membership
    if (set.has(key)) set.delete(key); else set.add(key);
  } else {
    if (checked) set.add(key); else set.delete(key);
  }
  const next = Array.from(set);
  store.set('ui.selection.ids', next);
});

// Derived: selection count
store.subscribe('ui.selection.ids', () => {
  const ids = store.get('ui.selection.ids') || [];
  const next = Array.isArray(ids) ? ids.length : 0;
  if (store.get('ui.selection.count') !== next) store.set('ui.selection.count', next);
});

// ------------------------------
// Quotes: async fetch with last-request-wins
// ------------------------------
let quotesReqId = 0;
store.subscribe('intent.quotes.load', ({ url, ttlMs }) => {
  quotesReqId += 1;
  const myId = quotesReqId;
  store.set('ui.quotes.loading', true);
  store.set('ui.quotes.error', null);

  const doFetch = (globalThis.fetch ? globalThis.fetch(String(url)) : Promise.reject(new Error('fetch unavailable')));
  doFetch
    .then(async (res) => {
      if (myId !== quotesReqId) return; // stale
      if (!res.ok) throw new Error('HTTP ' + (res.status || 'error'));
      const data = await res.json();
      store.set('ui.quotes.data', data);
    })
    .catch((err) => {
      if (myId !== quotesReqId) return; // stale
      store.set('ui.quotes.error', String(err && err.message || err));
    })
    .finally(() => {
      if (myId !== quotesReqId) return; // stale
      store.set('ui.quotes.loading', false);
    });
});

// Derived: quotes empty
const updateQuotesEmpty = () => {
  const d = store.get('ui.quotes?.data') ?? store.get('ui.quotes.data');
  const empty = Array.isArray(d) ? d.length === 0 : (d == null);
  if (store.get('ui.quotes.empty') !== empty) store.set('ui.quotes.empty', empty);
};
store.subscribe('ui.quotes.data', updateQuotesEmpty);
store.subscribe('ui.quotes.error', updateQuotesEmpty);

// ------------------------------
// Items: derived helpers for repeaters
// ------------------------------
const updateItemsMeta = () => {
  const items = store.get('ui.items');
  const count = Array.isArray(items) ? items.length : 0;
  if (store.get('ui.itemsCount') !== count) store.set('ui.itemsCount', count);
  const empty = count === 0;
  if (store.get('ui.empty') !== empty) store.set('ui.empty', empty);
};
store.subscribe('ui.items', updateItemsMeta);
try { updateItemsMeta(); } catch {}

// ------------------------------
// Todos: imperative renderer-friendly bridges
// ------------------------------
// Add todo
store.subscribe('intent.todo.add', ({ text }) => {
  const items = store.get('domain.todos.items') || [];
  const nextId = items.reduce((m, t) => Math.max(m, Number(t?.id || 0)), 0) + 1;
  const todo = { id: nextId, text: String(text || '').trim(), done: false };
  if (!todo.text) return;
  store.set('domain.todos.items', [...items, todo]);
});

// Toggle todo
store.subscribe('intent.todo.toggle', ({ id }) => {
  const items = store.get('domain.todos.items') || [];
  const out = items.map(t => (String(t?.id) === String(id)) ? { ...t, done: !t.done } : t);
  store.set('domain.todos.items', out);
});

// Clear completed
store.subscribe('intent.todo.clearCompleted', () => {
  const items = store.get('domain.todos.items') || [];
  store.set('domain.todos.items', items.filter(t => !t.done));
});

// UI filter
store.subscribe('intent.ui.filter', ({ filter }) => {
  const f = (filter === 'active' || filter === 'completed') ? filter : 'all';
  store.set('ui.todos.filter', f);
});
