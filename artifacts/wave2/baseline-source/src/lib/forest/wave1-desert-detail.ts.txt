import * as T from 'three';
import type {SceneRecipe} from './recipe';
import {cameraSpace, landscapeField, type FieldPlan} from './wave1-fields';
import {randomSource} from './random';

/** Connected bedding fragments, each clipped by geological joint planes. No spherical basis. */
export function geologicalAssembly(variant:number):T.BufferGeometry{
 const rand=randomSource('desert-fracture-assembly-'+variant),positions:number[]=[],colors:number[]=[];
 const parts=[[-.25,0,-.08,.72,.90,.68],[.61,-.34,.23,.48,.47,.65],[-.69,-.36,.26,.42,.56,.50],[.05,.34,-.54,.58,.62,.37],[-.72,-.57,.58,.42,.28,.4],[.69,-.59,.48,.4,.25,.38],[.1,-.65,.8,.5,.22,.3],[-.2,-.48,-.77,.42,.34,.35]];
 for(let k=0;k<9;k++){const a=rand()*Math.PI*2;parts.push([Math.cos(a)*(.7+rand()*.3),-.7+rand()*.16,Math.sin(a)*(.7+rand()*.3),.11+rand()*.17,.09+rand()*.15,.12+rand()*.18]);}
 for(const [cx,cy,cz,sx,sy,sz]of parts){
  const planes:T.Plane[]=[];
  for(const n of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])planes.push(new T.Plane(new T.Vector3(...n),-(.84+rand()*.18)));
  for(let j=0;j<9;j++){const a=j*2.399+variant*.4,n=new T.Vector3(Math.cos(a),.3+rand()*.75,Math.sin(a)).normalize();if(j%3===0)n.y*=-1;planes.push(new T.Plane(n,-(1.02+rand()*.18)));}
  const vertices:T.Vector3[]=[];
  for(let a=0;a<planes.length;a++)for(let b=a+1;b<planes.length;b++)for(let c=b+1;c<planes.length;c++){
   const p=planes[a],q=planes[b],r=planes[c],qr=new T.Vector3().crossVectors(q.normal,r.normal),det=p.normal.dot(qr);if(Math.abs(det)<1e-5)continue;
   const v=qr.multiplyScalar(-p.constant).add(new T.Vector3().crossVectors(r.normal,p.normal).multiplyScalar(-q.constant)).add(new T.Vector3().crossVectors(p.normal,q.normal).multiplyScalar(-r.constant)).divideScalar(det);
   if(planes.every(plane=>plane.distanceToPoint(v)<1e-5)&&!vertices.some(o=>o.distanceToSquared(v)<1e-8))vertices.push(v);
  }
  // Instance pigment already supplies the stone albedo; vertex values only modulate it.
  const tint=new T.Color('#c79e78').lerp(new T.Color('#8d715c'),rand()*.6).lerp(new T.Color('white'),.78),tilt=.12+variant*.08;
  const rotation=new T.Euler((rand()-.5)*.28,.18+(rand()-.5)*.65,(rand()-.5)*.22);
  for(const plane of planes){const face=vertices.filter(v=>Math.abs(plane.distanceToPoint(v))<1e-4);if(face.length<3)continue;const center=face.reduce((a,v)=>a.add(v),new T.Vector3()).divideScalar(face.length),u=face[0].clone().sub(center).normalize(),v=new T.Vector3().crossVectors(plane.normal,u);
   face.sort((a,b)=>Math.atan2(a.clone().sub(center).dot(v),a.clone().sub(center).dot(u))-Math.atan2(b.clone().sub(center).dot(v),b.clone().sub(center).dot(u)));
   for(let i=1;i<face.length-1;i++)for(const p of [face[0],face[i],face[i+1]]){const v=new T.Vector3(p.x*sx,p.y*sy,p.z*sz).applyEuler(rotation),x=v.x+cx,y=v.y+cy,z=v.z+cz;positions.push(x,y+Math.sin(x*2.1+variant)*.035+z*tilt,z);tint.toArray(colors,colors.length);}
  }
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();g.computeBoundingSphere();g.computeBoundingBox();return g;
}

