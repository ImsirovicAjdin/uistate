// store.js — singleton eventState store for the SPA
import { createEventState } from '../runtime/core/eventStateNew.js';

const initial = {
  ui: {
    route: { path: '/', view: 'home', params: {}, query: {}, transitioning: false },
    theme: 'light'
  },
  todos: {
    items: [],
    filter: 'all'
  }
};

const store = createEventState(initial);
export default store;
