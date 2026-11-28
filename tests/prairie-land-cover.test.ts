import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveVegetation,defaultEnvironment} from '../src/lib/vegetation';
import {regionalLandCover} from '../src/lib/regional-land-cover';
import {createSceneRecipe} from '../src/lib/forest/recipe';
import {prairieStudy} from '../src/lib/forest/wave3-prairie';
const context={lat:36.5736504415,lon:-98.3419281896,geography:{ECO_ID:389,ECO_NAME:'Central-Southern US mixed grasslands',BIOME_NAME:'Temperate grasslands',BIOME_NUM:8,REALM:'Nearctic'},botanicalArea:{code:'OKL',name:'Oklahoma'},habitat:'grassland' as const,seed:'29'};
test('regional non-tree palette is sourced, conditional trees remain separate from verified taxonomy',()=>{
 const p=resolveVegetation(context);assert.equal(p.landCover?.length,11);assert.equal(p.species.length,0);assert.ok(p.landCover?.every(x=>!x.localOccurrenceVerified&&x.sources.length));assert.equal(p.landCover?.filter(x=>x.growthForm==='shrub').length,3);
 assert.deepEqual(p.landCover,resolveVegetation(context).landCover);assert.equal(createSceneRecipe(p,{density:2}).trees.length,0);
 const recipe=createSceneRecipe(p,{conditional:true,density:2});assert.equal(recipe.trees.length,2);assert.ok(recipe.palette.every(p=>['eastern-cottonwood','black-willow'].includes(p.id)));assert.equal(prairieStudy.compose(recipe).trees.length,2);assert.ok(prairieStudy.compose(recipe).trees.every(t=>Math.abs(t.position[0])>4));assert.deepEqual(prairieStudy.compose(recipe).trees,prairieStudy.compose(recipe).trees);assert.deepEqual(prairieStudy.compose(recipe).trees.map(t=>t.seed),recipe.trees.map(t=>t.seed));
});
test('regional palette never leaks to other regions, unknown country, urban mode, or missing environmental evidence',()=>{
 assert.deepEqual(regionalLandCover(364,'OKL','grassland'),[]);assert.deepEqual(regionalLandCover(389,undefined,'grassland'),[]);assert.deepEqual(regionalLandCover(389,'OKL','urban'),[]);
 assert.equal(resolveVegetation({...context,environment:{...defaultEnvironment,moisture:'wet'}}).landCover,undefined);
});
