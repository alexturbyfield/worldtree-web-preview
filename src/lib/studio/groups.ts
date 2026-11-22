import {Color,Quaternion,Vector3,CatmullRomCurve3,Matrix4} from 'three';
import {generatePainterlyTree,type PaintedTree} from '../forest/painterly';
import {randomSource} from '../forest/random';
import type {Point,Segment} from '../forest/tree';
export type StudioKind='broadleaf'|'flower'|'conifer';
export type OakGrowth='spreading'|'upright'|'ancient'|'young';
// Growth rules in metres/radians, shared by all oak forms (not crown transforms).
export interface OakGrowthProfile {height:number;leader:number;initiation:number;primaries:number;inclination:number;lateral:number;secondary:number;tertiary:number;apical:number;droop:number;age:number;trunk:number;limb:number;occupancy:number;foliage:number;taper:number}
export const oakGrowthForms:Record<OakGrowth,OakGrowthProfile>={
  spreading:{height:12.5,leader:.76,initiation:.21,primaries:10,inclination:.24,lateral:6.8,secondary:3,tertiary:2,apical:.45,droop:.65,age:.3,trunk:1.05,limb:.7,occupancy:.5,foliage:1.18,taper:1.3},
  upright:{height:13,leader:.94,initiation:.3,primaries:11,inclination:.88,lateral:3.4,secondary:3,tertiary:2,apical:.92,droop:.03,age:.1,trunk:.73,limb:.28,occupancy:.38,foliage:.91,taper:1.18},
  ancient:{height:9.5,leader:.56,initiation:.16,primaries:7,inclination:.2,lateral:6.2,secondary:3,tertiary:2,apical:.12,droop:.75,age:1,trunk:1.6,limb:1.02,occupancy:.68,foliage:1.05,taper:1.02},
  young:{height:8.5,leader:.95,initiation:.38,primaries:6,inclination:.78,lateral:2.25,secondary:2,tertiary:2,apical:.95,droop:0,age:0,trunk:.31,limb:.135,occupancy:.4,foliage:.72,taper:1.55}
};
export interface StudioSettings {size:number;density:number;overlap:number;detail:number;colorVariation:number;structure:string;appearance:string;view:StudioKind|'all';mode:'leaf'|'groups'|'trees';unified?:boolean;leafScale?:number;asymmetry?:number;shape?:number;roundness?:number;branchSpread?:number;edgeBreakup?:number;palette?:'woodland'|'sunlit'|'cool'|'sage';oakGrowth?:OakGrowth;crownGradient?:number;crownRim?:number;evergreenStudy?:boolean}
export const studioDefaults:StudioSettings={size:1,density:.76,overlap:.72,detail:.75,colorVariation:.65,structure:'29',appearance:'garden',view:'all',mode:'groups'};
export const studioKinds:StudioKind[]=['broadleaf','flower','conifer'];
export interface FoliageGroup {branchId?:number;parentBranchId?:number;zone?:OakFoliageZone;id:number;anchor:Point;center:Point;radii:Point;branchIndex:number;axis:Point}
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
/** Fuller lower-middle crown with a long, narrowing upper half. Peak at h=.364. */
function uprightCrownProfile(h:number){h=Math.max(0,Math.min(1,h));return Math.pow(h,.6)*Math.pow(1-h,1.05)/.339;}
type OakFoliageZone='transition'|'leaf-bearing';
interface OakBranchPath {id:number;parentId:number;curve:CatmullRomCurve3;depth:number;first:number;steps:number;leafSize?:number}
type OakGuide=PaintedTree['foliage'][number]&{branchId:number;parentBranchId:number;branchIndex:number;axis:Point;zone:OakFoliageZone;footprint:number};
type CoveredOak=Omit<PaintedTree,'foliage'>&{foliage:OakGuide[]};
/** Conservative opaque footprint from atlas.ts's leaf count, sizes and .34 tile radius.
 * This is an analytic mask estimate, not card bounds or runtime GPU readback. */
