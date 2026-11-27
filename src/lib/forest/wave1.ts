import {desertStudy} from './wave1-desert';
import {mangroveStudy} from './wave1-mangrove';
import {floodedStudy} from './wave1-flooded';
import type {SceneRecipe} from './recipe';
import {rebuiltStudy} from './wave1-rebuild';
import {borealStudy} from './wave2-boreal';
import {temperateStudy} from './wave2-temperate';
import {tundraStudy} from './wave2-tundra';
import {prairieStudy} from './wave3-prairie';
/** Opt-in presentation only; RESOLVE gate cannot be bypassed by a query string. */
export function wave1Study(recipe:SceneRecipe,search:string){const params=new URLSearchParams(search),expansion=params.get('expansion');if(recipe.ecoregion?.ECO_ID!==0){const next=[borealStudy,temperateStudy,tundraStudy,prairieStudy].find(s=>s.id===expansion&&recipe.ecoregion?.BIOME_NUM===s.biome);if(next)return next;}const id=params.get('wave1'),original=[desertStudy,mangroveStudy,floodedStudy].find(s=>s.id===id&&recipe.ecoregion?.BIOME_NUM===s.biome);return original&&params.get('fieldStudy')==='rebuild'?rebuiltStudy(original.id as 'desert'|'mangrove'|'flooded',original.biome):original;}
