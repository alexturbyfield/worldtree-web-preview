import * as THREE from 'three';
import {atlasRect,getFoliageAtlas,coverageMipmaps,type FoliageAtlas} from './foliage-atlas';
import type {CanopyBillboard} from './canopy-billboards';

/** Four shared vertices, two triangles. Instances carry placement, pigment and transferred normal. */
export function canopyBillboardGeometry(cards:CanopyBillboard[],treeNormals?:number[]){
  const geometry=new THREE.PlaneGeometry(1,1);
  geometry.setAttribute('atlasRect',new THREE.InstancedBufferAttribute(new Float32Array(cards.flatMap(c=>atlasRect(c.tile))),4));
  geometry.setAttribute('canopyNormal',new THREE.InstancedBufferAttribute(new Float32Array(treeNormals??cards.flatMap(c=>c.normal)),3));
  geometry.setAttribute('leafPhase',new THREE.InstancedBufferAttribute(new Float32Array(cards.map(c=>c.phase)),1));
  geometry.setAttribute('leafRoll',new THREE.InstancedBufferAttribute(new Float32Array(cards.map(c=>c.roll)),1));
  return geometry;
}
/** A single indexed batch avoids thousands of tiny instances on software drivers. */
export function batchCanopyBillboards(cards:CanopyBillboard[]){
  const arrays:Record<string,number[]>={position:[],normal:[],canopyNormal:[],uv:[],cardCenter:[],cardRight:[],cardUp:[],cardSize:[],atlasRect:[],leafPhase:[],leafRoll:[],color:[]},indices:number[]=[];
  const right=new THREE.Vector3(),up=new THREE.Vector3(),q=new THREE.Quaternion(),color=new THREE.Color();
  cards.forEach((c,index)=>{
    q.set(...c.rotation);right.set(1,0,0).applyQuaternion(q);up.set(0,1,0).applyQuaternion(q);color.set(c.color);
    for(const [x,y] of [[0,0],[1,0],[0,1],[1,1]]){
      arrays.position.push(x-.5,y-.5,0);arrays.uv.push(x,y);arrays.normal.push(...c.normal);arrays.canopyNormal.push(...c.normal);arrays.cardCenter.push(...c.position);arrays.cardRight.push(...right.toArray());arrays.cardUp.push(...up.toArray());arrays.cardSize.push(...c.size);arrays.atlasRect.push(...atlasRect(c.tile));arrays.leafPhase.push(c.phase);arrays.leafRoll.push(c.roll);arrays.color.push(color.r,color.g,color.b);
    }const v=index*4;indices.push(v,v+1,v+2,v+1,v+3,v+2);
  });
  const g=new THREE.BufferGeometry();for(const [name,values] of Object.entries(arrays))g.setAttribute(name,new THREE.Float32BufferAttribute(values,['uv','cardSize'].includes(name)?2:name==='atlasRect'?4:['leafPhase','leafRoll'].includes(name)?1:3));g.setIndex(indices);
  // Shader positions are relative to cardCenter, not the unit sheet corners.
  const box=new THREE.Box3();for(const c of cards){const r=Math.hypot(...c.size);box.expandByPoint(new THREE.Vector3(...c.position).addScalar(r));box.expandByPoint(new THREE.Vector3(...c.position).addScalar(-r));}g.boundingBox=box;g.boundingSphere=box.getBoundingSphere(new THREE.Sphere());return g;
}
export function installCanopyShader(material:THREE.Material,time:{value:number},wind:{value:number},bias=.38,vertexLighting=false){
  material.onBeforeCompile=shader=>{
    shader.uniforms.leafTime=time;shader.uniforms.leafWind=wind;
    shader.vertexShader=(vertexLighting?'varying vec3 canopyLight;\n':'')+`attribute vec3 cardCenter; attribute vec3 cardRight; attribute vec3 cardUp; attribute vec2 cardSize; attribute vec4 atlasRect; attribute vec3 canopyNormal; attribute float leafPhase; attribute float leafRoll; uniform float leafTime; uniform float leafWind;\n`+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv=atlasRect.xy+uv*atlasRect.zw;\n#endif');
    // canopyNormal is already in the batch object's coordinates. Applying the card's
    // instance matrix here would incorrectly rotate/scale it with the billboard plane.
    shader.vertexShader=shader.vertexShader.replace('#include <defaultnormal_vertex>','vec3 transformedNormal=normalMatrix*canopyNormal;');
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`
      #ifdef USE_INSTANCING
      mat4 leafMV=modelViewMatrix*instanceMatrix;
      vec3 leafCenter=leafMV[3].xyz;
      vec3 sourceR=leafMV[0].xyz,sourceU=leafMV[1].xyz;
      vec2 leafDimensions=vec2(length(sourceR),length(sourceU));
      #else
      vec3 leafCenter=(modelViewMatrix*vec4(cardCenter,1.0)).xyz;
      vec3 sourceR=mat3(modelViewMatrix)*cardRight,sourceU=mat3(modelViewMatrix)*cardUp;
      vec2 leafDimensions=cardSize*vec2(length(sourceR),length(sourceU));
      #endif
      vec3 leafR=normalize(sourceR),leafU=normalize(sourceU);
      vec3 faceR=vec3(cos(leafRoll),sin(leafRoll),0.0),faceU=vec3(-sin(leafRoll),cos(leafRoll),0.0);
      leafR=normalize(mix(leafR,faceR,${bias.toFixed(3)}));
      leafU=normalize(mix(leafU,faceU,${bias.toFixed(3)}));
      leafU=normalize(leafU-leafR*dot(leafR,leafU));
      vec3 leafOffset=leafR*transformed.x*leafDimensions.x+leafU*transformed.y*leafDimensions.y;
      leafOffset.z+=sin(leafTime*1.15+leafPhase)*leafWind*transformed.y;
      vec4 mvPosition=vec4(leafCenter+leafOffset,1.0);
      ${vertexLighting?`vec3 worldN=inverseTransformDirection(normalize(normalMatrix*canopyNormal),viewMatrix);
      vec3 hemi=mix(vec3(.35,.43,.32),vec3(.80,.89,.96),worldN.y*.5+.5);
      canopyLight=hemi*.9+vec3(1.0,.86,.65)*max(0.0,dot(worldN,normalize(vec3(-28.0,46.0,24.0))))*.95+vec3(.53,.68,.80)*max(0.0,dot(worldN,normalize(vec3(30.0,18.0,-35.0))))*.3;`:''}
      gl_Position=projectionMatrix*mvPosition;
      if(dot(normalize(normalMatrix*canopyNormal),normalize(-leafCenter)) < -.65)gl_Position=vec4(2.0,2.0,2.0,1.0);
    `);
    if(vertexLighting){shader.fragmentShader='varying vec3 canopyLight;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight*=canopyLight;\n#include <opaque_fragment>');}
    // Both sides retain the same OUTWARD scaffold normal: never flip diffuse
    // lighting when an orbit reveals the reverse of an alpha-tested card.
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>',THREE.ShaderChunk.normal_fragment_begin.replace('normal *= faceDirection;','/* fixed outward transferred normal */'));
  };
  material.customProgramCacheKey=()=>`wildloom-transferred-leaves-v2-${material.type}-${bias}-${vertexLighting}`;
}
export function canopyBillboardMaterial(seed:string,performance=false,wireframe=false,shared?:{atlas:FoliageAtlas;texture:THREE.CanvasTexture},far=false){
  const atlas=shared?.atlas??getFoliageAtlas(seed,performance?256:512,true),texture=shared?.texture??new THREE.CanvasTexture(atlas.canvas);
  if(!shared){texture.colorSpace=THREE.SRGBColorSpace;texture.mipmaps=coverageMipmaps(atlas);texture.generateMipmaps=false;texture.anisotropy=2;}
  const common={vertexColors:true,map:texture,alphaTest:.32,depthWrite:true,transparent:false,side:THREE.DoubleSide,wireframe};
  const material=new THREE.MeshBasicMaterial(common);
  const time={value:0},amplitude={value:0};installCanopyShader(material,time,amplitude,far?.68:.38,true);
  return {atlas,texture,material,time,amplitude};
}
