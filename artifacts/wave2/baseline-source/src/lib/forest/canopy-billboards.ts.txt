import {Color,Matrix3,Matrix4,Quaternion,Vector3} from 'three';
import {randomSource} from './random';
import type {CanopyClump} from './canopy';
import type {Point} from './tree';

export interface CanopyBillboard {
  id:number;scaffoldId:number;position:Point;normal:Point;
  rotation:[number,number,number,number];size:[number,number];
  tile:number;phase:number;roll:number;color:string;
}
/** Inverse transpose of an ellipsoid's scale, then its rotation. Never the sheet normal. */
export function ellipsoidNormal(point:Point,center:Point,radii:Point,rotation=0):Point {
  const q=new Quaternion().setFromAxisAngle(new Vector3(0,1,0),rotation);
  return new Vector3(...point).sub(new Vector3(...center)).applyQuaternion(q.clone().invert())
    .divide(new Vector3(...radii)).divide(new Vector3(...radii)).normalize().applyQuaternion(q).toArray() as Point;
}
export function transformCanopyNormal(normal:Point,world:Matrix4):Point {
  return new Vector3(...normal).applyMatrix3(new Matrix3().getNormalMatrix(world)).normalize().toArray() as Point;
}
/** A fixed surface sample sequence: no camera/appearance seeds in placement or normals. */
export function generateCanopyBillboards(clumps:CanopyClump[],presetId:string,structuralSeed:string,appearanceSeed:string,far=false,performance=false,detail=.3):CanopyBillboard[]{
  const out:CanopyBillboard[]=[];
  for(const clump of clumps){
    const rand=randomSource(`${structuralSeed}|${clump.id}|leaf-scaffold-v2|${far?'far':'near'}`),paint=randomSource(`${appearanceSeed}|${clump.id}|card-pigment`);
    const needle=['douglas','spruce','pine'].includes(presetId),count=far?(needle?(performance?14:18):(performance?12:14)):performance?24:Math.round(40+detail*16),rotation=new Quaternion().setFromAxisAngle(new Vector3(0,1,0),clump.rotation),phase=rand()*Math.PI*2;
    for(let j=0;j<count;j++){
      const y=1-2*(j+.5)/count,a=j*2.399963229728653+phase+(rand()-.5)*.25,ring=Math.sqrt(1-y*y),radial=new Vector3(Math.cos(a)*ring,y,Math.sin(a)*ring);
      const shell=.84+rand()*.23,p=radial.clone().multiply(new Vector3(...clump.scale)).multiplyScalar(shell).applyQuaternion(rotation).add(new Vector3(...clump.position));
      // Discard samples buried in a neighbouring scaffold. Its visible surface supplies the leaves.
      const buried=clumps.some(other=>{
        if(other===clump)return false;
        const d=p.clone().sub(new Vector3(...other.position)).applyAxisAngle(new Vector3(0,1,0),-other.rotation).divide(new Vector3(...other.scale));
        return d.lengthSq()<(far?.6*.6:.92*.92);
      });if(buried)continue;
      const normal=ellipsoidNormal(p.toArray() as Point,clump.position,clump.scale,clump.rotation),n=new Vector3(...normal);
      const tangent=new Vector3(0,1,0).cross(n);if(tangent.lengthSq()<.01)tangent.set(1,0,0);tangent.normalize();
      const roll=rand()*Math.PI*2,q=new Quaternion().setFromUnitVectors(new Vector3(0,0,1),n).multiply(new Quaternion().setFromAxisAngle(new Vector3(0,0,1),roll)).multiply(new Quaternion().setFromAxisAngle(tangent,(rand()-.5)*.7));
      // Size follows each scaffold, including flattened boughs. Coarse cards are larger to retain coverage.
      const span=Math.sqrt(clump.scale[0]*clump.scale[2]),width=span*(far?1.65:performance?1.35:1.1)*(.85+rand()*.3),height=Math.max(clump.scale[1]*1.12,span*.62)*(far?1.4:1.05)*(.85+rand()*.3);
      const tile=presetId==='douglas'?(j%2?0:5):presetId==='spruce'?2:presetId==='pine'?1:presetId==='acacia'?7:[3,4,6][j%3];
      const color=new Color(clump.color).offsetHSL((paint()-.5)*.025,(paint()-.5)*.045,(paint()-.5)*.055);
      out.push({id:out.length,scaffoldId:clump.id,position:p.toArray() as Point,normal,rotation:q.toArray(),size:[width,height],tile,phase:rand()*6.28,roll,color:'#'+color.getHexString()});
    }
  }return out;
}
