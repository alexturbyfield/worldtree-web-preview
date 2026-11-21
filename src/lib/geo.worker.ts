/// <reference lib="webworker" />
import { lookup, tileKey, type EcoCollection } from './geography';
let manifest: { tiles: Record<string,unknown> } | undefined;
const cache = new Map<string,EcoCollection>();
self.onmessage = async ({data: {lat,lon,id}}: MessageEvent<{lat:number;lon:number;id:number}>) => {
  try {
    const key=tileKey(lat,lon);
    if (!manifest) { const r=await fetch('/data/resolve-2017/manifest.json'); if(!r.ok) throw new Error('Dataset metadata unavailable'); manifest=await r.json(); }
    if (!manifest!.tiles[key]) { self.postMessage({id,region:null}); return; }
    if (!cache.has(key)) {
      const response=await fetch(`/data/resolve-2017/tiles/${key}.geojson.gz`);
      if(!response.ok || !response.body) throw new Error('Could not load geographic tile');
      const stream=response.body.pipeThrough(new DecompressionStream('gzip'));
      const geo=await new Response(stream).json() as EcoCollection;
      if(cache.size>=4) cache.delete(cache.keys().next().value!);
      cache.set(key,geo);
    }
    self.postMessage({id,region:lookup(lat,lon,cache.get(key)!) ?? null});
  } catch { self.postMessage({id,error:'Ecoregion lookup unavailable. Reconnect and select the location again to download its geographic tile.'}); }
};
