const createEventState = (initial = {}) => {
    const store = JSON.parse(JSON.stringify(initial));

    const bus = new EventTarget();
    let destroyed = false;

    return {
        get: (path) => {
            if (!path) return store;

            // Parse dot-paths: 'items.0' → ['items', '0']
            const parts = path.split('.').flatMap(part => {
                const match = part.match(/([^\[]+)\[(\d+)\]/);
                return match ? [match[1], match[2]] : part;
            });

            return parts.reduce(
                (obj, prop) => (obj && obj[prop] !== undefined ? obj[prop] : undefined),
                store
            );
        },
        set: (path, value) => {
            if (!path) return;
            const parts = path.split('.');
            const last = parts.pop();
            let target = store;

            for (const key of parts) {
              // create intermediate objects as needed
              if (typeof target[key] !== 'object' || target[key] === null) {
                target[key] = {};
              }
              target = target[key];
            }

            target[last] = value;

            if (!destroyed) {
                // exact path
                bus.dispatchEvent(new CustomEvent(path, { detail: value }));

                // parent wildcards: a, a.b -> 'a.*', 'a.b.*'
                for (let i = 1; i <= parts.length; i++) {
                    const parent = parts.slice(0, i).join('.');
                    bus.dispatchEvent(new CustomEvent(`${parent}.*`, { detail: { path, value } }));
                }

                // root wildcard
                bus.dispatchEvent(new CustomEvent('*', { detail: { path, value } }));
            }

            return value;
        },
        subscribe(path, handler) {
            if (destroyed) throw new Error('store destroyed');
            if (!path || typeof handler !== 'function') {
                throw new TypeError('subscribe(path, handler) requires a string path and function handler');
            }
            const onEvent = (evt) => handler(evt.detail, evt);
            bus.addEventListener(path, onEvent);

            return function unsubscribe() {
                bus.removeEventListener(path, onEvent);
            };
        },
        off(unsubscribe) {
            if (typeof unsubscribe !== 'function') {
                throw new TypeError('off(unsubscribe) requires a function returned by subscribe');
            }
            return unsubscribe();
        },

        destroy() {
            if (!destroyed) {
              if (bus.parentNode) bus.parentNode.removeChild(bus);
              destroyed = true;
            }
          }
    };
}

export default createEventState;
export { createEventState };
