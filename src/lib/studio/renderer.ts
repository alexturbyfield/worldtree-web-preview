import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {batchSpecies} from './species-v1';
import {studioAtlas} from './atlas';
import {createStudioStudy,studioKinds,oakGrowthForms,type StudioSettings,type OakGrowth} from './groups';
import {studioGeometry} from './geometry';
import {brushTexture,paintedWoodGeometry} from '../forest/paint-assets';
import {randomSource} from '../forest/random';
import type {Point} from '../forest/tree';
const vertex=/*glsl*/`
uniform float woodland;uniform float sage;
attribute vec4 tileRect;attribute vec3 color;attribute float interior;
varying vec2 atlasUv;varying vec3 paintLight;varying float canopyValue;varying float sunFacing;varying vec3 pigment;varying float leafRim;varying float depthShade;varying vec3 canopyWorld;
void main(){
  atlasUv=tileRect.xy+uv*tileRect.zw;
  canopyWorld=(modelMatrix*vec4(position,1.)).xyz;
  vec3 N=normalize((vec4(normalize(normalMatrix*normal),0.)*viewMatrix).xyz);
  vec3 key=normalize(mix(vec3(-.6,.85,.55),vec3(-.6,.85,.55),sage));
  float sunlight=max(0.,dot(N,key));
  vec3 fill=mix(vec3(.035,.13,.12),vec3(.58,.74,.57),N.y*.5+.5);
  sunFacing=smoothstep(.35,.98,dot(N,key));
  vec3 V=normalize(cameraPosition-(modelMatrix*vec4(position,1.)).xyz);
  leafRim=pow(1.-abs(dot(N,V)),2.);
  pigment=color;depthShade=interior;
  canopyValue=.27+.1*(N.y*.5+.5)+.2*sunFacing+.04*interior+(color.g-.55)*.18;
  paintLight=color*(fill+vec3(1.,.91,.73)*sunlight*.85)*interior;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}`;
