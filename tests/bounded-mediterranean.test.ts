import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {Scene,Texture} from 'three';
import {lookup,tileKey,type EcoCollection} from '../src/lib/geography';
import {lookupBotanicalArea,type BotanicalCollection} from '../src/lib/botanical';
import {resolveVegetation} from '../src/lib/vegetation';
import {createSceneRecipe} from '../src/lib/forest/recipe';
import {resolveBoundedEnvironment} from '../src/lib/forest/bounded-resolver';
import {resolveEnvironmentSelection} from '../src/lib/forest/environment-registry';
import {mountLandscapeMatte,type LandscapeMatteAsset} from '../src/lib/forest/landscape-matte';
const botanical=JSON.parse(readFileSync('public/data/v08/botanical-countries.geojson','utf8')) as BotanicalCollection;
function sample(lat:number,lon:number){
 const geography=lookup(lat,lon,JSON.parse(gunzipSync(readFileSync(`public/data/resolve-2017/tiles/${tileKey(lat,lon)}.geojson.gz`)).toString()) as EcoCollection)??null;
 const botanicalArea=lookupBotanicalArea(lat,lon,botanical),profile=resolveVegetation({lat,lon,geography,botanicalArea,habitat:'forest',seed:'mediterranean-1'});
 return {profile,recipe:createSceneRecipe(profile,{seed:'29',density:0,structureSeed:'mediterranean-1',appearanceSeed:'garden',wind:false})};
}
const search='autoEnvironment=bounded-auto-v1&seed=29';
for(const [id,lat,lon,area]of [['mediterranean-france',43.85,3.75,'FRA'],['mediterranean-portugal',38.5,-8.4,'POR'],['mediterranean-italy',42.8,12.1,'ITA']] as const)test('actual regional oak data selects bounded Mediterranean: '+id,()=>{
 const {profile,recipe}=sample(lat,lon),s=resolveEnvironmentSelection(recipe,search);
 assert.equal(s.automatic?.status,'selected');assert.equal(s.automatic?.ruleId,id);assert.equal(s.route.adapter,'mediterranean');assert.equal(s.regional?.site.area,area);assert.equal(s.regional?.site.lat,lat);assert.equal(s.checkpoint,null);
 assert.ok(s.regional!.eligibleTreeCandidates.length);for(const c of s.regional!.eligibleTreeCandidates){assert.match(c.scientificName,/^Quercus (ilex|suber)$/);assert.ok(c.sources.length);assert.ok(profile.species.find(t=>t.scientificName===c.scientificName)?.nativeAreaCodes.includes(area));}
 assert.equal(resolveBoundedEnvironment(recipe,search)?.recipe?.effectiveSeed,s.regional?.effectiveSeed);assert.equal(resolveBoundedEnvironment(recipe,''),null);
 for(const seed of ['41','73'])assert.notEqual(resolveBoundedEnvironment(recipe,'autoEnvironment=bounded-auto-v1&seed='+seed)?.recipe?.effectiveSeed,s.regional?.effectiveSeed);
 for(const context of [{...recipe,habitat:'wetland' as const},{...recipe,habitat:'grassland' as const},{...recipe,botanicalArea:null},{...recipe,botanicalArea:{code:'GER',name:'wrong country'}},{...recipe,ecoregion:{...recipe.ecoregion!,REALM:'Nearctic'}},{...recipe,ecoregion:{...recipe.ecoregion!,ECO_ID:99999}},{...recipe,location:{lat:lat+2,lon}},{...recipe,environment:{...recipe.environment,unvalidated:['elevation']}},{...recipe,palette:[]}])assert.equal(resolveBoundedEnvironment(context,search)?.status,'fallback');
});
test('holm-oak scaffold must have source evidence and a drawable source; cork-only does not silently produce an empty woodland',()=>{
 const {recipe}=sample(43.85,3.75);
 assert.equal(resolveBoundedEnvironment({...recipe,palette:recipe.palette.filter(t=>t.scientificName==='Quercus suber')},search)?.code,'unsupported-architecture');
 assert.equal(resolveBoundedEnvironment({...recipe,requestedTreeCount:36,trees:[]},search)?.code,'missing-drawable-source');
 assert.equal(resolveBoundedEnvironment({...recipe,requestedTreeCount:36,trees:[{species:{scientificName:'Quercus suber'}}]},search)?.code,'missing-drawable-source');
 assert.equal(resolveBoundedEnvironment({...recipe,requestedTreeCount:36,trees:[{species:{scientificName:'Quercus ilex'}}]},search)?.status,'selected');
});
test('automatic Mediterranean selection retains the existing local matte envelope',()=>{
 const spec:LandscapeMatteAsset={schemaVersion:1,id:'herault-test',asset:'/test.png',conditioning:{location:{lat:43.72,lon:3.58},ecoregionId:799,biomeId:12,topography:{source:'test',measured:false,landform:'test'},landCover:[],seed:'29',season:'reference',timeOfDay:'reference',weather:'reference',viewAzimuth:0,horizonFraction:.24},layers:[{position:[0,-5,-650],size:[1600,500],yaw:0,opacity:1}],supportedView:{anchor:[0,1.7,16],maxHorizontalDisplacement:100,maxElevation:22,halfAngleDegrees:55},provenance:{method:'test',source:'test',limitations:[]}};
 let loads=0;const load=()=>{loads++;return new Texture();};
 for(const [lat,lon]of [[43.85,3.75],[38.5,-8.4],[42.8,12.1]]){const scene=new Scene();scene.userData.environmentSelection={regional:{site:{lat,lon}}};mountLandscapeMatte(scene,spec,load)();assert.equal(scene.children.length,0);assert.equal(scene.userData.withheldRegionalMattes.length,1);}
 assert.equal(loads,0);const local=new Scene();local.userData.environmentSelection={regional:{site:{lat:43.74,lon:3.6}}};const dispose=mountLandscapeMatte(local,spec,load);assert.equal(loads,1);assert.equal(local.children.length,1);dispose();assert.equal(local.children.length,0);
});
