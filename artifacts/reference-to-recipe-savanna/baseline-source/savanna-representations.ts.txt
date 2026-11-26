import * as T from 'three';
import {hashSeed,randomSource} from './random';
import type {SceneRecipe} from './recipe';
import profiles from './visual-lab-profiles.json';

type Parameters={representation:string;massCount:number;fineCount:number;massHeight:number;massWidth:number;fieldContrast:number;detailStrength:number;revision:number;accentCount?:number};
/** A single world-space grammar supplies ground, canopy masses and fine blades. No sky/light/tree edits. */
export function installSavannaRepresentations(scene:T.Scene,recipe:SceneRecipe,guard:(materialTargets:Set<string>)=>string){
 const ground=scene.children.find(o=>o instanceof T.Mesh&&o.geometry.type==='PlaneGeometry') as T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;
 const original=ground.material,grass=scene.getObjectByName('pretty-savanna-grass')!,created:T.InstancedMesh[]=[];let land:T.MeshStandardMaterial|undefined;
 const phase=(hashSeed(recipe.seed)%6283)/1000,materialTargets=new Set([ground.uuid]);
 const catalog=profiles.experiments.S;let atlas:T.Texture|undefined;
 const loadAtlas=()=>{if(atlas)return atlas;scene.userData.labAssetsReady=false;atlas=new T.TextureLoader().load('/assets/savanna-study/grass-swaths-v1.webp',()=>{scene.userData.labAssetsReady=true;scene.userData.artRevision=(scene.userData.artRevision??0)+1;},undefined,()=>{scene.userData.labAssetsReady=true;scene.userData.labAssetError='Grass swath atlas failed to load';});atlas.colorSpace=T.SRGBColorSpace;atlas.anisotropy=4;return atlas;};
 const reset=()=>{ground.material=original;grass.visible=true;for(const m of created){scene.remove(m);m.geometry.dispose();(m.material as T.Material).dispose();m.dispose();}created.length=0;land?.dispose();land=undefined;};
 const apply=(id:string)=>{
  const candidate=catalog.candidates.find(c=>c.id===id);if(!candidate)throw Error('Unknown representation '+id);const p=candidate.parameters as Parameters;
  reset();const before=guard(materialTargets);grass.visible=false;
  land=material(0,p,phase);ground.material=land;
  const batch=(geometry:T.BufferGeometry,count:number,role:number,parameters=p)=>{if(role===1)geometry.setAttribute('studyTile',new T.InstancedBufferAttribute(Float32Array.from({length:count},(_,i)=>i%4),1));const mesh=new T.InstancedMesh(geometry,material(role,parameters,phase,role===1?loadAtlas():undefined),count);mesh.name='lab-savanna-grass';mesh.receiveShadow=true;scene.add(mesh);created.push(mesh);return mesh;};
  if(p.representation==='masses')populate(batch(curvedMass(),p.massCount,1),recipe,p,'mass');
  if(p.representation==='hybrid')populate(batch(canopyRibbon(),p.massCount,3),recipe,p,'ribbon');
  if(p.accentCount){const accents={...p,massWidth:3.8,massHeight:1.8};populate(batch(curvedMass(),p.accentCount,1,accents),recipe,accents,'mass');}
  populate(batch(fineBlades(),p.fineCount,2),recipe,p,'fine');
  let count=0,digest=2166136261,snapped=0;const uniquePositions=new Set<string>();const cells=Array(144).fill(0);for(const m of created){count+=m.count;for(let i=0;i<m.count;i++){const x=m.instanceMatrix.array[i*16+12],z=m.instanceMatrix.array[i*16+14];uniquePositions.add(x.toFixed(3)+','+z.toFixed(3));if(Math.abs(x-Math.round(x))<.015&&Math.abs(z-Math.round(z))<.015)snapped++;cells[Math.max(0,Math.min(11,Math.floor((x+50)/100*12)))+12*Math.max(0,Math.min(11,Math.floor((z+50)/100*12)))]++;}for(const n of m.instanceMatrix.array)digest=Math.imul(digest^Math.round(n*10000),16777619);}
  const mean=count/144,after=guard(materialTargets);
  scene.userData.visualLab={schemaVersion:1,generatorVersion:profiles.generatorVersion,experiment:'S',candidate:id,worldSeed:recipe.seed,presentationSeed:catalog.presentationSeed,parameters:p,coverageMode:'ground-and-geometry',coverageExplanation:'The geometric silhouette mask excludes the grassland substrate. Low geometric coverage alone is not a missing-vegetation failure for material-led representations; inspect surface organization.',targetLayout:{count,occupancyCV:Math.sqrt(cells.reduce((s,n)=>s+(n-mean)**2,0)/144)/Math.max(1,mean),gridAlignedFraction:snapped/Math.max(1,count),duplicatePositionFraction:1-uniquePositions.size/Math.max(1,count),matrixDigest:(digest>>>0).toString(16)},unchangedSystems:{before,after,match:before===after,scope:'Ground material and experimental grass are declared targets; terrain geometry, non-target objects/materials, lights and fog retain the existing guard.'}};
  scene.userData.artRevision=(scene.userData.artRevision??0)+1;
 };
 return {accepts:(id:string)=>catalog.candidates.some(c=>c.id===id),apply,reset,dispose:()=>{reset();atlas?.dispose();}};
}

