import {landscapeMode,landscapeGrass,grassGroups,dirtPatchMask} from './landscape-detail';
import * as T from 'three';
import {hashSeed,randomSource} from './random';
import {terrainHeight,type SceneRecipe} from './recipe';

export interface EnvironmentOptions {
  composition?:EncounterCompositionProfile|false;
  /** A soft spatial emphasis around this tree; 0 disables it, 1 retains foreground treatment. */
  focal?:{treeIndex:number;weight:number};
}
/** Presentation data only. Never selects species, edits population data or moves trees. */
export interface EncounterCompositionProfile {
  illumination?:PainterlyIllumination;
  groundLighting?:GroundCompositionLighting;
  version:'encounter-composition-v1';seed:string;
  focal:{screenCenter:[number,number];screenRadius:[number,number];centerDensity:number;edgeDensity:number};
  framing:{density:number;foregroundDensity:number;clusterScale:number;treeClearance?:number};
  light:{position:[number,number,number];color:string;intensity:number;ambientColor:string;ambientIntensity:number;shadowSoftness:number;shadowStrength:number};
  clouds:{enabled:boolean;count:number;strength:number;softness:number};
  emphasis:{count:number;strength:number};
  background:{near:number;far:number;saturation:number;contrast:number};
}
export function pugetCompositionProfile(seed:string):EncounterCompositionProfile{
  return {version:'encounter-composition-v1',seed,illumination:{...defaultPainterlyIllumination,focalWidth:[19,20]},focal:{screenCenter:[.5,.73],screenRadius:[.29,.13],centerDensity:0,edgeDensity:.8},framing:{density:1.25,foregroundDensity:1.6,clusterScale:3.5,treeClearance:18},light:{position:[-36,38,22],color:'#ffe0a8',intensity:4.8,ambientColor:'#a3c4df',ambientIntensity:.75,shadowSoftness:2,shadowStrength:.9},clouds:{enabled:true,count:2,strength:.28,softness:.65},emphasis:{count:3,strength:.75},background:{near:57,far:110,saturation:.7,contrast:.82}};
}
export function resolveEncounterComposition(recipe:SceneRecipe,camera:T.PerspectiveCamera,profile:EncounterCompositionProfile){
  const project=(screenX:number,screenY:number)=>{
    const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(screenX*2-1,1-screenY*2),camera);
    let previous=ray.ray.origin.clone(),previousT=0;
    for(let t=.5;t<=180;t+=.5){const p=ray.ray.at(t,new T.Vector3());if(p.y<=terrainHeight(p.x,p.z,recipe.seed)){
      let lo=previousT,hi=t;for(let i=0;i<12;i++){const mid=(lo+hi)/2,q=ray.ray.at(mid,new T.Vector3());if(q.y>terrainHeight(q.x,q.z,recipe.seed))lo=mid;else hi=mid;}return ray.ray.at((lo+hi)/2,new T.Vector3());
    }previous=p;previousT=t;}return previous;
  };
  const [sx,sy]=profile.focal.screenCenter,[rx,ry]=profile.focal.screenRadius,center=project(sx,sy),left=project(sx-rx,sy),right=project(sx+rx,sy),top=project(sx,sy-ry),bottom=project(sx,sy+ry);
  const clearing={x:center.x,z:center.z,radiusX:T.MathUtils.clamp(left.distanceTo(right)/2,6,24),radiusZ:T.MathUtils.clamp(top.distanceTo(bottom)/2,10,35)};
  const anchor=camera.position.clone(),rightAxis=new T.Vector3().setFromMatrixColumn(camera.matrixWorld,0).setY(0).normalize(),forward=camera.getWorldDirection(new T.Vector3()).setY(0).normalize();
  const mask=(x:number,z:number)=>{
    const distance=Math.hypot((x-clearing.x)/clearing.radiusX,(z-clearing.z)/clearing.radiusZ);
    const open=smooth(.9,1.4,distance),delta=new T.Vector3(x-anchor.x,0,z-anchor.z),lateral=Math.abs(delta.dot(rightAxis)),depth=delta.dot(forward);
    const side=smooth(8,19,lateral)*(1-smooth(45,85,depth)),near=1-smooth(2,19,depth);
    return {open,framing:Math.max(side*profile.framing.density,near*profile.framing.foregroundDensity)*open};
  };
  const key=new T.Vector3(...profile.light.position).normalize();
  const candidates=recipe.trees.map(tree=>{
    const crown=new T.Vector3(tree.position[0],tree.position[1]+tree.model.dimensions.height*.65,tree.position[2]),screen=crown.clone().project(camera),distance=crown.distanceTo(anchor),size=tree.model.dimensions.crownWidth/distance;
    const illumination=Math.max(.1,key.dot(anchor.clone().sub(crown).normalize()));
    return {index:tree.index,center:crown,radius:Math.max(tree.model.dimensions.crownWidth,tree.model.dimensions.height*.55),screen,score:screen.z<1&&Math.abs(screen.x)<1.1&&Math.abs(screen.y)<1?size*(.6+illumination)*(1-Math.abs(Math.abs(screen.x)-.48)*.3)+(hashSeed(tree.seed+'|emphasis')%1000)*.000001:-1};
  }).filter(t=>t.score>0).sort((a,b)=>b.score-a.score||a.index-b.index);
  const selected:typeof candidates=[];for(const c of candidates){if(selected.length>=Math.min(4,profile.emphasis.count))break;if(selected.every(s=>s.screen.distanceTo(c.screen)>.28))selected.push(c);}
  const rand=randomSource(profile.seed+'|cloud-regions');
  const clouds=Array.from({length:profile.clouds.enabled?Math.min(3,profile.clouds.count):0},(_,i)=>({x:clearing.x+(i%2?1:-1)*(9+rand()*13),z:clearing.z-16+rand()*35,radiusX:14+rand()*12,radiusZ:8+rand()*8}));
  return {profile,clearing,mask,selected,clouds,anchor:anchor.toArray(),forward:forward.toArray()};
}
export type ResolvedEncounterComposition=ReturnType<typeof resolveEncounterComposition>;
export interface PainterlyIllumination {
  enabled:boolean;focalStrength:number;focalCenter?:[number,number];focalWidth:[number,number];
  softness:number;warmth:number;irregularity:number;patchCount:number;patchStrength:number;crownStrength:number;
}
export const defaultPainterlyIllumination:PainterlyIllumination={enabled:true,focalStrength:.9,focalWidth:[19,20],softness:.8,warmth:.5,irregularity:.35,patchCount:3,patchStrength:.38,crownStrength:.5};
export function resolvePainterlyIllumination(composition:ResolvedEncounterComposition,settings:PainterlyIllumination=defaultPainterlyIllumination){
  const random=randomSource(composition.profile.seed+'|illumination-v1'),center=settings.focalCenter??[composition.clearing.x+composition.forward[0]*5,composition.clearing.z+composition.forward[2]*5];
  const patches=Array.from({length:Math.max(0,Math.min(4,Math.floor(settings.patchCount)))},(_,i)=>({x:center[0]-18+random()*36,z:center[1]-12+random()*24,width:8+random()*6,depth:5+random()*5,weight:i%2?-.65:1}));
  return {settings:{...settings,focalWidth:[...settings.focalWidth]},center:[...center],forward:[composition.forward[0],composition.forward[2]],phase:random()*Math.PI*2,patches};
}
function illuminationEnabled(composition:ResolvedEncounterComposition){return (composition.profile.illumination??defaultPainterlyIllumination).enabled&&(typeof location==='undefined'||new URLSearchParams(location.search).get('illumination')!=='off');}
function illuminationShader(light:ReturnType<typeof resolvePainterlyIllumination>){
  const s=light.settings,n=(v:number)=>v.toFixed(5);
  return `float painterlyIllumination(vec3 world){
    vec2 delta=world.xz-vec2(${light.center.map(n).join(',')});
    vec2 forward=normalize(vec2(${light.forward.map(n).join(',')}));
    vec2 q=vec2(dot(delta,vec2(-forward.y,forward.x)),dot(delta,forward))/vec2(${s.focalWidth.map(n).join(',')});
    float warp=(sin(world.x*.12+${n(light.phase)}+sin(world.z*.08))*.6+sin(world.z*.15-world.x*.05)*.4)*${n(s.irregularity)};
    float core=(1.-smoothstep(.22,${n(.65+s.softness)},abs(q.x)+warp))*(1.-smoothstep(.18,${n(.65+s.softness)},abs(q.y)+warp*.6));
    float patches=0.;
    ${light.patches.map(p=>`patches+=${n(p.weight)}*(1.-smoothstep(.12,1.2,length((world.xz-vec2(${n(p.x)},${n(p.z)}))/vec2(${n(p.width)},${n(p.depth)})+vec2(warp*.4,warp*.2))));`).join('\n')}
    float foregroundProtection=smoothstep(-1.05,-.2,q.y);
    return clamp(core*${n(s.focalStrength)}+patches*${n(s.patchStrength)},-.24,1.35)*foregroundProtection;
  }\n`;
}
export interface GroundCompositionLighting {
  foregroundDarkness:number;sideFraming:number;
  /** World X/Z; omitted means the composition's terrain-projected clearing center. */
  focalCenter?:[number,number];focalWidth:[number,number];
  transitionSoftness:number;warmth:number;irregularity:number;
}
export const defaultGroundLighting:GroundCompositionLighting={foregroundDarkness:.46,sideFraming:.38,focalWidth:[23,29],transitionSoftness:.8,warmth:.16,irregularity:.55};
export function groundCompositionField(composition:ResolvedEncounterComposition,settings:GroundCompositionLighting=defaultGroundLighting){
  const center=settings.focalCenter??[composition.clearing.x,composition.clearing.z],forward=[composition.forward[0],composition.forward[2]],phase=(hashSeed(composition.profile.seed+'|ground-lighting-v1')%6283)/1000;
  // Capture values rather than live camera references. The field remains attached to the meadow.
  return {settings:{...settings,focalWidth:[...settings.focalWidth]},center:[...center],forward,phase};
}
function groundLightingShader(field:ReturnType<typeof groundCompositionField>){
  const p=field.settings,n=(x:number)=>x.toFixed(5),soft=Math.max(.15,p.transitionSoftness);
  return `vec2 groundLightingWeights(vec3 world){
    vec2 delta=world.xz-vec2(${field.center.map(n).join(',')});
    vec2 forward=normalize(vec2(${field.forward.map(n).join(',')}));
    vec2 q=vec2(dot(delta,vec2(-forward.y,forward.x)),dot(delta,forward))/vec2(${p.focalWidth.map(n).join(',')});
    float variation=(sin(world.x*.07+${n(field.phase)}+sin(world.z*.055))*.55+sin(world.z*.1-world.x*.035)*.45)*${n(p.irregularity)};
    float foreground=smoothstep(-.05,${n(soft+ .4)},-q.y+variation*.45);
    float side=smoothstep(.45,${n(1+soft)},abs(q.x)+variation)*(1.-smoothstep(.5,2.,q.y));
    float leafGroups=.5+.25*sin(world.x*.31+sin(world.z*.23+${n(field.phase)}))+.25*sin(world.z*.39-world.x*.19);
    float canopyTexture=mix(.73,1.12,smoothstep(.22,.8,leafGroups));
    float shade=clamp((foreground*${n(p.foregroundDarkness)}+side*${n(p.sideFraming)})*canopyTexture,0.,.64);
    float opening=(1.-smoothstep(.35,${n(.9+soft)},abs(q.x)+variation*.5))*(1.-smoothstep(.35,${n(.9+soft)},abs(q.y-.2)+variation*.35));
    return vec2(shade,opening);
  }
  vec3 groundLightingApply(vec3 lit,vec3 pigment,vec3 world){
    vec2 field=groundLightingWeights(world);
    // Nonzero green bounce floor preserves pigment detail beneath physical shadows.
    vec3 bounced=max(lit,pigment*vec3(.28,.4,.36));
    vec3 cool=mix(vec3(1.),vec3(.32,.72,.86),clamp(field.x*1.5,0.,1.));
    vec3 warm=mix(vec3(1.),vec3(1.16,1.075,.9),field.y*${n(p.warmth)});
    return bounced*pow(1.-field.x,1.65)*cool*warm;
  }\n`;
}
function installGroundLighting(material:T.Material,field:ReturnType<typeof groundCompositionField>,instanced:boolean,debug:boolean,illumination?:ReturnType<typeof resolvePainterlyIllumination>,illuminationDebug=false){
  const previous=material.onBeforeCompile,key=material.customProgramCacheKey.bind(material);
  material.onBeforeCompile=(shader,renderer)=>{
    previous.call(material,shader,renderer);
    shader.vertexShader='varying vec3 groundLightingWorld;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>\ngroundLightingWorld=(modelMatrix*${instanced?'instanceMatrix*':''}vec4(transformed,1.)).xyz;`);
    shader.fragmentShader='varying vec3 groundLightingWorld;\n'+groundLightingShader(field)+(illumination?illuminationShader(illumination):'')+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',debug?`vec2 diagnostic=groundLightingWeights(groundLightingWorld);outgoingLight=mix(vec3(.35,.3,.035),vec3(.008,.065,.08),clamp(diagnostic.x/.4,0.,1.));\n#include <opaque_fragment>`:'outgoingLight=groundLightingApply(outgoingLight,diffuseColor.rgb,groundLightingWorld);\n#include <opaque_fragment>');
    if(illumination)shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',illuminationDebug?`float lightField=painterlyIllumination(groundLightingWorld);outgoingLight=mix(vec3(.012,.065,.095),vec3(.55,.38,.045),smoothstep(0.,1.2,lightField));outgoingLight=mix(outgoingLight,vec3(.12,.025,.16),clamp(-lightField*4.,0.,1.));\n#include <opaque_fragment>`:`float lightField=painterlyIllumination(groundLightingWorld);
      vec3 lightTint=mix(vec3(1.),vec3(1.18,1.12,.83),max(0.,lightField)*${illumination.settings.warmth.toFixed(5)});
      outgoingLight*=max(.7,1.+lightField)*lightTint;
      #include <opaque_fragment>`);
  };
  material.customProgramCacheKey=()=>key()+`|ground-lighting-v2-${instanced}-${debug}-${!!illumination}-${illuminationDebug}`;material.needsUpdate=true;
}
function cloudShader(composition:ResolvedEncounterComposition){
  return `float cloudTransmission(vec3 p){float light=1.;${composition.clouds.map(c=>`light*=1.-${composition.profile.clouds.strength.toFixed(4)}*(1.-smoothstep(${(1-composition.profile.clouds.softness).toFixed(4)},1.,length((p.xz-vec2(${c.x.toFixed(4)},${c.z.toFixed(4)}))/vec2(${c.radiusX.toFixed(4)},${c.radiusZ.toFixed(4)}))));`).join('')}return light;}`;
}
/** Cloud transmission modulates incident direct light, independently of shadow-map occlusion. */
function grassCloudResponse(material:T.Material,composition:ResolvedEncounterComposition){
  const previous=material.onBeforeCompile;
  material.onBeforeCompile=(shader,renderer)=>{
    previous.call(material,shader,renderer);
    shader.vertexShader='varying vec3 compositionGrassWorld;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\ncompositionGrassWorld=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;');
    shader.fragmentShader='varying vec3 compositionGrassWorld;\n'+cloudShader(composition)+'\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.directDiffuse*=cloudTransmission(compositionGrassWorld);');
  };
  const previousKey=material.customProgramCacheKey.bind(material);material.customProgramCacheKey=()=>previousKey()+'|composition-grass-cloud-v1';material.needsUpdate=true;
}
export interface Clearing {x:number;z:number;radiusX:number;radiusZ:number}
const smooth=(a:number,b:number,x:number)=>{const t=T.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const canvas=(w:number,h=w)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};

