import * as T from 'three';
import {painterlyGroundTile,grassTuftAtlas,mountEnvironmentGround,installTreeAttention,environmentMasks} from '../../src/lib/forest/environment-foundations';
import {libraryFoliageBatch} from '../../src/lib/forest/library';
import {paintedWoodGeometry,brushTexture} from '../../src/lib/forest/paint-assets';
import {terrainHeight,type SceneRecipe} from '../../src/lib/forest/recipe';
import {dressEncounter,type EncounterRecipe} from '../../src/lib/forest/encounter';

function assets(){
  const tile=painterlyGroundTile(),atlas=grassTuftAtlas(),g=tile.getContext('2d')!,data=g.getImageData(0,0,tile.width,tile.height).data;
  let edgeError=0;
  for(let i=0;i<tile.width;i++)for(let channel=0;channel<3;channel++)edgeError=Math.max(edgeError,Math.abs(data[(i*tile.width)*4+channel]-data[(i*tile.width+tile.width-1)*4+channel]),Math.abs(data[i*4+channel]-data[((tile.height-1)*tile.width+i)*4+channel]));
  const tiled=document.createElement('canvas');tiled.width=tiled.height=tile.width*3;const ctx=tiled.getContext('2d')!;
  for(let y=0;y<3;y++)for(let x=0;x<3;x++)ctx.drawImage(tile,x*tile.width,y*tile.height);
  return {tile:tile.toDataURL(),atlas:atlas.toDataURL(),tiled:tiled.toDataURL(),edgeError,deterministicTile:tile.toDataURL()===painterlyGroundTile().toDataURL(),deterministicAtlas:atlas.toDataURL()===grassTuftAtlas().toDataURL(),worldMasks:[0,7,14,21].map(x=>environmentMasks(x,0,'29',{x:0,z:5,radiusX:11,radiusZ:18}))};
}
function setup(width:number,height:number){
  const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.setSize(width,height);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  const scene=new T.Scene();scene.background=new T.Color('#e3e9dd');
  const camera=new T.PerspectiveCamera(38,width/height,.1,200);
  scene.add(new T.HemisphereLight('#e7f3ff','#b8c5a3',2.3));
  const sun=new T.DirectionalLight('#ffedc2',3.2);sun.position.set(-28,46,24);scene.add(sun);
  const fill=new T.DirectionalLight('#bed4e6',.95);fill.position.set(30,18,-35);scene.add(fill);
  return {renderer,scene,camera};
}
function finish(renderer:T.WebGLRenderer,scene:T.Scene,camera:T.Camera){
  renderer.render(scene,camera);const png=renderer.domElement.toDataURL(),counters={calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
  const textures=new Set<T.Texture>(),materials=new Set<T.Material>(),geometries=new Set<T.BufferGeometry>();
  scene.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);if(o instanceof T.InstancedMesh)o.dispose();for(const material of Array.isArray(o.material)?o.material:[o.material]){materials.add(material);for(const v of Object.values(material))if(v instanceof T.Texture)textures.add(v);if(material instanceof T.ShaderMaterial)for(const v of Object.values(material.uniforms))if(v.value instanceof T.Texture)textures.add(v.value);}}});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();return {png,...counters};
}
function grass(recipe:SceneRecipe,mobile=false){
  const {renderer,scene,camera}=setup(1100,650);scene.fog=new T.Fog('#c5d9cc',42,145);
  const geo=new T.PlaneGeometry(100,100,32,32);geo.rotateX(-Math.PI/2);const p=geo.getAttribute('position');for(let i=0;i<p.count;i++)p.setY(i,terrainHeight(p.getX(i),p.getZ(i),recipe.seed));geo.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(p.count*3).fill(1),3));geo.computeVertexNormals();scene.add(new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:1})));
  const dispose=mountEnvironmentGround(scene,recipe,{x:0,z:5,radiusX:11,radiusZ:18},mobile);
  const x=-18,z=24;camera.position.set(x,terrainHeight(x,z,recipe.seed)+1.3,z);camera.lookAt(x-1,terrainHeight(x-1,z-5,recipe.seed)+.35,z-5);
  renderer.render(scene,camera);const scatterCounters={calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
  // Diagnostic arrangement only: nine actual instance transforms, re-positioned for close inspection.
  const near=scene.getObjectByName('foundation-grass-near') as T.InstancedMesh,far=scene.getObjectByName('foundation-grass-far')!;
  far.visible=false;near.count=9;const matrix=new T.Matrix4();
  for(let i=0;i<9;i++){near.getMatrixAt(i,matrix);const gx=(i%3-1)*1.05,gz=(Math.floor(i/3)-1)*1.05;matrix.setPosition(gx,terrainHeight(gx,gz,recipe.seed)-.045,gz);near.setMatrixAt(i,matrix);}near.instanceMatrix.needsUpdate=true;near.computeBoundingSphere();
  const floor=terrainHeight(0,0,recipe.seed);camera.position.set(3,floor+2.1,4.6);camera.lookAt(0,floor+.45,0);
  const environment=scene.userData.environment;const result=finish(renderer,scene,camera);dispose();return {...result,environment,scatterCounters,diagnostic:'Nine sampled tuft transforms arranged for card inspection; scatter counters measured before re-positioning.'};
}
function tree(recipe:SceneRecipe,presetId:string,depth:number,focalWeight=0){
  const source=recipe.trees.find(t=>t.model.presetId===presetId&&t.studio)!;
  const specimen={...source,position:[0,0,0] as [number,number,number],rotation:0};
  const {renderer,scene,camera}=setup(560,680),d=specimen.model.dimensions;scene.fog=new T.Fog('#c5d9cc',42,145);
  const settings={studyDepth:depth,focalCenter:new T.Vector3(0,d.height*.5,0),focalRadii:new T.Vector3(d.crownWidth,d.height,d.crownDepth),focalWeight};
  const foliage=libraryFoliageBatch([specimen],presetId,recipe.appearanceSeed,false,false);installTreeAttention(foliage.mesh.material,'library',settings);scene.add(foliage.mesh);
  const {geometry}=paintedWoodGeometry([{model:{...specimen.model,segments:specimen.model.segments.filter(s=>s.depth<=2)},position:[0,0,0],rotation:0}],false,false);
  const woodMaterial=new T.MeshStandardMaterial({map:brushTexture('bark'),vertexColors:true,roughness:1});installTreeAttention(woodMaterial,'wood',settings);scene.add(new T.Mesh(geometry,woodMaterial));
  const distance=Math.max(d.height*1.8,d.crownWidth*2.4);camera.position.set(distance*.3,d.height*.52,distance);camera.lookAt(0,d.height*.48,0);
  return {...finish(renderer,scene,camera),identity:{presetId,structure:source.seed,appearance:source.appearanceSeed,segments:source.model.segments.length,fronds:source.studio!.fronds.length},depth,focalWeight};
}
function preservation(recipe:EncounterRecipe){
  const create=(enabled:boolean)=>{
    const {renderer,scene,camera}=setup(320,240),geo=new T.PlaneGeometry(100,100,2,2);geo.rotateX(-Math.PI/2);geo.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(geo.getAttribute('position').count*3).fill(1),3));scene.add(new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true})));
    const dispose=dressEncounter(scene,recipe,false,enabled);
    const shrubs=scene.children.find(o=>o instanceof T.InstancedMesh&&o.count===65) as T.InstancedMesh,rocks=scene.children.find(o=>o instanceof T.InstancedMesh&&o.count===32) as T.InstancedMesh;
    const sky=scene.children.find(o=>o instanceof T.Mesh&&o.geometry.type==='SphereGeometry') as T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>;
    const stable={shrubs:Array.from(shrubs.instanceMatrix.array),rocks:Array.from(rocks.instanceMatrix.array),rockGeometry:Array.from(rocks.geometry.getAttribute('position').array),sky:(sky.material.map!.image as HTMLCanvasElement).toDataURL()};
    const grass=scene.children.filter(o=>o.name.startsWith('foundation-grass')).map(o=>Array.from((o as T.InstancedMesh).instanceMatrix.array));
    camera.position.set(0,10,34);camera.lookAt(0,0,0);finish(renderer,scene,camera);dispose();return {stable,grass};
  };
  const old=create(false),current=create(true),repeat=create(true);
  return {dressingCompositionPreserved:JSON.stringify(old.stable)===JSON.stringify(current.stable),grassTransformsDeterministic:JSON.stringify(current.grass)===JSON.stringify(repeat.grass),fallbackDressingRendered:true};
}
Object.assign(window,{foundationStudy:{assets,grass,tree,preservation}});
