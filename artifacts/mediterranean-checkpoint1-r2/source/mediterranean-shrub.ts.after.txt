import * as T from 'three';
import {randomSource} from './random';
/** Unnamed sclerophyll growth form. Dimensions in metres, not enlarged tundra leaves.
 * Branch-owned small-leaf bouquets create the envelope; no crossed cards or closed balls. */
export function mediterraneanShrubGeometry(seed:string,detail:'near'|'middle'|'far'){
 const random=randomSource(seed),positions:number[]=[],leafFlags:number[]=[],cavity:number[]=[],indices:number[]=[];
 const near=detail==='near',far=detail==='far',arms=near?7:far?4:5;
 const vertex=(p:T.Vector3,leaf:number,occlusion:number)=>{positions.push(p.x,p.y,p.z);leafFlags.push(leaf);cavity.push(occlusion);};
 const twig=(a:T.Vector3,b:T.Vector3,radius:number)=>{if(far)return;const start=positions.length/3,axis=b.clone().sub(a).normalize(),side=new T.Vector3(0,1,0).cross(axis).normalize(),up=axis.clone().cross(side).normalize();
  for(const [p,r] of [[a,radius],[b,radius*.4]] as const)for(let j=0;j<3;j++)vertex(p.clone().addScaledVector(side,Math.cos(j*2.0944)*r).addScaledVector(up,Math.sin(j*2.0944)*r),0,.8);
  for(let j=0;j<3;j++){const k=(j+1)%3;indices.push(start+j,start+k,start+3+j,start+k,start+3+k,start+3+j);}
 };
 const leaf=(p:T.Vector3,direction:T.Vector3,length:number,width:number,shade:number)=>{const start=positions.length/3,side=new T.Vector3(-direction.z,0,direction.x).normalize(),forward=direction.clone().normalize();
  if(near){for(const [along,across,ridge] of [[0,0,0],[.45,-1,0],[.45,0,.008],[.45,1,0],[1,0,.002]])vertex(p.clone().addScaledVector(forward,along*length).addScaledVector(side,across*width).add(new T.Vector3(0,ridge,0)),1,shade);indices.push(start,start+2,start+1,start,start+3,start+2,start+1,start+2,start+4,start+2,start+3,start+4);}
  else{vertex(p.clone().addScaledVector(side,-width),1,shade);vertex(p.clone().addScaledVector(side,width),1,shade);vertex(p.clone().addScaledVector(forward,length).addScaledVector(side,-width*.35),1,shade);vertex(p.clone().addScaledVector(forward,length).addScaledVector(side,width*.35),1,shade);indices.push(start,start+2,start+1,start+1,start+2,start+3);}
 };
 for(let arm=0;arm<arms;arm++){
  const angle=arm*2.39996+(random()-.5)*.45,reach=.28+random()*.25,height=.32+random()*.30,root=new T.Vector3((random()-.5)*.09,-.025,(random()-.5)*.09),end=new T.Vector3(Math.cos(angle)*reach,height,Math.sin(angle)*reach);
  const elbow=root.clone().lerp(end,.5).add(new T.Vector3(0,.13,0));twig(root,elbow,.013);twig(elbow,end,.007);
  const sprays=near?3:2;
  for(let spray=0;spray<sprays;spray++){
   const a=angle+(spray-(sprays-1)/2)*.9,center=end.clone().add(new T.Vector3(Math.cos(a)*(.05+random()*.10),.03+random()*.10,Math.sin(a)*(.05+random()*.10)));twig(end,center,.004);
   const leaves=near?26:far?8:15;
   for(let i=0;i<leaves;i++){
    const azimuth=i*2.39996+random()*.35,t=(i+.5)/leaves,y=t*2-1,ring=Math.sqrt(1-y*y),rad=.10+random()*.045,offset=new T.Vector3(Math.cos(azimuth)*ring*rad,y*rad*.7,Math.sin(azimuth)*ring*rad),where=center.clone().add(offset),direction=offset.clone().normalize().add(new T.Vector3(0,.35,0));
    const length=near?.045+random()*.035:far?.11+random()*.04:.065+random()*.035;
    leaf(where,direction,length,length*(far?.40:.22),.68+t*.25);
   }
  }
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('medLeaf',new T.Float32BufferAttribute(leafFlags,1));geometry.setAttribute('medCavity',new T.Float32BufferAttribute(cavity,1));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();return geometry;
}
