# 005 Conditional Rendering - Show/Hide Elements

Demonstrates how to conditionally render elements based on state.

## What's Here

- Checkbox to toggle visibility
- Message that shows/hides based on state
- **No `v-if` or `{#if}` needed** - just DOM manipulation

## How It Works

```javascript
// 1. Store boolean state
const store = createEventState({ isVisible: false });

// 2. Subscribe and toggle display
store.subscribe('isVisible', (value) => {
  const message = document.getElementById('message');
  message.style.display = value ? 'block' : 'none';
});

// 3. Update state on checkbox change
document.getElementById('toggle').onchange = (e) => {
  store.set('isVisible', e.target.checked);
};
```

## Key Insight

**Conditional rendering is just DOM manipulation.**

Other frameworks need:
- React: `{isVisible && <p>Message</p>}`
- Vue: `v-if="isVisible"`
- Svelte: `{#if isVisible}`

**EventState:** Just set `style.display` in a subscriber. That's it.

## Run It

Open `index.html` in a browser. Check the box to reveal the message.
