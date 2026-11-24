import {rainforestV5,mountRainforestDepth} from './rainforest-depth';
import {activeArchetype,arrangeArchetype,rainforestV4} from './composition-archetype';
import * as T from 'three';
import {randomSource} from './random';
import {terrainHeight,type SceneRecipe} from './recipe';
import type {CameraView} from './render-types';
import {landscapeGrass} from './landscape-detail';
import {pugetCompositionProfile,type EncounterCompositionProfile} from './environment-foundations';
export interface BiomeVisualProfile {
 id:'puget'|'savanna'|'amazon';name:string;match:{ecoregions?:number[];biomes?:number[];realm?:string};
 distribution:{pattern:'legacy'|'open-scattered'|'layered';maxTrees:number;allowedDesigns:string[];roles:Record<string,'canopy'|'palm'|'understory'>;weights:{canopy:number;palm:number;understory:number}};
 ground:{texture:string|null;palette:string[];soil:string;exposedSoil:number;tileMeters:number};
 vegetation:{grass:number;shrubs:number;understory:number;height:number;bladeWidth:number;palette:[string,string]};
 landscape:{kind:'approved'|'open-horizon'|'enclosed';color:string};
 sky:{asset:string;haze:string;near:number;far:number;tint:string};
 light:{position:[number,number,number];sun:string;intensity:number;ambient:string;fill:number;shadowColor:string};
 composition:{opening:[number,number];enclosure:number;foreground:number;midground:number;camera:CameraView;focalStrength:number;edgeShade:number};
}
const sky='/assets/puget-v1/sky-matte-v1.webp';
export const biomeVisualProfiles:BiomeVisualProfile[]=[
 {id:'puget',name:'Puget temperate woodland',match:{ecoregions:[364]},distribution:{pattern:'legacy',maxTrees:60,allowedDesigns:[],roles:{},weights:{canopy:1,palm:0,understory:0}},ground:{texture:null,palette:['#263e32','#426447','#6d914e','#a9b76b'],soil:'#b89042',exposedSoil:.2,tileMeters:7.5},vegetation:{grass:2600,shrubs:65,understory:26,height:1,bladeWidth:.06,palette:['#315a47','#819d58']},landscape:{kind:'approved',color:'#648e90'},sky:{asset:sky,haze:'#c5d9cc',near:76,far:175,tint:'#ffffff'},light:{position:[-36,38,22],sun:'#ffe0a8',intensity:4.8,ambient:'#a3c4df',fill:.85,shadowColor:'#6c8f75'},composition:{opening:[14.5,22.7],enclosure:.6,foreground:4,midground:12,camera:{position:[0,3,34],target:[-2,6,-20]},focalStrength:.9,edgeShade:.46}},
 {id:'savanna',name:'East African savanna · conditional canopy',match:{biomes:[7],realm:'Afrotropic'},distribution:{pattern:'open-scattered',maxTrees:7,allowedDesigns:['acacia'],roles:{acacia:'canopy'},weights:{canopy:1,palm:0,understory:0}},ground:{texture:null,palette:['#6c6234','#9a8644','#bdab55','#ddd28a'],soil:'#a25a36',exposedSoil:.42,tileMeters:9},vegetation:{grass:2800,shrubs:35,understory:0,height:1.05,bladeWidth:.045,palette:['#8a813f','#d5c373']},landscape:{kind:'open-horizon',color:'#af9e75'},sky:{asset:sky,haze:'#e3cfa4',near:75,far:195,tint:'#fff1db'},light:{position:[-48,20,25],sun:'#ffcf81',intensity:3.4,ambient:'#c7d6e4',fill:1,shadowColor:'#8e7954'},composition:{opening:[20,26],enclosure:.1,foreground:1,midground:5,camera:{position:[0,3.2,34],target:[-2,3.8,-20]},focalStrength:.5,edgeShade:.22}},
 {id:'amazon',name:'Amazon tropical rainforest',match:{biomes:[1],realm:'Neotropic'},distribution:{pattern:'layered',maxTrees:38,allowedDesigns:['mahogany','rubber','kapok','acai','cecropia','cacao'],roles:{mahogany:'canopy',rubber:'canopy',kapok:'canopy',acai:'palm',cecropia:'understory',cacao:'understory'},weights:{canopy:.6,palm:.2,understory:.2}},ground:{texture:'/assets/puget-v1/forest-floor.png',palette:['#273c2b','#3d5734','#577446','#84964e'],soil:'#6f5135',exposedSoil:.65,tileMeters:8},vegetation:{grass:480,shrubs:140,understory:160,height:1.5,bladeWidth:.13,palette:['#254d38','#78a350']},landscape:{kind:'enclosed',color:'#4b7566'},sky:{asset:sky,haze:'#829f8a',near:23,far:115,tint:'#bcd6cb'},light:{position:[-25,52,12],sun:'#ffe3a8',intensity:3.1,ambient:'#92b8b0',fill:.8,shadowColor:'#315645'},composition:{opening:[7,11],enclosure:.92,foreground:7,midground:13,camera:{position:[0,2.8,29],target:[-1,9,-6]},focalStrength:.85,edgeShade:.4}}
];
function baseBiomeVisualProfile(r:SceneRecipe){return biomeVisualProfiles.find(p=>p.match.ecoregions?.includes(r.ecoregion?.ECO_ID??-1))??biomeVisualProfiles.find(p=>p.match.biomes?.includes(r.ecoregion?.BIOME_NUM??-1)&&p.match.realm===r.ecoregion?.REALM);}
export function biomeVisualProfile(r:SceneRecipe):BiomeVisualProfile|undefined{
 const p=baseBiomeVisualProfile(r);if(!p||p.id!=='amazon'||!rainforestV4())return p;
 return {...p,distribution:{...p.distribution,maxTrees:64},ground:{...p.ground,palette:['#302b20','#403a26','#3c4930','#777047'],soil:'#69472e',exposedSoil:.55,tileMeters:5},vegetation:{...p.vegetation,grass:0,shrubs:160,understory:360},light:{...p.light,position:[-28,48,18],intensity:3.8,ambient:'#81aaa0',fill:.42,shadowColor:'#284c3b'},sky:{...p.sky,haze:rainforestV5()?'#35665e':'#284a3a',near:rainforestV5()?28:65,far:rainforestV5()?125:150}};
}
export type BiomeRecipe=SceneRecipe&{biomeVisualId?:string;encounter?:{version:'puget-encounter-v1';camera:'human'|'inspection';reserved:{x:number;z:number;radiusX:number;radiusZ:number}}};
export function composeBiomeEncounter(recipe:SceneRecipe,p:BiomeVisualProfile):BiomeRecipe{
 const candidates=recipe.trees.filter(t=>p.distribution.allowedDesigns.includes(t.studio?.model.presetId??t.model.presetId)),r=randomSource(recipe.seed+'|biome-composition|'+p.id),count=candidates.length?Math.min(p.id==='amazon'&&rainforestV4()?Math.max(64,recipe.requestedTreeCount):recipe.requestedTreeCount,p.distribution.maxTrees):0;
 const archetype=activeArchetype(p.id);
 const trees=archetype&&candidates.length?arrangeArchetype(recipe,candidates,archetype,count,p.distribution.roles):Array.from({length:count},(_,i)=>{
  const u=r(),role=u<p.distribution.weights.canopy?'canopy':u<p.distribution.weights.canopy+p.distribution.weights.palm?'palm':'understory',pool=candidates.filter(t=>p.distribution.roles[t.studio?.model.presetId??t.model.presetId]===role),source=(pool.length?pool:candidates)[Math.floor(r()*(pool.length||candidates.length))];let x:number,z:number;
  if(p.distribution.pattern==='open-scattered'){const anchors=[[-24,12],[23,-6],[-31,-15],[39,-23],[-9,-28],[8,-35],[-43,-35],[43,-43],[-25,-43],[23,-45],[-6,-46],[4,-13]];[x,z]=anchors[i%anchors.length];x+=(r()-.5)*5;z+=(r()-.5)*5;}
  else if(i<p.composition.foreground){x=(i%2?-1:1)*(12+r()*9);z=6+r()*13;}
  else if(i<p.composition.foreground+p.composition.midground){x=(i%2?-1:1)*(9+r()*22);z=-3-r()*21;}
  else{x=(r()-.5)*85;z=-28-r()*17;}
  const openingZ=(z-3)/p.composition.opening[1];if(Math.abs(openingZ)<1){const edge=p.composition.opening[0]*Math.sqrt(1-openingZ*openingZ);if(Math.abs(x)<edge)x=(x<0?-1:1)*(edge+1.5);}
  return {...source,id:`${source.id}-${p.id}-${i}`,index:i,position:[x,terrainHeight(x,z,recipe.seed),z] as [number,number,number],rotation:r()*Math.PI*2};
 });
 return {...recipe,trees,biomeVisualId:p.id,encounter:{version:'puget-encounter-v1',camera:'human',reserved:{x:0,z:3,radiusX:p.composition.opening[0],radiusZ:p.composition.opening[1]}},distribution:`${p.name}: deterministic visual layers from existing eligible candidates; design counts, not abundance.`,limitations:[...recipe.limitations,'Biome visual profile is art direction. Ground plants are unnamed decorative forms; regional species evidence remains unverified locally.']};
}
export function biomeCompositionProfile(recipe:SceneRecipe):EncounterCompositionProfile{
 const p=biomeVisualProfile(recipe),base=pugetCompositionProfile(recipe.seed);if(!p||p.id==='puget')return base;
 const a=activeArchetype(p.id);
 return {...base,background:a?.background??base.background,focal:{...base.focal,screenRadius:p.composition.enclosure>.8?[.2,.1]:[.34,.15]},framing:{...base.framing,treeClearance:a?.framing.treeClearance??3},light:{position:p.light.position,color:p.light.sun,intensity:p.light.intensity,ambientColor:p.light.ambient,ambientIntensity:p.light.fill,shadowSoftness:a?4:2,shadowStrength:.72},emphasis:{count:a?2:3,strength:.55}};
}
/** Non-Puget adapter; no changes to the protected Puget ground/sky/material pipeline. */
export function dressBiome(scene:T.Scene,recipe:SceneRecipe,p:BiomeVisualProfile){
 const a=activeArchetype(p.id),v4=p.id==='amazon'&&rainforestV4();
 const r=randomSource(recipe.seed+'|biome-dressing|'+p.id),textures:T.Texture[]=[];let disposed=false;
 const edge=scene.children.find(o=>o instanceof T.Mesh&&o.geometry.type==='BoxGeometry');if(edge)edge.position.y=-9;
 const ground=scene.children.find(o=>o instanceof T.Mesh&&o.geometry.type==='PlaneGeometry') as T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>;
 const map=p.ground.texture?new T.TextureLoader().load(p.ground.texture,()=>{scene.userData.artRevision=(scene.userData.artRevision??0)+1;}):landscapeGrass(recipe.seed,1024,p.ground.palette);textures.push(map);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(100/p.ground.tileMeters,100/p.ground.tileMeters);map.anisotropy=4;ground.material.map=map;ground.material.color.set(v4?'#c2ad8d':p.id==='amazon'?'#849c73':'#e8d593');
 const positions=ground.geometry.getAttribute('position'),colors=ground.geometry.getAttribute('color'),soil=new T.Color(p.ground.soil);for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i),wear=(.5+.5*Math.sin(x*.18+Math.sin(z*.12)))*p.ground.exposedSoil,c=new T.Color('#ffffff').lerp(soil,wear*.5);colors.setXYZ(i,c.r,c.g,c.b);}colors.needsUpdate=true;ground.material.needsUpdate=true;
 const opening=a?.opening??p.composition.opening;
 ground.material.onBeforeCompile=shader=>{shader.vertexShader='varying vec3 biomeWorld;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nbiomeWorld=(modelMatrix*vec4(transformed,1.)).xyz;');shader.fragmentShader='varying vec3 biomeWorld;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',a?`
 vec2 q=(biomeWorld.xz-vec2(${a.focal}))/vec2(${a.focalWidth});
 float broken=.82+.18*sin(biomeWorld.x*.21+sin(biomeWorld.z*.13)*1.8);
 float focal=exp(-dot(q,q)*1.3)*broken;
 float lightPatch=sin(biomeWorld.x*.12+biomeWorld.z*.15+sin(biomeWorld.z*.21));
 float nearEdge=smoothstep(9.,30.,biomeWorld.z)*(1.-exp(-pow(biomeWorld.x/7.,2.))*.3);
 outgoingLight*=mix(vec3(.69,.82,.84),vec3(1.36,1.18,.78),clamp(.32+focal*${a.focalWarmth}+lightPatch*.12,0.,1.))*(1.-nearEdge*${a.edgeShade});
 #include <opaque_fragment>`:`float focal=exp(-dot(biomeWorld.xz/vec2(${opening[0]},${opening[1]}),biomeWorld.xz/vec2(${opening[0]},${opening[1]})));float edge=smoothstep(5.,29.,biomeWorld.z);outgoingLight*=mix(vec3(1.),vec3(1.25,1.17,.91),focal*${p.composition.focalStrength})*(1.-edge*${p.composition.edgeShade});\n#include <opaque_fragment>`);};
 scene.fog=new T.Fog(p.sky.haze,p.sky.near,p.sky.far);scene.background=new T.Color(p.sky.haze);if(a?.id==='rainforest-interior'&&!v4)scene.fog=new T.Fog('#436a60',25,90);
 const skyMaterial=new T.MeshBasicMaterial({color:p.sky.tint,side:T.BackSide,depthWrite:false,fog:false,toneMapped:false}),skyMesh=new T.Mesh(new T.SphereGeometry(170,24,12),skyMaterial);skyMesh.renderOrder=-10;scene.add(skyMesh);const skyTexture=new T.TextureLoader().load(p.sky.asset,map=>{if(disposed)return;map.colorSpace=T.SRGBColorSpace;map.wrapS=T.RepeatWrapping;map.offset.set(.06,.1);skyMaterial.map=map;skyMaterial.needsUpdate=true;scene.userData.artRevision=(scene.userData.artRevision??0)+1;});textures.push(skyTexture);
 // Broad horizontal horizon geometry, kept subordinate to tree silhouettes.
 const hillGeometry=new T.SphereGeometry(1,48,12);
 if(a){const hp=hillGeometry.getAttribute('position');for(let i=0;i<hp.count;i++){const x=hp.getX(i),y=hp.getY(i),z=hp.getZ(i);hp.setY(i,y*(1+.19*Math.sin(x*8+z*3)+.12*Math.sin(x*17+1)));}hillGeometry.computeVertexNormals();}
 const hill=new T.Mesh(hillGeometry,new T.MeshBasicMaterial({color:p.landscape.color,fog:!!a}));hill.scale.set(110,a?.horizon.height??(p.landscape.kind==='open-horizon'?4:11),25);hill.position.set(20,a?-2:0,-80);hill.visible=!v4;scene.add(hill);
 if(v4)rainforestUnderstory(scene,recipe);
 const disposeDepth=v4&&rainforestV5()?mountRainforestDepth(scene,recipe,ground):undefined;
 if(!v4){
 const blade=new T.BufferGeometry(),v:number[]=[],c:number[]=[];
 const triangle=(points:number[][])=>{for(const [x,y,z] of points){v.push(x,y,z);const color=new T.Color(p.vegetation.palette[y>.4?1:0]);c.push(color.r,color.g,color.b);}};
 for(let j=0;j<6;j++){const angle=j*2.399,dx=Math.cos(angle),dz=Math.sin(angle),width=p.vegetation.bladeWidth;
  if(a?.id==='rainforest-interior'){
   // Reusable unnamed arching broad leaves, not invented species occurrences.
   for(let k=0;k<4;k++){const t=k/4,u=(k+1)/4;
    const point=(f:number,side:number)=>{const w=Math.sin(f*Math.PI)*.18;return [dx*f*.85-dz*w*side,Math.sin(f*Math.PI*.8)*.78+.07,dz*f*.85+dx*w*side];};
    const l=point(t,-1),rr=point(t,1),nl=point(u,-1),nr=point(u,1);triangle([l,rr,nl]);triangle([rr,nr,nl]);
   }
  }else if(a){
   const h=.65+j*.06,bend=.28+j*.025;
   triangle([[-dz*width,0,dx*width],[dz*width,0,-dx*width],[dx*bend-dz*width*.65,h*.65,dz*bend+dx*width*.65]]);
   triangle([[dz*width,0,-dx*width],[dx*bend+dz*width*.65,h*.65,dz*bend-dx*width*.65],[dx*bend-dz*width*.65,h*.65,dz*bend+dx*width*.65]]);
   triangle([[dx*bend-dz*width*.65,h*.65,dz*bend+dx*width*.65],[dx*bend+dz*width*.65,h*.65,dz*bend-dx*width*.65],[dx*(bend+.18),h,dz*(bend+.18)]]);
  }else triangle([[-dz*width,0,dx*width],[dz*width,0,-dx*width],[dx*.4,.6+j*.06,dz*.4]]);
 }
 blade.setAttribute('position',new T.Float32BufferAttribute(v,3));blade.setAttribute('color',new T.Float32BufferAttribute(c,3));blade.computeVertexNormals();
 const mat=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:1}),o=new T.Object3D();for(const [name,count,size] of [['grass',p.vegetation.grass,1],['shrub',p.vegetation.shrubs,2],['understory',p.vegetation.understory,3]] as const){const mesh=new T.InstancedMesh(blade,mat,count);mesh.name='biome-'+name;for(let i=0;i<count;i++){let x=(r()-.5)*92,z=(r()-.5)*86;const open=Math.hypot(x/opening[0],(z-3)/opening[1]);if(open<1){x+=(x<0?-1:1)*opening[0];}let scale=(.5+r()*.8)*size;if(a){const group=i%19,phase=group*2.399,rad=13+(group%5)*5;x=Math.cos(phase)*rad+(r()-.5)*9;z=5+Math.sin(phase)*rad+(r()-.5)*10;if(name==='grass'&&i%3===0){x=(i%2?-1:1)*(6+r()*26);z=23+r()*10;}const gap=Math.hypot(x/opening[0],(z+2)/opening[1]);if(gap<1)x=(x<0?-1:1)*(opening[0]+2+r()*4);scale*=z>18?a.framing.grassScale:.8+r()*.5;}if(p.id==='amazon'&&a){const supports=recipe.trees.filter(t=>t.position[2]<18),support=supports[Math.floor(r()*supports.length)];if(support){const angle=r()*Math.PI*2,spread=1.2+r()*3.2;x=support.position[0]+Math.cos(angle)*spread;z=support.position[2]+Math.sin(angle)*spread;}if(Math.hypot(x/5,(z+2)/10)<1)x=(x<0?-1:1)*(6+r()*2);scale*=name==='grass'?.5:name==='shrub'?.34:.25;}
 o.position.set(x,terrainHeight(x,z,recipe.seed)-.02,z);o.rotation.set(0,r()*Math.PI*2,0);o.scale.set(scale,scale*p.vegetation.height,scale);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);}if(a){mesh.instanceColor=new T.InstancedBufferAttribute(new Float32Array(count*3),3);for(let i=0;i<count;i++){const tint=new T.Color(p.vegetation.palette[i%3?0:1]).lerp(new T.Color('#ffffff'),.35);mesh.setColorAt(i,tint);}}mesh.receiveShadow=true;scene.add(mesh);}
 }
 if(!v4&&p.composition.enclosure>.8){for(let i=0;i<3;i++){const shaft=new T.Mesh(new T.PlaneGeometry(1.3,22),new T.MeshBasicMaterial({color:'#ffe3ac',transparent:true,opacity:.045,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending}));shaft.position.set(-5+i*5,12,-8-i*7);shaft.rotation.z=-.25;scene.add(shaft);}}
 scene.userData.compositionArchetype=a?.id;scene.userData.biomeVisual={id:p.id,version:v4?(rainforestV5()?'v5':'v4'):'v3',profile:p,treeCount:recipe.trees.length};return()=>{disposed=true;disposeDepth?.();textures.forEach(t=>t.dispose());};
}

