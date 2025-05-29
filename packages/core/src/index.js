/**
 * UIstate - Declarative state management for the web
 * 
 * A unified system that combines CSS and Event-based state management with templating
 * Integrates CSS variables, event-based state, and template management for optimal performance
 * Provides a simple, declarative API for state management
 * Uses the DOM as the source of truth for state
 * Supports plugins through a clean composition system
 */
import createCssState from './cssState.js';
import { createEventState } from './eventState.js';
import { createTemplateManager } from './templateManager.js';

/**
 * Utility function to convert hierarchical path notation to CSS variable notation
 * Converts dot notation (e.g., 'user.profile.name') to dash notation (e.g., 'user-profile-name')
 * @param {string} path - Hierarchical path with dot notation
 * @returns {string} - CSS-compatible path with dash notation
 */
function convertPathToCssPath(path) {
    return path.replace(/\./g, "-");
}

const createUnifiedState = (initialState = {}) => {
    // Create the CSS state manager with integrated serialization
    const cssState = createCssState(initialState);
    
    // Create the event state manager with the same initial state
    const eventState = createEventState(initialState);
    
    // Plugin system
    const plugins = new Map();
    const middlewares = [];
    const lifecycleHooks = {
        beforeStateChange: [],
        afterStateChange: [],
        onInit: [],
        onDestroy: []
    };
    
    // Create a unified API
    const unifiedState = {
        _isNotifying: false,
        _cssState: cssState, // Reference to cssState for direct access to advanced features
        
        // Get state with hierarchical path support
        getState(path) {
            // Always use eventState as the source of truth
            // This ensures consistency with the DOM state
            const value = eventState.get(path);
            
            // If path is undefined or value not found in eventState
            if (path && value === undefined) {
                // Fall back to CSS variable (for values set outside this API)
                const cssPath = convertPathToCssPath(path);
                return cssState.getState(cssPath);
            }
            
            return value;
        },
        
        // Set state with hierarchical path support
        setState(path, value) {
            if (!path) return this;
            
            // Run before state change middlewares
            let finalValue = value;
            let shouldContinue = true;
            
            // Apply middlewares
            for (const middleware of middlewares) {
                const result = middleware(path, finalValue, this.getState.bind(this));
                if (result === false) {
                    shouldContinue = false;
                    break;
                } else if (result !== undefined) {
                    finalValue = result;
                }
            }
            
            // Run lifecycle hooks
            for (const hook of lifecycleHooks.beforeStateChange) {
                hook(path, finalValue, this.getState.bind(this));
            }
            
            if (!shouldContinue) return this;
            
            // Update event state (for JS access and pub/sub)
            eventState.set(path, finalValue);
            
            // Update CSS state (for styling and DOM representation)
            const cssPath = convertPathToCssPath(path);
            cssState.setState(cssPath, finalValue);
            
            // Run after state change hooks
            for (const hook of lifecycleHooks.afterStateChange) {
                hook(path, finalValue, this.getState.bind(this));
            }
            
            return this;
        },
        
        // Plugin system methods
        use(pluginName, plugin) {
            if (plugins.has(pluginName)) {
                console.warn(`Plugin '${pluginName}' is already registered. It will be replaced.`);
            }
            
            // Register the plugin
            plugins.set(pluginName, plugin);
            
            // Initialize the plugin
            if (typeof plugin.init === 'function') {
                // Pass the API to the plugin
                plugin.init(this);
            }
            
            // Register middlewares
            if (Array.isArray(plugin.middlewares)) {
                middlewares.push(...plugin.middlewares);
            }
            
            // Register lifecycle hooks
            if (plugin.hooks) {
                Object.entries(plugin.hooks).forEach(([hookName, hookFn]) => {
                    if (Array.isArray(lifecycleHooks[hookName])) {
                        lifecycleHooks[hookName].push(hookFn);
                    }
                });
            }
            
            // Add plugin methods to the API
            if (plugin.methods) {
                Object.entries(plugin.methods).forEach(([methodName, method]) => {
                    if (typeof method === 'function') {
                        this[methodName] = method.bind(plugin);
                    }
                });
            }
            
            return this;
        },
        
        getPlugin(pluginName) {
            return plugins.get(pluginName);
        },
        
        hasPlugin(pluginName) {
            return plugins.has(pluginName);
        },
        
        removePlugin(pluginName) {
            const plugin = plugins.get(pluginName);
            if (!plugin) return false;
            
            // Run cleanup if available
            if (typeof plugin.destroy === 'function') {
                plugin.destroy();
            }
            
            // Remove plugin methods
            if (plugin.methods) {
                Object.keys(plugin.methods).forEach(methodName => {
                    delete this[methodName];
                });
            }
            
            // Remove middlewares
            if (Array.isArray(plugin.middlewares)) {
                plugin.middlewares.forEach(middleware => {
                    const index = middlewares.indexOf(middleware);
                    if (index !== -1) {
                        middlewares.splice(index, 1);
                    }
                });
            }
            
            // Remove lifecycle hooks
            if (plugin.hooks) {
                Object.entries(plugin.hooks).forEach(([hookName, hookFn]) => {
                    if (Array.isArray(lifecycleHooks[hookName])) {
                        const index = lifecycleHooks[hookName].indexOf(hookFn);
                        if (index !== -1) {
                            lifecycleHooks[hookName].splice(index, 1);
                        }
                    }
                });
            }
            
            // Remove the plugin
            plugins.delete(pluginName);
            return true;
        },
        
        // Add middleware
        addMiddleware(middleware) {
            if (typeof middleware === 'function') {
                middlewares.push(middleware);
                return true;
            }
            return false;
        },
        
        // Add lifecycle hook
        addHook(hookName, hookFn) {
            if (typeof hookFn === 'function' && Array.isArray(lifecycleHooks[hookName])) {
                lifecycleHooks[hookName].push(hookFn);
                return true;
            }
            return false;
        },
        
        // Subscribe to state changes with support for wildcards
        subscribe(path, callback) {
            return eventState.subscribe(path, callback);
        },
        
        // Observe CSS state changes (simpler API, no wildcards)
        observe(key, callback) {
            return cssState.observe(key, callback);
        },
        
        // Configure serialization options
        configureSerializer(config) {
            cssState.configureSerializer(config);
            return this;
        },
        
        // Get current serializer configuration
        getSerializerConfig() {
            return cssState._serializer?.config || null;
        },
        
        // Set serialization mode ('hybrid', 'json', or 'escape')
        setSerializationMode(mode) {
            return this.configureSerializer({ mode });
        },
        
        // Clean up resources
        destroy() {
            // Run onDestroy hooks
            for (const hook of lifecycleHooks.onDestroy) {
                hook();
            }
            
            // Destroy all plugins
            for (const [pluginName, plugin] of plugins.entries()) {
                if (typeof plugin.destroy === 'function') {
                    plugin.destroy();
                }
            }
            
            // Clear plugins and middlewares
            plugins.clear();
            middlewares.length = 0;
            Object.keys(lifecycleHooks).forEach(key => {
                lifecycleHooks[key].length = 0;
            });
            
            // Destroy core state management
            cssState.destroy();
            eventState.destroy();
        }
    };
    
    return unifiedState;
};

