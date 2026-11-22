import {CatmullRomCurve3,Vector3,Quaternion,Color} from 'three';
import {randomSource} from '../forest/random';
import type {Point,Segment} from '../forest/tree';
import type {PaintedTree} from '../forest/painterly';
import type {StudioSettings,StudioStudy,FoliageGroup,StudioFrond} from './groups';
/** Growth constraints, not closed crown meshes or species-specific generators. */
export interface CrownArchitecture {radiusProfile:[number,number,number];initiationBias:number;dominance:number;curvature:number;apicalBias:number;fanAngle:number;occupancy:number;leafInterval:[number,number]}
export interface EmergentGrowth {architecture?:CrownArchitecture;leaderTop:number;rise:number;secondaryRise:number;forks:number;clusterSize:number;trunkTaper:number;limb:number;buttressCount:number;buttressHeight:number;buttressReach:number}
export interface SpeciesDesign {name:string;scientificName:string;height:number;radius:number;trunk:number;base:number;branches:number;form:'pine'|'cedar'|'birch'|'maple'|'aspen'|'willow'|'silver-birch'|'ash'|'emergent'|'palmate'|'rosette'|'palm';bark:string;conifer:boolean;leafShape?:'small-oval'|'leathery'|'large-entire'|'trifoliate';roots?:{kind:'pencil'|'prop';count:number;reach:number;height:number};emergent?:EmergentGrowth}
/** Visual design presets only: no geographic presence or measured botanical dimensions implied. */
export const batchSpecies:Record<string,SpeciesDesign>={
 'avicennia':{name:'Grey mangrove',scientificName:'Avicennia marina',height:8,radius:4.2,trunk:0.32,base:0.18,branches:8,form:'emergent',bark:'#959581',conifer:false,leafShape:'small-oval',roots:{"kind":"pencil","count":18,"reach":3,"height":0.42},emergent:{leaderTop:0.72,rise:0.25,secondaryRise:0.2,forks:3,clusterSize:1.1,trunkTaper:.63,limb:.4,buttressCount:0,buttressHeight:1,buttressReach:0,architecture:{radiusProfile:[.9,1,.4],initiationBias:1.15,dominance:.2,curvature:.15,apicalBias:.3,fanAngle:1.1,occupancy:.94,leafInterval:[.15,.98]}}},
 'red-mangrove':{name:'Red mangrove',scientificName:'Rhizophora mangle',height:11,radius:5,trunk:0.4,base:0.25,branches:8,form:'emergent',bark:'#776e5a',conifer:false,leafShape:'leathery',roots:{"kind":"prop","count":10,"reach":2.8,"height":3.3},emergent:{leaderTop:0.82,rise:0.35,secondaryRise:0.25,forks:3,clusterSize:1.25,trunkTaper:.63,limb:.4,buttressCount:0,buttressHeight:1,buttressReach:0,architecture:{radiusProfile:[.9,1,.4],initiationBias:1.15,dominance:.2,curvature:.15,apicalBias:.3,fanAngle:1.1,occupancy:.94,leafInterval:[.15,.98]}}},
 'stilt-mangrove':{name:'Stilt-root mangrove',scientificName:'Rhizophora stylosa',height:15,radius:4.6,trunk:0.4,base:0.36,branches:9,form:'emergent',bark:'#817b68',conifer:false,leafShape:'leathery',roots:{"kind":"prop","count":12,"reach":2.3,"height":4},emergent:{leaderTop:0.91,rise:0.6,secondaryRise:0.45,forks:3,clusterSize:1.2,trunkTaper:.63,limb:.4,buttressCount:0,buttressHeight:1,buttressReach:0,architecture:{radiusProfile:[.9,1,.4],initiationBias:1.15,dominance:.2,curvature:.15,apicalBias:.3,fanAngle:1.1,occupancy:.94,leafInterval:[.15,.98]}}},
 'cacao':{name:'Cacao',scientificName:'Theobroma cacao',height:7,radius:3.4,trunk:0.24,base:0.28,branches:5,form:'emergent',bark:'#82745e',conifer:false,leafShape:'large-entire',emergent:{leaderTop:0.66,rise:0.16,secondaryRise:0.22,forks:3,clusterSize:1.1,trunkTaper:.63,limb:.4,buttressCount:0,buttressHeight:1,buttressReach:0,architecture:{radiusProfile:[.9,1,.4],initiationBias:1.15,dominance:.2,curvature:.15,apicalBias:.3,fanAngle:1.1,occupancy:.94,leafInterval:[.15,.98]}}},
 'rubber':{name:'Rubber tree',scientificName:'Hevea brasiliensis',height:23,radius:6.3,trunk:0.5,base:0.46,branches:8,form:'emergent',bark:'#92917e',conifer:false,leafShape:'trifoliate',emergent:{leaderTop:0.9,rise:0.55,secondaryRise:0.5,forks:3,clusterSize:1.65,trunkTaper:.63,limb:.4,buttressCount:0,buttressHeight:1,buttressReach:0,architecture:{radiusProfile:[.9,1,.4],initiationBias:1.15,dominance:.2,curvature:.15,apicalBias:.3,fanAngle:1.1,occupancy:.94,leafInterval:[.15,.98]}}},
 cecropia:{name:'Cecropia',scientificName:'Cecropia peltata',height:14,radius:4,trunk:.2,base:.62,branches:8,form:'palmate',bark:'#9b9d84',conifer:false},
 pandanus:{name:'Screw pine',scientificName:'Pandanus tectorius',height:5.5,radius:2.5,trunk:.29,base:.3,branches:4,form:'rosette',bark:'#918473',conifer:false},
 acai:{name:'Forest acai palm',scientificName:'Euterpe precatoria',height:24,radius:4.2,trunk:.15,base:.93,branches:0,form:'palm',bark:'#949582',conifer:false},
 mahogany:{name:'Bigleaf mahogany',scientificName:'Swietenia macrophylla',height:31,radius:9.5,trunk:.83,base:.5,branches:9,form:'emergent',bark:'#806753',conifer:false,emergent:{leaderTop:.92,rise:.35,secondaryRise:.4,forks:4,clusterSize:2.05,trunkTaper:.6,limb:.38,buttressCount:4,buttressHeight:2.2,buttressReach:1.15,architecture:{radiusProfile:[.75,1.05,.22],initiationBias:1.05,dominance:.23,curvature:.15,apicalBias:.5,fanAngle:1.1,occupancy:.95,leafInterval:[.12,.97]}}},
 'dipterocarp-alatus':{name:'Dipterocarpus alatus',scientificName:'Dipterocarpus alatus',height:42,radius:9.5,trunk:1.02,base:.62,branches:8,form:'emergent',bark:'#8b7c65',conifer:false,emergent:{leaderTop:.95,rise:.5,secondaryRise:.5,forks:4,clusterSize:2.1,trunkTaper:.55,limb:.33,buttressCount:4,buttressHeight:3.2,buttressReach:1.55,architecture:{radiusProfile:[.85,.98,.62],initiationBias:1.25,dominance:.07,curvature:.12,apicalBias:.18,fanAngle:1.2,occupancy:.94,leafInterval:[.15,.98]}}},
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
 const line=(points:Vector3[],radius:number,depth:number,taper=depth===0&&emergent?emergent.trunkTaper:.92)=>{const curve=new CatmullRomCurve3(points),first=segments.length,steps=depth===0?20:10;for(let i=0;i<steps;i++){const t=i/steps,u=(i+1)/steps;segments.push({a:curve.getPoint(t).toArray() as Point,b:curve.getPoint(u).toArray() as Point,r0:radius*Math.pow(1-t*taper,1.1),r1:radius*Math.pow(1-u*taper,1.1),depth});}return {curve,first,steps};};
 const leafy=(path:ReturnType<typeof line>,samples:number,size:number,start=.28,end=.94)=>{for(let j=0;j<samples;j++){// Omit only some inner guides; every living branch retains its terminal spray.
 if(architecture&&j>0&&j<samples-1&&randomSource(q.structure+'|crown-opening|'+path.first+'|'+j)()>architecture.occupancy)continue;
 const t=start+(end-start)*(samples===1?.5:j/(samples-1)),center=path.curve.getPointAt(t),index=path.first+Math.min(path.steps-1,Math.floor(path.curve.getUtoTmapping(t,0)*path.steps));const group:FoliageGroup={id:groups.length,anchor:center.toArray() as Point,center:center.toArray() as Point,radii:[size,size*.78,size*.94],branchIndex:index,axis:path.curve.getTangentAt(t).toArray() as Point};groups.push(group);for(const f of patches(group,{...q,palette:'sage'})){
   f.tile=0;
   if(p.form==='silver-birch'){f.width*=.84;f.length*=1.08;}if(p.form==='ash'){f.width*=1.06;f.length*=.95;}
   if(p.form==='willow'){f.width*=.67;f.length*=1.25;}if(p.form==='cedar'){f.width*=.84;f.length*=1.18;}if(p.form==='pine'){f.width*=1.14;f.length*=.83;}
   fronds.push(f);
 }}};
 // Unusual growth forms reuse the same stem curves, atlas cards, material and batch.
 const paint=randomSource(q.appearance+'|special-pigment|'+id);
 const guide=(center:Vector3,size:number,branchIndex:number,axis:Vector3)=>{const g:FoliageGroup={id:groups.length,anchor:center.toArray() as Point,center:center.toArray() as Point,radii:[size,size*.45,size],axis:axis.toArray() as Point,branchIndex};groups.push(g);return g.id;};
 const tint=()=>{const c=new Color('#7c9c70').offsetHSL((paint()-.5)*.035,(paint()-.5)*.07,(paint()-.5)*.07);return '#'+c.getHexString();};
 const ribbon=(base:Vector3,middle:Vector3,tip:Vector3,width:number,groupId:number)=>{
  const across=new Vector3(-(tip.z-base.z),0,tip.x-base.x).normalize(),normal=across.clone().cross(tip.clone().sub(base)).normalize();if(normal.y<0)normal.negate();
  const rotation=new Quaternion().setFromUnitVectors(new Vector3(1,0,0),across);
  fronds.push({position:base.toArray() as Point,rotation:rotation.toArray(),width,length:base.distanceTo(tip),curve:.06,droop:0,tile:0,color:tint(),normal:normal.toArray() as Point,interior:.92,groupId,essential:true,spine:[base.toArray() as Point,middle.toArray() as Point,tip.toArray() as Point]});
 };
 if(p.form==='palmate'){
  const leader=line([new Vector3(),new Vector3(.1,h*.5,-.08),new Vector3(.25,h,0)],p.trunk,0,.48);
  for(let i=0;i<8;i++){
   const tier=Math.floor(i/3),angle=phase+i*Math.PI*2/3+tier*.48+(rand()-.5)*.12,start=leader.curve.getPointAt(.63+tier*.135),length=r*(1-tier*.18)*(.85+rand()*.2),dir=new Vector3(Math.cos(angle),0,Math.sin(angle)),end=start.clone().addScaledVector(dir,length);end.y+=length*.24;
   const branch=line([start,start.clone().lerp(end,.5).add(new Vector3(0,.35,0)),end],p.trunk*.3,1,.82);
   for(let j=0;j<3;j++){
    const a=angle+(j-1)*.95,origin=branch.curve.getPointAt(.78+j*.075),reach=1.15+rand()*.35,leafCenter=origin.clone().add(new Vector3(Math.cos(a)*reach,.45+rand()*.3,Math.sin(a)*reach));line([origin,origin.clone().lerp(leafCenter,.55),leafCenter],.023,2,.7);
    const normal=new Vector3(Math.cos(a)*.65,j===0?.27:.72,Math.sin(a)*.65).normalize(),g=guide(leafCenter,.8,branch.first,new Vector3(Math.cos(a),.1,Math.sin(a))),rotation=new Quaternion().setFromUnitVectors(new Vector3(0,0,1),normal);
    fronds.push({position:leafCenter.toArray() as Point,rotation:rotation.toArray(),width:2.65*(.9+rand()*.2),length:2.65*(.9+rand()*.2),curve:.16,droop:0,tile:j===0?1:0,color:j===0?'#cdd6bc':tint(),normal:normal.toArray() as Point,interior:.95,groupId:g,essential:true});
   }
  }
 }else if(p.form==='rosette'){
  const leader=line([new Vector3(0,.3,0),new Vector3(.12,h*.25,0),new Vector3(.3,h*.62,-.1)],p.trunk,0,.55),terminals:{point:Vector3;branch:number}[]=[];
  for(let i=0;i<4;i++){const a=phase+i*2.399,from=leader.curve.getPointAt(.48+i*.12),tip=new Vector3(Math.cos(a)*r*(.85+rand()*.25),h*(.74+rand()*.26),Math.sin(a)*r*.95),fork=line([from,from.clone().lerp(tip,.5).add(new Vector3(0,-.3,0)),tip],p.trunk*.57,1,.62);terminals.push({point:tip,branch:fork.first});}
  // Prop roots meet the stem above ground and splay to individual ground contacts in the same wood batch.
  for(let i=0;i<8;i++){const a=phase+i*Math.PI/4+(rand()-.5)*.2,from=leader.curve.getPointAt(.32+rand()*.22),foot=new Vector3(Math.cos(a)*(1.8+rand()*.55),.02,Math.sin(a)*(1.8+rand()*.55));line([from,from.clone().lerp(foot,.55).add(new Vector3(Math.cos(a)*.15,-.12,Math.sin(a)*.15)),foot],.17+rand()*.04,1,.46);}
  for(const terminal of terminals){const g=guide(terminal.point,2,terminal.branch,new Vector3(0,1,0));for(let j=0;j<30;j++){const a=phase+j*2.399,length=3+rand()*.8,base=terminal.point.clone(),dir=new Vector3(Math.cos(a),0,Math.sin(a)),age=(j%5)/4,rise=.6+(1-age)*1.6,tip=base.clone().addScaledVector(dir,length);tip.y+=1.1-age*3.7;const mid=base.clone().addScaledVector(dir,length*.52);mid.y+=rise;ribbon(base,mid,tip,.9+rand()*.2,g);}}
 }else if(p.form==='palm'){
  const top=new Vector3(.35,h,0);line([new Vector3(),new Vector3(.1,h*.5,-.1),top],p.trunk,0,.16);
  const shaft=line([new Vector3(.32,h*.925,0),new Vector3(.34,h*.98,0),new Vector3(.36,h*1.035,0)],p.trunk*1.27,0,.18);for(let i=shaft.first;i<segments.length;i++)segments[i].color='#6f9664';
  const base=new Vector3(.36,h*1.035,0),g=guide(base,r,shaft.first,new Vector3(0,1,0));
  for(let i=0;i<15;i++){const a=phase+i*2.399+(rand()-.5)*.15,age=(i%5)/4,length=r*(.7+age*.3+rand()*.15),dir=new Vector3(Math.cos(a),0,Math.sin(a)),tip=base.clone().addScaledVector(dir,length);tip.y+=1.6-age*5;const mid=base.clone().addScaledVector(dir,length*.48);mid.y+=1.6+(1-age)*1.6+rand()*.3;ribbon(base.clone(),mid,tip,2.3+rand()*.45,g);}
 }
 else for(let stem=0;stem<stems;stem++){
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
 if(p.roots){const roots=randomSource(q.structure+'|root-architecture|'+id);for(let i=0;i<p.roots.count;i++){
  const a=phase+i*2.399,reach=p.roots.reach*(.7+roots()*.35),foot=new Vector3(Math.cos(a)*reach,.025,Math.sin(a)*reach);
  if(p.roots.kind==='pencil'){const tip=foot.clone().add(new Vector3((roots()-.5)*.08,p.roots.height*(.65+roots()*.6),0));line([foot,foot.clone().lerp(tip,.5),tip],.04,1,.8);}
  else{const origin=new Vector3(Math.cos(a)*p.trunk*.15,p.roots.height*(.6+roots()*.4),Math.sin(a)*p.trunk*.15),bend=origin.clone().lerp(foot,.5);bend.y+=.25;const root=line([origin,bend,foot],p.trunk*.3,1,.45);if(i%3===0){const fork=root.curve.getPointAt(.6),end=foot.clone().add(new Vector3(Math.cos(a+.6)*.65,0,Math.sin(a+.6)*.65));line([fork,fork.clone().lerp(end,.5),end],p.trunk*.16,1,.5);}}
 }}
 const max=new Vector3(),min=new Vector3();for(const s of segments)for(const a of [s.a,s.b]){max.max(new Vector3(...a));min.min(new Vector3(...a));}
 const specialShape=['palmate','rosette','palm'].includes(p.form);
 if(specialShape)for(const f of fronds){
  const include=(v:Vector3)=>{max.max(v);min.min(v);};
  if(f.spine){for(let i=0;i<=8;i++){const t=i/8,u=1-t,[a,b,c]=f.spine,v=new Vector3(u*u*a[0]+2*u*t*b[0]+t*t*c[0],u*u*a[1]+2*u*t*b[1]+t*t*c[1],u*u*a[2]+2*u*t*b[2]+t*t*c[2]);include(v.clone().add(new Vector3(f.width*.5,0,f.width*.5)));include(v.clone().sub(new Vector3(f.width*.5,0,f.width*.5)));}}
  else{const rotation=new Quaternion(...f.rotation),x=new Vector3(f.width*.5,0,0).applyQuaternion(rotation),y=new Vector3(0,f.length*.5,0).applyQuaternion(rotation);for(const a of [-1,1])for(const b of [-1,1])include(new Vector3(...f.position).addScaledVector(x,a).addScaledVector(y,b));}
 }
 const model:PaintedTree={kind:'painterly',seed:q.structure,appearanceSeed:q.appearance,presetId:id,segments,foliage:[],art:{stylization:.7,foliageDensity:q.density,asymmetry:q.asymmetry??.7},palette:{name:'Painterly Sage',shadow:'#294135',body:'#6e9462',light:'#d9c976',bark:p.bark},parameters:{height:max.y,crownRadius:r,crownBase:p.base,trunkRadius:p.trunk,taper:.94,recursion:2,whorls:0,spread:1,droop:p.form==='willow'?.8:.15},dimensions:{height:max.y+(specialShape?0:1.4),crownWidth:max.x-min.x+(specialShape?0:2.8),crownDepth:max.z-min.z+(specialShape?0:2.8)}};
 return {kind:'broadleaf',model,groups,fronds,segments,scale:.48,offset:[0,0,0]};
}
