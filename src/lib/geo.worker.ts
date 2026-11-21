/// <reference lib="webworker" />
import { lookup, tileKey, type EcoCollection } from './geography';
import {lookupBotanicalArea,type BotanicalCollection} from './botanical';
let manifest: { tiles: Record<string,unknown> } | undefined;
let botanical: BotanicalCollection | undefined;
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
    const region=lookup(lat,lon,cache.get(key)!)??null;
    let botanicalArea=null,rangeWarning='';
    if(region)try{
      if(!botanical){const r=await fetch('/data/v08/botanical-countries.geojson');if(!r.ok)throw new Error('Botanical boundaries unavailable');botanical=await r.json();}
      botanicalArea=lookupBotanicalArea(lat,lon,botanical!);
      if(!botanicalArea)rangeWarning='No botanical-country polygon matches this point. Regional species are withheld; the ecological fallback remains available.';
    }catch{rangeWarning='Botanical-country data is unavailable. Regional species are withheld; the ecological fallback remains available.';}
    self.postMessage({id,region,botanicalArea,rangeWarning});
  } catch { self.postMessage({id,error:'Ecoregion lookup unavailable. Reconnect and select the location again to download its geographic tile.'}); }
};
