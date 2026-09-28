// CodePad service worker — network first, so a fresh upload to GitHub
// shows up on the very next refresh. The cache is only a fallback for
// when the phone is offline.

var CACHE_NAME = "codepad-cache-v2";

self.addEventListener("install", function(event){
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; })
        .map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(event){
  if(event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).then(function(networkResponse){
      if(networkResponse && networkResponse.ok){
        var copy = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
      }
      return networkResponse;
    }).catch(function(){
      return caches.match(event.request);
    })
  );
});
