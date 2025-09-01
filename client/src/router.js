
import { getLoggedUser } from './services/auth.js';

const routes = {
  '/'         : '/src/views/landing.html',
  '/login'    : '/src/views/login.html',
  '/register' : '/src/views/register.html',
  '/client'   : '/src/views/client.html',
  '/barbers'  : '/src/views/barbers.html',
  '/admin'    : '/src/views/admin.html',
  '/404'      : '/src/views/404.html',
};

const controllers = {
  '/'         : '/src/controllers/landing.js',
  '/login'    : '/src/controllers/login.js',
  '/register' : '/src/controllers/register.js',
  '/client'   : '/src/controllers/client.js',
  '/barbers'  : '/src/controllers/barbers.js',
  '/admin'    : '/src/controllers/admin.js',
  '/404'      : '/src/controllers/404.js',
};

const app = document.getElementById('app');

// ===== Helpers =====
function normalizePath(pathname) {
  try {
    const url = new URL(pathname, location.origin);
    const p = url.pathname.replace(/\/+$/, '') || '/';
    return routes[p] ? p : '/404';
  } catch {
    return '/404';
  }
}

function roleHome(user) {
  const r = user?.code_name; // por si tu API usa 'rol'
  if (r === 'ADMIN_01') return '/admin';
  if (r === 'BARBER_02') return '/barbers';
  if (r === 'CLIENT_03') return '/client';
  return '/login';
}

// Guards: retornan true si pueden entrar
const guards = {
  '/login'   : (user) => !user,                 // solo no logueados
  '/register': (user) => !user,                 // solo no logueados
  '/client'  : (user) => user?.code_name === 'CLIENT_03',             // cualquiera logueado
  '/barbers' : (user) => user?.code_name === 'BARBER_02',
  '/admin'   : (user) => user?.code_name === 'ADMIN_01',
  // landing sin guard
};

// Caché simple en memoria para evitar /profile en cada click inmediato
let currentUser = null;
let userFetchedOnce = false;
let pendingNav = null;

async function ensureUser() {
  // Si ya lo pedimos una vez, usamos la última referencia
  // (tu decide si quieres refetch siempre)
  if (userFetchedOnce && currentUser !== null) return currentUser;
  try {
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

  // Rutas públicas sin guard
  if (!guard) return { route: normalized, user: currentUser };

  const user = await ensureUser();

  // Si no pasa el guard
  if (!guard(user)) {
    // Si quiso ir a login/register pero ya está logueado → mandamos a su home por rol
    if ((normalized === '/login' || normalized === '/register') && user) {
      return { route: roleHome(user), user };
    }
    // Si no está logueado → a /login
    if (!user) {
      return { route: '/login', user: null };
    }
    // Está logueado pero sin permisos → 404 (o podrías usar /client)
    return { route: '/404', user };
  }

  // Acceso permitido
  return { route: normalized, user: currentUser };
}

export async function loadView(path) {
  const normalized = normalizePath(path);
  const viewUrl = routes[normalized] || routes['/404'];

  try {
    const res = await fetch(viewUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    app.innerHTML = await res.text();

    const ctlrPath = controllers[normalized];
    if (ctlrPath) {
      const module = await import(/* @vite-ignore */ ctlrPath);
      if (module?.init) module.init();
    }
  } catch (err) {
    console.error('loadView error:', err);
    app.innerHTML = `<h1>Unexpected error while loading the view.</h1>`;
  }
}

export async function navigation(path) {
  // Evita colisiones si se hacen clics rápidos
  if (pendingNav) {
    try { await pendingNav; } catch { /* ignore */ }
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
  try {
    await navPromise;
  } finally {
    pendingNav = null;
  }
}

// Back/forward del navegador
window.addEventListener('popstate', async () => {
  const wanted = location.pathname;
  const { route } = await resolveAccess(wanted);
  await loadView(route);
});

// Intercepta enlaces internos y <a data-link>
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

// Inicial: intenta resolver acceso y cargar vista correcta
export async function bootRouter() {
  await ensureUser();            // llena currentUser si ya hay cookie
  await navigation(location.pathname);
}
