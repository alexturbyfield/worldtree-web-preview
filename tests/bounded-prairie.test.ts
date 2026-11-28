import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {lookup,tileKey,type EcoCollection} from '../src/lib/geography';
import {lookupBotanicalArea,type BotanicalCollection} from '../src/lib/botanical';
import {resolveVegetation} from '../src/lib/vegetation';
import {createSceneRecipe} from '../src/lib/forest/recipe';
import {resolveBoundedEnvironment} from '../src/lib/forest/bounded-resolver';
import {resolveEnvironmentSelection} from '../src/lib/forest/environment-registry';
import {composePrairieTrees} from '../src/lib/forest/wave3-prairie';
const botanical=JSON.parse(readFileSync('public/data/v08/botanical-countries.geojson','utf8')) as BotanicalCollection;
function sample(lat:number,lon:number,conditional=false){
 const geography=lookup(lat,lon,JSON.parse(gunzipSync(readFileSync(`public/data/resolve-2017/tiles/${tileKey(lat,lon)}.geojson.gz`)).toString()) as EcoCollection)??null;
 const botanicalArea=lookupBotanicalArea(lat,lon,botanical),profile=resolveVegetation({lat,lon,geography,botanicalArea,habitat:'grassland',seed:'grove-1'});
 const recipe=createSceneRecipe(profile,{seed:'29',density:conditional?6:0,conditional,structureSeed:'grove-1',appearanceSeed:'garden',wind:false});
 return {profile,recipe,search:'autoEnvironment=bounded-auto-v1&seed=29&habitat=grassland'};
}
for(const [id,lat,lon,area]of [['prairie-oklahoma',36.7,-98.5,'OKL'],['prairie-pampas',-35.2,-61.2,'AGE'],['prairie-mongolia',47.2,107.2,'MON']] as const)test('bounded prairie uses actual geography: '+id,()=>{
 const {profile,recipe,search}=sample(lat,lon),s=resolveEnvironmentSelection(recipe,search);
 assert.equal(s.automatic?.status,'selected');assert.equal(s.automatic?.ruleId,id);assert.equal(s.route.adapter,'prairie');assert.equal(s.regional?.site.area,area);assert.equal(s.regional?.site.lat,lat);assert.equal(s.checkpoint,null);
 assert.equal(s.regional?.renderedTreeIdentity,'none');assert.deepEqual(s.regional?.eligibleTreeCandidates,[]);assert.equal(s.automatic?.confidence,'biome-context-only');assert.deepEqual(composePrairieTrees(recipe),[]);
 if(area!=='OKL')assert.equal(profile.landCover?.length??0,0);
 for(const seed of ['41','73']){const next=resolveBoundedEnvironment(recipe,'autoEnvironment=bounded-auto-v1&seed='+seed);assert.equal(next?.status,'selected');assert.notEqual(next?.recipe?.effectiveSeed,s.regional?.effectiveSeed);}
 assert.equal(resolveBoundedEnvironment(recipe,search)?.recipe?.effectiveSeed,s.regional?.effectiveSeed);
 assert.equal(resolveBoundedEnvironment(recipe,''),null);
 // Default map habitat must select an open landscape, never a forest recipe.
 assert.equal(resolveBoundedEnvironment({...recipe,habitat:'forest'},search)?.recipe?.site.family,'prairie');
 for(const context of [{...recipe,habitat:'wetland' as const},{...recipe,habitat:'urban' as const},{...recipe,botanicalArea:null},{...recipe,botanicalArea:{code:'FRA',name:'unsupported'}},{...recipe,ecoregion:{...recipe.ecoregion!,REALM:'invalid'}},{...recipe,ecoregion:{...recipe.ecoregion!,ECO_ID:9999}},{...recipe,location:{lat:lat+2,lon}},{...recipe,environment:{...recipe.environment,unvalidated:['moisture']}}])assert.equal(resolveBoundedEnvironment(context,search)?.status,'fallback');
});
test('only explicitly enabled Oklahoma ecological-site tree candidates transfer',()=>{
 const {recipe,search}=sample(36.7,-98.5,true),d=resolveBoundedEnvironment(recipe,search)!;
 assert.equal(d.recipe?.renderedTreeIdentity,'conditional-regional-trees');assert.ok(d.recipe!.eligibleTreeCandidates.length>0);
 for(const c of d.recipe!.eligibleTreeCandidates){assert.ok(recipe.landCover!.some(p=>p.scientificName===c.scientificName&&p.growthForm==='tree'&&p.renderEligible));assert.ok(c.sources.length);}
 assert.ok(composePrairieTrees(recipe).length>0);
 assert.deepEqual(resolveBoundedEnvironment({...recipe,conditionalStudy:false},search)?.recipe?.eligibleTreeCandidates,[]);
 const foreign=sample(-35.2,-61.2,true).recipe;
 assert.deepEqual(resolveBoundedEnvironment({...foreign,palette:recipe.palette,landCover:recipe.landCover},search)?.recipe?.eligibleTreeCandidates,[]);
 assert.deepEqual(composePrairieTrees({...foreign,trees:recipe.trees,landCover:recipe.landCover}),[]);
});
