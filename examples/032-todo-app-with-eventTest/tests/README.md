# EventTest - Event-Sequence Testing

Event-driven TDD for EventState applications.

## Features

- ✅ **Event-sequence testing** - Test state changes through event flows
- ✅ **Type extraction** - Generate `.d.ts` files from test assertions
- ✅ **No DOM required** - Tests run in Node.js
- ✅ **Fluent API** - Chainable assertions
- ✅ **Type-safe** - Tests define types, not manual definitions

## Usage

### Writing Tests

```javascript
import { createEventTest, test } from './eventTest.js';

test('add todo', () => {
  const t = createEventTest({
    domain: { todos: { items: [] } }
  });
  
  // Trigger intent
  t.trigger('intent.todo.add', { text: 'Buy milk' });
  
  // Assert types (for .d.ts generation)
  t.assertArrayOf('domain.todos.items', {
    id: 'number',
    text: 'string',
    done: 'boolean'
  });
  
  // Assert values
  t.assertArrayLength('domain.todos.items', 1);
});
```

### Running Tests

```bash
# Run all tests
node tests/run.js

# Or run specific test file
node tests/todos.test.js
```

### Generating Types

```bash
# Generate store.d.ts from test assertions
node tests/generateTypes.js
```

## API Reference

### `createEventTest(initialState)`

Creates a test instance with isolated store.

**Returns:** Test API object

### Test API

#### `.trigger(path, value)`

Set a value in the store (trigger state change).

```javascript
t.trigger('intent.todo.add', { text: 'Buy milk' });
```

#### `.assertPath(path, expected)`

Assert exact value at path.

```javascript
t.assertPath('ui.theme', 'dark');
```

#### `.assertType(path, type)`

Assert primitive type. Stores type info for `.d.ts` generation.

```javascript
t.assertType('ui.theme', 'string');
```

#### `.assertArrayOf(path, elementShape)`

Assert array with element shape. Stores type info for `.d.ts` generation.

```javascript
t.assertArrayOf('domain.todos.items', {
  id: 'number',
  text: 'string',
  done: 'boolean'
});
```

#### `.assertShape(path, objectShape)`

Assert object shape. Stores type info for `.d.ts` generation.

```javascript
t.assertShape('ui.route', {
  path: 'string',
  view: 'string'
});
```

#### `.assertArrayLength(path, length)`

Assert array length.

```javascript
t.assertArrayLength('domain.todos.items', 3);
```

#### `.assertEventFired(path, times)`

Assert event fired N times.

```javascript
t.assertEventFired('domain.todos.items', 1);
```

#### `.getEventLog()`

Get all captured events.

```javascript
const log = t.getEventLog();
// [{ timestamp: 123, path: 'domain.todos.items', value: [...] }]
```

#### `.getTypeAssertions()`

Get all type assertions (for type generation).

```javascript
const assertions = t.getTypeAssertions();
// [{ path: 'domain.todos.items', type: 'array', elementShape: {...} }]
```

## Workflow

### 1. Write Tests (TDD)

```javascript
// tests/todos.test.js
test('add todo', () => {
  const t = createEventTest({ domain: { todos: { items: [] } } });
  t.trigger('intent.todo.add', { text: 'Buy milk' });
  t.assertArrayOf('domain.todos.items', {
    id: 'number',
    text: 'string',
    done: 'boolean'
  });
});
```

### 2. Implement Bridges

```javascript
// app/bridges.js
store.subscribe('intent.todo.add', ({ text }) => {
  const items = store.get('domain.todos.items') || [];
  const id = items.length + 1;
  store.set('domain.todos.items', [...items, { id, text, done: false }]);
});
```

### 3. Generate Types

```bash
node tests/generateTypes.js
# Creates store.d.ts with perfect types!
```

### 4. Build UI

```javascript
// Now you have autocomplete!
const items = store.get('domain.todos.items');
// TypeScript knows: Array<{ id: number, text: string, done: boolean }>
```

## Benefits

- **Tests define behavior** - TDD workflow
- **Types derived from tests** - No manual type definitions
- **Perfect coverage** - Every test adds type information
- **No DOM needed** - Fast feedback loop
- **Deterministic** - Same tests = same types
- **Watcher-friendly** - Auto-regenerate on test changes

## Philosophy

EventTest follows EventState's core principles:

1. **State-first** - Tests work with state paths
2. **Dot-paths everywhere** - No special syntax
3. **Types are optional** - Tests work without TypeScript
4. **Types are derived** - Not hand-written
5. **JS-first** - Clean, readable code