/** Periodic pigments, not a land-cover map. Opposite edge pixels are identical by construction. */
export function painterlyGroundTile(seed='puget-ground-v1',size=256){
  const c=canvas(size),g=c.getContext('2d')!,pixels=g.createImageData(size,size),r=randomSource(seed);
  const phases=Array.from({length:6},()=>r()*Math.PI*2),tau=Math.PI*2;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const u=x/(size-1)*tau,v=y/(size-1)*tau;
    const wash=Math.sin(u+phases[0])*.32+Math.cos(v+phases[1])*.26+Math.sin(u+v+phases[2])*.22+Math.cos(2*u-v+phases[3])*.12;
    // Shallow, broad brush scumbles. No individual blades or repeating soil islands.
    const brush=Math.sin(5*u+2*v+Math.sin(v)*.7+phases[4])*Math.cos(3*v-u+phases[5])*.8;
    const ink=wash*12+brush*2,k=(y*size+x)*4;
    pixels.data[k]=184+ink;pixels.data[k+1]=186+ink*.91;pixels.data[k+2]=155+ink*.75;pixels.data[k+3]=255;
  }
  g.putImageData(pixels,0,0);return c;
}

/** Independent, non-repeating world-space soil, vegetation and clearing fields. */
export function environmentMasks(x:number,z:number,seed:string,clearing:Clearing){
  const phase=(hashSeed(seed+'|environment-masks')%6283)/1000;
  const path=3*Math.sin(z*.07),soil=1-smooth(1.1,4.8,Math.abs(x-path));
  const patch=.5+.25*Math.sin(x*.19+phase+Math.sin(z*.11))+.25*Math.sin(z*.23-x*.08-phase);
  const open=smooth(.78,1.38,Math.hypot((x-clearing.x)/clearing.radiusX,(z-clearing.z)/clearing.radiusZ));
  return {soil,vegetation:smooth(.24,.76,patch)*(1-soil*.94),open};
}

