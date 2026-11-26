import {randomSource} from './random';
import * as THREE from 'three';
import {createStudioStudy,studioDefaults,type StudioStudy,type StudioSettings} from '../studio/groups';
import {batchSpecies} from '../studio/species-v1';
import {studioGeometry} from '../studio/geometry';
import {studioFoliageMaterial} from '../studio/renderer';
import type {Point} from './tree';
import type {SceneTree} from './recipe';

const designs=new Set(['oak','douglas-v1',...Object.keys(batchSpecies)]);
const variants=new Map<string,StudioStudy>();
export function librarySettings(presetId:string,structure:string,appearance:string):StudioSettings{
  const conifer=presetId==='douglas-v1'||!!batchSpecies[presetId]?.conifer;
  return {...studioDefaults,unified:true,mode:'trees',view:conifer?'conifer':'broadleaf',presetId,structure,appearance,palette:'sage',oakGrowth:'spreading',leafScale:1,asymmetry:.7,shape:.5,roundness:.3,branchSpread:.65,edgeBreakup:.3,evergreenStudy:presetId==='douglas-v1',crownGradient:.45,crownRim:.4};
}
/** Reuse the approved Atelier generator, in metres rather than its display scale. */
export function sceneLibraryStudy(presetId:string,structure:string,appearance:string,sizeScale:number,controls?:{fluffiness:number;clumpOverlap:number;foliageDensity:number;foliageDetail:number;asymmetry:number}):StudioStudy|undefined{
  if(!designs.has(presetId))return;
  const q=librarySettings(presetId,structure,appearance);
  if(controls){q.size=1+(controls.fluffiness-.78)*.3;q.overlap=.72+(controls.clumpOverlap-.82)*.3;q.density=controls.foliageDensity;q.detail=controls.foliageDetail;q.asymmetry=controls.asymmetry;}
  const key=JSON.stringify(q);
  let study=variants.get(key);
  if(!study){study=createStudioStudy(q.view==='conifer'?'conifer':'broadleaf',q);if(variants.size>=64)variants.delete(variants.keys().next().value!);variants.set(key,study);}
  const point=(p:Point)=>p.map(v=>v*sizeScale) as Point;
  const segments=study.segments.map(s=>({...s,a:point(s.a),b:point(s.b),r0:s.r0*sizeScale,r1:s.r1*sizeScale}));
  const d=study.model.dimensions,parameters=study.model.parameters;
  const model={...study.model,presetId,segments,parameters:{...parameters,height:parameters.height*sizeScale,crownRadius:parameters.crownRadius*sizeScale,trunkRadius:parameters.trunkRadius*sizeScale},dimensions:{height:d.height*sizeScale,crownWidth:d.crownWidth*sizeScale,crownDepth:d.crownDepth*sizeScale}};
  return {...study,model,segments,scale:sizeScale,offset:[0,0,0]};
}
/** Invisible picking volumes follow the real branch-owned groups, never the old canopy generator. */
export function libraryPickClumps(study:StudioStudy){return study.groups.map((g,i)=>({id:i,position:g.center.map(v=>v*study.scale) as Point,scale:g.radii.map(v=>v*study.scale) as Point,rotation:0,variant:0,kind:'cloud' as const,color:'#6e9462',interior:false,attachmentIndex:g.branchIndex,attachmentPoint:g.anchor.map(v=>v*study.scale) as Point}));}

/** One GPU batch/material/atlas per design and LOD, never one draw call per tree or leaf. */
export function libraryFoliageBatch(trees:SceneTree[],presetId:string,appearance:string,mobile:boolean,far:boolean,wireframe=false,shared?:THREE.ShaderMaterial){
  const parts:THREE.BufferGeometry[]=[],counts:number[]=[];
  for(const tree of trees){
    const study=tree.studio!;
    // Stable group thinning keeps crossed patches together. Performance/far changes no seeds.
    const fronds=far?study.fronds.filter(f=>f.essential||f.groupId%2===0):study.fronds;
    const geometry=studioGeometry([{...study,fronds}],[0]);
    // Colour metadata only: positions, normals, card layout and source seeds stay intact.
    const rand=randomSource(tree.seed+'|encounter-pigment'),hue=(rand()-.5)*.22,saturation=.92+rand()*.3,value=.86+rand()*.22;
    const accent=[0,5,12].includes(tree.index)?1:0,vertices=geometry.getAttribute('position').count;
    const pigments=new Float32Array(vertices*4),crown=new Float32Array(vertices*2);
    for(let i=0;i<vertices;i++){pigments.set([hue,saturation,value,accent],i*4);crown.set([tree.position[1],tree.position[1]+tree.model.dimensions.height],i*2);}
    geometry.setAttribute('treePigment',new THREE.BufferAttribute(pigments,4));geometry.setAttribute('treeCrown',new THREE.BufferAttribute(crown,2));
    const matrix=new THREE.Matrix4().makeRotationY(-tree.rotation);matrix.setPosition(...tree.position);geometry.applyMatrix4(matrix);parts.push(geometry);counts.push(fronds.length);
  }
  const geometry=new THREE.BufferGeometry();let vertexOffset=0,indexOffset=0;
  for(const name of Object.keys(parts[0].attributes)){
    const width=parts[0].getAttribute(name).itemSize,values=new Float32Array(parts.reduce((n,g)=>n+g.getAttribute(name).array.length,0));let offset=0;
    for(const part of parts){const a=part.getAttribute(name).array;values.set(a,offset);offset+=a.length;}
    geometry.setAttribute(name,new THREE.BufferAttribute(values,width));
  }
  const indices=new Uint32Array(parts.reduce((n,g)=>n+g.index!.count,0));
  for(const part of parts){for(const i of part.index!.array)indices[indexOffset++]=i+vertexOffset;vertexOffset+=part.getAttribute('position').count;part.dispose();}
  geometry.setIndex(new THREE.BufferAttribute(indices,1));geometry.computeBoundingBox();geometry.computeBoundingSphere();
  // Shared atlas seed, while vertex pigments retain each tree's independent appearance seed.
  const material=shared??studioFoliageMaterial(librarySettings(presetId,'scene-atlas',appearance),mobile);material.wireframe=wireframe;
  material.uniforms.crownMin.value.copy(geometry.boundingBox!.min);material.uniforms.crownMax.value.copy(geometry.boundingBox!.max);
  return {mesh:new THREE.Mesh(geometry,material),texture:material.uniforms.foliageMap.value as THREE.Texture,cards:counts.reduce((a,b)=>a+b,0)};
}
