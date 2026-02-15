// Mini QueryClient wrapper for EventState
// Thin async layer with standard query patterns

export const createQueryClient = (store) => {
  return {
    // Run a query with async state handling
    async query(key, fetcher) {
      return await store.setAsync(`query.${key}`, fetcher);
    },

    // Subscribe to query data
    subscribe(key, cb) {
      return store.subscribe(`query.${key}.data`, cb);
    },

    // Subscribe to query status
    subscribeToStatus(key, cb) {
      return store.subscribe(`query.${key}.status`, cb);
    },

    // Subscribe to query errors
    subscribeToError(key, cb) {
      return store.subscribe(`query.${key}.error`, cb);
    },

    // Read current query data
    getData(key) {
      return store.get(`query.${key}.data`);
    },

    // Read current query status
    getStatus(key) {
      return store.get(`query.${key}.status`);
    },

    // Read current query error
    getError(key) {
      return store.get(`query.${key}.error`);
    },

    // Cancel active query
    cancel(key) {
      store.cancel(`query.${key}`);
    },

    // Reset query to idle
    invalidate(key) {
      const p = `query.${key}`;
      store.set(`${p}.data`, null);
      store.set(`${p}.status`, "idle");
      store.set(`${p}.error`, null);
    },
  };
};
