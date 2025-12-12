# 009 localStorage Side Effects - Persistent State

Demonstrates how to sync state with localStorage for persistence across page reloads.

## What's Here

- Counter that persists across browser sessions
- Automatic save on every state change
- Load saved state on page load
- **No persistence library needed** - just localStorage API

## How It Works

```javascript
// 1. Load initial state from localStorage
const savedCount = localStorage.getItem('counter');
const initialCount = savedCount !== null ? parseInt(savedCount, 10) : 0;

// 2. Create store with saved state
const store = createEventState({ count: initialCount });

// 3. Side effect: save on every change
store.subscribe('count', (value) => {
  localStorage.setItem('counter', value);
  // Also update UI
  document.getElementById('count').textContent = value;
});
```

## Key Insight

**Side effects are just subscribers.**

Subscriptions aren't only for UI updates. They're for:
- ✅ Saving to localStorage
- ✅ Logging to analytics
- ✅ Syncing to server
- ✅ Triggering other actions

Other frameworks need:
- React: `useEffect` with dependency arrays
- Vue: `watch` or `watchEffect`
- Svelte: Reactive statements with side effects

**EventState:** Just subscribe and do whatever you want. That's it.

## Pattern: Separation of Concerns

Notice the subscriber does TWO things:
1. Saves to localStorage (side effect)
2. Updates the DOM (UI effect)

You could split these into separate subscribers:
```javascript
store.subscribe('count', (value) => {
  localStorage.setItem('counter', value);
});

store.subscribe('count', (value) => {
  document.getElementById('count').textContent = value;
});
```

This is the **single responsibility principle** in action.

## Run It

Open `index.html`, increment the counter, then reload the page. Your count persists!

## Try This

Open DevTools → Application → Local Storage to see the saved value update in real-time.
