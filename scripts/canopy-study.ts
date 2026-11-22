/** Isolated visual acceptance harness. Bundle with esbuild; not part of the app UI. */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {generateCanopyBillboards,ellipsoidNormal} from '../src/lib/forest/canopy-billboards';
import {batchCanopyBillboards,canopyBillboardMaterial} from '../src/lib/forest/canopy-billboard-material';
import {canopyGeometry} from '../src/lib/forest/canopy-geometry';
import type {CanopyClump} from '../src/lib/forest/canopy';
const params=new URLSearchParams(location.search),before=params.has('before'),seed=params.get('seed')??'29',species=params.get('species')??'oak';
const mobile=innerWidth<600,renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);document.body.style.cssText='margin:0;overflow:hidden;background:#273449';
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,100);camera.position.set(0,1.1,mobile?18:10);const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.update();
scene.add(new THREE.HemisphereLight('#dfefff','#354237',1.5));const sun=new THREE.DirectionalLight('#ffe3ad',3.2);sun.position.set(-6,8,6);scene.add(sun);
const clump:CanopyClump={id:0,position:[0,0,0],scale:[2.4,1.8,2],rotation:.3,variant:1,kind:'cloud',color:'#51823d',interior:false,attachmentIndex:0,attachmentPoint:[0,0,0]};
const cards=generateCanopyBillboards([clump],species,seed,'moss',false,false,.6),resource=canopyBillboardMaterial('moss',mobile),mesh=new THREE.Mesh(batchCanopyBillboards(cards),resource.material);mesh.userData.foliageBillboards=true;
if(before){const scaffold=new THREE.Mesh(canopyGeometry('cloud',1),new THREE.MeshStandardMaterial({color:clump.color,roughness:1}));scaffold.scale.set(...clump.scale);scaffold.rotation.y=clump.rotation;scene.add(scaffold);}else scene.add(mesh);
function frame(){renderer.render(scene,camera);}controls.addEventListener('change',frame);frame();
const study={cards,clump,before,ellipsoidNormal,view(angle:number,elevation=.22){camera.position.set(Math.sin(angle)*10,elevation*10,Math.cos(angle)*10);controls.update();frame();},stats(){frame();return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,cards:cards.length,opaqueScaffoldMeshes:scene.children.filter(o=>o instanceof THREE.Mesh&&!o.userData.foliageBillboards).length};},pixels(){frame();return renderer.domElement.toDataURL('image/png');}};
Object.assign(window,{canopyStudy:study});document.body.dataset.ready='true';
