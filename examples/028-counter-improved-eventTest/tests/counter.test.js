/**
 * counter.test.js - Event-sequence tests for counter functionality
 * 
 * These tests verify direct state manipulation for counter operations
 */

import { createEventTest, test, runTests } from './eventTest.js';

// Helper functions that match the view logic
function increment(store) {
  const current = store.get('count');
  store.set('count', current + 1);
}

function decrement(store) {
  const current = store.get('count');
  store.set('count', current - 1);
}

function double(store) {
  const current = store.get('count');
  store.set('count', current * 2);
}

// Test suite
const tests = {
  'increment increases count by 1': () => {
    const t = createEventTest({ count: 0 });
    
    increment(t.store);
    
    // Assert type
    t.assertType('count', 'number');
    
    // Assert value
    const count = t.store.get('count');
    if (count !== 1) {
      throw new Error(`Expected count to be 1, got ${count}`);
    }
  },

  'decrement decreases count by 1': () => {
    const t = createEventTest({ count: 5 });
    
    decrement(t.store);
    
    // Assert type
    t.assertType('count', 'number');
    
    // Assert value
    const count = t.store.get('count');
    if (count !== 4) {
      throw new Error(`Expected count to be 4, got ${count}`);
    }
  },

  'double multiplies count by 2': () => {
    const t = createEventTest({ count: 3 });
    
    double(t.store);
    
    // Assert type
    t.assertType('count', 'number');
    
    // Assert value
    const count = t.store.get('count');
    if (count !== 6) {
      throw new Error(`Expected count to be 6, got ${count}`);
    }
  },

  'multiple increments work correctly': () => {
    const t = createEventTest({ count: 0 });
    
    increment(t.store);
    increment(t.store);
    increment(t.store);
    
    const count = t.store.get('count');
    if (count !== 3) {
      throw new Error(`Expected count to be 3, got ${count}`);
    }
  },

  'mixed operations work correctly': () => {
    const t = createEventTest({ count: 10 });
    
    increment(t.store);  // 11
    double(t.store);     // 22
    decrement(t.store);  // 21
    
    const count = t.store.get('count');
    if (count !== 21) {
      throw new Error(`Expected count to be 21, got ${count}`);
    }
  },

  'count can go negative': () => {
    const t = createEventTest({ count: 0 });
    
    decrement(t.store);
    decrement(t.store);
    
    const count = t.store.get('count');
    if (count !== -2) {
      throw new Error(`Expected count to be -2, got ${count}`);
    }
  }
};

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests(tests);
}

export default tests;
