import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generatePainterlyTree,clearTreeCache,treeCacheStats,defaultArt} from '../src/lib/forest/painterly';
import {brushTexture,sprayTexture,crownGeometry,paintedWoodGeometry,createPaintMaterials} from '../src/lib/forest/paint-assets';
import {presets} from '../src/lib/forest/presets';
import {createLabRecipe,parseLabQuery,labQuery} from '../src/lib/forest/laboratory';
import {createSceneRecipe} from '../src/lib/forest/recipe';
import {resolveVegetation} from '../src/lib/vegetation';
import {parseSceneQuery,sceneQuery} from '../src/lib/forest/query';
const options={presetId:'oak',structuralSeed:'17',appearanceSeed:'moss',...defaultArt};
for(const presetId of Object.keys(presets)){
  test(`${presetId}: repeatable branching, independent pigments, finite bounded geometry`,()=>{
    const a=generatePainterlyTree({...options,presetId}),b=generatePainterlyTree({...options,presetId}),repaint=generatePainterlyTree({...options,presetId,appearanceSeed:'copper'}),regrown=generatePainterlyTree({...options,presetId,structuralSeed:'29'});
    assert.deepEqual(a,b);assert.strictEqual(a.segments,repaint.segments);assert.notDeepEqual(a.foliage.map(f=>f.color),repaint.foliage.map(f=>f.color));
    assert.deepEqual(a.foliage.map(f=>f.position),repaint.foliage.map(f=>f.position));assert.notDeepEqual(a.segments,regrown.segments);
    assert.ok(a.segments.length<500&&a.foliage.length<200);assert.ok(a.segments.some(s=>s.depth>1));
    for(const s of a.segments){assert.ok(s.r0>s.r1&&s.r1>0);assert.ok([...s.a,...s.b].every(Number.isFinite));}
    const near=paintedWoodGeometry([{model:a,position:[0,0,0],rotation:.4}],false,false),far=paintedWoodGeometry([{model:a,position:[0,0,0],rotation:.4}],true,true);
    for(const name of ['position','normal','uv','color'])assert.ok(Array.from(near.geometry.getAttribute(name).array).every(Number.isFinite));
    assert.ok(near.geometry.getAttribute('position').count>far.geometry.getAttribute('position').count);near.geometry.dispose();far.geometry.dispose();
  });
}
test('foliage density and stylization leave the skeleton intact; zero density removes foliage',()=>{
  const a=generatePainterlyTree(options),bare=generatePainterlyTree({...options,foliageDensity:0}),full=generatePainterlyTree({...options,foliageDensity:1}),style=generatePainterlyTree({...options,stylization:0});
  assert.equal(bare.foliage.length,0);assert.strictEqual(a.segments,bare.segments);assert.strictEqual(a.segments,full.segments);assert.strictEqual(a.segments,style.segments);assert.ok(full.foliage.length>=a.foliage.length);
  assert.notDeepEqual(a.segments,generatePainterlyTree({...options,asymmetry:1}).segments);
});
test('tree generation does not consult unseeded randomness',()=>{
  const original=Math.random;try{Math.random=()=>{throw new Error('Unseeded random used');};generatePainterlyTree({...options,structuralSeed:'no-random'});}finally{Math.random=original;}
});
test('brush textures and alpha sprays are deterministic, small, and actually contain cutouts',()=>{
  for(const kind of ['bark','foliage'] as const){const a=brushTexture(kind),b=brushTexture(kind);assert.deepEqual(a.image.data,b.image.data);assert.equal(a.image.width,64);a.dispose();b.dispose();}
  for(const needle of [false,true]){const a=sprayTexture(needle),b=sprayTexture(needle);assert.deepEqual(a.image.data,b.image.data);assert.ok(Array.from(a.image.data!).some((v,i)=>i%4===3&&v===0));assert.ok(Array.from(a.image.data!).some((v,i)=>i%4===3&&v===255));a.dispose();b.dispose();}
  const material=createPaintMaterials();assert.ok(material.cards.every(m=>m.alphaTest>0&&!m.transparent));[material.wood,material.foliage,...material.cards].forEach(m=>m.dispose());material.textures.forEach(t=>t.dispose());
});
test('shared irregular crowns have gradient pigments and a reduced distant LOD',()=>{
  for(const needle of [false,true])for(const variant of [0,1]){
    const near=crownGeometry(needle,variant,false,false),far=crownGeometry(needle,variant,true,true);
    assert.ok(near.getAttribute('position').count>far.getAttribute('position').count);assert.ok(Array.from(near.getAttribute('color').array).every(Number.isFinite));
    assert.ok(new Set(Array.from(near.getAttribute('color').array).map(n=>n.toFixed(3))).size>20);near.dispose();far.dispose();
  }
});
test('structural and appearance caches are bounded and repeat variants are reused',()=>{
  clearTreeCache();const a=generatePainterlyTree(options);assert.strictEqual(generatePainterlyTree(options),a);assert.equal(treeCacheStats().hits,1);
  for(let i=0;i<136;i++)generatePainterlyTree({...options,structuralSeed:'cache-'+i});
  assert.ok(treeCacheStats().structures<=128&&treeCacheStats().variants<=128);clearTreeCache();
});
test('scene placement, structure and appearance seeds are independent and presets are not mutated',()=>{
  const before=JSON.stringify(presets),profile=resolveVegetation({lat:47.6062,lon:-122.3321,geography:{ECO_ID:353,ECO_NAME:'Puget lowland forests',BIOME_NUM:5,BIOME_NAME:'Temperate Conifer Forests',REALM:'Nearctic'},botanicalArea:{code:'WAS',name:'Washington'}});
  const a=createSceneRecipe(profile,{seed:'placement-1',density:36}),b=createSceneRecipe(profile,{seed:'placement-2',density:36}),c=createSceneRecipe(profile,{seed:'placement-1',density:36,appearanceSeed:'different'});
  assert.equal(a.trees.length,36);assert.deepEqual(a.trees.map(t=>t.model),b.trees.map(t=>t.model));assert.notDeepEqual(a.trees.map(t=>t.position),b.trees.map(t=>t.position));
  assert.deepEqual(a.trees.map(t=>t.model.segments),c.trees.map(t=>t.model.segments));assert.deepEqual(a.trees.map(t=>t.position),c.trees.map(t=>t.position));assert.notDeepEqual(a.trees.map(t=>t.model.foliage),c.trees.map(t=>t.model.foliage));assert.equal(JSON.stringify(presets),before);
  const diagram=createSceneRecipe(profile,{renderMode:'diagram',density:60});assert.equal(diagram.trees.length,60);assert.equal(diagram.renderMode,'diagram');
});
test('laboratory recipes have no fabricated geographic claims; controls and renderer links round-trip',()=>{
  const q=parseLabQuery(new URLSearchParams('species=spruce&structure=123&appearance=456&stylization=0.2&foliageDensity=0.9&asymmetry=0.4&debug=skeleton'));
  assert.deepEqual(parseLabQuery(new URLSearchParams(labQuery(q))),q);const r=createLabRecipe(q);assert.equal(r.location,null);assert.equal(r.ecoregion,null);assert.equal(r.purpose,'visual_laboratory');assert.equal(r.trees[0].species.confidence,'visual design only');
  for(const bad of ['species=constructor','species=unknown','mode=bad','debug=bad','asymmetry=NaN','foliageDensity=-1','stylization=2'])assert.throws(()=>parseLabQuery(new URLSearchParams(bad)));
  const scene=parseSceneQuery(new URLSearchParams('lat=0&lon=0&density=60&structure=a&appearance=b&mode=diagram&foliageDensity=0.4'));
  assert.deepEqual(parseSceneQuery(new URLSearchParams(sceneQuery(scene))),scene);for(const bad of ['density=61','mode=bad','stylization=2','asymmetry=NaN'])assert.throws(()=>parseSceneQuery(new URLSearchParams('lat=0&lon=0&'+bad)));
});
