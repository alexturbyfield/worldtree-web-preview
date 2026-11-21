import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {lookup,tileKey,type EcoCollection} from '../src/lib/geography';
import {lookupBotanicalArea,type BotanicalCollection} from '../src/lib/botanical';
import {resolveVegetation,exportProfile,taxa,habitats,searchTaxa,defaultEnvironment} from '../src/lib/vegetation';
import type {EnvironmentFilters} from '../src/lib/global-types';
import coverage from '../data/global/coverage.json';
import legacyLinks from '../data/global/legacy-links.json';
const botanical=JSON.parse(readFileSync('public/data/v08/botanical-countries.geojson','utf8')) as BotanicalCollection;
const manifest=JSON.parse(readFileSync('public/data/resolve-2017/manifest.json','utf8'));
function context(lat:number,lon:number){const key=tileKey(lat,lon);const geography=manifest.tiles[key]?lookup(lat,lon,JSON.parse(gunzipSync(readFileSync(`public/data/resolve-2017/tiles/${key}.geojson.gz`)).toString()) as EcoCollection)??null:null;return {lat,lon,geography,botanicalArea:lookupBotanicalArea(lat,lon,botanical)};}
const points=[
 ['Seattle',47.6062,-122.3321,'Nearctic',[5]],['Atlanta',33.749,-84.388,'Nearctic',[4]],['Tokyo',35.6762,139.6503,'Palearctic',[4]],
 ['Manaus',-3.12,-60.02,'Neotropic',[1]],['Kinshasa region',-4.3,15.3,'Afrotropic',[1,7]],['Antananarivo',-18.9,47.5,'Afrotropic',[1,7]],
 ['Cairo · Nile Delta',30.04,31.24,'Palearctic',[9]],['Cairo desert edge',30.04,31.8,'Palearctic',[13]],['Berlin',52.52,13.4,'Palearctic',[4]],['Yakutsk',62.04,129.73,'Palearctic',[6]],
 ['Mumbai region',19.08,72.88,'Indomalayan',[1,2]],['Borneo',2,114,'Indomalayan',[1]],['Perth',-31.95,115.86,'Australasia',[12]],
 ['Auckland',-36.85,174.76,'Australasia',[4]],['Reykjavík region',64.15,-21.94,'Palearctic',[6]],['Hawaiʻi',19.65,-155.15,'Oceania',[1,2]],
 ['Caribbean',21.5,-78,'Neotropic',[1,2]],['Arctic tundra',73,-100,'Nearctic',[11]],['Sahara',25,10,'Palearctic',[13]],
] as const;
for(const [name,lat,lon,realm,biomes] of points)test(`global coordinate: ${name}`,()=>{
 const c=context(lat,lon);assert.ok(c.geography,`${name}: source terrestrial polygon must resolve`);assert.equal(c.geography.REALM,realm);assert.ok((biomes as readonly number[]).includes(c.geography.BIOME_NUM),`${name}: actual biome ${c.geography.BIOME_NUM} (${c.geography.ECO_NAME})`);
 const p=resolveVegetation(c);assert.notEqual(p.status,'insufficient_data');assert.notEqual(p.evidenceLevel,'verified_ecoregion');
 for(const t of p.species){assert.ok(c.botanicalArea);assert.ok(t.nativeAreaCodes.includes(c.botanicalArea.code),`${t.scientificName} leaks into ${name}`);assert.equal(t.confidence,'regional');assert.equal(t.ecoregionIds.length,0);}
 if([11,13].includes(c.geography.BIOME_NUM))assert.equal(p.species.length,0);
});
test('400 distinct accepted sourced tree taxa; original 62 names linked without overwriting legacy data',()=>{
 assert.equal(taxa.length,400);assert.equal(new Set(taxa.map(t=>t.id)).size,400);assert.equal(new Set(taxa.map(t=>t.scientificName)).size,400);
 assert.ok(taxa.every(t=>t.accepted&&t.taxonomyConfidence==='source_accepted'&&t.nativeAreaCodes.length>0&&t.evidenceUrl.startsWith('https://powo.science.kew.org/taxon/')&&t.growthForm.includes('tree')));
 assert.equal(Object.keys(legacyLinks).length,62);assert.ok(Object.values(legacyLinks).every(Boolean));
 assert.equal(legacyLinks['Pinus taeda'],'wcvp:380129','accepted Pinus taeda L., not its illegitimate homonym');
 assert.ok(taxa.every(t=>t.evergreen===null&&t.matureHeightM===null&&!t.ecoregionVerified&&!t.habitatVerified));
});
test('no arbitrary cross-continent leakage in Madagascar or native-range fallback',()=>{
 const p=resolveVegetation(context(-18.5,48.3));assert.equal(p.botanicalArea?.code,'MDG');assert.ok(p.species.length>0);assert.ok(p.species.every(t=>t.nativeAreaCodes.includes('MDG')));assert.ok(!p.species.some(t=>t.scientificName==='Pseudotsuga menziesii'));
 const q=resolveVegetation({...context(-18.5,48.3),botanicalArea:{code:'NO_SUCH_REGION',name:'Missing'}});assert.equal(q.species.length,0);assert.equal(q.evidenceLevel,'biome_realm_fallback');
});
test('all 14 terrestrial biomes and eight realms have explicit ecological responses',()=>{
 assert.equal(new Set(coverage.ecoregions.filter(e=>e.id!==0).map(e=>e.biomeId)).size,14);
 assert.equal(new Set(coverage.ecoregions.filter(e=>e.id!==0).map(e=>e.realm)).size,8);
 for(const e of coverage.ecoregions){const geo={ECO_ID:e.id,ECO_NAME:e.name,BIOME_NAME:e.biome,BIOME_NUM:e.biomeId,REALM:e.realm};for(const h of habitats){const p=resolveVegetation({...e.auditPoint,geography:geo,botanicalArea:e.botanicalArea,habitat:h.id});assert.notEqual(p.status,'insufficient_data');assert.ok(p.description.length);assert.ok(p.growthForms.length);}}
});
test('coverage audit separates 846 ecoregions and the misleading source Rock and Ice biome code',()=>{
 assert.equal(coverage.terrestrialEcoregions,846);assert.equal(coverage.rockAndIceFeatures,1);assert.equal(coverage.verifiedSpeciesEcoregions,0);assert.equal(coverage.regionalAtAuditPoint+coverage.biomeFallbackAtAuditPoint+coverage.insufficientAtAuditPoint,846);
 const e=coverage.ecoregions.find(e=>e.id===0)!;assert.equal(e.biomeId,11);const p=resolveVegetation({...e.auditPoint,geography:{ECO_ID:0,ECO_NAME:e.name,BIOME_NAME:e.biome,BIOME_NUM:11,REALM:e.realm}});assert.match(p.title,/rock and ice/i);assert.deepEqual(p.species,[]);assert.equal(p.status,'naturally_treeless');
});
test('deserts, open grasslands, tundra and alpine settings do not get arbitrary forest species',()=>{
 for(const biome of [7,8,9,10,11,13]){const geo={ECO_ID:999,ECO_NAME:'Test context',BIOME_NAME:'Test biome',BIOME_NUM:biome,REALM:'Afrotropic'};const p=resolveVegetation({lat:0,lon:0,geography:geo,botanicalArea:{code:'KEN',name:'Kenya'}});assert.equal(p.species.length,0);assert.notEqual(p.status,'species_candidates');}
 const p=resolveVegetation({...context(47.6062,-122.3321),habitat:'alpine'});assert.equal(p.species.length,0);assert.ok(p.growthForms.every(f=>f.conditional));
});
test('ocean, missing polygon data, missing realm and unknown biome fail honestly',()=>{
 assert.equal(resolveVegetation(context(25,-140)).status,'insufficient_data');
 assert.equal(resolveVegetation({...context(47.6062,-122.3321),geography:null}).species.length,0);
 const c=context(47.6062,-122.3321);for(const geo of [{...c.geography!,REALM:''},{...c.geography!,BIOME_NUM:999}])assert.equal(resolveVegetation({...c,geography:geo}).status,'insufficient_data');
 assert.equal(resolveVegetation({...c,botanicalArea:null}).evidenceLevel,'biome_realm_fallback');
});
test('native-range boundary geometry covers edges but excludes holes and outside points',()=>{
 const d={type:'FeatureCollection',features:[{type:'Feature',properties:{LEVEL3_COD:'FIX',LEVEL3_NAM:'Test country'},geometry:{type:'Polygon',coordinates:[[[0,0],[4,0],[4,4],[0,4],[0,0]],[[1,1],[1,3],[3,3],[3,1],[1,1]]]}}]} as BotanicalCollection;
 assert.equal(lookupBotanicalArea(0,0,d)?.code,'FIX');assert.equal(lookupBotanicalArea(2,2,d),null);assert.equal(lookupBotanicalArea(5,5,d),null);assert.throws(()=>lookupBotanicalArea(NaN,0,d));
});
test('urban is not inferred from native-country data; preserved planting examples stay provisional',()=>{
 const c=context(35.6762,139.6503),natural=resolveVegetation(c),urban=resolveVegetation({...c,habitat:'urban'});assert.ok(natural.species.length);assert.equal(urban.species.length,0);assert.equal(urban.evidenceLevel,'biome_realm_fallback');assert.ok(urban.provisionalCandidates.some(t=>t.id==='ginkgo_biloba'));
 const cairo=resolveVegetation({...context(30.04,31.24),habitat:'urban'});assert.match(cairo.description,/planting inventory/i);assert.equal(cairo.species.length,0);assert.ok(cairo.growthForms.every(f=>f.conditional));
});
test('deterministic seeds order a palette without inventing ecological spawn probabilities',()=>{
 const c=context(-3.12,-60.02),a=resolveVegetation({...c,seed:'world-42'}),b=resolveVegetation({...c,seed:'world-42'}),other=resolveVegetation({...c,seed:'world-43'});assert.deepEqual(a,b);assert.notDeepEqual(a.species.map(t=>t.id),other.species.map(t=>t.id));assert.equal(a.procedural.spawnWeights,null);assert.equal(a.procedural.abundance,null);assert.ok(a.species.length<=12);
 const out=JSON.parse(exportProfile(a));assert.equal(out.schemaVersion,'0.8.0');assert.equal(out.seed,'world-42');assert.equal(out.species[0].assetArchetype,out.species[0].archetype);assert.equal(out.species[0].confidence,'regional');assert.equal(exportProfile(a),exportProfile(b));
});
test('moisture, elevation, coastal and seasonal filters do not silently pass unknown traits',()=>{
 const c=context(47.6062,-122.3321);assert.ok(resolveVegetation(c).species.length);
 const requests:Partial<EnvironmentFilters>[]=[{moisture:'wet'},{elevationM:1000},{coastal:'coastal'},{seasonality:'evergreen'}];
 for(const request of requests){const p=resolveVegetation({...c,environment:{...defaultEnvironment,...request}});assert.equal(p.species.length,0);assert.ok(p.environment.unvalidated.length>0);assert.ok(p.growthForms.every(f=>f.conditional));assert.match(p.description,/withheld/i);}
 assert.throws(()=>resolveVegetation({...c,environment:{...defaultEnvironment,elevationM:NaN}}));
});
test('verified species/ecoregion association outranks broad native ranges only with a real evidence field',()=>{
 const c=context(47.6062,-122.3321),fixture={taxonId:taxa[0].id,ecoregionId:c.geography!.ECO_ID,habitats:['forest'] as const,verified:true,evidenceUrls:['https://example.test/fixture-only']};
 const verifiedAssociations=[{...fixture,habitats:[...fixture.habitats]}];const p=resolveVegetation({...c,verifiedAssociations});assert.equal(p.evidenceLevel,'verified_ecoregion');assert.equal(p.species[0].id,taxa[0].id);assert.equal(p.species[0].confidence,'verified');assert.ok(p.species[0].ecoregionVerified);assert.ok(p.species[0].sources.includes('https://example.test/fixture-only'));
 for(const record of [{...verifiedAssociations[0],verified:false},{...verifiedAssociations[0],evidenceUrls:[]}])assert.equal(resolveVegetation({...c,verifiedAssociations:[record]}).evidenceLevel,'documented_regional_range');
 const filtered=resolveVegetation({...c,verifiedAssociations,environment:{...defaultEnvironment,elevationM:3000}});assert.equal(filtered.species.length,0);assert.ok(filtered.environment.unvalidated.includes('elevation'));
});
test('species search finds accepted scientific, preserved common and reconciled synonym names',()=>{
 assert.ok(searchTaxa('Douglas-fir').some(t=>t.scientificName==='Pseudotsuga menziesii'));
 assert.ok(searchTaxa('Adansonia grandidieri').some(t=>t.scientificName==='Adansonia grandidieri'));
 assert.ok(searchTaxa('Shorea leprosula').length>0);assert.deepEqual(searchTaxa('no such botanical taxon xyz'),[]);
});
test('source temperate climate includes native boreal larches and Iceland birch without implying current forest cover',()=>{
 const yakutsk=resolveVegetation(context(62.04,129.73));assert.equal(yakutsk.evidenceLevel,'documented_regional_range');assert.ok(yakutsk.species.length>0);
 const iceland=resolveVegetation(context(64.96,-18.46));assert.equal(iceland.evidenceLevel,'documented_regional_range');assert.ok(iceland.species.some(t=>t.genus==='Betula'));assert.ok(iceland.growthForms.some(f=>/birch/i.test(f.name)));assert.ok(iceland.species.every(t=>t.nativeAreaCodes.includes('ICE')));
 const reykjavik=resolveVegetation(context(64.15,-21.94));assert.equal(reykjavik.evidenceLevel,'biome_realm_fallback');assert.equal(reykjavik.botanicalArea,null);assert.ok(reykjavik.growthForms.some(f=>/birch/i.test(f.name))); // Coarse botanical coastline misses the city: no nearest-area substitution.
});
