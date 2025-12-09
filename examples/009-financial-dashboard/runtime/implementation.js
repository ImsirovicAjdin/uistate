import { createEventState } from './eventState.js';
// import { createEventState } from '@uistate/core/eventState.js';

// eventState store
const store = createEventState({ domain: {}, ui: {}, view: { slots: {} } });
const APP = document.getElementById('app');
const STATE = document.getElementById('state');

let currentViewBase = location.href;
const loadedCSS = new Set();

function applyHead(head = {}) {
  const css = head.css || [];
  css.forEach((href) => {
    const abs = new URL(href, currentViewBase).href;
    if (loadedCSS.has(abs)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = abs;
    document.head.appendChild(link);
    loadedCSS.add(abs);
  });
}

async function fetchJSON(url) { const r = await fetch(url); if (!r.ok) throw new Error('fetch failed ' + url); return r.json(); }
async function fetchHTML(url) { const r = await fetch(url); if (!r.ok) throw new Error('fetch failed ' + url); return r.text(); }

// Mount master layout once
async function mountMaster(master) {
  applyHead(master.head);
  if (master.state && typeof master.state === 'object') hydrateMerge('', master.state);
  // Mount layout
  const host = document.querySelector('#app');
  host.replaceChildren();
  const layoutAbs = new URL(master.layout.component, currentViewBase).href;
  const html = await fetchHTML(layoutAbs);
  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-key', 'layout');
  wrapper.innerHTML = html;
  host.appendChild(wrapper);
  wireLayout(wrapper, master.layout.bindings || {});
}

function hydrateMerge(prefix, value) {
  if (Array.isArray(value)) { store.set(prefix, value); return; }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) hydrateMerge(prefix ? `${prefix}.${k}` : k, v);
  } else { store.set(prefix || '', value); }
}

function wireLayout(root, bindings) {
  // Simple title binding
  const titleSel = root.querySelector('[data-bind="title"]');
  const path = bindings.title;
  if (titleSel && path) {
    store.subscribe(path, (v) => { titleSel.textContent = String(v ?? ''); });
    const v = store.get(path); if (v !== undefined) titleSel.textContent = String(v);
  }
  // Three buttons for swapping content in 'positions' slot
  const btnTodos = root.querySelector('#viewTodos');
  const btnDebts = root.querySelector('#viewDebts');
  const btnSales = root.querySelector('#viewOutline');

  btnTodos?.addEventListener('click', () => {
    store.set('ui.view.active', 'todos');
    store.set('intent.slot.load', { slot: 'positions', url: './views/todos.slot.json' });
  });
  btnDebts?.addEventListener('click', () => {
    store.set('ui.view.active', 'debts');
    store.set('intent.slot.load', { slot: 'positions', url: './views/debts.slot.json' });
  });
  btnSales?.addEventListener('click', () => {
    store.set('ui.view.active', 'sales');
    store.set('intent.slot.load', { slot: 'positions', url: './views/sales.slot.json' });
  });

  function renderActive(){
    const active = store.get('ui.view.active') || 'debts';
    if (btnTodos && btnDebts && btnSales){
      [btnTodos, btnDebts, btnSales].forEach(btn => {
        btn.classList.remove('btn-primary', 'active');
        btn.classList.add('btn-outline-primary');
      });
      
      const activeBtn = active === 'todos' ? btnTodos : active === 'sales' ? btnSales : btnDebts;
      activeBtn.classList.add('btn-primary', 'active');
      activeBtn.classList.remove('btn-outline-primary');
    }
  }
  store.subscribe('ui.view.active', renderActive); renderActive();
  
  // Toggle KPI and News visibility when todos are active
  store.subscribe('ui.view.active', (active) => {
    const kpiCol = root.querySelector('[data-slot="kpi"]').closest('.col-12');
    const newsCol = root.querySelector('[data-slot="news"]').closest('.col-12');
    const positionsCol = root.querySelector('[data-slot="positions"]').closest('.col-12');
    
    if (active === 'todos') {
      kpiCol.classList.add('d-none');
      newsCol.classList.add('d-none');
      positionsCol.classList.remove('col-md-6', 'col-lg-4');
      positionsCol.classList.add('col-md-12', 'col-lg-8');
    } else {
      kpiCol.classList.remove('d-none');
      newsCol.classList.remove('d-none');
      positionsCol.classList.remove('col-md-12', 'col-lg-8');
      positionsCol.classList.add('col-md-6', 'col-lg-4');
    }
  });

  // Inspector toggle
  const stateEl = document.getElementById('state');
  const toggleBtn = root.querySelector('#toggleInspector');

  toggleBtn?.addEventListener('click', () => {
    stateEl.classList.toggle('open');
    toggleBtn.textContent = stateEl.classList.contains('open') ? '❌ Inspector' : 'Inspector';
  });
}

