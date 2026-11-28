import * as THREE from 'three';
import type {SceneRecipe} from './recipe';
import {cameraSpace,landscapeField,type FieldPlan} from './wave1-fields';
import {randomSource} from './random';

/** A folded, tapered solid leaf: the central ridge catches light without alpha cards. */
function leafGeometry(){
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,-.25,.02,.34,0,.095,.42,.25,.02,.34,-.19,.04,.72,0,.09,.75,.19,.04,.72,0,.025,1],3));
 g.setIndex([0,2,1,0,3,2,1,2,4,2,5,4,2,3,6,2,6,5,4,5,7,5,6,7]);g.computeVertexNormals();return g;
}
interface Instance {matrix:THREE.Matrix4;color:THREE.Color}

/** Local art-study dressing only. No species identity, measured abundance or tidal occurrence inferred. */
export function installMangroveDetail(scene:THREE.Scene,recipe:SceneRecipe,plan:FieldPlan):()=>void{
 if(plan.biome!=='mangrove')return()=>{};
 const rand=randomSource(recipe.seed+'|mangrove-dimensional-shore-1'),group=new THREE.Group();group.name='mangrove-dimensional-shore-detail';
 const leaves:Instance[]=[],stems:Instance[]=[],litter:Instance[]=[],twigs:Instance[]=[],o=new THREE.Object3D();
 const field=(x:number,z:number)=>landscapeField('mangrove',recipe.seed,x,z);
 // Include leaf/lean extents, not merely stem anchors, around the requested footprint.
 const footprint=(x:number,z:number)=>{const q=cameraSpace(plan,x,z);return q.forward>1.25&&q.forward<7.75&&Math.abs(q.side)<2.25;};
 const put=(list:Instance[],x:number,y:number,z:number,rx:number,ry:number,rz:number,sx:number,sy:number,sz:number,color:THREE.Color)=>{o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);o.updateMatrix();list.push({matrix:o.matrix.clone(),color});};
 const segment=(list:Instance[],a:THREE.Vector3,b:THREE.Vector3,radius:number,color:THREE.Color)=>{o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());o.scale.set(radius,a.distanceTo(b),radius);o.updateMatrix();list.push({matrix:o.matrix.clone(),color});};
 let seedlings=0,pockets=0;
 const sources=recipe.trees.filter(t=>{const q=cameraSpace(plan,t.position[0],t.position[2]);return q.forward>-15&&q.forward<100&&Math.abs(q.side)<70;}).map(t=>({x:t.position[0],z:t.position[2],shore:false}));
 // Ten discontinuous lateral pockets frame the open character area. Placement follows
 // synthetic field height/slope, rather than treating a moisture proxy as botanical data.
 const shoreRand=randomSource(recipe.seed+'|mangrove-near-margin-pockets');
 for(const side of [-1,1])for(let band=0;band<5;band++){
  const forward=[3.6,6.7,10.2,14.1,18][band]+(shoreRand()-.5)*.45,lateral=side*forward*(.61+shoreRand()*.1);
  const x=plan.eye[0]+Math.sin(plan.heading)*forward+Math.cos(plan.heading)*lateral,z=plan.eye[2]-Math.cos(plan.heading)*forward+Math.sin(plan.heading)*lateral;
  const f=field(x,z),slope=Math.max(Math.abs(field(x+.7,z).height-f.height),Math.abs(field(x,z+.7).height-f.height));
  if(f.height>.018&&f.height<.6&&slope<.1&&!footprint(x,z))sources.push({x,z,shore:true});
 }
 // Nested pockets follow actual tree anchors and continuous field-derived shore anchors.
 for(const source of sources){
  const tx=source.x,tz=source.z;
  for(let pocket=0;pocket<(source.shore?1:3);pocket++){
   const angle=rand()*Math.PI*2,distance=source.shore?.15+rand()*.4:1.5+rand()*4.8,px=tx+Math.cos(angle)*distance,pz=tz+Math.sin(angle)*distance,pf=field(px,pz);
   if(pf.height<.022||pf.height>.6||footprint(px,pz))continue;
   pockets++;
   const members=source.shore?4+Math.floor(rand()*3):2+Math.floor(rand()*3);
   for(let n=0;n<members;n++){
    const x=px+(rand()-.5)*1.6,z=pz+(rand()-.5)*1.6,f=field(x,z);
    if(f.height<.018||f.height>.62||footprint(x,z))continue;
    const q=cameraSpace(plan,x,z),height=(.35+rand()*.53)*(q.forward>55?.8:1)*(.85+f.moisture*.2)*(source.shore?1.08:1),yaw=rand()*Math.PI*2,lean=.05+rand()*.12;
    const base=new THREE.Vector3(x,f.height-.005,z),tip=new THREE.Vector3(x+Math.cos(yaw)*lean,f.height+height,z+Math.sin(yaw)*lean);
    segment(stems,base,tip,.009+height*.008,new THREE.Color('#626644'));seedlings++;
    const pairs=2+Math.floor(rand()*2);
    for(let p=0;p<pairs;p++)for(const side of [-1,1]){
     const t=.36+p*.22,az=yaw+side*Math.PI*.5+p*.65,length=(.22+rand()*.17)*(1-p*.12)*(source.shore?1.4:1),c=new THREE.Color('#57743a').lerp(new THREE.Color('#a2ad45'),t*.65+rand()*.2);
     // Leaf projects outward and slightly upwards from the slender stem.
     put(leaves,x+Math.cos(yaw)*lean*t,f.height+height*t,z+Math.sin(yaw)*lean*t,-.25-rand()*.5,az,(rand()-.5)*.3,length*(source.shore?1.2:1),length,length,c);
    }
   }
  }
  // Discontinuous litter patches fall near parent trees; visible mud remains between them.
  for(let cluster=0;cluster<(source.shore?2:6);cluster++){
   const a=rand()*Math.PI*2,r=source.shore?rand()*.9:1+rand()*6,cx=tx+Math.cos(a)*r,cz=tz+Math.sin(a)*r;
   const leafCount=8+Math.floor(rand()*9);
   for(let j=0;j<leafCount;j++){
    const x=cx+(rand()-.5)*2.3,z=cz+(rand()-.5)*2.3,f=field(x,z);
    if(f.height<.009||f.height>.65)continue;
    const length=.12+rand()*.19;
    put(litter,x,f.height+.007,z,(rand()-.5)*.06,rand()*Math.PI*2,(rand()-.5)*.06,length,length*.3,length,new THREE.Color('#55472d').lerp(new THREE.Color('#a78b45'),rand()*.8));
   }
  }
  // Fallen, ground-hugging fragments, never detached upright breathing-root claims.
  for(let j=0;j<2;j++){
   const a=rand()*6.283,r=1.2+rand()*2.6,x=tx+Math.cos(a)*r,z=tz+Math.sin(a)*r;
   if(footprint(x,z))continue;
   const endX=x+Math.cos(a+.7)*(.3+rand()*.7),endZ=z+Math.sin(a+.7)*(.3+rand()*.7),f=field(x,z),end=field(endX,endZ);
   if(f.height<.015||f.height>.38||end.height<.015||Math.abs(end.height-f.height)>.07||footprint(endX,endZ))continue;
   segment(twigs,new THREE.Vector3(x,f.height+.025,z),new THREE.Vector3(endX,end.height+.025,endZ),.022+rand()*.018,new THREE.Color('#5e5038'));
  }
 }
 const leaf=leafGeometry(),cylinder=new THREE.CylinderGeometry(.65,1,1,5,1);
 const leafMaterial=new THREE.MeshStandardMaterial({roughness:.83,side:THREE.DoubleSide}),woodMaterial=new THREE.MeshStandardMaterial({roughness:1});
 const mount=(name:string,geometry:THREE.BufferGeometry,material:THREE.Material,instances:Instance[],shadow:boolean)=>{
  const mesh=new THREE.InstancedMesh(geometry,material,instances.length);mesh.name=name;
  instances.forEach((v,i)=>{mesh.setMatrixAt(i,v.matrix);mesh.setColorAt(i,v.color);});mesh.computeBoundingSphere();mesh.castShadow=shadow;mesh.receiveShadow=true;group.add(mesh);
 };
 mount('mangrove-unnamed-juvenile-leaves',leaf,leafMaterial,leaves,true);mount('mangrove-unnamed-juvenile-stems',cylinder,woodMaterial,stems,true);
 mount('mangrove-low-folded-leaf-litter',leaf,leafMaterial,litter,false);mount('mangrove-fallen-shore-twigs',cylinder,woodMaterial,twigs,true);
 const hidden:THREE.Object3D[]=[];scene.traverse(child=>{if(child.name==='field-correlated-low-vegetation'&&child.visible){child.visible=false;hidden.push(child);}});
 scene.add(group);scene.userData.mangroveDetail={version:3,pockets,nearShoreAnchors:sources.filter(s=>s.shore).length,seedlings,leaves:leaves.length,litter:litter.length,twigs:twigs.length,drawCalls:4,footprint:'forward 2..7m, abs(side)<1.5m: no plants/twigs; litter below .03m',ecology:'Unnamed juvenile growth forms and fallen fragments; synthetic moisture/tree/shore association, no species or occurrence claim'};
 scene.userData.recipeShadowDirty=true;
 return()=>{scene.remove(group);hidden.forEach(child=>{child.visible=true;});leaf.dispose();cylinder.dispose();leafMaterial.dispose();woodMaterial.dispose();delete scene.userData.mangroveDetail;};
}
