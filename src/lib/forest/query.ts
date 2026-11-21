import type {EnvironmentFilters,VegetationHabitat} from '../global-types';
export interface SceneQuery {lat:number;lon:number;habitat:VegetationHabitat;seed:string;density:number;environment:EnvironmentFilters;revisions:Record<number,number>;conditional:boolean}
const modes=['forest','urban','grassland','wetland','coastal','alpine'];
export function parseSceneQuery(p:Pick<URLSearchParams,'get'>):SceneQuery {
  const lat=Number(p.get('lat')),lon=Number(p.get('lon'));
  if(p.get('lat')===null||p.get('lon')===null||!p.get('lat')?.trim()||!p.get('lon')?.trim()||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw new Error('A scene needs valid latitude and longitude. Return to the map to select a location.');
  const habitat=(p.get('habitat')??'forest') as VegetationHabitat;if(!modes.includes(habitat))throw new Error('Unsupported habitat.');
  const density=Number(p.get('density')??28);if(!Number.isInteger(density)||density<0||density>40)throw new Error('Density must be 0–40 trees.');
  const environment:EnvironmentFilters={moisture:(p.get('moisture')??'any') as EnvironmentFilters['moisture'],coastal:(p.get('coastal')??'any') as EnvironmentFilters['coastal'],seasonality:(p.get('seasonality')??'any') as EnvironmentFilters['seasonality'],elevationM:p.get('elevation')===null?null:Number(p.get('elevation'))};
  if(!['any','dry','mesic','wet'].includes(environment.moisture)||!['any','coastal','inland'].includes(environment.coastal)||!['any','evergreen','deciduous'].includes(environment.seasonality)||(environment.elevationM!==null&&(!Number.isFinite(environment.elevationM)||environment.elevationM< -500||environment.elevationM>9000)))throw new Error('Invalid environmental constraint.');
  const revisions:Record<number,number>={};
  const values=p.get('r');if(values){if(values.length>500)throw new Error('Too many individual revisions.');for(const pair of values.split(',')){if(!/^\d{1,2}:\d{1,4}$/.test(pair))throw new Error('Invalid individual revision.');const [i,n]=pair.split(':').map(Number);if(i>39||n>1000)throw new Error('Individual revision out of range.');revisions[i]=n;}}
  return {lat,lon,habitat,seed:(p.get('seed')??'42').slice(0,64),density,environment,revisions,conditional:p.get('conditional')==='1'};
}
export function sceneQuery(q:SceneQuery):string {
  const p=new URLSearchParams({lat:String(q.lat),lon:String(q.lon),habitat:q.habitat,seed:q.seed,density:String(q.density)});
  for(const key of ['moisture','coastal','seasonality'] as const)if(q.environment[key]!=='any')p.set(key,q.environment[key]);
  if(q.environment.elevationM!==null)p.set('elevation',String(q.environment.elevationM));
  const r=Object.entries(q.revisions).filter(([,n])=>n>0).sort(([a],[b])=>Number(a)-Number(b)).map(([i,n])=>`${i}:${n}`).join(',');if(r)p.set('r',r);
  if(q.conditional)p.set('conditional','1');return p.toString();
}
