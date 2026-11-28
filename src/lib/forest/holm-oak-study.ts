import {prepareCanopyNormalExperiment} from './canopy-normal-experiment';
import {defaultArt} from './painterly';
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {SceneTree} from './recipe';
import type {Point,Segment} from './tree';
import type {StudioStudy,StudioFrond,FoliageGroup} from '../studio/groups';
import {randomSource} from './random';
import {corkWoodGeometry} from './cork-oak-hero';
/** Short-trunk evergreen architecture with connected, irregular domed foliage.
 * Branch-owned sprays fill multiple intervals, not just terminal pom-poms. */
export function holmOakStudy(source:SceneTree,height:number,radius:number,index:number):StudioStudy{
 const random=randomSource(source.seed+'|holm-domed-crown-1|'+index),segments:Segment[]=[],fronds:StudioFrond[]=[],groups:FoliageGroup[]=[];let nextPath=0;
 const tuple=(v:T.Vector3)=>v.toArray() as Point,point=(a:Point)=>new T.Vector3(...a),r=radius*1.40,phase=random()*6.283;
 const path=(points:Point[],r0:number,r1:number,depth:number,parent?:number)=>{const curve=new T.CatmullRomCurve3(points.map(point)),id=nextPath++,steps=depth<2?10:5,first=segments.length;
  for(let i=0;i<steps;i++){const a=i/steps,b=(i+1)/steps,rad=(t:number)=>r1+(r0-r1)*Math.pow(1-t,1.3);segments.push({a:tuple(curve.getPoint(a)),b:tuple(curve.getPoint(b)),r0:rad(a),r1:rad(b),depth,pathId:id,parentPathId:parent,tangentA:tuple(curve.getTangent(a)),tangentB:tuple(curve.getTangent(b)),capEnd:i===steps-1});}return {curve,id,first};};
 const leader=path([[0,-.03,0],[-height*.008,height*.15,height*.005],[height*.012,height*.31,0],[-height*.014,height*.57,-height*.015]],height*.064,height*.014,0);
 const envelope=(p:T.Vector3)=>{const center=new T.Vector3(0,height*.59,0),d=p.clone().sub(center),rho=Math.sqrt((d.x/r)**2+(d.z/(r*.88))**2+(d.y/(height*.41))**2);if(rho>.94)d.multiplyScalar(.94/rho);return center.add(d);};
 for(let arm=0;arm<14;arm++){
  const f=arm/13,angle=phase+arm*2.399+(random()-.5)*.25,start=leader.curve.getPoint(.39+f*.46),reach=r*(.90-.40*f),end=new T.Vector3(Math.cos(angle)*reach,height*(.51+.35*f),Math.sin(angle)*reach*.88),bend=start.clone().lerp(end,.52).add(new T.Vector3((random()-.5)*height*.055,height*(random()-.45)*.07,(random()-.5)*height*.05)),primary=path([tuple(start),tuple(bend),tuple(end)],height*(.029-.011*f),height*.003,1,leader.id);
  for(let shoot=0;shoot<5;shoot++){
   const t=.33+shoot*.16,origin=primary.curve.getPoint(t),a=angle+(shoot%2?-1:1)*(.60+random()*.70),length=r*(.22+random()*.15),tip=envelope(origin.clone().add(new T.Vector3(Math.cos(a)*length,height*(.045+random()*.08),Math.sin(a)*length*.9))),middle=origin.clone().lerp(tip,.51).add(new T.Vector3(0,height*.025,(random()-.5)*height*.025)),secondary=path([tuple(origin),tuple(middle),tuple(tip)],height*.0095,height*.0014,2,primary.id),id=groups.length;
   groups.push({id,anchor:tuple(origin),center:tuple(secondary.curve.getPoint(.65)),radii:[height*.12,height*.11,height*.12],branchIndex:secondary.first,axis:tuple(secondary.curve.getTangent(.6))});
   for(let node=0;node<11;node++)for(let fan=0;fan<3;fan++){
    const u=.18+node*.08,anchor=secondary.curve.getPoint(u),azimuth=phase+node*2.399+fan*2.094,offset=height*(.022+random()*.025),pos=envelope(anchor.clone().add(new T.Vector3(Math.cos(azimuth)*offset,(fan-1)*height*.026+random()*height*.025,Math.sin(azimuth)*offset))),normal=new T.Vector3(Math.cos(azimuth)*.55,.5+random()*.5,Math.sin(azimuth)*.55).normalize(),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),normal);
    // Studio surfaces use local +Y as their long axis; rotate the spray, not the whole mass.
    q.multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),random()*6.283));
    const size=height*(.085+random()*.04),radial=Math.hypot(pos.x/r,pos.z/(r*.88)),interior=T.MathUtils.clamp((1-radial)*.55+(1-pos.y/height)*.25,.06,.65);
    fronds.push({position:tuple(pos),rotation:q.toArray() as [number,number,number,number],width:size,length:size*(.9+random()*.25),curve:.14,droop:0,tile:0,color:new T.Color('#a1aa8a').lerp(new T.Color('#d7d6a6'),random()*.38).getStyle(),normal:tuple(normal),interior,groupId:id,essential:node===8&&fan===1});
   }
  }
 }
 // Fine root flare remains embedded when placed on terrain.
 for(let i=0;i<4;i++){const a=i*2.399+phase;path([[Math.cos(a)*height*.075,-.035,Math.sin(a)*height*.075],[Math.cos(a)*height*.025,height*.08,Math.sin(a)*height*.025],[0,height*.14,0]],height*.013,height*.012,1);}
 const model={...source.model,kind:'painterly' as const,appearanceSeed:source.appearanceSeed??source.seed,art:defaultArt,palette:{name:'Holm oak reference',shadow:'#293b31',body:'#6b7953',light:'#afb77e',bark:'#827b6b'},presetId:'oak',segments,foliage:[],parameters:{...source.model.parameters,height,crownRadius:r,crownBase:.23,trunkRadius:height*.064},dimensions:{height,crownWidth:r*2,crownDepth:r*1.76}};
 return {kind:'broadleaf',model,segments,groups,fronds,scale:1,offset:[0,0,0],lod:{groupStride:3,essentialSprays:1}};
}
/** Transfer a continuous crown hull field to the already world-batched vertices.
 * Geometry/UVs are untouched; unlike per-spray normals this field has no card seams. */
