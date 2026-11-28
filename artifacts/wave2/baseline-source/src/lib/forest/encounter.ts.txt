import {biomeVisualProfile,composeBiomeEncounter,dressBiome} from './biome-visual';
import {landscapeMode,mountainRidges} from './landscape-detail';
import {mountEnvironmentGround} from './environment-foundations';
import * as T from 'three';
import {randomSource} from './random';
import {terrainHeight,type SceneRecipe} from './recipe';
import type {CameraView} from './render-types';
export type EncounterRecipe=SceneRecipe&{encounter?:{version:'puget-encounter-v1';camera:'human'|'inspection';reserved:{x:number;z:number;radiusX:number;radiusZ:number}}};
/** Composition only. Never chooses species, generates tree geometry or alters ecological evidence. */
export function composeEncounter(recipe:SceneRecipe,camera:'human'|'inspection'='human'):EncounterRecipe{
 const visual=biomeVisualProfile(recipe);
 if(visual&&visual.id!=='puget'&&camera!=='inspection')return composeBiomeEncounter(recipe,visual);
 if(recipe.ecoregion?.ECO_ID!==364||camera==='inspection')return recipe;
 const framing=typeof location==='undefined'||new URLSearchParams(location.search).get('cornerFraming')!=='off';
 const r=randomSource(recipe.seed+'|encounter-v1'),n=recipe.trees.length;
 const trees=recipe.trees.map((tree,i)=>{
  let x:number,z:number;
  if(i<4){x=(i%2?-1:1)*(15+r()*6);z=19+r()*9;}
  else if(i<10){x=(i%2?-1:1)*(22+r()*9);z=-4+r()*19;}
  else if(i<16){x=(i%2?-1:1)*(17+r()*15);z=-16-r()*8;}
  else{x=-44+(i-16)/Math.max(1,n-17)*88+(r()-.5)*3;z=-36-r()*8;}
  return {...tree,position:[x,terrainHeight(x,z,recipe.seed),z] as [number,number,number]};
 });
 // Render composition instances reuse existing ecological candidates and geometry; not abundance data.
 if(framing&&trees.length){const variants=trees.filter(t=>t.studio&&t.model.dimensions.crownWidth>5),jitter=randomSource(recipe.seed+'|left-forest-continuation');const next=Math.max(...trees.map(t=>t.index))+1;
  for(let i=0;i<7&&variants.length;i++){const source=variants[(i*3+1)%variants.length],x=-96+i*8,z=-48-jitter()*8;trees.push({...source,id:`${source.id}-left-backdrop-${i}`,index:next+i,position:[x,terrainHeight(x,z,recipe.seed),z],rotation:source.rotation+(jitter()-.5)*.8});}
 }
 return {...recipe,trees,encounter:{version:'puget-encounter-v1',camera,reserved:{x:0,z:5,radiusX:11,radiusZ:18}},distribution:'Seeded asymmetric framing, side groves, midground shoulders and rear treeline; art-directed clearing, not observed stand structure.',limitations:[...recipe.limitations,'Encounter grass, shrubs, rocks and sky are unnamed artistic set dressing, not occurrence records or sampled land cover.']};
}
export function encounterCamera(recipe:EncounterRecipe):CameraView|undefined{
 if(!recipe.encounter)return;
 const visual=biomeVisualProfile(recipe);if(visual&&visual.id!=='puget')return visual.composition.camera;
 return recipe.encounter.camera==='inspection'?{position:[58,39,70],target:[0,9,0]}:{position:[0,terrainHeight(0,34,recipe.seed)+1.7,34],target:[-2,6,-20]};
}
/** A few shared batches, no per-frame geometry generation. Existing renderer owns mesh disposal. */
export function dressEncounter(scene:T.Scene,recipe:EncounterRecipe,mobile=false,foundations=true){
 if(!recipe.encounter)return ()=>{};
 const visual=biomeVisualProfile(recipe);if(visual&&visual.id!=='puget')return dressBiome(scene,recipe,visual);
 const rand=randomSource(recipe.seed+'|encounter-dressing'),textures:T.Texture[]=[];
 const canvas=(w:number,h:number)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 const ground=scene.children.find(o=>o instanceof T.Mesh&&o.geometry.type==='PlaneGeometry') as T.Mesh<T.PlaneGeometry,T.MeshStandardMaterial>|undefined;
 if(ground&&!foundations){
  const c=canvas(256,256),g=c.getContext('2d')!;g.fillStyle='#c2c18b';g.fillRect(0,0,256,256);
  for(let i=0;i<2400;i++){const x=rand()*256,y=rand()*256;g.strokeStyle=i%3?'rgba(65,95,44,.16)':'rgba(245,231,166,.2)';g.lineWidth=.5+rand()*2;g.beginPath();g.moveTo(x,y);g.lineTo(x+rand()*6-3,y-2-rand()*6);g.stroke();}
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(22,22);textures.push(tex);ground.material.map=tex;ground.material.needsUpdate=true;
  const p=ground.geometry.getAttribute('position'),colors=ground.geometry.getAttribute('color'),grass=new T.Color('#9aaf62'),dirt=new T.Color('#bba17a');
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),path=Math.exp(-Math.pow((x-3*Math.sin(z*.07))/2.6,2))*.7,noise=Math.sin(x*.27+z*.17)*.035;const color=grass.clone().lerp(dirt,path).multiplyScalar(1+noise);colors.setXYZ(i,color.r,color.g,color.b);}colors.needsUpdate=true;
 }
 // Preserve the previous dressing stream: its old ground consumed five samples per stroke.
 if(ground&&foundations)for(let i=0;i<2400*5;i++)rand();
 const skyCanvas=canvas(2048,1024),ctx=skyCanvas.getContext('2d')!,gradient=ctx.createLinearGradient(0,0,0,1024);gradient.addColorStop(0,'#4d8cbe');gradient.addColorStop(.52,'#a4d4df');gradient.addColorStop(1,'#e0e8cf');ctx.fillStyle=gradient;ctx.fillRect(0,0,2048,1024);
 // Broad illustrated cloud groups, shaded bottoms and warm illuminated upper edges.
 for(let i=0;i<18;i++){const x=rand()*2048,y=260+rand()*240,w=80+rand()*160;for(let j=0;j<12;j++){const u=j/11,cx=x+(u-.5)*w,cy=y-Math.sin(u*Math.PI)*w*.16,rx=w*(.12+rand()*.13),ry=rx*.5;ctx.fillStyle=j%3===0?'#d5dfe2':'#f5f0df';ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,250,224,.7)';ctx.beginPath();ctx.ellipse(cx-3,cy-ry*.3,rx*.85,ry*.65,0,Math.PI,Math.PI*2);ctx.fill();}}
 const skyTex=new T.CanvasTexture(skyCanvas);skyTex.colorSpace=T.SRGBColorSpace;textures.push(skyTex);const sky=new T.Mesh(new T.SphereGeometry(170,32,16),new T.MeshBasicMaterial({map:skyTex,side:T.BackSide,depthWrite:false,fog:false}));sky.renderOrder=-10;scene.add(sky);scene.fog=new T.Fog('#c5d9cc',42,145);
 let skyDisposed=false;
 if(typeof location==='undefined'||new URLSearchParams(location.search).get('clouds')!=='procedural'){
  const matte=new T.TextureLoader().load('/assets/puget-v1/sky-matte-v1.webp',map=>{
   if(skyDisposed)return;map.colorSpace=T.SRGBColorSpace;map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;
   // Fit the illustrated horizon to the visible sky band, with calm pole colours outside it.
   map.repeat.set(1,1);map.offset.set(.06,.1);map.wrapS=T.RepeatWrapping;
   sky.material.map=map;sky.material.toneMapped=false;sky.material.needsUpdate=true;
   scene.userData.skyBackdrop={asset:'sky-matte-v1.webp',type:'generated illustrative matte painting'};
   scene.userData.artRevision=(scene.userData.artRevision??0)+1;
  },undefined,()=>{scene.userData.skyBackdropError='Matte painting unavailable; procedural sky retained.';});textures.push(matte);
 }

 // Low rolling, atmospheric backdrop geometry, not a geographic elevation reconstruction.
 let disposeRidges=()=>{};
 if(landscapeMode()!=='A')disposeRidges=mountainRidges(scene,recipe.seed);
 else for(let layer=0;layer<2;layer++){const positions:number[]=[];for(let i=0;i<30;i++){const x=-120+i*8,x2=x+8,z=-65-layer*24,y=8+layer*5+Math.sin(i*.4+layer)*5+Math.sin(i*.9)*2,y2=8+layer*5+Math.sin((i+1)*.4+layer)*5+Math.sin((i+1)*.9)*2;positions.push(x,-4,z,x,y,z,x2,y2,z,x,-4,z,x2,y2,z,x2,-4,z);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.computeVertexNormals();scene.add(new T.Mesh(geo,new T.MeshBasicMaterial({color:layer?'#a0bdb5':'#789c8b',side:T.DoubleSide})));}
 const blades=new T.BufferGeometry(),vertices:number[]=[],colors:number[]=[];
 for(let i=0;i<6;i++){const a=i*2.399,dx=Math.cos(a),dz=Math.sin(a),h=.6+(i%3)*.13;for(const [x,y,z] of [[-.06*dz,0,.06*dx],[.06*dz,0,-.06*dx],[dx*.32,h,dz*.32]]){vertices.push(x,y,z);const color=new T.Color(y?'#adc779':'#425d3d');colors.push(color.r,color.g,color.b);}}
 blades.setAttribute('position',new T.Float32BufferAttribute(vertices,3));blades.setAttribute('color',new T.Float32BufferAttribute(colors,3));blades.computeVertexNormals();
 const mat=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:1});const matrix=new T.Object3D();
 const scatter=(count:number,shrub:boolean)=>{const mesh=new T.InstancedMesh(blades,mat,count);for(let i=0;i<count;i++){let x=(rand()-.5)*88,z=(rand()-.5)*82;const clearing=Math.abs(x)<11&&z>-13&&z<27;if(clearing){x+=(x<0?-1:1)*12;}const scale=shrub?1.8+rand()*2:.35+rand()*.8;matrix.position.set(x,terrainHeight(x,z,recipe.seed),z);matrix.rotation.set(0,rand()*6.28,0);matrix.scale.set(scale,scale*(shrub?.7:1),scale);matrix.updateMatrix();mesh.setMatrixAt(i,matrix.matrix);}mesh.receiveShadow=true;scene.add(mesh);};if(foundations){for(let i=0;i<1600*4;i++)rand();}else scatter(1600,false);scatter(65,true);
 const cornerFraming=typeof location==='undefined'||new URLSearchParams(location.search).get('cornerFraming')!=='off';
 const rockGeo=new T.IcosahedronGeometry(1,0),pos=rockGeo.getAttribute('position');for(let i=0;i<pos.count;i++)pos.setXYZ(i,pos.getX(i)*(1+rand()*.2),pos.getY(i)*.65,pos.getZ(i)*(1+rand()*.2));rockGeo.computeVertexNormals();const rocks=new T.InstancedMesh(rockGeo,new T.MeshStandardMaterial({color:'#818776',roughness:1}),cornerFraming?40:32);for(let i=0;i<32;i++){const x=(i%2?-1:1)*(12+rand()*25),z=-22+rand()*48,s=.4+rand()*1.1;matrix.position.set(x,terrainHeight(x,z,recipe.seed)+s*.3,z);matrix.rotation.set(0,rand()*6.28,0);matrix.scale.set(s,s,s*.8);matrix.updateMatrix();rocks.setMatrixAt(i,matrix.matrix);}if(cornerFraming){const random=randomSource(recipe.seed+'|corner-boulders'),anchors=[[-15.5,12,3.1],[-16.5,8,1.7],[-18,15,2.2],[-10.5,10,.9],[-23,18,2.6],[13.5,9,.8],[20,15,1.25],[25,20,1.7]];
 for(let i=0;i<anchors.length;i++){const [x,z,size]=anchors[i];matrix.position.set(x,terrainHeight(x,z,recipe.seed)+size*.3,z);matrix.rotation.set((random()-.5)*.18,random()*6.28,0);matrix.scale.set(size,size*(.8+random()*.3),size*(.8+random()*.25));matrix.updateMatrix();rocks.setMatrixAt(32+i,matrix.matrix);}addCornerVegetation(scene,recipe.seed);}
 rocks.receiveShadow=true;rocks.castShadow=true;scene.add(rocks);
 const disposeGround=foundations?mountEnvironmentGround(scene,recipe,recipe.encounter.reserved,mobile):()=>{};
 return ()=>{skyDisposed=true;disposeRidges();disposeGround();textures.forEach(t=>t.dispose());};
}

