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
  const positions:number[]=[],normals:number[]=[],uvs:number[]=[],colors:number[]=[],faces:{end:number;treeIndex:number}[]=[];
  const sides=far?4:mobile?5:7,up=new THREE.Vector3(0,1,0),q=new THREE.Quaternion();
  trees.forEach(({model,position,rotation},treeIndex)=>{
    const cosine=Math.cos(rotation),sine=Math.sin(rotation),paint=model as PaintedTree;
    const pigment=new THREE.Color(paint.palette?.bark??'#96745f'),shade=new THREE.Color('#6e6a74'),warm=new THREE.Color('#c8a077');
    for(const segment of model.segments){
      if(far&&segment.depth>1)continue;
      const a=new THREE.Vector3(...segment.a),b=new THREE.Vector3(...segment.b);q.setFromUnitVectors(up,b.clone().sub(a).normalize());
      const vertex=(end:number,side:number)=>{
        const radius=end?segment.r1:segment.r0,center=end?b:a,angle=side/sides*Math.PI*2;
        const n=new THREE.Vector3(Math.cos(angle),0,Math.sin(angle)).applyQuaternion(q),v=n.clone().multiplyScalar(radius).add(center);
        positions.push(v.x*cosine-v.z*sine+position[0],v.y+position[1],v.x*sine+v.z*cosine+position[2]);
        normals.push(n.x*cosine-n.z*sine,n.y,n.x*sine+n.z*cosine);uvs.push(side/sides,center.y*.23);
        const t=Math.max(0,Math.min(1,center.y/model.parameters.height));
        const c=pigment.clone().lerp(warm,t*.35).lerp(shade,(1-Math.sin(angle+1))*.12);colors.push(c.r,c.g,c.b);
      };
      for(let i=0;i<sides;i++){vertex(0,i);vertex(1,i);vertex(0,i+1);vertex(1,i);vertex(1,i+1);vertex(0,i+1);}
    }
    faces.push({end:positions.length/9,treeIndex});
  });
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeBoundingSphere();return {geometry,faces};
}
