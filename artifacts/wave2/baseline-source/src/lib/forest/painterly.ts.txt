import {Color, Vector3} from 'three';
import {presets} from './presets';
import {hashSeed, randomSource} from './random';
import type {Cluster, Point, Segment, TreeModel} from './tree';

export type RenderMode = 'painterly' | 'performance' | 'diagram';
export interface ArtControls {stylization:number;foliageDensity:number;asymmetry:number;foliageDetail?:number;fluffiness?:number;clumpOverlap?:number;surfaceLeafDetail?:number;branchExposure?:number}
export const defaultArt:ArtControls={stylization:.7,foliageDensity:.8,asymmetry:.55};
export interface PainterlyOptions extends Partial<ArtControls> {presetId:string;structuralSeed:string;appearanceSeed:string}
export interface PaintedCluster extends Cluster {rotation:Point;color:string;card:boolean;variant:number}
export interface PaintedTree extends TreeModel {
  kind:'painterly';appearanceSeed:string;foliage:PaintedCluster[];art:ArtControls;
  palette:{name:string;shadow:string;body:string;light:string;bark:string};
}
interface Skeleton {segments:Segment[];anchors:{position:Point;size:Point;rotation:Point;variant:number}[];parameters:TreeModel['parameters']}
const structures=new Map<string,Skeleton>(),variants=new Map<string,PaintedTree>();
let hits=0,misses=0;
const CAPACITY=128;
function retain<T>(cache:Map<string,T>,key:string,value:T){cache.delete(key);cache.set(key,value);if(cache.size>CAPACITY)cache.delete(cache.keys().next().value!);return value;}
export function treeCacheStats(){return {structures:structures.size,variants:variants.size,capacity:CAPACITY,hits,misses};}
export function clearTreeCache(){structures.clear();variants.clear();hits=0;misses=0;}
const tuple=(v:Vector3):Point=>[v.x,v.y,v.z];
function validate(options:PainterlyOptions):ArtControls {
  if(!Object.hasOwn(presets,options.presetId))throw new Error('Unknown tree preset.');
  const art={...defaultArt,...Object.fromEntries(Object.entries(options).filter(([k])=>k in defaultArt))} as ArtControls;
  for(const v of Object.values(art))if(!Number.isFinite(v)||v<0||v>1)throw new Error('Art controls must be between 0 and 1.');
  return art;
}
function skeleton(presetId:string,seed:string,art:ArtControls):Skeleton {
  const preset=presets[presetId],rand=randomSource(`${presetId}|${seed}|architecture-v1`),range=(a:number,b:number)=>a+(b-a)*rand();
  const h=range(...preset.height),radius=range(...preset.crownRadius),trunkR=preset.trunkRadius*range(.85,1.2);
  const conifer=preset.architecture==='central-leader-conifer'&&presetId!=='pine',umbrella=preset.architecture==='umbrella-canopy',pine=presetId==='pine';
  const asym=art.asymmetry,phase=range(0,Math.PI*2),lean=range(.025,.075)*h*asym;
  const segments:Segment[]=[],anchors:Skeleton['anchors']=[];
  const trunkTop=conifer?h:h*(pine?.76:umbrella?.57:.62);
  const trunkAt=(t:number)=>new Vector3(Math.sin(t*2.2)*lean,t*trunkTop,Math.sin(t*3+phase)*lean*.6);
  // A continuous, subtly curved central trunk. Branches are paths, not straight cones.
  for(let i=0;i<14;i++){
    const a=i/14,b=(i+1)/14;
    segments.push({a:tuple(trunkAt(a)),b:tuple(trunkAt(b)),r0:trunkR*Math.pow(1-a*.96,conifer?.9:1.15),r1:trunkR*Math.pow(1-b*.96,conifer?.9:1.15),depth:0});
  }
  const attach=(position:Vector3,size:Point,rotation:Point)=>anchors.push({position:tuple(position),size,rotation,variant:Math.floor(rand()*2)});
  function curvedPath(start:Vector3,end:Vector3,r:number,depth:number,bend:number){
    const points=[start];
    for(let step=1;step<=3;step++){
      const t=step/3,p=start.clone().lerp(end,t);p.y+=Math.sin(t*Math.PI)*bend;
      p.x+=Math.sin(t*Math.PI)*bend*.25*Math.sin(phase+depth);points.push(p);
      segments.push({a:tuple(points[step-1]),b:tuple(p),r0:r*Math.pow(1-(step-1)/3*.76,.9),r1:r*Math.pow(1-t*.76,.9),depth});
    }
    return points;
  }
  function limb(start:Vector3,end:Vector3,r:number,depth:number,angle:number,span:number){
    curvedPath(start,end,r,depth,span*(umbrella?.04:.14));
    if(depth>=3){
      const size=radius*(umbrella?.27:pine?.29:.34)*range(.8,1.12);
      attach(end,[size*(umbrella?1.3:.96),size*(umbrella?.36:pine?.54:.98),size], [range(-.17,.17),angle,range(-.15,.15)]);
      return;
    }
    const childCount=depth===1?3:2;
    for(let j=0;j<childCount;j++){
      // Independent gaps and asymmetric lengths break the radial diagram silhouette.
      if(depth===2&&rand()<.12*asym)continue;
      const a=angle+(j-(childCount-1)/2)*range(.5,.95)+range(-.45,.45)*asym;
      const length=span*range(.45,.72)*(1+asym*Math.sin(a+phase)*.2);
      const next=end.clone().add(new Vector3(Math.cos(a)*length,length*(umbrella?.13:pine?.28:.54)*range(.8,1.3),Math.sin(a)*length));
      limb(end,next,r*.46,depth+1,a,length);
    }
    if(depth===2&&rand()>.4)attach(end,[radius*.24,radius*(umbrella?.12:.23),radius*.25],[0,angle,0]);
  }
  if(conifer){
    const tiers=presetId==='spruce'?12:10;
    for(let tier=0;tier<tiers;tier++){
      const f=tier/(tiers-1)*.98,t=preset.crownBase+f*(.95-preset.crownBase),tierGap=h*(.95-preset.crownBase)/tiers;
      const count=tier>tiers-3?4:5;
      for(let j=0;j<count;j++){
        if(rand()<.16*asym&&tier>1)continue;
        const base=trunkAt(t+range(-.012,.012)*asym);
        const a=phase+tier*2.399+j*Math.PI*2/count+range(-.3,.3)*asym;
        const length=radius*Math.pow(1-f,.85)*range(.8,1.15)*(1+Math.sin(a+phase)*asym*.2);
        const end=base.clone().add(new Vector3(Math.cos(a)*length,-length*preset.droop,Math.sin(a)*length));
        curvedPath(base,end,trunkR*.25*(1-f*.75),1,-length*.12);
        for(let k=0;k<3;k++){
          const t2=.38+k*.25,p=base.clone().lerp(end,t2);p.y-=Math.sin(t2*Math.PI)*length*.12;
          const size=length*(.45-k*.055)+.16;
          const skirt=tierGap*(presetId==='spruce'?.78:.64)+size*.18;
          attach(p,[size,skirt,size*.72],[range(-.08,.08),-a,range(-.17,.17)]);
          if(k===1){const twig=p.clone().add(new Vector3(Math.cos(a+.65)*length*.24,-.08,Math.sin(a+.65)*length*.24));curvedPath(p,twig,trunkR*.065,2,-.08);}
        }
      }
    }
    attach(trunkAt(.975),[radius*.1,h*.025,radius*.1],[0,phase,0]);
  }else{
    const limbs=umbrella?6:pine?6:7;
    for(let j=0;j<limbs;j++){
      const a=phase+j*Math.PI*2/limbs+range(-.3,.3)*asym;
      const start=trunkAt(range(pine?.6:umbrella?.6:.36,.96));
      const span=radius*range(.5,.85)*(1+Math.sin(a+phase)*asym*.2);
      const lift=umbrella?.21:pine?.15:.24+.16*(.5+.5*Math.cos(a-phase));
      const end=start.clone().add(new Vector3(Math.cos(a)*span,h*lift*range(.75,1.1),Math.sin(a)*span));
      limb(start,end,trunkR*(umbrella?.47:.53)*range(.8,1.1),1,a,span);
    }
    // A few inner crown masses keep the silhouette unified while leaving branch windows.
    for(let j=0;j<4;j++){
      const a=phase+j*2.4,size=radius*.32;
      const end=new Vector3(Math.cos(a)*radius*.28,h*(umbrella?.77:pine?.88:1.02+range(-.05,.05)),Math.sin(a)*radius*.28);
      curvedPath(trunkAt(.9),end,trunkR*.16,1,.3);
      attach(end,[size*1.1,size*(umbrella?.4:pine?.7:1.12),size],[0,a,0]);
    }
  }
  return {segments,anchors,parameters:{height:h,crownRadius:radius,crownBase:preset.crownBase,trunkRadius:trunkR,taper:preset.taper,recursion:conifer?2:3,whorls:conifer?(presetId==='spruce'?12:10):0,spread:preset.spread,droop:preset.droop}};
}
const broadPalettes=[
  {name:'Moss & sunlight',shadow:'#315746',body:'#6d943f',light:'#c2cb64',bark:'#8d7060'},
  {name:'Copper & sage',shadow:'#63533c',body:'#b37638',light:'#e8b75e',bark:'#8d6b62'},
  {name:'Lime & celadon',shadow:'#315e53',body:'#78a267',light:'#d0d67d',bark:'#917964'},
];
const needlePalettes=[
  {name:'Jade & gold',shadow:'#244e48',body:'#438167',light:'#9fb479',bark:'#96745e'},
  {name:'Blue spruce study',shadow:'#244b53',body:'#5b8d87',light:'#afc6a3',bark:'#8d7466'},
  {name:'Pine & ochre',shadow:'#354e3e',body:'#658354',light:'#b4bf79',bark:'#af7b58'},
];
/** Bounded CPU caches store immutable descriptors, never live GPU resources. */
export function generatePainterlyTree(options:PainterlyOptions):PaintedTree {
  const art=validate(options),{presetId,structuralSeed,appearanceSeed}=options;
  const structureKey=JSON.stringify([presetId,structuralSeed,art.asymmetry]);
  const variantKey=JSON.stringify([structureKey,appearanceSeed,art.stylization,art.foliageDensity]);
  const cached=variants.get(variantKey);if(cached){hits++;return retain(variants,variantKey,cached);}
  misses++;
  const core=structures.get(structureKey)??retain(structures,structureKey,skeleton(presetId,structuralSeed,art));
  const rand=randomSource(`${appearanceSeed}|${presetId}|pigment-v1`),conifer=['douglas','spruce','pine'].includes(presetId);
  const palette=(conifer?needlePalettes:broadPalettes)[(hashSeed(appearanceSeed)+(presetId==='douglas'?1:presetId==='spruce'?2:0))%3];
  const shadow=new Color(palette.shadow),body=new Color(palette.body),light=new Color(palette.light);
  const foliage:PaintedCluster[]=core.anchors.filter((_,i)=>art.foliageDensity>0&&(i%5===0||randomSource(structureKey+'|anchor|'+i)()<art.foliageDensity)).map((a,i)=>{
    const c=body.clone().lerp(rand()<.3?shadow:light,rand()*(.25+art.stylization*.45));
    c.offsetHSL((rand()-.5)*.035,(rand()-.5)*.1,(rand()-.5)*.06);
    const scale=1.05+art.stylization*.23;
    return {position:a.position,scale:a.size.map(v=>v*scale) as Point,rotation:a.rotation,tint:.88+rand()*.22,color:'#'+c.getHexString(),card:i%4===0,variant:a.variant};
  });
  const min=new Vector3(0,0,0),max=new Vector3(0,0,0);
  for(const s of core.segments)for(const p of [s.a,s.b]){min.min(new Vector3(...p));max.max(new Vector3(...p));}
  for(const f of foliage){const p=new Vector3(...f.position),s=new Vector3(...f.scale).multiplyScalar(1.16);min.min(p.clone().sub(s));max.max(p.clone().add(s));}
  const result:PaintedTree={kind:'painterly',seed:structuralSeed,appearanceSeed,presetId,segments:core.segments,foliage,parameters:core.parameters,art,palette,dimensions:{height:max.y-min.y,crownWidth:max.x-min.x,crownDepth:max.z-min.z}};
  return retain(variants,variantKey,result);
}
