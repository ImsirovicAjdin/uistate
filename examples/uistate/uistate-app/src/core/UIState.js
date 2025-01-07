// UIState - CSS-based UI state management
const UIState = {
    _sheet: null,
    _observers: new Map(),
    _state: new Map(),

    init() {
        if (!this._sheet) {
            const style = document.createElement('style');
            document.head.appendChild(style);
            this._sheet = style.sheet;
            this._addRule(':root {}');
        }
        return this;
    },

    setState(key, value) {
        this._state.set(key, value);
        const cssValue = typeof value === 'string' ? value : JSON.stringify(value);
        document.documentElement.style.setProperty(`--${key}`, cssValue);
        this._notifyObservers(key, value);
    },

    getState(key) {
        if (this._state.has(key)) {
            return this._state.get(key);
        }
        const value = getComputedStyle(document.documentElement)
            .getPropertyValue(`--${key}`).trim();
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    },

    observe(key, callback) {
        if (!this._observers.has(key)) {
            this._observers.set(key, new Set());
        }
        this._observers.get(key).add(callback);

        return () => {
            this._observers.get(key)?.delete(callback);
        };
    },

    _notifyObservers(key, value) {
        this._observers.get(key)?.forEach(callback => callback(value));
    },

    _addRule(rule) {
        this._sheet.insertRule(rule, this._sheet.cssRules.length);
    }
};

export default UIState;
