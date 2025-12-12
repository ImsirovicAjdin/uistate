# 006 List Rendering - Dynamic Arrays

Demonstrates how to render lists from array state.

## What's Here

- Input to add items
- Dynamic list that updates on state change
- **No `v-for` or `.map()` in JSX** - just `innerHTML`

## How It Works

```javascript
// 1. Store array in state
const store = createEventState({ items: [] });

// 2. Render function
const renderList = () => {
  const items = store.get('items');
  const list = document.getElementById('itemList');
  list.innerHTML = items.map(item => `<li>${item}</li>`).join('');
};

// 3. Subscribe to array changes
store.subscribe('items', renderList);

// 4. Add items by creating new array
const items = store.get('items');
store.set('items', [...items, newItem]);
```

## Key Insight

**List rendering is just string concatenation.**

Other frameworks need:
- React: `{items.map(item => <li>{item}</li>)}`
- Vue: `v-for="item in items"`
- Svelte: `{#each items as item}`

**EventState:** Just use `.map()` and `innerHTML`. That's it.

## Important

We create a **new array** with `[...items, newItem]` instead of mutating. This ensures the subscription fires (new reference = change detected).

## Run It

Open `index.html` in a browser. Type items and click Add (or press Enter).
