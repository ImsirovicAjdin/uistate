// app/router.js — App-specific router configuration
import { createRouter } from '../runtime/core/router.js';
import { upgradeEventState } from '../runtime/extensions/eventState.plus.js';
import store from './store.js';
import * as Home from './views/home.js';
import * as TodoDemo from './views/todoDemo.js';

// Upgrade store for setMany support
const storePlus = upgradeEventState(store);

// Create and start router
const router = createRouter({
  routes: [
    { path: '/', view: 'home', component: Home },
    { path: '/todo-demo', view: 'todo-demo', component: TodoDemo },
  ],
  store: storePlus,
  rootSelector: '[data-route-root]',
  fallback: { path: '/', view: 'home', component: Home },
  debug: import.meta?.env?.DEV || false,
});

router.start();

// Export router API
export const { navigate, navigateQuery, navigatePath } = router;
