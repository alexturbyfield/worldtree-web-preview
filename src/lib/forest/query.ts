import type {EnvironmentFilters,VegetationHabitat} from '../global-types';
export interface SceneQuery {lat:number;lon:number;habitat:VegetationHabitat;seed:string;density:number;environment:EnvironmentFilters;revisions:Record<number,number>;conditional:boolean;structureSeed?:string;appearanceSeed?:string;renderMode?:'painterly'|'diagram';stylization?:number;foliageDensity?:number;asymmetry?:number}
const modes=['forest','urban','grassland','wetland','coastal','alpine'];
export function parseSceneQuery(p:Pick<URLSearchParams,'get'>):SceneQuery {
  const lat=Number(p.get('lat')),lon=Number(p.get('lon'));
  if(p.get('lat')===null||p.get('lon')===null||!p.get('lat')?.trim()||!p.get('lon')?.trim()||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw new Error('A scene needs valid latitude and longitude. Return to the map to select a location.');
  const habitat=(p.get('habitat')??'forest') as VegetationHabitat;if(!modes.includes(habitat))throw new Error('Unsupported habitat.');
  const density=Number(p.get('density')??36);if(!Number.isInteger(density)||density<0||density>60)throw new Error('Density must be 0–60 trees.');
  const environment:EnvironmentFilters={moisture:(p.get('moisture')??'any') as EnvironmentFilters['moisture'],coastal:(p.get('coastal')??'any') as EnvironmentFilters['coastal'],seasonality:(p.get('seasonality')??'any') as EnvironmentFilters['seasonality'],elevationM:p.get('elevation')===null?null:Number(p.get('elevation'))};
  if(!['any','dry','mesic','wet'].includes(environment.moisture)||!['any','coastal','inland'].includes(environment.coastal)||!['any','evergreen','deciduous'].includes(environment.seasonality)||(environment.elevationM!==null&&(!Number.isFinite(environment.elevationM)||environment.elevationM< -500||environment.elevationM>9000)))throw new Error('Invalid environmental constraint.');
  const revisions:Record<number,number>={};
  const values=p.get('r');if(values){if(values.length>600)throw new Error('Too many individual revisions.');for(const pair of values.split(',')){if(!/^\d{1,2}:\d{1,4}$/.test(pair))throw new Error('Invalid individual revision.');const [i,n]=pair.split(':').map(Number);if(i>59||n>1000)throw new Error('Individual revision out of range.');revisions[i]=n;}}
  const renderMode=p.get('mode')??'painterly';if(!['painterly','diagram'].includes(renderMode))throw new Error('Unknown renderer mode.');
  const art=Object.fromEntries(['stylization','foliageDensity','asymmetry'].filter(k=>p.get(k)!==null).map(k=>[k,Number(p.get(k))]));
  if(Object.values(art).some(v=>!Number.isFinite(v)||v<0||v>1))throw new Error('Art controls must be 0–1.');
  return {lat,lon,habitat,seed:(p.get('seed')??'42').slice(0,64),density,environment,revisions,conditional:p.get('conditional')==='1',structureSeed:(p.get('structure')??'grove-1').slice(0,64),appearanceSeed:(p.get('appearance')??'pigment-1').slice(0,64),renderMode:renderMode as 'painterly'|'diagram',...art};
}
export function sceneQuery(q:SceneQuery):string {
  const p=new URLSearchParams({lat:String(q.lat),lon:String(q.lon),habitat:q.habitat,seed:q.seed,density:String(q.density)});
  for(const key of ['moisture','coastal','seasonality'] as const)if(q.environment[key]!=='any')p.set(key,q.environment[key]);
  if(q.environment.elevationM!==null)p.set('elevation',String(q.environment.elevationM));
  if(q.structureSeed!==undefined)p.set('structure',q.structureSeed);if(q.appearanceSeed!==undefined)p.set('appearance',q.appearanceSeed);if(q.renderMode)p.set('mode',q.renderMode);
  for(const key of ['stylization','foliageDensity','asymmetry'] as const)if(q[key]!==undefined)p.set(key,String(q[key]));
  const r=Object.entries(q.revisions).filter(([,n])=>n>0).sort(([a],[b])=>Number(a)-Number(b)).map(([i,n])=>`${i}:${n}`).join(',');if(r)p.set('r',r);
  if(q.conditional)p.set('conditional','1');return p.toString();
}
