import {Color,Quaternion,Vector3} from 'three';
import {generatePainterlyTree,type PaintedTree} from '../forest/painterly';
import {randomSource} from '../forest/random';
import type {Point,Segment} from '../forest/tree';
export type StudioKind='broadleaf'|'flower'|'conifer';
export interface StudioSettings {size:number;density:number;overlap:number;detail:number;colorVariation:number;structure:string;appearance:string;view:StudioKind|'all';mode:'leaf'|'groups'|'trees';unified?:boolean;leafScale?:number;asymmetry?:number;shape?:number}
export const studioDefaults:StudioSettings={size:1,density:.76,overlap:.72,detail:.75,colorVariation:.65,structure:'29',appearance:'garden',view:'all',mode:'groups'};
export const studioKinds:StudioKind[]=['broadleaf','flower','conifer'];
export interface FoliageGroup {id:number;anchor:Point;center:Point;radii:Point;branchIndex:number;axis:Point}
export interface StudioFrond {position:Point;rotation:[number,number,number,number];width:number;length:number;curve:number;droop:number;tile:number;color:string;normal:Point;interior:number;groupId:number}
export interface StudioStudy {kind:StudioKind;model:PaintedTree;groups:FoliageGroup[];fronds:StudioFrond[];segments:Segment[];scale:number;offset:Point}
export function parseStudio(p:Pick<URLSearchParams,'get'>):StudioSettings{
  const q={...studioDefaults};for(const key of ['size','density','overlap','detail','colorVariation'] as const){if(p.get(key)!==null)q[key]=Number(p.get(key));const min=key==='size'?.5:0,max=key==='size'?1.8:1;if(!Number.isFinite(q[key])||q[key]<min||q[key]>max)throw Error('Studio controls are outside their supported range.');}
  q.structure=(p.get('structure')??q.structure).slice(0,64);q.appearance=(p.get('appearance')??q.appearance).slice(0,64);
  const view=p.get('view')??q.view,mode=p.get('mode')??q.mode;if(!['all',...studioKinds].includes(view)||!['groups','trees'].includes(mode))throw Error('Unknown studio view.');q.view=view as StudioSettings['view'];q.mode=mode as StudioSettings['mode'];return q;
}
export function studioQuery(q:StudioSettings){return new URLSearchParams(Object.entries(q).map(([k,v])=>[k,String(v)])).toString();}
function nearest(p:Point,segments:Segment[],allowTrunk=false){let distance=Infinity,index=0,point:Point=segments[0].b;const v=new Vector3(...p);
  segments.forEach((s,i)=>{if(!s.depth&&!allowTrunk)return;const a=new Vector3(...s.a),d=new Vector3(...s.b).sub(a),t=Math.max(0,Math.min(1,v.clone().sub(a).dot(d)/d.lengthSq())),candidate=a.addScaledVector(d,t),dist=v.distanceToSquared(candidate);if(dist<distance){distance=dist;index=i;point=candidate.toArray() as Point;}});return {index,point};}
