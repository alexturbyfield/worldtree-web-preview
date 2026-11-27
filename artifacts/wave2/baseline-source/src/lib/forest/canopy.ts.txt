import {Color,Quaternion,Vector3} from 'three';
import {randomSource} from './random';
import type {Point,Segment} from './tree';
import type {PaintedTree} from './painterly';
import type {FoliageCard} from './foliage-cards';

export interface CanopyControls {fluffiness:number;clumpOverlap:number;surfaceLeafDetail:number;branchExposure:number}
export const defaultCanopy:CanopyControls={fluffiness:.78,clumpOverlap:.82,surfaceLeafDetail:.3,branchExposure:.12};
export interface CanopyClump {id:number;position:Point;scale:Point;rotation:number;variant:number;kind:'cloud'|'bough';color:string;interior:boolean;attachmentIndex:number;attachmentPoint:Point}
export interface CrownEnvelope {architecture:'rounded'|'layered-conical'|'open-pads'|'umbrella';center:Point;radius:Point;base:number;top:number}
export interface Canopy {controls:CanopyControls;envelope:CrownEnvelope;clumps:CanopyClump[];coarseClumps:CanopyClump[];surfaceCards:FoliageCard[];bounds:{min:Point;max:Point};dimensions:{height:number;crownWidth:number;crownDepth:number};palette:{name:string;shadow:string;body:string;light:string}}
type Shape=Omit<CanopyClump,'color'>;
const cache=new Map<string,{envelope:CrownEnvelope;clumps:Shape[];coarse:Shape[]}>();
export function canopyCacheStats(){return {entries:cache.size,capacity:128};}
function nearestBranch(position:Point,segments:Segment[]){
  const p=new Vector3(...position);let best=Infinity,index=0,point=segments[0].a;
  segments.forEach((s,i)=>{if(s.depth>1)return;const a=new Vector3(...s.a),d=new Vector3(...s.b).sub(a),t=Math.max(0,Math.min(1,p.clone().sub(a).dot(d)/Math.max(1e-9,d.lengthSq()))),q=a.addScaledVector(d,t),dist=p.distanceToSquared(q);if(dist<best){best=dist;index=i;point=q.toArray() as Point;}});
  return {index,point};
}
function shapeCanopy(model:PaintedTree,controls:CanopyControls,coarse:boolean){
  const rand=randomSource(`${model.presetId}|${model.seed}|wildloom-crown|${coarse?'coarse':'full'}`),range=(a:number,b:number)=>a+(b-a)*rand();
  const h=model.parameters.height,r=model.parameters.crownRadius,asym=model.art.asymmetry;
  const conifer=['douglas','spruce'].includes(model.presetId),pine=model.presetId==='pine',umbrella=model.presetId==='acacia';
  const rw=r*(conifer?1.45:umbrella?1.72:pine?1.45:1.55)*(.9+model.art.stylization*.14),ry=h*(conifer?.43:umbrella?.22:pine?.2:.32),center:Point=[0,h*(conifer?.56:umbrella?.82:pine?.86:.84),0];
  const envelope:CrownEnvelope={architecture:conifer?'layered-conical':umbrella?'umbrella':pine?'open-pads':'rounded',center,radius:[rw,ry,rw*(umbrella?.88:.95)],base:center[1]-ry,top:center[1]+ry};
  const shapes:Shape[]=[],phase=range(0,6.283),fullness=(.96+controls.fluffiness*.2)*(.9+controls.clumpOverlap*.27)*(1-controls.branchExposure*.17)*(.82+model.art.foliageDensity*.22);
  const add=(position:Point,scale:Point,rotation=0,interior=false)=>{
    const anchor=nearestBranch(position,model.segments);
    const dimensions=scale.map(s=>s*fullness) as Point;
    dimensions[1]=Math.min(dimensions[1],Math.max(.05,(position[1]-.2)/(conifer?1.4:1.15)));
    shapes.push({id:shapes.length,position,scale:dimensions,rotation,interior,kind:conifer?'bough':'cloud',variant:Math.floor(rand()*3),attachmentIndex:anchor.index,attachmentPoint:anchor.point});
  };
  if(model.art.foliageDensity===0)return {envelope,shapes};
  if(conifer){
    const tiers=coarse?6:8,base=h*(model.presetId==='spruce'?.1:.14),top=h*.94,gap=(top-base)/(tiers-1);
    for(let tier=0;tier<tiers;tier++){
      const f=tier/(tiers-1),y=base+(top-base)*(1-Math.pow(1-f,1.25)),rad=rw*Math.pow(1-f,.88)+r*.14,arms=coarse?3:4;
      const thickness=gap*(.78-f*.32)+h*.012;
      add([Math.sin(f*3+phase)*r*.07,y,Math.cos(f*4+phase)*r*.05],[rad*.66,thickness,rad*.63],phase,true);
      for(let j=0;j<arms;j++){
        const a=phase+tier*2.399+j*Math.PI*2/arms+range(-.12,.12)*asym,d=rad*.42;
        add([Math.cos(a)*d,y+range(-.12,.12)*gap,Math.sin(a)*d],[rad*.67,thickness*(model.presetId==='spruce'?1.04:.98),rad*.55],-a);
      }
    }
    add([0,h*.965,0],[r*.22,h*.06,r*.2],phase,true);
  }else if(umbrella){
    // A broad, connected table canopy with gently domed pads, not an oak distribution.
    add([0,center[1],0],[rw*.67,ry*.95,rw*.6],phase,true);
    const count=coarse?7:11;
    for(let j=0;j<count;j++){const a=phase+j*Math.PI*2/count,d=rw*(.48+range(-.04,.04)*asym);add([Math.cos(a)*d,center[1]+Math.sin(a*2+phase)*ry*.3,Math.sin(a)*d*.88],[rw*range(.38,.46),ry*range(.68,.9),rw*range(.31,.4)],a);}
    add([rw*.12,center[1]+ry*.3,-rw*.08],[rw*.55,ry*.74,rw*.48],phase+.7,true);
  }else if(pine){
    // Mature pine: high, offset branch-end pads and intentional windows above a clear trunk.
    add([0,center[1],0],[rw*.55,ry*.85,rw*.5],phase,true);
    const count=coarse?6:9;
    for(let j=0;j<count;j++){const a=phase+j*2.399,d=rw*range(.35,.65),y=center[1]+Math.sin(a+phase)*ry*.35;add([Math.cos(a)*d,y,Math.sin(a)*d*.9],[rw*range(.31,.4),ry*range(.55,.8),rw*range(.28,.37)],a);}
  }else{
    // Overlapping lower/upper crowns and interior bridges form one rounded crown envelope.
    add([-rw*.2,center[1]-ry*.12,rw*.05],[rw*.59,ry*.84,rw*.54],phase,true);
    add([rw*.2,center[1]+ry*.1,-rw*.09],[rw*.59,ry*.83,rw*.53],phase+1,true);
    const rings=coarse?[{n:7,d:.57,y:-.2,s:.49},{n:4,d:.33,y:.4,s:.51}]:[{n:10,d:.62,y:-.25,s:.43},{n:7,d:.4,y:.36,s:.43}];
    for(const ring of rings)for(let j=0;j<ring.n;j++){
      const a=phase+j*Math.PI*2/ring.n+(ring.y>0?.5:0),d=rw*(ring.d+range(-.06,.06)*asym);
      add([Math.cos(a)*d,center[1]+ry*(ring.y+range(-.12,.12)*asym),Math.sin(a)*d*.95],[rw*ring.s*range(.92,1.09),ry*range(.58,.74),rw*ring.s*range(.9,1.07)],a);
    }
    add([0,center[1]+ry*.52,0],[rw*.49,ry*.58,rw*.47],phase+.4,true);
  }
  return {envelope,shapes};
}
export function generateCanopy(model:PaintedTree,options:Partial<CanopyControls>={}):Canopy {
  const controls={...defaultCanopy,...options};for(const n of Object.values(controls))if(!Number.isFinite(n)||n<0||n>1)throw new Error('Canopy controls must be 0–1.');
  const key=JSON.stringify([model.presetId,model.seed,model.art.asymmetry,model.art.foliageDensity,controls.fluffiness,controls.clumpOverlap,controls.branchExposure,model.art.stylization]);
  let structural=cache.get(key);
  if(!structural){const full=shapeCanopy(model,controls,false),coarse=shapeCanopy(model,controls,true);structural={envelope:full.envelope,clumps:full.shapes,coarse:coarse.shapes};cache.set(key,structural);if(cache.size>128)cache.delete(cache.keys().next().value!);}
  const base=model.presetId==='douglas'?'#3f7e62':model.presetId==='spruce'?'#548b75':model.presetId==='pine'?'#5b8b4d':model.presetId==='acacia'?'#6d944f':'#5d964d';
  const paletteRand=randomSource(model.appearanceSeed+'|wildloom-palette'),body=new Color(base).offsetHSL((paletteRand()-.5)*.045,(paletteRand()-.5)*.1,(paletteRand()-.5)*.04),light=new Color('#b9d491'),shadow=new Color('#3d7054');
  const paint=(shapes:Shape[])=>shapes.map(s=>{const rand=randomSource(`${model.appearanceSeed}|clump|${s.id}`),c=body.clone().lerp(s.interior?shadow:light,s.interior?.12+rand()*.13:rand()*.28);c.offsetHSL((rand()-.5)*.025,0,(rand()-.5)*.045);return {...s,color:'#'+c.getHexString()};});
  const clumps=paint(structural.clumps),coarseClumps=paint(structural.coarse),surfaceCards:FoliageCard[]=[];
  const rand=randomSource(model.seed+'|surface-crown-v01'),candidates=clumps.filter(c=>!c.interior),count=Math.min(candidates.length,Math.round(controls.surfaceLeafDetail*16));
  for(let j=0;j<count;j++){
    const clump=candidates[Math.floor(j/count*candidates.length)],a=rand()*Math.PI*2,normal=new Vector3(Math.cos(a)*.65,.75+rand()*.25,Math.sin(a)*.65).normalize();
    const q=new Quaternion().setFromAxisAngle(new Vector3(0,1,0),clump.rotation),p=new Vector3(normal.x*clump.scale[0],normal.y*clump.scale[1],normal.z*clump.scale[2]).multiplyScalar(.96).applyQuaternion(q).add(new Vector3(...clump.position));
    const n=normal.clone().applyQuaternion(q),rotation=new Quaternion().setFromUnitVectors(new Vector3(0,0,1),n),size=(model.presetId==='douglas'||model.presetId==='spruce'?.7:.45)*(1+rand()*.3);
    surfaceCards.push({id:j,position:p.toArray() as Point,rotation:rotation.toArray(),size:[size,size*.7],tile:model.presetId==='douglas'?0:model.presetId==='spruce'?2:model.presetId==='pine'?1:model.presetId==='acacia'?7:4,phase:rand()*6.28,priority:j/Math.max(1,count),color:clump.color,segmentIndex:clump.attachmentIndex,attachmentT:1});
  }
  const min=new Vector3(0,0,0),max=new Vector3(0,model.parameters.height,0);
  for(const c of [...clumps,...coarseClumps]){const cs=Math.abs(Math.cos(c.rotation)),sn=Math.abs(Math.sin(c.rotation)),extent=new Vector3((cs*c.scale[0]+sn*c.scale[2])*1.15,c.scale[1]*1.2,(sn*c.scale[0]+cs*c.scale[2])*1.15),p=new Vector3(...c.position);min.min(p.clone().sub(extent));max.max(p.clone().add(extent));}
  return {controls,envelope:structural.envelope,clumps,coarseClumps,surfaceCards,bounds:{min:min.toArray() as Point,max:max.toArray() as Point},dimensions:{height:max.y-min.y,crownWidth:max.x-min.x,crownDepth:max.z-min.z},palette:{name:'Wild greens',body:'#'+body.getHexString(),light:'#'+light.getHexString(),shadow:'#'+shadow.getHexString()}};
}
