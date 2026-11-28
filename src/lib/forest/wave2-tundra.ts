import * as T from 'three';
import type {SceneRecipe} from './recipe';
import {makeExpansionPlan,mountExpansionBase,type ExpansionPalette} from './wave2-shared';
import {mountTundraHeath} from './wave2-tundra-heath';
const plan=(r:SceneRecipe)=>{const p=makeExpansionPlan('tundra',11,r.seed,2.1);p.camera.target[1]-=2.5;return p;};
export const tundraStudy={id:'tundra',biome:11,compose:(r:SceneRecipe)=>({...r,trees:[],purpose:'visual_laboratory' as const,distribution:'Treeless tundra art study; no named ground flora or measured substrate inferred'}),camera:(r:SceneRecipe)=>plan(r).camera,mount:(s:T.Scene,r:SceneRecipe,sun:T.DirectionalLight,fill:T.DirectionalLight)=>{
 const sparse=r.ecoregion?.REALM==='Antarctica'||/Arctic desert|Antarctic|ice cap/i.test(r.ecoregion?.ECO_NAME??''),palette:ExpansionPalette=sparse?{ground:['#585d57','#8a8c7b','#b2b19c'],soil:'#8a8071',air:'#a5bac2',sun:'#fff0ce',foliage:['#535e4e','#7b8564','#a4ab7c'],texture:'/assets/wave1-detail/arid-sediment-v1.webp'}:{ground:['#474e3b','#85845a','#b5ad73'],soil:'#967554',air:'#a8bec3',sun:'#ffe2aa',foliage:['#455b44','#7d8151','#b0a766'],texture:'/assets/puget-v1/meadow.png'};
 const p=plan(r),base=mountExpansionBase(s,r,p,sun,fill,palette,{concept:true,canopy:false,sunDirection:[48,38,18]}),floor=mountTundraHeath(s,p,sparse,base.load);
 sun.position.set(48,38,18);sun.target.position.set(0,0,-15);sun.intensity=3.0;sun.shadow.intensity=.68;
 s.userData.wave1.layers={season:'Independent reference pigment state: warm russet heath, local phenology unverified',weather:'Independent clear reference state',timeOfDay:'Independent low warm sun reference state'};
 s.userData.wave2Concept={biome:'tundra',representation:'True irregular twig-tube dwarf shrubs with small curved leaves; separate near/middle geometry LOD, continuous low substrate and short curved sedge functional forms. No atlas or crossed planes.',ecology:'Unnamed dwarf-shrub and seedhead functional forms; no verified local taxon or phenology asserted',terrainEvidence:'Existing shallow synthetic base relief; rejected cover-field shoulders disabled',sparseArcticHabitat:sparse,referenceLighting:'Warm key from upper right, independent time-of-day layer',seasonalState:'Russet reference state, not permanent biome identity',cameraChange:'Retains C3 concept-fit camera exactly: 1.7m eye with target lowered2.5m',counts:s.userData.expansionDressing.instances};
 base.finish();return()=>{floor();base.dispose();};}};

