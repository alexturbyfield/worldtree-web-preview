import * as T from 'three';
import type {SceneTree} from './recipe';
import {studioGeometry} from '../studio/geometry';
export type NormalWeights={crown:number;cluster:number;leaf:number};
export const initialNormalWeights:NormalWeights={crown:.45,cluster:.40,leaf:.15};
export function normalizedWeights(w:NormalWeights):NormalWeights{const values=[w.crown,w.cluster,w.leaf];if(values.some(v=>!Number.isFinite(v)||v<0)||values.reduce((a,b)=>a+b,0)<=0)throw Error('Normal weights must be finite, nonnegative and have a positive sum');const sum=w.crown+w.cluster+w.leaf;return {crown:w.crown/sum,cluster:w.cluster/sum,leaf:w.leaf/sum};}
export function blendCanopyNormals(crown:T.Vector3,cluster:T.Vector3,leaf:T.Vector3,weights:NormalWeights){const w=normalizedWeights(weights),n=crown.clone().normalize().multiplyScalar(w.crown).addScaledVector(cluster.clone().normalize(),w.cluster).addScaledVector(leaf.clone().normalize(),w.leaf);return n.lengthSq()<1e-10?crown.clone().normalize():n.normalize();}
/** Bounds fitted from the real cluster distribution in all three local axes. */
export function clusterCrownField(tree:SceneTree){const bounds=new T.Box3();for(const g of tree.studio!.groups){const c=new T.Vector3(...g.center),r=new T.Vector3(...g.radii).multiplyScalar(.5);bounds.expandByPoint(c.clone().sub(r));bounds.expandByPoint(c.clone().add(r));}return {center:bounds.getCenter(new T.Vector3()),radii:bounds.getSize(new T.Vector3()).multiplyScalar(.5).max(new T.Vector3(.01,.01,.01))};}
function curvedNormal(p:T.Vector3,center:T.Vector3,radii:T.Vector3,fallback=new T.Vector3(0,1,0)){const d=p.clone().sub(center).divide(radii).divide(radii);return d.lengthSq()<1e-10?fallback.clone():d.normalize();}
/** Diagnostic clone only: the existing draw range, positions, UVs and alpha are preserved. */
export function prepareCanopyNormalExperiment(tree:SceneTree,geometry:T.BufferGeometry){
 const study=tree.studio!,raw=studioGeometry([study],[0]),count=raw.attributes.position.count,current=geometry.attributes.normal,continuous=new Float32Array(current.array),cards=new Float32Array(count*3),crowns=new Float32Array(count*3),clusters=new Float32Array(count*3),field=clusterCrownField(tree),groups=new Map(study.groups.map(g=>[g.id,g])),rotation=new T.Matrix4().makeRotationY(-tree.rotation),p=new T.Vector3(),normal=new T.Vector3();
 for(let i=0;i<count;i++){
  p.fromBufferAttribute(raw.attributes.position,i);const c=curvedNormal(p,field.center,field.radii),g=groups.get(study.fronds[Math.floor(i/9)].groupId)!;
  const local=curvedNormal(p,new T.Vector3(...g.center),new T.Vector3(...g.radii).max(new T.Vector3(.01,.01,.01)),c);
  normal.fromBufferAttribute(raw.attributes.normal,i).normalize().transformDirection(rotation).toArray(cards,i*3);c.transformDirection(rotation).toArray(crowns,i*3);local.transformDirection(rotation).toArray(clusters,i*3);
 }raw.dispose();
 return {field:{center:field.center.toArray(),radii:field.radii.toArray(),source:'Existing 3D cluster centers and radii, tree-local coordinates; no camera inputs'},apply(mode:'cards'|'hull'|'blend',weights:NormalWeights=initialNormalWeights){const w=normalizedWeights(weights);if(mode==='hull')current.array.set(continuous);else for(let i=0;i<count;i++){normal.fromArray(cards,i*3);if(mode==='blend')normal.copy(blendCanopyNormals(new T.Vector3().fromArray(crowns,i*3),new T.Vector3().fromArray(clusters,i*3),normal,w));current.setXYZ(i,normal.x,normal.y,normal.z);}current.needsUpdate=true;return {mode,weights:w};}};
}
