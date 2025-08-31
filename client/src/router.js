// src/router.js
import { getLoggedUser } from './services/auth.js';

// 1) En vez de rutas -> archivos, mapea rutas -> nombre lógico de la vista
const routeViews = {
  '/': 'landing',
  '/login': 'login',
  '/register': 'register',
  '/client': 'client',
  '/barbers': 'barbers',
  '/admin': 'admin',
  '/404': '404',
};

// 2) Igual para controladores
const routeControllers = {
  '/': 'landing',
  '/login': 'login',
  '/register': 'register',
  '/client': 'client',
  '/barbers': 'barbers',
  '/admin': 'admin',
  '/404': '404',
};

const app = document.getElementById('app');

// === IMPORTS VITE ===
// Vistas: las cargamos como string (HTML) para inyectarlas en el DOM
const views = import.meta.glob('./views/*.html', { as: 'raw', eager: true });
// Controladores: función que importa on-demand el módulo JS
const controllers = import.meta.glob('./controllers/*.js'); // no eager

// ===== Helpers =====
function normalizePath(pathname) {
  try {
    const url = new URL(pathname, location.origin);
    const p = url.pathname.replace(/\/+$/, '') || '/';
    return routeViews[p] ? p : '/404';
  } catch {
    return '/404';
  }
}

function roleHome(user) {
  const r = user?.code_name;
  if (r === 'ADMIN_01') return '/admin';
  if (r === 'BARBER_02') return '/barbers';
  if (r === 'CLIENT_03') return '/client';
  return '/login';
}

// Guards: retornan true si pueden entrar
const guards = {
  '/login'   : (user) => !user,
  '/register': (user) => !user,
  '/client'  : (user) => user?.code_name === 'CLIENT_03',
  '/barbers' : (user) => user?.code_name === 'BARBER_02',
  '/admin'   : (user) => user?.code_name === 'ADMIN_01',
  // landing sin guard
};

// Caché simple
let currentUser = null;
let userFetchedOnce = false;
let pendingNav = null;

async function ensureUser() {
  if (userFetchedOnce && currentUser !== null) return currentUser;
  try {
    // IMPORTANTE: que getLoggedUser haga fetch con { credentials: 'include' }
    currentUser = await getLoggedUser();
    console.log('Current user:', currentUser);
    userFetchedOnce = true;
  } catch {
    currentUser = null;
    userFetchedOnce = true;
  }
  return currentUser;
}

async function resolveAccess(path) {
  const normalized = normalizePath(path);
  const guard = guards[normalized];

  if (!guard) return { route: normalized, user: currentUser };

  const user = await ensureUser();

  if (!guard(user)) {
    if ((normalized === '/login' || normalized === '/register') && user) {
      return { route: roleHome(user), user };
    }
    if (!user) {
      return { route: '/login', user: null };
    }
    return { route: '/404', user };
  }
  return { route: normalized, user: currentUser };
}

// === NUEVO: cargar vista desde imports (sin fetch a /src/...) ===
export async function loadView(path) {
  const normalized = normalizePath(path);
  const viewName = routeViews[normalized] || '404';
  const key = `./views/${viewName}.html`;
  const html = views[key];

  try {
    if (!html) throw new Error(`View not found: ${key}`);
    app.innerHTML = html;

    const ctlrName = routeControllers[normalized];
    const ctlrKey = ctlrName ? `./controllers/${ctlrName}.js` : null;
    if (ctlrKey && controllers[ctlrKey]) {
      const module = await controllers[ctlrKey]();
      module?.init?.();
    }
  } catch (err) {
    console.error('loadView error:', err);
    app.innerHTML = `<h1>Unexpected error while loading the view.</h1>`;
  }
}

export async function navigation(path) {
  if (pendingNav) {
    try { await pendingNav; } catch {}
  }
  const navPromise = (async () => {
    const wanted = normalizePath(path);
    const { route } = await resolveAccess(wanted);

    if (route !== location.pathname) {
      history.pushState(null, '', route);
    }
    await loadView(route);
  })();

  pendingNav = navPromise;
  try { await navPromise; } finally { pendingNav = null; }
}

window.addEventListener('popstate', async () => {
  const wanted = location.pathname;
  const { route } = await resolveAccess(wanted);
  await loadView(route);
});

export function navigationTag() {
  document.addEventListener('click', async (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    const href = a.getAttribute('href') || a.getAttribute('data-link');
    if (!href) return;

    const isInternal = href.startsWith('/') && !a.target;
    const hasDataLink = a.hasAttribute('data-link');
    if (!isInternal && !hasDataLink) return;

    e.preventDefault();
    await navigation(href);
  });
}

export async function bootRouter() {
  await ensureUser();
  await navigation(location.pathname);
}
