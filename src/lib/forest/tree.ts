import {Vector3, Quaternion, BufferGeometry, Float32BufferAttribute} from 'three';
import {randomSource} from './random';
import {presets, type GrowthPreset} from './presets';
export type Point = [number,number,number];
export interface Segment {a:Point;b:Point;r0:number;r1:number;depth:number;color?:string}
export interface Cluster {position:Point;scale:Point;tint:number}
export interface TreeModel {
  seed:string;presetId:string;segments:Segment[];foliage:Cluster[];
  parameters:{height:number;crownRadius:number;crownBase:number;trunkRadius:number;taper:number;recursion:number;whorls:number;spread:number;droop:number};
  dimensions:{height:number;crownWidth:number;crownDepth:number};
}
const point=(v:Vector3):Point=>[v.x,v.y,v.z];
export function generateTree(seed:string,preset:GrowthPreset=presets.oak):TreeModel {
  const rand=randomSource(seed),between=(a:number,b:number)=>a+(b-a)*rand();
  const height=between(...preset.height),radius=between(...preset.crownRadius),lean=between(-.018,.018)*height;
  const trunkRadius=preset.trunkRadius*between(.85,1.15),segments:Segment[]=[],foliage:Cluster[]=[];
  const conifer=preset.architecture==='central-leader-conifer',umbrella=preset.architecture==='umbrella-canopy';
  const trunkAt=(t:number)=>new Vector3(Math.sin(t*1.7)*lean,t*height,Math.sin(t*2.1)*lean*.5);
  const trunkTop=conifer?1:.78;
  for(let i=0;i<12;i++){const t=i/12*trunkTop,u=(i+1)/12*trunkTop;segments.push({a:point(trunkAt(t)),b:point(trunkAt(u)),r0:trunkRadius*(1-t*preset.taper),r1:trunkRadius*(1-u*preset.taper),depth:0});}
  function cluster(end:Vector3,size:number){
    if(foliage.length>=160)return;
    foliage.push({position:point(end),scale:[size*between(.85,1.2),size*(umbrella?.38:conifer?.75:.85),size*between(.85,1.2)],tint:between(.83,1.16)});
  }
  function branch(start:Vector3,end:Vector3,r:number,depth:number,size:number){
    if(segments.length>=420)return;
    segments.push({a:point(start),b:point(end),r0:r,r1:r*.45,depth});
    if(depth>=preset.recursion){cluster(end,size);return;}
    const dir=end.clone().sub(start),angle=Math.atan2(dir.z,dir.x),len=dir.length();
    for(let k=0;k<2;k++){
      const a=angle+(k===0?-1:1)*between(.45,1),l=len*between(.42,.63);
      const child=end.clone().add(new Vector3(Math.cos(a)*l,l*(umbrella?.1:conifer?.1:.48),Math.sin(a)*l));
      branch(end,child,r*.49,depth+1,size*.8);
    }
    if(conifer&&depth===1)cluster(end.clone().lerp(start,.32),size*.9);
  }
  const phase=between(0,Math.PI*2);
  for(let w=0;w<preset.whorls;w++){
    const fraction=w/Math.max(1,preset.whorls-1),t=preset.crownBase+fraction*((conifer?.94:.70)-preset.crownBase);
    const start=trunkAt(t),length=radius*(conifer?Math.max(.14,1-fraction*.87):between(.55,.8));
    for(let j=0;j<preset.branches;j++){
      const a=phase+j*Math.PI*2/preset.branches+w*2.399+between(-.12,.12);
      const lift=conifer?-preset.droop*length:height*(umbrella?.20:.20)*(1-fraction*.25);
      const end=start.clone().add(new Vector3(Math.cos(a)*length*preset.spread,lift,Math.sin(a)*length*preset.spread));
      branch(start,end,trunkRadius*(conifer?.34:.56)*(1-fraction*.65),1,conifer?Math.max(.38,length*.29):radius*(umbrella?.28:.29));
    }
  }
  if(conifer)cluster(trunkAt(.96),radius*.18);
  const min=new Vector3(Infinity,0,Infinity),max=new Vector3(-Infinity,0,-Infinity);
  for(const s of segments)for(const p of [s.a,s.b]){min.min(new Vector3(...p));max.max(new Vector3(...p));}
  for(const f of foliage){const p=new Vector3(...f.position),s=new Vector3(...f.scale);min.min(p.clone().sub(s));max.max(p.clone().add(s));}
  return {seed,presetId:preset.id,segments,foliage,parameters:{height,crownRadius:radius,crownBase:preset.crownBase,trunkRadius,taper:preset.taper,recursion:preset.recursion,whorls:preset.whorls,spread:preset.spread,droop:preset.droop},dimensions:{height:max.y-min.y,crownWidth:max.x-min.x,crownDepth:max.z-min.z}};
}
/** Custom ring geometry for tapered recursive wood; one buffer per forest LOD. */
export function woodGeometry(models:{model:TreeModel;position:Point;rotation:number}[],far=false){
  const positions:number[]=[],colors:number[]=[],faces:{end:number;treeIndex:number}[]=[];
  const sides=far?4:6,up=new Vector3(0,1,0),q=new Quaternion();
  models.forEach(({model,position,rotation},treeIndex)=>{
    const cos=Math.cos(rotation),sin=Math.sin(rotation);
    const transform=(v:Vector3)=>new Vector3(v.x*cos-v.z*sin+position[0],v.y+position[1],v.x*sin+v.z*cos+position[2]);
    for(const segment of model.segments){
      if(far&&segment.depth>1)continue;
      const a=new Vector3(...segment.a),b=new Vector3(...segment.b);q.setFromUnitVectors(up,b.clone().sub(a).normalize());
      for(let i=0;i<sides;i++){
        const ring=(center:Vector3,r:number,j:number)=>transform(new Vector3(Math.cos(j/sides*Math.PI*2)*r,0,Math.sin(j/sides*Math.PI*2)*r).applyQuaternion(q).add(center));
        const p=[ring(a,segment.r0,i),ring(b,segment.r1,i),ring(a,segment.r0,i+1),ring(b,segment.r1,i),ring(b,segment.r1,i+1),ring(a,segment.r0,i+1)];
        for(const v of p){positions.push(v.x,v.y,v.z);const shade=.85+.15*(i%2);colors.push(.36*shade,.27*shade,.19*shade);}
      }
    }
    faces.push({end:positions.length/9,treeIndex});
  });
  const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(positions,3));geometry.setAttribute('color',new Float32BufferAttribute(colors,3));geometry.computeVertexNormals();geometry.computeBoundingSphere();return {geometry,faces};
}
