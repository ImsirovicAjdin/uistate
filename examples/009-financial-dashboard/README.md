# Financial Dashboard Example

A complete multi-slot dashboard demonstrating UIstate v5's architecture patterns:

- **Slot Orchestration** - Atomic component swapping without layout shift
- **Intent-Driven Updates** - Declarative command handling
- **Path-Based Subscriptions** - Granular reactivity
- **Component Lifecycle** - Proper cleanup and hot-swapping

## Features

- Multi-slot dashboard layout with independent components
- TodoList with filtering (all/active/completed) - loaded in 'todos' slot
- Outline note-taking component - loaded in 'outline' slot
- Financial data tables (KPI, Positions, Debts, Sales, News)
- Real-time state inspector
- Button-driven slot swapping (toggle between Debts and Sales views)

## Running the Example

### Option 1: After Installing via npm

If you installed `@uistate/core` via npm, the example is ready to run:

```bash
cd node_modules/@uistate/core/examples/009-financial-dashboard
npx serve .
```

Then open http://localhost:3000

### Option 2: From Source (Development)

If you're working from the GitHub repository:

```bash
# 1. Navigate to the package root
cd /path/to/uistate/github-and-npm/uistate

# 2. Link the package globally
npm link

# 3. Navigate to the example
cd examples/009-financial-dashboard

# 4. Link the package locally (makes @uistate/core resolve)
npm link @uistate/core

# 5. Serve the example
npx serve .
```

Then open http://localhost:3000

### Option 3: Using CDN (No Installation)

For quick testing without npm, modify `runtime/implementation.js` to use the CDN:

```javascript
// Comment out the npm import
// import { createEventState } from '@uistate/core/eventState.js';

// Use CDN instead
import { createEventState } from 'https://cdn.jsdelivr.net/npm/@uistate/core/eventState.js';

// Or use raw GitHub (latest from main branch)
// import { createEventState } from 'https://raw.githubusercontent.com/ImsirovicAjdin/uistate/main/eventState.js';
```

Then serve with:

```bash
npx serve .
```

## What to Explore

1. **Slot Swapping** - Click "View Debts" / "View Sales" buttons to toggle financial data in the positions slot
2. **TodoList** - Pre-loaded in its own slot - add items, toggle completion, filter by status
3. **Outline** - Pre-loaded in its own slot - add nested notes
4. **State Inspector** - Watch the entire state tree update in real-time (right panel)
5. **Financial Tables** - See how different data types are rendered and hot-swapped

## Architecture Highlights

### Intent-Driven Pattern

```javascript
// Intents are just state paths
store.subscribe('intent.todo.add', ({ text }) => {
  const items = store.get('domain.todos.items') || [];
  store.set('domain.todos.items', [...items, { id: Date.now(), text, done: false }]);
});

// Triggered from UI
button.addEventListener('click', () => {
  store.set('intent.todo.add', { text: input.value });
});
```

### Slot Orchestration

```javascript
// Load component into slot atomically
async function loadSlot({ slot, url }) {
  const config = await fetchJSON(url);
  const html = await fetchHTML(config.component);
  const slotHost = document.querySelector(`[data-slot="${slot}"]`);
  
  slotHost.replaceChildren(createFragment(html));
  wireComponent(slotHost, config.bindings);
}

store.subscribe('intent.slot.load', loadSlot);
```

### Component Bindings

```javascript
function wireComponent(root, bindings) {
  const itemsPath = bindings.items || 'domain.items';
  
  store.subscribe(itemsPath, (items) => {
    // Render logic
  });
  
  // Initial render
  const items = store.get(itemsPath);
  if (items) store.set(itemsPath, items);
}
```

## File Structure

```
009-financial-dashboard/
├── index.html              # Entry point
├── runtime/
│   └── implementation.js   # Main application logic
├── views/
│   ├── master.json         # Master layout config (references layout.html)
│   ├── todos.slot.json     # TodoList slot config
│   ├── outline.slot.json   # Outline slot config
│   ├── kpi.slot.json       # KPI slot config
│   ├── debts.slot.json     # Debts slot config
│   ├── sales.slot.json     # Sales slot config
│   ├── news.slot.json      # News slot config
│   └── layout.html         # Master layout HTML
└── components/
    ├── TodoList.html       # TodoList component
    ├── Outline.html        # Outline component
    ├── KPI.html           # KPI component
    ├── Debts.html         # Debts component
    ├── Sales.html         # Sales component
    └── News.html          # News component
```

## Troubleshooting

**Import error: Cannot find module '@uistate/core'**
- Run `npm link @uistate/core` from the example directory (see Option 2 above)
- Or use the CDN approach (Option 3)

**CORS error with CDN**
- Make sure you're serving the files with a local server (`npx serve .`)
- Don't open `index.html` directly in the browser

**Slot not loading**
- Check browser console for fetch errors
- Verify all JSON and HTML files are in the correct paths

## Learn More

- Read the [main README](../../README.md) for full documentation
- Explore the source code to see patterns in action
- Modify state paths and bindings to experiment

---

**Part of @uistate/core v5** - Lightweight event-driven state management