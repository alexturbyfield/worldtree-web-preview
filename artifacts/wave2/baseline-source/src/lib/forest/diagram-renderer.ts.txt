import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import type {SceneRecipe} from './recipe';
import {terrainHeight} from './recipe';
import {woodGeometry} from './tree';
import {presets} from './presets';
import {randomSource} from './random';
export interface RenderStats {calls:number;triangles:number;quality:string;lod:string;frames:number;camera:string}
export interface CameraView {position:[number,number,number];target:[number,number,number]}
export function mountForest(host:HTMLDivElement,recipe:SceneRecipe,onPick:(index:number|null)=>void,onStats:(stats:RenderStats)=>void,onError:(message:string)=>void,view?:CameraView){
  const mobile=matchMedia('(pointer: coarse)').matches||host.clientWidth<600;
  const renderer=new THREE.WebGLRenderer({antialias:!mobile,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:2));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  renderer.domElement.setAttribute('aria-label','Interactive procedural forest. Drag to orbit; pinch to zoom; tap a tree to inspect.');renderer.domElement.setAttribute('role','img');
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#dbe7e4');scene.fog=new THREE.Fog('#dbe7e4',100,230);
  const camera=new THREE.PerspectiveCamera(47,1,.3,350);camera.position.set(51,35,65);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,7,0);controls.enableDamping=true;controls.dampingFactor=.09;controls.minDistance=12;controls.maxDistance=175;controls.maxPolarAngle=Math.PI*.49;controls.minPolarAngle=.12;
  controls.touches.ONE=THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
  if(view){camera.position.set(...view.position);controls.target.set(...view.target);}
  scene.add(new THREE.HemisphereLight('#edf6ff','#64734d',2.5));
  const sun=new THREE.DirectionalLight('#fff1cf',3.1);sun.position.set(-35,65,25);sun.castShadow=true;sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);sun.shadow.camera.left=-65;sun.shadow.camera.right=65;sun.shadow.camera.top=65;sun.shadow.camera.bottom=-65;sun.shadow.camera.far=160;sun.shadow.normalBias=.12;sun.shadow.bias=-.0002;scene.add(sun);scene.add(sun.target);
  const arid=recipe.ecoregion?.BIOME_NUM===13,ice=recipe.ecoregion?.ECO_ID===0;
  const ground=new THREE.PlaneGeometry(100,100,40,40);ground.rotateX(-Math.PI/2);
  const pos=ground.getAttribute('position'),colors:number[]=[];
  const soil=new THREE.Color(ice?'#dce4df':arid?'#b9a373':'#7e8c57'),trail=new THREE.Color(ice?'#becacb':arid?'#c9b68a':'#aa9c75');
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,terrainHeight(x,z,recipe.seed));const path=Math.abs(x-3*Math.sin(z*.045))<2.5;const c=(path?trail:soil).clone().multiplyScalar(.94+.06*Math.sin(x*.5+z*.3));colors.push(c.r,c.g,c.b);}
  ground.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));ground.computeVertexNormals();
  const terrain=new THREE.Mesh(ground,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));terrain.receiveShadow=true;scene.add(terrain);
  // Underside gives the 100 m tile a readable edge without a downloaded texture.
  const edge=new THREE.Mesh(new THREE.BoxGeometry(100,3,100),new THREE.MeshStandardMaterial({color:ice?'#a8b7b5':'#675d44',roughness:1}));edge.position.y=-3;scene.add(edge);
  const leafGeometry=new THREE.IcosahedronGeometry(1,mobile?0:1),woodMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95}),leafMaterial=new THREE.MeshStandardMaterial({vertexColors:false,roughness:1,flatShading:true});
  const pickables:THREE.Object3D[]=[],lodGroups:THREE.Group[]=[];
  const dummy=new THREE.Object3D(),tint=new THREE.Color();
  for(const far of [false,true]){
    const group=new THREE.Group();lodGroups.push(group);scene.add(group);
    if(!recipe.trees.length)continue;
    const {geometry,faces}=woodGeometry(recipe.trees.map(t=>({model:t.model,position:t.position,rotation:t.rotation})),far);
    const wood=new THREE.Mesh(geometry,woodMaterial);wood.castShadow=true;wood.userData.faces=faces;group.add(wood);pickables.push(wood);
    const leaves=recipe.trees.flatMap(t=>t.model.foliage.filter((_,i)=>!far||i%4===0).map(f=>({t,f})));
    const foliage=new THREE.InstancedMesh(leafGeometry,leafMaterial,leaves.length),ids:number[]=[];
    leaves.forEach(({t,f},i)=>{
      const [x,y,z]=f.position,c=Math.cos(t.rotation),s=Math.sin(t.rotation),boost=far?1.35:1;
      dummy.position.set(x*c-z*s+t.position[0],y+t.position[1],x*s+z*c+t.position[2]);dummy.rotation.set(0,t.rotation,0);dummy.scale.set(f.scale[0]*boost,f.scale[1]*boost,f.scale[2]*boost);dummy.updateMatrix();foliage.setMatrixAt(i,dummy.matrix);foliage.setColorAt(i,tint.set(presets[t.species.visual.presetId].leafColor).multiplyScalar(f.tint));ids.push(t.index);
    });
    foliage.instanceMatrix.needsUpdate=true;if(foliage.instanceColor)foliage.instanceColor.needsUpdate=true;foliage.computeBoundingSphere();foliage.castShadow=!mobile;foliage.userData.ids=ids;group.add(foliage);pickables.push(foliage);
  }
  // Shared procedural grass tufts; no wind animation or per-frame geometry work.
  if(!ice){
    const tuftGeometry=new THREE.ConeGeometry(.25,.6,3),tuftMaterial=new THREE.MeshStandardMaterial({color:arid?'#8c8253':'#65764a',roughness:1});
    const tufts=new THREE.InstancedMesh(tuftGeometry,tuftMaterial,220),rand=randomSource(recipe.seed+'|ground');
    for(let i=0;i<220;i++){const x=(rand()-.5)*98,z=(rand()-.5)*98;dummy.position.set(x,terrainHeight(x,z,recipe.seed)+.15,z);dummy.rotation.set(0,rand()*6.28,0);dummy.scale.setScalar(.5+rand());dummy.updateMatrix();tufts.setMatrixAt(i,dummy.matrix);}scene.add(tufts);
  }
  const ring=new THREE.Mesh(new THREE.RingGeometry(1.15,1.45,32),new THREE.MeshBasicMaterial({color:'#ffe4a0',side:THREE.DoubleSide,depthTest:false}));ring.rotation.x=-Math.PI/2;ring.renderOrder=10;ring.visible=false;scene.add(ring);
  let dirty=true,frame=0,stopped=false,lastStats='',lastLod=false;
  const invalidate=()=>{dirty=true;};controls.addEventListener('change',invalidate);
  const resize=()=>{if(!host.clientWidth||!host.clientHeight)return;camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);dirty=true;};
  const observer=new ResizeObserver(resize);observer.observe(host);resize();controls.update();
  const raycaster=new THREE.Raycaster(),pointers=new Set<number>();let down:{x:number;y:number}|null=null;
  const pointerDown=(e:PointerEvent)=>{pointers.add(e.pointerId);down=pointers.size===1?{x:e.clientX,y:e.clientY}:null;};
  const pointerCancel=(e:PointerEvent)=>{pointers.delete(e.pointerId);down=null;};
  const pointerUp=(e:PointerEvent)=>{pointers.delete(e.pointerId);if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>7){down=null;return;}down=null;const rect=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);
    const hit=raycaster.intersectObjects(pickables.filter(o=>o.parent?.visible),false)[0];
    if(!hit){onPick(null);return;}if(hit.instanceId!==undefined){onPick(hit.object.userData.ids[hit.instanceId]);return;}
    const range=hit.object.userData.faces?.find((f:{end:number})=>(hit.faceIndex??0)<f.end);onPick(range?.treeIndex??null);
  };
  renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointercancel',pointerCancel);
  const lost=(e:Event)=>{e.preventDefault();stopped=true;onError('The graphics context was lost. Reload the explorer to restore 3D; your scene link and ecological recipe are preserved.');};renderer.domElement.addEventListener('webglcontextlost',lost);
  function animate(){if(stopped)return;frame=requestAnimationFrame(animate);controls.update();if(!dirty)return;dirty=false;
    const far=camera.position.distanceTo(controls.target)>(mobile?95:125);lodGroups[0].visible=!far;lodGroups[1].visible=far;if(far!==lastLod){renderer.shadowMap.needsUpdate=true;lastLod=far;}
    renderer.render(scene,camera);
    const cameraText=camera.position.toArray().map(n=>n.toFixed(2)).join(',');
    const statKey=`${renderer.info.render.calls}|${far}|${cameraText}`;
    if(lastStats!==statKey){lastStats=statKey;onStats({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,quality:mobile?'mobile':'desktop',lod:far?'distant':'detailed',frames:renderer.info.render.frame,camera:cameraText});}
  }animate();
  return {
    view():CameraView{return {position:camera.position.toArray() as CameraView['position'],target:controls.target.toArray() as CameraView['target']};},
    highlight(index:number|null){const tree=recipe.trees.find(t=>t.index===index);ring.visible=!!tree;if(tree){ring.position.set(...tree.position);ring.position.y+=.12;ring.scale.setScalar(Math.max(1,tree.model.parameters.trunkRadius*2));}dirty=true;},
    focus(index:number){const t=recipe.trees.find(t=>t.index===index);if(!t)return;controls.target.set(t.position[0],t.position[1]+t.model.dimensions.height*.4,t.position[2]);camera.position.set(t.position[0]+15,t.position[1]+t.model.dimensions.height*.7+4,t.position[2]+20);controls.update();dirty=true;},
    dispose(){stopped=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);renderer.domElement.removeEventListener('pointercancel',pointerCancel);renderer.domElement.removeEventListener('webglcontextlost',lost);
      const geometries=new Set<THREE.BufferGeometry>([leafGeometry]),materials=new Set<THREE.Material>([woodMaterial,leafMaterial]);scene.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}if(o instanceof THREE.InstancedMesh)o.dispose();});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());sun.shadow.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();},
  };
}
