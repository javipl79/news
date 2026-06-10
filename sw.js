// Service Worker de Pulso — mínimo, para que la PWA sea instalable.
// No cachea las noticias (queremos que siempre traiga las últimas del motor),
// solo permite la instalación y un arranque rápido del cascarón.
const CACHE = "pulso-v1";
const BASE = [
  "./index.html",
  "./manifest.json",
  "./pulso-ico-192.png",
  "./pulso-ico-512.png",
  "./pulso-ico-180.png"
];

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(BASE).catch(function(){}); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(e){
  var url = e.request.url;
  // Las noticias (el JSON del motor) SIEMPRE de la red, nunca cache.
  if (url.indexOf("/news-data") >= 0) return;
  // Para el resto: red primero, cache como respaldo si no hay conexión.
  e.respondWith(
    fetch(e.request).catch(function(){ return caches.match(e.request); })
  );
});