/** Four painterly tuft silhouettes, padded independently for filtered atlas sampling. */
export function grassTuftAtlas(seed='puget-grass-v1',tile=128){
  const c=canvas(tile*4,tile),g=c.getContext('2d')!,r=randomSource(seed);
  for(let variant=0;variant<4;variant++){
    g.save();g.translate(variant*tile,0);
    const blades=7+variant*2;
    for(let i=0;i<blades;i++){
      const root=tile*(.39+r()*.22),tip=tile*(.12+r()*.76),height=tile*(.31+r()*.56),width=tile*(.025+r()*.025),base=tile-9;
      const gradient=g.createLinearGradient(0,base,0,base-height);gradient.addColorStop(0,'#344d37');gradient.addColorStop(.45,['#6e8852','#7c9458','#648654','#8c9d61'][variant]);gradient.addColorStop(1,'#c0bd7d');
      g.fillStyle=gradient;g.beginPath();g.moveTo(root-width,base);g.quadraticCurveTo(root-width*2,base-height*.58,tip,base-height);g.quadraticCurveTo(root+width*1.6,base-height*.4,root+width,base);g.fill();
      if(i%3===0){g.strokeStyle='rgba(225,216,153,.24)';g.lineWidth=1.6;g.beginPath();g.moveTo(root,base-4);g.quadraticCurveTo(root,base-height*.5,tip,base-height+5);g.stroke();}
    }
    g.restore();
  }
  return c;
}

