import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalog,catalogStats,recommend,parseCoordinates,places} from '../src/lib/catalog';
import fixtures from './python-parity.json';
test('TypeScript agrees with original Python on 148 locality, boundary and unsupported cases',()=>{
 for(const fixture of fixtures){const r=recommend(fixture.lat,fixture.lon,fixture.habitat as 'forest'|'urban');assert.equal(r.status,fixture.status);assert.equal(r.profile?.id,fixture.profile_id??undefined);assert.deepEqual(r.species,fixture.species);}
});
test('preserves 18 localities, 62 taxa and 71 provisional associations',()=>{
 assert.deepEqual(catalogStats,{profiles:18,taxa:62});
 const trees=catalog.flatMap(r=>Object.values(r.habitats).flat());
 assert.equal(trees.length,71);assert.ok(trees.every(t=>!t.range_verified&&!t.ecoregion_verified&&!t.species_evidence_url));
});
for(const p of places)for(const habitat of ['forest','urban'] as const)test(`${p.name} ${habitat} preserves bounded catalog lookup`,()=>{
 const result=recommend(p.lat,p.lon,habitat);const profile=catalog.find(r=>r.id===result.profile?.id);
 assert.deepEqual(result.species,profile?.habitats[habitat]??[]);
 if(result.species.length)assert.equal(result.confidence,'low');
});
test('key presets contain original native and planted candidates',()=>{
 assert.ok(recommend(47.6062,-122.3321).species.some(t=>t.id==='pseudotsuga_menziesii'));
 assert.ok(recommend(33.749,-84.388).species.some(t=>t.id==='pinus_taeda'));
 assert.ok(recommend(35.6762,139.6503,'urban').species.some(t=>t.id==='ginkgo_biloba'));
 assert.notDeepEqual(recommend(47.6062,-122.3321).species,recommend(47.6062,-122.3321,'urban').species);
});
test('unsupported and ocean locations never inherit a nearby pool',()=>{for(const p of [[-15,-60],[0,0],[25,-140]]){const r=recommend(p[0],p[1]);assert.equal(r.status,'no_curated_species');assert.deepEqual(r.species,[]);}});
test('rejects invalid input including nonfinite coordinates',()=>{for(const p of [[91,0],[0,181],[NaN,0],[0,Infinity]])assert.throws(()=>recommend(p[0],p[1]));assert.throws(()=>parseCoordinates('91, 0'));assert.deepEqual(parseCoordinates('35.6762, 139.6503'),{name:'Selected coordinates',lat:35.6762,lon:139.6503});assert.equal(parseCoordinates('Tokyo'),undefined);});
test('overlapping boxes select the smallest region and bounds are inclusive',()=>{
 const outer={...catalog[0],id:'outer',bounds:{south:0,north:10,west:0,east:10}};
 const inner={...catalog[0],id:'inner',bounds:{south:1,north:2,west:1,east:2}};
 assert.equal(recommend(1,1,'forest',[outer,inner]).profile?.id,'inner');
});