// The detail layer is optional and leaves all original block transforms and the horizon alone.
const noiseGLSL = `
float ddHash(vec3 p) {p=fract(p*.3183099+vec3(.13,.37,.71));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float ddNoise(vec3 p) {vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(mix(ddHash(i),ddHash(i+vec3(1,0,0)),f.x),mix(ddHash(i+vec3(0,1,0)),ddHash(i+vec3(1,1,0)),f.x),f.y),
mix(mix(ddHash(i+vec3(0,0,1)),ddHash(i+vec3(1,0,1)),f.x),mix(ddHash(i+vec3(0,1,1)),ddHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float ddFbm(vec3 p) {return .57*ddNoise(p)+.28*ddNoise(p*2.07)+.15*ddNoise(p*4.17);}
`;

function worldVarying(shader: {vertexShader:string;fragmentShader:string}) {
  shader.vertexShader='varying vec3 ddWorld; varying vec3 ddLocal; varying vec3 ddTriNormal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
ddLocal=position; ddTriNormal=normal; vec4 ddP=vec4(transformed,1.);
#ifdef USE_INSTANCING
ddP=instanceMatrix*ddP;
ddTriNormal=mat3(instanceMatrix)*ddTriNormal;
#endif
ddWorld=(modelMatrix*ddP).xyz;ddTriNormal=normalize(mat3(modelMatrix)*ddTriNormal);`);
  shader.fragmentShader='varying vec3 ddWorld; varying vec3 ddLocal; varying vec3 ddTriNormal;\n'+noiseGLSL+shader.fragmentShader;
}

let mineralTexture:T.DataTexture|undefined;
/** Connected, chipped mineral plates; periodic cell distances avoid a square texture seam. */
function mineralPlateTexture() {
  if(mineralTexture)return mineralTexture;
  const size=512,data=new Uint8Array(size*size*4),r=randomSource('desert-mineral-plate-3');
  const sites=Array.from({length:29},()=>({x:r(),y:r(),value:.79+r()*.28,broken:r()}));
  const wave=(x:number,y:number)=>Math.sin(x*47+y*71)*.5+Math.sin(x*113-y*89)*.3+Math.sin(x*197+y*173)*.2;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const u=x/size,v=y/size,warp=wave(u,v)*.004;
    let first=10,second=10,which=0;
    sites.forEach((s,i)=>{const ax=Math.abs(u+warp-s.x),ay=Math.abs(v-warp*.6-s.y),dx=Math.min(ax,1-ax),dy=Math.min(ay,1-ay),d=dx*dx+dy*dy;
      if(d<first){second=first;first=d;which=i;}else if(d<second)second=d;
    });
    const site=sites[which],edge=second-first;
    const chipped=wave(u*3.1,v*3.1),seam=(.00045+Math.max(0,chipped)*.0011)*(site.broken>.24?1:.28);
    const crack=Math.max(0,1-edge/seam),lip=Math.max(0,1-Math.abs(edge-seam*2)/(seam*2));
    const flake=Math.max(0,wave(u*1.4,v*1.4)-.25),grain=r()-.5;
    const value=site.value*(1-crack*.48)+lip*.13+flake*.085+grain*.045;
    const i=(y*size+x)*4;data[i]=Math.min(255,value*239);data[i+1]=Math.min(255,value*233);data[i+2]=Math.min(255,value*220);data[i+3]=255;
  }
  mineralTexture=new T.DataTexture(data,size,size,T.RGBAFormat);mineralTexture.wrapS=mineralTexture.wrapT=T.RepeatWrapping;
  mineralTexture.minFilter=T.LinearMipmapLinearFilter;mineralTexture.magFilter=T.LinearFilter;mineralTexture.generateMipmaps=true;mineralTexture.colorSpace=T.SRGBColorSpace;mineralTexture.needsUpdate=true;
  return mineralTexture;
}

/** Inexpensive directional fracture planes, mineral islands and fine granite grain. */
export function desertRockMaterial():T.MeshStandardMaterial {
  const material=new T.MeshStandardMaterial({roughness:.94});
  material.onBeforeCompile=shader=>{
    worldVarying(shader);
    shader.uniforms.ddMineral={value:mineralPlateTexture()};
    shader.fragmentShader='uniform sampler2D ddMineral;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec3 rp=ddWorld; float macro=ddFbm(rp*.85),grain=ddNoise(rp*35.);
float warp=(ddNoise(rp*2.4)-.5)*.14;
float j1=abs(sin(dot(rp,vec3(.72,.31,.24))*2.7+warp*3.));
float j2=abs(sin(dot(rp,vec3(-.22,.81,.57))*1.8+1.7+warp));
float joint=min(j1,j2); float crack=1.-smoothstep(.009,.032,joint);
// Broken discontinuous seams, with wider pale weathered shoulders instead of ink outlines.
crack*=smoothstep(.32,.55,ddFbm(rp*3.2));
float shoulder=(1.-smoothstep(.025,.13,joint))*(1.-crack);
float mineral=smoothstep(.44,.67,ddFbm(rp*3.1+vec3(macro*3.)));
vec3 pigment=mix(vec3(.66,.57,.47),vec3(1.08,1.01,.88),macro);
pigment=mix(pigment,vec3(.73,.69,.61),mineral*.42);
pigment+=shoulder*.12; pigment*=1.-crack*.48;
pigment*=.98+.04*grain;
vec3 tw=pow(abs(ddTriNormal),vec3(5.));tw/=max(.001,tw.x+tw.y+tw.z);
vec3 stone=texture2D(ddMineral,rp.yz*.29).rgb*tw.x+texture2D(ddMineral,rp.xz*.29).rgb*tw.y+texture2D(ddMineral,rp.xy*.29).rgb*tw.z;
diffuseColor.rgb*=pigment*mix(vec3(1.),stone, .68);
`);
  };
  material.customProgramCacheKey=()=> 'desert-mineral-joints-3';
  return material;
}

