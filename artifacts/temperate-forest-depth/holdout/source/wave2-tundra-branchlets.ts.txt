import * as T from 'three';
import {randomSource} from './random';

/** Irregular low woody architecture, not a crossed-card or large-leaf slab. Units are meters. */
export function tundraBranchletGeometry(seed:string,detail:'near'|'middle'){
 const r=randomSource(seed),positions:number[]=[],colors:number[]=[],indices:number[]=[],near=detail==='near';
 const brown=new T.Color('#8c7656'),body=new T.Color('#e3e1c9'),tip=new T.Color('#d7cf8f');
 const vertex=(p:T.Vector3,c:T.Color)=>{positions.push(p.x,p.y,p.z);colors.push(c.r,c.g,c.b);};
 const twig=(a:T.Vector3,b:T.Vector3,radius:number)=>{
  const start=positions.length/3,axis=new T.Vector3().subVectors(b,a).normalize(),side=new T.Vector3(0,1,0).cross(axis).normalize();if(side.lengthSq()<.01)side.set(1,0,0);const up=new T.Vector3().crossVectors(axis,side);
  for(const [point,rr]of [[a,radius],[b,radius*.55]] as const)for(let j=0;j<3;j++){const angle=j*2.094;vertex(point.clone().addScaledVector(side,Math.cos(angle)*rr).addScaledVector(up,Math.sin(angle)*rr),brown);}
  for(let j=0;j<3;j++){const k=(j+1)%3;indices.push(start+j,start+k,start+3+j,start+k,start+3+k,start+3+j);}
 };
 const leaf=(center:T.Vector3,angle:number,length:number,width:number,elevation:number)=>{
  const start=positions.length/3,forward=new T.Vector3(Math.cos(angle),elevation,Math.sin(angle)).normalize(),side=new T.Vector3(-Math.sin(angle),0,Math.cos(angle));
  // Raised central ridge and curved tip give actual parallax without alpha or huge facets.
  for(const [along,across,lift]of [[0,0,0],[.43,-1,.002],[.43,0,.009],[.43,1,.002],[1,0,.003]]){
   const p=center.clone().addScaledVector(forward,along*length).addScaledVector(side,across*width);p.y+=lift;vertex(p,body.clone().lerp(tip,Math.min(.65,p.y*.8+r()*.2)));
  }
  indices.push(start,start+2,start+1,start,start+3,start+2,start+1,start+2,start+4,start+2,start+3,start+4);
 };
 const leaders=near?5:4;
 for(let arm=0;arm<leaders;arm++){
  const angle=arm*2.399+r()*.6,reach=.16+r()*.16,height=.055+r()*.09,origin=new T.Vector3((r()-.5)*.08,.008,(r()-.5)*.08),segments=near?2:1;
  let previous=origin;
  for(let step=1;step<=segments;step++){
   const t=step/segments,point=new T.Vector3(origin.x+Math.cos(angle)*reach*t,origin.y+height*Math.sin(t*1.2),origin.z+Math.sin(angle)*reach*t);twig(previous,point,.007*(1-t*.55));previous=point;
  }
  // Compact irregular terminal cushions cover their supporting branch hierarchy.
  // Fewer hidden tubes; many overlapping small leaves rather than long rows of bare twigs.
  const sprays=near?3:2;
  for(let spray=0;spray<sprays;spray++){
   const sideAngle=angle+(spray-1)*.9+(r()-.5)*.3,branchLength=.07+r()*.065,end=previous.clone().add(new T.Vector3(Math.cos(sideAngle)*branchLength,.03+r()*.035,Math.sin(sideAngle)*branchLength));twig(previous,end,.0035);
   const leafCount=near?6:4;
   for(let n=0;n<leafCount;n++){
    const around=n*2.399+r()*.6,rad=Math.sqrt((n+.4)/leafCount)*(.055+r()*.018),where=end.clone().add(new T.Vector3(Math.cos(around)*rad,(r()-.5)*.035,Math.sin(around)*rad));
    leaf(where,around,.052+r()*.022,.020+r()*.007,.07+r()*.35);
   }
  }
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();return geometry;
}

/** Short sedge-like curved growth form; no taxon asserted. */
export function tundraSedgeGeometry(seed:string){
 const r=randomSource(seed),positions:number[]=[],indices:number[]=[];
 for(let blade=0;blade<8;blade++){
  const angle=blade*2.399+r()*.5,height=.12+r()*.26,lean=.05+r()*.14,start=positions.length/3;
  for(let step=0;step<=4;step++){const t=step/4,width=(.004+r()*.004)*Math.sin(Math.max(.03,t)*Math.PI),reach=lean*t*t;
   for(const side of [-1,0,1])positions.push(Math.cos(angle)*reach-Math.sin(angle)*width*side,height*t+(side===0?.003:0),Math.sin(angle)*reach+Math.cos(angle)*width*side);
  }
  for(let step=0;step<4;step++)for(let col=0;col<2;col++){const a=start+step*3+col;indices.push(a,a+3,a+1,a+1,a+3,a+4);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
