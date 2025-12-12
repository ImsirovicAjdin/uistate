// runtime/core/router.js — Generic SPA router factory for eventState stores
// Usage:
//   const router = createRouter({
//     routes: [{ path: '/', view: 'home', component: HomeView }],
//     store,
//     rootSelector: '[data-route-root]',
//     debug: true
//   });
//   router.start();

export function createRouter(config) {
  const {
    routes = [],
    store,
    rootSelector = '[data-route-root]',
    fallback = null,
    debug = false,
    linkSelector = 'a[data-link]',
    navSelector = 'nav a[data-link]',
  } = config;

  // Detect base path from <base href> if present
  const BASE_PATH = (() => {
    const b = document.querySelector('base[href]');
    if (!b) return '';
    try {
      const u = new URL(b.getAttribute('href'), location.href);
      let p = u.pathname;
      if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
      return p;
    } catch { return ''; }
  })();

  function stripBase(pathname) {
    if (BASE_PATH && pathname.startsWith(BASE_PATH)) {
      const rest = pathname.slice(BASE_PATH.length) || '/';
      return rest.startsWith('/') ? rest : ('/' + rest);
    }
    return pathname;
  }

  function withBase(pathname) {
    if (!BASE_PATH) return pathname;
    if (pathname === '/') return BASE_PATH || '/';
    return (BASE_PATH + (pathname.startsWith('/') ? '' : '/') + pathname);
  }

  function normalizePath(p) {
    if (!p) return '/';
    try {
      if (p[0] !== '/') p = '/' + p;
      if (p === '/index.html') return '/';
      if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
      return p;
    } catch { return '/'; }
  }

  function resolve(pathname) {
    const p = normalizePath(pathname);
    const r = routes.find(r => r.path === p);
    if (r) return { ...r, params: {} };
    if (fallback) return { ...fallback, params: {} };
    return null;
  }

  function getRoot() {
    const el = document.querySelector(rootSelector);
    if (!el) throw new Error('Route root not found: ' + rootSelector);
    return el;
  }

  function setActiveNav(pathname) {
    document.querySelectorAll(navSelector).forEach(a => {
      const url = new URL(a.getAttribute('href'), location.href);
      const linkPath = normalizePath(stripBase(url.pathname));
      const here = normalizePath(pathname);
      const isExact = linkPath === here;
      const isParent = !isExact && linkPath !== '/' && here.startsWith(linkPath);
      const active = isExact || isParent;
      a.classList.toggle('active', active);
      if (isExact) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  // State
  let current = { viewKey: null, unboot: null, path: null, search: '' };
  let navController = null;
  const scrollPositions = new Map();
  history.scrollRestoration = 'manual';

  // Core navigate function
  async function navigate(pathname, { replace = false, search = '', restoreScroll = false } = {}) {
    const root = getRoot();
    const appPath = normalizePath(stripBase(pathname));
    const resolved = resolve(appPath);
    
    if (!resolved) {
      if (debug) console.warn('[router] No route found for:', appPath);
      return;
    }

    const viewKey = resolved.view;
    const component = resolved.component;
    const html = document.documentElement;
    const prevViewKey = current.viewKey;

    const searchStr = search && search.startsWith('?') ? search : (search ? ('?' + search) : '');

    // Always log navigation for telemetry
    console.log('[nav] navigate', { from: current.path, to: appPath, view: viewKey });
    
    if (debug) {
      console.debug('[router] navigate', { pathname, appPath, searchStr, view: viewKey, params: resolved.params });
    }

    // Same-route no-op guard
    if (current.path === appPath && current.search === searchStr) {
      return;
    }

    // Abort in-flight boot
    if (navController) navController.abort();
    navController = new AbortController();
    const { signal } = navController;

    // Transition start
    if (store) {
      try { store.set('ui.route.transitioning', true); } catch {}
    }
    html.setAttribute('data-transitioning', 'on');

    // Save scroll position
    if (current.path) {
      scrollPositions.set(current.path, { x: scrollX, y: scrollY });
    }

    // Unboot previous view
    if (typeof current.unboot === 'function') {
      try { await current.unboot(); } catch (_e) {}
    }

    // Clear DOM
    root.replaceChildren();

    // Boot new view
    const unboot = await (component.boot?.({ store, el: root, signal }) || Promise.resolve(() => {}));
    current = { viewKey, unboot, path: appPath, search: searchStr };

    // Update nav active state
    setActiveNav(appPath);

    // Parse query params
    const urlForQuery = new URL(location.origin + withBase(appPath) + searchStr);
    const q = {};
    urlForQuery.searchParams.forEach((v, k) => { q[k] = v; });

    // Update store
    if (store) {
      try {
        if (store.setMany) {
          store.setMany({
            'ui.route.view': viewKey,
            'ui.route.path': appPath,
            'ui.route.params': resolved.params || {},
            'ui.route.query': q,
          });
        } else {
          store.set('ui.route.view', viewKey);
          store.set('ui.route.path', appPath);
          store.set('ui.route.params', resolved.params || {});
          store.set('ui.route.query', q);
        }
      } catch {}
    }

    // Update browser history
    const useReplace = replace || (prevViewKey === viewKey);
    if (useReplace) history.replaceState({}, '', withBase(appPath) + searchStr);
    else history.pushState({}, '', withBase(appPath) + searchStr);

    // Set view attribute
    html.setAttribute('data-view', viewKey);

    if (debug) {
      console.debug('[router] view', { viewKey, path: appPath, query: q });
    }

    // Transition end
    if (store) {
      try { store.set('ui.route.transitioning', false); } catch {}
    }
    html.setAttribute('data-transitioning', 'off');

    // Focus management
    if (!root.hasAttribute('tabindex')) root.setAttribute('tabindex', '-1');
    try { root.focus({ preventScroll: true }); } catch {}

    // Scroll restoration
    if (restoreScroll) {
      const pos = scrollPositions.get(appPath);
      if (pos) scrollTo(pos.x, pos.y);
    } else {
      scrollTo(0, 0);
    }
  }

  function navigateQuery(patch = {}, { replace = true } = {}) {
    const params = new URLSearchParams(current.search || '');
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === undefined || v === '') params.delete(k);
      else params.set(k, String(v));
    }
    const searchStr = params.toString();
    const prefixed = searchStr ? ('?' + searchStr) : '';
    const path = current.path || normalizePath(stripBase(location.pathname));
    return navigate(path, { search: prefixed, replace });
  }

  function navigatePath(path, { replace = true } = {}) {
    const appPath = normalizePath(stripBase(path));
    const searchStr = current.search || '';
    return navigate(appPath, { search: searchStr, replace });
  }

  function onClick(e) {
    const a = e.target.closest(linkSelector);
    if (!a) return;
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const url = new URL(a.getAttribute('href'), location.href);
    if (url.origin !== location.origin) return;
    e.preventDefault();
    
    // Log navigation click
    console.log('[nav] click', { href: a.getAttribute('href'), text: a.textContent.trim() });
    
    navigate(url.pathname, { search: url.search }).catch(() => {});
  }

  function onPop() {
    navigate(location.pathname, { replace: true, search: location.search, restoreScroll: true }).catch(() => {});
  }

  // Public API
  return {
    navigate,
    navigateQuery,
    navigatePath,
    
    start() {
      window.addEventListener('click', onClick);
      window.addEventListener('popstate', onPop);
      navigate(location.pathname, { replace: true, search: location.search, restoreScroll: true });
      return this;
    },

    stop() {
      window.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPop);
      if (typeof current.unboot === 'function') {
        try { current.unboot(); } catch {}
      }
      return this;
    },

    getCurrent() {
      return { ...current };
    }
  };
}
