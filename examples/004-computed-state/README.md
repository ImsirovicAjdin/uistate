# 004 Computed State - Derived Values

Shows how trivial it is to create computed/derived state in EventState.

## What's Here

- Two inputs: `firstName` and `lastName`
- Two computed values: `fullName` and `charCount`
- **Zero framework magic** - just functions

## How It Works

```javascript
// 1. Define a function that computes derived state
const updateFullName = () => {
  const first = store.get('firstName');
  const last = store.get('lastName');
  const fullName = `${first} ${last}`.trim();
  document.getElementById('fullName').textContent = fullName;
};

// 2. Subscribe to wildcard to catch all changes
store.subscribe('*', () => {
  updateFullName();
  updateCharCount();
});

// 3. That's it. No special API needed.
```

## Key Insight

**Computed state is just a function.** 

Other frameworks need:
- Vue: `computed()`
- React: `useMemo()`
- Svelte: `$:` reactive declarations
- MobX: `@computed` decorators

**EventState:** Just write a function and call it when state changes.

## Run It

Open `index.html` in a browser. Type in the inputs and watch the computed values update.
