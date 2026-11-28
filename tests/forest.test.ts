import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateTree,woodGeometry} from '../src/lib/forest/tree';
import {presets,mapVisual} from '../src/lib/forest/presets';
import {createSceneRecipe,terrainHeight} from '../src/lib/forest/recipe';
import {parseSceneQuery,sceneQuery} from '../src/lib/forest/query';
import {resolveVegetation,defaultEnvironment,taxa} from '../src/lib/vegetation';
import type {EcoProperties} from '../src/lib/geography';
const geo:EcoProperties={ECO_ID:353,ECO_NAME:'Puget lowland forests',BIOME_NUM:5,BIOME_NAME:'Temperate Conifer Forests',REALM:'Nearctic'};
const profile=()=>resolveVegetation({lat:47.6062,lon:-122.3321,geography:geo,botanicalArea:{code:'WAS',name:'Washington'},seed:'forest-test'});
for(const preset of Object.values(presets)){
  test(`${preset.name}: deterministic custom tree geometry and bounded complexity`,()=>{
    const a=generateTree('tree-123',preset),b=generateTree('tree-123',preset);
    assert.deepEqual(a,b);assert.notDeepEqual(a,generateTree('tree-124',preset));
    assert.ok(a.segments.length>40&&a.segments.length<=420);assert.ok(a.foliage.length>20&&a.foliage.length<=160);
    assert.ok(a.segments.some(s=>s.depth===preset.recursion));
    for(const s of a.segments){assert.ok(s.r0>s.r1&&s.r1>0);assert.ok([...s.a,...s.b].every(Number.isFinite));}
    assert.ok(a.dimensions.height>5&&a.dimensions.crownWidth>4);
    const near=woodGeometry([{model:a,position:[0,0,0],rotation:0}]),far=woodGeometry([{model:a,position:[0,0,0],rotation:0}],true);
    assert.ok(near.geometry.getAttribute('position').count>far.geometry.getAttribute('position').count);
    near.geometry.computeBoundingBox();assert.ok(near.geometry.boundingBox!.max.y<=a.dimensions.height+.1);
    assert.ok(Array.from(near.geometry.getAttribute('position').array).every(Number.isFinite));
    near.geometry.dispose();far.geometry.dispose();
  });
}
test('all five requested species map to their own design presets; other taxa are labelled fallbacks',()=>{
  for(const [name,presetId] of [['Pseudotsuga menziesii','douglas'],['Picea abies','spruce'],['Pinus sylvestris','pine'],['Quercus robur','oak'],['Vachellia tortilis','acacia']])assert.deepEqual({...mapVisual(name),reason:null},{presetId,fallback:false,reason:null});
  assert.equal(mapVisual('Cocos nucifera','palm').fallback,true);assert.equal(mapVisual(null,'savanna_canopy').presetId,'acacia');
});
test('scene recipe uses only selected ecological candidates, retaining confidence and synthetic metadata',()=>{
  const p=profile(),r=createSceneRecipe(p,{seed:'one',density:28});
  assert.equal(r.trees.length,28);assert.deepEqual(r,createSceneRecipe(p,{seed:'one',density:28}));
  for(const t of r.trees){assert.ok(p.species.some(s=>s.id===t.species.id));assert.equal(t.species.confidence,'regional');assert.equal(t.species.evidenceLevel,p.evidenceLevel);assert.ok(Math.abs(t.position[0])<50&&Math.abs(t.position[2])<50);assert.equal(t.position[1],terrainHeight(t.position[0],t.position[2],'one'));}
  assert.match(r.terrain.source,/not a digital elevation/);assert.match(r.distribution,/not ecological abundance/);
  assert.ok(p.species.every(t=>t.matureHeightM===null));
  assert.equal(new Set(r.trees.map(t=>t.seed)).size,28);
});
test('individual regeneration changes one tree shape without moving it or modifying its siblings',()=>{
  const p=profile(),a=createSceneRecipe(p,{seed:'one',density:24}),b=createSceneRecipe(p,{seed:'one',density:24,revisions:{7:1}});
  assert.notEqual(a.trees[7].seed,b.trees[7].seed);assert.deepEqual(a.trees[7].position,b.trees[7].position);
  assert.deepEqual(a.trees.filter(t=>t.index!==7),b.trees.filter(t=>t.index!==7));
  const c=createSceneRecipe(p,{seed:'one',density:40});assert.deepEqual(a.trees,c.trees.slice(0,24));
});
test('ocean, tundra, ice, desert and unsourced environmental filters do not invent a forest',()=>{
  for(const geography of [null,{...geo,ECO_ID:0,BIOME_NUM:11},{...geo,BIOME_NUM:11},{...geo,BIOME_NUM:13}]){
    const p=resolveVegetation({lat:0,lon:0,geography});assert.equal(createSceneRecipe(p,{conditional:false}).trees.length,0);
    if(!geography||geography.BIOME_NUM===11)assert.equal(createSceneRecipe(p,{conditional:true}).trees.length,0);
  }
  const p=resolveVegetation({lat:47.6,lon:-122.3,geography:geo,botanicalArea:{code:'WAS',name:'Washington'},environment:{...defaultEnvironment,moisture:'wet'}});assert.equal(createSceneRecipe(p,{conditional:true}).trees.length,0);
});
test('biome growth forms have no invented scientific identity and conditional habitat needs opt-in',()=>{
  const fallback=resolveVegetation({lat:0,lon:0,geography:geo,catalog:[]});const r=createSceneRecipe(fallback);
  assert.ok(r.trees.length>0);assert.ok(r.trees.every(t=>t.species.scientificName===null&&t.species.confidence==='biome design fallback'&&t.species.visual.fallback));
  const wetland=resolveVegetation({lat:0,lon:0,geography:geo,habitat:'wetland'});assert.equal(createSceneRecipe(wetland).trees.length,0);assert.ok(createSceneRecipe(wetland,{conditional:true}).trees.length>0);
});
test('urban candidates retain provisional planting status rather than being upgraded to native evidence',()=>{
  const p=resolveVegetation({lat:47.6062,lon:-122.3321,geography:geo,habitat:'urban'}),r=createSceneRecipe(p);
  assert.ok(r.trees.length>0);assert.ok(r.trees.every(t=>t.species.confidence==='provisional'&&t.species.evidenceLevel==='provisional_locality'));
});
test('a preset does not introduce species absent from the regional catalog',()=>{
  const p=profile();const r=createSceneRecipe(p,{density:40});
  assert.ok(r.trees.every(t=>taxa.find(s=>s.id===t.species.id)?.nativeAreaCodes.includes('WAS')));
  assert.ok(r.trees.every(t=>t.species.scientificName!=='Vachellia tortilis'));
});
test('direct scene links round-trip environmental constraints and individual revisions',()=>{
  const q=parseSceneQuery(new URLSearchParams('lat=47.6062&lon=-122.3321&habitat=wetland&seed=trees&density=24&r=7:2,1:3&moisture=wet&elevation=40&conditional=1'));
  assert.deepEqual(parseSceneQuery(new URLSearchParams(sceneQuery(q))),q);
  for(const bad of ['','lat=&lon=0','lat=NaN&lon=0','lat=91&lon=0','lat=0&lon=181','lat=0&lon=0&density=61','lat=0&lon=0&density=1.5','lat=0&lon=0&habitat=bogus','lat=0&lon=0&r=60:1','lat=0&lon=0&moisture=no','lat=0&lon=0&elevation=NaN'])assert.throws(()=>parseSceneQuery(new URLSearchParams(bad)));
});
