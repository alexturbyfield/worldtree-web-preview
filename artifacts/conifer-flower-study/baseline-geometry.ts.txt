import {BufferGeometry,Color,Float32BufferAttribute,Quaternion,Vector3} from 'three';
import type {StudioStudy} from './groups';
// Shared nine-vertex leaf/spray surface template, reused by every cluster and crown.
const leafGrid=Array.from({length:9},(_,i)=>({u:i%3/2,t:Math.floor(i/3)/2}));
const bladeGrid=Array.from({length:21},(_,i)=>({u:i%3/2,t:Math.floor(i/3)/6}));
export function studioGeometry(studies:StudioStudy[],positions:number[]){
  const p:number[]=[],n:number[]=[],uv:number[]=[],rect:number[]=[],colors:number[]=[],shade:number[]=[],indices:number[]=[];
  const q=new Quaternion(),v=new Vector3(),normal=new Vector3(),tint=new Color();
  studies.forEach((study,i)=>{for(const f of study.fronds){
    q.set(...f.rotation);tint.set(f.color);const base=p.length/3;
    // Three by three curved fan: its cupped surface hides plane intersections and
    // droops along the existing branch direction. No closed crown meshes.
    for(const {u,t} of f.spine?bladeGrid:leafGrid){
      const across=(u-.5)*f.width;
      v.set(across,(study.kind==='conifer'?t:t-.5)*f.length,Math.sin(u*Math.PI)*Math.sin(t*Math.PI)*f.curve*f.width).applyQuaternion(q);if(study.kind==='conifer')v.y-=t*t*f.droop*f.length;v.add(new Vector3(...f.position));
      if(f.spine){
        // Quadratic leaf midrib: seven rows for smooth arches; existing atlas, normals and batching.
        const [a,b,c]=f.spine,one=1-t,side=new Vector3(across,0,0).applyQuaternion(q);
        v.set(one*one*a[0]+2*one*t*b[0]+t*t*c[0],one*one*a[1]+2*one*t*b[1]+t*t*c[1],one*one*a[2]+2*one*t*b[2]+t*t*c[2]).add(side);
      }
      v.multiplyScalar(study.scale).add(new Vector3(...study.offset));v.x+=positions[i];p.push(...v.toArray());uv.push(u,study.kind==='conifer'?1-t:t);
      normal.set(f.normal[0]+(u-.5)*.38,f.normal[1]+Math.sin(t*Math.PI)*.35,f.normal[2]+(t-.5)*.25).normalize();n.push(...normal.toArray());
      rect.push((f.tile%4)/4,1-(Math.floor(f.tile/4)+1)/3,1/4,1/3);colors.push(tint.r,tint.g,tint.b);shade.push(f.interior);
    }
    for(let y=0;y<(f.spine?6:2);y++)for(let x=0;x<2;x++){const a=base+y*3+x;indices.push(a,a+1,a+3,a+1,a+4,a+3);}
  }});
  const g=new BufferGeometry();for(const [key,values,size] of [['position',p,3],['normal',n,3],['uv',uv,2],['tileRect',rect,4],['color',colors,3],['interior',shade,1]] as const)g.setAttribute(key,new Float32BufferAttribute(values,size));g.setIndex(indices);g.computeBoundingBox();g.computeBoundingSphere();return g;
}
