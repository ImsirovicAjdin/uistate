/**
 * UIstate - Declarative state management for the web
 * 
 * A unified system that combines CSS and Event-based state management with templating
 * Integrates CSS variables, event-based state, and template management for optimal performance
 */
import { createCssState } from './cssState.js';
import { createEventState } from './eventState.js';
import { createTemplateManager } from './templateManager.js';

const createUnifiedState = (initialState = {}) => {
    // Initialize state store
    const store = JSON.parse(JSON.stringify(initialState));
    
    // Create the CSS state manager
    const cssState = createCssState(initialState);
    
    // Create the event state manager with the same initial state
    const eventState = createEventState(initialState);
    
    // Create a unified API
    const unifiedState = {
        _isNotifying: false, // Flag to prevent recursive notifications
        
        // Get state with hierarchical path support
        getState(path) {
            if (!path) return store;
            
            // Try to get from event state first (faster)
            const value = eventState.get(path);
            
            if (value !== undefined) return value;
            
            // Fall back to CSS variable (for values set outside this API)
            const cssPath = path.replace(/\./g, "-");
            return cssState.getState(cssPath);
        },
        
        // Set state with hierarchical path support
        setState(path, value) {
            // Prevent recursive notifications
            if (this._isNotifying) return value;
            
            this._isNotifying = true;
            
            try {
                // Update event state
                eventState.set(path, value);
                
                // Update CSS state (convert dots to dashes for CSS variables)
                const cssPath = path.replace(/\./g, "-");
                cssState.setState(cssPath, value);
                
                return value;
            } finally {
                this._isNotifying = false;
            }
        },
        
        // Subscribe to state changes with support for wildcards
        subscribe(path, callback) {
            return eventState.subscribe(path, callback);
        },
        
        // Observe CSS state changes (simpler API, no wildcards)
        observe(key, callback) {
            return cssState.observe(key, callback);
        },
        
        // Clean up resources
        destroy() {
            cssState.destroy();
            eventState.destroy();
        }
    };
    
    return unifiedState;
};

// Create a singleton instance of the unified state
const UnifiedState = createUnifiedState();

// Create a template manager connected to the unified state
const TemplateManager = createTemplateManager(UnifiedState);

// Create a combined API for backward compatibility
const UIstate = {
    ...UnifiedState,
    
    // Add template manager methods
    handlers: TemplateManager.handlers,
    onAction: TemplateManager.onAction.bind(TemplateManager),
    attachDelegation: TemplateManager.attachDelegation.bind(TemplateManager),
    mount: TemplateManager.mount.bind(TemplateManager),
    
    // Initialize both systems
    init() {
        // Attach event delegation to document body
        this.attachDelegation(document.body);
        return this;
    }
};

export default UIstate;
export { 
    createUnifiedState, 
    UnifiedState,
    createTemplateManager,
    TemplateManager,
    UIstate 
};