function oakVisibleFootprint(size:number,q:StudioSettings){
  const leafScale=q.leafScale??1,count=100+Math.round(q.detail*24),length=.095*leafScale;
  const maskedSpan=Math.min(.88,.68+length*.6),leafArea=Math.PI*length*(length*.7)/4;
  const fill=1-Math.exp(-count*leafArea/(Math.PI*.34*.34));
  const cardSpan=size*q.size*1.28*Math.min(1.18,.92*1.22);
  return Math.max(.22,cardSpan*maskedSpan*Math.sqrt(fill)*.85);
}
/** Sample living outer branch intervals in metres, preserving branch ownership. */
function attachOakCoverage(paths:OakBranchPath[],q:StudioSettings):OakGuide[]{
  const guides:OakGuide[]=[],cells=new Map<string,number[]>(),cellSize=2;
  const children=new Map<number,OakBranchPath[]>();for(const path of paths){const list=children.get(path.parentId)??[];list.push(path);children.set(path.parentId,list);}
  const emit=(path:OakBranchPath,u:number,size:number,zone:OakFoliageZone)=>{
    const point=path.curve.getPointAt(u);
    if(q.oakGrowth==='upright'){
      const upright=oakGrowthForms.upright,top=paths[0].curve.getPoint(1).y/(upright.leader+.1*upright.apical),h=Math.max(0,Math.min(1,(point.y/top-.3)/.84));
      size*=.3+.7*uprightCrownProfile(h);
    }
    const footprint=oakVisibleFootprint(size,q),cell=point.toArray().map(n=>Math.floor(n/cellSize));
    // Nearby related shoots share junction coverage, rather than stacking duplicate clusters.
    for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){
      for(const index of cells.get([cell[0]+x,cell[1]+y,cell[2]+z].join(','))??[]){const other=guides[index];
        if(other.branchId===path.id||other.branchId===path.parentId||other.parentBranchId===path.id||other.parentBranchId===path.parentId){
          if(point.distanceTo(new Vector3(...other.position))<Math.min(footprint,other.footprint)*.35)return;
        }
      }
    }
    const t=path.curve.getUtoTmapping(u,0),branchIndex=path.first+Math.min(path.steps-1,Math.floor(t*path.steps));
    const key=cell.join(','),list=cells.get(key)??[];list.push(guides.length);cells.set(key,list);
    guides.push({position:point.toArray() as Point,scale:[size,size*.74,size*.92],rotation:[0,0,0],tint:1,color:'#64913f',card:false,variant:path.id%3,
      branchId:path.id,parentBranchId:path.parentId,branchIndex,axis:path.curve.getTangentAt(u).toArray() as Point,zone,footprint});
  };
  for(const path of paths){
    if(path.depth<2)continue; // Trunk and primary scaffold remain structural and exposed.
    const living=(children.get(path.id)??[]).filter(child=>child.leafSize!==undefined);
    // Preserve reduced/dead sectors: one surviving twig does not refill its entire parent.
    if(path.leafSize===undefined&&(path.depth!==2||living.length<2))continue;
    const size=path.leafSize??living.reduce((n,child)=>n+child.leafSize!,0)/living.length*.95;
    path.curve.arcLengthDivisions=48;path.curve.updateArcLengths();
    const length=path.curve.getLength(),start=path.depth===2?.43:.12,end=.98;
    const spacing=oakVisibleFootprint(size,q)*(1-(.18+.24*q.overlap));
    const intervals=Math.max(1,Math.ceil(length*(end-start)/spacing));
    emit(path,.88,size,'leaf-bearing'); // Retain a terminal guide before filling its interval.
    for(let i=0;i<=intervals;i++)emit(path,start+(end-start)*i/intervals,size,'leaf-bearing');
    if(path.depth===2){
      if(path.id%3!==0)emit(path,.28,size*.8,'transition');
      // Coordinate actual child junctions that lie in this secondary's leafy zone.
      for(const child of living){const junction=child.curve.getPoint(0);let u=0,distance=Infinity;
        for(let i=0;i<=24;i++){const candidate=i/24,d=path.curve.getPointAt(candidate).distanceToSquared(junction);if(d<distance){distance=d;u=candidate;}}
        if(u>=.32)emit(path,u,size*.92,u<start?'transition':'leaf-bearing');
      }
    }
  }
  return guides;
}
/** One seeded branching algorithm: leader -> scaffold -> secondary -> terminal twigs. */
function referenceOak(base:PaintedTree,asymmetry:number,form:OakGrowth,q:StudioSettings):CoveredOak{
  const rand=randomSource(base.seed+'|oak-growth-v2'),g=oakGrowthForms[form],segments:Segment[]=[],paths:OakBranchPath[]=[],pathByCurve=new Map<CatmullRomCurve3,OakBranchPath>();
  const height=g.height*(.94+rand()*.12),phase=rand()*Math.PI*2,lean=(rand()-.5)*height*(.025+g.age*.12);
  const leader=new CatmullRomCurve3([[0,0,0],[lean*.15+g.age*g.age*.28+(form==='spreading'?.32:0),height*.23,.03],[lean*.65-g.age*g.age*.3-(form==='spreading'?.18:0),height*g.leader*.65,g.age*.35],[lean,height*(g.leader+.1*g.apical),0]].map(p=>new Vector3(...p)));
  const grow=(curve:CatmullRomCurve3,r0:number,r1:number,depth:number,parentId=-1)=>{const steps=depth===0?24:depth===1?18:8,path:OakBranchPath={id:paths.length,parentId,curve,depth,first:segments.length,steps};paths.push(path);pathByCurve.set(curve,path);for(let i=0;i<steps;i++){const t=i/steps,u=(i+1)/steps;segments.push({a:curve.getPoint(t).toArray() as Point,b:curve.getPoint(u).toArray() as Point,r0:r1+(r0-r1)*Math.pow(1-t,1.2),r1:r1+(r0-r1)*Math.pow(1-u,1.2),depth});}return path;};
  const branch=(start:Vector3,angle:number,length:number,rise:number,sag:number,twist:number)=>{
    const forward=new Vector3(Math.cos(angle),0,Math.sin(angle)),side=new Vector3(-forward.z,0,forward.x);
    // Upright shoots compete inside an oval light envelope, widest at mid-crown.
    // Restrict extension at initiation and near the apex instead of widening the crown top.
    const end=start.clone().addScaledVector(forward,length).add(new Vector3(0,rise-sag,0));
    const a=start.clone().addScaledVector(forward,length*.24).add(new Vector3(0,Math.max(.2,rise*.36)+length*.13,0));
    const b=start.clone().addScaledVector(forward,length*.67).add(new Vector3(0,rise*.8+length*.13,0)).addScaledVector(side,twist);
    if(form==='upright'){
      // Each ascending shoot grows toward the available oval crown radius at its height.
      // Reserve space for leaves, not just wood; constrain control points as well as tips.
      const constrain=(p:Vector3)=>{const h=Math.max(0,Math.min(1,(p.y/height-.3)/.84)),radius=Math.max(.07,3.65*uprightCrownProfile(h)-.72),axisX=lean*Math.min(1,p.y/(height*1.03));
        const radial=new Vector3(p.x-axisX,0,p.z);if(radial.length()>radius){radial.setLength(radius);p.x=axisX+radial.x;p.z=radial.z;}return p;};
      constrain(end);a.copy(start).lerp(end,.27);a.y+=.12;b.copy(start).lerp(end,.7);b.y+=.13;constrain(a);constrain(b);
    }
    return new CatmullRomCurve3([start,a,b,end]);
  };
  // Existing call sites now designate living leaf-bearing paths, not single terminal points.
  // No random draws here: the pre-existing structural random stream remains unchanged.
  const leafTip=(curve:CatmullRomCurve3,size:number)=>{pathByCurve.get(curve)!.leafSize=size;};
  const leaderPath=grow(leader,g.trunk,g.trunk*(.05+.12*g.apical),0);
  const count=g.primaries+(rand()>.65?1:0),dominant=Math.floor(rand()*count);
  for(let i=0;i<count;i++){
    const level=i/(count-1),start=leader.getPoint(g.initiation/g.leader+(1-g.initiation/g.leader)*level*.92);
    const angle=phase+i*2.399+(rand()-.5)*(.22+g.age*.5);
    const extension=(1-level*(.42+.22*g.apical))*(.88+rand()*.24)*(i===dominant?1.22:1)*(1+(rand()-.5)*g.age*.45);
    const length=g.lateral*extension*(form==='upright'?.85+.25*Math.sin(Math.PI*level):1),rise=Math.min(length*Math.tan(g.inclination)*(1-level*.25),g.apical>.8?Math.max(.1,(height*.88-start.y)*.7):Infinity),sag=g.droop*length*(.18+rand()*.16)*(1-level*.5);
    const primary=branch(start,angle,length,rise,sag*(form==='spreading'?.45:1),(rand()-.5)*g.age*length*.7);
    const radius=g.limb*(1-level*.48)*(i===dominant?1.15:1);
    const primaryPath=grow(primary,radius,radius*.32,1,leaderPath.id);
    // Leader-dominant oaks retain finer inner shoots, filling the crown along living wood.
    if(g.apical>.8)for(let shoot=0;shoot<2;shoot++){
      const origin=primary.getPoint(.24+shoot*.23),twig=branch(origin,angle+(shoot?-.45:.45),.55,.65+shoot*.25,0,0);
      grow(twig,radius*.16,.014,3,primaryPath.id);leafTip(twig,g.foliage*.95);
    }
    for(let j=0;j<g.secondary;j++){
      const t=(g.occupancy*.65)+j/(Math.max(1,g.secondary-1))*(.94-g.occupancy*.65),origin=primary.getPoint(t),side=j%2?-1:1;
      const secondaryAngle=angle+side*(.35+rand()*.55),secondaryLength=(1.45+rand()*.65)*(1-level*(.3+g.apical*.35))*(form==='young'?.65:1);
      const secondary=branch(origin,secondaryAngle,secondaryLength,Math.min(secondaryLength*(form==='spreading'?.95-level*.16:.52+g.apical*.65),g.apical>.8?Math.max(.15,height*.94-origin.y):Infinity),g.droop*.16,(rand()-.5)*g.age*.8);
      const secondaryPath=grow(secondary,radius*.4,radius*.07,2,primaryPath.id);
      // Senescent sectors retain bare twigs instead of shifting unrelated foliage.
      const reduced=g.age>.8&&(i+1)%4===0;
      for(let k=0;k<g.tertiary;k++){
        const twigStart=secondary.getPoint(.52+k*.35),twigAngle=secondaryAngle+(k?-.65:.65);
        const twigLength=(.65+rand()*.4)*(1-level*g.apical*.3)*(form==='young'?.7:1);
        const twig=branch(twigStart,twigAngle,twigLength,Math.min(twigLength*(form==='spreading'?.6:.28+g.apical*.55),g.apical>.8?Math.max(.12,height-twigStart.y):Infinity),g.droop*.12,(rand()-.5)*g.age*.25);
        grow(twig,radius*.09,radius*.018,3,secondaryPath.id);
        if(!reduced||k===0&&j===0)leafTip(twig,g.foliage*(.88+rand()*.2));
      }
      if(!reduced&&j!==1)leafTip(secondary,g.foliage*.95);
    }
  }
  // Leader-dominant forms carry terminal foliage to the apex through actual twigs.
  for(let i=0;i<Math.round(1+g.apical*3);i++){
    const start=leader.getPoint(.82+i*.045),twig=branch(start,phase+i*2.399,.35+.3*g.apical,.55+.65*g.apical,0,0);
    grow(twig,g.trunk*.09,.018,3,leaderPath.id);leafTip(twig,g.foliage*.9);
  }
  const bounds=new Vector3(0,0,0),minimum=new Vector3(0,0,0);for(const segment of segments)for(const point of [segment.a,segment.b]){bounds.max(new Vector3(...point));minimum.min(new Vector3(...point));}
  return {...base,segments,foliage:attachOakCoverage(paths,q),parameters:{...base.parameters,height:bounds.y+1.3,crownRadius:(bounds.x-minimum.x)/2+1.3,trunkRadius:g.trunk},dimensions:{height:bounds.y+1.3,crownWidth:bounds.x-minimum.x+2.6,crownDepth:bounds.z-minimum.z+2.6}};
}
/** Isolated nine-patch study; never called by the full-tree path. */
function volumetricClusterStudy(group:FoliageGroup,q:StudioSettings):StudioFrond[]{
  const structure=randomSource(q.structure+'|nine-patch-study'+(q.mode==='trees'?'|'+group.id:'')),paint=randomSource(q.appearance+'|nine-patch-study'+(q.mode==='trees'?'|'+group.id:''));
  const forward=new Vector3(...group.axis).normalize();
  const side=new Vector3().crossVectors(forward,Math.abs(forward.y)>.95?new Vector3(0,0,1):new Vector3(0,1,0)).normalize();
  const lift=new Vector3().crossVectors(side,forward).normalize(),center=new Vector3(...group.anchor);
  // Along-branch, sideways, depth: staggered inner core and two short leafy forks.
  // This is a branch-local composition, not points on a sphere or parallel ribbon fans.
  const offsets:Point[]=[[-.42,-.23,-.2],[-.3,.25,.2],[-.03,-.34,.29],[.16,.2,-.3],[.4,-.17,.08],[.5,.34,.22],[.12,-.1,-.35],[-.12,.1,.04],[.32,.02,.36]];
  const angles=[-.75,.4,1.55,2.7,3.9,5.05,1.05,3.25,5.65];
  return offsets.map(([along,across,depth],i)=>{
    const radius=Math.min(group.radii[0],group.radii[2]),jitter=()=> (structure()-.5)*.045;
    const position=center.clone().addScaledVector(forward,(along+jitter())*radius*.72).addScaledVector(side,(across+jitter())*radius*.72).addScaledVector(lift,(depth+jitter())*radius*.72);
    const angle=angles[i]+(structure()-.5)*.15;
    const facing=lift.clone().multiplyScalar(Math.cos(angle)).addScaledVector(side,Math.sin(angle)).addScaledVector(forward,[-.85,.35,1.4,-.45,1.1,.15,-1.2,.65,.1][i]).normalize();
    const inPlane=forward.clone().addScaledVector(facing,-forward.dot(facing)).normalize(),right=new Vector3().crossVectors(inPlane,facing).normalize();
    const rotation=new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(right,inPlane,facing));if(q.mode==='trees')rotation.multiply(new Quaternion().setFromAxisAngle(new Vector3(0,0,1),[0,1.1,-.7,2.1,-1.6,.5,-2.2,1.5,-.3][i]+(structure()-.5)*.25));
    const normal=lift.clone().multiplyScalar(depth*.8).addScaledVector(side,across*.8).addScaledVector(facing,.5).addScaledVector(forward,.12).normalize();
    const tint=new Color('#c6c8bc').offsetHSL((paint()-.5)*.025,0,(paint()-.5)*.05);
    return {position:position.toArray() as Point,rotation:rotation.toArray(),width:radius*(1.43+structure()*.16),length:radius*((q.mode==='trees'&&(q.oakGrowth??'spreading')==='spreading'?1.25:1.5)+structure()*.16),curve:.16,droop:0,tile:q.mode==='trees'&&q.palette==='sage'?0:1+Math.floor(structure()*3),color:'#'+tint.getHexString(),normal:normal.toArray() as Point,interior:q.mode==='trees'?.68+Math.min(.28,Math.hypot(across,depth)*.65):.88,groupId:group.id};
  });
}
/** Isolated Douglas-fir bough study. Default species generation never enters this path. */
function evergreenBoughStudy(base:PaintedTree,q:StudioSettings):StudioStudy{
  const rand=randomSource(q.structure+'|fir-bough-study'),paint=randomSource(q.appearance+'|fir-bough-pigment'),h=base.parameters.height,r=base.parameters.crownRadius,trunkR=base.parameters.trunkRadius;
  const segments:Segment[]=[],groups:FoliageGroup[]=[],fronds:StudioFrond[]=[],phase=rand()*Math.PI*2,lean=(rand()-.5)*h*.045;
  const leader=new CatmullRomCurve3([[0,0,0],[lean*.35,h*.35,.1],[lean*.8,h*.7,-.18],[lean,h,.05]].map(p=>new Vector3(...p)));
  const wood=(curve:CatmullRomCurve3,radius:number,depth:number)=>{const first=segments.length,steps=depth?8:24;for(let i=0;i<steps;i++){const t=i/steps,u=(i+1)/steps;segments.push({a:curve.getPoint(t).toArray() as Point,b:curve.getPoint(u).toArray() as Point,r0:radius*Math.pow(1-t*.96,1.1),r1:radius*Math.pow(1-u*.96,1.1),depth});}return first;};
  const bough=(curve:CatmullRomCurve3,first:number,width:number)=>{
    const id=groups.length,length=curve.getLength();groups.push({id,anchor:curve.getPoint(.4).toArray() as Point,center:curve.getPoint(.55).toArray() as Point,radii:[length,width,width*.65],branchIndex:first,axis:curve.getTangent(.5).toArray() as Point});
    for(let part=0;part<3;part++)for(let face=0;face<3;face++){
      const t=.12+part*.25,point=curve.getPointAt(t),forward=curve.getTangentAt(t).normalize(),right=new Vector3().crossVectors(forward,new Vector3(0,1,0)).normalize(),up=new Vector3().crossVectors(right,forward).normalize();
      const roll=[-.65,.3,1.25][face]+(rand()-.5)*.25,normal=up.clone().multiplyScalar(Math.cos(roll)).addScaledVector(right,Math.sin(roll)).normalize();
      const across=new Vector3().crossVectors(forward,normal).normalize(),rotation=new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(across,forward,normal));
      point.addScaledVector(up,(face-1)*width*.24).addScaledVector(right,(face-1)*width*.12);
      const tint=new Color('#b9c9b7').offsetHSL((paint()-.5)*.025,0,(paint()-.5)*.07);
      fronds.push({position:point.toArray() as Point,rotation:rotation.toArray(),width:width*(1-part*.2)*(.93+rand()*.12),length:length*(.55-part*.08),curve:.18,droop:.08,tile:8+Math.floor(rand()*4),color:'#'+tint.getHexString(),normal:normal.toArray() as Point,interior:face===1?.7:.9,groupId:id});
    }
  };
  wood(leader,trunkR,0);
  const shoots=39;
  for(let i=0;i<shoots;i++){
    const f=i/(shoots-1),t=.18+f*.77+(rand()-.5)*.022,angle=phase+i*2.399+(rand()-.5)*.75;
    const missing=(i===7||i===18||i===24);if(missing)continue;
    const start=leader.getPointAt(t),length=r*1.32*Math.pow(1-f,.55)*Math.pow(Math.sin(Math.PI*(.14+f*.8)),.48)*(.95+rand()*.45)*(1+Math.sin(angle+phase)*.22)+.18;
    const outward=new Vector3(Math.cos(angle),0,Math.sin(angle)),side=new Vector3(-outward.z,0,outward.x),end=start.clone().addScaledVector(outward,length);end.y-=length*(.18+rand()*.17);
    const near=start.clone().addScaledVector(outward,length*.25);near.y+=length*.12;
    const middle=start.clone().addScaledVector(outward,length*.65).addScaledVector(side,(rand()-.5)*length*.2);middle.y-=length*.04;
    const primary=new CatmullRomCurve3([start,near,middle,end]),first=wood(primary,trunkR*.27*(1-f*.7),1);bough(primary,first,Math.max(.3,length*.94));
    for(let j=0;j<3;j++){
      const attach=.3+j*.22,origin=primary.getPointAt(attach),a=angle+(j%2?-1:1)*(.45+rand()*.35),span=length*(.4+rand()*.13)*(1-j*.13),tip=origin.clone().add(new Vector3(Math.cos(a)*span,-span*.36,Math.sin(a)*span));
      const shoulder=origin.clone().lerp(tip,.5);shoulder.y+=span*.16;const secondary=new CatmullRomCurve3([origin,shoulder,tip]),first=wood(secondary,trunkR*.085*(1-f*.75),2);bough(secondary,first,Math.max(.2,span*.95));
    }
  }
  for(let i=0;i<4;i++){
    const t=.91+i*.023,start=leader.getPointAt(t),a=phase+i*2.399,span=r*(.28-i*.055),end=start.clone().add(new Vector3(Math.cos(a)*span,-span*.18,Math.sin(a)*span));
    const middle=start.clone().lerp(end,.5);middle.y+=span*.12;const tip=new CatmullRomCurve3([start,middle,end]),first=wood(tip,trunkR*.06,2);bough(tip,first,Math.max(.2,span*.95));
  }
  const model={...base,segments,foliage:[],parameters:{...base.parameters,whorls:0,droop:.3},palette:{...base.palette,shadow:'#173f3c',body:'#4f7d66',light:'#9db69a'}};
  return {kind:'conifer',model,groups,fronds,segments,scale:6.8/base.dimensions.height,offset:[0,0,0]};
}
/** New branch-attached foliage only. Existing trunks, branches and presets are read without mutation. */
export function createStudioStudy(kind:StudioKind,q:StudioSettings):StudioStudy{
  const original=generatePainterlyTree({presetId:kind==='conifer'?'douglas':'oak',structuralSeed:q.structure,appearanceSeed:q.appearance,foliageDensity:1,asymmetry:.72}),rand=randomSource(q.structure+'|studio-groups|'+kind),paint=randomSource(q.appearance+'|studio-paint|'+kind),conifer=kind==='conifer',model=q.unified&&kind==='broadleaf'?referenceOak(original,q.asymmetry??.7,q.oakGrowth??'spreading',q):original;
  if(conifer&&q.evergreenStudy&&q.mode==='trees')return evergreenBoughStudy(original,q);
  const candidates=model.foliage.map((f,i)=>{
    const owned=q.unified&&kind==='broadleaf'?f as OakGuide:undefined;
    const attachment=owned?{index:owned.branchIndex,point:owned.position}:nearest(f.position,model.segments,conifer&&f.position[1]>model.parameters.height*.94),branch=model.segments[attachment.index];
    return {id:i,anchor:attachment.point,center:f.position,radii:f.scale.map(n=>n*q.size*(conifer?1.15:1.28)) as Point,branchIndex:attachment.index,
      axis:owned?.axis??new Vector3(...branch.b).sub(new Vector3(...branch.a)).normalize().toArray() as Point,branchId:owned?.branchId,parentBranchId:owned?.parentBranchId,zone:owned?.zone};
  });
  // Oak guides already sit on secondary/tertiary branches: no detached crown envelopes.
  // Broadleaf anchors include the actual recursive branch tips; conifer guides follow its existing horizontal tiers.
  const all=q.unified&&kind==='broadleaf'?candidates:candidates.filter((_,i)=>conifer?i%3!==2:i%2===0);
  const chosen=q.mode==='groups'&&q.unified&&kind==='broadleaf'?[all.find(g=>g.branchId===2)??all[0]]:q.mode!=='trees'?[all[Math.floor(all.length*.43)]]:all;
  const groups=chosen.map(g=>({...g,radii:g.radii.map((r,i)=>r*(q.unified&&i===1?.7+(q.shape??.5)*.6:1)*(q.unified&&kind==='broadleaf'&&q.mode==='trees'&&q.palette==='sage'&&(q.oakGrowth??'spreading')==='spreading'?(model.segments[g.branchIndex].depth===2?1.34:.86):1)) as Point}));
  const fronds:StudioFrond[]=[];
  for(const group of groups){
    if(q.unified&&kind==='broadleaf'&&(q.mode==='groups'||q.mode==='trees'&&q.palette==='sage')){fronds.push(...volumetricClusterStudy(group,q));continue;}
    if(q.unified&&kind==='broadleaf'&&q.mode!=='leaf'){
      // Three curved twig ribbons replace the radial rings. Overlapping patches taper
      // along each ribbon, with a smaller subordinate fork at its outer end.
      const flow=new Vector3(...group.axis);flow.y*=.2;flow.normalize();
      const side=new Vector3(-flow.z,0,flow.x).normalize(),center=new Vector3(...group.anchor);
      const roundness=q.roundness??.3,spread=q.branchSpread??.65,edge=q.edgeBreakup??.3,groupPaint=randomSource(q.appearance+'|oak-group|'+group.id),groupWarmth=(groupPaint()-.5)*.045,groupValue=(groupPaint()-.5)*.07;
      for(let twig=0;twig<3;twig++){
        const wing=twig-1,root=center.clone().addScaledVector(flow,-.65),tip=center.clone().addScaledVector(flow,.65+spread*.45).addScaledVector(side,wing*(.55+spread*.65));
        root.y+=(twig-1)*(.3+roundness*.25);tip.y+=.25+wing*.23;
        const middle=root.clone().lerp(tip,.5);middle.y+=.12+roundness*.2;
        const path=new CatmullRomCurve3([root,middle,tip]);
        for(let patch=0;patch<3;patch++){
          const t=patch*.36,position=path.getPoint(t),taper=1-t*.28;
          const normal=new Vector3((center.x-.6)*.35+side.x*wing*.3,(center.y-8)*.4+wing*.15+patch*.12,center.z*.3+.6).normalize();
          const facing=flow.clone().multiplyScalar(.55).addScaledVector(side,wing*.65);facing.y=.2+patch*.45;facing.normalize();
          normal.lerp(facing,.55).normalize();
          const rotation=new Quaternion().setFromUnitVectors(new Vector3(0,0,1),facing).multiply(new Quaternion().setFromAxisAngle(new Vector3(0,0,1),wing*.35+(rand()-.5)*.2));
          const tint=new Color('#c6c8bc').offsetHSL(groupWarmth,0,groupValue+(paint()-.5)*.025);
          fronds.push({position:position.toArray() as Point,rotation:rotation.toArray(),width:group.radii[0]*1.18*taper,length:group.radii[2]*1.22*taper,curve:.045+roundness*.1,droop:0,tile:1+Math.floor(rand()*3),color:'#'+tint.getHexString(),normal:normal.toArray() as Point,interior:.88+(paint()-.5)*.05,groupId:group.id});
        }
        if(edge>.05){const position=path.getPoint(.85).addScaledVector(side,wing*edge*.35);position.y+=.12;
          const normal=new Vector3(side.x*.2,.7,.6).normalize(),rotation=new Quaternion().setFromUnitVectors(new Vector3(0,0,1),normal);
          fronds.push({position:position.toArray() as Point,rotation:rotation.toArray(),width:group.radii[0]*(.55+edge*.3),length:group.radii[2]*.7,curve:.08,droop:0,tile:1+Math.floor(rand()*3),color:'#c6c8bc',normal:normal.toArray() as Point,interior:.9,groupId:group.id});
        }
      }
      continue;
    }
    const reference=q.unified&&kind==='broadleaf',layers=3,spokes=conifer?Math.round(2+q.density*2):Math.round(4+q.density*(reference?3:5)),phase=rand()*6.283;
    for(let layer=0;layer<layers;layer++)for(let j=0;j<spokes;j++){
      if(q.density===0&&q.mode!=='leaf')continue;
      const a=conifer?Math.atan2(group.axis[2],group.axis[0])+(j/Math.max(1,spokes-1)-.5)*1.4*(.6+.6*(q.asymmetry??.7))+layer*.12:phase+j/spokes*Math.PI*2+layer*.63+(rand()-.5)*.3*(q.asymmetry??1),rad=(conifer?.12:reference?.66:.5)*(1-layer*.12)*(conifer?1:.8+rand()*.4),r=group.radii;
      const position:Point=[group.anchor[0]+Math.cos(a)*r[0]*rad,group.anchor[1]+r[1]*(conifer?layer*.18-.18:(reference?[-.3,.08,.4][layer]:[-.22,.18,.5][layer])+(rand()-.5)*(reference?.2:.18)),group.anchor[2]+Math.sin(a)*r[2]*rad];
      const direction=conifer?new Vector3(Math.cos(a)*(group.axis[1]>.9?.2:1),group.axis[1]>.9?.9:-.12-layer*.04-.35*Math.pow(group.anchor[1]/model.parameters.height,2),Math.sin(a)*(group.axis[1]>.9?.2:1)):new Vector3(Math.cos(a)*.85,-.35+layer*.7+(reference?(rand()-.5)*.85:0),Math.sin(a)*.85);direction.normalize();
      const rotation=new Quaternion().setFromUnitVectors(new Vector3(0,conifer?1:0,conifer?0:1),direction).multiply(new Quaternion().setFromAxisAngle(new Vector3(0,conifer?1:0,conifer?0:1),(rand()-.5)*(conifer?1.2:.65)));
      const coverage=.83+q.overlap*.55,width=(conifer?Math.max(r[2]*.95,r[1]*.4):r[0]*(reference?1.13:1.5)*(reference?[1,1,.85][layer]:[1.03,1.1,.8][layer]))*coverage*(.85+rand()*.3),length=(conifer?Math.max(r[0]*1.3,r[1]*1.9):r[1]*(reference?.96:1.06))*coverage*(.9+rand()*.22);
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
  const source=groups[0],scale=q.mode!=='trees'?2.2*q.size/Math.max(...source.radii):q.unified&&kind==='broadleaf'?.48:6.8/model.dimensions.height,offset:Point=q.mode!=='trees'?source.anchor.map(n=>-n*scale) as Point:[0,0,0];
  let first=source.branchIndex,last=first;const same=(a:Point,b:Point)=>a.every((n,i)=>Math.abs(n-b[i])<1e-7);while(first>0&&model.segments[first-1].depth===model.segments[first].depth&&same(model.segments[first-1].b,model.segments[first].a))first--;while(last+1<model.segments.length&&model.segments[last+1].depth===model.segments[last].depth&&same(model.segments[last].b,model.segments[last+1].a))last++;const segments=q.mode==='leaf'?[]:q.mode==='groups'?model.segments.slice(first,last+1):model.segments;
  return {kind,model,groups,fronds,segments,scale,offset};
}
