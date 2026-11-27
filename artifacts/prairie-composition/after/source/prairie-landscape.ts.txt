import {expansionHeight,type ExpansionPlan} from './wave2-shared';
const smooth=(a:number,b:number,v:number)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
/** Synthetic presentation fields, not measured topography or local habitat evidence.
 * Broad low shoulders continue the retained landforms; no near-camera displacement. */
export function prairieLandscape(plan:ExpansionPlan,x:number,z:number){
 const phase=plan.phase,depth=Math.max(0,34-z),fade=smooth(70,180,depth);
 const channel=x-24*Math.sin(z*.008+phase);
 const valley=-5.5*Math.exp(-channel*channel/12000)*Math.exp(-Math.pow((z+135)/190,2));
 const shoulder=(cx:number,cz:number,rx:number,rz:number,h:number)=>h*Math.exp(-Math.pow((x-cx)/rx,2)-Math.pow((z-cz)/rz,2));
 const continuation=shoulder(-210+Math.sin(phase)*80,-510,350,270,26)+shoulder(360,-960,550,400,48)+shoulder(-500,-1500,800,510,68);
 const flow=Math.sin(x*.031+z*.013+phase+Math.sin(z*.018)*.6)*.5+.5;
 const cover=smooth(.30,.73,flow),drainage=Math.exp(-channel*channel/2200)*smooth(45,150,depth);
 return {height:expansionHeight(plan,x,z)+fade*(valley+continuation),cover,drainage};
}
