import policy from './bounded-resolver-policy.json';
import {geographicPilotSites,regionalCandidates,type PilotContext,type RegionalRecipeSelection} from './geographic-pilot';
import {hashSeed} from './random';

export const boundedResolverPolicy=policy;
export interface BoundedContext extends PilotContext {
 ecoregion:(NonNullable<PilotContext['ecoregion']>&{REALM:string;ECO_NAME?:string})|null;
 botanicalArea?:{code:string;name:string}|null;
 ecologicalStatus?:string;requestedTreeCount?:number;
 conditionalStudy?:boolean;
 trees?:{species:{scientificName:string|null}}[];
}
export interface AutomaticDecision {
 policyVersion:'bounded-auto-v1'|'global-auto-v1';requestedVersion:string|null;
 status:'selected'|'fallback'|'explicit-selection'|'protected-reference'|'diagram';
 code:string;explanation:string;ruleId:string|null;distanceKm:number|null;
 confidence:'regional-range-candidate'|'biome-context-only'|'not-established';
 recipe:RegionalRecipeSelection|null;
}
const explicitKeys=['referenceScene','geographicPilot','expansion','wave1','alpine','treeStudy','labCandidate','encounter','workbench','fieldStudy','artPass','rainforest','pretty','composition','groundLighting','illumination','alpineArt','meadowField','palette','backdrop'];
export function automaticSceneUrl(search:string,enabled:boolean){
 const q=new URLSearchParams(search);q.delete('autoEnvironment');
 if(enabled){for(const key of explicitKeys)q.delete(key);q.set('autoEnvironment','bounded-auto-v1');}
 return '/explore?'+q;
}
export function geographicDistanceKm(a:{lat:number;lon:number},b:{lat:number;lon:number}){
 const rad=Math.PI/180,lat=(b.lat-a.lat)*rad,lon=(b.lon-a.lon)*rad;
 const h=Math.sin(lat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(lon/2)**2;
 return 6371*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h))));
}
export function geographicRecipeTile(p:{lat:number;lon:number}){
 const lon=((p.lon+180)%360+360)%360-180,step=policy.coordinateTileDegrees;
 return Math.min(Math.ceil(180/step)-1,Math.floor((p.lat+90)/step))+':'+Math.floor((lon+180)/step);
}
/** Pure routing decision; no Three.js, renderer imports, nearest-region guessing or network. */
export function resolveBoundedEnvironment(r:BoundedContext,search:string,world=false):AutomaticDecision|null{
 const q=new URLSearchParams(search);if(!q.has('autoEnvironment'))return null;
 const version=world?'global-auto-v1':'bounded-auto-v1';
 const base:AutomaticDecision={policyVersion:version,requestedVersion:q.get('autoEnvironment'),status:'fallback',code:'outside-rollout',explanation:'No supported recipe applies; retaining the existing geographic fallback.',ruleId:null,distanceKm:null,confidence:'not-established',recipe:null};
 const stop=(code:string,explanation:string):AutomaticDecision=>({...base,code,explanation});
 if(explicitKeys.some(key=>q.has(key)))return {...stop('explicit-selection','An explicit reference or study takes priority over automatic selection.'),status:'explicit-selection'};
 if(q.getAll('autoEnvironment').length!==1||q.get('autoEnvironment')!==version)return stop('invalid-version','Unknown or repeated automatic-resolver version; retaining the existing fallback.');
 const p=r.location,g=r.ecoregion;
 if(!p||!Number.isFinite(p.lat)||!Number.isFinite(p.lon)||Math.abs(p.lat)>90||Math.abs(p.lon)>180)return stop('invalid-location','Valid coordinates are required for bounded automatic selection.');
 if(!g||g.ECO_ID===0||!g.REALM||r.ecologicalStatus==='insufficient_data')return stop('missing-geography','No supported terrestrial ecological context; no regional recipe is inferred.');
 if(!world&&!r.botanicalArea?.code)return stop('missing-botanical-area','The botanical-country lookup is missing; no nearest-country substitution is made.');
 if(r.environment?.unvalidated.length)return stop('unmeasured-filter','Requested environmental filters lack observations; automatic selection is withheld.');
 const rules=policy.rules.map(rule=>({rule,trial:geographicPilotSites.find(site=>site.id===rule.trialId)!}));
 const family=geographicPilotSites.find(site=>site.biome===g.BIOME_NUM)?.family;
 const match=world?(family?{rule:{trialId:'global:'+g.ECO_ID},trial:{id:'global:'+g.ECO_ID,name:g.ECO_NAME??family,family,biome:g.BIOME_NUM,eco:g.ECO_ID,lat:p.lat,lon:p.lon,area:r.botanicalArea?.code??null}}:undefined):rules.find(({rule,trial})=>trial.eco===g.ECO_ID&&trial.biome===g.BIOME_NUM&&rule.realm===g.REALM&&trial.area===r.botanicalArea!.code);
 if(!match)return base;
 const {rule,trial}=match,distanceKm=geographicDistanceKm(p,trial);
 if(!world&&distanceKm>policy.maxTrialDistanceKm)return {...stop('outside-distance','The location is beyond this rule’s tested rollout envelope; retaining the existing fallback.'),ruleId:rule.trialId,distanceKm};
 const habitat=r.habitat??q.get('habitat')??'forest';
 const openCover=['tundra','prairie','savanna','flooded','montane','desert'].includes(trial.family);
 const habitats=trial.family==='mangrove'?['forest','coastal']:trial.family==='flooded'?['forest','wetland','grassland']:trial.family==='montane'?['forest','grassland','alpine']:openCover?['forest','grassland']:['forest'];
 if(!habitats.includes(habitat))return stop('unsupported-habitat','This habitat is not supported by the selected bounded rule.');
 const candidates=world&&!r.botanicalArea?.code?[]:['tundra','savanna','flooded','montane','desert'].includes(trial.family)?[]:trial.family==='prairie'?
  (trial.eco===389&&r.conditionalStudy?regionalCandidates(r,trial.family).filter(c=>r.landCover?.some(p=>p.growthForm==='tree'&&p.renderEligible&&p.scientificName===c.scientificName)):[]):regionalCandidates(r,trial.family);
 const requiresNamedTrees=['temperate','boreal','conifer','rainforest','mediterranean','mangrove'].includes(trial.family);
 if(!world&&requiresNamedTrees&&!candidates.length)return stop('unsupported-architecture','No supported tree architecture is backed by the actual resolved regional palette.');
 const names=new Set(candidates.map(c=>c.scientificName));
 if(!world&&trial.family==='mediterranean'&&!names.has('Quercus ilex'))return stop('unsupported-architecture','The existing Mediterranean adapter needs a regional holm oak candidate to support its tree composition.');
 const missingDrawable=(r.requestedTreeCount??0)>0&&r.trees&&!r.trees.some(t=>t.species.scientificName&&names.has(t.species.scientificName));
 if(!world&&(requiresNamedTrees||trial.family==='tropicalpine'&&candidates.length>0)&&missingDrawable)return stop('missing-drawable-source','The input scene has no drawable supported regional tree source.');
 const missingHolm=trial.family==='mediterranean'&&(!names.has('Quercus ilex')||(r.requestedTreeCount??0)>0&&r.trees&&!r.trees.some(t=>t.species.scientificName==='Quercus ilex'));
 if(!world&&missingHolm)return stop('missing-drawable-source','The existing Mediterranean adapter needs a drawable regional holm oak. Adjust the source scene inputs or retain the fallback; no substitute species is invented.');
 const growthFormFallback=world&&requiresNamedTrees&&(!candidates.length||missingDrawable||missingHolm)?trial.family==='mangrove'?'mangrove':['boreal','conifer'].includes(trial.family)?'conifer':'broadleaf':undefined;
 const inputSeed=q.get('seed')??'42',tile=geographicRecipeTile(p);
 const identity:RegionalRecipeSelection['renderedTreeIdentity']=trial.family==='dryforest'?'unnamed-seasonal-growth-forms':trial.family==='tropicalpine'&&!candidates.length?'unnamed-conifer-growth-forms':openCover?(candidates.length?'conditional-regional-trees':'none'):'regional-candidate-architecture';
 const recipe:RegionalRecipeSelection={schemaVersion:1,version,status:'experimental-unreviewed',...(growthFormFallback?{growthFormFallback}:{}),site:{...trial,id:'auto:'+rule.trialId,name:(g.ECO_NAME??trial.name)+(world?' · biome art encounter':' · bounded automatic'),lat:p.lat,lon:p.lon},inputSeed,effectiveSeed:String(hashSeed(inputSeed+'|'+version+'|'+trial.family+'|'+g.ECO_ID+'|'+(r.botanicalArea?.code??'unknown')+'|'+tile)),eligibleTreeCandidates:growthFormFallback?[]:candidates,renderedTreeIdentity:growthFormFallback==='conifer'?'unnamed-conifer-growth-forms':growthFormFallback==='mangrove'?'unnamed-mangrove-growth-forms':growthFormFallback?'unnamed-broadleaf-growth-forms':identity,limitations:[...(world?['Global biome art recipe; geographic terrain, current land cover and local abundance are unmeasured.','Missing compatible catalogue entries use explicitly unnamed biome growth forms, not invented species.']:policy.limits),'Country-native candidates are not verified at this point. Tree anatomy and unnamed low-cover forms remain approximations.','The selected encounter remains artistically unreviewed; reference lighting is not inferred local weather or time of day.',...(trial.family==='prairie'?[trial.eco===389?'Oklahoma plants are regional ecological-site candidates, not point observations. Bottomland trees require the explicit conditional study toggle; no local drainage is measured.':'No regional nonwoody catalogue is loaded: grass and forbs remain unnamed functional forms, with no Oklahoma woody plants or location-conditioned hills artwork imported.']:[]),...(trial.family==='mediterranean'?['Only source-backed Quercus ilex/suber candidates feed the existing oak composition. Shrubs and ground cover are unnamed functional forms; limestone terrain and habitat fields remain synthetic.','The Hérault matte is withheld outside its existing 0.08-degree source-location envelope. No local topography, lithology or coast is inferred from this shared garrigue recipe.']:[]),...(['savanna','flooded','montane','desert'].includes(trial.family)?['Ground cover is an unnamed functional-form transfer. Regional trees are withheld; terrain, rock, soil and hydrology are synthetic, not measured.']:[]),...(trial.family==='dryforest'?['Trees are explicitly unnamed seasonal growth forms. The accepted Guanacaste/gumbo-limbo identities, flowering and Costa Rica matte are withheld.']:[]),...(trial.family==='tropicalpine'?['Eligible local pines are used only when source-backed; otherwise the tree architecture is explicitly an unnamed conifer growth form. No Guatemalan species are imported.']:[]),...(trial.family==='mangrove'?['Country-native supported mangrove root profiles only. Tide, salinity and shoreline are unmeasured; water color remains environment-derived.']:[]),...(trial.family==='rainforest'?['Regional candidates use shared architecture approximations; no Amazon species list or foreign regional matte is imported.']:[]),...(trial.family==='conifer'?['Genus-conditioned conifer structure and shared needle artwork are approximations; local canopy composition is unverified.']:[])]};
 return {...base,status:'selected',code:'supported-regional-transfer',explanation:world?'Art encounter selected from the source biome. Regional candidates are used where supported; missing tree data uses labelled unnamed growth forms.':['dryforest','tropicalpine','savanna','flooded','montane','desert'].includes(trial.family)?'Source classification and regional gates support this existing adapter. Named candidates and explicitly unnamed functional forms are distinguished; local habitat, terrain and abundance remain unverified.':trial.family==='tundra'?'Source tundra classification supports a treeless low-cover study; no named local flora are asserted.':trial.family==='prairie'?'Source grassland classification supports the shared open prairie recipe. Named plants are regional candidates only where a catalogue is available; woody cover is conditional.':'Regional candidate and architecture checks passed; the matching shared forest recipe is selected.',ruleId:rule.trialId,distanceKm:world?null:distanceKm,confidence:growthFormFallback?'biome-context-only':['none','unnamed-seasonal-growth-forms','unnamed-conifer-growth-forms'].includes(identity)?'biome-context-only':'regional-range-candidate',recipe};
}

/** Forward only the recognized explicit opt-in through ordinary map navigation. */
export function automaticModeSuffix(search:string){const q=new URLSearchParams(search);return q.getAll('autoEnvironment').length===1&&['bounded-auto-v1','global-auto-v1'].includes(q.get('autoEnvironment')??'')?'&autoEnvironment='+q.get('autoEnvironment'):'';}

export function resolveAutomaticEnvironment(r:BoundedContext,search:string){return resolveBoundedEnvironment(r,search,new URLSearchParams(search).get('autoEnvironment')==='global-auto-v1');}
export function globalArtUrl(search:string){const q=new URLSearchParams(automaticSceneUrl(search,true).split('?')[1]);q.set('autoEnvironment','global-auto-v1');return '/explore?'+q;}
export function artHabitat(requested:string,biome:number|undefined,search:string){const q=new URLSearchParams(search);return q.get('autoEnvironment')==='global-auto-v1'&&!explicitKeys.some(key=>q.has(key))&&requested==='forest'?(biome===14?'coastal':biome===9?'wetland':[7,8,10,11,13].includes(biome??0)?'grassland':'forest'):requested;}
