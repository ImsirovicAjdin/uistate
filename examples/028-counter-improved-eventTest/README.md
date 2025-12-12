# 028 Counter with eventTest

A simple counter app demonstrating event-sequence testing and type generation with the EventState primitive.

## What This Example Shows

This example demonstrates **TDD with event-sequence testing** for a simple counter app:

✅ **EventState primitive** - `runtime/core/eventState.js` (~80 lines)  
✅ **Event-sequence testing** - `eventTest.js` for testing state changes  
✅ **Type generation** - Auto-generate `.d.ts` from test assertions  
✅ **Direct state manipulation** - Simple `store.get()` and `store.set()`

## Structure

```
app/
└── store.js           → Store with counter state

runtime/core/
├── eventState.js      → The 80-line reactive primitive
└── helpers.js         → Utility functions

tests/
├── eventTest.js       → Event-sequence testing framework
├── counter.test.js    → Tests for counter operations
├── generateTypes.js   → Type generator
└── run.js             → Test runner

index.html             → Simple counter UI
store.d.ts             → Auto-generated types
```

## Counter Operations

The app has three simple operations:

```javascript
// Increment
const current = store.get('count');
store.set('count', current + 1);

// Decrement
const current = store.get('count');
store.set('count', current - 1);

// Double
const current = store.get('count');
store.set('count', current * 2);
```

## Event-Sequence Testing

Tests verify state changes as event sequences:

```javascript
import { createEventTest } from './eventTest.js';

const tests = {
  'increment increases count by 1': () => {
    const t = createEventTest({ count: 0 });
    
    // Perform operation
    const current = t.store.get('count');
    t.store.set('count', current + 1);
    
    // Assert type
    t.assertType('count', 'number');
    
    // Assert value
    const count = t.store.get('count');
    if (count !== 1) {
      throw new Error(`Expected count to be 1, got ${count}`);
    }
  }
};
```

## Type Generation

Run tests to generate TypeScript definitions:

```bash
# Run tests
node tests/counter.test.js

# Generate types from test assertions
node tests/generateTypes.js
```

This creates `store.d.ts`:

```typescript
export interface StoreState {
  count: number;
}
```

## Run It

```bash
# Open in browser
open index.html

# Run tests
node tests/counter.test.js

# Generate types
node tests/generateTypes.js

# Run all tests
node tests/run.js
```

## What Makes This Different

**Traditional testing:**
- Mock DOM interactions
- Test implementation details
- Separate type definitions

**Event-sequence testing:**
- Test state changes directly
- Verify behavior, not implementation
- Types generated from tests

## Learn More

- See `tests/counter.test.js` for test examples
- See `tests/eventTest.js` for the testing framework
- See `runtime/core/eventState.js` for the core primitive
