/**
 * StateSerializer - Configurable serialization module for UIstate
 * Handles transformation between JavaScript values and CSS-compatible string values
 * 
 * Supports multiple serialization strategies:
 * - 'escape': Uses custom escaping for all values (original UIstate approach)
 * - 'json': Uses JSON.stringify for complex objects, direct values for primitives
 * - 'hybrid': Automatically selects the best strategy based on value type
 */

// Utility functions for CSS value escaping/unescaping
function escapeCssValue(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/[^\x20-\x7E]|[!;{}:()[\]/@,'"]/g, function(char) {
        const hex = char.charCodeAt(0).toString(16);
        return '\\' + hex + ' ';
    });
}

function unescapeCssValue(value) {
    if (typeof value !== 'string') return value;
    // Only perform unescaping if there are escape sequences
    if (!value.includes('\\')) return value;
    
    return value.replace(/\\([0-9a-f]{1,6})\s?/gi, function(match, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    });
}

/**
 * Create a configured serializer instance
 * @param {Object} config - Configuration options
 * @returns {Object} - Serializer instance
 */
function createSerializer(config = {}) {
    // Default configuration
    const defaultConfig = {
        mode: 'hybrid',        // 'escape', 'json', or 'hybrid'
        debug: false,          // Enable debug logging
        complexThreshold: 3,   // Object properties threshold for hybrid mode
        preserveTypes: true    // Preserve type information in serialization
    };
    
    // Merge provided config with defaults
    const options = { ...defaultConfig, ...config };
    
    // Serializer instance
    const serializer = {
        // Current configuration
        config: options,
        
        /**
         * Update configuration
         * @param {Object} newConfig - New configuration options
         */
        configure(newConfig) {
            Object.assign(this.config, newConfig);
            if (this.config.debug) {
                console.log('StateSerializer config updated:', this.config);
            }
        },
        
        /**
         * Serialize a value for storage in CSS variables
         * @param {string} key - The state key (for context-aware serialization)
         * @param {any} value - The value to serialize
         * @returns {string} - Serialized value
         */
        serialize(key, value) {
            // Handle null/undefined
            if (value === null || value === undefined) {
                return '';
            }
            
            const valueType = typeof value;
            const isComplex = valueType === 'object' && 
                             (Array.isArray(value) || 
                              (Object.keys(value).length >= this.config.complexThreshold));
            
            // Select serialization strategy based on configuration and value type
            if (this.config.mode === 'escape' || 
                (this.config.mode === 'hybrid' && !isComplex)) {
                // Use escape strategy for primitives or when escape mode is forced
                if (valueType === 'string') {
                    return escapeCssValue(value);
                } else if (valueType === 'object') {
                    // For simple objects in escape mode, still use JSON but with escaping
                    const jsonStr = JSON.stringify(value);
                    return escapeCssValue(jsonStr);
                } else {
                    // For other primitives, convert to string
                    return String(value);
                }
            } else {
                // Use JSON strategy for complex objects or when JSON mode is forced
                return JSON.stringify(value);
            }
        },
        
        /**
         * Deserialize a value from CSS variable storage
         * @param {string} key - The state key (for context-aware deserialization)
         * @param {string} value - The serialized value
         * @returns {any} - Deserialized value
         */
        deserialize(key, value) {
            // Handle empty values
            if (!value) return '';
            
            // Try JSON parse first for values that look like JSON
            if (this.config.mode !== 'escape' && 
                ((value.startsWith('{') && value.endsWith('}')) || 
                 (value.startsWith('[') && value.endsWith(']')))) {
                try {
                    return JSON.parse(value);
                } catch (e) {
                    if (this.config.debug) {
                        console.warn(`Failed to parse JSON for key "${key}":`, value);
                    }
                    // Fall through to unescaping if JSON parse fails
                }
            }
            
            // For non-JSON or escape mode, try unescaping
            const unescaped = unescapeCssValue(value);
            
            // If unescaped looks like JSON (might have been double-escaped), try parsing it
            if (this.config.mode !== 'escape' &&
                ((unescaped.startsWith('{') && unescaped.endsWith('}')) || 
                 (unescaped.startsWith('[') && unescaped.endsWith(']')))) {
                try {
                    return JSON.parse(unescaped);
                } catch (e) {
                    // Not valid JSON, return unescaped string
                }
            }
            
            return unescaped;
        },
        
        /**
         * Utility method to determine if a value needs complex serialization
         * @param {any} value - Value to check
         * @returns {boolean} - True if complex serialization is needed
         */
        needsComplexSerialization(value) {
            return typeof value === 'object' && value !== null;
        },
        
        /**
         * Set state with proper serialization for CSS variables
         * @param {Object} uistate - UIstate instance
         * @param {string} path - State path
         * @param {any} value - Value to set
         * @returns {any} - The set value
         */
        setStateWithCss(uistate, path, value) {
            // Update UIstate
            uistate.setState(path, value);
            
            // Update CSS variable with properly serialized value
            const cssPath = path.replace(/\./g, '-');
            const serialized = this.serialize(path, value);
            document.documentElement.style.setProperty(`--${cssPath}`, serialized);
            
            // Update data attribute for root level state
            const segments = path.split('.');
            if (segments.length === 1) {
                document.documentElement.dataset[path] = typeof value === 'object' 
                    ? JSON.stringify(value) 
                    : value;
            }
            
            return value;
        },
        
        /**
         * Get state with fallback to CSS variables
         * @param {Object} uistate - UIstate instance
         * @param {string} path - State path
         * @returns {any} - Retrieved value
         */
        getStateFromCss(uistate, path) {
            // First try UIstate
            const value = uistate.getState(path);
            if (value !== undefined) return value;
            
            // If not found, try CSS variable
            const cssPath = path.replace(/\./g, '-');
            const cssValue = getComputedStyle(document.documentElement)
                .getPropertyValue(`--${cssPath}`).trim();
                
            return cssValue ? this.deserialize(path, cssValue) : undefined;
        }
    };
    
    return serializer;
}

// Create a default instance with hybrid mode
const StateSerializer = createSerializer();

export default StateSerializer;
export { createSerializer, escapeCssValue, unescapeCssValue };
