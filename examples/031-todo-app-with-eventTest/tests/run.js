#!/usr/bin/env node
/**
 * run.js - Test runner for Node.js
 * 
 * Usage: node tests/run.js
 */

import { runTests } from './eventTest.js';
import todosTests from './todos.test.js';

// Combine all test suites
const allTests = {
  ...todosTests
};

// Run tests
const results = runTests(allTests);

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
