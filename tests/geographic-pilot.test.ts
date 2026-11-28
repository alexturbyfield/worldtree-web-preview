import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {lookup,tileKey,type EcoCollection} from '../src/lib/geography';
import {lookupBotanicalArea,type BotanicalCollection} from '../src/lib/botanical';
import {resolveVegetation} from '../src/lib/vegetation';
import {createSceneRecipe} from '../src/lib/forest/recipe';
import {geographicPilotSites,geographicPilotUrl,resolveGeographicPilot,pilotHabitat} from '../src/lib/forest/geographic-pilot';
import {resolveEnvironmentSelection,referenceSceneUrl,environmentRegistry,mergeEnvironmentSearch,exportEnvironmentScene} from '../src/lib/forest/environment-registry';
import {Scene,Texture} from 'three';
import {mountLandscapeMatte,type LandscapeMatteAsset} from '../src/lib/forest/landscape-matte';

const botanical=JSON.parse(readFileSync('public/data/v08/botanical-countries.geojson','utf8')) as BotanicalCollection;
function context(site:typeof geographicPilotSites[number]){
 const geography=lookup(site.lat,site.lon,JSON.parse(gunzipSync(readFileSync(`public/data/resolve-2017/tiles/${tileKey(site.lat,site.lon)}.geojson.gz`)).toString()) as EcoCollection)??null;
 const botanicalArea=lookupBotanicalArea(site.lat,site.lon,botanical);
 const profile=resolveVegetation({lat:site.lat,lon:site.lon,geography,botanicalArea,habitat:pilotHabitat(site),seed:'grove-1'});
 return {geography,botanicalArea,profile,recipe:createSceneRecipe(profile,{seed:'29',density:0})};
}
for(const site of geographicPilotSites)test(`catalogue-backed pilot location: ${site.id}`,()=>{
 const {geography,botanicalArea,profile,recipe}=context(site),url=geographicPilotUrl(site.id),q=new URLSearchParams(url.split('?')[1]);
 assert.equal(geography?.ECO_ID,site.eco);assert.equal(geography?.BIOME_NUM,site.biome);assert.equal(botanicalArea?.code,site.area);
 for(const candidate of profile.species){assert.ok(candidate.nativeAreaCodes.includes(site.area));assert.equal(candidate.confidence,'regional');}
 const selection=resolveEnvironmentSelection(recipe,q.toString());assert.equal(selection.mode,'pilot');assert.equal(selection.route.adapter,site.family);assert.equal(selection.checkpoint,null);assert.equal(selection.pilot?.status,'experimental-unreviewed');assert.equal(selection.individualInspection,false);
 assert.deepEqual(resolveEnvironmentSelection(recipe,q.toString()),selection);if(site.family==='tropicalpine'&&!selection.pilot!.eligibleTreeCandidates.length)assert.equal(selection.pilot!.renderedTreeIdentity,'unnamed-conifer-growth-forms');if(site.family==='mangrove'){assert.equal(selection.route.variant,'rebuild');assert.equal(q.get('artPass'),'fidelity');}if(['tundra','montane','savanna','desert','flooded'].includes(site.family)){assert.equal(selection.pilot!.renderedTreeIdentity,'none');assert.equal(recipe.trees.length,0);}
 if(['temperate','boreal','conifer','rainforest','mediterranean','mangrove'].includes(site.family)){assert.ok(selection.pilot!.eligibleTreeCandidates.length);assert.equal(resolveGeographicPilot({...recipe,palette:[]},q.toString()).pilot,null);}
 if(site.family==='prairie'&&site.eco!==389){assert.equal(recipe.trees.length,0);assert.equal(profile.landCover?.length??0,0);assert.equal(selection.pilot!.eligibleTreeCandidates.length,0);}
 for(const seed of ['41','73']){q.set('seed',seed);const next=resolveEnvironmentSelection(recipe,q.toString());assert.equal(next.route.adapter,site.family);assert.notEqual(next.pilot?.effectiveSeed,selection.pilot?.effectiveSeed);assert.equal(next.checkpoint,null);}
 assert.equal(resolveEnvironmentSelection(recipe,'').pilot,null,'no automatic global promotion');
 assert.equal(exportEnvironmentScene(recipe,selection,url).environmentSelection.pilot?.site.id,site.id);
 const edited=mergeEnvironmentSearch(q.toString(),'lat='+site.lat+'&lon='+site.lon+'&seed=41&habitat='+recipe.habitat);assert.equal(new URLSearchParams(edited).get('geographicPilot'),site.id);
});
test('pilot rejects unsupported location, missing data, filters and conflicting selectors',()=>{
 const site=geographicPilotSites[0],{recipe}=context(site),q=geographicPilotUrl(site.id).split('?')[1];
 for(const r of [{...recipe,location:null},{...recipe,location:{lat:NaN,lon:10.5}},{...recipe,location:{lat:site.lat+1,lon:site.lon}},{...recipe,ecoregion:null},{...recipe,ecoregion:{...recipe.ecoregion!,ECO_ID:0}},{...recipe,habitat:'wetland' as const},{...recipe,environment:{...recipe.environment,unvalidated:['elevation']}},{...recipe,palette:[]}])assert.equal(resolveGeographicPilot(r,q).pilot,null);
 for(const suffix of ['&referenceScene=temperate-woodland','&expansion=temperate','&wave1=desert','&alpine=valley','&geographicPilot=woodland-europe']){const s=resolveEnvironmentSelection(recipe,q+suffix);assert.equal(s.route.kind,'generic');assert.equal(s.pilot,null);assert.ok(s.notices.length);}
 assert.equal(resolveEnvironmentSelection(recipe,q.replace(site.id,'unknown')).route.kind,'generic');
 assert.equal(resolveEnvironmentSelection({...recipe,renderMode:'diagram'},q).route.kind,'diagram');
});
test('every protected reference remains outside the pilot and retains its checkpoint',()=>{
 for(const e of environmentRegistry){const q=new URLSearchParams(referenceSceneUrl(e.id).split('?')[1]);const r={location:{lat:Number(q.get('lat')),lon:Number(q.get('lon'))},ecoregion:{BIOME_NUM:e.scope.biomeId,ECO_ID:e.scope.ecoregions?.[0]??100,REALM:e.scope.realm??'Neotropic'}};const s=resolveEnvironmentSelection(r,q.toString());assert.equal(s.pilot,null);assert.equal(s.selectedScene?.id,e.id);assert.equal(s.checkpoint?.exactSettings,true);}
});

