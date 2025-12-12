# 010 Decoupled Components - Shared State

Demonstrates how components can communicate through shared state without direct coupling.

## What's Here

- **Component A (Writer):** Sends messages
- **Component B (Reader):** Displays current message
- **Component C (Logger):** Logs all messages with timestamps
- **Zero coupling:** Components don't know about each other

## How It Works

```javascript
// Shared store - the ONLY connection
const store = createEventState({ message: '' });

// Component A: Writes to state
document.getElementById('sendBtn').onclick = () => {
  store.set('message', inputValue);
};

// Component B: Reads from state
store.subscribe('message', (value) => {
  document.getElementById('display').textContent = value;
});

// Component C: Also reads from state
store.subscribe('message', (value) => {
  logMessage(value);
});
```

## Key Insight

**State is the interface between components.**

Components communicate by:
1. Writing to shared state
2. Subscribing to shared state
3. **Never** calling each other directly

This is the **pub/sub pattern** in action:
- ✅ Components are decoupled
- ✅ Easy to add/remove components
- ✅ No prop drilling
- ✅ No callbacks passed down

Other frameworks need:
- React: Context API, prop drilling, or state management libraries
- Vue: Provide/inject or Vuex
- Svelte: Context API or stores

**EventState:** Just share the store. That's it.

## Architecture Pattern

This demonstrates the **mediator pattern**:
- Components don't talk to each other
- They talk to the store
- The store mediates all communication

This is how your full UIstate framework works:
- Intents → State changes
- State changes → UI updates
- Everything is decoupled through events

## Run It

Open `index.html`, type messages, and watch all three components react independently.

## Try This

Add a fourth component that counts vowels in messages. It only needs to subscribe to `'message'` - no other code changes needed.
