import {resolveBoundedEnvironment,type AutomaticDecision,type BoundedContext} from './bounded-resolver';
import {resolveGeographicPilot,type GeographicPilot,type RegionalRecipeSelection} from './geographic-pilot';
import catalog from './environment-registry.json';
import {parseSceneQuery,sceneQuery} from './query';

export interface EnvironmentEntry {
 id:string;name:string;version:string;kind:'profile'|'alpine'|'wave';adapter:string;
 scope:{biomeId:number;ecoregions?:number[];realm?:string;anchor?:number[];radiusDegrees?:number};
 reference:{params:Record<string,string>;checkpointId:string;approval:string;camera?:{position:number[];quaternion:number[];fov:number}};
 vegetationCoverage:'canonical'|'mixed'|'adapter-generated';evidence:string;limits:string[];
}
/** Metadata only: importing this module must never import Three.js or a rendering adapter. */
export const environmentRegistry:readonly EnvironmentEntry[]=catalog.entries as unknown as EnvironmentEntry[];
export const environmentById=(id:string)=>environmentRegistry.find(e=>e.id===id);
export const referenceSceneUrl=(id:string)=>{const entry=environmentById(id);if(!entry)throw Error('Unknown reference scene');const p=new URLSearchParams(entry.reference.params);p.set('referenceScene',id);return '/explore?'+p;};
export interface EnvironmentContext extends BoundedContext {location:{lat:number;lon:number}|null;ecoregion:{ECO_ID:number;BIOME_NUM:number;REALM:string}|null;renderMode?:string}
export interface EnvironmentRoute {kind:'profile'|'alpine'|'wave'|'generic'|'diagram';adapter:string;sceneId:string|null;variant?:'original'|'rebuild';pilot?:GeographicPilot;regional?:RegionalRecipeSelection}
export interface EnvironmentSelectionManifest {
 schemaVersion:1;requestedReference:string|null;selectedScene:{id:string;name:string;version:string}|null;
 route:EnvironmentRoute;mode:'reference'|'legacy-study'|'geographic'|'generic'|'pilot'|'automatic';pilot:GeographicPilot|null;regional:RegionalRecipeSelection|null;automatic:AutomaticDecision|null;
 checkpoint:{id:string;approvalRecord:string;exactSettings:boolean}|null;
 vegetationCoverage:EnvironmentEntry['vegetationCoverage'];individualInspection:boolean;
 referenceLocation:{lat:number;lon:number}|null;evidence:string;limits:string[];notices:string[];
}
export function environmentScopeMatches(entry:EnvironmentEntry,r:EnvironmentContext){const g=r.ecoregion,s=entry.scope;if(!g||g.ECO_ID===0||g.BIOME_NUM!==s.biomeId)return false;if(s.ecoregions&&!s.ecoregions.includes(g.ECO_ID)||s.realm&&s.realm!==g.REALM)return false;if(s.anchor&&(!r.location||Math.hypot(r.location.lat-s.anchor[0],r.location.lon-s.anchor[1])>=s.radiusDegrees!))return false;return true;}
export function geographicProfileId(r:EnvironmentContext){return environmentRegistry.find(e=>e.kind==='profile'&&environmentScopeMatches(e,r))?.adapter;}
function geographicRoute(r:EnvironmentContext):EnvironmentRoute{const profile=geographicProfileId(r);return profile?{kind:'profile',adapter:profile,sceneId:environmentRegistry.find(e=>e.kind==='profile'&&e.adapter===profile)!.id}:{kind:'generic',adapter:'generic',sceneId:null};}
/** Existing precedence and gates, including explicit legacy alpine studies, stay intact. */
function legacyRoute(r:EnvironmentContext,q:URLSearchParams):EnvironmentRoute{
 if(['valley','overlook','treeline'].includes(q.get('alpine')??''))return {kind:'alpine',adapter:'alpine',sceneId:'alpine'};
 const expansion=q.get('expansion'),wave1=q.get('wave1');
 const expansionEntry=environmentRegistry.find(e=>e.kind==='wave'&&!['desert','mangrove','flooded'].includes(e.adapter)&&e.adapter===expansion&&environmentScopeMatches(e,r));
 if(expansionEntry)return {kind:'wave',adapter:expansionEntry.adapter,sceneId:expansionEntry.id,variant:'original'};
 const waveEntry=environmentRegistry.find(e=>e.kind==='wave'&&['desert','mangrove','flooded'].includes(e.adapter)&&e.adapter===wave1&&environmentScopeMatches(e,r));
 if(waveEntry)return {kind:'wave',adapter:waveEntry.adapter,sceneId:waveEntry.id,variant:q.get('fieldStudy')==='rebuild'?'rebuild':'original'};
 return geographicRoute(r);
}
function normalizedSettings(search:string){const q=new URLSearchParams(search),normalized=new URLSearchParams(sceneQuery(parseSceneQuery(q))),seen=new Set<string>();for(const [key,value]of q){if(seen.has(key))throw Error('Repeated scene parameters are not a pinned checkpoint');seen.add(key);if(key!=='referenceScene'&&key!=='autoEnvironment'&&!CORE_KEYS.includes(key))normalized.set(key,value);}normalized.sort();return normalized.toString();}
export function resolveEnvironmentSelection(r:EnvironmentContext,search:string):EnvironmentSelectionManifest{
 const q=new URLSearchParams(search),requested=q.get('referenceScene'),reference=requested?environmentById(requested):undefined,notices:string[]=[];
 let route=legacyRoute(r,q),automatic=resolveBoundedEnvironment(r,search);
 const pilotResult=resolveGeographicPilot(r,search);
 if(q.has('geographicPilot')){route=pilotResult.pilot?{kind:'wave',adapter:pilotResult.pilot.site.family,sceneId:null,variant:['mangrove','desert','flooded'].includes(pilotResult.pilot.site.family)?'rebuild':'original',pilot:pilotResult.pilot}:geographicRoute(r);if(pilotResult.reason)notices.push(pilotResult.reason);}
 if(automatic?.recipe)route={kind:'wave',adapter:automatic.recipe.site.family,sceneId:null,variant:['mangrove','desert','flooded'].includes(automatic.recipe.site.family)?'rebuild':'original',regional:automatic.recipe};
 if(requested&&!reference){notices.push('Unknown reference scene. Showing the existing geographic fallback.');route=geographicRoute(r);}
 else if(reference&&!environmentScopeMatches(reference,r)){notices.push('This reference scene is outside its supported geographic scope. Showing the existing geographic fallback.');route=geographicRoute(r);}
 else if(reference&&route.sceneId!==reference.id)notices.push('The URL selects a different adapter from the requested reference. Its checkpoint is not active.');
 if((r.renderMode??q.get('mode'))==='diagram'){route={kind:'diagram',adapter:'diagram',sceneId:null};if(automatic)automatic={...automatic,status:'diagram',code:'preserved-diagram',explanation:'Diagram rendering is preserved; no automatic scenery adapter is applied.',recipe:null};}
 const entry=route.sceneId?environmentById(route.sceneId):undefined;let exact=false;
 if(entry&&environmentScopeMatches(entry,r)&&(!requested||requested===entry.id)&&!notices.length){try{exact=normalizedSettings(search)===normalizedSettings(new URLSearchParams(entry.reference.params).toString());}catch{exact=false;}}
 if(entry?.kind==='alpine'&&!environmentScopeMatches(entry,r))notices.push('Legacy alpine art override: regional vegetation and landforms at this location are not verified.');
 if(automatic?.status==='explicit-selection'&&exact)automatic={...automatic,status:'protected-reference',code:'protected-reference',explanation:'The accepted reference settings take priority; their existing renderer is preserved.'};
 if(automatic)notices.push('Automatic selection: '+automatic.explanation);
 const regional=route.regional??route.pilot??null;
 return {schemaVersion:1,requestedReference:requested,selectedScene:entry?{id:entry.id,name:entry.name,version:entry.version}:null,route,
 pilot:route.pilot??null,regional,automatic,mode:route.regional?'automatic':route.pilot?'pilot':requested?'reference':route.kind==='wave'||route.kind==='alpine'?'legacy-study':route.kind==='profile'?'geographic':'generic',
 checkpoint:entry?{id:entry.reference.checkpointId,approvalRecord:entry.reference.approval,exactSettings:exact}:null,
 vegetationCoverage:regional?'adapter-generated':entry?.vegetationCoverage??'canonical',individualInspection:regional?false:!entry||entry.vegetationCoverage!=='adapter-generated',
 referenceLocation:entry?{lat:Number(entry.reference.params.lat),lon:Number(entry.reference.params.lon)}:null,
 evidence:route.regional?'Bounded automatic recipe: regional candidates or unnamed low cover; no point-occurrence or artistic approval.':route.pilot?'Geographic pilot: regional catalogue candidates and explicitly unnamed functional forms; no point-occurrence or artistic approval.':entry?.evidence??'Existing geographic/ecological fallback; no reference-scene approval is inferred.',limits:regional?.limitations??entry?.limits??[],notices};
}
const CORE_KEYS=['lat','lon','habitat','seed','density','structure','appearance','mode','wind','conditional','moisture','coastal','seasonality','elevation','r','stylization','foliageDensity','asymmetry','foliageDetail','fluffiness','clumpOverlap','surfaceLeafDetail','branchExposure'];
/** Preserve every adapter flag; editing a seed must not silently select an older scene. */
export function mergeEnvironmentSearch(current:string,serializedScene:string){const p=new URLSearchParams(current);for(const key of CORE_KEYS)p.delete(key);for(const [key,value]of new URLSearchParams(serializedScene))p.set(key,value);return p.toString();}
export function exportEnvironmentScene<T extends object>(recipe:T,selection:EnvironmentSelectionManifest,sceneUrl:string){return {...recipe,environmentSelection:selection,sceneUrl};}
