import policy from './bounded-resolver-policy.json';
import {geographicPilotSites,regionalCandidates,type PilotContext,type RegionalRecipeSelection} from './geographic-pilot';
import {hashSeed} from './random';

export const boundedResolverPolicy=policy;
export interface BoundedContext extends PilotContext {
 ecoregion:(NonNullable<PilotContext['ecoregion']>&{REALM:string;ECO_NAME?:string})|null;
 botanicalArea?:{code:string;name:string}|null;
 ecologicalStatus?:string;requestedTreeCount?:number;
 trees?:{species:{scientificName:string|null}}[];
}
export interface AutomaticDecision {
 policyVersion:'bounded-auto-v1';requestedVersion:string|null;
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
export function resolveBoundedEnvironment(r:BoundedContext,search:string):AutomaticDecision|null{
 const q=new URLSearchParams(search);if(!q.has('autoEnvironment'))return null;
 const base:AutomaticDecision={policyVersion:'bounded-auto-v1',requestedVersion:q.get('autoEnvironment'),status:'fallback',code:'outside-rollout',explanation:'No bounded rule applies; retaining the existing geographic fallback.',ruleId:null,distanceKm:null,confidence:'not-established',recipe:null};
 const stop=(code:string,explanation:string):AutomaticDecision=>({...base,code,explanation});
 if(explicitKeys.some(key=>q.has(key)))return {...stop('explicit-selection','An explicit reference or study takes priority over automatic selection.'),status:'explicit-selection'};
 if(q.getAll('autoEnvironment').length!==1||q.get('autoEnvironment')!==policy.version)return stop('invalid-version','Unknown or repeated automatic-resolver version; retaining the existing fallback.');
 const p=r.location,g=r.ecoregion;
 if(!p||!Number.isFinite(p.lat)||!Number.isFinite(p.lon)||Math.abs(p.lat)>90||Math.abs(p.lon)>180)return stop('invalid-location','Valid coordinates are required for bounded automatic selection.');
 if(!g||g.ECO_ID===0||!g.REALM||r.ecologicalStatus==='insufficient_data')return stop('missing-geography','No supported terrestrial ecological context; no regional recipe is inferred.');
 if(!r.botanicalArea?.code)return stop('missing-botanical-area','The botanical-country lookup is missing; no nearest-country substitution is made.');
 if(r.environment?.unvalidated.length)return stop('unmeasured-filter','Requested environmental filters lack observations; automatic selection is withheld.');
 const rules=policy.rules.map(rule=>({rule,trial:geographicPilotSites.find(site=>site.id===rule.trialId)!}));
 const match=rules.find(({rule,trial})=>['temperate','boreal','tundra'].includes(trial.family)&&trial.eco===g.ECO_ID&&trial.biome===g.BIOME_NUM&&rule.realm===g.REALM&&trial.area===r.botanicalArea!.code);
 if(!match)return base;
 const {rule,trial}=match,distanceKm=geographicDistanceKm(p,trial);
 if(distanceKm>policy.maxTrialDistanceKm)return {...stop('outside-distance','The location is beyond this rule’s tested rollout envelope; retaining the existing fallback.'),ruleId:rule.trialId,distanceKm};
 const habitat=r.habitat??q.get('habitat')??'forest';
 if(trial.family==='tundra'?!['forest','grassland'].includes(habitat):habitat!=='forest')return stop('unsupported-habitat','This habitat is not supported by the selected bounded rule.');
 const candidates=trial.family==='tundra'?[]:regionalCandidates(r,trial.family);
 if(trial.family!=='tundra'&&!candidates.length)return stop('unsupported-architecture','No supported tree architecture is backed by the actual resolved regional palette.');
 const names=new Set(candidates.map(c=>c.scientificName));
 if(trial.family!=='tundra'&&(r.requestedTreeCount??0)>0&&r.trees&&!r.trees.some(t=>t.species.scientificName&&names.has(t.species.scientificName)))return stop('missing-drawable-source','The input scene has no drawable supported regional tree source.');
 const inputSeed=q.get('seed')??'42',tile=geographicRecipeTile(p);
 const recipe:RegionalRecipeSelection={schemaVersion:1,version:'bounded-auto-v1',status:'experimental-unreviewed',site:{...trial,id:'auto:'+rule.trialId,name:(g.ECO_NAME??trial.name)+' · bounded automatic',lat:p.lat,lon:p.lon},inputSeed,effectiveSeed:String(hashSeed(inputSeed+'|bounded-auto-v1|'+trial.family+'|'+g.ECO_ID+'|'+r.botanicalArea.code+'|'+tile)),eligibleTreeCandidates:candidates,renderedTreeIdentity:trial.family==='tundra'?'none':'regional-candidate-architecture',limitations:[...policy.limits,'Country-native candidates are not verified at this point. Tree anatomy and unnamed low-cover forms remain approximations.','The selected encounter remains artistically unreviewed; reference lighting is not inferred local weather or time of day.']};
 return {...base,status:'selected',code:'supported-regional-transfer',explanation:trial.family==='tundra'?'Source tundra classification supports a treeless low-cover study; no named local flora are asserted.':'Regional candidate and architecture checks passed; the matching shared forest recipe is selected.',ruleId:rule.trialId,distanceKm,confidence:trial.family==='tundra'?'biome-context-only':'regional-range-candidate',recipe};
}

/** Forward only the recognized explicit opt-in through ordinary map navigation. */
export function automaticModeSuffix(search:string){const q=new URLSearchParams(search);return q.getAll('autoEnvironment').length===1&&q.get('autoEnvironment')==='bounded-auto-v1'?'&autoEnvironment=bounded-auto-v1':'';}
