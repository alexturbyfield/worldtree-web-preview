// Cache the visited app shell and local ecological assets. Street tiles remain network-only.
const CACHE='worldtree-v07-2';
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(['/','/icon.svg','/geo-worker.js','/maplibre-worker.mjs','/data/world_land.geojson','/data/resolve-2017/display.geojson','/data/resolve-2017/manifest.json']);await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data?.type==='CACHE_ASSETS')event.waitUntil((async()=>{const cache=await caches.open(CACHE);for(const value of event.data.urls??[]){const url=new URL(value,self.location.origin);if(url.origin===self.location.origin&&(url.pathname.startsWith('/_next/static/')||url.pathname.startsWith('/data/')))try{await cache.add(url.href);}catch{ /* An unavailable optional asset does not block the app. */ }}})());});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request).then(async r=>{if(r.ok)(await caches.open(CACHE)).put('/',r.clone());return r;}).catch(async()=> (await caches.match('/'))||Response.error()));return;
 }
 if(url.pathname.startsWith('/data/')||url.pathname.startsWith('/_next/static/')||url.pathname==='/icon.svg'||url.pathname==='/geo-worker.js'||url.pathname==='/maplibre-worker.mjs')event.respondWith((async()=>{
  const hit=await caches.match(event.request);if(hit)return hit;
  const r=await fetch(event.request);if(r.ok)(await caches.open(CACHE)).put(event.request,r.clone());return r;
 })());
});