/** Shared life-form geometry for Amazon V4; artistic dressing, not named occurrence records. */
function rainforestUnderstory(scene:T.Scene,recipe:SceneRecipe){
 const rand=randomSource(recipe.seed+'|rainforest-understory-v4'),material=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.9});
 const geometry=(kind:'broadleaf'|'fern'|'palm'|'shrub')=>{
  const vertices:number[]=[],colors:number[]=[];const triangle=(a:T.Vector3,b:T.Vector3,c:T.Vector3)=>{for(const p of [a,b,c]){vertices.push(p.x,p.y,p.z);const color=new T.Color('#244b35').lerp(new T.Color('#8ba94d'),T.MathUtils.clamp(p.y/2,0,1)*.75);colors.push(color.r,color.g,color.b);}};
  if(kind==='fern'||kind==='palm'){
   const palm=kind==='palm',fronds=palm?7:6,leaflets=palm?12:10,reach=palm?1.65:1.05,base=palm?1.2:.06;
   for(let j=0;j<fronds;j++){
    const angle=j*Math.PI*2/fronds+.17,dir=new T.Vector3(Math.cos(angle),0,Math.sin(angle)),side=new T.Vector3(-dir.z,0,dir.x);
    const center=(t:number)=>dir.clone().multiplyScalar(t*reach).setY(base+Math.sin(t*Math.PI*.85)*(palm?.85:.65));
    for(let k=0;k<leaflets;k++){
     const t=.07+k/leaflets*.86,root=center(t),next=center(t+.07),width=(palm?.43:.28)*Math.sin(t*Math.PI);
     triangle(root.clone().addScaledVector(side,-.009),root.clone().addScaledVector(side,.009),next);
     for(const sign of [-1,1]){const tip=root.clone().addScaledVector(side,width*sign).addScaledVector(dir,palm?.23:.12).add(new T.Vector3(0,palm?-.16:.03,0)),mid=root.clone().lerp(tip,.5).addScaledVector(dir,-.05);triangle(root,mid,tip);triangle(root,tip,mid.clone().addScaledVector(dir,.09));}
    }
   }
   if(palm){for(let i=0;i<4;i++){const a=i*Math.PI/2,b=(i+1)*Math.PI/2;triangle(new T.Vector3(Math.cos(a)*.025,0,Math.sin(a)*.025),new T.Vector3(Math.cos(b)*.025,0,Math.sin(b)*.025),new T.Vector3(0,base,0));}}
  }else{
   const leaves=kind==='shrub'?18:7;
   for(let j=0;j<leaves;j++){
    const angle=j*2.399,dir=new T.Vector3(Math.cos(angle),0,Math.sin(angle)),side=new T.Vector3(-dir.z,0,dir.x),rootY=kind==='shrub'?.12+(j%4)*.16:.03,reach=.65+(j%3)*.16;
    const point=(t:number,sign:number)=>dir.clone().multiplyScalar(t*reach).addScaledVector(side,Math.sin(t*Math.PI)*.18*sign).setY(rootY+Math.sin(t*Math.PI*.8)*(.45+(j%3)*.14));
    for(let k=0;k<4;k++){const t=k/4,u=(k+1)/4;triangle(point(t,-1),point(t,1),point(u,-1));triangle(point(t,1),point(u,1),point(u,-1));}
   }
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();return geo;
 };
 const broad=geometry('broadleaf'),fern=geometry('fern'),palm=geometry('palm'),shrub=geometry('shrub');
 const curve=new T.CatmullRomCurve3(Array.from({length:10},(_,i)=>new T.Vector3(Math.sin(i*.85)*.12,i/9,Math.cos(i*.6)*.1)));
 const vine=new T.TubeGeometry(curve,18,.008,4,false);const vc=new Float32Array(vine.getAttribute('position').count*3),vineColor=new T.Color('#4b6341');for(let i=0;i<vc.length;i+=3)vc.set(vineColor.toArray(),i);vine.setAttribute('color',new T.BufferAttribute(vc,3));
 const matrix=new T.Object3D(),supports=recipe.trees.filter(t=>t.model.dimensions.height>18),batches=[['seedlings',broad,180],['ferns',fern,150],['palms',palm,90],['shrubs',shrub,120],['lianas',vine,72],['epiphytes',broad,100]] as const;
 const stats:{name:string;instances:number;triangles:number}[]=[];
 for(const [name,geo,count] of batches){
  const mesh=new T.InstancedMesh(geo,material,count);mesh.name='rainforest-v4-'+name;
  for(let i=0;i<count;i++){
   const tree=supports[i%supports.length]??recipe.trees[i%recipe.trees.length];if(!tree)continue;
   const angle=rand()*Math.PI*2;let x=tree.position[0]+Math.cos(angle)*(1.5+rand()*4),z=tree.position[2]+Math.sin(angle)*(1.5+rand()*4),y:number,scale=.55+rand()*.65;
   if(name==='epiphytes'||name==='lianas'){
    const height=tree.model.dimensions.height,offset=Math.max(.25,tree.model.parameters.trunkRadius*.65);x=tree.position[0]+Math.cos(angle)*offset;z=tree.position[2]+Math.sin(angle)*offset;
    y=tree.position[1]+(name==='epiphytes'?height*(.15+rand()*.3):i%3===0?0:height*.3);scale=name==='epiphytes'?.35+rand()*.45:.7+rand()*.5;
    matrix.scale.set(scale,name==='lianas'?height*(.3+rand()*.24):scale,scale);
   }else{
    if(i%4===0){x=(i%2?-1:1)*(5.5+rand()*8);z=18+rand()*11;scale*=1.35;}
    if(Math.hypot(x/5.5,z/10)<1.3)x=(x<0?-1:1)*(6.5+rand()*3);
    y=terrainHeight(x,z,recipe.seed)-.015;matrix.scale.set(scale,scale,scale);
   }
   matrix.position.set(x,y,z);matrix.rotation.set(0,angle,(name==='epiphytes'?.25:0));matrix.updateMatrix();mesh.setMatrixAt(i,matrix.matrix);mesh.setColorAt(i,new T.Color('#c1cf9a').lerp(new T.Color('#729a7a'),rand()*.6));
  }
  mesh.receiveShadow=true;mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();scene.add(mesh);stats.push({name,instances:count,triangles:count*(geo.index?geo.index.count:geo.getAttribute('position').count)/3});
 }
 // Narrow soft-edged hints at canopy openings; not volumetric scattering.
 for(const [x,z] of [[-3,-2],[4,-9]]){
  const mat=new T.ShaderMaterial({uniforms:{color:{value:new T.Color('#ffe4ac')}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 color;varying vec2 v;void main(){float a=pow(max(0.,1.-abs(v.x-.5)*2.),3.)*smoothstep(0.,.22,v.y)*(1.-smoothstep(.78,1.,v.y))*.035;gl_FragColor=vec4(color,a);}',transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending});
  const shaft=new T.Mesh(new T.PlaneGeometry(1.2,16),mat);shaft.position.set(x,terrainHeight(x,z,recipe.seed)+8,z);shaft.rotation.z=-.44;shaft.name='rainforest-v4-soft-shaft';scene.add(shaft);
 }
 scene.userData.rainforestV4={understory:stats,canopyPlacement:'deterministic greedy crown-footprint occupancy; source foliage density unchanged',limitations:['Unnamed procedural life-form dressing, not measured occurrence or dedicated botanical assets.','Shafts are soft planar hints, not volumetric scattering.']};
}
