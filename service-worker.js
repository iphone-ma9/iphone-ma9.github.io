// 毎日一服 名言サプリ Service Worker
// 更新時はこの CACHE_VERSION を変えれば全キャッシュが刷新されます
const CACHE_VERSION = 'v2-20260609';
const CACHE_NAME = 'meigen-sapuri-' + CACHE_VERSION;

// オフライン時の最低限の表示用にキャッシュしておくファイル
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// インストール：基本ファイルを事前キャッシュし、即座に新SWを有効化
self.addEventListener('install', function(event) {
  self.skipWaiting(); // 新しいSWをすぐ待機解除
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS).catch(function(){ /* 失敗しても継続 */ });
    })
  );
});

// 有効化：古いバージョンのキャッシュを削除し、すぐ制御を奪う
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // 旧キャッシュ削除
          }
        })
      );
    }).then(function() {
      return self.clients.claim(); // 開いている画面をすぐ新SWの管理下に
    })
  );
});

// フェッチ：ネットワーク優先（最新を取得→成功したらキャッシュ更新／失敗時のみキャッシュ）
self.addEventListener('fetch', function(event) {
  // GET以外（POST等）はそのまま通す
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // 取得成功：コピーをキャッシュに保存して最新化
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, copy).catch(function(){});
        });
        return response;
      })
      .catch(function() {
        // オフライン等で取得失敗：キャッシュから返す
        return caches.match(event.request).then(function(cached) {
          return cached || caches.match('./index.html');
        });
      })
  );
});
