import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {lookup,tileKey,type EcoCollection} from '../src/lib/geography';
import {lookupBotanicalArea,type BotanicalCollection} from '../src/lib/botanical';
import {resolveVegetation} from '../src/lib/vegetation';
import {createSceneRecipe} from '../src/lib/forest/recipe';
import {resolveBoundedEnvironment,boundedResolverPolicy,automaticSceneUrl} from '../src/lib/forest/bounded-resolver';
import {resolveEnvironmentSelection} from '../src/lib/forest/environment-registry';
import {geographicPilotSites,pilotHabitat,geographicPilotUrl} from '../src/lib/forest/geographic-pilot';
const botanical=JSON.parse(readFileSync('public/data/v08/botanical-countries.geojson','utf8')) as BotanicalCollection;
const cases=JSON.parse(readFileSync('artifacts/bounded-completion/before.json','utf8')) as {id:string;lat:number;lon:number}[];
function sample(lat:number,lon:number,habitat:ReturnType<typeof pilotHabitat>){
 const geography=lookup(lat,lon,JSON.parse(gunzipSync(readFileSync(`public/data/resolve-2017/tiles/${tileKey(lat,lon)}.geojson.gz`)).toString()) as EcoCollection)??null;
 const botanicalArea=lookupBotanicalArea(lat,lon,botanical),profile=resolveVegetation({lat,lon,geography,botanicalArea,habitat,seed:'grove-1'});
 return {profile,recipe:createSceneRecipe(profile,{seed:'29',density:0,structureSeed:'grove-1',appearanceSeed:'garden',wind:false})};
}
for(const point of cases)test('remaining bounded family uses actual regional data: '+point.id,()=>{
 const site=geographicPilotSites.find(s=>s.id===point.id)!,{recipe:r,profile}=sample(point.lat,point.lon,pilotHabitat(site)),search='autoEnvironment=bounded-auto-v1&seed=29',s=resolveEnvironmentSelection(r,search);
 assert.equal(s.automatic?.status,'selected',s.automatic?.explanation);assert.equal(s.automatic?.ruleId,site.id);assert.equal(s.route.adapter,site.family);assert.equal(s.regional?.site.area,profile.botanicalArea?.code);assert.equal(s.regional?.site.lat,point.lat);assert.equal(s.checkpoint,null);assert.equal(s.pilot,null);assert.equal(s.individualInspection,false);
 assert.equal(s.route.variant,['mangrove','desert','flooded'].includes(site.family)?'rebuild':'original');
 for(const c of s.regional!.eligibleTreeCandidates){assert.ok(c.sources.length);assert.ok(profile.species.find(t=>t.scientificName===c.scientificName)?.nativeAreaCodes.includes(profile.botanicalArea!.code));}
 if(['savanna','flooded','montane','desert'].includes(site.family)){assert.equal(s.regional?.renderedTreeIdentity,'none');assert.deepEqual(s.regional?.eligibleTreeCandidates,[]);assert.equal(s.automatic?.confidence,'biome-context-only');}
 if(site.family==='dryforest'){assert.equal(s.regional?.renderedTreeIdentity,'unnamed-seasonal-growth-forms');assert.equal(s.automatic?.confidence,'biome-context-only');}
 if(site.family==='tropicalpine'&&!s.regional!.eligibleTreeCandidates.length)assert.equal(s.regional?.renderedTreeIdentity,'unnamed-conifer-growth-forms');
 assert.deepEqual(resolveEnvironmentSelection(r,search),s);assert.equal(resolveBoundedEnvironment(r,''),null);
 for(const seed of ['41','73']){const d=resolveBoundedEnvironment(r,'autoEnvironment=bounded-auto-v1&seed='+seed);assert.equal(d?.status,'selected');assert.notEqual(d?.recipe?.effectiveSeed,s.regional?.effectiveSeed);}
 assert.equal(resolveBoundedEnvironment({...r,habitat:'urban'},search)?.status,'fallback');
 for(const context of [{...r,botanicalArea:null},{...r,botanicalArea:{code:'UNSUPPORTED',name:'unsupported'}},{...r,ecoregion:{...r.ecoregion!,REALM:'unsupported'}},{...r,ecoregion:{...r.ecoregion!,BIOME_NUM:98}},{...r,location:{lat:point.lat+2,lon:point.lon}},{...r,environment:{...r.environment,unvalidated:['moisture']}}])assert.equal(resolveBoundedEnvironment(context,search)?.status,'fallback');
 if(['conifer','rainforest','mangrove'].includes(site.family)){assert.equal(resolveBoundedEnvironment({...r,palette:[]},search)?.code,'unsupported-architecture');assert.equal(resolveBoundedEnvironment({...r,requestedTreeCount:36,trees:[]},search)?.code,'missing-drawable-source');}
});
test('policy explicitly contains all 42 existing trials and only the 14 existing families',()=>{
 assert.equal(boundedResolverPolicy.rules.length,42);assert.deepEqual([...boundedResolverPolicy.rules.map(r=>r.trialId)].sort(),geographicPilotSites.map(s=>s.id).sort());assert.equal(new Set(geographicPilotSites.map(s=>s.family)).size,14);
});
test('all automatic-picker URLs enable bounded mode and clear manual art/study selectors',()=>{
 for(const site of geographicPilotSites){const q=new URLSearchParams(automaticSceneUrl(geographicPilotUrl(site.id).split('?')[1],true).split('?')[1]);assert.equal(q.get('autoEnvironment'),'bounded-auto-v1');assert.equal(q.get('lat'),String(site.lat));assert.equal(q.get('habitat'),pilotHabitat(site));for(const key of ['geographicPilot','referenceScene','artPass','expansion','wave1'])assert.equal(q.has(key),false);}
});
