/* Minha Van: funciona sem internet depois do primeiro acesso.
   Ao publicar uma versão nova, mude o número em VERSAO. */
const VERSAO = 'minha-van-v1';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Usa o que está guardado e, em segundo plano, busca a versão nova quando tiver internet
  e.respondWith(caches.open(VERSAO).then(async cache => {
    const salvo = await cache.match(req, {ignoreSearch: true}) || (req.mode === 'navigate' ? await cache.match('./index.html') : null);
    const rede = fetch(req).then(r => { if (r && r.ok) cache.put(req, r.clone()); return r; }).catch(() => null);
    return salvo || (await rede) || new Response('Sem conexão', {status: 503});
  }));
});
