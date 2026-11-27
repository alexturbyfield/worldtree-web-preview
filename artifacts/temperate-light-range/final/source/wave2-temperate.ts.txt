import * as T from 'three';
import type {SceneRecipe} from './recipe';
import {makeExpansionPlan,expansionHeight,mountExpansionBase,type ExpansionPalette} from './wave2-shared';
import {composeTemperateConcept,mountTemperateFloor,installTemperateLightResponse} from './wave2-temperate-concept';
import {mountTemperateSurfaces,installTemperateMossCommunities} from './wave2-temperate-surfaces';
import {mountTemperateDepth} from './wave2-temperate-depth';
const palette:ExpansionPalette={ground:['#2c402d','#767c46','#c6bd78'],soil:'#947c52',air:'#91aaa0',sun:'#ffe2ae',foliage:['#203e35','#69823f','#d1d17d'],texture:'/assets/puget-v1/forest-floor.png'};
export const temperatePlan=(r:SceneRecipe)=>{const p=makeExpansionPlan('temperate',4,r.seed,.62);p.camera.target=[0,expansionHeight(p,0,-55)+2.3,-55];return p;};
export const temperateStudy={id:'temperate',biome:4,compose:(r:SceneRecipe)=>composeTemperateConcept(r,temperatePlan(r)),camera:(r:SceneRecipe)=>temperatePlan(r).camera,mount:(s:T.Scene,r:SceneRecipe,sun:T.DirectionalLight,fill:T.DirectionalLight)=>{
 const p=temperatePlan(r),base=mountExpansionBase(s,r,p,sun,fill,palette,{concept:true,canopy:false,groundScale:3,sunDirection:[-28,70,18],surfaceArtwork:{texture:'/assets/wave2-autonomous/temperate-floor-v1.png',worldScale:2.4}}),floor=mountTemperateFloor(s,p),light=installTemperateLightResponse(s),surfaces=mountTemperateSurfaces(s,r,p);
 // The old 128 m shadow projection sacrificed near-floor detail. Restrict this
 // opt-in reference-state key to the actual focal stand; preserve world shadows.
 sun.target.position.set(0,1,8);sun.intensity=4.1;sun.shadow.intensity=.78;
 const shadowResolution=typeof window!=='undefined'&&window.matchMedia('(pointer:coarse)').matches?1024:2048;
 sun.shadow.mapSize.set(shadowResolution,shadowResolution);sun.shadow.normalBias=.018;
 Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30,far:145});sun.shadow.camera.updateProjectionMatrix();
 fill.intensity=.16;s.children.forEach(o=>{if(o instanceof T.HemisphereLight)o.intensity=.55;});
 const moss=installTemperateMossCommunities(s,r,p,base.groundMaterial,base.load('/assets/wave2-autonomous/forest-moss-v1.png'),sun);
 const continuation=mountTemperateDepth(s,r,p);
 s.userData.wave2Concept={biome:'temperate',version:'connected-woodland-light-4',architecture:'Species-conditioned scaffold; broad spreading oak, upward beech, slender drooping birch; elliptic leaf rendering approximate',ecology:'Source regional candidates and unnamed fern/leafy functional forms, not local occurrence evidence',states:{season:'leaf-on reference',weather:'clear reference',timeOfDay:'warm upper-left directional reference state'},staging:{center:[0,26],radius:1.4,height:1.8},trees:r.trees.length,lighting:{shadowSpanMeters:60,shadowResolution,key:[-28,70,18],target:[0,1,8],sun:4.1,fill:.16,hemisphere:.55,shadowStrength:.78,selection:'Alpha-cutout physical leaf shadows received by wood; measured crown highlight calibration, not human approval'}};
 base.finish();return()=>{continuation();moss();surfaces();light();floor();base.dispose();};
}};