function populate(mesh:T.InstancedMesh,recipe:SceneRecipe,p:Parameters,kind:'mass'|'ribbon'|'fine'){
 const o=new T.Object3D();
 for(let i=0;i<mesh.count;i++){
  const r=randomSource(recipe.seed+'|savanna-grammar-1|'+kind+'|'+i);let x=0,z=0;
  for(let trial=0;trial<50;trial++){x=(r()-.5)*96;z=kind==='fine'?12+r()*26:-47+r()*86;const flow=.5+.25*Math.sin(x*.09+Math.sin(z*.08)*2)+.2*Math.sin(z*.12+x*.04),gap=Math.hypot((x-3)/13,(z+4)/21);if(r()<(.3+flow*.65)*(.35+.65*T.MathUtils.smoothstep(gap,.3,1.25)))break;}
  const yaw=.45+.35*Math.sin(x*.045+z*.03)+(r()-.5)*.5;
  const sx=kind==='fine'?.65+r()*.55:kind==='ribbon'?p.massWidth*(.8+r()*.6):p.massWidth*(.7+r()*.6);
  o.position.set(x,0,z);o.rotation.set(0,yaw,0);o.scale.set(sx,1,kind==='ribbon'?1.6+r()*1.6:kind==='mass'?sx:sx);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);
 }mesh.computeBoundingSphere();if(mesh.boundingSphere)mesh.boundingSphere.radius+=4;
}

