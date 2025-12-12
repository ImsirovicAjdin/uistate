/**
 * todos.test.js - Event-sequence tests for todo functionality
 * 
 * These tests verify direct state manipulation (no intent pattern)
 */

import { createEventTest, test, runTests } from './eventTest.js';

// Helper functions that match the view logic
function addTodo(store, text) {
  const items = store.get('todos.items') || [];
  const newTodo = { id: Date.now(), text: String(text || '').trim(), done: false };
  if (!newTodo.text) return;
  store.set('todos.items', [...items, newTodo]);
}

function toggleTodo(store, id) {
  const items = store.get('todos.items') || [];
  const updated = items.map(item => 
    item.id === id ? { ...item, done: !item.done } : item
  );
  store.set('todos.items', updated);
}

function clearCompleted(store) {
  const items = store.get('todos.items') || [];
  store.set('todos.items', items.filter(t => !t.done));
}

function setFilter(store, filter) {
  const f = (filter === 'active' || filter === 'completed') ? filter : 'all';
  store.set('todos.filter', f);
}

// Test suite
const tests = {
  'add todo creates correct structure': () => {
    const t = createEventTest({
      todos: { items: [], filter: 'all' }
    });
    
    // Directly add todo (same as view does)
    addTodo(t.store, 'Buy milk');
    
    // Assert array structure and element types
    t.assertArrayOf('todos.items', {
      id: 'number',
      text: 'string',
      done: 'boolean'
    });
    
    // Assert array length
    t.assertArrayLength('todos.items', 1);
    
    // Assert specific values
    const items = t.store.get('todos.items');
    if (items[0].text !== 'Buy milk') {
      throw new Error('Expected first todo text to be "Buy milk"');
    }
    if (items[0].done !== false) {
      throw new Error('Expected first todo to not be done');
    }
  },

  'toggle todo changes done state': () => {
    const t = createEventTest({
      todos: { items: [{ id: 1, text: 'Buy milk', done: false }], filter: 'all' }
    });
    
    // Toggle todo
    toggleTodo(t.store, 1);
    
    // Assert structure
    t.assertArrayOf('todos.items', {
      id: 'number',
      text: 'string',
      done: 'boolean'
    });
    
    // Assert done is now true
    const items = t.store.get('todos.items');
    if (items[0].done !== true) {
      throw new Error('Expected todo to be done');
    }
  },

  'clear completed removes done todos': () => {
    const t = createEventTest({
      todos: {
        items: [
          { id: 1, text: 'Buy milk', done: true },
          { id: 2, text: 'Walk dog', done: false }
        ],
        filter: 'all'
      }
    });
    
    // Clear completed
    clearCompleted(t.store);
    
    // Assert only active todo remains
    t.assertArrayLength('todos.items', 1);
    
    const items = t.store.get('todos.items');
    if (items[0].text !== 'Walk dog') {
      throw new Error('Expected only "Walk dog" to remain');
    }
  },

  'filter updates filter state': () => {
    const t = createEventTest({
      todos: { items: [], filter: 'all' }
    });
    
    // Set filter
    setFilter(t.store, 'active');
    
    // Assert type
    t.assertType('todos.filter', 'string');
    
    // Assert value
    t.assertPath('todos.filter', 'active');
  },

  'empty todos array is valid': () => {
    const t = createEventTest({
      todos: { items: [], filter: 'all' }
    });
    
    // Assert empty array is still typed correctly
    t.assertArrayOf('todos.items', {
      id: 'number',
      text: 'string',
      done: 'boolean'
    });
    
    t.assertArrayLength('todos.items', 0);
  },

  'multiple todos can be added': () => {
    const t = createEventTest({
      todos: { items: [], filter: 'all' }
    });
    
    // Add multiple todos
    addTodo(t.store, 'Buy milk');
    addTodo(t.store, 'Walk dog');
    addTodo(t.store, 'Write code');
    
    // Assert array length
    t.assertArrayLength('todos.items', 3);
    
    // Assert all have correct structure
    t.assertArrayOf('todos.items', {
      id: 'number',
      text: 'string',
      done: 'boolean'
    });
  }
};

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests(tests);
}

export default tests;
