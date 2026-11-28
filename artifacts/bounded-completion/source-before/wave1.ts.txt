import {regionalPilotStudy} from './regional-pilot-study';
import {mediterraneanStudy} from './mediterranean-adapter';
import {tropicalDryStudy} from './tropical-dry-forest';
import {andeanStudy} from './andean-puna';
import {tropicalPineStudy} from './tropical-pine';
import {desertStudy} from './wave1-desert';
import {mangroveStudy} from './wave1-mangrove';
import {floodedStudy} from './wave1-flooded';
import type {SceneRecipe} from './recipe';
import {rebuiltStudy} from './wave1-rebuild';
import {borealStudy} from './wave2-boreal';
import {temperateStudy} from './wave2-temperate';
import {tundraStudy} from './wave2-tundra';
import {prairieStudy} from './wave3-prairie';
import {resolveEnvironmentSelection,type EnvironmentRoute} from './environment-registry';
/** Opt-in presentation only; RESOLVE gate cannot be bypassed by a query string. */
export function wave1Study(recipe:SceneRecipe,search:string,route:EnvironmentRoute=resolveEnvironmentSelection(recipe,search).route){
 if(route.kind!=='wave')return;
 const regional=route.regional??route.pilot;
 const transfer=regional?regionalPilotStudy(regional):undefined;
 const original=transfer??(regional?.site.family==='savanna'?prairieStudy:regional?.site.family==='montane'?andeanStudy:undefined)??[desertStudy,mangroveStudy,floodedStudy,borealStudy,temperateStudy,tundraStudy,prairieStudy,mediterraneanStudy,tropicalDryStudy,andeanStudy,tropicalPineStudy].find(s=>s.id===route.adapter);
 const study=original&&route.variant==='rebuild'?rebuiltStudy(original.id as 'desert'|'mangrove'|'flooded',original.biome):original;
 if(!study||!regional)return study;
 return {...study,compose:(r:SceneRecipe)=>study.compose({...r,seed:regional.effectiveSeed}),mount:(...args:Parameters<typeof study.mount>)=>{
  const dispose=study.mount(...args);if(route.pilot)args[0].userData.geographicPilot=route.pilot;else args[0].userData.regionalRecipe=regional;return dispose;
 }};
}
