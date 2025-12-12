// Simple router setup for the todo app example
import store from './store.js';
import { createRouter } from '../runtime/core/router.js';
import * as home from './views/home.js';
import * as todoDemo from './views/todoDemo.js';

const routes = [
  { path: '/', view: 'home', component: home },
  { path: '/todo-demo', view: 'todoDemo', component: todoDemo },
];

// Initialize router with correct config object
const router = createRouter({
  routes,
  store,
  rootSelector: '[data-route-root]',
  debug: true
});

// Start the router after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => router.start());
} else {
  router.start();
}
