import {batchSpecies} from '../studio/species-v1';
import * as THREE from 'three';
import {randomSource} from './random';
import type {Point,TreeModel} from './tree';
import type {PaintedTree} from './painterly';

/** Small, generated brush textures. No image downloads or leaf meshes. */
export function brushTexture(kind:'bark'|'foliage') {
  const size=64,data=new Uint8Array(size*size*4),rand=randomSource('worldtree-brush-'+kind);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const streak=kind==='bark'?Math.sin(x*.8+Math.sin(y*.13)*.8)*.065+Math.sin(x*2.1+y*.03)*.035:Math.sin(x*.27+y*.12)*.08+Math.sin(Math.floor(y/4)*2.1+x*.19)*.055;
    const value=Math.round(236+(streak+(rand()-.5)*.06)*150),i=(y*size+x)*4;
    data[i]=Math.min(255,value+5);data[i+1]=Math.min(255,value);data[i+2]=Math.min(255,value-(kind==='foliage'?12:5));data[i+3]=255;
  }
  const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=texture.minFilter=THREE.LinearFilter;texture.needsUpdate=true;return texture;
}
export function sprayTexture(needle:boolean){
  const size=128,data=new Uint8Array(size*size*4),rand=randomSource(needle?'needle-spray':'leaf-spray');
  const leaves=Array.from({length:needle?18:9},(_,i)=>({x:needle?.15+i/18*.7:.15+rand()*.7,y:.2+rand()*.6,rx:needle?.025:.065+rand()*.025,ry:needle?.12:.1+rand()*.025,a:(rand()-.5)*1.8}));
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    let alpha=0,vein=0;
    for(const l of leaves){const dx=x/size-l.x,dy=y/size-l.y,c=Math.cos(l.a),s=Math.sin(l.a),u=dx*c-dy*s,v=dx*s+dy*c,d=u*u/(l.rx*l.rx)+v*v/(l.ry*l.ry);if(d<1){alpha=255;vein=Math.max(vein,Math.max(0,1-Math.abs(u)/.012));}}
    const i=(y*size+x)*4;data[i]=225+vein*25;data[i+1]=235+vein*20;data[i+2]=204+vein*20;data[i+3]=alpha;
  }
  const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=texture.minFilter=THREE.LinearFilter;texture.needsUpdate=true;return texture;
}
export function createPaintMaterials(wireframe=false){
  const bark=brushTexture('bark'),leaf=brushTexture('foliage'),broad=sprayTexture(false),needle=sprayTexture(true);
  const wood=new THREE.MeshStandardMaterial({map:bark,vertexColors:true,roughness:1,wireframe});
  const foliage=new THREE.MeshStandardMaterial({map:leaf,vertexColors:true,roughness:1,metalness:0,wireframe});
  const cards=[broad,needle].map(map=>new THREE.MeshStandardMaterial({map,alphaTest:.48,side:THREE.DoubleSide,roughness:1,wireframe}));
  return {wood,foliage,cards,textures:[bark,leaf,broad,needle]};
}
/** Each irregular mass is shared by all matching instances, with a crown gradient. */
export function crownGeometry(needle:boolean,variant:number,far:boolean,mobile:boolean){
  const geometry=new THREE.IcosahedronGeometry(1,far||mobile?0:1),p=geometry.getAttribute('position'),colors:number[]=[];
  const low=new THREE.Color('#a3b99d'),mid=new THREE.Color('#d0d3a2'),top=new THREE.Color('#fff0b6');
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const ripple=1+.11*Math.sin(x*6+z*4+variant*2)+.07*Math.sin(y*9-z*6+variant);
    const taper=needle?.83-y*.29:1;
    p.setXYZ(i,x*ripple*taper,y*ripple*(needle?1.1:.86),z*ripple*taper);
    const h=Math.max(0,Math.min(1,(y+1)/2));const c=(h<.5?low.clone().lerp(mid,h*2):mid.clone().lerp(top,(h-.5)*2)).multiplyScalar(.96+.04*Math.sin(x*7+y*5+z*8));colors.push(c.r,c.g,c.b);
  }
  // Retain the softly interpolated radial normals; flat triangle normals read as rocks.
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeBoundingSphere();return geometry;
}
/** Smooth ring normals, longitudinal brush UVs and warm/cool bark vertex pigment. */
export function paintedWoodGeometry(trees:{model:TreeModel;position:Point;rotation:number}[],far:boolean,mobile:boolean){
  const positions:number[]=[],normals:number[]=[],uvs:number[]=[],colors:number[]=[],orders:number[]=[],faces:{end:number;treeIndex:number}[]=[];
  const baseSides=far?4:mobile?5:7,up=new THREE.Vector3(0,1,0),q=new THREE.Quaternion();
  trees.forEach(({model,position,rotation},treeIndex)=>{
    const cosine=Math.cos(rotation),sine=Math.sin(rotation),paint=model as PaintedTree;
    const design=batchSpecies[model.presetId],emergent=design?.emergent,sides=emergent?(far?12:24):baseSides,unit=emergent?(model.segments[0]?.r0??design.trunk)/design.trunk:1,baseY=model.segments[0]?.a[1]??0;
    const rootRand=randomSource(model.seed+'|integrated-buttresses|'+model.presetId),phase=rootRand()*Math.PI*2;
    const buttresses=emergent?Array.from({length:emergent.buttressCount},(_,i)=>({angle:phase+i*Math.PI*2/emergent.buttressCount+(rootRand()-.5)*.22,width:.17+rootRand()*.08,strength:.78+rootRand()*.3})):[];
    const flare=(angle:number,y:number)=>{if(!emergent)return 0;const t=Math.max(0,Math.min(1,(y-baseY)/(emergent.buttressHeight*unit)));let sum=0;for(const root of buttresses){const d=Math.atan2(Math.sin(angle-root.angle),Math.cos(angle-root.angle));sum+=root.strength*Math.exp(-d*d/(root.width*root.width));}return emergent.buttressReach*unit*Math.pow(1-t,2)*sum;};
    const pigment=new THREE.Color(paint.palette?.bark??'#96745f'),shade=new THREE.Color('#6e6a74'),warm=new THREE.Color('#c8a077');
    for(const segment of model.segments){
      if(far&&segment.depth>1)continue;
      const ringSides=segment.pathId===undefined?sides:far?6:segment.depth===0?14:segment.depth===1?10:segment.depth===2?8:6;
      const a=new THREE.Vector3(...segment.a),b=new THREE.Vector3(...segment.b),subdivisions=segment.pathId!==undefined&&!(emergent?.buttressCount)?1:segment.depth===0&&(model.presetId==='silver-birch'||emergent&&segment.a[1]-baseY<emergent.buttressHeight*unit)?4:1;let from=0,to=1;q.setFromUnitVectors(up,b.clone().sub(a).normalize());
      const frameStart=segment.pathId===undefined?undefined:new THREE.Quaternion().setFromUnitVectors(up,new THREE.Vector3(...segment.tangentA!)),frameEnd=segment.pathId===undefined?undefined:new THREE.Quaternion().setFromUnitVectors(up,new THREE.Vector3(...segment.tangentB!)),ringFrame=segment.pathId===undefined?undefined:new THREE.Quaternion();
      const vertex=(end:number,side:number)=>{
        const fraction=end?to:from,radius=subdivisions>1?segment.r0+(segment.r1-segment.r0)*fraction:end?segment.r1:segment.r0,center=subdivisions>1?a.clone().lerp(b,fraction):end?b:a,angle=side/ringSides*Math.PI*2;
        const frame=segment.pathId===undefined?q:ringFrame!.copy(frameStart!).slerp(frameEnd!,fraction);
        const rooted=!!emergent&&segment.depth===0,rootRadius=radius+(rooted?flare(angle,center.y):0),da=rooted?(flare(angle+.002,center.y)-flare(angle-.002,center.y))/.004:0,dy=rooted?(flare(angle,center.y+.002)-flare(angle,center.y-.002))/.004:0;
        const radial=new THREE.Vector3(Math.cos(angle),0,Math.sin(angle)),n=rooted?new THREE.Vector3(rootRadius*Math.cos(angle)+da*Math.sin(angle),-rootRadius*dy,rootRadius*Math.sin(angle)-da*Math.cos(angle)).normalize().applyQuaternion(frame):radial.clone().applyQuaternion(frame),v=radial.multiplyScalar(rootRadius).applyQuaternion(frame).add(center);
        positions.push(v.x*cosine-v.z*sine+position[0],v.y+position[1],v.x*sine+v.z*cosine+position[2]);
        normals.push(n.x*cosine-n.z*sine,n.y,n.x*sine+n.z*cosine);uvs.push(side/ringSides,center.y*.23);orders.push(segment.role==='root'?-1:segment.color?4:segment.depth);
        const t=Math.max(0,Math.min(1,center.y/model.parameters.height));
        const c=(segment.color?new THREE.Color(segment.color):pigment.clone()).lerp(warm,t*.35).lerp(shade,(1-Math.sin(angle+1))*.12);if(model.presetId==='silver-birch'){
          // Small broken lenticel/scar patches on the existing white bark; no added meshes.
          const marking=Math.sin(Math.floor(center.y*4.5)*13.7+Math.floor(angle*3)*2.3)>.76&&Math.cos(angle*1.7+center.y)>.05;
          if(segment.depth>1)c.lerp(new THREE.Color('#797767'),.75);
          else if(marking)c.lerp(new THREE.Color('#1c211d'),.95);
        }
        colors.push(c.r,c.g,c.b);
      };
      for(let step=0;step<subdivisions;step++){from=step/subdivisions;to=(step+1)/subdivisions;for(let i=0;i<ringSides;i++){vertex(0,i);vertex(1,i);vertex(0,i+1);vertex(1,i);vertex(1,i+1);vertex(0,i+1);}}
      if(segment.pathId!==undefined){
        const cap=(end:boolean)=>{const center=end?segment.b:segment.a,r=end?segment.r1:segment.r0,tangent=new THREE.Vector3(...(end?segment.tangentB!:segment.tangentA!)),frame=new THREE.Quaternion().setFromUnitVectors(up,tangent);for(let k=0;k<ringSides;k++){const indices=end?[k,k+1,-1]:[k+1,k,-1];for(const side of indices){const v=side<0?new THREE.Vector3(...center).addScaledVector(tangent,end&&segment.role!=='root'?r*.25:0):new THREE.Vector3(Math.cos(side/ringSides*Math.PI*2)*r,0,Math.sin(side/ringSides*Math.PI*2)*r).applyQuaternion(frame).add(new THREE.Vector3(...center));positions.push(v.x*cosine-v.z*sine+position[0],v.y+position[1],v.x*sine+v.z*cosine+position[2]);normals.push(tangent.x*(end?1:-1),tangent.y*(end?1:-1),tangent.z*(end?1:-1));uvs.push(.5,.5);colors.push(pigment.r,pigment.g,pigment.b);orders.push(segment.role==='root'?-1:segment.depth);}}};
        if(segment.capStart)cap(false);if(segment.capEnd)cap(true);
      }
    }
    faces.push({end:positions.length/9,treeIndex});
  });
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));if(trees.some(t=>t.model.segments.some(s=>s.pathId!==undefined)))geometry.setAttribute('branchOrder',new THREE.Float32BufferAttribute(orders,1));geometry.computeBoundingSphere();return {geometry,faces};
}
