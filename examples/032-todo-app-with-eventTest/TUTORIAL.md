# EventState Tutorial

Learn how to build reactive web applications with EventState's fine-grained state management.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Getting Started](#getting-started)
3. [Architecture Patterns](#architecture-patterns)
4. [Advanced Features](#advanced-features)
5. [Comparison with Other Frameworks](#comparison)

---

## Core Concepts

### 1. Fine-Grained Reactivity

EventState uses **path-based subscriptions** for surgical DOM updates:

```javascript
// Subscribe to specific paths
store.subscribe('domain.todos.items', render);  // Only updates when todos change
store.subscribe('ui.theme', updateTheme);       // Only updates when theme changes
```

**Key differences from other frameworks:**
- ❌ No virtual DOM diffing
- ❌ No component-level re-renders
- ✅ Direct path → handler mapping
- ✅ Update only what changed

### 2. Intent-Based Architecture

EventState separates **what happened** (intent) from **what to do** (bridge):

```
UI Event → intent.* → Bridge → domain.* → View Update
```

**Benefits:**
- ✅ Unidirectional data flow (like Redux)
- ✅ No boilerplate (unlike Redux)
- ✅ Testable business logic (bridges are pure functions)
- ✅ Decoupled UI from domain logic

### 3. Progressive API

Start simple, add complexity only when needed:

**Declarative** (for simple interactions):
```html
<button data-on="click: addTodo()">Add</button>
```

**Imperative** (for complex views):
```javascript
store.subscribe('domain.todos.items', (items) => {
  // Custom rendering logic
});
```

---

## Getting Started


### Quick Start

**1. Create a store:**
```javascript
import { createEventState } from './runtime/core/eventState.js';

const store = createEventState({
  ui: { count: 0 },
  domain: { todos: [] }
});
```

**2. Subscribe to changes:**
```javascript
store.subscribe('ui.count', (count) => {
  document.getElementById('count').textContent = count;
});
```

**3. Update state:**
```javascript
button.onclick = () => {
  store.set('ui.count', store.get('ui.count') + 1);
};
```

That's it! No build step, no framework, just reactive data.

---

## Architecture Patterns

### The Intent-Bridge-Domain Pattern

**Step 1: UI fires an intent**
```javascript
// User clicks "Add Todo"
store.set('intent.todo.add', { text: 'Buy milk' });
```

**Step 2: Bridge handles the intent**
```javascript
// app/bridges.js
store.subscribe('intent.todo.add', ({ text }) => {
  const items = store.get('domain.todos.items') || [];
  store.set('domain.todos.items', [...items, { id: Date.now(), text }]);
});
```

**Step 3: View reacts to domain change**
```javascript
// app/views/todoDemo.js
store.subscribe('domain.todos.items', (items) => {
  renderTodoList(items);
});
```

**Why this pattern?**
- ✅ Testable (test bridges in isolation)
- ✅ Auditable (log all intents)
- ✅ Flexible (change behavior without touching UI)

---

## Advanced Features

### 1. Wildcard Subscriptions

```javascript
// Listen to all state changes
store.subscribe('**', (value, path) => {
  console.log(`[state] ${path}`, value);
});

// Listen to all intents
store.subscribe('intent.**', (value, path) => {
  console.log(`[intent] ${path}`, value);
});
```

### 2. Batch Updates

```javascript
import { upgradeEventState } from './runtime/extensions/eventState.plus.js';

const storePlus = upgradeEventState(store);

storePlus.setMany({
  'ui.loading': false,
  'domain.user': userData,
  'ui.error': null
});
```

### 3. Router Integration

```javascript
import { createRouter } from './runtime/core/router.js';

const router = createRouter({
  routes: [
    { path: '/', view: 'home', component: Home },
    { path: '/todos', view: 'todos', component: TodoList }
  ],
  store,
  rootSelector: '[data-route-root]'
});

router.start();
```

### 4. Built-in Telemetry

```javascript
// All state changes are automatically logged in dev mode
// Click "Console" button in dev dock to copy logs

// Or access programmatically:
window.__telemetry.get();  // Get all logs
window.__telemetry.copy(); // Copy to clipboard
```

---

## Comparison

### Why Choose EventState?

#### 1. No Common React Bugs

**Stale Closures**
```javascript
// React problem:
const [count, setCount] = useState(0);
setTimeout(() => console.log(count), 1000);  // Stale!

// EventState framework:
store.subscribe('ui.count', (val) => console.log(val));  // Always fresh
```

**Dependency Arrays**
```javascript
// React:
useEffect(() => { /* ... */ }, [dep1, dep2, dep3]);  // Miss one? Bug!

// EventState framework:
store.subscribe('path.to.dep', handler);  // Explicit, no guessing
```

**Prop Drilling**
```javascript
// React: <A> → <B> → <C> → <D> (pass props 4 levels)
// EventState framework: Any component reads store.get('shared.data')
```

**Re-render Debugging**
```javascript
// EventState: Only subscribed handlers run
store.subscribe('ui.count', updateCount);  // Only this runs when count changes

// React: Entire component tree may re-render
// Need React DevTools to debug why
```

#### 2. Performance by Default

**Other frameworks require optimization:**
```javascript
// React: Manual memoization
const MemoizedComponent = memo(Component);
const memoizedValue = useMemo(() => compute(a, b), [a, b]);
const memoizedCallback = useCallback(() => {}, [deps]);

// Angular: Change detection strategy
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
```

**EventState: Fast by default**
```javascript
// Direct DOM updates, no virtual DOM
// Only subscribed handlers run
// No manual optimization needed
store.subscribe('ui.count', (val) => el.textContent = val);
```

#### 3. Less Boilerplate

**Redux:**
```javascript
// actions.js
export const ADD_TODO = 'ADD_TODO';
export const addTodo = (text) => ({ type: ADD_TODO, text });

// reducers.js
export default function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [...state, { id: Date.now(), text: action.text }];
    default:
      return state;
  }
}

// component.js
const mapStateToProps = (state) => ({ todos: state.todos });
const mapDispatchToProps = { addTodo };
export default connect(mapStateToProps, mapDispatchToProps)(TodoList);
```

**EventState:**
```javascript
// bridges.js
store.subscribe('intent.todo.add', ({ text }) => {
  const items = store.get('domain.todos.items') || [];
  store.set('domain.todos.items', [...items, { id: Date.now(), text }]);
});
```

**3 files vs 1 function.**

#### 4. Built-in Observability

```javascript
// See every state change (one line)
store.subscribe('**', (val, path) => console.log('[state]', path, val));

// Time-travel debugging
const history = [];
store.subscribe('**', (val, path) => history.push({ path, val }));
history.forEach(({ path, val }) => store.set(path, val)); // Replay

// State snapshot
const snapshot = store.get('');  // Entire state tree
```

**No browser extensions needed** - everything is built-in.

#### 5. Framework-Agnostic

```javascript
// Works in vanilla JS
store.set('count', 1);

// Works with React
function Counter() {
  const [count, setCount] = useState(store.get('count'));
  useEffect(() => store.subscribe('count', setCount), []);
  return <div>{count}</div>;
}

// Works with Web Components
class MyCounter extends HTMLElement {
  connectedCallback() {
    this.unsub = store.subscribe('count', (val) => {
      this.textContent = val;
    });
  }
}

// Works with any build tool (or none)
```

---

## Feature Comparison

| Feature | React | Redux | Vue | Solid | EventState |
|---------|-------|-------|-----|-------|------------|
| Fine-grained updates | ❌ | ❌ | ⚠️ | ✅ | ✅ |
| No boilerplate | ⚠️ | ❌ | ⚠️ | ✅ | ✅ |
| Framework-agnostic | ❌ | ⚠️ | ❌ | ⚠️ | ✅ |
| Built-in time-travel | ❌ | ✅ | ❌ | ❌ | ✅ |
| Wildcard subscriptions | ❌ | ❌ | ❌ | ❌ | ✅ |
| Bundle size | 45KB | 3KB | 34KB | 7KB | <1KB |
| Learning curve | High | Very High | Medium | Medium | Low |

---

## What's Next

### Current Status

**What EventState has today:**
- ✅ Solid reactivity primitive (~200 lines)
- ✅ Clean architecture (intent → bridge → domain)
- ✅ Low complexity (no build step required)
- ✅ Good performance (fine-grained updates)
- ✅ Generic router (`runtime/core/router.js`)
- ✅ Form utilities (`runtime/forms/`)
- ✅ Dev tools (telemetry, state tracker)

### Roadmap

**In Development:**
- TypeScript definitions
- Component abstraction layer
- Comprehensive test suite
- npm package (`@uistate/core`)

**Planned:**
- Separate packages (`@uistate/router`, `@uistate/forms`)
- VS Code extension (path autocomplete)
- Documentation site
- SSR adapter

---

## Learn More

- **[WHY_EVENTSTATE.md](./WHY_EVENTSTATE.md)** - Philosophy and comparisons
- **[runtime/core/eventState.js](./runtime/core/eventState.js)** - Source code (~200 lines)
- **[app/bridges.js](./app/bridges.js)** - Real-world patterns
- **[runtime/core/router.js](./runtime/core/router.js)** - Generic SPA router

---

## Contributing

EventState is in active development. Feedback, issues, and contributions are welcome!

---

*EventState: Fine-grained reactivity without the complexity.*