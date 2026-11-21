import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import type {SceneRecipe} from './recipe';
import {terrainHeight} from './recipe';
import {brushTexture,paintedWoodGeometry} from './paint-assets';
import {generateFoliageCards,selectFoliageCards} from './foliage-cards';
import {foliageMaterial,foliageCardGeometry,cardInstanceAttributes,installCardShader,cardHitVisible} from './foliage-material';
import type {PaintedTree} from './painterly';
import type {BenchmarkResult,CameraView,RenderOptions,RenderStats} from './render-types';

export function mountPaintedForest(host:HTMLDivElement,recipe:SceneRecipe,onPick:(index:number|null)=>void,onStats:(stats:RenderStats)=>void,onError:(message:string)=>void,view?:CameraView,options:RenderOptions={}) {
  const start=performance.now(),lab=!!options.lab,coarse=matchMedia('(pointer: coarse)').matches||host.clientWidth<600;
  const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'low-power'});
  const gl=renderer.getContext(),debugInfo=gl.getExtension('WEBGL_debug_renderer_info');
  const rendererName=String(debugInfo?gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER));
  const software=/swiftshader|llvmpipe|software|softpipe/i.test(rendererName),mobile=coarse||(!lab&&software);
  const quality=software?(coarse?'mobile / software':lab?'studio / software':'software economy'):mobile?'mobile':'desktop';
  const performanceMode=recipe.renderMode==='performance';
  const maxPixelRatio=lab?(coarse?1.25:1.75):software?(performanceMode?.7:.85):coarse?(performanceMode?.85:1):1.75;
  renderer.setPixelRatio(Math.min(devicePixelRatio,maxPixelRatio));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  renderer.domElement.setAttribute('aria-label','Interactive painterly trees. Drag to orbit, pinch to zoom, tap a tree to inspect.');renderer.domElement.setAttribute('role','img');host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color(lab?'#e3e9dd':'#dde7de');scene.fog=new THREE.Fog(lab?'#e3e9dd':'#dde7de',lab?110:95,lab?260:230);
  const camera=new THREE.PerspectiveCamera(lab?38:47,1,.2,350),controls=new OrbitControls(camera,renderer.domElement);
  const model=recipe.trees[0]?.model,treeHeight=model?.dimensions.height??18;
  camera.position.set(...(lab?[treeHeight*1.05,treeHeight*.65,treeHeight*1.5]:[53,37,67]) as [number,number,number]);
  controls.target.set(0,lab?treeHeight*.43:6,0);controls.enableDamping=true;controls.dampingFactor=.1;controls.minDistance=lab?.8:12;controls.maxDistance=lab?90:175;controls.maxPolarAngle=Math.PI*.49;controls.minPolarAngle=.08;
  controls.touches.ONE=THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
  if(view){camera.position.set(...view.position);controls.target.set(...view.target);}
  scene.add(new THREE.HemisphereLight('#e7f3ff','#b3b992',2.4));
  const fill=new THREE.DirectionalLight('#afc9db',.8);fill.position.set(30,18,-35);scene.add(fill);
  const sun=new THREE.DirectionalLight('#ffedc2',3.2);sun.position.set(-28,46,24);sun.castShadow=true;
  const extent=lab?24:64;Object.assign(sun.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent,far:150});sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);sun.shadow.normalBias=.12;sun.shadow.bias=-.0003;scene.add(sun);scene.add(sun.target);
  const arid=recipe.ecoregion?.BIOME_NUM===13,ice=recipe.ecoregion?.ECO_ID===0;
  if(lab){
    const ground=new THREE.Mesh(new THREE.CylinderGeometry(10,10.5,.5,64),new THREE.MeshStandardMaterial({color:'#a7ae83',roughness:1}));ground.position.y=-.25;ground.receiveShadow=true;scene.add(ground);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:'#e3e7d7',roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.55;floor.receiveShadow=true;scene.add(floor);
  }else{
    const geometry=new THREE.PlaneGeometry(100,100,32,32);geometry.rotateX(-Math.PI/2);const p=geometry.getAttribute('position'),colors:number[]=[];
    const soil=new THREE.Color(ice?'#dce2df':arid?'#baa47a':'#929e68'),path=new THREE.Color(ice?'#c5d0cc':arid?'#c9b384':'#bdaf84');
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,terrainHeight(x,z,recipe.seed));const t=Math.max(0,1-Math.abs(x-3*Math.sin(z*.045))/3);const c=soil.clone().lerp(path,t).multiplyScalar(.96+Math.sin(x*.13+z*.19)*.045);colors.push(c.r,c.g,c.b);}
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
    const ground=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));ground.receiveShadow=true;scene.add(ground);
    const edge=new THREE.Mesh(new THREE.BoxGeometry(100,3,100),new THREE.MeshStandardMaterial({color:ice?'#aab7b1':'#7a7154',roughness:1}));edge.position.y=-3;scene.add(edge);
  }
  const bark=brushTexture('bark'),woodMaterial=new THREE.MeshStandardMaterial({map:bark,vertexColors:true,roughness:1,wireframe:options.debug==='wireframe'});
  const pickables:THREE.Object3D[]=[],lods:THREE.Group[]=[],dummy=new THREE.Object3D(),cardCounts:number[]=[];
  const debugSkeleton=options.debug==='skeleton';
  const foliageResources:ReturnType<typeof foliageMaterial>[]=[];
  const allCards=recipe.trees.flatMap(t=>(t.foliageCards??generateFoliageCards(t.model as PaintedTree,recipe.art.foliageDetail??.65)).map(card=>({t,card})));
  if(debugSkeleton){
    const points:number[]=[];for(const t of recipe.trees)for(const segment of t.model.segments)for(const p of [segment.a,segment.b])points.push(p[0]+t.position[0],p[1]+t.position[1],p[2]+t.position[2]);
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));scene.add(new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:'#375c48'})));
  }else for(const far of [false,true]){
    const group=new THREE.Group();lods.push(group);scene.add(group);if(!recipe.trees.length){cardCounts.push(0);continue;}
    const {geometry,faces}=paintedWoodGeometry(recipe.trees.map(t=>({model:t.model,position:t.position,rotation:t.rotation})),far,mobile);
    const wood=new THREE.Mesh(geometry,woodMaterial);wood.castShadow=true;wood.userData.faces=faces;group.add(wood);pickables.push(wood);
    const resource=foliageMaterial(recipe.appearanceSeed,performanceMode||mobile,far,options.debug==='wireframe',foliageResources[0]);foliageResources.push(resource);
    const data=allCards.filter(({card})=>selectFoliageCards([card],performanceMode,far).length>0),cards=data.map(d=>d.card);cardCounts.push(cards.length);
    if(!cards.length)continue;
    const cardGeometry=foliageCardGeometry();cardInstanceAttributes(cardGeometry,cards);
    const mesh=new THREE.InstancedMesh(cardGeometry,resource.material,cards.length),ids:number[]=[];
    data.forEach(({t,card},i)=>{
      const [x,y,z]=card.position,c=Math.cos(t.rotation),s=Math.sin(t.rotation),boost=far?1.14:1;
      dummy.position.set(x*c-z*s+t.position[0],y+t.position[1],x*s+z*c+t.position[2]);
      dummy.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),t.rotation).multiply(new THREE.Quaternion(...card.rotation));
      dummy.scale.set(card.size[0]*boost,card.size[1]*boost,card.size[0]*boost);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new THREE.Color(card.color));ids.push(t.index);
    });
    mesh.computeBoundingSphere();mesh.userData.ids=ids;mesh.userData.cards=cards;mesh.userData.atlas=resource.atlas;group.add(mesh);pickables.push(mesh);
    if(options.debug==='cards'){
      const outlineMaterial=new THREE.MeshBasicMaterial({color:'#d89239',wireframe:true,depthTest:false});installCardShader(outlineMaterial,resource.time,resource.amplitude);
      const outlines=new THREE.InstancedMesh(cardGeometry,outlineMaterial,cards.length);outlines.instanceMatrix=mesh.instanceMatrix;outlines.renderOrder=4;outlines.frustumCulled=false;group.add(outlines);
    }
  }
  const ring=new THREE.Mesh(new THREE.RingGeometry(.95,1.22,32),new THREE.MeshBasicMaterial({color:'#ffdb8b',side:THREE.DoubleSide,depthTest:false}));ring.rotation.x=-Math.PI/2;ring.visible=false;ring.renderOrder=10;scene.add(ring);
  let dirty=true,frame=0,stopped=false,lastReport=0,lastFar=false,frameCount=0,lastWindFrame=0;
  const windEnabled=(recipe.wind??true)&&allCards.length>0&&!debugSkeleton&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buildMs=performance.now()-start;
  let measurement:{start:number;previous:number;intervals:number[];cpu:number[];resolve:(r:BenchmarkResult|null)=>void}|null=null;
  renderer.debug.onShaderError=()=>{stopped=true;measurement?.resolve(null);measurement=null;onError('The painterly material could not compile on this graphics driver. Use the Diagram renderer to try the original simpler material.');};
  const change=()=>{dirty=true;};controls.addEventListener('change',change);
  let fitted=false;
  const resize=()=>{if(!host.clientWidth||!host.clientHeight)return;camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);
    if(lab&&!view&&!fitted&&model){
      const d=model.dimensions;
      const vertical=THREE.MathUtils.degToRad(camera.fov),horizontal=2*Math.atan(Math.tan(vertical/2)*camera.aspect);
      const distance=(Math.max(d.height/2/Math.tan(vertical/2),Math.max(d.crownWidth,d.crownDepth)/2/Math.tan(horizontal/2))+Math.min(d.crownWidth,d.crownDepth)*.4)*1.08;
      controls.maxDistance=Math.max(100,distance*1.8);controls.target.set(0,d.height*.48,0);camera.position.copy(controls.target).add(new THREE.Vector3(.62,.24,1).normalize().multiplyScalar(distance));fitted=true;
    }dirty=true;};
  const observer=new ResizeObserver(resize);observer.observe(host);resize();controls.update();
  const ray=new THREE.Raycaster(),pointers=new Set<number>();let down:{x:number;y:number}|null=null;
  const pointerDown=(e:PointerEvent)=>{pointers.add(e.pointerId);down=pointers.size===1?{x:e.clientX,y:e.clientY}:null;};
  const pointerCancel=(e:PointerEvent)=>{pointers.delete(e.pointerId);down=null;};
  const pointerUp=(e:PointerEvent)=>{
    pointers.delete(e.pointerId);if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>7){down=null;return;}down=null;
    const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
    const hit=ray.intersectObjects(pickables.filter(o=>o.parent?.visible),false).find(h=>h.instanceId===undefined||!h.uv||cardHitVisible(h.object.userData.atlas,h.object.userData.cards[h.instanceId],h.uv));if(!hit){onPick(null);return;}
    if(hit.instanceId!==undefined)onPick(hit.object.userData.ids[hit.instanceId]);else onPick(hit.object.userData.faces?.find((f:{end:number})=>(hit.faceIndex??0)<f.end)?.treeIndex??null);
  };
  const lost=(e:Event)=>{e.preventDefault();measurement?.resolve(null);measurement=null;stopped=true;onError('The WebGL context was lost. Reload to restore the scene; its seeds and ecological recipe are preserved.');};
  renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointercancel',pointerCancel);renderer.domElement.addEventListener('webglcontextlost',lost);
  function animate(){
    if(stopped)return;frame=requestAnimationFrame(animate);controls.update();const elapsed=performance.now();const windDue=windEnabled&&elapsed-lastWindFrame>(mobile?50:33);if(!dirty&&!measurement&&!windDue)return;dirty=false;lastWindFrame=elapsed;
    foliageResources.forEach(r=>{r.time.value=(elapsed-start)/1000;r.amplitude.value=windEnabled?.045:0;});
    const far=!lab&&camera.position.distanceTo(controls.target)>(mobile?76:125);lods.forEach((g,i)=>g.visible=far?i===1:i===0);
    if(far!==lastFar){renderer.shadowMap.needsUpdate=true;lastFar=far;}
    const now=performance.now(),renderStart=now;renderer.render(scene,camera);if(stopped)return;const cpu=performance.now()-renderStart;frameCount++;
    if(now-lastReport>180||frameCount===1){lastReport=now;onStats({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,quality,lod:far?'distant':'detailed',frames:frameCount,camera:camera.position.toArray().map(n=>n.toFixed(2)).join(','),buildMs,renderCpuMs:cpu,geometries:renderer.info.memory.geometries,textureCount:renderer.info.memory.textures,foliageCards:cardCounts[far?1:0]??0,foliageMasses:0,wind:windEnabled,atlasSize:foliageResources[0]?`${foliageResources[0].atlas.width} × ${foliageResources[0].atlas.height}`:undefined});}
    if(measurement){
      if(measurement.previous)measurement.intervals.push(now-measurement.previous);measurement.previous=now;measurement.cpu.push(cpu);
      if(now-measurement.start>=5000){
        const m=measurement;measurement=null;controls.autoRotate=false;const times=[...m.intervals].sort((a,b)=>a-b),duration=now-m.start;
        m.resolve({durationMs:duration,frames:m.intervals.length,fps:m.intervals.length/(duration/1000),medianFrameMs:times[Math.floor(times.length*.5)]??0,p95FrameMs:times[Math.floor(times.length*.95)]??0,meanRenderCpuMs:m.cpu.reduce((a,b)=>a+b,0)/m.cpu.length,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,quality,renderer:rendererName,viewport:`${host.clientWidth} × ${host.clientHeight}`,pixelRatio:renderer.getPixelRatio(),foliageCards:cardCounts[lastFar?1:0]??0,foliageMasses:0,method:'5 second continuous orbit; browser frame intervals and CPU render submission time. Not a GPU timer or physical-device benchmark.'});
      }
    }
  }animate();
  return {
    focusFoliage(){
      const t=recipe.trees[0];if(!t||!allCards.length)return;
      const candidates=allCards.filter(d=>d.t.index===t.index&&d.card.position[1]<treeHeight*.7&&d.card.position[1]>treeHeight*.16);
      const chosen=[...(candidates.length?candidates:allCards)].sort((a,b)=>Math.hypot(...b.card.position.filter((_,i)=>i!==1))-Math.hypot(...a.card.position.filter((_,i)=>i!==1)))[0];
      const card=chosen.card,q=new THREE.Quaternion(...card.rotation),center=new THREE.Vector3(...card.position).add(new THREE.Vector3(card.size[0]*.48,0,0).applyQuaternion(q));
      const normal=new THREE.Vector3(0,0,1).applyQuaternion(q);if(normal.y<0)normal.negate();normal.add(new THREE.Vector3(center.x,0,center.z).normalize().multiplyScalar(.2)).normalize();
      controls.target.copy(center);camera.position.copy(center).addScaledVector(normal,Math.max(2.2,card.size[0]*1.75));controls.update();dirty=true;
    },
    frameTree(){fitted=false;view=undefined;resize();controls.update();dirty=true;},
    view():CameraView{return {position:camera.position.toArray() as CameraView['position'],target:controls.target.toArray() as CameraView['target']};},
    highlight(index:number|null){const tree=recipe.trees.find(t=>t.index===index);ring.visible=!!tree;if(tree){ring.position.set(...tree.position);ring.position.y+=.13;}dirty=true;},
    focus(index:number){const t=recipe.trees.find(t=>t.index===index);if(!t)return;controls.target.set(t.position[0],t.position[1]+t.model.dimensions.height*.45,t.position[2]);camera.position.set(t.position[0]+16,t.position[1]+t.model.dimensions.height*.7,t.position[2]+24);controls.update();dirty=true;},
    benchmark():Promise<BenchmarkResult|null>{if(stopped||measurement)return Promise.resolve(null);return new Promise(resolve=>{measurement={start:performance.now(),previous:0,intervals:[],cpu:[],resolve};controls.autoRotate=true;controls.autoRotateSpeed=2;dirty=true;});},
    dispose(){
      stopped=true;measurement?.resolve(null);cancelAnimationFrame(frame);observer.disconnect();controls.dispose();
      renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);renderer.domElement.removeEventListener('pointercancel',pointerCancel);renderer.domElement.removeEventListener('webglcontextlost',lost);
      const geometries=new Set<THREE.BufferGeometry>(),allMaterials=new Set<THREE.Material>([woodMaterial,...foliageResources.map(r=>r.material)]);
      scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.LineSegments){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>allMaterials.add(m));}if(o instanceof THREE.InstancedMesh)o.dispose();});
      geometries.forEach(g=>g.dispose());allMaterials.forEach(m=>m.dispose());new Set([bark,...foliageResources.map(r=>r.texture)]).forEach(t=>t.dispose());sun.shadow.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
    },
  };
}
