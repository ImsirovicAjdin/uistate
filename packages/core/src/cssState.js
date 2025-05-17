/**
 * UIstate - CSS-based state management module
 * Part of the UIstate declarative state management system
 * Uses CSS custom properties and data attributes for state representation
 */
const createCssState = (initialState = {}) => {
    const state = {
        _sheet: null,
        _observers: new Map(),
        
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
            const cssValue = typeof value === 'string' ? value : JSON.stringify(value);
            document.documentElement.style.setProperty(`--${key}`, cssValue);
            document.documentElement.setAttribute(`data-${key}`, value);
            this._notifyObservers(key, value);
            return value;
        },
        
        getState(key) {
            const value = getComputedStyle(document.documentElement).getPropertyValue(`--${key}`).trim();
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
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
