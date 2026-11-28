import * as T from 'three';
import {unnamedBiomeTree} from './unnamed-biome-tree';
import type {SceneRecipe,SceneTree} from './recipe';
import type {RegionalRecipeSelection} from './geographic-pilot';
import {randomSource} from './random';
import {makeExpansionPlan,expansionHeight,mountExpansionBase,type ExpansionPalette} from './wave2-shared';
import {borealStudy} from './wave2-boreal';
import {borealTree,borealEmptyCanopy,mountBorealNeedles} from './wave2-boreal-geometry';
import {mountTemperateFloor} from './wave2-temperate-concept';
import {mountTemperateDepth} from './wave2-temperate-depth';

/** Portable transfer of existing forest components, never a new species model.
 * Used only by the explicit pilot; accepted regional adapters remain unchanged. */
export function regionalPilotStudy(pilot:RegionalRecipeSelection){
 const family=pilot.site.family,moist=family==='rainforest'||pilot.growthFormFallback==='broadleaf';
 if(family==='conifer'&&!pilot.growthFormFallback)return {...borealStudy,id:'conifer',biome:5};
 if(!moist&&family!=='tropicalpine'&&pilot.growthFormFallback!=='conifer')return;
 const plan=(r:SceneRecipe)=>{const p=makeExpansionPlan(moist?'temperate':'boreal',pilot.site.biome,r.seed,.65);p.camera.position=[0,expansionHeight(p,0,34)+1.7,34];p.camera.target=[0,expansionHeight(p,0,-55)+(moist?6:3.3),-55];return p;};
 const compose=(r:SceneRecipe):SceneRecipe=>{
  const p=plan(r),rng=randomSource(r.seed+'|regional-forest-transfer'),eligible=new Set(pilot.eligibleTreeCandidates.map(t=>t.scientificName));
  const pool=pilot.growthFormFallback==='broadleaf'?[unnamedBiomeTree(r,'broadleaf')]:r.trees.filter(t=>t.species.scientificName&&eligible.has(t.species.scientificName)),trees:SceneTree[]=[];
  if(r.requestedTreeCount===0)return {...r,trees};
  for(let i=0;i<48;i++){
   const source=pool[i%pool.length];if(moist&&!source)break;
   const x=(i%2?1:-1)*(i<6?7+rng()*4:8+rng()*55),z=i<6?26-Math.floor(i/2)*15:12-rng()*170,position:[number,number,number]=[x,expansionHeight(p,x,z),z];
   if(moist)trees.push({...source,id:source.id+'-regional-presentation-'+i,index:i,position,rotation:rng()*6.283});
   else{
    const seed=r.seed+'|regional-conifer-'+i,model=borealTree(seed,source?.species.scientificName??'Pinus',i<6?1:.82,i<2);
    trees.push({id:'regional-conifer-'+i,index:i,seed,revision:0,position,rotation:rng()*6.283,model,canopy:borealEmptyCanopy(model),foliageCards:[],species:source?.species??{id:'unnamed-conifer-growth-form',scientificName:null,commonName:'Unnamed conifer growth form',confidence:'biome design fallback',evidenceLevel:'biome_realm_fallback',origin:'Source biome supports conifer forest context; species identity, local occurrence and dimensions are not established',sources:[],visual:{presetId:'pine',fallback:true,reason:'Generic conifer branching profile; not a named regional pine'}}});
   }
  }
  return {...r,trees,purpose:'visual_laboratory',distribution:'Synthetic layered forest composition using regional input candidates or explicitly unnamed conifer functional forms; not observed abundance.'};
 };
 const palette:ExpansionPalette=moist?{ground:['#273c2b','#577446','#84964e'],soil:'#6f5135',air:'#829f8a',sun:'#ffe3a8',foliage:['#254535','#668658','#b4bd78']}:{ground:['#48563d','#8a8651','#c7ae73'],soil:'#97714b',air:'#92aaa7',sun:'#ffe0a6',foliage:['#314d3b','#73854b','#b5bd72']};
 return {id:family,biome:pilot.site.biome,compose,camera:(r:SceneRecipe)=>plan(r).camera,mount:(scene:T.Scene,r:SceneRecipe,sun:T.DirectionalLight,fill:T.DirectionalLight)=>{
  const p=plan(r),base=mountExpansionBase(scene,r,p,sun,fill,palette,{concept:true,canopy:false,surfaceArtwork:{texture:moist?'/assets/wave2-autonomous/temperate-floor-v1.png':'/assets/tropical-pine/floor-albedo.webp',worldScale:2.4}});
  const floor=mountTemperateFloor(scene,p),needles=moist?()=>{}:mountBorealNeedles(scene,r,p,base.load('/assets/wave2-concepts/spruce-sprays-v2.png')),depth=moist?mountTemperateDepth(scene,r,p):()=>{};
  scene.userData.regionalTransfer={family,sourceBiome:pilot.site.biome,treeIdentity:pilot.renderedTreeIdentity,limits:'Existing geometry/needle/forest-floor representations are approximations; no geographically conditioned foreign matte, no verified local cover or tree dimensions'};base.finish();
  return()=>{depth();needles();floor();base.dispose();};
 }};
}
