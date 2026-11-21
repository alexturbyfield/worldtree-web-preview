import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {resolveVegetation,exportProfile} from '../src/lib/vegetation';
import type {BotanicalArea,Taxon} from '../src/lib/global-types';
import type {EcoProperties} from '../src/lib/geography';
async function main(){
const origin=new URL(process.argv[2]).origin;
async function get(path:string){const r=await fetch(origin+path);assert.equal(r.status,200,path);assert.equal(new URL(r.url).origin,origin,'No authentication redirect');return r;}
const html=await (await get('/')).text();assert.match(html,/1\.0/);assert.match(html,/width=device-width/);console.log('Public v1.0 HTML and mobile viewport metadata: passed');
const manifest=await (await get('/data/v08/manifest.json')).json();assert.equal(manifest.version,'0.8.0');
assert.deepEqual(manifest,JSON.parse(readFileSync('public/data/v08/manifest.json','utf8')),'Remote release data matches the checked-in manifest');
for(const [file,hash] of Object.entries(manifest.files)){const bytes=Buffer.from(await (await get('/data/v08/'+file)).arrayBuffer());assert.equal(createHash('sha256').update(bytes).digest('hex'),hash,file);}
const remoteTaxa=await (await get('/data/v08/taxa.json')).json() as Taxon[];assert.equal(remoteTaxa.length,400);console.log('All v0.8 public data assets match manifest hashes; 400 taxa present');
const code=await (await get('/geo-worker.js')).text();assert.equal(createHash('sha256').update(code).digest('hex'),createHash('sha256').update(readFileSync('public/geo-worker.js')).digest('hex'),'Deployed geographic worker matches tested production bundle');
type Reply={id:number;region?:EcoProperties;botanicalArea?:BotanicalArea;error?:string};
const messages:Reply[]=[];
const self:{postMessage:(data:Reply)=>void;onmessage?:(event:{data:{id:number;lat:number;lon:number}})=>Promise<void>}={postMessage:data=>messages.push(data)};
vm.runInNewContext(code,{self,fetch:(path:string)=>get(path),Response,DecompressionStream});
const points=[['Seattle',47.6062,-122.3321],['Atlanta',33.749,-84.388],['Tokyo',35.6762,139.6503],['Manaus',-3.12,-60.02],['Kinshasa',-4.3,15.3],['Antananarivo',-18.9,47.5],['Cairo',30.04,31.24],['Berlin',52.52,13.4],['Yakutsk',62.04,129.73],['Mumbai',19.08,72.88],['Borneo',2,114],['Perth',-31.95,115.86],['Auckland',-36.85,174.76],['Reykjavík',64.15,-21.94],['Hawaiʻi',19.65,-155.15],['Cuba',21.5,-78],['Arctic tundra',73,-100],['Sahara',25,10]] as const;
let id=0;
for(const [name,lat,lon] of points){await self.onmessage!({data:{id:++id,lat,lon}});const message=messages.at(-1)!;assert.equal(message.id,id);assert.equal(message.error,undefined);assert.ok(message.region,name+' resolves against live tiles');const input={lat,lon,geography:message.region,botanicalArea:message.botanicalArea??null,catalog:remoteTaxa};const profile=resolveVegetation(input);assert.notEqual(profile.status,'insufficient_data');for(const t of profile.species)assert.ok(t.nativeAreaCodes.includes(profile.botanicalArea!.code));assert.equal(exportProfile(profile),exportProfile(resolveVegetation(input)));console.log(`${name}: ${message.region.ECO_NAME} · ${profile.evidenceLevel} · ${profile.regionalSpeciesCount} eligible regional taxa`);}
await self.onmessage!({data:{id:++id,lat:25,lon:-140}});assert.equal(messages.at(-1)!.region,null);console.log('Ocean: no invented terrestrial result');
assert.equal(manifest.coverage.verifiedSpeciesEcoregions,0);assert.equal(manifest.coverage.regionalAtAuditPoint+manifest.coverage.biomeFallbackAtAuditPoint+manifest.coverage.insufficientAtAuditPoint,846);
console.log('Live coverage:',JSON.stringify({taxa:400,verified:0,regionalAtAuditPoint:manifest.coverage.regionalAtAuditPoint,fallbackAtAuditPoint:manifest.coverage.biomeFallbackAtAuditPoint}));
console.log('Global live data/worker smoke tests passed. This is not a rendered browser/touch-layout test.');

}
main().catch(error=>{console.error(error);process.exitCode=1;});