// Create a singleton instance of the unified state
const UnifiedState = createUnifiedState();

// Create a template manager plugin
const templateManagerPlugin = {
    name: 'templateManager',
    instance: null,
    
    init(api) {
        this.instance = createTemplateManager(api);
        return this;
    },
    
    destroy() {
        // Any cleanup needed for the template manager
    },
    
    // Plugin methods that will be added to the UIstate API
    methods: {
        onAction(action, handler) {
            return this.instance.onAction(action, handler);
        },
        
        registerActions(actionsMap) {
            return this.instance.registerActions(actionsMap);
        },
        
        attachDelegation(root = document.body) {
            return this.instance.attachDelegation(root);
        },
        
        mount(componentName, container) {
            return this.instance.mount(componentName, container);
        },
        
        renderTemplateFromCss(templateName, data) {
            return this.instance.renderTemplateFromCss(templateName, data);
        },
        
        createComponent(name, renderFn, stateKeys) {
            return this.instance.createComponent(name, renderFn, stateKeys);
        },
        
        applyClassesFromState(element, stateKey, options) {
            return this.instance.applyClassesFromState(element, stateKey, options);
        }
    },
    
    // Expose handlers property
    get handlers() {
        return this.instance.handlers;
    }
};

// Create a combined API with plugin support
const UIstate = {
    ...UnifiedState,
    
    // Initialize the system with plugins
    init() {
        // Register the template manager plugin
        this.use('templateManager', templateManagerPlugin);
        
        // Run onInit hooks
        for (const hook of this.getPlugin('templateManager').instance.lifecycleHooks?.onInit || []) {
        // for (const hook of lifecycleHooks.onInit) {
            hook();
        }
        
        // Attach event delegation to document body
        this.attachDelegation(document.body);
        
        return this;
    }
};

export default UIstate;
export { 
    createUnifiedState, 
    createCssState, 
    createEventState, 
    createTemplateManager,
    convertPathToCssPath,
    templateManagerPlugin
};
