// Service worker del sito: pagine e script propri «network-first» (sempre aggiornati quando sei online, con ripiego
// sulla copia salvata se la rete manca o è lenta); font, icone e librerie esterne «cache-first» / «stale-while-revalidate».
// Il traffico Firebase (stanze) non passa di qui: le stanze richiedono la rete.
// Per forzare un ricaricamento completo della cache dopo modifiche al service worker, incrementa VERSION.
const VERSION = 'nylo-v2';
const CORE = ['/', '/tt/', '/ntt/', '/home-btn.js', '/auth-gate.js', '/tambu-gate.js', '/pwa.js',
              '/tt/shared/core.js', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/apple-touch-icon.png'];
const SWR_HOSTS = new Set(['fonts.googleapis.com', 'cdn.tailwindcss.com']);                      // contenuti che possono cambiare
const IMMUTABLE_HOSTS = new Set(['fonts.gstatic.com', 'unpkg.com', 'cdnjs.cloudflare.com', 'www.gstatic.com']);  // URL versionati
const TIMEOUT_MS = 3500;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await Promise.allSettled(CORE.map(u => cache.add(u)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// la pagina che ha appena registrato il service worker (primissima visita) ci chiede di salvarla
self.addEventListener('message', e => {
  const d = e.data;
  if (!d || d.type !== 'cache' || typeof d.url !== 'string' || d.url[0] !== '/' || d.url[1] === '/') return;
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    try { const r = await fetch(d.url); if (r.ok) await cache.put(d.url, r); } catch (err) {}
    // script/stili condivisi, font/icone/librerie esterne già caricati dalla pagina prima che il service worker prendesse il controllo
    const assets = Array.isArray(d.assets) ? d.assets.slice(0, 60) : [];
    await Promise.allSettled(assets.map(async u => {
      let h; try { h = new URL(u); } catch (err) { return; }
      const own = h.origin === location.origin && h.pathname !== '/sw.js';
      if (!own && (h.protocol !== 'https:' || !(SWR_HOSTS.has(h.hostname) || IMMUTABLE_HOSTS.has(h.hostname)))) return;
      if (!own && await cache.match(u)) return;
      const r = own ? await fetch(u) : await fetch(u, { mode: 'cors', credentials: 'omit' });
      if (r.ok) await cache.put(u, r);
    }));
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (url.pathname === '/sw.js') return;
    e.respondWith(networkFirst(req));
  } else if (SWR_HOSTS.has(url.hostname)) {
    e.respondWith(staleWhileRevalidate(req));
  } else if (IMMUTABLE_HOSTS.has(url.hostname)) {
    e.respondWith(cacheFirst(req));
  }
  // tutto il resto (Firebase, ecc.) passa direttamente alla rete
});

const OFFLINE_HTML = '<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<meta name="robots" content="noindex"><title>Offline</title><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0c10;color:#e2e8f0;font-family:system-ui,sans-serif;text-align:center;padding:24px">' +
  '<div><h1 style="font-size:20px">Sei offline</h1><p style="color:#94a3b8">Questa pagina non è ancora stata salvata sul dispositivo.<br>Aprila una volta con la connessione attiva.</p><p><a style="color:#5eead4" href="/">Home</a></p></div></body></html>';

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  const nav = req.mode === 'navigate';
  const cached = await cache.match(req, { ignoreSearch: nav });
  try {
    const net = fetch(req);
    let res;
    if (cached) {
      net.catch(() => {});
      res = await Promise.race([net, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), TIMEOUT_MS))]);
    } else res = await net;
    if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
    return res;
  } catch (err) {
    if (cached) return cached;
    if (nav) return new Response(OFFLINE_HTML, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    throw err;
  }
}

// le risorse esterne sono richieste «no-cors» dalla pagina (risposta opaca, che pesa molto sulla quota): le riscarichiamo in modalità CORS
function corsFetch(req) { return fetch(req.url, { mode: 'cors', credentials: 'omit' }); }

async function cacheFirst(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req.url);
  if (hit) return hit;
  try {
    const res = await corsFetch(req);
    if (res.ok) cache.put(req.url, res.clone());
    return res;
  } catch (err) { return fetch(req); }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req.url);
  const refresh = corsFetch(req).then(res => { if (res.ok) cache.put(req.url, res.clone()); return res; });
  if (hit) { refresh.catch(() => {}); return hit; }
  try { return await refresh; } catch (err) { return fetch(req); }
}
