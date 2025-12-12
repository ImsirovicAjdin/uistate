# 001 Counter - Minimal EventState Example

The simplest possible EventState example: a counter with one button.

## What's Here

- `eventState.js` - ~60 lines of reactive state management
- `index.html` - Counter UI with subscription

## How It Works

```javascript
// 1. Create store
const store = createEventState({ count: 0 });

// 2. Subscribe to changes
store.subscribe('count', ({ value }) => {
  document.getElementById('count').textContent = value;
});

// 3. Update state
store.set('count', store.get('count') + 1);
```

That's it. No framework, no build step, just reactive data.

## Run It

Open `index.html` in a browser. Click the `+` button to increment.

## Key Concepts

- **`createEventState(initial)`** - Creates a reactive store
- **`store.get(path)`** - Read state at dot-path
- **`store.set(path, value)`** - Write state and notify subscribers
- **`store.subscribe(path, handler)`** - React to changes

## Next Steps

See `examples/009-todo-app-with-eventTest/` for a full application with:
- Router
- Bridges (intent → domain pattern)
- Tests with type generation
- Dev tools
