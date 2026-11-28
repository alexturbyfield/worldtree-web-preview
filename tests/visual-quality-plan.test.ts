import {test} from 'node:test';
import assert from 'node:assert/strict';
import {prettyScenePlan,patchDensity} from '../src/lib/forest/pretty-scene';
import type {SceneRecipe} from '../src/lib/forest/recipe';
test('presentation plans serialize, reproduce and preserve source seeds and positions',()=>{
 const recipe={seed:'29',trees:[{id:'left',seed:'12',appearanceSeed:'34',position:[-7,0,22],model:{dimensions:{height:35}}},{id:'right',seed:'56',appearanceSeed:'78',position:[14,0,7],model:{dimensions:{height:24}}}]} as unknown as SceneRecipe;
 const source=JSON.stringify(recipe);
 for(const biome of ['savanna','amazon'] as const){
  const plan=prettyScenePlan(recipe,biome),c=plan.clearing;
  assert.deepEqual(plan,prettyScenePlan(recipe,biome));
  assert.deepEqual(plan,JSON.parse(JSON.stringify(plan)));
  assert.notDeepEqual(plan.patches,prettyScenePlan({...recipe,seed:'30'},biome).patches);
  assert.ok(Math.max(...plan.patches.map(p=>patchDensity(plan,p.x,p.z)))>patchDensity(plan,c.x,c.z));
  if(biome==='amazon')assert.equal(patchDensity(plan,c.x,c.z),0);
 }
 assert.equal(JSON.stringify(recipe),source);
});
