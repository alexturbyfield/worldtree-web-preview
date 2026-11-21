import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import ecoregions from '../data/global/ecoregions.json';
import {lookupBotanicalArea,type BotanicalCollection} from '../src/lib/botanical';
import {resolveVegetation,habitats,taxa,associations} from '../src/lib/vegetation';
import type {EcoProperties} from '../src/lib/geography';
const boundary=JSON.parse(readFileSync('public/data/v08/botanical-countries.geojson','utf8')) as BotanicalCollection;
const samples=ecoregions.map(eco=>{
 const geo:EcoProperties={ECO_ID:eco.id,ECO_NAME:eco.name,BIOME_NAME:eco.biome,BIOME_NUM:eco.biomeId,REALM:eco.realm};
 const {lat,lon}=eco.auditPoint,botanicalArea=lookupBotanicalArea(lat,lon,boundary);
 const modes=Object.fromEntries(habitats.map(h=>{const r=resolveVegetation({lat,lon,geography:geo,botanicalArea,habitat:h.id});return [h.id,{level:r.evidenceLevel,status:r.status,candidates:r.regionalSpeciesCount,provisional:r.provisionalCandidates.length}];}));
 return {...eco,botanicalArea,modes};
});
const terrestrial=samples.filter(r=>r.id!==0&&r.biomeId>=1&&r.biomeId<=14);
const forest=terrestrial.map(r=>r.modes.forest);
const summary={version:'0.8.0',taxa:taxa.length,documentedNativeAreas:new Set(taxa.flatMap(t=>t.nativeAreaCodes)).size,terrestrialEcoregions:terrestrial.length,rockAndIceFeatures:samples.length-terrestrial.length,verifiedSpeciesEcoregions:new Set(associations.filter(a=>a.verified&&a.evidenceUrls.length).map(a=>a.ecoregionId)).size,regionalAtAuditPoint:forest.filter(r=>r.level==='documented_regional_range').length,biomeFallbackAtAuditPoint:forest.filter(r=>r.level==='biome_realm_fallback').length,insufficientAtAuditPoint:forest.filter(r=>r.level==='insufficient_data').length,treelessAtAuditPoint:forest.filter(r=>r.status==='naturally_treeless').length,auditMethod:'Natural forest mode at one unsimplified-source interior point per ecoregion. These counts are point samples, not continuous species coverage or verified ecoregion associations.',modes:Object.fromEntries(habitats.map(h=>[h.id,{regionalAtAuditPoint:terrestrial.filter(e=>e.modes[h.id].level==='documented_regional_range').length,fallbackAtAuditPoint:terrestrial.filter(e=>e.modes[h.id].level==='biome_realm_fallback').length,insufficientAtAuditPoint:terrestrial.filter(e=>e.modes[h.id].level==='insufficient_data').length}]))};
const coverage={...summary,ecoregions:samples};
const gaps={botanicalBoundaryGapsAtAuditPoint:terrestrial.filter(e=>!e.botanicalArea).length,openVegetationAtAuditPoint:forest.filter(r=>r.status==='open_vegetation').length,forestClimateOrCatalogFallbackAtAuditPoint:forest.filter(r=>r.status==='growth_form_fallback').length};
Object.assign(summary,gaps);Object.assign(coverage,gaps);
for(const path of ['data/global/coverage-summary.json','public/data/v08/coverage-summary.json'])writeFileSync(path,JSON.stringify(summary,null,2)+'\n');
for(const path of ['data/global/coverage.json','public/data/v08/coverage.json'])writeFileSync(path,JSON.stringify(coverage,null,2)+'\n');
const display=JSON.parse(readFileSync('public/data/resolve-2017/display.geojson','utf8'));
for(const f of display.features){const sample=samples.find(e=>e.id===f.properties.ECO_ID);f.properties.coverageEvidence=sample?.modes.forest.level??'insufficient_data';f.properties.auditCandidates=sample?.modes.forest.candidates??0;}
writeFileSync('public/data/v08/ecoregions.geojson',JSON.stringify(display));
const hashes=Object.fromEntries(['taxa.json','coverage.json','coverage-summary.json','ecoregions.geojson','botanical-countries.geojson','provenance.json'].map(name=>[name,createHash('sha256').update(readFileSync('public/data/v08/'+name)).digest('hex')]));
writeFileSync('public/data/v08/manifest.json',JSON.stringify({version:'0.8.0',files:hashes,coverage:summary},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
