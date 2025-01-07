type StateObserver<T = any> = (value: T) => void;

interface UIStateType {
    _sheet: CSSStyleSheet | null;
    _observers: Map<string, Set<StateObserver>>;
    init(): UIStateType;
    setState<T>(key: string, value: T): void;
    getState<T>(key: string): T;
    observe<T>(key: string, callback: StateObserver<T>): () => void;
    _notifyObservers<T>(key: string, value: T): void;
    _addRule(rule: string): void;
}

const UIState: UIStateType = {
    _sheet: null,
    _observers: new Map(),

    init() {
        if (!this._sheet) {
            const style = document.createElement('style');
            document.head.appendChild(style);
            this._sheet = style.sheet;
            this._addRule(':root {}');
        }
        return this;
    },

    setState<T>(key: string, value: T): void {
        const cssValue = typeof value === 'string' ? value : JSON.stringify(value);
        document.documentElement.style.setProperty(`--${key}`, cssValue);
        this._notifyObservers(key, value);
    },

    getState<T>(key: string): T {
        const value = getComputedStyle(document.documentElement)
            .getPropertyValue(`--${key}`).trim();
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as unknown as T;
        }
    },

    observe<T>(key: string, callback: StateObserver<T>): () => void {
        if (!this._observers.has(key)) {
            this._observers.set(key, new Set());
        }
        this._observers.get(key)?.add(callback as StateObserver);

        return () => {
            this._observers.get(key)?.delete(callback as StateObserver);
        };
    },

    _notifyObservers<T>(key: string, value: T): void {
        this._observers.get(key)?.forEach(callback => 
            (callback as StateObserver<T>)(value)
        );
    },

    _addRule(rule: string): void {
        if (this._sheet) {
            this._sheet.insertRule(rule, this._sheet.cssRules.length);
        }
    }
};

export default UIState;
