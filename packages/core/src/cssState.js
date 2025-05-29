/**
 * UIstate - CSS-based state management module with integrated serialization
 * Part of the UIstate declarative state management system
 * Uses CSS custom properties and data attributes for state representation
 * Includes built-in serialization for complex objects and special characters
 */
import StateSerializer from './stateSerializer.js';

const createCssState = (initialState = {}, serializer = StateSerializer) => {
    const state = {
        _sheet: null,
        _observers: new Map(),
        _serializer: serializer,
        
        init() {
            if (!this._sheet) {
                const style = document.createElement('style');
                document.head.appendChild(style);
                this._sheet = style.sheet;
                this._addRule(':root {}');
            }
            
            // Initialize with any provided state
            if (initialState && typeof initialState === 'object') {
                Object.entries(initialState).forEach(([key, value]) => {
                    this.setState(key, value);
                });
            }
            
            return this;
        },
        
        setState(key, value) {
            // Use serializer for CSS variables
            const cssValue = this._serializer.serialize(key, value);
            document.documentElement.style.setProperty(`--${key}`, cssValue);
            
            // For data attributes, handle objects specially
            if (value !== null && value !== undefined) {
                if (typeof value === 'object') {
                    // Use the serializer for the data attribute value
                    document.documentElement.setAttribute(`data-${key}`, this._serializer.serialize(key, value));
                    
                    // For objects, also set each property as a separate data attribute
                    if (!Array.isArray(value)) {
                        Object.entries(value).forEach(([propKey, propValue]) => {
                            const attributeKey = `data-${key}-${propKey.toLowerCase()}`;
                            if (propValue !== null && propValue !== undefined) {
                                if (typeof propValue === 'object') {
                                    document.documentElement.setAttribute(
                                        attributeKey, 
                                        this._serializer.serialize(`${key}.${propKey}`, propValue)
                                    );
                                } else {
                                    document.documentElement.setAttribute(attributeKey, propValue);
                                }
                            } else {
                                document.documentElement.removeAttribute(attributeKey);
                            }
                        });
                    }
                } else {
                    // For primitives, set directly
                    document.documentElement.setAttribute(`data-${key}`, value);
                }
            } else {
                document.documentElement.removeAttribute(`data-${key}`);
            }
            
            this._notifyObservers(key, value);
            return value;
        },
        
        getState(key) {
            const value = getComputedStyle(document.documentElement).getPropertyValue(`--${key}`).trim();
            if (!value) return '';
            
            // Use serializer for deserialization
            return this._serializer.deserialize(key, value);
        },
        
        observe(key, callback) {
            if (!this._observers.has(key)) {
                this._observers.set(key, new Set());
            }
            this._observers.get(key).add(callback);
            return () => {
                const observers = this._observers.get(key);
                if (observers) {
                    observers.delete(callback);
                }
            };
        },
        
        _notifyObservers(key, value) {
            const observers = this._observers.get(key);
            if (observers) {
                observers.forEach(cb => cb(value));
            }
        },
        
        _addRule(rule) {
            if (this._sheet) {
                this._sheet.insertRule(rule, this._sheet.cssRules.length);
            }
        },
        
        // Add serializer configuration method
        configureSerializer(config) {
            if (this._serializer.configure) {
                this._serializer.configure(config);
            }
            return this;
        },
        
        // Clean up resources
        destroy() {
            this._observers.clear();
            // The style element will remain in the DOM
            // as removing it would affect the UI state
        }
    };
    
    return state.init();
};

// Legacy singleton for backward compatibility
const CssState = createCssState();

export default createCssState;
export { createCssState, CssState };
