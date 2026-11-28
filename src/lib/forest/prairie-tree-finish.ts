import * as T from 'three';
import type {SceneTree} from './recipe';
import {randomSource} from './random';
import type {Point,Segment} from './tree';

/** Uneven, signed bends vary in spacing, amplitude and direction per limb.
 * Smooth interpolation avoids both straight rods and repeated bow-shaped arcs. Move descendants and foliage attachments with their parent. */
function bendRiparianLimbs(segments:Segment[],seed:string){
 const old=segments.map(s=>({...s,a:[...s.a] as Point,b:[...s.b] as Point})),paths=new Map<number,number[]>();
 segments.forEach((seg,i)=>{const list=paths.get(seg.pathId!)??[];list.push(i);paths.set(seg.pathId!,list);});
 const order=[...paths.values()].sort((a,b)=>segments[a[0]].depth-segments[b[0]].depth);
 for(const ids of order){
  const first=old[ids[0]],depth=first.depth;if(!depth)continue;
  const rand=randomSource(seed+'|angular-limb|'+first.pathId),start=new T.Vector3(...first.a),end=new T.Vector3(...old[ids.at(-1)!].b),shift=new T.Vector3();
  let root=segments[ids[0]].r0*.88,best=Infinity;
  for(let i=0;i<old.length;i++){
   const parent=old[i];if(parent.depth!==depth-1)continue;
   const a=new T.Vector3(...parent.a),axis=new T.Vector3(...parent.b).sub(a),t=T.MathUtils.clamp(start.clone().sub(a).dot(axis)/Math.max(.00001,axis.lengthSq()),0,1),point=a.addScaledVector(axis,t),distance=point.distanceToSquared(start);
   if(distance>=best)continue;best=distance;
   shift.copy(new T.Vector3(...segments[i].a).lerp(new T.Vector3(...segments[i].b),t).sub(point));
   root=Math.min(segments[ids[0]].r0*.88,T.MathUtils.lerp(segments[i].r0,segments[i].r1,t)*.62);
  }
  const length=start.distanceTo(end),side=end.clone().sub(start).cross(new T.Vector3(0,1,0)).normalize();if(side.lengthSq()<.01)side.set(1,0,0);
  // Separate bending draws preserve the retained per-path taper exactly.
  for(let draw=0;draw<6;draw++)rand();
  const bend=randomSource(seed+'|organic-riparian-bends-v1|'+first.pathId),count=2+Math.floor(bend()*3),knots=[0],points=[start.clone().add(shift)],up=new T.Vector3(0,1,0);
  let angle=bend()*Math.PI*2;
  for(let j=0;j<count;j++){
   const t=(j+1+(bend()-.5)*.48)/(count+1),amplitude=length*(.025+bend()*.060)*(depth===1?1:.8);
   angle+=Math.PI*(.58+bend()*.65);
   knots.push(t);points.push(start.clone().lerp(end,t).addScaledVector(side,Math.cos(angle)*amplitude).addScaledVector(up,Math.sin(angle)*amplitude).add(shift));
  }
  knots.push(1);points.push(end.clone().add(shift));
  const tangent=(i:number)=>{const a=Math.max(0,i-1),b=Math.min(points.length-1,i+1);return points[b].clone().sub(points[a]).divideScalar(knots[b]-knots[a]);};
  const tangents=points.map((_,i)=>tangent(i));
  const at=(t:number)=>{
   let i=0;while(i<knots.length-2&&t>knots[i+1])i++;
   const dt=knots[i+1]-knots[i],u=(t-knots[i])/dt,u2=u*u,u3=u2*u;
   return points[i].clone().multiplyScalar(2*u3-3*u2+1).addScaledVector(tangents[i],(u3-2*u2+u)*dt).addScaledVector(points[i+1],-2*u3+3*u2).addScaledVector(tangents[i+1],(u3-u2)*dt);
  };
  const distances=[0];for(const i of ids)distances.push(distances.at(-1)!+new T.Vector3(...old[i].a).distanceTo(new T.Vector3(...old[i].b)));
  const total=distances.at(-1)!,tip=Math.min(root*.025,depth===1?.012:depth===2?.005:.002),power=2.1+rand()*.75;
  ids.forEach((i,j)=>{const a=distances[j]/total,b=distances[j+1]/total;segments[i].a=at(a).toArray() as Point;segments[i].b=at(b).toArray() as Point;segments[i].r0=tip+(root-tip)*Math.pow(1-a,power);segments[i].r1=tip+(root-tip)*Math.pow(1-b,power);});
 }
 // Ring frames remain shared through the changed directions.
 for(const ids of order)ids.forEach((i,j)=>{const direction=(k:number)=>new T.Vector3(...segments[k].b).sub(new T.Vector3(...segments[k].a)).normalize(),axis=direction(i);segments[i].tangentA=(j?direction(ids[j-1]).add(axis).normalize():axis.clone()).toArray() as Point;segments[i].tangentB=(j<ids.length-1?direction(ids[j+1]).add(axis).normalize():axis.clone()).toArray() as Point;});
 return (index:number,point:Point)=>{
  const source=old[index],a=new T.Vector3(...source.a),axis=new T.Vector3(...source.b).sub(a),p=new T.Vector3(...point),t=T.MathUtils.clamp(p.clone().sub(a).dot(axis)/Math.max(.00001,axis.lengthSq()),0,1);
  return new T.Vector3(...segments[index].a).lerp(new T.Vector3(...segments[index].b),t).sub(a.addScaledVector(axis,t));
 };
}

