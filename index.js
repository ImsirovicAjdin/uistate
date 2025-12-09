/**
 * UIstate v5 - Core barrel exports
 * 
 * EventState is now the primary export for application state management.
 * cssState remains available for CSS variable/theme management use cases.
 */

// Primary: EventState (recommended for application state)
export { createEventState } from './eventState.js';
export { createEventState as default } from './eventState.js';

// Specialized: CSS State (for CSS variables and theme management)
export { createCssState } from './cssState.js';

// Utilities
export { default as stateSerializer } from './stateSerializer.js';
export { createTemplateManager } from './templateManager.js';
