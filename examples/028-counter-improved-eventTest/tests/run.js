#!/usr/bin/env node
/**
 * run.js - Test runner for Node.js
 * 
 * Usage: node tests/run.js
 */

import { runTests } from './eventTest.js';
import counterTests from './counter.test.js';

// Combine all test suites
const allTests = {
  ...counterTests
};

// Run tests
const results = runTests(allTests);

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
