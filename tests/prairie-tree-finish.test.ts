import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveVegetation} from '../src/lib/vegetation';
import {createSceneRecipe} from '../src/lib/forest/recipe';
import {finishPrairieTree,prairieWoodUV} from '../src/lib/forest/prairie-tree-finish';
import {paintedWoodGeometry} from '../src/lib/forest/paint-assets';
const profile=resolveVegetation({lat:36.5736504415,lon:-98.3419281896,geography:{ECO_ID:389,ECO_NAME:'Central-Southern US mixed grasslands',BIOME_NAME:'Temperate grasslands',BIOME_NUM:8,REALM:'Nearctic'},botanicalArea:{code:'OKL',name:'Oklahoma'},habitat:'grassland',seed:'grove-1'});
test('prairie finish preserves source assets, specimen seeds, positions and dimension-driven placement',()=>{
 const tree=createSceneRecipe(profile,{conditional:true,density:1}).trees[0],before=JSON.stringify(tree),result=finishPrairieTree(tree);
 assert.equal(JSON.stringify(tree),before);assert.equal(result.seed,tree.seed);assert.equal(result.appearanceSeed,tree.appearanceSeed);assert.deepEqual(result.position,tree.position);assert.deepEqual(result.model.dimensions,tree.model.dimensions);
 assert.equal(finishPrairieTree({...tree,species:{...tree.species,scientificName:'Quercus robur'}}).studio,tree.studio);
 const segments=result.model.segments;
 for(let i=1;i<segments.length;i++){const a=segments[i-1],b=segments[i];if(a.pathId!==b.pathId)continue;assert.deepEqual(a.b,b.a);assert.ok(Math.abs(a.r1-b.r0)<1e-7);assert.deepEqual(a.tangentB,b.tangentA);}
 const primaries=new Map<number,typeof segments>();
 for(const segment of segments)if(segment.depth===1){const path=primaries.get(segment.pathId!)??[];path.push(segment);primaries.set(segment.pathId!,path);}
 const deflections:number[]=[];
 for(const path of primaries.values()){
  assert.ok(path[Math.floor(path.length/2)].r0<path[0].r0*.36,'limbs must taper quickly through their middle');
  assert.ok(path.at(-1)!.r1<path[0].r0*.04,'terminal wood must remain slender');
  const start=path[0].a,end=path.at(-1)!.b,axis=end.map((v,i)=>v-start[i]),length2=axis.reduce((sum,v)=>sum+v*v,0);
  let largest=0;
  for(const seg of path){const offset=seg.b.map((v,i)=>v-start[i]),t=offset.reduce((sum,v,i)=>sum+v*axis[i],0)/length2,residual=offset.map((v,i)=>v-t*axis[i]);largest=Math.max(largest,Math.hypot(...residual)/Math.sqrt(length2));}
  assert.ok(largest<.15,'bend amplitude must stay restrained');deflections.push(largest);

 }
 assert.ok(Math.max(...deflections)>.035,'some limbs must visibly bend');assert.ok(Math.max(...deflections)-Math.min(...deflections)>.02,'limbs must differ in bending');
 for(const far of [false,true]){
  const inputs=[{model:{...result.model,segments:result.model.segments.filter(s=>s.depth<=2)},position:result.position,rotation:result.rotation}];
  const {geometry}=paintedWoodGeometry(inputs,far,true);prairieWoodUV(geometry,inputs,far,true);assert.ok(Array.from(geometry.getAttribute('uv').array).every(Number.isFinite));geometry.dispose();
 }
});
