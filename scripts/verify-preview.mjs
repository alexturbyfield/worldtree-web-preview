import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const origin=new URL(process.argv[2]).origin;
const get=async path=>{const r=await fetch(origin+path);assert.equal(r.status,200,`${path} HTTP status`);assert.equal(new URL(r.url).origin,origin,`${path} must not redirect to sign-in`);return r;};
const html=await (await get('/')).text();assert.match(html,/<title>WorldTree/);console.log('Public page: HTTP 200, WorldTree title, no sign-in redirect');
for(const path of ['/geo-worker.js','/maplibre-worker.mjs']){const r=await get(path);assert.match(r.headers.get('content-type')??'',/javascript/);console.log(`Worker asset: ${path} HTTP 200, JavaScript MIME type`);}
const manifest=await (await get('/data/resolve-2017/manifest.json')).json();
const display=await (await get('/data/resolve-2017/display.geojson')).arrayBuffer();assert.equal(createHash('sha256').update(Buffer.from(display)).digest('hex'),manifest.display_sha256);console.log('Live display geometry: manifest hash verified');
const messages=[];const self={postMessage:data=>messages.push(data)};
vm.runInNewContext(await (await get('/geo-worker.js')).text(),{self,fetch:async path=>{const r=await get(path);if(path.endsWith('.gz')){const data=await r.arrayBuffer();const key=path.split('/').at(-1).replace('.geojson.gz','');assert.equal(createHash('sha256').update(Buffer.from(data)).digest('hex'),manifest.tiles[key].sha256);return new Response(data);}return r;},Response,DecompressionStream});
for(const [id,name,lat,lon,expected] of [[1,'Seattle',47.6062,-122.3321,'Puget lowland'],[2,'Atlanta',33.749,-84.388,'Piedmont'],[3,'Tokyo',35.6762,139.6503,'Taiheiyo']]){await self.onmessage({data:{id,lat,lon}});const r=messages.at(-1);assert.equal(r.error,undefined);assert.match(r.region?.ECO_NAME??'',new RegExp(expected,'i'));console.log(`Live lookup ${name}: ${r.region.ECO_NAME} (${r.region.BIOME_NAME}); tile hash verified`);}
await self.onmessage({data:{id:4,lat:25,lon:-140}});assert.equal(messages.at(-1).region,null);console.log('Live ocean lookup: no invented terrestrial ecoregion');
