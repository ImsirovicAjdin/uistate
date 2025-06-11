/**
 * UIstate - Event-based hierarchical state management module
 * Part of the UIstate declarative state management system
 * Uses DOM events for pub/sub with hierarchical path support
 */

const createEventState = (initial = {}) => {
    // Clone the initial state to avoid direct mutations to the passed object
    const store = JSON.parse(JSON.stringify(initial));

    // Create a dedicated DOM element to use as an event bus
    const bus = document.createElement("x-store");

    // Optional: Keep the bus element off the actual DOM for better encapsulation
    // but this isn't strictly necessary for functionality
    bus.style.display = "none";
    document.documentElement.appendChild(bus);

    return {
        // get a value from the store by path
        get: (path) => {
            if (!path) return store;
            return path
                .split(".")
                .reduce(
                    (obj, prop) =>
                        obj && obj[prop] !== undefined ? obj[prop] : undefined,
                    store
                );
        },

        // set a value in the store by path
        set: (path, value) => {
            if(!path) return;

            // Update the store
            let target = store;
            const parts = path.split(".");
            const last = parts.pop();

            // Create the path if it doesn't exist
            parts.forEach((part) => {
                if (!target[part] || typeof target[part] !== "object") {
                    target[part] = {};
                }
                target = target[part];
            });

            // Set the value
            target[last] = value;

            // Notify subscribers with a DOM event
            bus.dispatchEvent(new CustomEvent(path, { detail: value }));

            // Also dispatch events for parent paths to support wildcards
            if (parts.length > 0) {
                let parentPath = "";
                for (const part of parts) {
                    parentPath = parentPath ? `${parentPath}.${part}` : part;
                    bus.dispatchEvent(
                        new CustomEvent(`${parentPath}.*`, {
                            detail: { path, value },
                        })
                    );
                }

                // Dispatch root wildcard for any state change
                bus.dispatchEvent(
                    new CustomEvent("*", {
                        detail: { path, value},
                    })
                );
            }

            return value;
        },

        // Subscribe to changes on a path
        subscribe: (path, callback) => {
            if (!path || typeof callback !== "function") return () => {};

            const handler = (e) => callback(e.detail, path);
            bus.addEventListener(path, handler);

            return () => bus.removeEventListener(path, handler);
        },

        // Optional method to clean up resources
        destroy: () => {
            if (bus.parentNode) {
                bus.parentNode.removeChild(bus);
            }
        },
    };
};

export default createEventState;
export { createEventState };
