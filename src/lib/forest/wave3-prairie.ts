import {prairieMaterialUniforms,bindPrairieMaterials} from './prairie-material-bindings';
import {installGroundLighting,type groundCompositionField} from './environment-foundations';
import {finishPrairieTree} from './prairie-tree-finish';
import * as T from 'three';
import type {SceneRecipe} from './recipe';
import {hashSeed,randomSource} from './random';
import {makeExpansionPlan,mountExpansionBase,type ExpansionPalette} from './wave2-shared';
import {prairieLandscape} from './prairie-landscape';
import {mountPrairieDressing,prairiePigment} from './wave3-prairie-dressing';

const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(a:number,b:number,v:number)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
function noise(x:number,z:number){
 const hash=(a:number,b:number)=>{const v=Math.sin(a*127.1+b*311.7)*43758.5453;return v-Math.floor(v);};
 const i=Math.floor(x),j=Math.floor(z),u=smooth(0,1,x-i),v=smooth(0,1,z-j);
 return (hash(i,j)*(1-u)+hash(i+1,j)*u)*(1-v)+(hash(i,j+1)*(1-u)+hash(i+1,j+1)*u)*v;
}

/** Engine-neutral synthetic community description. No moisture/soil measurement
 * or regional grass species is inferred from these presentation fields. */
export function prairieCommunity(seed:string,x:number,z:number){
 const phase=hashSeed(seed+'|prairie-communities-v1')/4294967296*37;
 const warp=noise(x*.012+phase,z*.013)*26;
 const flow=noise((x+z*.35+warp)*.024+phase,z*.013+phase*.3);
 const moisture=noise(x*.017+phase*.7,z*.022+warp*.01);
 const patch=noise(x*.065+phase,z*.048+warp*.03);
 const growth=clamp(.30+moisture*.42+flow*.30-patch*.16);
 const soil=smooth(.67,.86,patch)*(1-moisture*.55);
 const exposure=clamp(flow*.60+(1-moisture)*.15+patch*.25);
 const staging=(1-smooth(.65,2.2,Math.abs(x)))*(1-smooth(1.0,6.5,Math.abs(z-26)));
 return {growth,moisture,soil,exposure,flow,staging};
}

export function prairiePlan(r:SceneRecipe){
 const p=makeExpansionPlan('prairie',8,r.seed,1.15);p.heightMode='prairie-plain';
 p.camera={position:[0,1.7,34],target:[0,27,-190]};p.inspection={position:[62,38,76],target:[0,0,-24]};return p;
}
const palette:ExpansionPalette={ground:['#385d4b','#748a56','#e7cb85'],soil:'#806948',air:'#a6aebe',sun:'#ffe1a7',foliage:['#385d4b','#748a56','#e7cb85'],texture:'/assets/alpine-meadow/meadow-ground-v1.png'};

/** Place only the optional regional tree study. Roles follow reference relationships,
 * not copied object coordinates. A lower-trunk sightline rejects hidden crowns.
 * The draw/bottomland context remains conditional and synthetic, not a site survey. */
export function composePrairieTrees(r:SceneRecipe):SceneRecipe['trees']{
 if(!r.conditionalStudy||r.ecoregion?.ECO_ID!==389)return [];
 const plan=prairiePlan(r),random=randomSource(r.seed+'|prairie-tree-framing-v1');
 const ground=(x:number,z:number)=>{const f=prairieCommunity(r.seed,x,z);return prairieLandscape(plan,x,z).height+(.12+f.growth*.22)*(1-f.soil)*(1-f.staging*.88);};
 const source=r.trees.filter(t=>r.landCover?.some(p=>p.id===t.species.id&&p.growthForm==='tree'&&p.renderEligible));
 const roles=[{x:-.98,depth:14,spread:5},{x:.70,depth:32,spread:12},{x:-.32,depth:76,spread:30},{x:.28,depth:145,spread:45}];
 const result:SceneRecipe['trees']=[],placed:{x:number;z:number;screenX:number}[]=[];
 for(let i=0;i<Math.min(source.length,roles.length);i++){
  const role=roles[i],tree=source[i];let best:{x:number;y:number;z:number;score:number;screenX:number}|undefined;
  for(let attempt=0;attempt<72;attempt++){
   const depth=role.depth+(random()-.5)*role.spread,screenX=role.x+(random()-.5)*.13,x=screenX*depth*.774,z=34-depth;
   if(z>18&&Math.abs(x)<4)continue;
   const y=ground(x,z),trunkY=y+Math.max(.9,tree.model.dimensions.height*.12);let blocked=false;
   for(let step=1;step<32;step++){
    const t=step/32,rayY=1.7+(trunkY-1.7)*t;
    if(ground(x*t,34+(z-34)*t)>rayY-.08){blocked=true;break;}
   }
   if(blocked)continue;
   const separation=placed.reduce((score,p)=>score+Math.exp(-Math.pow((screenX-p.screenX)/.16,2))*.8,0);
   const shelter=prairieLandscape(plan,x,z).drainage;
   const localHeight=(ground(x-5,z)+ground(x+5,z))*.5-y;
   const score=localHeight*.12+shelter*.5-separation-Math.abs(depth-role.depth)/role.spread*.15;
   if(!best||score>best.score)best={x,y:y-.025,z,score,screenX};
  }
  // Leave a gap rather than installing a crown with a concealed lower trunk.
  if(!best)continue;
  result.push({...tree,position:[best.x,best.y,best.z]});placed.push(best);
 }
 return result;
}

