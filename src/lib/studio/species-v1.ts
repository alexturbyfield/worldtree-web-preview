import {CatmullRomCurve3,Vector3} from 'three';
import {randomSource} from '../forest/random';
import type {Point,Segment} from '../forest/tree';
import type {PaintedTree} from '../forest/painterly';
import type {StudioSettings,StudioStudy,FoliageGroup,StudioFrond} from './groups';
export interface SpeciesDesign {name:string;scientificName:string;height:number;radius:number;trunk:number;base:number;branches:number;form:'pine'|'cedar'|'birch'|'maple'|'aspen'|'willow';bark:string;conifer:boolean}
/** Visual design presets only: no geographic presence or measured botanical dimensions implied. */
export const batchSpecies:Record<string,SpeciesDesign>={
 ponderosa:{name:'Ponderosa pine',scientificName:'Pinus ponderosa',height:23,radius:4.5,trunk:.54,base:.55,branches:8,form:'pine',bark:'#b17c49',conifer:true},
 cedar:{name:'Western red cedar',scientificName:'Thuja plicata',height:22,radius:4,trunk:.6,base:.15,branches:24,form:'cedar',bark:'#86604d',conifer:true},
 birch:{name:'Paper birch',scientificName:'Betula papyrifera',height:15,radius:3.3,trunk:.21,base:.3,branches:5,form:'birch',bark:'#e1dace',conifer:false},
 maple:{name:'Bigleaf maple',scientificName:'Acer macrophyllum',height:15,radius:5,trunk:.64,base:.27,branches:8,form:'maple',bark:'#7c7767',conifer:false},
 aspen:{name:'Quaking aspen',scientificName:'Populus tremuloides',height:17,radius:2.7,trunk:.29,base:.36,branches:10,form:'aspen',bark:'#bdc9b6',conifer:false},
 willow:{name:'Weeping willow',scientificName:'Salix babylonica',height:12,radius:5,trunk:.64,base:.28,branches:7,form:'willow',bark:'#82745e',conifer:false}
};
export function speciesV1Study(id:string,q:StudioSettings,patches:(g:FoliageGroup,q:StudioSettings)=>StudioFrond[]):StudioStudy{
 const p=batchSpecies[id],rand=randomSource(q.structure+'|species-v1|'+id),h=p.height*(.93+rand()*.14),r=p.radius*(.9+rand()*.2),phase=rand()*Math.PI*2;
 const segments:Segment[]=[],groups:FoliageGroup[]=[],fronds:StudioFrond[]=[],stems=p.form==='birch'?3:1;
 const line=(points:Vector3[],radius:number,depth:number)=>{const curve=new CatmullRomCurve3(points),first=segments.length,steps=depth===0?20:10;for(let i=0;i<steps;i++){const t=i/steps,u=(i+1)/steps;segments.push({a:curve.getPoint(t).toArray() as Point,b:curve.getPoint(u).toArray() as Point,r0:radius*Math.pow(1-t*.92,1.1),r1:radius*Math.pow(1-u*.92,1.1),depth});}return {curve,first,steps};};
 const leafy=(path:ReturnType<typeof line>,samples:number,size:number,start=.28,end=.94)=>{for(let j=0;j<samples;j++){const t=start+(end-start)*(samples===1?.5:j/(samples-1)),center=path.curve.getPointAt(t),index=path.first+Math.min(path.steps-1,Math.floor(path.curve.getUtoTmapping(t,0)*path.steps));const group:FoliageGroup={id:groups.length,anchor:center.toArray() as Point,center:center.toArray() as Point,radii:[size,size*.78,size*.94],branchIndex:index,axis:path.curve.getTangentAt(t).toArray() as Point};groups.push(group);for(const f of patches(group,{...q,palette:'sage'})){
   f.tile=0;
   if(p.form==='willow'){f.width*=.67;f.length*=1.25;}if(p.form==='cedar'){f.width*=.84;f.length*=1.18;}if(p.form==='pine'){f.width*=1.14;f.length*=.83;}
   fronds.push(f);
 }}};
 for(let stem=0;stem<stems;stem++){
  const a=phase+stem*2.399,lean=stems>1?1.5:.15+rand()*.25,stemH=h*(stems>1?.86+rand()*.14:1),leaderTop=p.form==='pine'?.91:p.form==='maple'?.65:p.form==='willow'?.55:1;
  const root=new Vector3(Math.cos(a)*stem*.13,0,Math.sin(a)*stem*.13),top=new Vector3(Math.cos(a)*lean,stemH*leaderTop,Math.sin(a)*lean);
  const middle=root.clone().lerp(top,.55);middle.x+=.18;const leader=line([root,middle,top],p.trunk*(stems>1?.8:1),0);
  for(let i=0;i<p.branches;i++){
   const f=i/(p.branches-1),t=p.base+(leaderTop-p.base)*(.08+f*.84),origin=leader.curve.getPointAt(t/leaderTop),angle=phase+stem*1.3+i*2.399+(rand()-.5)*.65,dir=new Vector3(Math.cos(angle),0,Math.sin(angle));
   let length=r*(.75+rand()*.35),rise=stemH*.16;
   if(p.form==='cedar'){length=r*Math.pow(1-f,.65)*(.9+rand()*.28)+.2;rise=-length*.13;}
   if(p.form==='pine'){length=r*(.65+rand()*.4)*(1-f*.45);rise=length*.24;}
   if(p.form==='aspen'||p.form==='birch'){length=r*(.55+rand()*.28)*(1-f*.5);rise=length*(p.form==='aspen'?1.05:.8);}
   if(p.form==='willow'){length=r*(.72+rand()*.3);rise=h*(.28-f*.12);}
   const tip=origin.clone().addScaledVector(dir,length);tip.y+=rise;const shoulder=origin.clone().lerp(tip,.55);shoulder.y+=length*(p.form==='willow'?.27:.09);
   const primary=line([origin,shoulder,tip],p.trunk*(p.form==='maple'||p.form==='willow'?.48:.28)*(1-f*.5),1);
   const children=p.form==='willow'?5:3;
   for(let j=0;j<children;j++){
    const u=.3+j/(children-1)*.62,start=primary.curve.getPointAt(u),b=angle+(j%2?-1:1)*(.4+rand()*.5),span=length*(.32+rand()*.18),end=start.clone().add(new Vector3(Math.cos(b)*span,0,Math.sin(b)*span));
    if(p.form==='willow'){
      end.y=Math.max(.8,start.y-(3.3+rand()*2.8));const bend=start.clone().lerp(end,.33);bend.x+=Math.cos(b)*.6;bend.z+=Math.sin(b)*.6;const hanging=line([start,bend,end],p.trunk*.065,2);leafy(hanging,5,.73,.12,.97);
    }else{
      end.y+=span*(p.form==='cedar'?-.7:p.form==='pine'?.22:.72);const bend=start.clone().lerp(end,.5);bend.y+=span*.16;const secondary=line([start,bend,end],p.trunk*.1*(1-f*.5),2);
      const size=p.form==='maple'?1.25:p.form==='pine'?1.05:p.form==='cedar'?.9:p.form==='birch'?.72:.83;leafy(secondary,p.conifer?3:2,size*(.9+rand()*.16),.22,.94);
    }
   }
   if(p.form==='pine'||p.form==='cedar')leafy(primary,3,p.form==='pine'?1.15:.86,.32,.97);
   if(p.form==='maple')leafy(primary,3,1.35,.32,.92);
  }
  if(p.form==='aspen')leafy(leader,7,.9,.43,.96);
  else if(p.form==='birch')leafy(leader,4,.75,.5,.97);
  else if(p.form==='cedar')leafy(leader,3,.55,.83,.98);
 }
 const max=new Vector3(),min=new Vector3();for(const s of segments)for(const a of [s.a,s.b]){max.max(new Vector3(...a));min.min(new Vector3(...a));}
 const model:PaintedTree={kind:'painterly',seed:q.structure,appearanceSeed:q.appearance,presetId:id,segments,foliage:[],art:{stylization:.7,foliageDensity:q.density,asymmetry:q.asymmetry??.7},palette:{name:'Painterly Sage',shadow:'#294135',body:'#6e9462',light:'#d9c976',bark:p.bark},parameters:{height:max.y,crownRadius:r,crownBase:p.base,trunkRadius:p.trunk,taper:.94,recursion:2,whorls:0,spread:1,droop:p.form==='willow'?.8:.15},dimensions:{height:max.y+1.4,crownWidth:max.x-min.x+2.8,crownDepth:max.z-min.z+2.8}};
 return {kind:'broadleaf',model,groups,fronds,segments,scale:.48,offset:[0,0,0]};
}
