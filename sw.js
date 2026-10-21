/* 오프라인 캐시: 앱 파일은 항상 네트워크 최신본 우선(HTTP 캐시 무시), 실패 시 캐시 */
const C='syn-v5',FILES=['./','./index.html','./manifest.webmanifest','./icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.hostname==='api.github.com')return;
  const same=u.origin===location.origin;
  const net=same?fetch(u.href,{cache:'no-store'}):fetch(e.request);
  e.respondWith(net.then(r=>{if(r.ok&&(same||u.hostname==='cdn.jsdelivr.net')){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
