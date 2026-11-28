import * as T from 'three';
import {randomSource} from './random';

/** Reuses actual near-stand geometry in a small atlas; no foreign landscape asset.
 * Cylindrical, layered patches approximate distance, not measured forest cover. */
export function mountDryWoodlandContinuation(scene:T.Scene,source:T.Group,seed:string,height:(x:number,z:number)=>number){
 const trees=source.children.filter(o=>o instanceof T.Group).slice(0,8);if(!trees.length)return()=>{};
 const rng=randomSource(seed+'|dry-woodland-distance'),geo=new T.PlaneGeometry(1,1),placements:{x:number;z:number;h:number;w:number;tile:number}[]=[];
 for(let ring=0;ring<8;ring++){
  const radius=60+ring*100,count=Math.ceil(radius*2*Math.PI/16);
  for(let k=0;k<count;k++){
   if(rng()<.06)continue;const a=(k+rng()*.7)/count*Math.PI*2,rad=radius+(rng()-.5)*45;
   const x=Math.cos(a)*rad,z=Math.sin(a)*rad-30;if(Math.hypot(x,z-34)<70)continue;placements.push({x,z,h:13+rng()*11,w:30+rng()*14,tile:Math.floor(rng()*4)});
  }
 }
 geo.setAttribute('dryTile',new T.InstancedBufferAttribute(new Float32Array(placements.map(p=>p.tile)),1));
 const mat=new T.MeshBasicMaterial({side:T.DoubleSide,alphaTest:.36,fog:true,color:'#a4aca0'});
 mat.onBeforeCompile=s=>{s.vertexShader='attribute float dryTile;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv=(uv+vec2(mod(dryTile,2.),floor(dryTile/2.)))/2.;\n#endif');s.vertexShader=s.vertexShader.replace('#include <project_vertex>',`
 vec3 center=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
 vec3 viewTo=normalize(cameraPosition-center),right=normalize(vec3(viewTo.z,0.,-viewTo.x));
 vec3 world=center+right*position.x*length(instanceMatrix[0].xyz)+vec3(0.,position.y*length(instanceMatrix[1].xyz),0.);
 vec4 mvPosition=viewMatrix*vec4(world,1.);gl_Position=projectionMatrix*mvPosition;`);};
 mat.customProgramCacheKey=()=> 'dry-source-patch-distance-v1';
 const mesh=new T.InstancedMesh(geo,mat,placements.length),o=new T.Object3D();mesh.name='dry-pilot-source-woodland-continuation';
 placements.forEach((p,i)=>{o.position.set(p.x,height(p.x,p.z)+p.h*.5-.5,p.z);o.scale.set(p.w,p.h,1);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});mesh.computeBoundingSphere();scene.add(mesh);
 let target:T.WebGLRenderTarget|undefined,baking=false;
 mesh.onBeforeRender=renderer=>{
  if(target||baking)return;baking=true;
  const rt=new T.WebGLRenderTarget(1024,1024),oldTarget=renderer.getRenderTarget(),viewport=renderer.getViewport(new T.Vector4()),scissor=renderer.getScissor(new T.Vector4()),test=renderer.getScissorTest(),clear=renderer.getClearColor(new T.Color()),alpha=renderer.getClearAlpha();
  try{
   renderer.setRenderTarget(rt);renderer.setScissorTest(false);renderer.setClearColor(0,0);renderer.clear();
   const camera=new T.OrthographicCamera(-17,17,13,-13,.1,150);camera.position.set(0,10,65);camera.lookAt(0,10,0);
   for(let tile=0;tile<4;tile++){
    const patch=new T.Scene();for(let j=0;j<3;j++){const tree=trees[(tile+j*3)%trees.length].clone(true);tree.position.set((j-1)*9,0,(j%2)*-5);tree.scale.multiplyScalar(.58+tile*.04+j*.035);tree.rotation.y=tile*1.3+j*.8;patch.add(tree);}
    scene.children.forEach(light=>{if(light instanceof T.Light){const clone=light.clone();clone.castShadow=false;patch.add(clone);}});
    renderer.setViewport(tile%2*512,Math.floor(tile/2)*512,512,512);renderer.setScissor(tile%2*512,Math.floor(tile/2)*512,512,512);renderer.setScissorTest(true);renderer.render(patch,camera);
   }
   target=rt;mat.map=rt.texture;mat.needsUpdate=true;
  }finally{renderer.setRenderTarget(oldTarget);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(test);renderer.setClearColor(clear,alpha);baking=false;}
 };
 scene.userData.dryWoodlandContinuation={patches:placements.length,atlas:[1024,1024],source:'Four patches baked from the actual unnamed near-stand geometry',limits:'Cylindrical cards approximate distant parallax; synthetic distribution, no local occurrence or measured cover claim'};
 return()=>{scene.remove(mesh);target?.dispose();geo.dispose();mat.dispose();};
}
