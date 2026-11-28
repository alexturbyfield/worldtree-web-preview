import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {lookup,tileKey,type EcoCollection} from '../src/lib/geography';
import {lookupBotanicalArea,type BotanicalCollection} from '../src/lib/botanical';
import {resolveVegetation} from '../src/lib/vegetation';
import {createSceneRecipe} from '../src/lib/forest/recipe';
import {resolveBoundedEnvironment,automaticSceneUrl,geographicDistanceKm,geographicRecipeTile,boundedResolverPolicy,automaticModeSuffix} from '../src/lib/forest/bounded-resolver';
import {resolveEnvironmentSelection,environmentRegistry,referenceSceneUrl,exportEnvironmentScene,mergeEnvironmentSearch} from '../src/lib/forest/environment-registry';
import {geographicPilotSites,resolveGeographicPilot} from '../src/lib/forest/geographic-pilot';

const botanical=JSON.parse(readFileSync('public/data/v08/botanical-countries.geojson','utf8')) as BotanicalCollection;
function at(lat:number,lon:number,habitat:'forest'|'grassland'='forest'){
 const geography=lookup(lat,lon,JSON.parse(gunzipSync(readFileSync(`public/data/resolve-2017/tiles/${tileKey(lat,lon)}.geojson.gz`)).toString()) as EcoCollection)??null;
 const botanicalArea=lookupBotanicalArea(lat,lon,botanical),profile=resolveVegetation({lat,lon,geography,botanicalArea,habitat,seed:'grove-1'});
 const recipe=createSceneRecipe(profile,{seed:'29',density:0,structureSeed:'grove-1',appearanceSeed:'garden',wind:false});
 const query=new URLSearchParams({lat:String(lat),lon:String(lon),habitat,seed:'29',wind:'0',autoEnvironment:'bounded-auto-v1'});
 return {profile,recipe,query};
}
const samples=[['woodland-europe',50.7,10.8],['woodland-appalachia',35.8,-83.7],['woodland-japan',36.25,138.3],['boreal-finland',66.8,26.2],['boreal-canada',50.3,-80.2],['boreal-siberia',61.7,113.7],['tundra-alaska',70.3,-155.2],['tundra-chukchi',66.5,-179.5],['tundra-polar',79.84,23.05]] as const;
for(const [id,lat,lon]of samples)test(`new coordinate automatically resolves using actual source data: ${id}`,()=>{
 const sample=geographicPilotSites.find(s=>s.id===id)!,{profile,recipe,query}=at(lat,lon,sample.family==='tundra'?'grassland':'forest'),s=resolveEnvironmentSelection(recipe,query.toString());
 assert.equal(s.mode,'automatic');assert.equal(s.automatic?.ruleId,id);assert.equal(s.automatic?.status,'selected');assert.equal(s.route.adapter,sample.family);
 assert.equal(s.pilot,null);assert.equal(s.checkpoint,null);assert.equal(s.individualInspection,false);assert.equal(s.regional?.site.lat,lat);assert.equal(s.regional?.site.lon,lon);
 assert.equal(resolveGeographicPilot(recipe,'geographicPilot='+id).pilot,null,'new point is outside old manual trial envelope');
 assert.deepEqual(resolveEnvironmentSelection(recipe,query.toString()),s);
 for(const candidate of s.regional!.eligibleTreeCandidates){const source=profile.species.find(t=>t.scientificName===candidate.scientificName);assert.ok(source);assert.ok(source.nativeAreaCodes.includes(profile.botanicalArea!.code));}
 for(const seed of ['41','73']){query.set('seed',seed);const next=resolveEnvironmentSelection(recipe,query.toString());assert.equal(next.automatic?.ruleId,id);assert.notEqual(next.regional?.effectiveSeed,s.regional?.effectiveSeed);assert.equal(next.checkpoint,null);}
 const exported=exportEnvironmentScene(recipe,s,'/explore?'+query);assert.equal(exported.environmentSelection.automatic?.policyVersion,'bounded-auto-v1');assert.equal(exported.botanicalArea?.code,profile.botanicalArea?.code);
 assert.equal(resolveEnvironmentSelection(recipe,'').automatic,null,'automatic routing is opt-in');
});
test('rollout policy only names existing trial scopes and the three declared families',()=>{
 assert.equal(boundedResolverPolicy.rules.length,9);assert.equal(new Set(boundedResolverPolicy.rules.map(r=>r.trialId)).size,9);
 for(const rule of boundedResolverPolicy.rules){const trial=geographicPilotSites.find(s=>s.id===rule.trialId);assert.ok(trial);assert.ok(['temperate','boreal','tundra'].includes(trial.family));}
});
test('all protected reference URLs keep priority and exact checkpoint metadata with auto requested',()=>{
 for(const entry of environmentRegistry){const q=new URLSearchParams(referenceSceneUrl(entry.id).split('?')[1]);q.set('autoEnvironment','bounded-auto-v1');const r={location:{lat:Number(q.get('lat')),lon:Number(q.get('lon'))},ecoregion:{BIOME_NUM:entry.scope.biomeId,ECO_ID:entry.scope.ecoregions?.[0]??100,REALM:entry.scope.realm??'Neotropic'}};const s=resolveEnvironmentSelection(r,q.toString());assert.equal(s.selectedScene?.id,entry.id);assert.equal(s.checkpoint?.exactSettings,true);assert.equal(s.regional,null);assert.equal(s.automatic?.status,'protected-reference');}
});
test('missing evidence, invalid inputs, unsupported habitats and unmeasured filters do not create regional scenery',()=>{
 const {recipe:r,query:q}=at(50.7,10.8),search=q.toString();
 const cases=[{...r,location:null},{...r,location:{lat:NaN,lon:10.8}},{...r,ecoregion:null},{...r,ecoregion:{...r.ecoregion!,ECO_ID:0}},{...r,botanicalArea:null},{...r,botanicalArea:{code:'TEN',name:'wrong cell'}},{...r,ecoregion:{...r.ecoregion!,REALM:'Nearctic'}},{...r,habitat:'wetland' as const},{...r,environment:{...r.environment,unvalidated:['elevation']}},{...r,palette:[]},{...r,requestedTreeCount:36,trees:[]},{...r,location:{lat:52.7,lon:10.8}}];
 for(const context of cases){const d=resolveBoundedEnvironment(context,search)!;assert.equal(d.status,'fallback');assert.equal(d.recipe,null);assert.ok(d.explanation);}
 for(const flag of ['autoEnvironment=unknown','autoEnvironment=bounded-auto-v1&autoEnvironment=bounded-auto-v1'])assert.equal(resolveBoundedEnvironment(r,flag)?.code,'invalid-version');
 const ocean=resolveBoundedEnvironment({location:{lat:0,lon:-140},ecoregion:null},search);assert.equal(ocean?.code,'missing-geography');
 assert.equal(resolveBoundedEnvironment({...r,ecoregion:{...r.ecoregion!,BIOME_NUM:14}},search)?.code,'outside-rollout');
 assert.equal(resolveEnvironmentSelection({...r,renderMode:'diagram'},search).automatic?.status,'diagram');
});
test('explicit manual selections are not overridden; mode URLs preserve seeds and clear study-only flags intentionally',()=>{
 const {recipe,query}=at(50.7,10.8);query.set('geographicPilot','woodland-europe');assert.equal(resolveBoundedEnvironment(recipe,query.toString())?.status,'explicit-selection');
 const next=new URLSearchParams(automaticSceneUrl('lat=50.7&lon=10.8&seed=73&structure=fixed&appearance=paint&habitat=forest&wind=0&expansion=temperate&artPass=fidelity&referenceScene=temperate-woodland',true).split('?')[1]);
 for(const key of ['expansion','artPass','referenceScene'])assert.equal(next.has(key),false);
 assert.equal(next.get('seed'),'73');assert.equal(next.get('structure'),'fixed');assert.equal(next.get('appearance'),'paint');assert.equal(next.get('wind'),'0');
 const edited=mergeEnvironmentSearch(next.toString(),'lat=50.7&lon=10.8&seed=41');assert.equal(new URLSearchParams(edited).get('autoEnvironment'),'bounded-auto-v1');
 assert.equal(new URLSearchParams(automaticSceneUrl(edited,false).split('?')[1]).has('autoEnvironment'),false);
});
test('geographic distance and tile identity handle the antimeridian deterministically',()=>{
 const distance=geographicDistanceKm({lat:66.5,lon:179.5},{lat:66.5,lon:-179.5});assert.ok(distance>40&&distance<50);
 assert.equal(geographicRecipeTile({lat:66.5,lon:180}),geographicRecipeTile({lat:66.5,lon:-180}));
 assert.equal(geographicDistanceKm({lat:50,lon:10},{lat:50,lon:10}),0);
});

test('map navigation forwards only a valid, single automatic opt-in',()=>{assert.equal(automaticModeSuffix('autoEnvironment=bounded-auto-v1'),'&autoEnvironment=bounded-auto-v1');assert.equal(automaticModeSuffix(''), '');assert.equal(automaticModeSuffix('autoEnvironment=unknown'),'');assert.equal(automaticModeSuffix('autoEnvironment=bounded-auto-v1&autoEnvironment=unknown'),'');});
