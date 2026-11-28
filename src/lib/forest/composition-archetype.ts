import type {SceneRecipe,SceneTree} from './recipe';
import {terrainHeight} from './recipe';
import {randomSource} from './random';
import type {Point} from './tree';
/** Art-directed space, independent of ecological eligibility. No new species are selected here. */
interface CompositionZone {stratum?:'emergent'|'main-canopy'|'subcanopy'|'understory';designs?:string[];background?:boolean;count:number;roles:('canopy'|'palm'|'understory')[];bounds:[number,number,number,number];scale:[number,number];sideGap?:number;anchors?:[number,number,number][]}
export interface CompositionArchetype {
 id:'open-savanna'|'rainforest-interior';zones:CompositionZone[];
 occupancy?:{samples:number;trials:number};
 opening:[number,number];focal:[number,number];focalWidth:[number,number];
 edgeShade:number;focalWarmth:number;enclosure:number;
 background:{near:number;far:number;saturation:number;contrast:number};
 framing:{treeClearance:number;grassScale:number};
 horizon:{height:number;breakup:number};
}
export const compositionArchetypes:Record<'savanna'|'amazon',CompositionArchetype>={
 savanna:{id:'open-savanna',zones:[{count:7,roles:['canopy'],bounds:[0,0,0,0],scale:[1,1],anchors:[[-16,-1,.94],[19,-20,.48],[25,-27,.35],[-31,-33,.35],[7,-48,.25],[13,-52,.2],[-14,-56,.23]]}],opening:[18,24],focal:[3,-4],focalWidth:[22,27],edgeShade:.38,focalWarmth:.65,enclosure:.12,background:{near:40,far:85,saturation:.45,contrast:.48},framing:{treeClearance:-15,grassScale:2.1},horizon:{height:5.5,breakup:2.8}},
 amazon:{id:'rainforest-interior',zones:[
 {stratum:'emergent',count:2,roles:['canopy'],designs:['mahogany'],bounds:[0,0,0,0],scale:[1.12,1.2],anchors:[[-22,-16,1],[24,-31,1]]},
 {stratum:'main-canopy',count:4,roles:['canopy'],bounds:[0,0,0,0],scale:[.78,.94],anchors:[[-10,16,1],[12,12,1],[-15,-1,1],[17,-8,1]]},
 {stratum:'main-canopy',count:10,roles:['canopy'],background:true,bounds:[-37,36,-43,-22],scale:[.66,.9],anchors:[[-32,-24,1],[-23,-30,1],[-12,-27,1],[1,-33,1],[12,-29,1],[25,-30,1],[34,-27,1],[-27,-41,1],[4,-44,1],[30,-43,1]]},
 {stratum:'subcanopy',count:8,roles:['palm','understory'],designs:['acai','cecropia'],bounds:[-23,23,-26,9],sideGap:8,scale:[.4,.62]},
 {stratum:'understory',count:12,roles:['understory'],designs:['cacao'],bounds:[-19,19,-26,12],sideGap:6,scale:[.48,.8]}
 ],opening:[5,9],focal:[-2,-3],focalWidth:[7,12],edgeShade:.51,focalWarmth:.8,enclosure:.95,background:{near:24,far:65,saturation:.48,contrast:.45},framing:{treeClearance:-20,grassScale:1.3},horizon:{height:17,breakup:4}}
};
/** Version switch affects Amazon only; V3 remains available for matched review. */
export function rainforestV4(){return typeof location==='undefined'||new URLSearchParams(location.search).get('rainforest')!=='v3';}
export const rainforestV4Archetype:CompositionArchetype={...compositionArchetypes.amazon,
 zones:[
 {stratum:'main-canopy',count:2,roles:['canopy'],designs:['mahogany'],bounds:[0,0,0,0],scale:[1.4,1.55],anchors:[[-6.8,22,1],[8.3,20,1]]},
 {stratum:'emergent',count:4,roles:['canopy'],designs:['mahogany'],bounds:[-29,29,-37,-14],scale:[1.4,1.65],sideGap:9},
 {stratum:'main-canopy',count:5,roles:['canopy'],bounds:[0,0,0,0],scale:[1.1,1.35],anchors:[[-14,8,1],[13,5,1],[-8,-10,1],[9,-15,1],[-22,-8,1]]},
 {stratum:'main-canopy',count:21,roles:['canopy'],bounds:[-34,34,-46,7],scale:[1.02,1.32],sideGap:6},
 {stratum:'subcanopy',count:12,roles:['palm','understory'],designs:['acai','cecropia'],bounds:[-24,24,-31,16],sideGap:7,scale:[.45,.76]},
 {stratum:'understory',count:20,roles:['understory'],designs:['cacao'],bounds:[-29,29,-40,17],sideGap:6,scale:[.58,.95]}
 ],occupancy:{samples:81,trials:18},opening:[5,9],focal:[0,0],focalWidth:[9,14],edgeShade:.3,focalWarmth:.9,
 background:{near:55,far:125,saturation:.75,contrast:.82},framing:{treeClearance:-100,grassScale:1},horizon:{height:0,breakup:0}};
