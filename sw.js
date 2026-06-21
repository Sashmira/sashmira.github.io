const CACHE = 'sm-v2';
const CORE = [
  '/',
  '/blog.html',
  '/speak-malayalam-app.html',
  '/offline.html',
  '/malayalam-lessons.html',
  '/malayalam-practice.html',
  '/malayalam-phrasebook.html',
  '/learn-malayalam-30-days.html',
  '/malayalam-level-test.html',
  '/podcast.html',
  '/ai-malayalam-tutor.html',
  '/malayalam-tutor.html',
  '/malayalam-books.html',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;

  if (url.pathname.startsWith('/audio/') || /\.(png|jpg|jpeg|webp|ico|pdf)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(event.request).then(hit =>
          hit || fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          })
        )
      )
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(hit => hit || caches.match('/offline.html') || caches.match('/')))
  );
});