async function loadSlot({ slot, url }) {
  if (!slot || !url) return;
  const abs = new URL(url, location.href).href;
  const sub = await fetchJSON(abs);
  // Apply optional state deltas from subview
  if (sub.state && typeof sub.state === 'object') hydrateMerge('', sub.state);
  // Resolve component and html
  const compAbs = new URL(sub.component, abs).href;
  const html = await fetchHTML(compAbs);
  const el = document.createElement('div');
  el.innerHTML = html;
  const slotHost = document.querySelector(`[data-slot="${slot}"]`);
  if (!slotHost) return;
  // Atomic replace
  slotHost.replaceChildren(el);
  wireSlotComponent(sub, el);
}

function wireSlotComponent(sub, root) {
  const comp = sub.component.split('/').pop();
  const bindings = sub.bindings || {};
  if (comp === 'TodoList.html') return wireTodoList(root, bindings);
  // if (comp === 'Outline.html') return wireOutline(root, bindings);
  if (comp === 'KPI.html') return wireKPI(root, bindings);
  // if (comp === 'Positions.html') return wirePositions(root, bindings);
  if (comp === 'News.html') return wireNews(root, bindings);
  if (comp === 'Debts.html') return wireDebts(root, bindings);
  if (comp === 'Sales.html') return wireSales(root, bindings);
}

function wireTodoList(root, bindings) {
  const input = root.querySelector('#newTodo');
  const btnAdd = root.querySelector('#addTodo');
  const ul = root.querySelector('#todos');
  const btnAll = root.querySelector('#fAll');
  const btnAct = root.querySelector('#fActive');
  const btnDone = root.querySelector('#fCompleted');
  const btnClear = root.querySelector('#clearCompleted');
  const itemsPath = bindings.items || 'domain.todos.items';
  const filterPath = bindings.filter || 'ui.todos.filter';

  btnAdd?.addEventListener('click', () => {
    const text = (input?.value || '').trim();
    if (!text) return;
    store.set('intent.todo.add', { text });
    input.value = '';
  });
  input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') btnAdd?.click(); });
  btnAll?.addEventListener('click', () => store.set('intent.ui.filter', { filter: 'all' }));
  btnAct?.addEventListener('click', () => store.set('intent.ui.filter', { filter: 'active' }));
  btnDone?.addEventListener('click', () => store.set('intent.ui.filter', { filter: 'completed' }));
  btnClear?.addEventListener('click', () => store.set('intent.todo.clearCompleted'));

  function render() {
    const items = store.get(itemsPath) || [];
    const filter = store.get(filterPath) || 'all';
    ul.replaceChildren();
    const rows = items.filter((t) => filter === 'all' || (filter === 'active' ? !t.done : t.done));
    rows.forEach((t) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex align-items-center gap-2';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!t.done;
      cb.addEventListener('change', () => store.set('intent.todo.toggle', { id: t.id }));
      const span = document.createElement('span');
      span.textContent = t.text;
      if (t.done) span.style.textDecoration = 'line-through';
      li.appendChild(cb);
      li.appendChild(span);
      ul.appendChild(li);
    });
  }
  store.subscribe(itemsPath, render);
  store.subscribe(filterPath, render);
  render();
}

