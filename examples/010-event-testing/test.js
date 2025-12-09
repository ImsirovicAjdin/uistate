import { createEventTest } from './eventTest.js';

const test = createEventTest({ 
  domain: { 
    todos: { items: [] } 
  } 
});

// Register intent handler (same as in 009 example)
let nextId = 1;
test.store.subscribe('intent.todo.add', ({ text }) => {
  const items = test.store.get('domain.todos.items') || [];
  test.store.set('domain.todos.items', [...items, { id: nextId++, text, done: false }]);
});

// Now the test will work
test
  .trigger('intent.todo.add', { text: 'Buy milk' })
  .assertPath('domain.todos.items.0.text', 'Buy milk')  // ← Use dot notation for array index
  .assertEventFired('domain.todos.items', 1);

console.log('✓ Todo add test passed');