export function mountEnvironmentGround(scene:T.Scene,recipe:SceneRecipe,clearing:Clearing,mobile=false){
  const art=!(typeof location!=='undefined'&&new URLSearchParams(location.search).get('environmentArt')==='0');
  const lit=art&&(typeof location==='undefined'||new URLSearchParams(location.search).get('lighting')!=='baseline');
  const finalComposition=art&&(typeof location==='undefined'||(new URLSearchParams(location.search).get('lighting')??'final')==='final');
  const composition=scene.userData.composition as ResolvedEncounterComposition|undefined;
  const fullComposition=composition&&scene.userData.compositionMode==='C';
  scene.userData.environmentArt=art;
  const richGrass=typeof location==='undefined'||new URLSearchParams(location.search).get('grassPaint')!=='flat';
  const stochasticGrass=typeof location==='undefined'||new URLSearchParams(location.search).get('grassTiling')!=='repeat';
  const detail=landscapeMode()==='C',groupedGrass=grassGroups(recipe.seed);
  const patches=detail&&richGrass&&(typeof location==='undefined'||new URLSearchParams(location.search).get('dirtPatches')!=='off');
  const patchMask=patches?dirtPatchMask(recipe.seed):null;
  const loaded:T.Texture[]=[];const load=(name:string)=>{const t=new T.TextureLoader().load('/assets/puget-v1/'+name+'.png',()=>{scene.userData.artRevision=(scene.userData.artRevision??0)+1;});t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.anisotropy=4;loaded.push(t);return t;};
  const ground=scene.children.find(o=>o instanceof T.Mesh&&o.geometry.type==='PlaneGeometry') as T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>|undefined;
  const tile=painterlyGroundTile(),texture=new T.CanvasTexture(tile);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=2;
  if(art){texture.dispose();}
  const meadow=art?(detail?landscapeGrass(recipe.seed):load('meadow')):texture,forest=texture,dirt=patches?load('path'):texture;
  if(art&&detail)loaded.push(meadow);if(patchMask)loaded.push(patchMask);
  if(art){const edge=scene.children.find(o=>o instanceof T.Mesh&&o.geometry.type==='BoxGeometry');if(edge)edge.position.y=-9;}
  if(ground){
    // Land-cover colour lives in world coordinates, independently of the repeating pigment tile.
    const p=ground.geometry.getAttribute('position'),colors=ground.geometry.getAttribute('color');
    for(let i=0;i<p.count;i++)colors.setXYZ(i,1,1,1);colors.needsUpdate=true;
    const mat=ground.material;mat.map=meadow;
    mat.onBeforeCompile=shader=>{
      Object.assign(shader.uniforms,{forestMap:{value:forest},dirtMap:{value:dirt},dirtCoverage:{value:patchMask}});
      shader.vertexShader='varying vec3 groundWorld;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ngroundWorld=(modelMatrix*vec4(transformed,1.)).xyz;');
      shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvMapUv=(modelMatrix*vec4(position,1.)).xz/7.;');
      shader.fragmentShader='uniform sampler2D forestMap;uniform sampler2D dirtMap;uniform sampler2D dirtCoverage;varying vec3 groundWorld;\n'+shader.fragmentShader;
      if(detail&&richGrass&&stochasticGrass){
        // Three lattice vertices share samples across triangle borders. Offsets/rotations never follow the camera.
        const seed=(hashSeed(recipe.seed+'|stochastic-grass-v1')%65521).toFixed(1);
        shader.fragmentShader=`
          vec2 grassTileHash(vec2 id){return fract(sin(vec2(dot(id,vec2(127.1,311.7)),dot(id,vec2(269.5,183.3)))+${seed})*43758.5453);}
          vec3 grassTileSample(sampler2D grassTex,vec2 uv,vec2 vertex,vec2 dx,vec2 dy){
            vec2 h=grassTileHash(vertex);float a=floor(h.x*4.)*1.57079632679;
            mat2 turn=mat2(cos(a),sin(a),-sin(a),cos(a));
            return textureGrad(grassTex,turn*uv+h*19.73,turn*dx,turn*dy).rgb;
          }
          vec3 stochasticGrassPaint(sampler2D grassTex,vec2 uv){
            vec2 dx=dFdx(uv),dy=dFdy(uv);
            vec2 lattice=mat2(1.,0.,-.57735026919,1.15470053838)*uv;
            vec2 id=floor(lattice),f=fract(lattice),a,b,c;vec3 weight;
            if(f.x+f.y<1.){a=id;b=id+vec2(1.,0.);c=id+vec2(0.,1.);weight=vec3(1.-f.x-f.y,f.x,f.y);}
            else{a=id+vec2(1.);b=id+vec2(0.,1.);c=id+vec2(1.,0.);weight=vec3(f.x+f.y-1.,1.-f.x,1.-f.y);}
            // Sharpen blend weights to retain painted blade contrast rather than averaging it away.
            weight=pow(max(weight,vec3(0.)),vec3(3.));weight/=max(dot(weight,vec3(1.)),.0001);
            return grassTileSample(grassTex,uv,a,dx,dy)*weight.x+grassTileSample(grassTex,uv,b,dx,dy)*weight.y+grassTileSample(grassTex,uv,c,dx,dy)*weight.z;
          }
        `+shader.fragmentShader;
      }

      const phase=(hashSeed(recipe.seed+'|environment-masks')%6283)/1000;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        float soil=1.-smoothstep(1.1,4.8,abs(groundWorld.x-3.*sin(groundWorld.z*.07)));
        float vegetationWash=.5+.25*sin(groundWorld.x*.19+${phase.toFixed(5)}+sin(groundWorld.z*.11))+.25*sin(groundWorld.z*.23-groundWorld.x*.08-${phase.toFixed(5)});
        vec3 moss=mix(vec3(.145,.202,.097),vec3(.235,.29,.145),smoothstep(.24,.76,vegetationWash));
        ${art?`vec2 detailUv=groundWorld.xz/${detail&&richGrass?'7.5':'18.'};
        vec3 grassPaint=${detail&&richGrass&&stochasticGrass?'stochasticGrassPaint(map,detailUv)':'texture2D(map,detailUv).rgb'};
        float detail=dot(grassPaint,vec3(.2126,.7152,.0722));
        float region=.5+.25*sin(groundWorld.x*.075+sin(groundWorld.z*.055))+.25*cos(groundWorld.z*.09);
        float clearingLight=exp(-pow(groundWorld.x/17.,2.)-pow((groundWorld.z-2.)/30.,2.));
        float foregroundShade=smoothstep(5.,32.,groundWorld.z)*(1.-clearingLight*.65);
        vec3 meadowPigment=mix(vec3(.075,.17,.065),vec3(.22,.31,.085),region);
        ${fullComposition?'':'meadowPigment=mix(meadowPigment,vec3(.32,.39,.115),clearingLight*.72);'}
        ${fullComposition?'':'meadowPigment=mix(meadowPigment,vec3(.045,.105,.075),foregroundShade*.58);'}
        ${detail&&richGrass?'diffuseColor.rgb=grassPaint*mix(vec3(.82,.94,.9),vec3(1.03,1.025,.91),region)*.9;':`diffuseColor.rgb=meadowPigment*mix(.86,1.15,smoothstep(${detail?'.12,.55':'.025,.3'},detail));`}
        ${patches?`vec2 dirtField=texture2D(dirtCoverage,(groundWorld.xz+50.)/100.).rg;
        float blade=smoothstep(.08,.34,dot(grassPaint,vec3(.2126,.7152,.0722)));
        // Bright blade/tip shapes invade the mask boundary; strong patch cores remain bare.
        float soilMask=smoothstep(.39,.61,dirtField.r-(blade-.45)*.21);
        float earthValue=dot(texture2D(dirtMap,groundWorld.xz/9.).rgb,vec3(.2126,.7152,.0722));
        vec3 earth=mix(vec3(.17,.095,.035),vec3(.42,.29,.095),smoothstep(.04,.52,earthValue))*mix(.87,1.12,dirtField.g);
        diffuseColor.rgb=mix(diffuseColor.rgb,earth,soilMask*.94);`:''}
        ${detail?'float broadWash=.5+.25*sin(groundWorld.x*.031+sin(groundWorld.z*.043))+.25*cos(groundWorld.z*.038-groundWorld.x*.015);diffuseColor.rgb*=mix(vec3(.91,1.015,.97),vec3(1.065,1.035,.93),broadWash);':''}`:'diffuseColor.rgb*=mix(moss,vec3(.29,.232,.152),soil*.86);'}
      `);
      const lighting=typeof location==='undefined'?'final':new URLSearchParams(location.search).get('lighting')??'final';
      if(art&&['clearing','final'].includes(lighting)){
        const sun=scene.children.find(o=>o instanceof T.DirectionalLight&&o.castShadow) as T.DirectionalLight;
        const direction={value:new T.Vector3()};shader.uniforms.clearingSun=direction;
        mat.onBeforeRender=()=>direction.value.copy(sun.position).sub(sun.target.position).normalize();
        shader.fragmentShader='uniform vec3 clearingSun;\n'+shader.fragmentShader;
        if(fullComposition)shader.fragmentShader=cloudShader(composition)+'\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',fullComposition?`#include <lights_fragment_end>\nreflectedLight.directDiffuse*=cloudTransmission(groundWorld);`:`#include <lights_fragment_end>
          vec2 canopyProjection=groundWorld.xz+clearingSun.xz/max(.2,clearingSun.y)*12.;
          vec2 opening=canopyProjection-vec2(-9.,8.);
          float rim=1.+.13*sin(opening.y*.24)+.09*sin(opening.x*.33+opening.y*.14);
          float sunlight=1.-smoothstep(.65,1.2,length(opening/vec2(26.,23.))/rim);
          reflectedLight.directDiffuse*=.12+.88*sunlight;
          reflectedLight.indirectDiffuse*=vec3(.72,.86,1.05);
        `);
      }
    };mat.customProgramCacheKey=()=>`puget-ground-v1-${recipe.seed}-stochastic-${detail&&richGrass&&stochasticGrass}-dirt-${patches}`;mat.needsUpdate=true;
  }
  const atlas=grassTuftAtlas(),grassTexture=art?load('grass'):new T.CanvasTexture(atlas);grassTexture.colorSpace=T.SRGBColorSpace;grassTexture.anisotropy=2;
  // One deterministic acceptance stream. Mobile is a stable subset, not a new scatter.
  // Match the material's dirt blend and exclude the exposed terrain-box surface.
  // Sample the footprint too, so blades/cards do not overhang the path edge.
  const supportsGrass=(x:number,z:number,radius:number)=>Math.abs(x)+radius<50&&Math.abs(z)+radius<50;
  const clump=(x:number,z:number)=>{if(detail)return groupedGrass(x,z);const scale=composition?3.5/composition.profile.framing.clusterScale:1;return smooth(.48,.82,.5+.25*Math.sin(x*.73*scale+Math.sin(z*.43*scale))+.25*Math.cos(z*.61*scale-x*.27*scale));};
  const r=randomSource(recipe.seed+'|grass-foundation-v1'),placements:{x:number;z:number;scale:number;yaw:number;leanX:number;leanZ:number;tint:number;tile:number;lod:number}[]=[];
  for(let i=0;i<14000;i++){
    const x=(r()-.5)*88,z=(r()-.5)*82,accept=r(),scale=.45+r()*.75,yaw=r()*Math.PI*2,leanX=(r()-.5)*.4,leanZ=(r()-.5)*.4,tint=r(),tile=Math.floor(r()*4),lod=r();
    const mask=environmentMasks(x,z,recipe.seed,clearing),directed=composition?.mask(x,z);
    const nearTree=Math.max(0,...recipe.trees.map(t=>Math.exp(-Math.hypot(x-t.position[0],z-t.position[2])/3)));
    const richness=directed?Math.min(2.5,.5+nearTree*.6+directed.framing):art?Math.min(1.25,.8+nearTree*.5+smooth(10,30,Math.abs(x))*.3):.74;
    if((!art||supportsGrass(x,z,1))&&accept<(art?clump(x,z)*(directed?composition!.profile.focal.centerDensity+(composition!.profile.focal.edgeDensity-composition!.profile.focal.centerDensity)*directed.open:finalComposition?smooth(.7,1.15,mask.open):(.015+.985*mask.open)):mask.vegetation*(.025+.975*mask.open))*richness&&(!mobile||lod<.58))placements.push({x,z,scale,yaw,leanX,leanZ,tint,tile,lod});
  }
  const batches:T.InstancedMesh[]=[];
  for(const far of [false,true]){
    const list=far?placements.filter(p=>p.lod<(mobile?.174:.3)):placements;
    const geo=new T.PlaneGeometry(1,1);geo.translate(0,.5,0);
    if(!far){
      // Two crossed cards, four triangles per tuft, in one instanced draw.
      const a=geo.getAttribute('position'),uv=geo.getAttribute('uv'),positions:number[]=[],uvs:number[]=[],indices:number[]=[];
      for(let card=0;card<2;card++){for(let v=0;v<4;v++){positions.push(card?0:a.getX(v),a.getY(v),card?a.getX(v):0);uvs.push(uv.getX(v),uv.getY(v));}for(const j of geo.index!.array)indices.push(j+card*4);}
      geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.deleteAttribute('normal');geo.computeVertexNormals();
    }
    geo.setAttribute('tuftTile',new T.InstancedBufferAttribute(new Float32Array(list.map(p=>p.tile)),1));
    const material=new (lit?T.MeshLambertMaterial:T.MeshBasicMaterial)({map:grassTexture,side:T.DoubleSide,alphaTest:.38,transparent:false,depthWrite:true,fog:true});
    material.onBeforeCompile=shader=>{
      shader.vertexShader='attribute float tuftTile; varying float tuftFade;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvMapUv=vec2((tuftTile+.03+uv.x*.94)/4.,.03+uv.y*.94);');
      shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
        float distanceToTuft=length((modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz-cameraPosition);
        tuftFade=${far?'smoothstep(30.,44.,distanceToTuft)*(1.-smoothstep(68.,88.,distanceToTuft))':'1.-smoothstep(32.,46.,distanceToTuft)'};
        if(tuftFade<.001)gl_Position=vec4(2.,2.,2.,1.);
      `);
      shader.fragmentShader='varying float tuftFade;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>','diffuseColor.a*=tuftFade;\n#include <alphatest_fragment>');
    };material.customProgramCacheKey=()=>`puget-grass-v1-${far}`;
    if(fullComposition)grassCloudResponse(material,composition);
    const mesh=new T.InstancedMesh(geo,material,list.length),object=new T.Object3D(),color=new T.Color();mesh.name=far?'foundation-grass-far':'foundation-grass-near';
    list.forEach((p,i)=>{object.position.set(p.x,terrainHeight(p.x,p.z,recipe.seed)-.045,p.z);object.rotation.set(p.leanX,p.yaw,p.leanZ);object.scale.set(p.scale*(far?1.2:1)*(art?1.4:1)*(detail?.75+p.tint*.65:1),p.scale*(.6+p.tint*.45)*(art?1.8:1)*(detail?1.2-p.tint*.35:1),p.scale);object.updateMatrix();mesh.setMatrixAt(i,object.matrix);color.set('#d3dda8').lerp(new T.Color('#91af87'),p.tint);mesh.setColorAt(i,color);});
    mesh.receiveShadow=lit;mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();scene.add(mesh);batches.push(mesh);
  }
  scene.userData.environment={groundTile:`${tile.width} × ${tile.height}`,grassAtlas:`${atlas.width} × ${atlas.height}`,instances:batches.map(b=>({name:b.name,count:b.count,triangles:b.count*(b.geometry.index!.count/3)})),grassDrawCalls:2,grassAlphaTest:.38,grassCastsShadows:false,grassDistance:'Crossed cards fade 32–46 m; 30% single-card subset fades in 30–44 m, out 68–88 m.',clearing:'Elliptical reserved area; 2.5% residual acceptance before soil and vegetation masks.'};
  if(art){
    // A separate short sward covers the full ground, including the encounter clearing.
    // Three tapered blades share one geometry/material and one instanced draw call.
    const positions:number[]=[],pigments:number[]=[];
    for(let blade=0;blade<3;blade++){
      const angle=blade*2.399,dx=Math.cos(angle),dz=Math.sin(angle),height=.17+blade*.035;
      for(const [across,y,lean] of [[-.04,0,0],[.04,0,0],[0,height,.1]]){
        positions.push(dx*across-dz*lean,y,dz*across+dx*lean);
        const color=new T.Color(y?'#b4c774':'#4a7045');pigments.push(color.r,color.g,color.b);
      }
    }
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new T.Float32BufferAttribute(pigments,3));geometry.computeVertexNormals();
    const material=new (lit?T.MeshLambertMaterial:T.MeshBasicMaterial)({vertexColors:true,side:T.DoubleSide,fog:true});
    const random=randomSource(recipe.seed+'|short-sward-v1'),cells=mobile?168:224,transforms:T.Matrix4[]=[],tints:T.Color[]=[],object=new T.Object3D();
    for(let row=0;row<cells;row++)for(let col=0;col<cells;col++){
      const x=-50+(col+.15+random()*.7)*100/cells,z=-50+(row+.15+random()*.7)*100/cells;
      const mask=environmentMasks(x,z,recipe.seed,clearing),directed=composition?.mask(x,z),accept=random(),scale=.65+random()*.8,yaw=random()*Math.PI*2,tint=random();
      if(!supportsGrass(x,z,.16)||accept>clump(x,z)*(directed?(composition!.profile.focal.centerDensity+directed.open*.6)*(1+directed.framing):finalComposition?smooth(.7,1.15,mask.open)*.7:(.035+.65*mask.open)))continue;
      // Only the painted grassy terrain receives this layer; exposed dirt stays bare.
      object.position.set(x,terrainHeight(x,z,recipe.seed)-.008,z);object.rotation.set(0,yaw,0);object.scale.set(scale,scale*(.8+tint*.4),scale);object.updateMatrix();transforms.push(object.matrix.clone());
      tints.push(new T.Color('#e5ebbe').lerp(new T.Color('#88b17c'),tint));
    }
    if(fullComposition)grassCloudResponse(material,composition);
    const mesh=new T.InstancedMesh(geometry,material,transforms.length);mesh.name='foundation-short-sward';
    transforms.forEach((matrix,i)=>{mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,tints[i]);});mesh.receiveShadow=lit;mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();scene.add(mesh);
    scene.userData.environment.groundTile='2048 × 2048 × 3 painted materials';scene.userData.environment.grassAtlas='2048 × 2048';
    scene.userData.environment.instances.push({name:mesh.name,count:mesh.count,triangles:mesh.count*3});scene.userData.environment.grassDrawCalls=3;
  }
  if(finalComposition&&recipe.trees.length){
    const shrubs=scene.children.find(o=>o instanceof T.InstancedMesh&&o.count===65) as T.InstancedMesh|undefined;
    if(shrubs){const rand=randomSource(recipe.seed+'|understory-groups-v1'),matrix=new T.Matrix4(),position=new T.Vector3();
      for(let i=0;i<shrubs.count;i++){shrubs.getMatrixAt(i,matrix);const tree=recipe.trees[i%recipe.trees.length],angle=rand()*Math.PI*2,radius=1.2+rand()*2.4;position.set(tree.position[0]+Math.cos(angle)*radius,0,tree.position[2]+Math.sin(angle)*radius);if(composition){for(let attempt=0;attempt<160;attempt++){const x=(rand()-.5)*88,z=-35+rand()*68,m=composition.mask(x,z);if(m.open>.95&&rand()<m.framing*.65){position.set(x,0,z);break;}}}
        position.y=terrainHeight(position.x,position.z,recipe.seed);matrix.setPosition(position);shrubs.setMatrixAt(i,matrix);}shrubs.instanceMatrix.needsUpdate=true;shrubs.computeBoundingSphere();
    }
  }
  const groundMode=typeof location==='undefined'?'B':new URLSearchParams(location.search).get('groundLighting')??'B';
  if(fullComposition&&groundMode!=='A'){
    const field=groundCompositionField(composition,composition.profile.groundLighting??defaultGroundLighting);
    scene.userData.groundCompositionLighting={...field,debug:groundMode==='debug'};
    const illumination=illuminationEnabled(composition)?resolvePainterlyIllumination(composition,composition.profile.illumination??defaultPainterlyIllumination):undefined;
    const illuminationDebug=typeof location!=='undefined'&&new URLSearchParams(location.search).get('illumination')==='debug';
    scene.userData.painterlyIllumination=illumination??null;
    if(ground)installGroundLighting(ground.material,field,false,groundMode==='debug',illumination,illuminationDebug);
    scene.children.forEach(o=>{if(o instanceof T.InstancedMesh&&(o.name.startsWith('foundation-grass')||o.name==='foundation-short-sward'||o.count===65)){
      const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>installGroundLighting(m,field,true,groundMode==='debug',illumination,illuminationDebug));
    }});
  }
  return ()=>{texture.dispose();grassTexture.dispose();loaded.forEach(t=>t.dispose());};
}

