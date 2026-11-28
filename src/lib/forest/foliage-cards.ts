import {Color,Matrix4,Quaternion,Vector3} from 'three';
import {randomSource} from './random';
import type {PaintedTree} from './painterly';
import type {Point,Segment} from './tree';

export interface FoliageCard {
  id:number;position:Point;rotation:[number,number,number,number];size:[number,number];
  tile:number;phase:number;priority:number;color:string;segmentIndex:number;attachmentT:number;
}
type Attachment=Omit<FoliageCard,'color'>;
const cache=new Map<string,Attachment[]>();
const eq=(a:Point,b:Point)=>a.every((n,i)=>Math.abs(n-b[i])<1e-7);
function paths(segments:Segment[]){
  const out:{segments:Segment[];index:number}[]=[];
  for(let i=0;i<segments.length;){if(segments[i].depth===0){i++;continue;}const start=i,group=[segments[i++]];
    while(i<segments.length&&group.length<3&&segments[i].depth===group[0].depth&&eq(group.at(-1)!.b,segments[i].a))group.push(segments[i++]);
    out.push({segments:group,index:start});
  }return out;
}
/** Every card root lies on a real branch segment. Appearance never enters this cache key. */
export function generateFoliageCards(model:PaintedTree,detail=.65):FoliageCard[]{
  if(!Number.isFinite(detail)||detail<0||detail>1)throw new Error('Foliage detail must be 0–1.');
  if(model.art.foliageDensity===0)return [];
  const key=JSON.stringify([model.presetId,model.seed,model.art.asymmetry,model.art.stylization,model.art.foliageDensity,detail]);
  let attachments=cache.get(key);
  if(!attachments){
    const rand=randomSource(`${model.presetId}|${model.seed}|cards-v11`),range=(a:number,b:number)=>a+(b-a)*rand();
    const conifer=['douglas','spruce'].includes(model.presetId),pine=model.presetId==='pine',acacia=model.presetId==='acacia';
    const baseTile=model.presetId==='douglas'?0:model.presetId==='spruce'?2:pine?1:acacia?7:3;
    const all:Attachment[]=[];const xAxis=new Vector3(1,0,0),up=new Vector3(0,1,0);
    for(const group of paths(model.segments)){
      const depth=group.segments[0].depth,a=new Vector3(...group.segments[0].a),b=new Vector3(...group.segments.at(-1)!.b),length=a.distanceTo(b);
      const terminal=!model.segments.some(s=>eq(s.a,group.segments.at(-1)!.b));
      const count=conifer?(depth===1?4:5):depth>=3?5:depth===2?2:terminal?3:1;
      for(let j=0;j<count;j++){
        const t=.18+j/count*.68+range(-.06,.06),part=Math.min(group.segments.length-1,Math.floor(t*group.segments.length)),localT=t*group.segments.length-part,s=group.segments[part];
        const root=new Vector3(...s.a).lerp(new Vector3(...s.b),localT),dir=new Vector3(...s.b).sub(new Vector3(...s.a)).normalize();
        // Secondary fans and terminal leaf clusters follow the branch, with seeded twists.
        dir.applyAxisAngle(up,conifer?range(-.36,.36):range(-1.1,1.1));
        const side=new Vector3().crossVectors(dir,up);if(side.lengthSq()<.01)side.crossVectors(dir,new Vector3(0,0,1));side.normalize();
        const normal=new Vector3().crossVectors(dir,side).normalize();
        const rotation=new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(dir,side,normal));
        rotation.multiply(new Quaternion().setFromAxisAngle(xAxis,conifer?range(-.65,.65):range(-1.15,1.15))).normalize();
        const span=conifer?Math.min(3.2,1.1+length*.65):Math.min(3.1,1.05+length*.8+model.parameters.crownRadius*.1);
        const size=span*range(.78,1.15)*(1+model.art.stylization*.12);
        const priority=j===0?rand()*.28:.28+rand()*.72;
        const tile=baseTile===0&&rand()<.35?5:baseTile===3&&rand()<.4?6:baseTile;
        all.push({id:all.length,position:root.toArray() as Point,rotation:rotation.toArray(),size:[size,size*(conifer?.64:pine?.8:.85)],tile,phase:range(0,Math.PI*2),priority,segmentIndex:group.index+part,attachmentT:localT});
        if(!conifer&&!pine&&!acacia&&depth>=3&&j===count-1){
          const tip=new Vector3(...s.b),q=rotation.clone().multiply(new Quaternion().setFromAxisAngle(xAxis,.8));
          all.push({id:all.length,position:tip.toArray() as Point,rotation:q.toArray(),size:[size*.34,size*.23],tile:4,phase:range(0,Math.PI*2),priority:.4+rand()*.6,segmentIndex:group.index+part,attachmentT:1});
        }
      }
    }
    const threshold=.32+detail*.68;
    attachments=all.filter(c=>c.priority<threshold&&(c.priority<.28||randomSource(model.seed+'|density|'+c.id)()<model.art.foliageDensity));
    cache.set(key,attachments);if(cache.size>128)cache.delete(cache.keys().next().value!);
  }
  const body=new Color(model.palette.body),shadow=new Color(model.palette.shadow),light=new Color(model.palette.light);
  return attachments.map(a=>{const rand=randomSource(`${model.appearanceSeed}|pigment-card|${a.id}`),color=body.clone().lerp(rand()<.2?shadow:light,.1+rand()*.38);color.offsetHSL((rand()-.5)*.035,(rand()-.5)*.08,(rand()-.5)*.035);return {...a,color:'#'+color.getHexString()};});
}
export function selectFoliageCards(cards:FoliageCard[],performance:boolean,far:boolean){
  const limit=far?(performance?.23:.36):performance?.56:1;return cards.filter(c=>c.priority<limit);
}
export function foliageCardCacheStats(){return {entries:cache.size,capacity:128};}