/** Small intersecting joint offsets, retaining the parent block's large planes and volume. */
export function weatherRockGeometry(g:T.BufferGeometry,variant:number):T.BufferGeometry {
  const p=g.getAttribute('position');
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const cut=Math.max(0,x*.34+y*.21-z*.76-.68)*.075;
    const wear=Math.sin(x*7.1+z*3.7+variant*2)*Math.sin(y*6.3-z*2.4)*.012;
    // One oblique weathered joint step breaks large blank faces into unequal slabs.
    const plane=x*.48-y*.19+z*.76+.12+variant*.16;
    const step=Math.max(0,1-Math.abs(plane)/.15)*.045;
    p.setXYZ(i,x+wear-cut*.34-step*.48,y+wear*.32-cut*.21+step*.19,z+wear*.6+cut*.76-step*.76);
  }
  g.computeVertexNormals();g.computeBoundingSphere();return g;
}

function tuftGeometry() {
  const positions:number[]=[],colors:number[]=[],indices:number[]=[];
  const r=randomSource('desert-low-fibre-geometry');
  for(let blade=0;blade<19;blade++){
    const a=r()*Math.PI*2,l=.11+r()*.26,reach=.05+r()*.15,w=.006+r()*.008;
    const dx=Math.cos(a),dz=Math.sin(a),base=positions.length/3;
    for(let k=0;k<4;k++){const t=k/3,y=l*Math.sin(t*Math.PI*.63),rad=reach*t*t,width=w*(1-t*.91);
      for(const s of [-1,1]){positions.push(dx*rad-dz*width*s,y,dz*rad+dx*width*s);colors.push(.64+t*.27,.56+t*.2,.32+t*.13);}
    }
    for(let k=0;k<3;k++){const b=base+k*2;indices.push(b,b+1,b+2,b+1,b+3,b+2);}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return g;
}

/** Low broad forks with exposed wood and paired flat leaves, never spherical foliage lobes. */
function xericShrubGeometry(variant:number) {
  const positions:number[]=[],colors:number[]=[],indices:number[]=[],r=randomSource('xeric-open-forks-'+variant);
  const wood=new T.Color('#716447'),leaf=new T.Color('#78816a'),tip=new T.Color('#a4a478');
  function tube(a:T.Vector3,b:T.Vector3,radius:number){
    const axis=b.clone().sub(a).normalize(),u=new T.Vector3(axis.z,0,-axis.x).normalize(),v=new T.Vector3().crossVectors(axis,u),base=positions.length/3;
    for(let k=0;k<2;k++)for(let j=0;j<5;j++){const angle=j*Math.PI*2/5,p=(k?b:a).clone().addScaledVector(u,Math.cos(angle)*radius*(k?.55:1)).addScaledVector(v,Math.sin(angle)*radius*(k?.55:1));positions.push(p.x,p.y,p.z);wood.toArray(colors,colors.length);}
    for(let j=0;j<5;j++){const n=(j+1)%5;indices.push(base+j,base+n,base+j+5,base+n,base+n+5,base+j+5);}
  }
  function leaves(center:T.Vector3,direction:number){
    for(let j=0;j<7;j++){
      const a=direction+j*2.4+r()*.9,l=.045+r()*.06,w=l*(.24+r()*.19),base=positions.length/3;
      const root=center.clone().add(new T.Vector3((r()-.5)*.065,(r()-.5)*.07,(r()-.5)*.065));
      const end=root.clone().add(new T.Vector3(Math.cos(a)*l,l*(.25+r()*.6),Math.sin(a)*l));
      const mid=root.clone().lerp(end,.48),cross=new T.Vector3(-Math.sin(a)*w,w*.18,Math.cos(a)*w);
      for(const p of [root,mid.clone().add(cross),end,mid.clone().sub(cross)]){positions.push(p.x,p.y,p.z);leaf.clone().lerp(tip,r()*.6).toArray(colors,colors.length);}
      indices.push(base,base+1,base+2,base,base+2,base+3);
    }
  }
  for(let stem=0;stem<7;stem++){
    const a=stem*2.399+variant*.9+r()*.5,reach=.35+r()*.32,height=.22+r()*.42;
    const root=new T.Vector3((r()-.5)*.10,0,(r()-.5)*.10),elbow=new T.Vector3(Math.cos(a)*reach*.36,height*.44,Math.sin(a)*reach*.36),end=new T.Vector3(Math.cos(a)*reach,height,Math.sin(a)*reach);
    tube(root,elbow,.014+r()*.005);tube(elbow,end,.008);
    for(let twig=0;twig<3;twig++){
      const t=.35+twig*.24,start=elbow.clone().lerp(end,t),angle=a+(twig%2?-.8:.8),finish=start.clone().add(new T.Vector3(Math.cos(angle)*(.12+r()*.16),.10+r()*.13,Math.sin(angle)*(.12+r()*.16)));
      tube(start,finish,.004);leaves(finish,angle);
    }
    leaves(end,a);
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return g;
}

export function installDesertDetail(scene:T.Scene,recipe:SceneRecipe,plan:FieldPlan,assembly=false):()=>void {
  const group=new T.Group();group.name='field-desert-detail';scene.add(group);
  const r=randomSource(recipe.seed+'|desert-contact-detail-1'),o=new T.Object3D();
  const field=(x:number,z:number)=>landscapeField('desert',recipe.seed,x,z);
  const terrainMaterials=new Set<T.MeshStandardMaterial>();
  const restores:Array<()=>void>=[];
  scene.traverse(child=>{
    if(!(child instanceof T.Mesh)||child.name!=='connected-field-terrain'||!(child.material instanceof T.MeshStandardMaterial))return;
    terrainMaterials.add(child.material);
    const geometry=child.geometry,position=geometry.getAttribute('position'),previous=geometry.getAttribute('ddDepositional'),values=new Float32Array(position.count*2);
    for(let i=0;i<position.count;i++){const f=field(position.getX(i),position.getZ(i));values[i*2]=f.substrate;values[i*2+1]=f.moisture;}
    geometry.setAttribute('ddDepositional',new T.BufferAttribute(values,2));
    restores.push(()=>{if(previous)geometry.setAttribute('ddDepositional',previous);else geometry.deleteAttribute('ddDepositional');});
  });
  for(const material of terrainMaterials){
    const previous=material.onBeforeCompile,previousKey=material.customProgramCacheKey;
    material.onBeforeCompile=(shader,renderer)=>{
      previous.call(material,shader,renderer);worldVarying(shader);
      shader.vertexShader='attribute vec2 ddDepositional; varying vec2 ddDeposit;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nddDeposit=ddDepositional;');
      shader.fragmentShader='varying vec2 ddDeposit;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec3 sp=ddWorld;float broad=ddFbm(sp*vec3(.12,.03,.14));
float fine=ddNoise(sp*27.);float grit=ddNoise(sp*88.);
// Actual cool mineral pigment replaces orange multiplication. Existing field controls
// compacted exposed substrate versus pale mobile sediment; no new terrain is inferred.
float wash=ddFbm(vec3(sp.x*.21+sp.z*.035,sp.z*.18,broad*1.8));
float brokenField=mix(broad,ddFbm(sp*vec3(.31,.05,.28)),.34);
float compact=smoothstep(.38,.69,brokenField*.66+ddDeposit.x*.28+(1.-ddDeposit.y)*.15);
float sediment=smoothstep(.43,.64,wash+ddDeposit.y*.10-ddDeposit.x*.08);
vec3 compactEarth=vec3(.19,.188,.165);
vec3 paleSediment=vec3(.62,.52,.385);
vec3 ironSand=diffuseColor.rgb*vec3(.90,.94,1.03);
vec3 sand=mix(ironSand,compactEarth,compact*.53);
sand=mix(sand,paleSediment,sediment*.38);
sand*=.97+.06*fine;sand*=1.-smoothstep(.78,.92,grit)*.10;
${assembly?`// Nested sediment structure: broken exposed flakes, compacted silt and fine runoff.
float flake=smoothstep(.61,.73,ddFbm(sp*vec3(2.8,.2,3.1)))*smoothstep(.35,.7,ddDeposit.x);
float rill=(1.-smoothstep(.018,.065,abs(ddFbm(sp*vec3(.55,.1,.72))-.5)))*smoothstep(.42,.65,ddNoise(sp*.13));
sand=mix(sand,sand*vec3(.80,.85,.91),flake*.36);
sand*=1.-rill*.10;
`:''}
diffuseColor.rgb=sand;
`);
    };
    material.customProgramCacheKey=()=>previousKey.call(material)+'|desert-substrate-3'+(assembly?'|assembly-sediment-1':'');material.needsUpdate=true;
    restores.push(()=>{material.onBeforeCompile=previous;material.customProgramCacheKey=previousKey;material.needsUpdate=true;});
  }
  // The gravel budget is concentrated in irregular field-correlated patches and at rock feet.
  const points:Array<{x:number;z:number;size:number}>=[];
  for(let i=0;i<14500&&points.length<1950;i++){
    const x=plan.eye[0]+(r()-.5)*125,z=plan.eye[2]+(r()-.5)*125,q=cameraSpace(plan,x,z),f=field(x,z);
    if(Math.hypot(q.side,q.forward)<1.7||r()>.06+f.substrate*.52+f.rock*.3)continue;
    const staged=q.forward>2&&q.forward<7&&Math.abs(q.side)<1.5;
    points.push({x,z,size:staged?.015+r()*.01:.018+Math.pow(r(),2)*.085});
  }
  // Read existing transforms rather than reproducing the rock-placement random stream.
  const matrix=new T.Matrix4(),p=new T.Vector3(),rotation=new T.Quaternion(),scale=new T.Vector3();
  const shrubCandidates:Array<{x:number;z:number;distance:number}>=[];
  scene.traverse(child=>{if(!(child instanceof T.InstancedMesh)||child.name!=='field-jointed-bedrock')return;
    for(let i=0;i<child.count;i++){child.getMatrixAt(i,matrix);matrix.decompose(p,rotation,scale);
      if(Math.hypot(p.x-plan.eye[0],p.z-plan.eye[2])>85)continue;
      const rockQ=cameraSpace(plan,p.x,p.z);
      if(rockQ.forward>2&&rockQ.forward<62&&Math.abs(rockQ.side)>4&&Math.abs(rockQ.side)<28){
        const inward=-Math.sign(rockQ.side)*(Math.max(scale.x,scale.z)+.16),x=p.x+Math.cos(plan.heading)*inward,z=p.z+Math.sin(plan.heading)*inward,q=cameraSpace(plan,x,z);
        if(!(q.forward>0&&q.forward<9&&Math.abs(q.side)<2.8))shrubCandidates.push({x,z,distance:Math.hypot(q.forward,q.side)});
      }
      for(let j=0;j<9;j++){const a=r()*Math.PI*2,d=Math.max(scale.x,scale.z)*(.6+r()*.7),x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d,q=cameraSpace(plan,x,z);
        const staged=q.forward>2&&q.forward<7&&Math.abs(q.side)<1.5;
        points.push({x,z,size:staged?.015+r()*.01:.075+Math.pow(r(),1.5)*.3});}
    }
  });
  const gravel=new T.InstancedMesh(new T.DodecahedronGeometry(1,0),desertRockMaterial(),points.length);gravel.name='desert-contact-gravel';
  points.forEach((p,i)=>{o.position.set(p.x,field(p.x,p.z).height+p.size*.14,p.z);o.rotation.set(r(),r()*6.28,r());o.scale.set(p.size*(.8+r()*.8),p.size*.42,p.size);o.updateMatrix();gravel.setMatrixAt(i,o.matrix);gravel.setColorAt(i,new T.Color('#a68b6a').lerp(new T.Color('#d6ba90'),r()));});
  gravel.computeBoundingSphere();gravel.receiveShadow=true;group.add(gravel);
  const plants:Array<{x:number;z:number;s:number}>=[];
  for(let i=0;i<20000&&plants.length<250;i++){
    const x=plan.eye[0]+(r()-.5)*105,z=plan.eye[2]+(r()-.5)*105,q=cameraSpace(plan,x,z),f=field(x,z);
    if(q.forward>1&&q.forward<8&&Math.abs(q.side)<1.7||Math.hypot(q.side,q.forward)<2.8||r()>f.community*(.04+f.moisture*.15))continue;
    plants.push({x,z,s:.6+r()*.7});
  }
  const shrubs:Array<{x:number;z:number;distance:number}>=[];
  for(const candidate of shrubCandidates.sort((a,b)=>a.distance-b.distance)){
    if(shrubs.length>=8)break;
    if(shrubs.some(p=>Math.hypot(p.x-candidate.x,p.z-candidate.z)<6))continue;
    shrubs.push(candidate);
  }
  plants.splice(-shrubs.length,shrubs.length);
  for(let variant=0;variant<2;variant++){
    const selected=shrubs.filter((_,i)=>i%2===variant),mesh=new T.InstancedMesh(xericShrubGeometry(variant),new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide}),selected.length);mesh.name='desert-unnamed-open-shrub';
    selected.forEach((p,i)=>{o.position.set(p.x,field(p.x,p.z).height-.025,p.z);o.rotation.set(0,r()*Math.PI*2,0);o.scale.setScalar((.85+r()*.35)*(assembly?1.85:1));o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});mesh.computeBoundingSphere();mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);
  }
  const tufts=new T.InstancedMesh(tuftGeometry(),new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide}),plants.length);tufts.name='desert-unnamed-dry-fibres';
  plants.forEach((p,i)=>{o.position.set(p.x,field(p.x,p.z).height-.025,p.z);o.rotation.set(0,r()*6.28,0);o.scale.setScalar(p.s);o.updateMatrix();tufts.setMatrixAt(i,o.matrix);});tufts.computeBoundingSphere();tufts.receiveShadow=true;group.add(tufts);
  group.userData={seed:recipe.seed,gravel:points.length,unnamedDryTufts:plants.length,unnamedOpenShrubs:shrubs.length,ecology:'Generic dry fibre/open shrub functional forms; no species occurrence asserted.',mobile:'Instanced geometry; no alpha textures; device frame time unmeasured.'};
  return()=>{restores.forEach(fn=>fn());scene.remove(group);group.traverse(child=>{if(child instanceof T.Mesh){child.geometry.dispose();for(const m of Array.isArray(child.material)?child.material:[child.material])m.dispose();}});};
}
