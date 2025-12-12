// views/todoDemo.js — Minimal Todo app demo (imperative renderer, no bootstrap)
export async function boot({ store, el, signal }){
  const main = document.createElement('main');
  main.innerHTML = `
    <h1>Todo app demo</h1>
    <section class="beh-section">
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap">
        <input id="newTodo" placeholder="New todo" />
        <button id="addTodo" class="btn">Add</button>
        <div style="display:flex; gap:6px; align-items:center">
          <button id="fAll" class="btn">All</button>
          <button id="fActive" class="btn">Active</button>
          <button id="fCompleted" class="btn">Completed</button>
          <button id="clearCompleted" class="btn" style="background:#b91c1c; color:white">Clear Completed</button>
        </div>
        <span id="filterBadge" style="padding:2px 6px; border:1px solid #888; border-radius:8px; font-size:.85em; color:#555">filter: all</span>
      </div>
      <ul id="todos" style="margin-top:10px; padding-left: 18px;"></ul>
    </section>
  `;
  el.appendChild(main);

  const input = main.querySelector('#newTodo');
  const ul = main.querySelector('#todos');
  const btnAdd = main.querySelector('#addTodo');
  const btnAll = main.querySelector('#fAll');
  const btnAct = main.querySelector('#fActive');
  const btnDone = main.querySelector('#fCompleted');
  const btnClear = main.querySelector('#clearCompleted');

  // Intents from UI
  btnAdd?.addEventListener('click', () => {
    const text = (input?.value || '').trim();
    if (!text) return; store.set('intent.todo.add', { text }); input.value = '';
  });
  input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') btnAdd?.click(); });
  btnAll?.addEventListener('click', () => store.set('intent.ui.filter', { filter: 'all' }));
  btnAct?.addEventListener('click', () => store.set('intent.ui.filter', { filter: 'active' }));
  btnDone?.addEventListener('click', () => store.set('intent.ui.filter', { filter: 'completed' }));
  btnClear?.addEventListener('click', () => store.set('intent.todo.clearCompleted'));

  // Render
  const itemsPath = 'domain.todos.items';
  const filterPath = 'ui.todos.filter';
  function render(){
    const items = store.get(itemsPath) || [];
    const filter = store.get(filterPath) || 'all';
    const badge = main.querySelector('#filterBadge');
    if (badge) badge.textContent = `filter: ${filter}`;
    ul.replaceChildren();
    let rows = items;
    if (filter === 'active') rows = items.filter(t => !t.done);
    else if (filter === 'completed') rows = items.filter(t => !!t.done);
    rows.forEach((t) => {
      const li = document.createElement('li');
      li.style.display = 'flex'; li.style.gap = '8px'; li.style.alignItems = 'center';
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!t.done;
      cb.addEventListener('change', () => store.set('intent.todo.toggle', { id: t.id }));
      const span = document.createElement('span'); span.textContent = t.text; if (t.done) span.style.textDecoration = 'line-through';
      li.appendChild(cb); li.appendChild(span); ul.appendChild(li);
    });
  }
  const off1 = store.subscribe(itemsPath, render);
  const off2 = store.subscribe(filterPath, render);
  render();

  if (signal) signal.addEventListener('abort', () => { try { off1 && off1(); off2 && off2(); } catch {} });
  return () => { try { off1 && off1(); off2 && off2(); } catch {} };
}