export function holmHullNormal(local:T.Vector3,height:number,width:number,depth:number){
 const rx=width*.5,ry=height*.41,rz=depth*.5;
 const normal=new T.Vector3(local.x/(rx*rx),(local.y-height*.59)/(ry*ry),local.z/(rz*rz));
 if(normal.lengthSq()<1e-8)return normal.set(0,1,0);
 return normal.normalize();
}
/** Local material/UV binding keeps the existing renderer, batching, LOD and picking. */
export function installHolmOakMaterials(scene:T.Scene,trees:SceneTree[],load:(url:string)=>T.Texture){
 if(!trees.length)return()=>{};
 const bark=load('/assets/holm-oak/bark-v1.webp');bark.repeat.set(2,1);const leaf=load('/assets/holm-oak/leaves-v1.webp');leaf.wrapS=leaf.wrapT=T.ClampToEdgeWrapping;
 const tone={holmRealism:{value:.5},holmTone:{value:0},holmToneShade:{value:new T.Color()},holmToneBody:{value:new T.Color()},holmToneSun:{value:new T.Color()}};
 const woods=new Set<T.MeshStandardMaterial>();
 const treatments={A:{shade:'#77715f',body:'#8b846c',sun:'#a49b7d',bark:'#e1d1b4'},B:{shade:'#4e7067',body:'#8fa28a',sun:'#c5d0b0',bark:'#c7c9bf'},C:{shade:'#335e45',body:'#719b4c',sun:'#d1df7c',bark:'#ddcba7'}};
 const choose=(name:string)=>{const t=treatments[name as keyof typeof treatments];tone.holmTone.value=t?name==='A'?1:name==='B'?2:3:0;if(t){tone.holmToneShade.value.set(t.shade);tone.holmToneBody.value.set(t.body);tone.holmToneSun.value.set(t.sun);}woods.forEach(m=>{m.color.set(t?.bark??'#aaa391');m.bumpScale=t ? .02 : .035;});scene.userData.artRevision=(scene.userData.artRevision??0)+1;scene.userData.holmMaterialSelected=t?name:'baseline';};
 scene.userData.holmMaterialChoice=choose;
 const old=scene.onBeforeRender,depths:T.Material[]=[];let installed=false;
 scene.onBeforeRender=function(...args){old.apply(this,args);if(installed)return;installed=true;let woodLOD=0,foliageLOD=0;
  scene.traverse(o=>{if(!(o instanceof T.Mesh))return;
   if(o.userData.faces&&o.material instanceof T.MeshStandardMaterial){const far=woodLOD++>0,parts:T.BufferGeometry[]=[],faces:{end:number;treeIndex:number}[]=[];let count=0;
    for(const tree of trees){const g=corkWoodGeometry(tree.model.segments.filter(s=>!far||s.depth<=1)),matrix=new T.Matrix4().makeRotationY(-tree.rotation);matrix.setPosition(...tree.position);g.applyMatrix4(matrix);parts.push(g);count+=g.index!.count/3;faces.push({end:count,treeIndex:tree.index});}
    if(parts.length){const g=mergeGeometries(parts,false)!;parts.forEach(p=>p.dispose());o.geometry.dispose();o.geometry=g;o.userData.faces=faces;g.computeBoundingSphere();}
    woods.add(o.material);o.material.map=bark;o.material.bumpMap=bark;o.material.bumpScale=.035;o.material.vertexColors=false;o.material.color.set('#aaa391');o.material.needsUpdate=true;o.receiveShadow=true;
   }
   if(o.material instanceof T.ShaderMaterial&&o.material.uniforms.foliageMap){
    const far=foliageLOD++>0;
    const params=new URLSearchParams(location.search),normalMode=params.get('holmNormals')??(params.has('holmNormalExperiment')?'hull':'blend');
    if(normalMode!=='cards'){
     const positions=o.geometry.attributes.position,normals=o.geometry.attributes.normal,local=new T.Vector3();let offset=0;
     for(const tree of trees){const study=tree.studio!,fronds=far?study.fronds.filter(f=>f.essential||f.groupId%(study.lod?.groupStride??2)===0):study.fronds,count=fronds.length*9,rotation=new T.Matrix4().makeRotationY(tree.rotation),inverse=new T.Matrix4().makeRotationY(-tree.rotation);
      if(normalMode==='hull'){for(let i=offset;i<offset+count;i++){local.fromBufferAttribute(positions,i).sub(new T.Vector3(...tree.position)).applyMatrix4(rotation);const n=holmHullNormal(local,tree.model.dimensions.height,tree.model.dimensions.crownWidth,tree.model.dimensions.crownDepth).transformDirection(inverse);normals.setXYZ(i,n.x,n.y,n.z);}}
      else{const selected=new T.BufferGeometry(),copy=new Float32Array(count*3);for(let i=0;i<count;i++){copy[i*3]=normals.getX(offset+i);copy[i*3+1]=normals.getY(offset+i);copy[i*3+2]=normals.getZ(offset+i);}selected.setAttribute('normal',new T.BufferAttribute(copy,3));const experiment=prepareCanopyNormalExperiment({...tree,studio:{...study,fronds}},selected);experiment.apply('blend',{crown:.45,cluster:.40,leaf:.15});for(let i=0;i<count;i++)normals.setXYZ(offset+i,copy[i*3],copy[i*3+1],copy[i*3+2]);selected.dispose();}offset+=count;
     }normals.needsUpdate=true;
    }
    const m=o.material;if(!m.userData.holmLeafBound){m.userData.holmLeafBound=true;const previousCompile=m.onBeforeCompile;m.onBeforeCompile=function(shader,renderer){previousCompile.call(this,shader,renderer);shader.fragmentShader=shader.fragmentShader.replace('shaded*=vec3(.32,.48,.55)','shaded*=vec3(.65,.65,.57)').replace('actualSunColor*actualSunPower*actualNdotL*1.65','actualSunColor*actualSunPower*actualNdotL*.70');};Object.assign(m.uniforms,tone);m.fragmentShader='uniform float holmTone,holmRealism;uniform vec3 holmToneShade,holmToneBody,holmToneSun;\n'+m.fragmentShader;m.uniforms.foliageMap.value=leaf;m.vertexShader=m.vertexShader.replace('atlasUv=tileRect.xy+uv*tileRect.zw;','atlasUv=uv;');m.fragmentShader=m.fragmentShader.replace('gl_FragColor=vec4(shaded,1.);',`shaded=mix(shaded,leaf.rgb*paintLight,.70);vec3 holmOriginal=shaded;
 if(holmTone>.5){
  float v=clamp(sunFacing*.54+canopyValue*.46,0.,1.);
  float grain=clamp(dot(leaf.rgb,vec3(.2126,.7152,.0722))/.20,.70,1.20);
  if(holmTone<1.5){shaded=mix(holmToneShade,holmToneBody,smoothstep(.12,.66,v));shaded=mix(shaded,holmToneSun,smoothstep(.55,.95,v)*.78);shaded*=mix(1.,grain,.18);}
  else if(holmTone<2.5){shaded=mix(holmToneShade,holmToneBody,smoothstep(.02,.55,v));shaded=mix(shaded,holmToneSun,smoothstep(.43,1.,v)*.64);shaded*=mix(1.,grain,.10);}
  else{shaded=mix(holmToneShade,holmToneBody,smoothstep(.30,.39,v));shaded=mix(shaded,holmToneSun,smoothstep(.70,.78,v)*.85);shaded*=mix(1.,grain,.08);}
 }
 shaded=mix(shaded,holmOriginal,holmRealism);gl_FragColor=vec4(shaded,1.);`);m.uniforms.shadowPigment.value.set('#77735e');m.uniforms.midPigment.value.set('#817b66');m.uniforms.highPigment.value.set('#a0977d');m.needsUpdate=true;}
    o.customDepthMaterial?.dispose();const depth=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:leaf,alphaTest:.34,side:T.DoubleSide});o.customDepthMaterial=depth;depths.push(depth);o.receiveShadow=true;
   }
  });scene.userData.holmOakStudy={species:'Quercus ilex',trees:trees.length,architecture:'Short trunk, internally branched connected irregular dome',textures:['bark-v1.webp','leaves-v1.webp'],sourceSeeds:trees.map(t=>t.seed),normals:new URLSearchParams(location.search).get('holmNormals')??'hierarchical .45/.40/.15',material:'A with 50% original texture-driven color',scope:'Mediterranean presentation only; no globally approved template'};choose(new URLSearchParams(location.search).get('holmMaterial')??'A');scene.userData.holmDiagnostic=(mode:'beauty'|'branches'|'silhouette'='beauty')=>{
   const group=new T.Group();let woodTaken=false,leavesTaken=false;
   scene.traverse(o=>{if(!(o instanceof T.Mesh))return;const wood=Boolean(o.userData.faces);const leaves=o.material instanceof T.ShaderMaterial&&Boolean(o.material.uniforms.foliageMap);
    if(wood&&!woodTaken){woodTaken=true;const g=o.geometry.clone();g.setDrawRange(0,o.userData.faces[0].end*3);group.add(new T.Mesh(g,mode==='silhouette'?new T.MeshBasicMaterial({color:0x000000}):o.material));}
    if(leaves&&!leavesTaken&&mode!=='branches'){leavesTaken=true;const g=o.geometry.clone();g.setDrawRange(0,trees[0].studio!.fronds.length*24);group.add(new T.Mesh(g,mode==='silhouette'?new T.MeshBasicMaterial({map:leaf,color:0x000000,alphaTest:.34,side:T.DoubleSide}):o.material));}
   });const leafMesh=group.children.find(o=>(o as T.Mesh).material instanceof T.ShaderMaterial) as T.Mesh|undefined;const normalExperiment=leafMesh&&new URLSearchParams(location.search).get('holmNormalExperiment')==='1'?prepareCanopyNormalExperiment(trees[0],leafMesh.geometry):undefined;if(normalExperiment&&leafMesh){const original=leafMesh.material as T.ShaderMaterial;const material=original.clone();material.onBeforeCompile=original.onBeforeCompile;material.customProgramCacheKey=original.customProgramCacheKey;leafMesh.material=material;}
   return {group,root:trees[0].position,height:trees[0].model.dimensions.height,normalExperiment};
  };scene.userData.recipeShadowDirty=true;
 };
 return()=>{scene.onBeforeRender=old;depths.forEach(m=>m.dispose());delete scene.userData.holmOakStudy;delete scene.userData.holmDiagnostic;delete scene.userData.holmMaterialChoice;delete scene.userData.holmMaterialSelected;};
}