export function activeArchetype(id:string){return typeof location!=='undefined'&&new URLSearchParams(location.search).get('biomeComposition')==='v1'?undefined:id==='amazon'&&rainforestV4()?rainforestV4Archetype:compositionArchetypes[id as keyof typeof compositionArchetypes];}
/** Scale an existing individual as a composition instance, without rerunning its generator or changing seeds. */
function instanceSize(source:SceneTree,s:number):SceneTree{
 const pt=(p:Point)=>p.map(v=>v*s) as Point,segments=source.model.segments.map(v=>({...v,a:pt(v.a),b:pt(v.b),r0:v.r0*s,r1:v.r1*s})),d=source.model.dimensions;
 const model={...source.model,segments,dimensions:{height:d.height*s,crownWidth:d.crownWidth*s,crownDepth:d.crownDepth*s}};
 const clump=(v:NonNullable<SceneTree['canopy']>['clumps'][number])=>({...v,position:pt(v.position),scale:pt(v.scale),attachmentPoint:pt(v.attachmentPoint)});
 return {...source,model,studio:source.studio?{...source.studio,model:{...source.studio.model,segments,dimensions:model.dimensions},segments,scale:source.studio.scale*s}:undefined,canopy:source.canopy?{...source.canopy,clumps:source.canopy.clumps.map(clump),coarseClumps:source.canopy.coarseClumps.map(clump),dimensions:model.dimensions}:undefined};
}
export function arrangeArchetype(recipe:SceneRecipe,candidates:SceneTree[],a:CompositionArchetype,count:number,roles:Record<string,'canopy'|'palm'|'understory'>):SceneTree[]{
 const occupied:{x:number;z:number;radius:number}[]=[];
 const r=randomSource(recipe.seed+'|composition-archetype-v2|'+a.id),design=(t:SceneTree)=>t.studio?.model.presetId??t.model.presetId;
 return Array.from({length:count},(_,i)=>{
  let j=i;const zone=a.zones.find(z=>{if(j<z.count)return true;j-=z.count;return false;})??a.zones[a.zones.length-1];
  const filtered=candidates.filter(t=>zone.roles.includes(roles[design(t)])&&(!zone.designs||zone.designs.includes(design(t)))),pool=filtered.length?filtered:candidates;
  let x:number,z:number,scale:number;
  if(zone.anchors){[x,z,scale]=zone.anchors[j%zone.anchors.length];x+=(r()-.5)*2;z+=(r()-.5)*3;scale*=zone.scale[0]+r()*(zone.scale[1]-zone.scale[0]);}
  else{const [left,right,back,front]=zone.bounds;x=left+r()*(right-left);z=back+r()*(front-back);if(zone.sideGap)x=(x<0?-1:1)*(zone.sideGap+r()*(right-zone.sideGap));scale=zone.scale[0]+r()*(zone.scale[1]-zone.scale[0]);}
  const source=pool[Math.floor(r()*pool.length)],tree=instanceSize(source,scale);
  if(a.occupancy&&zone.stratum==='main-canopy'&&!zone.anchors){
    // Greedy crown-footprint occupancy closes roof gaps without changing foliage density or generators.
    let best=-Infinity,bx=x,bz=z;const [l,rr,back,front]=zone.bounds;
    for(let trial=0;trial<a.occupancy.trials;trial++){
      const cx=l+r()*(rr-l),cz=back+r()*(front-back);if(Math.hypot(cx/a.opening[0],(cz+1)/a.opening[1])<1.35)continue;
      const radius=tree.model.dimensions.crownWidth*.48;let score=0;
      for(let sample=0;sample<a.occupancy.samples;sample++){
        const sx=-30+(sample%9)*7.5,sz=-42+Math.floor(sample/9)*7;
        const coverage=occupied.reduce((n,c)=>n+Math.exp(-Math.pow(Math.hypot(sx-c.x,sz-c.z)/Math.max(1,c.radius),2)*1.8),0);
        score+=Math.max(0,1-coverage)*Math.exp(-Math.pow(Math.hypot(sx-cx,sz-cz)/Math.max(1,radius),2)*1.8);
      }
      if(score>best){best=score;bx=cx;bz=cz;}
    }x=bx;z=bz;
  }
  if(zone.roles.includes('canopy'))occupied.push({x,z,radius:tree.model.dimensions.crownWidth*.48});
  if(zone.background&&tree.studio)tree.studio={...tree.studio,fronds:tree.studio.fronds.filter(f=>f.essential||f.groupId%2===0)};
  return {...tree,...(zone.stratum?{stratum:zone.stratum,backgroundFoliage:!!zone.background}:{}),id:source.id+'-'+a.id+'-'+i,index:i,position:[x,terrainHeight(x,z,recipe.seed),z],rotation:r()*Math.PI*2};
 });
}
