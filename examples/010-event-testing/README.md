# Event Testing Example

Demonstrates `eventTest.js` - event-sequence testing for UIstate applications.

## What is Event Testing?

Tests **state transitions via events** instead of DOM:

```javascript
// Traditional way - complex
const wrapper = render(<TodoApp />);
await userEvent.click(wrapper.getByText('Add'));
expect(wrapper.getByText('Buy milk')).toBeInTheDocument();

// Event testing - simple
test
  .trigger('intent.todo.add', { text: 'Buy milk' })
  .assertPath('domain.todos.items.0.text', 'Buy milk')
  .assertEventFired('domain.todos.items', 1);
```

## Running the Tests

**Standalone** - no server required, just Node.js:

```bash
# From this directory
node test.js
```

Expected output:
```
✓ Todo add test passed
```

## Key Concepts

1. Test Setup
```js
import { createEventTest } from './eventTest.js';

const test = createEventTest({
  domain: { todos: { items: [] } }
});

// Register intent handlers (business logic)
let nextId = 1;
test.store.subscribe('intent.todo.add', ({ text }) => {
  const items = test.store.get('domain.todos.items') || [];
  test.store.set('domain.todos.items', [...items, { id: nextId++, text, done: false }]);
});
```

2. Test Execution
```js
test
  .trigger('intent.todo.add', { text: 'Buy milk' })
  .assertPath('domain.todos.items.0.text', 'Buy milk')
  .assertEventFired('domain.todos.items', 1);
```

3. Common Pitfalls

**Path Syntax**: Use dot notation (`items.0.text`), not bracket notation
```js
.assertPath('domain.todos.items.0.text', 'Buy milk')  // Correct
.assertPath('domain.todos.items[0].text', 'Buy milk')  // Fails
```

**Handler Registration**: Ensure intent handlers are registered before triggering Events
```js
test.store.subscribe('intent.todo.add', handler);  // First
test.trigger('intent.todo.add', { text: 'Buy milk' });  // Then
```
**Store Structure**: Initialize the test store with the correct state shape
```js
const test = createEventTest({
  domain: { todos: { items: [] } }  // Correct nesting
});
```

## API Reference

`createEventTest(initialState)`
Initializes a test instance with the given initial state.

`test.trigger(path, payload)`
Triggers an event at the specified path with the given payload.

`test.assertPath(path, expectedValue)`
Asserts that the state at the specified path matches the expected value.

`test.assertEventFired(path, expectedCount)`
Asserts that the event at the specified path was fired the expected number of times.

## Relationship to Example 009-Financial-Dashboard

* Example 009 implements a full application using intent-driven patterns and slot orchestration.
* This example focuses on testing those event-driven state changes in isolation.

This event testing approach ensures your UIstate applications behave as expected without the overhead of DOM manipulation. They test **patterns** from 009, not the actual dashboard code.

## Benefits of Event Testing

Developer Experience:
- **Simplicity**: Focus on state changes, not UI rendering
- **Clarity**: Clear intent and expected outcomes
- **Maintainability**: Easier to update tests as UI changes
- **Documentation**: Serves as living documentation of expected state flows

Testing Efficiency:
- **Speed**: Faster execution without DOM overhead
- **No DOM mocking**: Test pure state logic
- **No async hell**: Synchronous state updates
- **Better Coverage**: Test edge cases in state logic that may be hard to reach via UI

Code Quality:
- **Isolation**: Test state management independently
- **Confidence**: Ensure state management behaves as intended
- **Early Detection**: Catch state management issues before UI integration
- **Debugging**: Easier to pinpoint issues in state transitions

Team Benefits:
- **Integration**: Complements UI tests by verifying core logic
- **Reusability**: Share test logic across different UI implementations
- **Cost-Effective**: Reduce time and resources spent on UI test maintenance
- **Developer Productivity**: Streamline the testing process for faster development cycles

Architecture Benefits:
- **Robustness**: Build more resilient applications by validating core logic thoroughly
- **Consistency**: Ensure uniform behavior across different parts of the application
- **Flexibility**: Adapt tests quickly for different scenarios
- **Reduced Flakiness**: Minimize test failures due to UI rendering issues by focusing on state changes
- **Easier Refactoring**: Simplify the process of refactoring state management logic with confidence in existing tests

**Part of @uistate/core v5** - Lightweight event-driven state management with event-sequence testing