/** Unnamed painterly understory fronds; one shared geometry/material and one instanced draw. */
function addCornerVegetation(scene:T.Scene,seed:string){
 const positions:number[]=[],colors:number[]=[],r=randomSource(seed+'|corner-understory');
 const point=(v:T.Vector3,t:number)=>{positions.push(v.x,v.y,v.z);const c=new T.Color('#315a47').lerp(new T.Color('#819d58'),t);colors.push(c.r,c.g,c.b);};
 for(let f=0;f<5;f++){const angle=f*2.399,forward=new T.Vector3(Math.cos(angle),0,Math.sin(angle)),side=new T.Vector3(-Math.sin(angle),0,Math.cos(angle));
  for(let j=0;j<7;j++){const u=(j+1)/8,center=forward.clone().multiplyScalar(u*1.25);center.y=Math.sin(u*Math.PI*.82)*1.05;const width=(1-u)*.36+.045;
   for(const sign of [-1,1]){const tip=center.clone().addScaledVector(side,width*sign).addScaledVector(forward,.2);tip.y+=.09;const base=center.clone().addScaledVector(forward,-.1),bend=center.clone().addScaledVector(side,width*sign*.4).addScaledVector(forward,.12);bend.y+=.04;point(base,u*.4);point(tip,.35+u*.55);point(bend,.2+u*.6);}
  }
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const mesh=new T.InstancedMesh(geo,new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:1}),26),o=new T.Object3D();
 const patches=[[-15,8,3,4],[-12,16,3.5,4],[-22,12,5,8],[14,10,4,7],[21,17,5,7]];
 for(let i=0;i<26;i++){const [cx,cz,rx,rz]=patches[i<17?i%3:3+i%2],x=cx+(r()-.5)*rx*2,z=cz+(r()-.5)*rz*2,scale=.65+r()*.9;o.position.set(x,terrainHeight(x,z,seed)-.03,z);o.rotation.set(0,r()*6.28,0);o.scale.setScalar(scale);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);}mesh.receiveShadow=true;mesh.name='corner-understory-framing';scene.add(mesh);
}