// Intents
let nextId = 3;
store.subscribe('intent.todo.add', ({ text }) => {
  const items = store.get('domain.todos.items') || [];
  store.set('domain.todos.items', [...items, { id: nextId++, text, done: false }]);
});
store.subscribe('intent.todo.toggle', ({ id }) => {
  const items = store.get('domain.todos.items') || [];
  const out = items.map((t) => t.id === id ? { ...t, done: !t.done } : t);
  store.set('domain.todos.items', out);
});
store.subscribe('intent.todo.clearCompleted', () => {
  const items = store.get('domain.todos.items') || [];
  store.set('domain.todos.items', items.filter((t) => !t.done));
});
store.subscribe('intent.ui.filter', ({ filter }) => store.set('ui.todos.filter', filter));

// // Outline intents
// let nextOutlineId = 1;
// store.subscribe('intent.outline.add', ({ text }) => {
//   const items = store.get('domain.outline.items') || [];
//   const id = nextOutlineId++;
//   store.set('domain.outline.items', [...items, { id, text }]);
// });

store.subscribe('intent.slot.load', loadSlot);

// Inspector
function renderState() {
  try { STATE.textContent = JSON.stringify(store.get(), null, 2); } catch { STATE.textContent = String(store.get()); }
}
store.subscribe('*', renderState);
renderState();

// Boot master
(async function boot() {
  const viewUrl = './views/master.json';
  const abs = new URL(viewUrl, location.href).href;
  currentViewBase = abs;
  const master = await fetchJSON(abs);
  await mountMaster(master);
  // Load all declared slots (multi-slot dashboard)
  const slots = master.slots || {};
  for (const [slot, cfg] of Object.entries(slots)) {
    if (cfg && cfg.url) await loadSlot({ slot, url: cfg.url });
  }
})();

// --- Finance components wiring --------------------------------------------
function wireKPI(root, bindings){
  // bindings: total, pnl, dailyChange
  const $total = root.querySelector('[data-field="total"]');
  const $pnl = root.querySelector('[data-field="pnl"]');
  const $daily = root.querySelector('[data-field="daily"]');
  const b = Object.assign({ total: 'finance.kpi.total', pnl: 'finance.kpi.pnl', daily: 'finance.kpi.daily' }, bindings);
  function render(){
    const t = store.get(b.total) ?? 0; const p = store.get(b.pnl) ?? 0; const d = store.get(b.daily) ?? 0;
    if ($total) $total.textContent = String(t.toFixed ? t.toFixed(2) : t);
    if ($pnl) $pnl.textContent = String(p.toFixed ? p.toFixed(2) : p);
    if ($daily) $daily.textContent = String(d.toFixed ? d.toFixed(2) : d);
  }
  store.subscribe(b.total, render); store.subscribe(b.pnl, render); store.subscribe(b.daily, render); render();
}

function wireNews(root, bindings){
  const ul = root.querySelector('ul');
  const path = bindings.items || 'finance.news.items';
  function render(){
    const items = store.get(path) || [];
    ul.replaceChildren();
    items.forEach((n)=>{
      const li = document.createElement('li');
      const a = document.createElement('a'); a.href = n.url || '#'; a.textContent = n.title; a.target = '_blank';
      li.appendChild(a); ul.appendChild(li);
    });
  }
  store.subscribe(path, render); render();
}

function wireDebts(root, bindings){
  const tbody = root.querySelector('tbody');
  const path = bindings.items || 'finance.debts.items';
  function render(){
    const rows = store.get(path) || [];
    tbody.replaceChildren();
    rows.forEach((r)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.creditor}</td><td>${r.amount.toFixed ? r.amount.toFixed(2) : r.amount}</td><td>${r.due}</td>`;
      tbody.appendChild(tr);
    });
  }
  store.subscribe(path, render); render();
}

function wireSales(root, bindings){
  const tbody = root.querySelector('tbody');
  const path = bindings.items || 'finance.sales.items';
  function render(){
    const rows = store.get(path) || [];
    tbody.replaceChildren();
    rows.forEach((r)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.customer}</td><td>${r.amount.toFixed ? r.amount.toFixed(2) : r.amount}</td><td>${r.date}</td>`;
      tbody.appendChild(tr);
    });
  }
  store.subscribe(path, render); render();
}
