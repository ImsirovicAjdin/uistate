// store.js — singleton eventState store for the SPA
import { createEventState } from '../runtime/core/eventStateNew.js';

const initial = {
  ui: {
    route: { path: '/', view: 'home', params: {}, query: {}, transitioning: false },
    todos: { filter: 'all' },
  },
  domain: {
    todos: { items: [] },
  },
};

const store = createEventState(initial);
export default store;
