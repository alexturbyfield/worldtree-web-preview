import * as THREE from 'three';
import {randomSource} from './random';
const cached=new Map<string,THREE.BufferGeometry>();
/** A closed, lobed loft. Its radius, height and edge contours vary around each ring. */
export function canopyGeometry(kind:'cloud'|'bough',variant:number,far=false){
  const key=`${kind}:${variant}:${far}`;const previous=cached.get(key);if(previous)return previous.clone();
  const sides=far?8:14,rings=far?5:8,rand=randomSource('wildloom-loft-'+kind+variant),phase=rand()*6.28,positions:number[]=[],uv:number[]=[],colors:number[]=[],indices:number[]=[];
  const shadow=new THREE.Color('#a1bca8'),mid=new THREE.Color('#d1dfc5'),light=new THREE.Color('#f3e6b8');
  for(let k=0;k<=rings;k++)for(let j=0;j<=sides;j++){
    const u=j/sides*Math.PI*2,v=k/rings*Math.PI,sy=Math.cos(v),ring=Math.sin(v),wave=.12*Math.sin(u*3+v*2+phase)+.07*Math.sin(u*5-v*3+phase*.7)+.045*Math.cos(v*7+phase);
    let x=ring*Math.cos(u)*(1+wave),z=ring*Math.sin(u)*(1+wave),y=sy*(1+wave*.5*ring)+ring*.07*Math.sin(u*3+phase);
    if(kind==='bough'){z*=.88-.23*x;y=y*.82-.16*(x+.65)*(x+.65);}
    positions.push(x,y,z);uv.push(j/sides,k/rings);
    const t=Math.max(0,Math.min(1,(sy+1)/2)),color=t<.5?shadow.clone().lerp(mid,t*2):mid.clone().lerp(light,(t-.5)*2);
    color.multiplyScalar(.95+.05*Math.sin(u*7+v*11+phase));colors.push(color.r,color.g,color.b);
    if(k<rings&&j<sides){const a=k*(sides+1)+j,b=a+sides+1;if(k>0)indices.push(a,a+1,b);if(k<rings-1)indices.push(b,a+1,b+1);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();
  const n=g.getAttribute('normal');for(let k=0;k<=rings;k++){const a=k*(sides+1),b=a+sides,v=new THREE.Vector3(n.getX(a)+n.getX(b),n.getY(a)+n.getY(b),n.getZ(a)+n.getZ(b)).normalize();n.setXYZ(a,v.x,v.y,v.z);n.setXYZ(b,v.x,v.y,v.z);}g.computeBoundingSphere();cached.set(key,g);return g.clone();
}