/** Reference-informed approximation, isolated from the approved oak/willow assets.
 * Preserve specimen seeds, placement and overall crown envelope. */
export function finishPrairieTree(tree:SceneTree):SceneTree{
 const willow=tree.species.scientificName==='Salix nigra',cottonwood=tree.species.scientificName==='Populus deltoides';
 if(!tree.studio||!willow&&!cottonwood)return tree;
 const r=randomSource(tree.seed+'|riparian-finish-v1'),study=tree.studio;
 const segments:Segment[]=study.model.segments.map(s=>{const thickness=s.depth===0?.88:s.depth===1?.62:.56;return {...s,r0:s.r0*thickness,r1:s.r1*thickness,color:s.depth===0?'#716f61':'#847d69'};});
 // The inherited oak omits path metadata: independent cylinder frames leave
 // bright wedge seams. Recover contiguous limbs and share tangent frames.
 let pathId=0;
 const same=(a:Point,b:Point)=>a.every((v,i)=>Math.abs(v-b[i])<1e-5);
 const direction=(s:Segment)=>new T.Vector3(...s.b).sub(new T.Vector3(...s.a)).normalize();
 for(let i=0;i<segments.length;i++){
  const seg=segments[i],prev=segments[i-1],next=segments[i+1],before=prev&&prev.depth===seg.depth&&same(prev.b,seg.a),after=next&&next.depth===seg.depth&&same(seg.b,next.a);
  if(!before)pathId++;
  const axis=direction(seg);
  seg.pathId=pathId;seg.tangentA=(before?direction(prev).add(axis).normalize():axis.clone()).toArray() as Point;seg.tangentB=(after?direction(next).add(axis).normalize():axis.clone()).toArray() as Point;
  seg.capEnd=!after;seg.capStart=false;
 }
 const displacement=bendRiparianLimbs(segments,tree.seed);
 const groupShift=new Map(study.groups.map(g=>[g.id,displacement(g.branchIndex,g.anchor.map(v=>v*study.scale) as Point).divideScalar(study.scale)]));
 const groups=study.groups.map(g=>{const d=groupShift.get(g.id)!;return {...g,anchor:new T.Vector3(...g.anchor).add(d).toArray() as Point,center:new T.Vector3(...g.center).add(d).toArray() as Point};});
 const model={...study.model,presetId:willow?'willow':'aspen',segments,palette:{...study.model.palette,bark:'#716f61'}};
 // Match radii at consecutive joints before the shared renderer builds rings.
 const joints=new Map<string,{radius:number;count:number}>();
 for(const seg of segments)for(const [point,radius] of [[seg.a,seg.r0],[seg.b,seg.r1]] as const){const key=seg.pathId+'|'+point.join(',');const j=joints.get(key)??{radius:0,count:0};j.radius+=radius;j.count++;joints.set(key,j);}
 for(const seg of segments){const a=joints.get(seg.pathId+'|'+seg.a.join(','))!,b=joints.get(seg.pathId+'|'+seg.b.join(','))!;seg.r0=a.radius/a.count;seg.r1=b.radius/b.count;}
 const fronds=study.fronds.flatMap(f=>[0,1,2].map(copy=>{
  const offset=copy?.12+r()*.20:0,rotation=new T.Quaternion().fromArray(f.rotation);
  const twist=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),(r()-.5)*1.8),tilt=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),(r()-.5)*.9);rotation.multiply(twist).multiply(tilt);
  const d=groupShift.get(f.groupId)??new T.Vector3();
  const position:Point=[f.position[0]+(r()-.5)*offset+d.x,f.position[1]-(willow?offset*.65:0)+d.y,f.position[2]+(r()-.5)*offset+d.z];
  return {...f,position,rotation:rotation.toArray() as [number,number,number,number],width:f.width*(willow?.50+r()*.18:.63+r()*.13),length:f.length*(.64+r()*.23),curve:willow?.22:.15,tile:0,color:willow?'#75926a':'#839674',interior:.66+r()*.24,normal:[f.normal[0],f.normal[1]*.78+.13,f.normal[2]] as Point};
 }));
 return {...tree,model,studio:{...study,model,segments,groups,fronds},species:{...tree.species,visual:{...tree.species.visual,fallback:true,reason:'Reference-informed '+(willow?'black willow':'eastern cottonwood')+' study: slender secondary wood and existing '+(willow?'lanceolate willow':'broad poplar')+' sprays. Irregularly bending, rapidly tapering branching remains an approximation, not a measured species reconstruction.'}}};
}

