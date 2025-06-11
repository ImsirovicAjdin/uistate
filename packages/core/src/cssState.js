/**
 * UIstate - CSS-based state management module with integrated serialization
 * Part of the UIstate declarative state management system
 * Uses CSS custom properties and data attributes for state representation
 * Features modular extension capabilities for DOM binding and events
 */
import StateSerializer from './stateSerializer.js';

const createCssState = (initialState = {}, serializer = StateSerializer) => {
    const state = {
        _sheet: null,
        _observers: new Map(),
        _serializer: serializer,
        _specialHandlers: {},
        _eventHandlers: new Map(), // Store custom event binding handlers

        init(serializerConfig) {
            if (!this._sheet) {
                const style = document.createElement('style');
                document.head.appendChild(style);
                this._sheet = style.sheet;
                this._addRule(':root {}');
            }

            // Configure serializer if options provided
            if (serializerConfig && typeof serializerConfig === 'object') {
                this._serializer.configure(serializerConfig);
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

            // Use serializer to handle all attribute application consistently
            this._serializer.applyToAttributes(key, value);

            // Notify any registered observers of the state change
            this._notifyObservers(key, value);
            return value;
        },

        setStates(stateObject) {
            Object.entries(stateObject).forEach(([key, value]) => {
                this.setState(key, value);
            });
            return this;
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

        registerSpecialHandler(stateKey, handlerFn) {
            this._specialHandlers[stateKey] = handlerFn;
            return this;
        },

        // New method for registering event bindings
        registerEventBinding(eventType, handler) {
            this._eventHandlers.set(eventType, handler);
            return this;
        },

        setupObservers(container = document) {
            container.querySelectorAll('[data-observe]:not([data-observing])').forEach(el => {
                const stateKey = el.dataset.observe;

                this.observe(stateKey, (value) => {
                    // Special handlers should run first to set data-state
                    if (this._specialHandlers[stateKey]?.observe) {
                        this._specialHandlers[stateKey].observe(value, el);
                    } else if (stateKey.endsWith('-state') && el.hasAttribute('data-state')) {
                        // Only update data-state for elements that already have this attribute
                        el.dataset.state = value;
                    } else {
                        // For normal state observers like theme, counter, etc.
                        el.textContent = value;
                    }
                });

                // Trigger initial state
                const initialValue = this.getState(stateKey);
                if (this._specialHandlers[stateKey]?.observe) {
                    this._specialHandlers[stateKey].observe(initialValue, el);
                } else if (stateKey.endsWith('-state') && el.hasAttribute('data-state')) {
                    // Only set data-state for elements that should have this attribute
                    el.dataset.state = initialValue;
                } else {
                    // For normal elements
                    el.textContent = initialValue;
                }

                el.dataset.observing = 'true';
            });

            return this;
        },

        // Default event handlers available for implementations to use
        defaultClickHandler(e) {
            const target = e.target.closest('[data-state-action]');
            if (!target) return;

            const stateAction = target.dataset.stateAction;
            if (!stateAction) return;

            // Special handlers get first priority
            if (this._specialHandlers[stateAction]?.action) {
                this._specialHandlers[stateAction].action(target);
                return;
            }

            // Handle direct value setting via data-state-value
            if (target.dataset.stateValue !== undefined) {
                const valueToSet = target.dataset.stateValue;
                this.setState(stateAction, valueToSet);
            }
        },

        defaultInputHandler(e) {
            const target = e.target;
            const stateAction = target.dataset.stateAction;

            if (!stateAction) return;

            // Special handlers should access any needed data directly from the target
            if (this._specialHandlers[stateAction]?.action) {
                this._specialHandlers[stateAction].action(target);
            }
        },

        // Updated setupStateActions to use registered event handlers
        setupStateActions(container = document) {
            // Only bind the registered event types
            this._eventHandlers.forEach((handler, eventType) => {
                container.addEventListener(eventType, handler);
            });

            // If no event handlers registered, register the default ones
            if (this._eventHandlers.size === 0) {
                container.addEventListener('click', (e) => this.defaultClickHandler(e));
                container.addEventListener('input', (e) => this.defaultInputHandler(e));
            }

            return this;
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

// Create a singleton instance for easy usage
const UIstate = createCssState();

export { createCssState };
export default UIstate;
