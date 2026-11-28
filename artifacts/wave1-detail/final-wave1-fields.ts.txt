import {hashSeed} from './random';
export type FieldBiome='desert'|'mangrove'|'flooded';
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
function noise(seed:number,x:number,z:number){const i=Math.floor(x),j=Math.floor(z),u=x-i,v=z-j,h=(a:number,b:number)=>{let n=Math.imul(a,374761393)^Math.imul(b,668265263)^seed;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};return mix(mix(h(i,j),h(i+1,j),u*u*(3-2*u)),mix(h(i,j+1),h(i+1,j+1),u*u*(3-2*u)),v*v*(3-2*v));}
/** Terrain first. Hydrology/communities derive from the same multiscale landform, never camera uplift. */
export function landscapeField(biome:FieldBiome,seed:string,x:number,z:number){
 const key=hashSeed(seed+'|connected-landforms'),wx=x+17*(noise(key+1,x*.018,z*.018)-.5),wz=z+21*(noise(key+2,x*.017,z*.017)-.5);
 const broad=noise(key,wx*.023,wz*.032),meso=noise(key+3,wx*.083,wz*.069),fine=noise(key+4,x*.3,z*.3);
 const land=.72*broad+.22*meso+.06*fine;
 // Same retained landforms; a small datum shift admits shallow side pools, not new channels.
 const height=biome==='desert'?land*2.4+.12*noise(key+8,x*.9,z*.9):biome==='mangrove'?(land-.505)*2.2:(land-.5)*1.7;
 const moisture=biome==='desert'?1-smooth(.7,1.3,height):1-smooth(-.12,.3,height);
 const substrate=smooth(.55,.76,land),community=smooth(.32,.65,noise(key+11,wx*.056,wz*.044));
 return {height,depth:Math.max(0,-height),moisture,substrate,community,woody:biome==='mangrove'?smooth(.02,.18,height)*(1-smooth(.42,.6,height)):smooth(.23,.39,height),rock:biome==='desert'?smooth(.53,.74,broad+.08*meso):0};
}
export interface FieldPlan {biome:FieldBiome;seed:string;eye:[number,number,number];target:[number,number,number];heading:number;stagingClearance:number;}
/** Screen-weighted terrain-visible water, independent of vegetation and artistic approval. */
export function waterViewScore(biome:FieldBiome,seed:string,x:number,z:number,angle:number){
 const eyeY=landscapeField(biome,seed,x,z).height+1.7,dx=Math.sin(angle),dz=-Math.cos(angle);let wet=0,total=0,sides=0,middle=0,nearSides=0,nearSideTotal=0;
 for(const row of [.525,.55,.58,.62,.67,.73,.8])for(const col of [-.8,-.5,-.25,0,.25,.5,.8]){
  const down=(row*2-1)*Math.tan(47*Math.PI/360)+.9/70,d=eyeY/down;if(d<4||d>120)continue;
  const side=col*Math.tan(47*Math.PI/360)*16/9,tx=x+dx*d-dz*d*side,tz=z+dz*d+dx*d*side;
  const weight=row<.73?1:.35;total+=weight;if(row>=.62&&Math.abs(col)>.4)nearSideTotal+=weight;if(landscapeField(biome,seed,tx,tz).depth<.012)continue;
  let blocked=false;for(const t of [.2,.4,.6,.8,.94])if(landscapeField(biome,seed,x+(tx-x)*t,z+(tz-z)*t).height>eyeY*(1-t)+.005){blocked=true;break;}
  if(blocked)continue;wet+=weight;if(Math.abs(col)>.4)sides+=weight;if(row<.67)middle+=weight;if(row>=.62&&Math.abs(col)>.4)nearSides+=weight;
 }
 return {fraction:wet/Math.max(1,total),sides:sides/Math.max(1,total),middle:middle/Math.max(1,total),nearSides:nearSides/Math.max(1,nearSideTotal)};
}
const cache=new Map<string,FieldPlan>();
/** Select an existing connected walkable margin and view over its landscape. No terrain is edited. */
export function fieldPlan(biome:FieldBiome,seed:string):FieldPlan{
 const key=biome+'|'+seed,existing=cache.get(key);if(existing)return existing;
 let best=-Infinity,chosen={x:0,z:0,angle:0,clearance:0};
 const candidates:{x:number;z:number;angle:number;clearance:number;score:number}[]=[];
 for(let z=-90;z<=90;z+=9)for(let x=-90;x<=90;x+=9)for(let k=0;k<8;k++){
  const angle=k*Math.PI/4,dx=Math.sin(angle),dz=-Math.cos(angle),f=landscapeField(biome,seed,x,z);let clearance=Infinity,slope=0;
  for(const along of [2,4,6,8])for(const side of [-2,0,2]){const h=landscapeField(biome,seed,x+dx*along+dz*side,z+dz*along-dx*side).height;clearance=Math.min(clearance,h);slope=Math.max(slope,Math.abs(h-f.height));}
  if(biome!=='desert'&&clearance<.07||slope>.45)continue;
  let water=0,sides=0,framing=0;for(const d of [15,25,40,65]){const h=landscapeField(biome,seed,x+dx*d,z+dz*d);water+=biome==='desert'?h.rock:h.depth>.02?1:0;for(const side of [-1,1]){const f=landscapeField(biome,seed,x+dx*d+dz*d*.5*side,z+dz*d-dx*d*.5*side);sides+=f.community;framing+=biome==='desert'?f.rock:f.woody;}}
  const score=(biome==='desert'?water:4-Math.abs(water-2)*2)+framing*2+sides*.25-slope*4-Math.abs(f.height-(biome==='desert'?1.2:.22));
  if(biome!=='desert')candidates.push({x,z,angle,clearance,score});
  if(score>best){best=score;chosen={x,z,angle,clearance};}
 }
 if(biome!=='desert'){
  // Refine many margins, not just the old winner. Keep water balanced rather than maximize flooding.
  candidates.sort((a,b)=>b.score-a.score);best=-Infinity;
  for(const p of candidates.slice(0,500)){const w=waterViewScore(biome,seed,p.x,p.z,p.angle),balance=1-Math.abs(w.fraction-.35)/.35,score=balance*12+w.sides*5+w.middle*4+w.nearSides*9+p.score*.12;
   if(score>best){best=score;chosen=p;}}
 }
 const {x,z,angle,clearance}=chosen,y=landscapeField(biome,seed,x,z).height,plan:FieldPlan={biome,seed,eye:[x,y+1.7,z],target:[x+Math.sin(angle)*70,y+.8,z-Math.cos(angle)*70],heading:angle,stagingClearance:clearance};cache.set(key,plan);return plan;
}
export function cameraSpace(plan:FieldPlan,x:number,z:number){const dx=x-plan.eye[0],dz=z-plan.eye[2],s=Math.sin(plan.heading),c=Math.cos(plan.heading);return {forward:dx*s-dz*c,side:dx*c+dz*s};}
export function characterSpace(plan:FieldPlan,x:number,z:number){const q=cameraSpace(plan,x,z);return q.forward>0&&q.forward<9&&Math.abs(q.side)<2.8;}
/** Physical capsule footprint + short approach. Decoration may be low outside this collision area. */
export function collisionFootprint(plan:FieldPlan,x:number,z:number,radius=0){const q=cameraSpace(plan,x,z),along=Math.max(2.8,Math.min(6.2,q.forward));return Math.hypot(q.side,q.forward-along)<.85+radius;}
export function stagingHeightFactor(plan:FieldPlan,x:number,z:number){const q=cameraSpace(plan,x,z),along=Math.max(2.8,Math.min(6.2,q.forward)),d=Math.hypot(q.side,q.forward-along);return .08+.92*smooth(.8,4.2,d);}