export interface AttentionSettings {
  atmosphere?:{near:number;far:number;strength:number;color:string};
  sun?:T.DirectionalLight;
  deciduous?:boolean;
  composition?:ResolvedEncounterComposition;
  anchor?:T.Vector3;direction?:T.Vector3;
  focalCenter?:T.Vector3;focalRadii?:T.Vector3;focalWeight?:number;
  /** Diagnostic only: compare identical geometry/camera at a fixed treatment depth. */
  studyDepth?:number;
}

/** Shader-only grading: original pigments, geometry, atlas, seeds and lighting survive. */
export function installTreeAttention(material:T.Material,kind:'library'|'billboards'|'wood',settings:AttentionSettings={}){
  const art=typeof location!=='undefined'&&new URLSearchParams(location.search).get('environmentArt')!=='0';
  const uniforms={attentionAnchor:{value:settings.anchor??new T.Vector3(0,0,34)},attentionDirection:{value:settings.direction??new T.Vector3(0,0,-1)},attentionFocus:{value:settings.focalCenter??new T.Vector3()},attentionRadii:{value:settings.focalRadii??new T.Vector3(1,1,1)},attentionWeight:{value:T.MathUtils.clamp(settings.focalWeight??0,0,1)},attentionStudyDepth:{value:settings.studyDepth??-1},attentionAir:{value:new T.Color(settings.atmosphere?.color??'#c5d9cc').convertLinearToSRGB()}};
  const composition=settings.composition;
  const direct=!!settings.sun;
  const sunUniforms={actualSunDirection:{value:new T.Vector3(-.6,.85,.55).normalize()},actualSunColor:{value:new T.Color()},actualSunPower:{value:1}};
  if(settings.sun){const sun=settings.sun;material.onBeforeRender=()=>{sunUniforms.actualSunDirection.value.copy(sun.position).sub(sun.target.position).normalize();sunUniforms.actualSunColor.value.copy(sun.color);sunUniforms.actualSunPower.value=sun.intensity/4.1;if(material instanceof T.ShaderMaterial)material.uniformsNeedUpdate=true;};}
  const previous=material.onBeforeCompile,cache=material.customProgramCacheKey.bind(material);
  material.onBeforeCompile=(shader,renderer)=>{
    previous.call(material,shader,renderer);Object.assign(shader.uniforms,uniforms,sunUniforms);
    if(direct&&kind==='library'){
      shader.vertexShader='uniform vec3 actualSunDirection;varying float actualNdotL;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('vec3 key=normalize(mix(vec3(-.6,.85,.55),vec3(-.6,.85,.55),sage));','vec3 key=normalize(actualSunDirection);actualNdotL=max(0.,dot(N,key));');
    }
    shader.vertexShader='varying vec3 attentionWorld;\n'+shader.vertexShader;
    if(kind==='library'){
      shader.vertexShader='attribute vec4 treePigment;attribute vec2 treeCrown;varying vec4 attentionPigment;varying float attentionHeight;varying float attentionSun;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('gl_Position=','attentionSun=sunFacing;attentionWorld=canopyWorld;attentionPigment=treePigment;attentionHeight=clamp((canopyWorld.y-treeCrown.x)/max(.1,treeCrown.y-treeCrown.x),0.,1.);\n gl_Position=');
    }
    else if(kind==='billboards')shader.vertexShader=shader.vertexShader.replace('gl_Position=','attentionWorld=(modelMatrix*vec4(cardCenter,1.)).xyz;\n gl_Position=');
    else shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nattentionWorld=(modelMatrix*vec4(transformed,1.)).xyz;');
    shader.fragmentShader=/*glsl*/`
      ${direct&&kind==='library'?'varying float actualNdotL;uniform vec3 actualSunColor;uniform float actualSunPower;':''}
      ${kind==='library'?'varying vec4 attentionPigment;varying float attentionHeight;varying float attentionSun;':''}
      varying vec3 attentionWorld;
      uniform vec3 attentionAnchor;uniform vec3 attentionDirection;uniform vec3 attentionFocus;uniform vec3 attentionRadii;uniform vec3 attentionAir;
      uniform float attentionWeight;uniform float attentionStudyDepth;
      float attentionFocal(){return (1.-smoothstep(.65,1.35,length((attentionWorld-attentionFocus)/attentionRadii)))*attentionWeight;}
      vec3 attentionGrade(vec3 pigment){
        float depth=attentionStudyDepth>=0.?attentionStudyDepth:max(0.,dot(attentionWorld-attentionAnchor,attentionDirection));
        float focus=attentionFocal();
        float middle=smoothstep(52.,90.,depth)*(1.-focus),back=smoothstep(64.,110.,depth)*(1.-focus);
        float value=dot(pigment,vec3(.2126,.7152,.0722));
        float warm=smoothstep(.18,.48,value)*(.5+.5*sin(dot(attentionWorld,vec3(.19,.11,.16))));
        vec3 rich=pigment*mix(${art?'vec3(.68,.93,.84),vec3(1.16,1.08,.86)':'vec3(.83,.94,.86),vec3(1.12,1.035,.9)'},warm);
        vec3 result=mix(rich,pigment,middle*.75);
        float grey=dot(result,vec3(.2126,.7152,.0722));
        result=mix(result,vec3(grey),middle*.1+back*.15);
        result=mix(result,vec3(.17,.235,.22),middle*.07+back*.14);
        result*=mix(vec3(1.),vec3(.91,1.015,1.055),back);
        ${kind==='library'&&art?`
        float interior=smoothstep(.25,.8,attentionHeight)*smoothstep(.1,.75,attentionSun);
        float chroma=dot(result,vec3(.2126,.7152,.0722));
        result=mix(vec3(chroma),result,attentionPigment.y);
        result*=vec3(1.+attentionPigment.x,1.,1.-attentionPigment.x*.65)*attentionPigment.z;
        result*=mix(vec3(.63,.83,.79),vec3(1.08,1.07,.94),interior);
        float selectedTree=${composition?composition.selected.map(t=>`(1.-smoothstep(.35,1.,length(attentionWorld-vec3(${t.center.x.toFixed(4)},${t.center.y.toFixed(4)},${t.center.z.toFixed(4)}))/${t.radius.toFixed(4)}))`).reduce((a,b)=>`max(${a},${b})`,'0.'):'attentionPigment.w'};
        float gold=selectedTree*interior*(1.-back)*${composition?composition.profile.emphasis.strength.toFixed(4):'.65'};
        result=mix(result,result*vec3(1.55,1.25,.67)+vec3(.055,.035,0.),gold);
        ${direct&&composition&&illuminationEnabled(composition)?`float crownLight=selectedTree*smoothstep(.25,.85,actualNdotL)*smoothstep(.45,.85,attentionHeight)*(1.-back)*${(composition.profile.illumination??defaultPainterlyIllumination).crownStrength.toFixed(5)};
        result=mix(result,result*vec3(1.32,1.22,.81)+vec3(.025,.025,0.),crownLight);`:''}
        `:''}
        ${direct&&kind==='library'&&new URLSearchParams(location.search).get('lighting')===null||direct&&kind==='library'&&new URLSearchParams(location.search).get('lighting')==='final'?`
        float cluster=.5+.5*sin(dot(attentionWorld,vec3(.67,.39,.51))+sin(attentionWorld.y*.8));
        result*=mix(vec3(.86,.94,1.02),vec3(1.08,1.04,.88),cluster*.65);
        ${settings.deciduous?'result=mix(result,result*vec3(1.35,1.2,.7)+vec3(.025,.025,0.),smoothstep(.58,.9,cluster)*attentionSun*smoothstep(.5,.85,attentionHeight)*(1.-back)*.6);':''}
        result=mix(result,result*vec3(.88,.98,1.07),back*.4);
        `:''}
        ${composition?`float quiet=smoothstep(${composition.profile.background.near.toFixed(4)},${composition.profile.background.far.toFixed(4)},depth);
        float neutral=dot(result,vec3(.2126,.7152,.0722));
        result=mix(result,vec3(neutral),quiet*${(1-composition.profile.background.saturation).toFixed(4)});
        result=mix(result,vec3(.11,.18,.17),quiet*${(1-composition.profile.background.contrast).toFixed(4)});`:''}
        return result;
      }
    `+shader.fragmentShader;
    if(composition)shader.fragmentShader=cloudShader(composition)+'\n'+shader.fragmentShader;
    if(kind==='library'){
      const irradiance=direct?`shaded*=vec3(.32,.48,.55)+actualSunColor*actualSunPower*actualNdotL*1.65${composition?'*cloudTransmission(attentionWorld)':''};`:'';
      shader.fragmentShader=shader.fragmentShader.replace('gl_FragColor=vec4(shaded,1.);',`shaded=attentionGrade(shaded);${irradiance}gl_FragColor=vec4(shaded,1.);`);
      // Match Three's Fog: camera-forward depth, smoothstep, then blend in output colour space.
      shader.fragmentShader=shader.fragmentShader.replace('#include <colorspace_fragment>',`#include <colorspace_fragment>
        float atmosphereDepth=attentionStudyDepth>=0.?attentionStudyDepth:max(0.,-(viewMatrix*vec4(attentionWorld,1.)).z);
        gl_FragColor.rgb=mix(gl_FragColor.rgb,attentionAir,smoothstep(${settings.atmosphere?`${settings.atmosphere.near.toFixed(3)},${settings.atmosphere.far.toFixed(3)}`:art?'76.,175.':'42.,145.'},atmosphereDepth)${settings.atmosphere?'*'+settings.atmosphere.strength.toFixed(4):''}*(1.-attentionFocal()*.65));
      `);
    }else{
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight=attentionGrade(outgoingLight);\n#include <opaque_fragment>');
      shader.fragmentShader=shader.fragmentShader.replace('#include <fog_fragment>',T.ShaderChunk.fog_fragment.replaceAll('vFogDepth','(attentionStudyDepth>=0.?attentionStudyDepth:vFogDepth)').replace('fogColor, fogFactor','fogColor, fogFactor*(1.-attentionFocal()*.65)'));
    }
  };
  material.customProgramCacheKey=()=>cache()+`|attention-v2-${kind}-${direct}`+(settings.atmosphere?'|'+JSON.stringify(settings.atmosphere):'');material.needsUpdate=true;return uniforms;
}

export function sceneAttention(recipe:SceneRecipe,options:EnvironmentOptions={}):AttentionSettings{
  const tree=recipe.trees.find(t=>t.index===options.focal?.treeIndex);
  if(!tree)return {};
  const d=tree.model.dimensions;
  return {focalWeight:options.focal?.weight,focalCenter:new T.Vector3(tree.position[0],tree.position[1]+d.height*.52,tree.position[2]),focalRadii:new T.Vector3(d.crownWidth*.65,d.height*.65,d.crownDepth*.65)};
}
