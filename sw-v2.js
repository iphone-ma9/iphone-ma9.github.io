// 毎日一服 名言サプリ Service Worker (v2)
// 更新時は CACHE_VERSION の値を変えれば全キャッシュが刷新されます
const CACHE_VERSION = 'v2-20260609';
const CACHE_NAME = 'meigen-sapuri-' + CACHE_VERSION;
const PRECACHE_URLS = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS).catch(function(){});
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(function(response) {
      var copy = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, copy).catch(function(){});
      });
      return response;
    }).catch(function() {
      return caches.match(event.request).then(function(cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});
