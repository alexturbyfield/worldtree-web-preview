import * as THREE from 'three';
import {atlasRect,getFoliageAtlas,coverageMipmaps,type FoliageAtlas} from './foliage-atlas';
import type {FoliageCard} from './foliage-cards';

let base:THREE.BufferGeometry|null=null;
/** A gently creased, open sheet. There are no closed foliage volumes. */
export function foliageCardGeometry(){
  if(!base){
    base=new THREE.BufferGeometry();const p:number[]=[],uv:number[]=[],indices:number[]=[];
    for(let y=0;y<3;y++)for(let x=0;x<3;x++){const u=x/2,v=y/2;p.push(u,v-.5,Math.sin(u*Math.PI)*.06+(v-.5)*(v-.5)*.08);uv.push(u,v);}
    for(let y=0;y<2;y++)for(let x=0;x<2;x++){const i=y*3+x;indices.push(i,i+1,i+3,i+1,i+4,i+3);}
    base.setAttribute('position',new THREE.Float32BufferAttribute(p,3));base.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));base.setIndex(indices);base.computeVertexNormals();
  }return base.clone();
}
export function cardInstanceAttributes(geometry:THREE.BufferGeometry,cards:FoliageCard[]){
  geometry.setAttribute('atlasRect',new THREE.InstancedBufferAttribute(new Float32Array(cards.flatMap(c=>atlasRect(c.tile))),4));
  geometry.setAttribute('windPhase',new THREE.InstancedBufferAttribute(new Float32Array(cards.map(c=>c.phase)),1));
}
export function foliageMaterial(appearanceSeed:string,performance:boolean,far:boolean,wireframe=false,shared?:{atlas:FoliageAtlas;texture:THREE.CanvasTexture}){
  const atlas=shared?.atlas??getFoliageAtlas(appearanceSeed,performance?256:512),texture=shared?.texture??new THREE.CanvasTexture(atlas.canvas);
  if(!shared){texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=2;texture.mipmaps=coverageMipmaps(atlas);texture.generateMipmaps=false;}
  const common={map:texture,alphaTest:far?.24:.3,depthWrite:true,transparent:false,side:THREE.DoubleSide,wireframe};
  const material=performance?new THREE.MeshLambertMaterial(common):new THREE.MeshStandardMaterial({...common,roughness:1,metalness:0});
  const time={value:0},amplitude={value:0};
  installCardShader(material,time,amplitude);
  return {material,atlas,texture,time,amplitude};
}
export function installCardShader(material:THREE.Material,time:{value:number},amplitude:{value:number}){
  material.onBeforeCompile=shader=>{
    shader.uniforms.foliageTime=time;shader.uniforms.foliageWind=amplitude;
    shader.vertexShader='attribute vec4 atlasRect; attribute float windPhase; uniform float foliageTime; uniform float foliageWind;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv = atlasRect.xy + uv * atlasRect.zw;\n#endif');
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z += sin(foliageTime * 1.15 + windPhase + position.x * 3.0) * foliageWind * position.x * position.x;');
  };
  material.customProgramCacheKey=()=>`botanical-cards-v11-${material.type}`;
}
export function cardHitVisible(atlas:FoliageAtlas,card:FoliageCard,uv:THREE.Vector2,threshold=.27){
  const x=Math.min(atlas.width-1,Math.max(0,Math.floor((card.tile%4+uv.x)*atlas.tileSize))),y=Math.min(atlas.height-1,Math.max(0,Math.floor((Math.floor(card.tile/4)+1-uv.y)*atlas.tileSize)));
  return atlas.alpha[y*atlas.width+x]/255>=threshold;
}
