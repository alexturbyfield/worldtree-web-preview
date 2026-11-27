import {stagingWeight,tidalWater} from './wave1-water';
import * as T from 'three';
import type {SceneRecipe} from './recipe';
import type {CameraView} from './render-types';
import {randomSource,hashSeed} from './random';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
function smooth(a:number,b:number,v:number){const t=clamp((v-a)/(b-a));return t*t*(3-2*t);}
export function floodedFields(seed:string,x:number,z:number){
 const phase=(hashSeed(seed+'|wetland-field')%6283)/1000,channel=Math.sin(z*.018+phase)*12+Math.sin(z*.043+phase*.7)*4;
 const width=.8+.6*Math.sin(z*.025+phase),bank=smooth(width,width+7,Math.abs(x-channel)),patch=.5+.24*Math.sin(x*.046+Math.sin(z*.021)*2+phase)+.18*Math.sin(z*.055-x*.017+phase*.4);
 const sideChannel=5*Math.exp(-Math.pow((z+60+Math.sin(x*.032+phase)*18)/10,2));
 const pool=.5+.26*Math.sin(x*.031+z*.017+Math.sin(z*.027))+ .20*Math.sin(x*.052-z*.021+phase);
 const raw=-.18+bank*.44+(patch-.5)*.29-sideChannel*.06-smooth(.59,.79,pool)*.24;
 const stage=stagingWeight(x,z,[-18,34],[2,-140]),y=raw;
 return{y,patch,bank,channel,shore:1-smooth(.015,.18,Math.abs(y)),depth:Math.max(0,-y)};
}
function groundColor(seed:string,x:number,z:number){const f=floodedFields(seed,x,z),near=smooth(-10,40,z),c=new T.Color('#4e6240').lerp(new T.Color('#6c9b4c'),smooth(.015,.23,f.y));c.lerp(new T.Color('#a6ad58'),f.patch*.19).multiplyScalar(.85+f.patch*.21);c.lerp(new T.Color('#284e4d'),near*.22);c.lerp(new T.Color('#8fae9b'),smooth(90,650,Math.hypot(x,z))*.65);return c;}
export function sedgeGeometry(far=false){
 const pos:number[]=[],uv:number[]=[],ix:number[]=[],blades=far?5:13,steps=far?2:4;
 for(let j=0;j<blades;j++){
  const base=pos.length/3,a=j*2.399,h=.36+(j%7)*.12,w=far?.025:.031,lean=.22+(j%5)*.105,root=.06*Math.sin(j*2.3);
  for(let k=0;k<=steps;k++)for(const side of [-1,1]){
   const t=k/steps,width=w*Math.pow(Math.max(0,1-t),.55)*side,reach=root+lean*t*t;
   pos.push(Math.cos(a)*reach-Math.sin(a)*width,h*(t-.23*t*t*t),Math.sin(a)*reach+Math.cos(a)*width);uv.push((side+1)/2,t);
  }
  for(let k=0;k<steps;k++){const a=base+k*2;ix.push(a,a+1,a+2,a+1,a+3,a+2);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
}
export const floodedStudy={
 id:'flooded',biome:9,
 compose:(recipe:SceneRecipe):SceneRecipe=>({...recipe,limitations:[...recipe.limitations,'Wave1 flooded-grassland presentation uses unnamed grass/sedge forms supported by the open-groundcover resolver; no local sawgrass presence or hydrological survey is claimed.']}),
 camera:(recipe:SceneRecipe):CameraView=>({position:[-18,floodedFields(recipe.seed,-18,34).y+1.7,34],target:[2,1.1,-140]}),
 mount:(scene:T.Scene,recipe:SceneRecipe,sun:T.DirectionalLight,fill:T.DirectionalLight)=>{
  const created:T.Mesh[]=[],textures:T.Texture[]=[];for(const o of scene.children)if(o instanceof T.Mesh&&(o.geometry.type==='PlaneGeometry'||o.geometry.type==='BoxGeometry'))o.visible=false;
  let pending=2;scene.userData.labAssetsReady=false;const done=()=>{if(--pending===0)scene.userData.labAssetsReady=true;scene.userData.artRevision=(scene.userData.artRevision??0)+1;};
  const skyMap=new T.TextureLoader().load('/assets/puget-v1/sky-matte-v1.webp',done,undefined,done);skyMap.colorSpace=T.SRGBColorSpace;textures.push(skyMap);const sky=new T.Mesh(new T.SphereGeometry(1300,48,24),new T.MeshBasicMaterial({map:skyMap,color:'#dceaf0',side:T.BackSide,fog:false,depthWrite:false,toneMapped:false}));sky.name='wave1-flooded-sky';scene.add(sky);created.push(sky);
  const detail=new T.TextureLoader().load('/assets/alpine-meadow/meadow-ground-v1.png',done,undefined,done);detail.colorSpace=T.SRGBColorSpace;detail.wrapS=detail.wrapT=T.MirroredRepeatWrapping;detail.anisotropy=4;textures.push(detail);
  const landMat=new T.MeshStandardMaterial({vertexColors:true,roughness:.97});landMat.onBeforeCompile=shader=>{shader.uniforms.wetDetail={value:detail};shader.vertexShader='varying vec3 wetWorld;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nwetWorld=position;');shader.fragmentShader='uniform sampler2D wetDetail;varying vec3 wetWorld;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat fine=dot(texture2D(wetDetail,wetWorld.xz/7.).rgb,vec3(.2126,.7152,.0722));diffuseColor.rgb*=mix(1.,clamp(fine/.22,.8,1.2),.32*(1.-smoothstep(20.,120.,distance(cameraPosition,wetWorld))));');};
  const addLand=(width:number,depth:number,center:number,segments:number,hole=false)=>{const g=new T.PlaneGeometry(width,depth,segments,segments);g.rotateX(-Math.PI/2);g.translate(0,0,center);const p=g.getAttribute('position'),c=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,floodedFields(recipe.seed,x,z).y);groundColor(recipe.seed,x,z).toArray(c,i*3);}if(hole){const out:number[]=[];for(let i=0;i<g.index!.count;i+=3){const ids=[g.index!.getX(i),g.index!.getX(i+1),g.index!.getX(i+2)];if(ids.every(j=>Math.abs(p.getX(j))<172&&p.getZ(j)>-398&&p.getZ(j)<58))continue;out.push(...ids);}g.setIndex(out);}g.setAttribute('color',new T.BufferAttribute(c,3));g.computeVertexNormals();const mesh=new T.Mesh(g,landMat);mesh.name='wave1-flooded-terrain';mesh.receiveShadow=true;scene.add(mesh);created.push(mesh);};
  addLand(360,460,-170,170);addLand(2100,2000,-650,150,true);
  const optics=tidalWater((x,z)=>floodedFields(recipe.seed,x,z).y,0,2200,-650,Number(new URLSearchParams(location.search).get('wind')??0));scene.add(optics.water);
  const counts:number[]=[],r=randomSource(recipe.seed+'|flooded-matrix'),o=new T.Object3D();for(const far of [false,true]){const plants:{x:number;z:number;scale:number;angle:number}[]=[];for(let attempt=0;attempt<(far?10000:14000)&&plants.length<(far?2700:3000);attempt++){const near=r()<.65,x=(r()-.5)*(far?1000:near?70:170),z=far?-90-r()*650:near?7+r()*35:42-r()*200,f=floodedFields(recipe.seed,x,z);if(f.y<.055||r()>f.patch*.9+.08)continue;if(!far&&Math.abs(x)<4&&z>15)continue;plants.push({x,z,scale:(far?.55:.7)+r()*(far?.5:.9),angle:r()*6.283});}const mat=new T.MeshStandardMaterial({roughness:1,side:T.DoubleSide}),mesh=new T.InstancedMesh(sedgeGeometry(far),mat,plants.length);mat.onBeforeCompile=shader=>{shader.vertexShader='varying float sedgeTip;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nsedgeTip=uv.y;');shader.fragmentShader='varying float sedgeTip;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=mix(.65,1.2,smoothstep(.0,.9,sedgeTip));');shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize(mat3(viewMatrix)*vec3(0.,1.,0.)+normal*.18);');};mesh.name=far?'wave1-flooded-distant-sedges':'wave1-flooded-sedges';plants.forEach((a,i)=>{o.position.set(a.x,floodedFields(recipe.seed,a.x,a.z).y-.025,a.z);o.rotation.set(0,a.angle,0);o.scale.set(a.scale,a.scale,a.scale);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);const c=groundColor(recipe.seed,a.x,a.z).lerp(new T.Color('#408b43'),.35).lerp(new T.Color('#b6b864'),i%7===0?.19:.025);mesh.setColorAt(i,c);});mesh.computeBoundingSphere();mesh.castShadow=false;mesh.receiveShadow=false;scene.add(mesh);created.push(mesh);counts.push(plants.length);}
  sun.position.set(-55,35,25);sun.color.set('#ffe3b0');sun.intensity=3;fill.color.set('#a5c7dc');fill.intensity=.4;scene.children.forEach(o=>{if(o instanceof T.HemisphereLight){o.color.set('#bfd9df');o.groundColor.set('#526d53');o.intensity=.9;}});scene.background=new T.Color('#c5d9da');scene.fog=new T.Fog('#b4cecb',130,1150);
  scene.userData.wave1={id:'flooded',version:'flooded-3',biome:recipe.ecoregion?.BIOME_NUM,ecoregion:recipe.ecoregion?.ECO_ID,seed:recipe.seed,treeCount:recipe.trees.length,sedgeInstances:counts,reflection:'Planar actual-environment reflection with Fresnel and depth-sampled analytic sediment transmission; no biome color overlay.',ecology:'Unnamed open-groundcover sedge/grass forms; no confirmed local taxon inferred.',layers:{season:'inherited/not inferred',weather:'fixed clear study',timeOfDay:'fixed warm directional study'},limitations:['Synthetic wetland microtopography, not surveyed hydrology.','Far marsh simplified; no tree islands inserted without source palette.']};
  return()=>{optics.dispose();textures.forEach(t=>t.dispose());};
 }
};
