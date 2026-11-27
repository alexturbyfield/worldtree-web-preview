import {mapVisual} from './forest/presets';
import source from '../../data/global/taxa.json';
import bindings from '../../data/global/ecoregion-associations.json';
import {recommend,validateCoordinates} from './catalog';
import {biomeNames,type EcoProperties} from './geography';
import type {BotanicalArea,EcoregionAssociation,EnvironmentFilters,Taxon,TreeSpecies,VegetationHabitat,VegetationProfile} from './global-types';
export const taxa=source as Taxon[];
export const associations=bindings as EcoregionAssociation[];
export const defaultEnvironment:EnvironmentFilters={moisture:'any',elevationM:null,coastal:'any',seasonality:'any'};
export const habitats: {id:VegetationHabitat;name:string}[]=[{id:'forest',name:'Natural forest'},{id:'urban',name:'Urban / planted'},{id:'grassland',name:'Grassland & savanna'},{id:'wetland',name:'Wetland & riparian'},{id:'coastal',name:'Coastal'},{id:'alpine',name:'Alpine / high elevation'}];
const forestBiomes=new Set([1,2,3,4,5,6,12]);
const sources=[{name:'RESOLVE Ecoregions 2017',url:'https://doi.org/10.1093/biosci/bix014',license:'CC-BY-4.0'},{name:'WCVP v16 · Royal Botanic Gardens, Kew',url:'https://doi.org/10.34885/egs6-cp24',license:'CC-BY-3.0'},{name:'TDWG botanical countries',url:'https://www.tdwg.org/standards/wgsrpd/',license:'CC-BY-4.0'}];
export function climateCompatible(climate:string,biome:number) {
  const c=climate.toLowerCase();
  if(!c)return false;
  if([1,14].includes(biome))return /wet tropical|subtropical|tropical/.test(c)&&!/seasonally dry|desert/.test(c);
  if([2,3].includes(biome))return /seasonally dry tropical|subtropical/.test(c);
  if([4,5].includes(biome))return /temperate/.test(c);
  // WCVP uses "temperate" for several boreal taxa (including native birches and larches).
  if(biome===6)return /temperate|subalpine|subarctic/.test(c);
  if(biome===12)return /subtropical|temperate/.test(c);
  return false;
}
export function seededOrder<T extends {id:string}>(items:T[],seed:string):T[]{
  let state=2166136261;for(const char of seed){state^=char.charCodeAt(0);state=Math.imul(state,16777619);}
  const random=()=>{state+=0x6D2B79F5;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
  const out=[...items].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
  for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;
}
function growthProfile(geo:EcoProperties,habitat:VegetationHabitat) {
  const b=geo.BIOME_NUM,realm=geo.REALM;
  if(geo.ECO_ID===0||b===98||b===0)return {status:'naturally_treeless' as const,title:'Rock and ice · no tree palette',description:'The source classifies this as rock or ice. No native trees or forest are inferred.',forms:[['Bare substrate / ice','bare_ground',false]] as [string,string,boolean][]};
  if(b===11)return {status:'naturally_treeless' as const,title:'Predominantly treeless tundra',description:'Tundra supports low vegetation. Tree-line ecotones and sheltered river valleys need local evidence; no forest palette is inferred.',forms:[['Low shrubs, sedges and mosses','tundra_groundcover',false]] as [string,string,boolean][]};
  if(habitat==='urban')return {status:'growth_form_fallback' as const,title:'Designed planting · local evidence needed',description:'A biome is not an urban planting inventory. These design forms require local climate, water, soil and invasive-species checks.',forms:(b===13?[['Water-limited planting / non-woody cover','arid_groundcover',true]]:[['Climate-adapted planted canopy','planted_canopy',true],['Low planting and open ground','urban_understory',true]]) as [string,string,boolean][]};
  if(b===13)return {status:'open_vegetation' as const,title:'Desert / xeric vegetation',description:'No forest is inferred. Sparse woody plants, oases and riparian patches need habitat and water evidence.',forms:[['Sparse drought-adapted shrubs','xeric_shrub',false],['Woody oasis or river vegetation only if documented','sparse_dryland_tree',true]] as [string,string,boolean][]};
  if([7,8,9,10].includes(b))return {status:'open_vegetation' as const,title:b===7?'Open savanna / grassland':b===9?'Flooded grassland mosaic':b===10?'Montane open vegetation':'Temperate grassland / steppe',description:'An open vegetation matrix is the default. Trees are conditional patches, not a continuous forest or a verified local species list.',forms:[['Grass, sedge or low-shrub matrix','open_groundcover',false],...(b===7?[['Scattered canopy only with local habitat evidence','savanna_canopy',true]]:b===9?[['Conditional wooded wetland margins or raised tree islands; local hydrology unverified','riparian_canopy',true]]:[])] as [string,string,boolean][]};
  if(habitat==='alpine')return {status:'growth_form_fallback' as const,title:'Elevation-dependent vegetation',description:'Elevation and tree line have not been measured. High-elevation forms are conditional; lowland tree candidates are withheld.',forms:[['Low shrubs and alpine groundcover','alpine_groundcover',true],['Stunted tree-line forms below the local tree line','krummholz',true]] as [string,string,boolean][]};
  if(habitat==='wetland')return {status:'growth_form_fallback' as const,title:'Wetland / riparian habitat is conditional',description:'Terrestrial ecoregions do not identify a wetland or riverbank at this coordinate. Verify inundation, soil and freshwater conditions first.',forms:[['Sedges, reeds or riparian shrubs','wetland_understory',true],['Flood-tolerant canopy only with habitat evidence','riparian_canopy',true]] as [string,string,boolean][]};
  if(habitat==='coastal')return {status:'growth_form_fallback' as const,title:b===14?'Mangrove ecological context':'Coastal habitat is conditional',description:b===14?'The ecoregion is classified as mangrove. Salinity, tidal position and species presence still require local evidence.':'Distance to coast, salt exposure and tidal conditions are unmeasured. No mangroves or coastal species are inferred from latitude.',forms:(b===14?[['Tidal mangrove canopy and roots','mangrove',false]]:[['Salt- and wind-exposed low vegetation','coastal_scrub',true]]) as [string,string,boolean][]};
  if(habitat==='grassland')return {status:'growth_form_fallback' as const,title:'Open habitat within a forest biome · unverified',description:'This biome does not establish grassland at this point. Use an open patch only if supported by land-cover or habitat evidence.',forms:[['Conditional grass / low-shrub clearing','open_groundcover',true]] as [string,string,boolean][]};
  const birchWoodland=b===6&&/birch/i.test(geo.ECO_NAME);
  const form=birchWoodland?'Birch / broadleaf woodland below local tree line':b===1?'Layered tropical canopy':b===2?'Seasonal tropical woodland':b===3||b===5?'Conifer canopy':b===6?'Boreal conifer / mixed canopy':b===12?'Sclerophyll woodland / scrub':b===14?'Tidal mangrove canopy':'Temperate broadleaf / mixed canopy';
  const archetype=[3,5,6].includes(b)&&!birchWoodland?'conifer':b===14?'mangrove':'broadleaf_tree';
  return {status:'growth_form_fallback' as const,title:`${realm} · ${biomeNames[b]}`,description:'Biome-and-realm design fallback. Growth forms describe potential ecological context; no species-level local presence is asserted.',forms:[[form,archetype,false],['Understory, gaps and non-tree cover','understory',false]] as [string,string,boolean][]};
}
export function resolveVegetation({lat,lon,geography,botanicalArea=null,habitat='forest',seed='42',environment=defaultEnvironment,catalog=taxa,verifiedAssociations=associations}:{lat:number;lon:number;geography:EcoProperties|null;botanicalArea?:BotanicalArea|null;habitat?:VegetationHabitat;seed?:string;environment?:EnvironmentFilters;catalog?:Taxon[];verifiedAssociations?:EcoregionAssociation[]}):VegetationProfile {
  validateCoordinates(lat,lon);if(!habitats.some(h=>h.id===habitat))throw new Error('Unsupported habitat');
  if(!['any','dry','mesic','wet'].includes(environment.moisture)||!['any','coastal','inland'].includes(environment.coastal)||!['any','evergreen','deciduous'].includes(environment.seasonality)||(environment.elevationM!==null&&(!Number.isFinite(environment.elevationM)||environment.elevationM< -500||environment.elevationM>9000)))throw new Error('Invalid environmental filters');
  const unvalidated=[...(environment.moisture!=='any'?['moisture']:[]),...(environment.elevationM!==null?['elevation']:[]),...(environment.coastal!=='any'?['coastal / inland']:[]),...(environment.seasonality!=='any'?['seasonal leaf habit']:[])];
  const result:VegetationProfile={schemaVersion:'0.8.0',location:{lat,lon},geography,botanicalArea,habitat,seed:String(seed),evidenceLevel:'insufficient_data',status:'insufficient_data',title:'Insufficient ecological data',description:'No supported terrestrial ecoregion covers this coordinate. Ocean, inland water and data gaps do not receive a native species palette.',growthForms:[],species:[],regionalSpeciesCount:0,provisionalCandidates:[],limitations:['Native botanical-country records do not verify presence at a point or membership of an ecoregion.','Current land cover, elevation, soil, water availability and local habitat are unmeasured.','No abundance, probability or ecological spawn weights are provided.'],sources,environment:{requested:{...environment},observed:{moisture:null,elevationM:null,coastal:null,seasonality:null},unvalidated,policy:'Active environmental filters with missing measurements withhold species; unknown is never treated as a validated match.'},procedural:{method:'Deterministic seeded palette order; no abundance model',paletteLimit:12,spawnWeights:null,abundance:null}};
  if(!geography||(!biomeNames[geography.BIOME_NUM]&&![0,98].includes(geography.BIOME_NUM))||!geography.REALM)return result;
  const growth=growthProfile(geography,habitat);result.status=growth.status;result.title=growth.title;result.description=growth.description;result.growthForms=growth.forms.map(([name,archetype,conditional])=>({name,archetype,conditional}));result.evidenceLevel='biome_realm_fallback';
  if(unvalidated.length&&geography.ECO_ID!==0&&![0,98,11].includes(geography.BIOME_NUM)){result.title='Environmental filter evidence is missing';result.description='Species withheld: '+unvalidated.join(', ')+' has not been measured or sourced. The growth forms below are conditional design context, not validated matches.';result.growthForms=result.growthForms.map(f=>({...f,conditional:true}));return result;}
  const exact=verifiedAssociations.filter(a=>a.verified&&a.ecoregionId===geography.ECO_ID&&a.habitats.includes(habitat)&&a.evidenceUrls.length>0);
  const exactTaxa=catalog.filter(t=>exact.some(a=>a.taxonId===t.id));
  if(exactTaxa.length){result.evidenceLevel='verified_ecoregion';result.status='species_candidates';result.species=seededOrder(exactTaxa,result.seed).slice(0,12).map(t=>({...t,confidence:'verified',ecoregionVerified:true,habitatVerified:true,ecoregionIds:[...new Set([...t.ecoregionIds,String(geography.ECO_ID)])],habitats:[...new Set([...t.habitats,habitat])],sources:[...new Set([...t.sources,...exact.filter(a=>a.taxonId===t.id).flatMap(a=>a.evidenceUrls)])]}));result.regionalSpeciesCount=exactTaxa.length;result.title='Verified ecoregion associations';result.description='Species associations have explicit ecoregion and habitat evidence. This still does not establish current land cover or abundance.';result.sources=[...sources,...exact.flatMap(a=>a.evidenceUrls.map(url=>({name:'Species–ecoregion association evidence',url,license:'See source'})))];return result;}
  if(geography.ECO_ID===0||[0,98,11].includes(geography.BIOME_NUM))return result;

  // Native-country mangrove candidates supported by existing visual profiles; never point occurrence.
  if(geography.BIOME_NUM===14&&habitat==='coastal'&&botanicalArea){
    const supported=new Set(['red-mangrove','avicennia','stilt-mangrove']);
    const regional=catalog.filter(t=>t.accepted&&t.nativeAreaCodes.includes(botanicalArea.code)&&climateCompatible(t.climate,14)&&supported.has(mapVisual(t.scientificName,t.assetArchetype).presetId));
    if(regional.length){result.evidenceLevel='documented_regional_range';result.status='species_candidates';result.regionalSpeciesCount=regional.length;result.species=seededOrder(regional,result.seed).slice(0,12);result.title=`Documented regional mangrove candidates · ${botanicalArea.name}`;result.description='Existing catalogue taxa native to the botanical country with a supported mangrove growth profile. Local occurrence, salinity and tidal position remain unverified.';}
  }
  if(habitat==='forest'&&forestBiomes.has(geography.BIOME_NUM)&&botanicalArea){
    // Native country and broad-climate evidence remain separate from local habitat validation.
    const regional=catalog.filter(t=>t.accepted&&t.nativeAreaCodes.includes(botanicalArea.code)&&climateCompatible(t.climate,geography.BIOME_NUM));
    if(regional.length){result.evidenceLevel='documented_regional_range';result.status='species_candidates';result.regionalSpeciesCount=regional.length;result.species=seededOrder(regional,result.seed).slice(0,12);result.title=`Documented native range · ${botanicalArea.name}`;result.description='WCVP documents these taxa as native in this broad botanical country. Broad climate compatibility is an inference; local habitat, occurrence and ecoregion membership remain unverified.';}
  }
  if(habitat==='urban'||(habitat==='forest'&&forestBiomes.has(geography.BIOME_NUM)))result.provisionalCandidates=recommend(lat,lon,habitat).species;
  return result;
}
export function searchTaxa(query:string,source=taxa){const q=query.trim().toLocaleLowerCase();return q?source.filter(t=>[t.scientificName,...t.commonNames,...t.synonyms].some(n=>n.toLocaleLowerCase().includes(q))):source;}
export function exportProfile(profile:VegetationProfile){
  const species:TreeSpecies[]=profile.species.map(({heightMeters,...taxon})=>{
    const knownHeight=heightMeters??taxon.matureHeightM;
    return knownHeight===null||knownHeight===undefined?taxon:{...taxon,heightMeters:knownHeight};
  });
  return JSON.stringify({...profile,species},null,2)+'\n';
}