function curvedMass(){
 const positions:number[]=[],uvs:number[]=[];
 for(const angle of [-.8,0,.8]){
  const point=(u:number,v:number)=>{const x=u-.5,y=v*(.77+.23*Math.sin(u*Math.PI)),z=.12*Math.sin(u*Math.PI*2)*Math.sin(v*Math.PI)+v*v*.1;return [x*Math.cos(angle)+z*Math.sin(angle),y,z*Math.cos(angle)-x*Math.sin(angle)];};
  for(let x=0;x<6;x++)for(let y=0;y<3;y++){const u=x/6,v=y/3,du=1/6,dv=1/3;for(const [a,b] of [[u,v],[u+du,v],[u,v+dv],[u+du,v],[u+du,v+dv],[u,v+dv]]){positions.push(...point(a,b));uvs.push(a,b);}}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.computeVertexNormals();return g;
}
function canopyRibbon(){const g=new T.PlaneGeometry(1,1,10,8);g.rotateX(-Math.PI/2);const a=g.getAttribute('position'),uv=g.getAttribute('uv');for(let i=0;i<a.count;i++)a.setY(i,Math.pow(Math.sin(uv.getX(i)*Math.PI)*Math.sin(uv.getY(i)*Math.PI),2));g.computeVertexNormals();return g;}
function fineBlades(){
 const positions:number[]=[],uvs:number[]=[];
 for(let j=0;j<3;j++){const root=(j-1)*.14,lean=.25+j*.07,point=(t:number,side:number)=>[root+lean*t*t+side*.035*(1-t),t*(.8+j*.07),Math.sin(j*2.399)*.13];for(let k=0;k<2;k++){const t=k/2,u=(k+1)/2;for(const [v,s] of [[t,-1],[t,1],[u,-1],[t,1],[u,1],[u,-1]]){positions.push(...point(v,s));uvs.push((s+1)/2,v);}}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.computeVertexNormals();return g;
}

function material(role:number,p:Parameters,phase:number,atlas?:T.Texture){
 const m=new T.MeshStandardMaterial({color:'#ffffff',roughness:1,side:T.DoubleSide,map:atlas,alphaTest:role===1?.15:role===3?.01:0,transparent:role===3,depthWrite:role!==3,polygonOffset:role===3,polygonOffsetFactor:-1});
 const c=(hex:string)=>`vec3(${new T.Color(hex).toArray().map(n=>n.toFixed(5)).join(',')})`;
 const shared=`
 float sh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float sn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*f*(f*(f*6.-15.)+10.);return mix(mix(sh(i),sh(i+vec2(1.,0.)),f.x),mix(sh(i+vec2(0.,1.)),sh(i+1.),f.x),f.y);}
 vec2 sw(vec2 p){return p+vec2(${(phase*1.7).toFixed(5)},${(phase*2.3).toFixed(5)});}
 float field(vec2 p){p=sw(p);vec2 warp=vec2(sn(p*.055),sn(p*.055+9.))*3.;return .68*sn(p*.075+warp)+.32*sn(p*.19+warp*.5);}
 float opening(vec2 p){vec2 q=(p-vec2(3.,-4.))/vec2(19.,25.);return exp(-dot(q,q)*.8);}
 float relief(vec2 p){return (.42+field(p)*.85)*(1.-opening(p)*.68);}
 vec3 landColor(vec2 p){float n=field(p),f=opening(p),crest=smoothstep(.25,.78,n);vec3 base=mix(${c('#777e50')},${c('#c9a552')},clamp(.2+crest*.7+f*.25,0.,1.));base=mix(base,${c('#d5b56b')},f*.25);float medium=sn(sw(p)*.28+vec2(n*4.));return base*(1.+(medium-.5)*${p.detailStrength.toFixed(4)});}
 float groundY(vec2 p){return sin(p.x*.055+${phase.toFixed(5)})*1.1+cos(p.y*.073-${phase.toFixed(5)})*.8+sin((p.x+p.y)*.12+${phase.toFixed(5)})*.25;}
 `;
 m.onBeforeCompile=shader=>{
  shader.vertexShader=shared+'\nvarying vec3 studyWorld;varying vec2 studyUv;varying float studyHeight;'+(role===1?'attribute float studyTile;varying vec2 studyAtlasUv;':'')+'\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   studyUv=uv;studyHeight=${role===0?'0.':'position.y'};${role===1?'studyAtlasUv=(vec2(mod(studyTile,2.),1.-floor(studyTile/2.))+uv)/2.;':''}
   vec4 studyP=vec4(transformed,1.);
   #ifdef USE_INSTANCING
   studyP=instanceMatrix*studyP;
   #endif
   ${role===0?'':`transformed.y=groundY(studyP.xz)+.025+position.y*${role===2?'1.4':p.massHeight.toFixed(4)}*relief(studyP.xz);`}
   vec4 studyFinal=vec4(transformed,1.);
   #ifdef USE_INSTANCING
   studyFinal=instanceMatrix*studyFinal;
   #endif
   studyWorld=(modelMatrix*studyFinal).xyz;`);
  shader.fragmentShader=shared+'\nvarying vec3 studyWorld;varying vec2 studyUv;varying float studyHeight;'+(role===1?'varying vec2 studyAtlasUv;':'')+'\n'+shader.fragmentShader;
  if(role===1)shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',T.ShaderChunk.map_fragment.replace('vMapUv','studyAtlasUv'));
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float distanceFade=1.-smoothstep(20.,75.,distance(cameraPosition,studyWorld));
   vec3 coat=landColor(studyWorld.xz);
   float strokes=sn(vec2(studyWorld.x*.9+studyWorld.z*.3,studyWorld.z*.12));
   coat*=1.+(strokes-.5)*.035*distanceFade;
   diffuseColor.rgb=coat*mix(.94,1.15,clamp(studyHeight,0.,1.))${role===1?'*mix(.72,1.3,clamp(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722))*2.,0.,1.))':''};
   ${role===1?'diffuseColor.a*=smoothstep(0.,.15,studyUv.y);':role===3?'diffuseColor.a*=smoothstep(0.,.16,min(min(studyUv.x,1.-studyUv.x),min(studyUv.y,1.-studyUv.y)));':''}`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
   ${role===0&&p.representation!=='masses'?`float canopyRelief=relief(studyWorld.xz);vec3 dpdx=dFdx(-vViewPosition),dpdy=dFdy(-vViewPosition),rx=cross(dpdy,normal),rz=cross(normal,dpdx);float determinant=dot(dpdx,rx);vec3 gradient=sign(determinant)*(dFdx(canopyRelief)*rx+dFdy(canopyRelief)*rz)/max(.000001,abs(determinant));normal=normalize(normal-gradient*.75);`:role===3?'normal=normalize(cross(dFdx(vViewPosition),dFdy(vViewPosition)));':role!==0?'normal=normalize(normal+normalize(mat3(viewMatrix)*vec3(0.,1.,0.))*.7);':''}`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`float largeLight=clamp(.5+(field(studyWorld.xz+vec2(-4.,7.))-.5)*${p.fieldContrast.toFixed(4)}+opening(studyWorld.xz)*.3,0.,1.);outgoingLight*=mix(vec3(.78,.9,1.02),vec3(1.18,1.12,.95),largeLight);\n#include <opaque_fragment>`);
 };
 m.customProgramCacheKey=()=> 'savanna-grammar-'+role+'-'+JSON.stringify(p);return m;
}
