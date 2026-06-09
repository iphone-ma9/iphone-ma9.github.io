// 旧Service Workerの自己破壊用。古いキャッシュを全削除し、自身を登録解除する。
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).then(function(){
      return self.registration.unregister();
    }).then(function(){
      return self.clients.matchAll();
    }).then(function(clients){
      clients.forEach(function(c){ c.navigate(c.url); }); // 強制リロード
    })
  );
});
// フェッチは常にネットワークから（キャッシュを一切使わない）
self.addEventListener('fetch', function(e){
  e.respondWith(fetch(e.request));
});
