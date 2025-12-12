# 008 Undo/Redo - Time Travel Debugging

Demonstrates how EventState's event-driven architecture makes undo/redo trivial.

## What's Here

- Counter with multiple operations
- Undo/Redo buttons
- History tracking showing current position
- **No special library needed** - just an array

## How It Works

```javascript
// 1. Track history in an array
let history = [0];
let historyIndex = 0;

// 2. Record state changes via subscription
store.subscribe('count', (value) => {
  if (!isTimeTravel) {
    history.push(value);
    historyIndex = history.length - 1;
  }
});

// 3. Undo = go back in history
document.getElementById('undo').onclick = () => {
  historyIndex--;
  isTimeTravel = true;
  store.set('count', history[historyIndex]);
  isTimeTravel = false;
};
```

## Key Insight

**Time travel is just replaying state.**

Because EventState uses **events** for all state changes, you can:
- ✅ Record every change automatically (wildcard subscription)
- ✅ Replay any previous state
- ✅ Build undo/redo in ~30 lines

Other frameworks need:
- React: Redux DevTools, Immer, or custom middleware
- Vue: Vuex plugins or manual history tracking
- Svelte: Custom stores with history logic

**EventState:** Just subscribe to `'*'` and push to an array. That's it.

## This is Telemetry

This example shows the **foundation of telemetry**:
- Every state change is an event
- Events can be logged, replayed, or analyzed
- Time-travel debugging comes for free

In the full UIstate framework, this becomes:
- Automatic telemetry logging
- Event sequence testing (`eventTest.js`)
- Production debugging and replay

## Run It

Open `index.html` in a browser. Click operations, then use Undo/Redo to travel through time.

## Try This

Make multiple changes, undo halfway, then make a new change. Notice how the "future" states are discarded (like Git branches).
