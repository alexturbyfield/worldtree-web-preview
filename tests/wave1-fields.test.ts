import {test} from 'node:test';import assert from 'node:assert/strict';
import {landscapeField,fieldPlan,type FieldBiome} from '../src/lib/forest/wave1-fields';
import {resolveVegetation} from '../src/lib/vegetation';import {createSceneRecipe} from '../src/lib/forest/recipe';
import {wave1Study} from '../src/lib/forest/wave1';
for(const biome of ['desert','mangrove','flooded']as FieldBiome[])test(`${biome}: camera selects walkable existing field without terrain uplift`,()=>{
 for(const seed of ['29','41','73']){const before=landscapeField(biome,seed,12,18),p=fieldPlan(biome,seed);assert.deepEqual(before,landscapeField(biome,seed,12,18));assert.deepEqual(p,fieldPlan(biome,seed));assert(p.stagingClearance>(biome==='desert'?0:.07));
 for(let z=-80;z<80;z+=11)for(let x=-80;x<80;x+=13){const a=landscapeField(biome,seed,x,z),b=landscapeField(biome,seed,x+.1,z);assert(Number.isFinite(a.height));assert(Math.abs(a.height-b.height)<.1);assert(a.depth===Math.max(0,-a.height));}}
 assert.notDeepEqual(fieldPlan(biome,'29').eye,fieldPlan(biome,'41').eye);
});
test('flooded growth-form mosaic is conditional and never invents named local flora',()=>{
 const profile=resolveVegetation({lat:26.21,lon:-80.94,habitat:'wetland',geography:{ECO_ID:581,ECO_NAME:'Everglades flooded grasslands',BIOME_NUM:9,BIOME_NAME:'Flooded grasslands',REALM:'Neotropic'},botanicalArea:{code:'FLA',name:'Florida'}});
 assert.equal(profile.species.length,0);assert(profile.growthForms.some(f=>f.archetype==='riparian_canopy'&&f.conditional));
 assert.equal(createSceneRecipe(profile,{density:1,conditional:false}).trees.length,0);
 const enabled=createSceneRecipe(profile,{density:1,conditional:true});assert.equal(enabled.trees.length,1);assert.equal(enabled.trees[0].species.scientificName,null);assert.equal(enabled.trees[0].species.evidenceLevel,'biome_realm_fallback');
 const study=wave1Study(enabled,'?wave1=flooded&fieldStudy=rebuild');assert(study);assert.equal(wave1Study({...enabled,ecoregion:{...enabled.ecoregion!,BIOME_NUM:5}},'?wave1=flooded&fieldStudy=rebuild'),undefined);
});
