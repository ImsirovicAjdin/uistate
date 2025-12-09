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
 */

import { createEventState } from './eventState.js';

export function createEventTest(initialState = {}) {
  const store = createEventState(initialState);
  const eventLog = [];

  // Spy on all events
  store.subscribe('*', ({ path, value }) => {
    eventLog.push({ timestamp: Date.now(), path, value });
  });

  return {
    store,

    trigger(path, value) {
      store.set(path, value);
      return this;
    },

    assertPath(path, expected) {
      const actual = store.get(path);
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${path} to be ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
      return this;
    },

    assertEventFired(path, times) {
      const count = eventLog.filter(e => e.path === path).length;
      if (times !== undefined && count !== times) {
        throw new Error(`Expected ${path} to fire ${times} times, fired ${count}`);
      }
      return this;
    },

    getEventLog() {
      return [...eventLog];
    }
  };
}
