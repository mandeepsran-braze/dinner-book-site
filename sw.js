const CACHE = "dinner-book-a21d72d6d7";
const ASSETS = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k.startsWith("dinner-book-")).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate") {                       // every page link, with or without ?plan=, opens the cached app
    e.respondWith(caches.match("index.html").then((r) => r || fetch(req)));
    return;
  }
  if (url.origin === location.origin) { e.respondWith(caches.match(req).then((r) => r || fetch(req))); return; }
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {   // fonts: show the cached copy, refresh it in the background
    e.respondWith(caches.open(CACHE).then((c) => c.match(req).then((hit) => {
      const net = fetch(req).then((res) => { c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
  }
});
