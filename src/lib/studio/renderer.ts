import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {studioAtlas} from './atlas';
import {createStudioStudy,studioKinds,type StudioSettings} from './groups';
import {studioGeometry} from './geometry';
import {brushTexture,paintedWoodGeometry} from '../forest/paint-assets';
import type {Point} from '../forest/tree';
const vertex=/*glsl*/`
attribute vec4 tileRect;attribute vec3 color;attribute float interior;
varying vec2 atlasUv;varying vec3 paintLight;
void main(){
  atlasUv=tileRect.xy+uv*tileRect.zw;
  vec3 N=normalize((vec4(normalize(normalMatrix*normal),0.)*viewMatrix).xyz);
  float sunlight=max(0.,dot(N,normalize(vec3(-.6,.85,.55))));
  vec3 fill=mix(vec3(.035,.13,.12),vec3(.58,.74,.57),N.y*.5+.5);
  paintLight=color*(fill+vec3(1.,.91,.73)*sunlight*.85)*interior;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}`;
const fragment=/*glsl*/`
uniform sampler2D foliageMap;uniform float metric;
varying vec2 atlasUv;varying vec3 paintLight;
void main(){
  vec4 leaf=texture2D(foliageMap,atlasUv);
  if(metric<1.5&&leaf.a<.34)discard;
  if(metric>.5){gl_FragColor=vec4(1./255.,0.,0.,1.);return;}
  gl_FragColor=vec4(leaf.rgb*paintLight,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
export interface FillReport {width:number;height:number;meanLayers:number;meanQuadLayers:number;alphaRejectedFraction:number;coverageFraction:number;peakLayers:number;saturatedPixels:number;quadPeakLayers:number;quadSaturatedPixels:number;method:string;heatmap:string}
export interface StudioMetrics {settingsKey:string;calls:number;triangles:number;surfaces:number;groups:number;buildMs:number;renderer:string;pixelRatio:number;viewport:string;fps?:number;medianFrameMs?:number;p95FrameMs?:number;meanCpuMs?:number;fill?:FillReport}
export function mountStudio(host:HTMLDivElement,q:StudioSettings,onReady:(m:StudioMetrics)=>void,onError:(m:string)=>void,previousView?:{position:Point;target:Point}){
  const start=performance.now(),mobile=host.clientWidth<650,renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});
  const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info'),rendererName=String(debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)),software=/swiftshader|llvmpipe|software/i.test(rendererName);
  renderer.setPixelRatio(Math.min(devicePixelRatio,software?(mobile?.85:1):mobile?1.25:1.5));renderer.setSize(host.clientWidth,host.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Foliage Studio 3D comparison. Drag to orbit; pinch or scroll to zoom.');
  const scene=new THREE.Scene();scene.background=new THREE.Color('#e2e8e1');
  const camera=new THREE.PerspectiveCamera(38,host.clientWidth/host.clientHeight,.05,160),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=2;controls.maxDistance=80;controls.maxPolarAngle=Math.PI*.87;
  const kinds=q.view==='all'?studioKinds:[q.view],studies=kinds.map(kind=>createStudioStudy(kind,q)),spacing=q.mode==='trees'?8:7.5,positions=kinds.map((_,i)=>(i-(kinds.length-1)/2)*spacing);
  const texture=new THREE.CanvasTexture(studioAtlas(q,mobile));texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=2;
  const material=new THREE.ShaderMaterial({uniforms:{foliageMap:{value:texture},metric:{value:0}},vertexShader:vertex,fragmentShader:fragment,side:THREE.DoubleSide,depthWrite:true,transparent:false});
  const geometry=studioGeometry(studies,positions),foliage=new THREE.Mesh(geometry,material);scene.add(foliage);
  const scaled=studies.map((s,i)=>({model:{...s.model,segments:s.segments.map(segment=>({...segment,a:segment.a.map((v,k)=>v*s.scale+s.offset[k]) as Point,b:segment.b.map((v,k)=>v*s.scale+s.offset[k]) as Point,r0:segment.r0*s.scale,r1:segment.r1*s.scale}))},position:[positions[i],0,0] as Point,rotation:0}));
  const bark=brushTexture('bark'),wood=new THREE.Mesh(paintedWoodGeometry(scaled,false,mobile).geometry,new THREE.MeshStandardMaterial({map:bark,vertexColors:true,roughness:1}));scene.add(wood);
  scene.add(new THREE.HemisphereLight('#d9e9ef','#667658',2));const sun=new THREE.DirectionalLight('#fff0d8',2.5);sun.position.set(-8,12,10);scene.add(sun);
  const bounds=geometry.boundingBox!.clone();bounds.union(new THREE.Box3().setFromObject(wood));const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
  let fitted=false;
  function fit(force=false){camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);if(fitted&&!force){dirty=true;return;}const fov=THREE.MathUtils.degToRad(camera.fov),distance=Math.max(size.y/2/Math.tan(fov/2),size.x/2/Math.tan(fov/2)/camera.aspect)+size.z*.65;controls.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(.12,.18,1).normalize().multiplyScalar(distance*1.2));if(previousView&&!force){camera.position.set(...previousView.position);controls.target.set(...previousView.target);}fitted=true;controls.update();dirty=true;}
  let dirty=true,stopped=false,frame=0;const resize=new ResizeObserver(()=>fit());resize.observe(host);fit();controls.addEventListener('change',()=>{dirty=true;});
  const base:StudioMetrics={settingsKey:JSON.stringify(q),calls:0,triangles:0,surfaces:studies.reduce((n,s)=>n+s.fronds.length,0),groups:studies.reduce((n,s)=>n+s.groups.length,0),buildMs:performance.now()-start,renderer:rendererName,pixelRatio:renderer.getPixelRatio(),viewport:`${host.clientWidth} × ${host.clientHeight}`};
  let measure:{start:number;last:number;times:number[];cpu:number[];resolve:(m:StudioMetrics)=>void}|null=null;
  function render(){renderer.render(scene,camera);base.calls=renderer.info.render.calls;base.triangles=renderer.info.render.triangles;}
  const fill=():FillReport=>{
    const width=160,height=Math.max(80,Math.round(width/ camera.aspect)),target=new THREE.WebGLRenderTarget(width,height),bytes=new Uint8Array(width*height*4),oldColor=renderer.getClearColor(new THREE.Color()),oldAlpha=renderer.getClearAlpha(),oldBackground=scene.background;
    const capture=(metric:number)=>{material.uniforms.metric.value=metric;renderer.setRenderTarget(target);renderer.setClearColor(0,0);renderer.clear();renderer.render(scene,camera);renderer.readRenderTargetPixels(target,0,0,width,height,bytes);return Array.from({length:width*height},(_,i)=>bytes[i*4]);};
    wood.visible=false;scene.background=null;material.transparent=true;material.blending=THREE.AdditiveBlending;material.depthTest=false;material.depthWrite=false;
    const alpha=capture(1),quad=capture(2);let occupied=0,sum=0,quadSum=0,peak=0,saturated=0,quadPeak=0,quadSaturated=0;
    const heat=document.createElement('canvas');heat.width=width;heat.height=height;const ctx=heat.getContext('2d')!,image=ctx.createImageData(width,height);
    alpha.forEach((n,i)=>{sum+=n;quadSum+=quad[i];quadPeak=Math.max(quadPeak,quad[i]);if(quad[i]===255)quadSaturated++;if(n)occupied++;peak=Math.max(peak,n);if(n===255)saturated++;const x=i%width,y=height-1-Math.floor(i/width),j=(y*width+x)*4,t=Math.min(1,n/14);image.data[j]=n?Math.round(40+t*215):226;image.data[j+1]=n?Math.round(175-t*125):232;image.data[j+2]=n?Math.round(190-t*165):225;image.data[j+3]=255;});ctx.putImageData(image,0,0);
    material.uniforms.metric.value=0;material.transparent=false;material.blending=THREE.NormalBlending;material.depthTest=true;material.depthWrite=true;wood.visible=true;scene.background=oldBackground;renderer.setRenderTarget(null);renderer.setClearColor(oldColor,oldAlpha);target.dispose();dirty=true;
    return {width,height,meanLayers:sum/Math.max(1,occupied),meanQuadLayers:quadSum/Math.max(1,occupied),alphaRejectedFraction:quadSum?1-sum/quadSum:0,coverageFraction:occupied/(width*height),peakLayers:peak,saturatedPixels:saturated,quadPeakLayers:quadPeak,quadSaturatedPixels:quadSaturated,method:'Depth-disabled additive foliage coverage at sampled resolution; alpha layers per occupied pixel and quad rejection estimate. Not hardware fragment-invocation counters. Counts cap at 255; excludes wood. Readback excluded from orbit frame timings.',heatmap:heat.toDataURL()};
  };
  renderer.debug.onShaderError=()=>{stopped=true;onError('This device could not compile the studio foliage material. The existing Tree Atelier is available from the header.');};
  let lastTick=performance.now();
  const animate=()=>{if(stopped)return;frame=requestAnimationFrame(animate);const tick=performance.now();controls.update(Math.min(.1,(tick-lastTick)/1000));lastTick=tick;if(!dirty&&!measure)return;dirty=false;const now=performance.now(),cpu=performance.now();render();
    if(measure){if(measure.last)measure.times.push(now-measure.last);measure.last=now;measure.cpu.push(performance.now()-cpu);if(now-measure.start>=5000){const m=measure;measure=null;controls.autoRotate=false;const times=[...m.times].sort((a,b)=>a-b);const result={...base,fps:m.times.length/((now-m.start)/1000),medianFrameMs:times[Math.floor(times.length*.5)],p95FrameMs:times[Math.floor(times.length*.95)],meanCpuMs:m.cpu.reduce((a,b)=>a+b,0)/m.cpu.length,fill:fill()};m.resolve(result);}}
  };render();if(!stopped){onReady({...base});animate();}
  const lost=(e:Event)=>{e.preventDefault();stopped=true;if(measure){measure.resolve({...base});measure=null;}onError('WebGL context lost. Reload to restore the same seeds.');};renderer.domElement.addEventListener('webglcontextlost',lost);
  return {benchmark(){if(stopped||measure)return Promise.reject(Error('Already measuring'));return new Promise<StudioMetrics>(resolve=>{measure={start:performance.now(),last:0,times:[],cpu:[],resolve};controls.autoRotate=true;controls.autoRotateSpeed=2;dirty=true;});},fit:()=>fit(true),view:()=>({position:camera.position.toArray() as Point,target:controls.target.toArray() as Point}),dispose(){stopped=true;if(measure){measure.resolve({...base});measure=null;}cancelAnimationFrame(frame);resize.disconnect();controls.dispose();geometry.dispose();wood.geometry.dispose();(wood.material as THREE.Material).dispose();material.dispose();texture.dispose();bark.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
}