/** Dedicated generated material, rather than a repeated analytic stripe shader. */
export function prairieBarkTexture(){
 const texture=new T.TextureLoader().load('/assets/prairie/black-willow-bark-v1.webp',()=>window.dispatchEvent(new Event('resize')));
 texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=4;return texture;
}

/** Branch-aligned metric UVs. The source retains one continuous path ID per limb. */
export function prairieWoodUV(geometry:T.BufferGeometry,inputs:{model:SceneTree['model']}[],far:boolean,mobile:boolean){
 const uv=geometry.getAttribute('uv');let vertex=0;
 for(const {model} of inputs){
  const paths=new Map<number,{length:number;repeats:number}>();
  for(const s of model.segments){
   if(far&&s.depth>1)continue;
   const sides=s.pathId===undefined?(far?4:mobile?5:7):far?6:s.depth===0?14:s.depth===1?10:s.depth===2?8:6;
   const path=paths.get(s.pathId??-1)??{length:0,repeats:Math.max(1,Math.round(2*Math.PI*s.r0/.65))};
   const length=new T.Vector3(...s.a).distanceTo(new T.Vector3(...s.b));
   for(let side=0;side<sides;side++)for(const [end,offset] of [[0,0],[1,0],[0,1],[1,0],[1,1],[0,1]]){
    uv.setXY(vertex++,(side+offset)/sides*path.repeats,(path.length+end*length)/.75);
   }
   if(s.capStart)vertex+=sides*3;if(s.capEnd)vertex+=sides*3;
   path.length+=length;paths.set(s.pathId??-1,path);
  }
 }
 uv.needsUpdate=true;
}

export function finishPrairieTreeMaterial(material:T.Material,kind:'library'|'billboards'|'wood'){
 if(kind==='library'&&material instanceof T.ShaderMaterial){
  material.uniforms.shadowPigment.value.set('#2c4438');material.uniforms.midPigment.value.set('#647c4d');material.uniforms.highPigment.value.set('#a9ad6c');
  material.uniforms.rimStrength.value=.23;material.uniforms.gradientStrength.value=.37;
 }else if(kind==='wood'&&material instanceof T.MeshStandardMaterial){
  material.vertexColors=false;material.color.set('#ffffff');material.bumpMap=material.map;material.bumpScale=.035;material.roughness=1;
 }
}