/** New branch-attached foliage only. Existing trunks, branches and presets are read without mutation. */
export function createStudioStudy(kind:StudioKind,q:StudioSettings):StudioStudy{
  const model=generatePainterlyTree({presetId:kind==='conifer'?'douglas':'oak',structuralSeed:q.structure,appearanceSeed:q.appearance,foliageDensity:1,asymmetry:.72}),rand=randomSource(q.structure+'|studio-groups|'+kind),paint=randomSource(q.appearance+'|studio-paint|'+kind),conifer=kind==='conifer';
  const candidates=model.foliage.map((f,i)=>{const attachment=nearest(f.position,model.segments,conifer&&f.position[1]>model.parameters.height*.94),branch=model.segments[attachment.index];return {id:i,anchor:attachment.point,center:f.position,radii:f.scale.map(n=>n*q.size*(conifer?1.15:1.28)) as Point,branchIndex:attachment.index,axis:new Vector3(...branch.b).sub(new Vector3(...branch.a)).normalize().toArray() as Point};});
  // Broadleaf anchors include the actual recursive branch tips; conifer guides follow its existing horizontal tiers.
  const all=candidates.filter((_,i)=>conifer?i%3!==2:i%2===0);
  const chosen=q.mode!=='trees'?[all[Math.floor(all.length*.43)]]:all;
  const groups=chosen.map(g=>({...g,radii:g.radii.map((r,i)=>r*(q.unified&&i===1?.7+(q.shape??.5)*.6:1)) as Point}));
  const fronds:StudioFrond[]=[];
  for(const group of groups){
    const layers=conifer?3:3,spokes=conifer?Math.round(2+q.density*2):Math.round(4+q.density*5),phase=rand()*6.283;
    for(let layer=0;layer<layers;layer++)for(let j=0;j<spokes;j++){
      if(q.density===0&&q.mode!=='leaf')continue;
      const a=conifer?Math.atan2(group.axis[2],group.axis[0])+(j/Math.max(1,spokes-1)-.5)*1.4*(.6+.6*(q.asymmetry??.7))+layer*.12:phase+j/spokes*Math.PI*2+layer*.63+(rand()-.5)*.3*(q.asymmetry??1),rad=(conifer?.12:.5)*(1-layer*.15)*(conifer?1:.8+rand()*.4),r=group.radii;
      const position:Point=[group.anchor[0]+Math.cos(a)*r[0]*rad,group.anchor[1]+r[1]*(conifer?layer*.18-.18:[-.22,.18,.5][layer]+(rand()-.5)*.18),group.anchor[2]+Math.sin(a)*r[2]*rad];
      const direction=conifer?new Vector3(Math.cos(a)*(group.axis[1]>.9?.2:1),group.axis[1]>.9?.9:-.12-layer*.04-.35*Math.pow(group.anchor[1]/model.parameters.height,2),Math.sin(a)*(group.axis[1]>.9?.2:1)):new Vector3(Math.cos(a)*.85,-.35+layer*.7,Math.sin(a)*.85);direction.normalize();
      const rotation=new Quaternion().setFromUnitVectors(new Vector3(0,conifer?1:0,conifer?0:1),direction).multiply(new Quaternion().setFromAxisAngle(new Vector3(0,conifer?1:0,conifer?0:1),(rand()-.5)*(conifer?1.2:.65)));
      const coverage=.83+q.overlap*.55,width=(conifer?Math.max(r[2]*.95,r[1]*.4):r[0]*1.5*[1.03,1.1,.8][layer])*coverage*(.85+rand()*.3),length=(conifer?Math.max(r[0]*1.3,r[1]*1.9):r[1]*1.06)*coverage*(.9+rand()*.22);
      const tint=new Color(kind==='flower'?'#f7e3ef':conifer?'#b9c8ae':'#c6d2b9').offsetHSL((paint()-.5)*q.colorVariation*.08,(paint()-.5)*q.colorVariation*.14,(paint()-.5)*q.colorVariation*.15);
      const parts=conifer?3:1;
      for(let part=0;part<parts;part++){
        const t=conifer?part*.29:0,p=new Vector3(...position).addScaledVector(direction,length*t);if(conifer)p.y-=length*t*t*.32;
        const shortLength=conifer?length*.48:length,shortWidth=conifer?Math.max(width*.88,shortLength*.68)*(1-part*.11):width;
        const turn=conifer?rotation.clone().multiply(new Quaternion().setFromAxisAngle(new Vector3(0,1,0),(rand()-.5)*.3)):rotation;
        fronds.push({position:p.toArray() as Point,rotation:turn.toArray(),width:shortWidth,length:shortLength,curve:conifer?.14:.18,droop:conifer?.24:.06,tile:studioKinds.indexOf(kind)*4+(q.unified?1+Math.floor(rand()*3):Math.floor(rand()*4)),color:'#'+tint.getHexString(),normal:new Vector3(Math.cos(a)*.75,-.4+layer*.65,Math.sin(a)*.75).normalize().toArray() as Point,interior:.48+layer*.26,groupId:group.id});
      }
    }
  }
  if(q.mode==='leaf'){const first=fronds[0];fronds.splice(0,fronds.length,{...first,position:[...groups[0].anchor],rotation:[0,0,0,1],width:2.5*(q.leafScale??1),length:2.5*(q.leafScale??1),curve:.07,droop:0,tile:conifer?8:0});}
  const source=groups[0],scale=q.mode!=='trees'?2.2*q.size/Math.max(...source.radii):6.8/model.dimensions.height,offset:Point=q.mode!=='trees'?source.anchor.map(n=>-n*scale) as Point:[0,0,0];
  let first=source.branchIndex,last=first;const same=(a:Point,b:Point)=>a.every((n,i)=>Math.abs(n-b[i])<1e-7);while(first>0&&model.segments[first-1].depth===model.segments[first].depth&&same(model.segments[first-1].b,model.segments[first].a))first--;while(last+1<model.segments.length&&model.segments[last+1].depth===model.segments[last].depth&&same(model.segments[last].b,model.segments[last+1].a))last++;const segments=q.mode==='leaf'?[]:q.mode==='groups'?model.segments.slice(first,last+1):model.segments;
  return {kind,model,groups,fronds,segments,scale,offset};
}
