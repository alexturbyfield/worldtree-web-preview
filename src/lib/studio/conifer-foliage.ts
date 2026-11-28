import {BufferGeometry,Float32BufferAttribute,Vector3,Color} from 'three';
import type {StudioStudy} from './groups';
import {randomSource} from '../forest/random';
/** Shared Douglas-fir foliage representation, independent of biome dressing. */
export function layeredConifersEnabled(){return typeof location==='undefined'||new URLSearchParams(location.search).get('conifer')!=='legacy';}
export function isLayeredConifer(study:StudioStudy){return layeredConifersEnabled()&&(study.model.presetId==='douglas-v1'||study.model.presetId==='douglas')&&study.kind==='conifer';}
interface Surface {p:number[];uv:number[];rect:number[];colors:number[];shade:number[];solid:number[];indices:number[]}
function surface():Surface{return {p:[],uv:[],rect:[],colors:[],shade:[],solid:[],indices:[]};}
/** Curved overlapping needle fans follow owned wood, retaining soft atlas silhouettes. */
function bough(s:Surface,path:Vector3[],width:number,thickness:number,phase:number,color:Color,scale=1,offset=new Vector3(),rows=4,sides=2){
 const axis=path.at(-1)!.clone().sub(path[0]).normalize(),side=new Vector3().crossVectors(axis,new Vector3(0,1,0)).normalize(),up=new Vector3().crossVectors(side,axis).normalize(),tile=Math.floor(phase*7)%4;
 for(let face=0;face<3;face++){const base=s.p.length/3,roll=(face-1)*.65,across=side.clone().multiplyScalar(Math.cos(roll)).addScaledVector(up,Math.sin(roll));
  for(let j=0;j<=rows;j++){const t=j/rows,u=.12+t*.88,k=u*(path.length-1),index=Math.min(path.length-2,Math.floor(k)),center=path[index].clone().lerp(path[index+1],k-index);
   for(let a=0;a<=sides;a++){const v=a/sides,point=center.clone().addScaledVector(across,(v-.5)*width*2).addScaledVector(up,Math.sin(v*Math.PI)*Math.sin(t*Math.PI)*thickness+(face-1)*thickness*.3).multiplyScalar(scale).add(offset);
    s.p.push(...point.toArray());s.uv.push(v,t);s.rect.push((tile%2)*.5,1-(Math.floor(tile/2)+1)*.5,.5,.5);s.colors.push(color.r,color.g,color.b);s.shade.push(.76+face*.07);s.solid.push(0);
   }
  }
  for(let j=0;j<rows;j++)for(let a=0;a<sides;a++){const k=base+j*(sides+1)+a;s.indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}
 }
}
function geometry(s:Surface){const g=new BufferGeometry();for(const [key,values,size] of [['position',s.p,3],['uv',s.uv,2],['tileRect',s.rect,4],['color',s.colors,3],['interior',s.shade,1],['solidBough',s.solid,1]] as const)g.setAttribute(key,new Float32BufferAttribute(values,size));g.setIndex(s.indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g;}
export function layeredConiferGeometry(studies:StudioStudy[],positions:number[]){
 const s=surface();for(const [i,study] of studies.entries()){
  const visible=new Set(study.fronds.map(f=>f.groupId)),r=randomSource(study.model.seed+'|layered-boughs-1');
  for(const group of study.groups){const first=group.branchIndex,segment=study.segments[first];if(!segment||(!visible.has(group.id)&&segment.depth!==1))continue;
   const path=[new Vector3(...segment.a)];for(let j=first;j<Math.min(first+8,study.segments.length);j++){const v=study.segments[j];if(v.depth!==segment.depth)break;path.push(new Vector3(...v.b));}
   if(path.length<2)continue;let length=0;for(let j=1;j<path.length;j++)length+=path[j].distanceTo(path[j-1]);
   const tint=new Color('#92a47c').offsetHSL((r()-.5)*.025,(r()-.5)*.06,(r()-.5)*.035);
   bough(s,path,length*.55,length*.14,r()*6.283,tint,study.scale,new Vector3(study.offset[0]+positions[i],study.offset[1],study.offset[2]));
  }
 }return geometry(s);
}
/** Same bough vocabulary at distance: crossed branch sprays, not whole-tree triangular walls. */
export function distantConiferGeometry(){const s=surface();for(let level=0;level<7;level++)for(let arm=0;arm<3;arm++){
 const y=.15+level*.115,angle=level*2.399+arm*2.094,reach=(1-y)*(.9+.1*Math.sin(level+arm*3)),v=new Vector3(Math.cos(angle),0,Math.sin(angle));
 const path=[new Vector3(0,y,0),v.clone().multiplyScalar(reach*.48).setY(y+.025),v.clone().multiplyScalar(reach).setY(y-.04)];
 bough(s,path,reach*.48,.035*(1-y),level+arm,new Color('#b4bea0'),1,new Vector3(),1,1);
 }const g=geometry(s),uv=g.getAttribute('uv'),rect=g.getAttribute('tileRect');for(let i=0;i<uv.count;i++)uv.setXY(i,rect.getX(i)+uv.getX(i)*.5,rect.getY(i)+uv.getY(i)*.5);return g;}
