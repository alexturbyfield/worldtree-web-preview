import test from 'node:test';
import assert from 'node:assert/strict';
import {floodedFields,floodedStudy} from '../src/lib/forest/wave1-flooded';
import type {SceneRecipe} from '../src/lib/forest/recipe';
test('flooded presentation preserves ecological tree data and seed',()=>{
 const trees=[{id:'catalog-tree'}];const recipe={seed:'29',trees,limitations:['source'],ecoregion:{BIOME_NUM:9,ECO_ID:581}} as unknown as SceneRecipe;
 const composed=floodedStudy.compose(recipe);
 assert.equal(composed.trees,recipe.trees);assert.equal(composed.seed,recipe.seed);assert.equal(composed.ecoregion,recipe.ecoregion);assert.deepEqual(recipe.limitations,['source']);assert.equal(floodedStudy.biome,9);
});
test('marsh fields reproduce, remain continuous, and vary with seed',()=>{
 for(const seed of ['29','41','613'])for(let z=-300;z<60;z+=17)for(let x=-150;x<150;x+=13){const a=floodedFields(seed,x,z),b=floodedFields(seed,x+.1,z);assert.deepEqual(a,floodedFields(seed,x,z));assert(Number.isFinite(a.y));assert(Math.abs(a.y-b.y)<.1);}
 assert.notDeepEqual(floodedFields('29',7,-80),floodedFields('41',7,-80));
});
