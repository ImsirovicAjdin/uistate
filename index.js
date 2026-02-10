/**
 * UIstate v5 - Core barrel exports
 * 
 * EventState is the primary export for application state management.
 * CSS state management has moved to @uistate/css.
 */

// Primary: EventState (recommended for application state)
export { createEventState } from './eventStateNew.js';
export { createEventState as default } from './eventStateNew.js';
