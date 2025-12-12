# 030 Todo App with eventTest

A complete todo app demonstrating the UIstate framework features, bridging from the simple examples (001-011) to a real application.

## What This Example Shows

This is the **bridge** between learning the primitive (`eventState.js`) and using the full framework:

✅ **Same primitive from 001-011** - `runtime/core/eventState.js` (~80 lines)  
✅ **Declarative templates** - `data-bind` and `data-on` attributes  
✅ **Client-side routing** - Multi-page SPA with loading states  
✅ **Event-sequence testing** - `eventTest.js` for testing state changes  
✅ **Direct state manipulation** - No action registry, just `store.set()`

## Structure

```
app/
├── store.js           → Store initialization
├── router.js          → Route configuration
└── views/
    ├── home.js        → Simple counter view
    └── todoDemo.js    → Todo app with add/toggle/filter

runtime/core/
├── eventState.js      → The 80-line reactive primitive
├── behaviors.runtime.js → Declarative bindings (data-bind, data-on)
└── router.js          → Simple client-side router

tests/
├── eventTest.js       → Event-sequence testing framework
├── todos.test.js      → Tests for todo app
└── run.js             → Test runner
```

## Key Features

### 1. Direct State Manipulation

Views use `store.set()` directly - no action registry:

```javascript
// Add todo
const items = store.get('todos.items') || [];
const newTodo = { id: Date.now(), text, done: false };
store.set('todos.items', [...items, newTodo]);

// Toggle todo
const updated = items.map(item => 
  item.id === t.id ? { ...item, done: !item.done } : item
);
store.set('todos.items', updated);
```

### 2. Declarative Bindings

HTML attributes for reactive UI:

```html
<!-- Bind theme to body attribute -->
<body data-bind="data-theme: ui.theme">

<!-- Button with action pipeline -->
<button data-on="click: toggleTheme() | log('theme changed')">
  Toggle Theme
</button>
```

### 3. Event-Sequence Testing

Test state changes as event sequences:

```javascript
import { eventTest } from './eventTest.js';

eventTest('add todo', ({ store, trigger, assertPath }) => {
  trigger(() => {
    const items = store.get('todos.items') || [];
    store.set('todos.items', [...items, { id: 1, text: 'Test', done: false }]);
  });
  
  assertPath('todos.items', (items) => items.length === 1);
});
```

## Run It

```bash
# Install dependencies
npm install

# Open in browser
open index.html

# Run tests
npm test
```

## Progression from 001-011

**Examples 001-011:** Learn `eventState.js` primitive  
**Example 030:** See the framework features (routing, templates, testing)  
**Next steps:** Advanced features (devtools, forms, extensions)

## What Makes This Different

**Other frameworks:**
- Testing is separate (React Testing Library, Vue Test Utils)
- State management is opaque (virtual DOM, reactivity magic)
- Need build tools (JSX, SFC compilers)

**UIstate (030):**
- Testing is **architectural** (event-sequence assertions)
- State management is **transparent** (events all the way down)
- No build step (runs directly in browser)

## Learn More

- See `tests/todos.test.js` for testing examples
- See `runtime/core/behaviors.runtime.js` for how `data-bind` works
- See `runtime/core/eventState.js` for the core primitive