const fragment=/*glsl*/`
uniform sampler2D foliageMap;uniform float metric;uniform float silhouette;uniform float woodland;uniform float sage;uniform vec3 shadowPigment;uniform vec3 midPigment;uniform vec3 highPigment;uniform vec3 crownMin;uniform vec3 crownMax;uniform float gradientStrength;uniform float rimStrength;
varying vec2 atlasUv;varying vec3 paintLight;varying float canopyValue;varying float sunFacing;varying vec3 pigment;varying float leafRim;varying float depthShade;varying vec3 canopyWorld;
void main(){
  vec4 leaf=texture2D(foliageMap,atlasUv);
  if(metric<1.5&&leaf.a<.34)discard;
  if(metric>.5){gl_FragColor=vec4(1./255.,0.,0.,1.);return;}
  if(silhouette>.5){gl_FragColor=vec4(.025,.035,.03,1.);return;}
  vec3 shaded=leaf.rgb*paintLight;
  if(woodland>.5){
    // Texture luminance supplies painted detail; palette supplies restrained colour.
    // Broad warm key + cool fill use transferred normals, without black underside bands.
    float ink=dot(leaf.rgb,vec3(.2126,.7152,.0722));
    float value=clamp(canopyValue+(sqrt(max(ink,0.))-.45)*.22,0.,1.);
    float body=sage>.5?smoothstep(.28,.76,value+(depthShade-.82)*.5):smoothstep(.22,.65,value);
    shaded=mix(shadowPigment,midPigment,body);
    // One world-space ramp for the whole crown; leaf pigment and shading remain intact.
    shaded*=mix(vec3(1.),pigment*1.85,.22);

    shaded*=mix(.68+.62*sqrt(max(ink,0.)),.76+.48*sqrt(max(ink,0.)),sage);
    float h=clamp((canopyWorld.y-crownMin.y)/max(.01,crownMax.y-crownMin.y),0.,1.);
    vec3 tint=mix(vec3(.65,.82,.94),vec3(1.12,1.08,.92),smoothstep(.1,.95,h));
    shaded*=mix(vec3(1.),tint,gradientStrength);
    vec3 relative=(canopyWorld-(crownMin+crownMax)*.5)/max((crownMax-crownMin)*.5,vec3(.01));
    vec3 toEye=normalize(cameraPosition-canopyWorld);
    float silhouette=pow(1.-abs(dot(normalize(relative+vec3(.0001)),toEye)),2.);
    float broken=smoothstep(-.35,.65,sin(dot(canopyWorld,vec3(5.7,2.1,3.9)))*.6+sin(dot(canopyWorld,vec3(-3.2,6.1,4.3)))*.4);
    float rim=smoothstep(.5,.92,h)*silhouette*sunFacing*(.2+.8*broken);
    shaded=mix(shaded,highPigment,rimStrength*rim*.6);
  }
  gl_FragColor=vec4(shaded,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
/** Connected rings share the same tangent at each joint, avoiding open wedge seams. */
function oakWood(segments:import('../forest/tree').Segment[],taperPower=1.3,seed='29'){
  const positions:number[]=[],normals:number[]=[],uvs:number[]=[],colors:number[]=[],sides=16,up=new THREE.Vector3(0,1,0);
  const roots=randomSource(seed+'|subtle-oak-buttresses'),count=3+Math.floor(roots()*3),phase=roots()*Math.PI*2;
  const lobes=Array.from({length:count},(_,i)=>({angle:phase+i*Math.PI*2/count+(roots()-.5)*.28,width:.4+roots()*.17,strength:.22+roots()*.2}));
  const trunk=segments.filter(s=>s.depth===0),baseY=trunk[0]?.a[1]??0,baseRadius=trunk[0]?.r0??0;
  const flareHeight=((trunk.at(-1)?.b[1]??baseY)-baseY)*.22;
  const baseFlare=(angle:number,height:number)=>{
    const t=Math.max(0,Math.min(1,(height-baseY)/Math.max(.01,flareHeight))),fade=1-t*t*(3-2*t);
    let lobe=.06;for(const root of lobes){const d=Math.atan2(Math.sin(angle-root.angle),Math.cos(angle-root.angle));lobe+=root.strength*Math.exp(-d*d/(root.width*root.width));}
    return baseRadius*lobe*fade;
  };
  const same=(a:Point,b:Point)=>a.every((v,i)=>Math.abs(v-b[i])<1e-6);
  const direction=(s:typeof segments[number])=>new THREE.Vector3(...s.b).sub(new THREE.Vector3(...s.a)).normalize();
  segments.forEach((segment,index)=>{
    const current=direction(segment),previous=segments[index-1],next=segments[index+1];
    const start=previous&&same(previous.b,segment.a)&&previous.depth===segment.depth?direction(previous).add(current).normalize():current;
    const end=next&&same(segment.b,next.a)&&next.depth===segment.depth?direction(next).add(current).normalize():current;
    let first=index,last=index;while(first>0&&segments[first-1].depth===segment.depth&&same(segments[first-1].b,segments[first].a))first--;while(last+1<segments.length&&segments[last+1].depth===segment.depth&&same(segments[last].b,segments[last+1].a))last++;
    const vertex=(tip:number,side:number)=>{const center=tip?segment.b:segment.a,t=(index-first+tip)/(last-first+1),angle=side/sides*Math.PI*2;
      // Continuous, faster taper at the fork; clean trunk base, slender tips.
      const root=segments[first].r0*(segment.depth===1?.76:1),terminal=segments[last].r1*.45;
      const taper=terminal+(root-terminal)*Math.pow(1-t,segment.depth===0?taperPower:1.65);
      const rooted=segment.depth===0&&segments[first].a[1]<=baseY+.001,flare=rooted?baseFlare(angle,center[1]):0;
      const ridge=1+.085*Math.sin(angle*4+center[1]*1.4)+.035*Math.sin(angle*7-center[1]*2);
      const radius=(taper+flare)*ridge;
      const frame=new THREE.Quaternion().setFromUnitVectors(up,tip?end:start),radial=new THREE.Vector3(Math.cos(angle),0,Math.sin(angle));
      const point=radial.clone().multiplyScalar(radius).applyQuaternion(frame).add(new THREE.Vector3(...center));
      const da=rooted?(baseFlare(angle+.002,center[1])-baseFlare(angle-.002,center[1]))/.004:0,dy=rooted?(baseFlare(angle,center[1]+.002)-baseFlare(angle,center[1]-.002))/.004:0;
      const normal=new THREE.Vector3(radius*Math.cos(angle)+da*Math.sin(angle),-radius*dy,radius*Math.sin(angle)-da*Math.cos(angle)).normalize().applyQuaternion(frame);positions.push(...point.toArray());normals.push(...normal.toArray());uvs.push(side/sides,center[1]*.19);
      const color=new THREE.Color('#715c49').lerp(new THREE.Color('#a18b6b'),Math.max(0,normal.y*.16-normal.x*.14+.14)).lerp(new THREE.Color('#46483d'),Math.max(0,-normal.y)*.23);colors.push(color.r,color.g,color.b);
    };
    for(let side=0;side<sides;side++){vertex(0,side);vertex(1,side);vertex(0,side+1);vertex(1,side);vertex(1,side+1);vertex(0,side+1);}
  });
  const geometry=new THREE.BufferGeometry();for(const [name,values,width] of [['position',positions,3],['normal',normals,3],['uv',uvs,2],['color',colors,3]] as const)geometry.setAttribute(name,new THREE.Float32BufferAttribute(values,width));geometry.computeBoundingSphere();return geometry;
}
function oakBark(){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=1024;const ctx=canvas.getContext('2d')!,rand=randomSource('reference-oak-painted-bark');
  ctx.fillStyle='#ddbe96';ctx.fillRect(0,0,512,1024);
  const knots=[{x:125,y:155,r:27},{x:355,y:410,r:35},{x:235,y:920,r:22}];
  // Long hand-painted grain ribbons bend around knot eyes rather than straight stripes.
  for(let i=0;i<27;i++){
    const x=i/27*512,phase=rand()*6.28,width=1.4+rand()*4;
    const line=(offset:number)=>{ctx.beginPath();for(let y=-8;y<=1032;y+=4){let px=x+Math.sin(y*.009+phase)*9+Math.sin(y*.024+phase)*3;
      for(const k of knots){const dx=x-k.x,dy=(y-k.y)/1.8;px+=Math.sign(dx)*k.r*.9*Math.exp(-dy*dy/(k.r*k.r*5))*Math.exp(-dx*dx/(k.r*k.r*3));}
      if(y===-8)ctx.moveTo(px+offset,y);else ctx.lineTo(px+offset,y);}};
    line(0);ctx.strokeStyle=`rgba(71,36,20,${.09+rand()*.12})`;ctx.lineWidth=width+2;ctx.stroke();
    line(-width*.8);ctx.strokeStyle='rgba(255,228,177,.32)';ctx.lineWidth=1.5+rand()*2;ctx.stroke();
    line(width);ctx.strokeStyle='rgba(166,94,44,.27)';ctx.lineWidth=1;ctx.stroke();
  }
  for(const k of knots){for(let ring=5;ring>=1;ring--){const r=k.r*ring/5;ctx.beginPath();ctx.ellipse(k.x,k.y,r*.48,r*1.6,-.2,0,Math.PI*2);ctx.strokeStyle=ring%2?'rgba(89,44,24,.6)':'rgba(255,221,163,.66)';ctx.lineWidth=ring%2?3:2;ctx.stroke();}}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;return texture;
}
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
  const library=!!q.presetId&&!!batchSpecies[q.presetId],originalOak=q.unified&&q.view==='broadleaf'&&(!q.presetId||q.presetId==='oak');
  const pigments=q.evergreenStudy&&q.view==='conifer'?['#163c37','#647f65','#a5b697']:{sage:['#294135','#6e9462','#d9c976'],woodland:['#254c45','#3e6c37','#b8b15c'],sunlit:['#2c5147','#507639','#c4b45b'],cool:['#264e4c','#3d6950','#a2ab68']}[q.palette??'woodland'];
  const material=new THREE.ShaderMaterial({uniforms:{crownMin:{value:new THREE.Vector3()},crownMax:{value:new THREE.Vector3(1,1,1)},gradientStrength:{value:q.crownGradient??.45},rimStrength:{value:q.crownRim??.4},sage:{value:q.palette==='sage'||q.evergreenStudy&&q.view==='conifer'?1:0},woodland:{value:q.unified&&q.view==='broadleaf'||q.evergreenStudy&&q.view==='conifer'||library?1:0},shadowPigment:{value:new THREE.Color(pigments[0])},midPigment:{value:new THREE.Color(pigments[1])},highPigment:{value:new THREE.Color(pigments[2])},foliageMap:{value:texture},metric:{value:0},silhouette:{value:0}},vertexShader:vertex,fragmentShader:fragment,side:THREE.DoubleSide,depthWrite:true,transparent:false});
  const geometry=studioGeometry(studies,positions);material.uniforms.crownMin.value.copy(geometry.boundingBox!.min);material.uniforms.crownMax.value.copy(geometry.boundingBox!.max);const foliage=new THREE.Mesh(geometry,material);scene.add(foliage);
  const scaled=studies.map((s,i)=>({model:{...s.model,segments:s.segments.map(segment=>({...segment,a:segment.a.map((v,k)=>v*s.scale+s.offset[k]) as Point,b:segment.b.map((v,k)=>v*s.scale+s.offset[k]) as Point,r0:segment.r0*s.scale,r1:segment.r1*s.scale}))},position:[positions[i],0,0] as Point,rotation:0}));
  const bark=originalOak?oakBark():brushTexture('bark'),wood=new THREE.Mesh<THREE.BufferGeometry,THREE.Material>(originalOak?oakWood(scaled[0].model.segments,oakGrowthForms[q.oakGrowth??'spreading'].taper,q.structure):paintedWoodGeometry(scaled,false,mobile).geometry,new THREE.MeshStandardMaterial({color:'#ffffff',map:bark,bumpMap:originalOak?bark:null,bumpScale:.012,vertexColors:true,roughness:1}));wood.visible=q.mode!=='leaf';scene.add(wood);
  const paintedWood=wood.material,silhouetteWood=new THREE.MeshBasicMaterial({color:'#060908',toneMapped:false});
  scene.add(new THREE.HemisphereLight('#d9e9ef','#667658',2));const sun=new THREE.DirectionalLight('#fff0d8',2.5);sun.position.set(-8,12,10);scene.add(sun);
  const bounds=geometry.boundingBox!.clone();if(q.mode!=='leaf')bounds.union(new THREE.Box3().setFromObject(wood));const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
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
    material.uniforms.metric.value=0;material.transparent=false;material.blending=THREE.NormalBlending;material.depthTest=true;material.depthWrite=true;wood.visible=q.mode!=='leaf';scene.background=oldBackground;renderer.setRenderTarget(null);renderer.setClearColor(oldColor,oldAlpha);target.dispose();dirty=true;
    return {width,height,meanLayers:sum/Math.max(1,occupied),meanQuadLayers:quadSum/Math.max(1,occupied),alphaRejectedFraction:quadSum?1-sum/quadSum:0,coverageFraction:occupied/(width*height),peakLayers:peak,saturatedPixels:saturated,quadPeakLayers:quadPeak,quadSaturatedPixels:quadSaturated,method:'Depth-disabled additive foliage coverage at sampled resolution; alpha layers per occupied pixel and quad rejection estimate. Not hardware fragment-invocation counters. Counts cap at 255; excludes wood. Readback excluded from orbit frame timings.',heatmap:heat.toDataURL()};
  };
  renderer.debug.onShaderError=()=>{stopped=true;onError('This device could not compile the studio foliage material. The existing Tree Atelier is available from the header.');};
  let lastTick=performance.now();
  const animate=()=>{if(stopped)return;frame=requestAnimationFrame(animate);const tick=performance.now();controls.update(Math.min(.1,(tick-lastTick)/1000));lastTick=tick;if(!dirty&&!measure)return;dirty=false;const now=performance.now(),cpu=performance.now();render();
    if(measure){if(measure.last)measure.times.push(now-measure.last);measure.last=now;measure.cpu.push(performance.now()-cpu);if(now-measure.start>=5000){const m=measure;measure=null;controls.autoRotate=false;const times=[...m.times].sort((a,b)=>a-b);const result={...base,fps:m.times.length/((now-m.start)/1000),medianFrameMs:times[Math.floor(times.length*.5)],p95FrameMs:times[Math.floor(times.length*.95)],meanCpuMs:m.cpu.reduce((a,b)=>a+b,0)/m.cpu.length,fill:fill()};m.resolve(result);}}
  };render();if(!stopped){onReady({...base});animate();}
  const lost=(e:Event)=>{e.preventDefault();stopped=true;if(measure){measure.resolve({...base});measure=null;}onError('WebGL context lost. Reload to restore the same seeds.');};renderer.domElement.addEventListener('webglcontextlost',lost);
  return {snapshot(){render();return renderer.domElement.toDataURL();},setSilhouette(enabled:boolean){material.uniforms.silhouette.value=enabled?1:0;wood.material=enabled?silhouetteWood:paintedWood;dirty=true;},benchmark(){if(stopped||measure)return Promise.reject(Error('Already measuring'));return new Promise<StudioMetrics>(resolve=>{measure={start:performance.now(),last:0,times:[],cpu:[],resolve};controls.autoRotate=true;controls.autoRotateSpeed=2;dirty=true;});},fit:()=>fit(true),view:()=>({position:camera.position.toArray() as Point,target:controls.target.toArray() as Point}),dispose(){stopped=true;if(measure){measure.resolve({...base});measure=null;}cancelAnimationFrame(frame);renderer.domElement.removeEventListener('webglcontextlost',lost);resize.disconnect();controls.dispose();geometry.dispose();wood.geometry.dispose();paintedWood.dispose();silhouetteWood.dispose();material.dispose();texture.dispose();bark.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
}

/** One tiny WebGL scene at a time; only bitmap silhouettes remain in the editor. */
export async function oakComparisons(q:StudioSettings){
  const host=document.createElement('div');Object.assign(host.style,{position:'fixed',left:'-10000px',width:'200px',height:'220px'});document.body.appendChild(host);
  const images:{form:OakGrowth;src:string}[]=[],common=new THREE.Box3();
  // Same world-unit scale, ground baseline and camera for every silhouette.
  for(const form of Object.keys(oakGrowthForms) as OakGrowth[]){const study=createStudioStudy('broadleaf',{...q,oakGrowth:form,mode:'trees',view:'broadleaf'}),geometry=studioGeometry([study],[0]);common.union(geometry.boundingBox!);common.expandByPoint(new THREE.Vector3(0,0,0));geometry.dispose();}
  const center=common.getCenter(new THREE.Vector3()),size=common.getSize(new THREE.Vector3()),distance=Math.max(size.y/2/Math.tan(THREE.MathUtils.degToRad(19)),size.x/2/Math.tan(THREE.MathUtils.degToRad(19))/(200/220))+size.z*.65;
  const sharedView={position:center.clone().add(new THREE.Vector3(.12,.18,1).normalize().multiplyScalar(distance*1.15)).toArray() as Point,target:center.toArray() as Point};
  try{for(const form of Object.keys(oakGrowthForms) as OakGrowth[]){
    await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
    const runtime=mountStudio(host,{...q,oakGrowth:form,mode:'trees',view:'broadleaf'},()=>{},message=>{throw Error(message);},sharedView);
    try{runtime.setSilhouette(true);images.push({form,src:runtime.snapshot()});}finally{runtime.dispose();}
  }}finally{host.remove();}return images;
}
