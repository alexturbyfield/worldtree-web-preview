import {CatmullRomCurve3,Vector3} from 'three';
import {randomSource} from '../forest/random';
import type {Point,Segment} from '../forest/tree';
import type {PaintedTree} from '../forest/painterly';
import type {StudioSettings,StudioStudy,FoliageGroup,StudioFrond} from './groups';
/** Growth constraints, not closed crown meshes or species-specific generators. */
export interface CrownArchitecture {radiusProfile:[number,number,number];initiationBias:number;dominance:number;curvature:number;apicalBias:number;fanAngle:number;occupancy:number;leafInterval:[number,number]}
export interface EmergentGrowth {architecture?:CrownArchitecture;leaderTop:number;rise:number;secondaryRise:number;forks:number;clusterSize:number;trunkTaper:number;limb:number;buttressCount:number;buttressHeight:number;buttressReach:number}
export interface SpeciesDesign {name:string;scientificName:string;height:number;radius:number;trunk:number;base:number;branches:number;form:'pine'|'cedar'|'birch'|'maple'|'aspen'|'willow'|'silver-birch'|'ash'|'emergent';bark:string;conifer:boolean;emergent?:EmergentGrowth}
/** Visual design presets only: no geographic presence or measured botanical dimensions implied. */
export const batchSpecies:Record<string,SpeciesDesign>={
 mahogany:{name:'Bigleaf mahogany',scientificName:'Swietenia macrophylla',height:31,radius:9.5,trunk:.83,base:.5,branches:9,form:'emergent',bark:'#806753',conifer:false,emergent:{leaderTop:.92,rise:.35,secondaryRise:.4,forks:4,clusterSize:2.05,trunkTaper:.6,limb:.38,buttressCount:4,buttressHeight:2.2,buttressReach:1.15,architecture:{radiusProfile:[.75,1.05,.22],initiationBias:1.05,dominance:.23,curvature:.15,apicalBias:.5,fanAngle:1.1,occupancy:.95,leafInterval:[.12,.97]}}},
 'dipterocarp-alatus':{name:'Dipterocarpus alatus',scientificName:'Dipterocarpus alatus',height:42,radius:7,trunk:1.02,base:.54,branches:8,form:'emergent',bark:'#8b7c65',conifer:false,emergent:{leaderTop:.98,rise:.84,secondaryRise:.8,forks:4,clusterSize:2.1,trunkTaper:.55,limb:.33,buttressCount:4,buttressHeight:3.2,buttressReach:1.55,architecture:{radiusProfile:[.43,.92,.14],initiationBias:.85,dominance:.13,curvature:.055,apicalBias:.46,fanAngle:.65,occupancy:.98,leafInterval:[.15,.98]}}},
 'dipterocarp-grandiflorus':{name:'Dipterocarpus grandiflorus',scientificName:'Dipterocarpus grandiflorus',height:38,radius:11,trunk:1.1,base:.53,branches:9,form:'emergent',bark:'#776c5b',conifer:false,emergent:{leaderTop:.9,rise:.3,secondaryRise:.28,forks:4,clusterSize:2.5,trunkTaper:.57,limb:.44,buttressCount:5,buttressHeight:4.2,buttressReach:2.8,architecture:{radiusProfile:[1.06,.95,.26],initiationBias:1.35,dominance:.36,curvature:.19,apicalBias:.22,fanAngle:1.25,occupancy:.85,leafInterval:[.14,.97]}}},
 kapok:{name:'Kapok',scientificName:'Ceiba pentandra',height:45,radius:14,trunk:1.85,base:.64,branches:7,form:'emergent',bark:'#7c8069',conifer:false,emergent:{leaderTop:.88,rise:.17,secondaryRise:.08,forks:4,clusterSize:3,trunkTaper:.48,limb:.5,buttressCount:5,buttressHeight:7,buttressReach:5,architecture:{radiusProfile:[1.12,.98,.18],initiationBias:1.8,dominance:.52,curvature:.29,apicalBias:.08,fanAngle:1.12,occupancy:.77,leafInterval:[.28,.98]}}},
 ponderosa:{name:'Ponderosa pine',scientificName:'Pinus ponderosa',height:23,radius:4.5,trunk:.54,base:.55,branches:8,form:'pine',bark:'#b17c49',conifer:true},
 cedar:{name:'Western red cedar',scientificName:'Thuja plicata',height:22,radius:4,trunk:.6,base:.15,branches:24,form:'cedar',bark:'#86604d',conifer:true},
 'silver-birch':{name:'Silver birch',scientificName:'Betula pendula',height:17,radius:3.5,trunk:.25,base:.26,branches:13,form:'silver-birch',bark:'#dedfd6',conifer:false},
 ash:{name:'European ash',scientificName:'Fraxinus excelsior',height:18,radius:5,trunk:.5,base:.25,branches:8,form:'ash',bark:'#817c70',conifer:false},
 birch:{name:'Paper birch',scientificName:'Betula papyrifera',height:15,radius:3.3,trunk:.21,base:.3,branches:5,form:'birch',bark:'#e1dace',conifer:false},
 maple:{name:'Bigleaf maple',scientificName:'Acer macrophyllum',height:15,radius:5,trunk:.64,base:.27,branches:8,form:'maple',bark:'#7c7767',conifer:false},
 aspen:{name:'Quaking aspen',scientificName:'Populus tremuloides',height:17,radius:2.7,trunk:.29,base:.36,branches:10,form:'aspen',bark:'#bdc9b6',conifer:false},
 willow:{name:'Weeping willow',scientificName:'Salix babylonica',height:12,radius:5,trunk:.64,base:.28,branches:7,form:'willow',bark:'#82745e',conifer:false}
};
export function speciesV1Study(id:string,q:StudioSettings,patches:(g:FoliageGroup,q:StudioSettings)=>StudioFrond[]):StudioStudy{
 const p=batchSpecies[id],rand=randomSource(q.structure+'|species-v1|'+id),h=p.height*(.93+rand()*.14),r=p.radius*(.9+rand()*.2),phase=rand()*Math.PI*2,emergent=p.emergent,architecture=emergent?.architecture;
 // Smooth radius constraint affects branch growth; foliage is never clipped against a shell.
 const crownRadius=(f:number)=>{if(!architecture)return 1;const u=f<.5?f*2:(f-.5)*2,k=f<.5?0:1,t=u*u*(3-2*u);return architecture.radiusProfile[k]*(1-t)+architecture.radiusProfile[k+1]*t;};
 const segments:Segment[]=[],groups:FoliageGroup[]=[],fronds:StudioFrond[]=[],stems=p.form==='birch'?3:1;
 const line=(points:Vector3[],radius:number,depth:number)=>{const curve=new CatmullRomCurve3(points),first=segments.length,steps=depth===0?20:10;for(let i=0;i<steps;i++){const t=i/steps,u=(i+1)/steps;segments.push({a:curve.getPoint(t).toArray() as Point,b:curve.getPoint(u).toArray() as Point,r0:radius*Math.pow(1-t*(depth===0&&emergent?emergent.trunkTaper:.92),1.1),r1:radius*Math.pow(1-u*(depth===0&&emergent?emergent.trunkTaper:.92),1.1),depth});}return {curve,first,steps};};
 const leafy=(path:ReturnType<typeof line>,samples:number,size:number,start=.28,end=.94)=>{for(let j=0;j<samples;j++){// Omit only some inner guides; every living branch retains its terminal spray.
 if(architecture&&j>0&&j<samples-1&&randomSource(q.structure+'|crown-opening|'+path.first+'|'+j)()>architecture.occupancy)continue;
 const t=start+(end-start)*(samples===1?.5:j/(samples-1)),center=path.curve.getPointAt(t),index=path.first+Math.min(path.steps-1,Math.floor(path.curve.getUtoTmapping(t,0)*path.steps));const group:FoliageGroup={id:groups.length,anchor:center.toArray() as Point,center:center.toArray() as Point,radii:[size,size*.78,size*.94],branchIndex:index,axis:path.curve.getTangentAt(t).toArray() as Point};groups.push(group);for(const f of patches(group,{...q,palette:'sage'})){
   f.tile=0;
   if(p.form==='silver-birch'){f.width*=.84;f.length*=1.08;}if(p.form==='ash'){f.width*=1.06;f.length*=.95;}
   if(p.form==='willow'){f.width*=.67;f.length*=1.25;}if(p.form==='cedar'){f.width*=.84;f.length*=1.18;}if(p.form==='pine'){f.width*=1.14;f.length*=.83;}
   fronds.push(f);
 }}};
 for(let stem=0;stem<stems;stem++){
  const a=phase+stem*2.399,lean=stems>1?1.5:p.form==='silver-birch'?.6+rand()*.35:.15+rand()*.25,stemH=h*(stems>1?.86+rand()*.14:1),leaderTop=emergent?emergent.leaderTop:p.form==='pine'?.91:p.form==='maple'?.65:p.form==='ash'?.61:p.form==='willow'?.55:1;
  const root=new Vector3(Math.cos(a)*stem*.13,0,Math.sin(a)*stem*.13),top=new Vector3(Math.cos(a)*lean,stemH*leaderTop,Math.sin(a)*lean);
  const middle=root.clone().lerp(top,.55);middle.x+=.18;const leader=line([root,middle,top],p.trunk*(stems>1?.8:1),0);
  for(let i=0;i<p.branches;i++){
   const f=i/(p.branches-1),hierarchy=architecture?1+architecture.dominance*Math.cos(phase+i*2.399):1,t=p.base+(leaderTop-p.base)*(.08+Math.pow(f,architecture?.initiationBias??1)*.84),origin=leader.curve.getPointAt(t/leaderTop),angle=phase+stem*1.3+i*2.399+(rand()-.5)*.65,dir=new Vector3(Math.cos(angle),0,Math.sin(angle));
   let length=r*(.75+rand()*.35),rise=stemH*.16;
   if(p.form==='cedar'){length=r*Math.pow(1-f,.65)*(.9+rand()*.28)+.2;rise=-length*.13;}
   if(p.form==='pine'){length=r*(.65+rand()*.4)*(1-f*.45);rise=length*.24;}
   if(p.form==='aspen'||p.form==='birch'){length=r*(.55+rand()*.28)*(1-f*.5);rise=length*(p.form==='aspen'?1.05:.8);}
   if(p.form==='silver-birch'){length=r*(.28+.72*Math.pow(Math.sin(Math.PI*f),.72))*(.85+rand()*.25);rise=length*.56;}
   if(p.form==='ash'){length=r*(.85+rand()*.3)*(1-f*.18);rise=length*(.56+rand()*.2);}
   if(emergent){length=r*(.8+rand()*.27)*(architecture?crownRadius(f)*hierarchy:1-f*.18);rise=length*(emergent.rise+(rand()-.5)*.14);if(architecture)rise=rise*(1-architecture.apicalBias)+(h*.96-origin.y)*architecture.apicalBias;}
   if(p.form==='willow'){length=r*(.72+rand()*.3);rise=h*(.28-f*.12);}
   const tip=origin.clone().addScaledVector(dir,length);tip.y+=rise;const shoulder=origin.clone().lerp(tip,.55);shoulder.y+=length*(architecture?.curvature??(p.form==='willow'?.27:.09));if(architecture)shoulder.add(new Vector3(-dir.z,0,dir.x).multiplyScalar(length*architecture.curvature*.25*Math.sin(angle+phase)));
   const primary=line([origin,shoulder,tip],p.trunk*(emergent?emergent.limb*Math.sqrt(hierarchy):p.form==='maple'||p.form==='willow'?.48:p.form==='ash'?.45:.28)*(1-f*.5),1);
   const children=emergent?emergent.forks:p.form==='willow'?5:3;
   for(let j=0;j<children;j++){
    const u=.3+j/(children-1)*.62,start=primary.curve.getPointAt(u),b=angle+(architecture?(j/(children-1)*2-1)*architecture.fanAngle+(rand()-.5)*.22:(j%2?-1:1)*(.4+rand()*.5)),span=length*(.32+rand()*.18),end=start.clone().add(new Vector3(Math.cos(b)*span,0,Math.sin(b)*span));
    if(p.form==='willow'){
      end.y=Math.max(.8,start.y-(3.3+rand()*2.8));const bend=start.clone().lerp(end,.33);bend.x+=Math.cos(b)*.6;bend.z+=Math.sin(b)*.6;const hanging=line([start,bend,end],p.trunk*.065,2);leafy(hanging,5,.73,.12,.97);
    }else{
      end.y+=span*(emergent?emergent.secondaryRise:p.form==='silver-birch'?-.95:p.form==='ash'?.92:p.form==='cedar'?-.7:p.form==='pine'?.22:.72);const bend=start.clone().lerp(end,.5);bend.y+=span*.16;const secondary=line([start,bend,end],p.trunk*(emergent?.13:p.form==='ash'?.17:.1)*(1-f*.5),2);
      const size=emergent?emergent.clusterSize:p.form==='silver-birch'?.65:p.form==='ash'?1.05:p.form==='maple'?1.25:p.form==='pine'?1.05:p.form==='cedar'?.9:p.form==='birch'?.72:.83;leafy(secondary,emergent||p.conifer?3:2,size*(.9+rand()*.16),architecture?.leafInterval[0]??.22,architecture?.leafInterval[1]??.94);
      if(p.form==='silver-birch'){
        const a=secondary.curve.getPointAt(.66),tip=a.clone().add(new Vector3(Math.cos(b)*span*.18,-.75-span*.55,Math.sin(b)*span*.18));
        const fine=line([a,a.clone().lerp(tip,.5).add(new Vector3(.08,0,-.06)),tip],p.trunk*.025,3);leafy(fine,2,.46,.3,.92);
      }
    }
   }
   if(p.form==='pine'||p.form==='cedar')leafy(primary,3,p.form==='pine'?1.15:.86,.32,.97);
   if(emergent)leafy(primary,3,emergent.clusterSize*.94,architecture?Math.max(.35,architecture.leafInterval[0]+.18):.4,.96);
   if(p.form==='ash')leafy(primary,2,1.07,.58,.96);
   if(p.form==='maple')leafy(primary,3,1.35,.32,.92);
  }
  if(emergent)leafy(leader,4,emergent.clusterSize*.84,.83,.99);
  else if(p.form==='aspen')leafy(leader,7,.9,.43,.96);
  else if(p.form==='silver-birch')leafy(leader,4,.5,.72,.98);
  else if(p.form==='ash')leafy(leader,3,.92,.66,.98);
  else if(p.form==='birch')leafy(leader,4,.75,.5,.97);
  else if(p.form==='cedar')leafy(leader,3,.55,.83,.98);
 }
 const max=new Vector3(),min=new Vector3();for(const s of segments)for(const a of [s.a,s.b]){max.max(new Vector3(...a));min.min(new Vector3(...a));}
 const model:PaintedTree={kind:'painterly',seed:q.structure,appearanceSeed:q.appearance,presetId:id,segments,foliage:[],art:{stylization:.7,foliageDensity:q.density,asymmetry:q.asymmetry??.7},palette:{name:'Painterly Sage',shadow:'#294135',body:'#6e9462',light:'#d9c976',bark:p.bark},parameters:{height:max.y,crownRadius:r,crownBase:p.base,trunkRadius:p.trunk,taper:.94,recursion:2,whorls:0,spread:1,droop:p.form==='willow'?.8:.15},dimensions:{height:max.y+1.4,crownWidth:max.x-min.x+2.8,crownDepth:max.z-min.z+2.8}};
 return {kind:'broadleaf',model,groups,fronds,segments,scale:.48,offset:[0,0,0]};
}
