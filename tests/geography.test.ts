import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {lookup,tileKey,type EcoCollection} from '../src/lib/geography';
const readTile=(lat:number,lon:number)=>JSON.parse(gunzipSync(readFileSync(`public/data/resolve-2017/tiles/${tileKey(lat,lon)}.geojson.gz`)).toString()) as EcoCollection;
test('geographic tiling handles world edges',()=>{assert.equal(tileKey(-90,-180),'0-0');assert.equal(tileKey(90,180),'35-17');assert.equal(tileKey(0,0),'18-9');assert.throws(()=>tileKey(Infinity,0));});
test('accurate lookup handles holes, multipolygons and boundary points',()=>{
 const data={type:'FeatureCollection',features:[{type:'Feature',properties:{ECO_NAME:'Test'},geometry:{type:'MultiPolygon',coordinates:[[[[0,0],[4,0],[4,4],[0,4],[0,0]],[[1,1],[1,3],[3,3],[3,1],[1,1]]],[[[10,10],[11,10],[11,11],[10,11],[10,10]]]]}}]} as EcoCollection;
 assert.equal(lookup(0,0,data)?.ECO_NAME,'Test');assert.equal(lookup(2,2,data),undefined);assert.equal(lookup(10.5,10.5,data)?.ECO_NAME,'Test');assert.equal(lookup(5,5,data),undefined);
});
for(const [name,lat,lon,expected] of [['Seattle',47.6062,-122.3321,'Puget lowland forests'],['Atlanta',33.749,-84.388,'Piedmont'],['Tokyo',35.6762,139.6503,'Taiheiyo']] as const)test(`RESOLVE source geography resolves ${name}`,()=>{const r=lookup(lat,lon,readTile(lat,lon));assert.ok(r,`${name} must resolve`);assert.match(r.ECO_NAME,new RegExp(expected,'i'));assert.ok(r.BIOME_NAME);});
test('ocean has no invented terrestrial context',()=>{const manifest=JSON.parse(readFileSync('public/data/resolve-2017/manifest.json','utf8'));const lat=25,lon=-140;if(manifest.tiles[tileKey(lat,lon)])assert.equal(lookup(lat,lon,readTile(lat,lon)),undefined);});