test('location-conditioned matte assets are withheld outside their pilot region; legacy loading is preserved',()=>{
 const spec:LandscapeMatteAsset={schemaVersion:1,id:'fixture',asset:'/fixture.png',conditioning:{location:{lat:43.72,lon:3.58},ecoregionId:799,biomeId:12,topography:{source:'fixture',measured:false,landform:'fixture'},landCover:[],seed:'29',season:'reference',timeOfDay:'reference',weather:'reference',viewAzimuth:0,horizonFraction:.4},layers:[{position:[0,0,-100],size:[100,30],yaw:0,opacity:1}],supportedView:{anchor:[0,1.7,34],maxHorizontalDisplacement:50,maxElevation:20,halfAngleDegrees:50},provenance:{method:'fixture',source:'fixture',limitations:[]}};
 let loads=0;const load=()=>{loads++;return new Texture();};
 const foreign=new Scene();foreign.userData.environmentSelection={pilot:{site:{lat:38.3,lon:-8.2}}};mountLandscapeMatte(foreign,spec,load)();assert.equal(loads,0);assert.equal(foreign.children.length,0);assert.equal(foreign.userData.withheldRegionalMattes.length,1);
 const reference=new Scene(),dispose=mountLandscapeMatte(reference,spec,load);assert.equal(loads,1);assert.equal(reference.children.length,1);dispose();assert.equal(reference.children.length,0);
 const local=new Scene();local.userData.environmentSelection={pilot:{site:{lat:43.72,lon:3.58}}};mountLandscapeMatte(local,spec,load)();assert.equal(loads,2);
});

test('representative pilot has three audited locations in every existing RESOLVE family',()=>{const counts=new Map<number,number>();for(const site of geographicPilotSites)counts.set(site.biome,(counts.get(site.biome)??0)+1);assert.equal(geographicPilotSites.length,42);assert.equal(new Set(geographicPilotSites.map(s=>s.id)).size,42);assert.equal(counts.size,14);assert.ok([...counts.values()].every(n=>n===3));});
