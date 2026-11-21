import {test} from 'node:test';
import assert from 'node:assert/strict';
import {atlasLayout,atlasRect} from '../src/lib/forest/foliage-atlas';
import {generateFoliageCards,selectFoliageCards,foliageCardCacheStats} from '../src/lib/forest/foliage-cards';
import {foliageCardGeometry,cardInstanceAttributes} from '../src/lib/forest/foliage-material';
import {generatePainterlyTree} from '../src/lib/forest/painterly';
import {parseLabQuery,labQuery,createLabRecipe} from '../src/lib/forest/laboratory';
import {parseSceneQuery,sceneQuery} from '../src/lib/forest/query';
const options={presetId:'douglas',structuralSeed:'29',appearanceSeed:'moss'};
const structure=(cards:ReturnType<typeof generateFoliageCards>)=>cards.map(({color,...geometry})=>{assert.match(color,/^#[a-f0-9]{6}$/);return geometry;});
test('atlas has distinct, seeded botanical morphologies and valid tile rectangles',()=>{
  const tiles=atlasLayout();assert.deepEqual(tiles,atlasLayout());assert.notDeepEqual(tiles,atlasLayout('other-morphology'));
  assert.equal(tiles.length,8);for(const kind of ['douglas','pine','spruce','broadleaf','leaf','acacia'])assert.ok(tiles.some(t=>t.kind===kind));
  assert.ok(tiles[0].leaves.length>tiles[1].leaves.length);assert.ok(tiles[1].leaves.every(l=>l.length>.2&&l.needle));assert.ok(tiles[3].leaves.every(l=>l.lobed&&!l.needle));assert.equal(tiles[4].leaves.length,1);
  for(let i=0;i<8;i++){const [u,v,w,h]=atlasRect(i);assert.ok(u>=0&&v>=0&&u+w<=1&&v+h<=1);assert.ok(tiles[i].leaves.every(l=>[...l.root,l.length,l.width,l.angle].every(Number.isFinite)));}
});
for(const presetId of ['douglas','spruce','pine','oak','acacia'])test(`${presetId} cards are branch-attached, seeded, and appearance-independent`,()=>{
  const a=generatePainterlyTree({...options,presetId}),b=generatePainterlyTree({...options,presetId,appearanceSeed:'copper'}),cards=generateFoliageCards(a);
  assert.ok(cards.length>50&&cards.length<600);assert.deepEqual(cards,generateFoliageCards(a));assert.strictEqual(a.segments,b.segments);
  assert.deepEqual(structure(cards),structure(generateFoliageCards(b)));assert.notDeepEqual(cards.map(c=>c.color),generateFoliageCards(b).map(c=>c.color));
  for(const c of cards){const s=a.segments[c.segmentIndex];for(let i=0;i<3;i++)assert.ok(Math.abs(c.position[i]-(s.a[i]+(s.b[i]-s.a[i])*c.attachmentT))<1e-6);assert.ok(c.size.every(v=>v>0&&Number.isFinite(v)));assert.ok(Math.abs(Math.hypot(...c.rotation)-1)<1e-6);assert.ok(s.depth>=1);}
  const allowed=presetId==='douglas'?[0,5]:presetId==='spruce'?[2]:presetId==='pine'?[1]:presetId==='acacia'?[7]:[3,4,6];assert.ok(cards.every(c=>allowed.includes(c.tile)));
  assert.notDeepEqual(structure(cards),structure(generateFoliageCards(generatePainterlyTree({...options,presetId,structuralSeed:'17'}))));
});
test('detail and LOD remove cards without moving retained attachments; density zero stays bare',()=>{
  const tree=generatePainterlyTree(options),a=generateFoliageCards(tree,1),b=generateFoliageCards(tree,.1);assert.ok(a.length>b.length);for(const card of b)assert.deepEqual(card,a.find(c=>c.id===card.id));
  const near=selectFoliageCards(a,false,false),performance=selectFoliageCards(a,true,false),far=selectFoliageCards(a,true,true);assert.ok(near.length>performance.length&&performance.length>far.length);assert.ok(far.length>0);
  assert.equal(generateFoliageCards(generatePainterlyTree({...options,foliageDensity:0})).length,0);assert.throws(()=>generateFoliageCards(tree,2));assert.throws(()=>generateFoliageCards(tree,NaN));
});
test('foliage geometry consists of open bent sheets with instanced atlas and wind attributes',()=>{
  const a=foliageCardGeometry(),b=foliageCardGeometry(),cards=generateFoliageCards(generatePainterlyTree(options));assert.notStrictEqual(a,b);assert.deepEqual(a.getAttribute('position').array,b.getAttribute('position').array);
  assert.equal(a.getIndex()!.count/3,8);assert.equal(a.getAttribute('position').count,9);assert.ok(Array.from(a.getAttribute('position').array).every(Number.isFinite));
  cardInstanceAttributes(a,cards);assert.equal(a.getAttribute('atlasRect').count,cards.length);assert.equal(a.getAttribute('windPhase').count,cards.length);a.dispose();b.dispose();
});
test('all three modes preserve v1.0 skeletons; foliage controls and wind round-trip in shared links',()=>{
  const base=parseLabQuery(new URLSearchParams('species=douglas&structure=29&appearance=moss&foliageDetail=0.9&debug=cards&wind=0'));
  assert.deepEqual(parseLabQuery(new URLSearchParams(labQuery(base))),base);
  const recipes=['painterly','performance','diagram'].map(mode=>createLabRecipe({...base,renderMode:mode as typeof base.renderMode}));
  assert.deepEqual(recipes[0].trees[0].model.segments,recipes[2].trees[0].model.segments);assert.equal(recipes[2].trees[0].foliageCards!.length,0);assert.ok(recipes[0].trees[0].foliageCards!.length>0);assert.equal(recipes[0].wind,false);
  const q=parseSceneQuery(new URLSearchParams('lat=47&lon=-122&mode=performance&foliageDetail=0.5&wind=0'));assert.deepEqual(parseSceneQuery(new URLSearchParams(sceneQuery(q))),q);
  for(const bad of ['foliageDetail=NaN','foliageDetail=2','wind=maybe'])assert.throws(()=>parseLabQuery(new URLSearchParams(bad)));
  assert.ok(foliageCardCacheStats().entries<=foliageCardCacheStats().capacity);
});
