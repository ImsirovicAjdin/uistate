/**
 * eventTest.js - Event-Sequence Testing for UIstate
 * 
 * Copyright (c) 2025 Ajdin Imsirovic
 * 
 * This file is licensed under a PROPRIETARY LICENSE.
 * 
 * Permission is hereby granted to USE this software for:
 * - Personal projects
 * - Open-source projects
 * - Educational purposes
 * 
 * RESTRICTIONS:
 * - Commercial use requires a separate license (contact: your@email.com)
 * - Modification and redistribution of this file are NOT permitted
 * - This file may not be included in derivative works without permission
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 * 
 * For commercial licensing inquiries: your@email.com
 * 
 * eventTest.js - Event-Sequence Testing for EventState
 * 
 * Provides TDD-style testing with type extraction capabilities
 */

import { createEventState } from './eventStateNew.js';

export function createEventTest(initialState = {}) {
  const store = createEventState(initialState);
  const eventLog = [];
  const typeAssertions = [];

  // Spy on all events
  store.subscribe('*', (detail) => {
    const { path, value } = detail;
    eventLog.push({ timestamp: Date.now(), path, value });
  });

  const api = {
    store,

    // Trigger a state change
    trigger(path, value) {
      store.set(path, value);
      return this;
    },

    // Assert exact value
    assertPath(path, expected) {
      const actual = store.get(path);
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${path} to be ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
      return this;
    },

    // Assert type (for type generation)
    assertType(path, expectedType) {
      const actual = store.get(path);
      const actualType = typeof actual;
      
      if (actualType !== expectedType) {
        throw new Error(`Expected ${path} to be type ${expectedType}, got ${actualType}`);
      }
      
      // Store for type generation
      typeAssertions.push({ path, type: expectedType });
      return this;
    },

    // Assert array with element shape (for type generation)
    assertArrayOf(path, elementShape) {
      const actual = store.get(path);
      
      if (!Array.isArray(actual)) {
        throw new Error(`Expected ${path} to be an array, got ${typeof actual}`);
      }
      
      // Validate first element matches shape (if array not empty)
      if (actual.length > 0) {
        validateShape(actual[0], elementShape, path);
      }
      
      // Store for type generation
      typeAssertions.push({ path, type: 'array', elementShape });
      return this;
    },

    // Assert object shape (for type generation)
    assertShape(path, objectShape) {
      const actual = store.get(path);
      
      if (typeof actual !== 'object' || actual === null || Array.isArray(actual)) {
        throw new Error(`Expected ${path} to be an object, got ${typeof actual}`);
      }
      
      validateShape(actual, objectShape, path);
      
      // Store for type generation
      typeAssertions.push({ path, type: 'object', shape: objectShape });
      return this;
    },

    // Assert array length
    assertArrayLength(path, expectedLength) {
      const actual = store.get(path);
      
      if (!Array.isArray(actual)) {
        throw new Error(`Expected ${path} to be an array`);
      }
      
      if (actual.length !== expectedLength) {
        throw new Error(`Expected ${path} to have length ${expectedLength}, got ${actual.length}`);
      }
      
      return this;
    },

    // Assert event fired N times
    assertEventFired(path, times) {
      const count = eventLog.filter(e => e.path === path).length;
      if (times !== undefined && count !== times) {
        throw new Error(`Expected ${path} to fire ${times} times, fired ${count}`);
      }
      return this;
    },

    // Get event log
    getEventLog() {
      return [...eventLog];
    },

    // Get type assertions (for type generation)
    getTypeAssertions() {
      return [...typeAssertions];
    }
  };

  return api;
}

// Helper to validate object shape
function validateShape(actual, shape, path) {
  for (const [key, expectedType] of Object.entries(shape)) {
    if (!(key in actual)) {
      throw new Error(`Expected ${path} to have property ${key}`);
    }
    
    const actualValue = actual[key];
    
    // Handle nested objects
    if (typeof expectedType === 'object' && !Array.isArray(expectedType)) {
      validateShape(actualValue, expectedType, `${path}.${key}`);
    } else {
      // Primitive type check
      const actualType = typeof actualValue;
      if (actualType !== expectedType) {
        throw new Error(`Expected ${path}.${key} to be type ${expectedType}, got ${actualType}`);
      }
    }
  }
}

// Simple test runner
export function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    return true;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    return false;
  }
}

// Run multiple tests
export function runTests(tests) {
  console.log('\n🧪 Running tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const [name, fn] of Object.entries(tests)) {
    if (test(name, fn)) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  
  return { passed, failed };
}