/** Isolated prairie representation study; not a globally promoted recipe. */
export const prairieStudy={id:'prairie',biome:8,
 compose:(r:SceneRecipe):SceneRecipe=>({...r,trees:composePrairieTrees(r).map(finishPrairieTree),purpose:'visual_laboratory',distribution:'Opt-in prairie volume and functional-form construction study; canonical source retained, woody plants not categorically excluded from the biome.',limitations:[...r.limitations,'Prairie terrain and community fields are synthetic art direction, not observed soils, elevation or population data. No named grass/forb species asserted.']}),
 camera:(r:SceneRecipe)=>prairiePlan(r).camera,
 mount:(scene:T.Scene,r:SceneRecipe,sun:T.DirectionalLight,fill:T.DirectionalLight)=>{
  const plan=prairiePlan(r),base=mountExpansionBase(scene,r,plan,sun,fill,palette,{concept:true,canopy:false,sunDirection:[-70,33,25],surfaceArtwork:{texture:palette.texture!,worldScale:5.5}});
  const sky=scene.getObjectByName('expansion-existing-sky');
  if(sky instanceof T.Mesh){sky.renderOrder=-100;(sky.material as T.MeshBasicMaterial).depthTest=false;}
  const resolution=512,span=4096,bytes=new Uint8Array(resolution*resolution*4);
  for(let j=0;j<resolution;j++)for(let i=0;i<resolution;i++){
   const x=((i+.5)/resolution-.5)*span,z=((j+.5)/resolution-.5)*span;
   const original=prairieCommunity(r.seed,x,z),land=prairieLandscape(plan,x,z),distance=Math.hypot(x,z-34),blend=smooth(12,95,distance);
   const f={...original,growth:original.growth*(1-blend*.25)+land.cover*blend*.25,exposure:clamp(original.exposure+land.cover*blend*.16-land.drainage*.10),soil:clamp(original.soil+land.drainage*.22*(1-land.cover))},k=(j*resolution+i)*4;
   bytes.set([f.growth,f.moisture,f.exposure,f.soil].map(v=>Math.round(v*255)),k);
  }
  const field=new T.DataTexture(bytes,resolution,resolution,T.RGBAFormat);field.colorSpace=T.NoColorSpace;field.minFilter=field.magFilter=T.LinearFilter;field.wrapS=field.wrapT=T.ClampToEdgeWrapping;field.generateMipmaps=false;field.needsUpdate=true;
  const materialUniforms=prairieMaterialUniforms();
  const sediment=base.load('/assets/wave1-detail/arid-sediment-v1.webp');
  const material=base.groundMaterial,before=material.onBeforeCompile;material.bumpMap=sediment;material.bumpScale=.018;
  material.onBeforeCompile=function(shader,renderer){before.call(this,shader,renderer);
   prairiePigment(shader,field,base.groundTexture,palette,sediment,materialUniforms);
   shader.fragmentShader=shader.fragmentShader.replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\ndiffuseColor.rgb=prairieRootPigment(exWorld);');
  };
  material.customProgramCacheKey=()=> 'prairie-ground-community-v4';material.needsUpdate=true;
  // A continuous low canopy surface adds coherent volume. It shares vertices,
  // so it cannot create the rejected independent strip/patch facets or gaps.
  scene.traverse(o=>{if(!(o instanceof T.Mesh)||o.name!=='expansion-terrain')return;
   const a=o.geometry.getAttribute('position');for(let i=0;i<a.count;i++){
    const f=prairieCommunity(r.seed,a.getX(i),a.getZ(i));a.setY(i,prairieLandscape(plan,a.getX(i),a.getZ(i)).height+(.12+f.growth*.22)*(1-f.soil)*(1-f.staging*.88));
   }a.needsUpdate=true;o.geometry.computeVertexNormals();o.geometry.computeBoundingSphere();o.castShadow=true;
  });
  const dressing=mountPrairieDressing(scene,plan,palette,field,base.groundTexture,base.load,(x,z)=>prairieCommunity(r.seed,x,z),Boolean(r.landCover?.some(p=>p.growthForm==='shrub')),r.landCover??[],sediment,materialUniforms);
  const unbindMaterials=bindPrairieMaterials(scene,materialUniforms);
  const shadow=base.load('/assets/prairie/foreground-shadow-v1.webp');
  const groundLight:ReturnType<typeof groundCompositionField>={settings:{foregroundDarkness:.34,sideFraming:.13,focalWidth:[9,20],transitionSoftness:.75,warmth:.08,irregularity:.7},center:[0,12],forward:[0,-1],phase:plan.phase};
  const shadedMaterials=new Set<T.Material>();
  scene.traverse(o=>{if(!(o instanceof T.Mesh))return;for(const m of Array.isArray(o.material)?o.material:[o.material]){
   if(!(m instanceof T.MeshStandardMaterial)||shadedMaterials.has(m))continue;
   shadedMaterials.add(m);installGroundLighting(m,groundLight,o instanceof T.InstancedMesh,false,undefined,false,shadow);
  }});
  const hills=base.load('/assets/prairie/distant-hills-v1.webp');hills.wrapS=hills.wrapT=T.ClampToEdgeWrapping;
  const hillsMaterial=new T.MeshBasicMaterial({map:hills,transparent:true,alphaTest:.025,depthWrite:false,side:T.DoubleSide,fog:false,toneMapped:false});
  hillsMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>','diffuseColor.a*=smoothstep(0.,.18,vMapUv.y)*smoothstep(0.,.06,vMapUv.x)*(1.-smoothstep(.94,1.,vMapUv.x));\n#include <alphatest_fragment>');};
  hillsMaterial.customProgramCacheKey=()=> 'prairie-distant-hills-matte-v1';
  const hillsMesh=new T.Mesh(new T.PlaneGeometry(4200,900),hillsMaterial);hillsMesh.name='prairie-distant-hills-matte';hillsMesh.position.set(0,300,-1780);scene.add(hillsMesh);
  const previousRender=scene.onBeforeRender;scene.onBeforeRender=function(...args){previousRender.apply(this,args);hillsMesh.visible=args[2].position.y<30&&Boolean(hills.image?.width);};
  scene.userData.prairieBackdrop={asset:'distant-hills-v1.webp',geography:'Illustrated low rolling plains; synthetic artistic continuation, not measured geographic topography',inspection:'Matte hidden above 30m; physical continuous terrain remains',position:hillsMesh.position.toArray(),groundLighting:groundLight,shadow:'World-space vegetation texture, shared by terrain and understory; independent of physical tree shadows'};
  sun.target.position.set(0,0,-40);sun.intensity=4.0;sun.shadow.intensity=.7;fill.intensity=.20;
  scene.children.forEach(o=>{if(o instanceof T.HemisphereLight){o.intensity=.55;o.color.set('#b7c5dc');o.groundColor.set('#8b805e');}});
  scene.fog=new T.Fog('#a6aebe',380,2450);
  scene.userData.prairie={stage:'C-connected-landscape-composition',version:3,sourceEcoId:r.ecoregion?.ECO_ID,sourceEcoName:r.ecoregion?.ECO_NAME,sourceBiome:r.ecoregion?.BIOME_NUM,reference:'prairie-wave3-primary',communityField:{resolution,span,channels:['growth','synthetic-moisture','exposure-pigment','soil']},ecology:'Unnamed grass, forb and shrub functional forms; NRCS regional context, not verified local taxa.',terrain:'Retained near rolls; shallow middle drainage and broad low distant shoulders on continuous terrain. Synthetic presentation, no inferred mountains or raised staging pad.',layers:{season:'independent leaf-on pigment reference',weather:'clear reference',timeOfDay:'low warm key reference'},pending:['Further regional and actual mobile validation','Final biome artistic approval']};
  base.finish();return()=>{unbindMaterials();scene.onBeforeRender=previousRender;scene.remove(hillsMesh);hillsMesh.geometry.dispose();hillsMaterial.dispose();dressing();field.dispose();base.dispose();};
 }};
