/**
 * todos.test.js - Event-sequence tests for todo functionality
 * 
 * These tests define the behavior AND types of the todo domain
 */

import { createEventTest, test, runTests } from './eventTest.js';

// Helper to set up todo bridges on a test store
function setupTodoBridges(store) {
  let nextId = 1;
  
  // Add todo
  store.subscribe('intent.todo.add', (detail) => {
    const { text } = detail;
    const items = store.get('domain.todos.items') || [];
    const todo = { id: nextId++, text: String(text || '').trim(), done: false };
    if (!todo.text) return;
    store.set('domain.todos.items', [...items, todo]);
  });
  
  // Toggle todo
  store.subscribe('intent.todo.toggle', (detail) => {
    const { id } = detail;
    const items = store.get('domain.todos.items') || [];
    const out = items.map(t => (String(t?.id) === String(id)) ? { ...t, done: !t.done } : t);
    store.set('domain.todos.items', out);
  });
  
  // Clear completed
  store.subscribe('intent.todo.clearCompleted', () => {
    const items = store.get('domain.todos.items') || [];
    store.set('domain.todos.items', items.filter(t => !t.done));
  });
  
  // UI filter
  store.subscribe('intent.ui.filter', (detail) => {
    const { filter } = detail;
    const f = (filter === 'active' || filter === 'completed') ? filter : 'all';
    store.set('ui.todos.filter', f);
  });
}

// Test suite
const tests = {
  'add todo creates correct structure': () => {
    const t = createEventTest({
      domain: { todos: { items: [] } }
    });
    
    // Set up bridges for this test
    setupTodoBridges(t.store);
    
    // Trigger intent
    t.trigger('intent.todo.add', { text: 'Buy milk' });
    
    // Assert array structure and element types
    t.assertArrayOf('domain.todos.items', {
      id: 'number',
      text: 'string',
      done: 'boolean'
    });
    
    // Assert array length
    t.assertArrayLength('domain.todos.items', 1);
    
    // Assert specific values
    const items = t.store.get('domain.todos.items');
    if (items[0].text !== 'Buy milk') {
      throw new Error('Expected first todo text to be "Buy milk"');
    }
    if (items[0].done !== false) {
      throw new Error('Expected first todo to not be done');
    }
  },

  'toggle todo changes done state': () => {
    const t = createEventTest({
      domain: { todos: { items: [{ id: 1, text: 'Buy milk', done: false }] } }
    });
    
    // Set up bridges for this test
    setupTodoBridges(t.store);
    
    // Trigger toggle
    t.trigger('intent.todo.toggle', { id: 1 });
    
    // Assert structure
    t.assertArrayOf('domain.todos.items', {
      id: 'number',
      text: 'string',
      done: 'boolean'
    });
    
    // Assert done is now true
    const items = t.store.get('domain.todos.items');
    if (items[0].done !== true) {
      throw new Error('Expected todo to be done');
    }
  },

  'clear completed removes done todos': () => {
    const t = createEventTest({
      domain: {
        todos: {
          items: [
            { id: 1, text: 'Buy milk', done: true },
            { id: 2, text: 'Walk dog', done: false }
          ]
        }
      }
    });
    
    // Set up bridges for this test
    setupTodoBridges(t.store);
    
    // Trigger clear
    t.trigger('intent.todo.clearCompleted');
    
    // Assert only active todo remains
    t.assertArrayLength('domain.todos.items', 1);
    
    const items = t.store.get('domain.todos.items');
    if (items[0].text !== 'Walk dog') {
      throw new Error('Expected only "Walk dog" to remain');
    }
  },

  'filter intent updates filter state': () => {
    const t = createEventTest({
      ui: { todos: { filter: 'all' } }
    });
    
    // Set up bridges for this test
    setupTodoBridges(t.store);
    
    // Trigger filter change
    t.trigger('intent.ui.filter', { filter: 'active' });
    
    // Assert type
    t.assertType('ui.todos.filter', 'string');
    
    // Assert value
    t.assertPath('ui.todos.filter', 'active');
  },

  'intent.todo.add has correct shape': () => {
    const t = createEventTest({});
    
    // Trigger intent
    t.trigger('intent.todo.add', { text: 'Buy milk' });
    
    // Assert intent shape (for type generation)
    t.assertShape('intent.todo.add', {
      text: 'string'
    });
  },

  'intent.todo.toggle has correct shape': () => {
    const t = createEventTest({});
    
    // Trigger intent
    t.trigger('intent.todo.toggle', { id: 1 });
    
    // Assert intent shape
    t.assertShape('intent.todo.toggle', {
      id: 'number'
    });
  },

  'empty todos array is valid': () => {
    const t = createEventTest({
      domain: { todos: { items: [] } }
    });
    
    // Assert empty array is still typed correctly
    t.assertArrayOf('domain.todos.items', {
      id: 'number',
      text: 'string',
      done: 'boolean'
    });
    
    t.assertArrayLength('domain.todos.items', 0);
  }
};

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests(tests);
}

export default tests;
