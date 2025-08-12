/**
 * UIstate - Simple barrel file for core modules
 * 
 * Exports the four core UIstate modules:
 * - cssState: CSS custom properties state management
 * - eventState: Event-based state management
 * - stateSerializer: State serialization utilities  
 * - templateManager: Declarative template management
 */

// Export the four core modules
export { createCssState } from './cssState.js';
export { createEventState } from './eventState.js';
export { default as stateSerializer } from './stateSerializer.js';
export { createTemplateManager } from './templateManager.js';

// For convenience, also export cssState as default
export { createCssState as default } from './cssState.js';
