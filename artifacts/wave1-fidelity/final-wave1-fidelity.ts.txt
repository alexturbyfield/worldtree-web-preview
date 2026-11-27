import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {erodedMass} from './wave1-desert-direction';
import {collisionFootprint,type FieldBiome,type FieldPlan} from './wave1-fields';
import {randomSource} from './random';

/** Jointed granite-like assembly: one upright core, slumped shoulders, basal talus.
 * Synthetic geological growth form, not a claim about measured regional lithology. */
export function weatheredAssembly(seed:string,variant=0){
 const r=randomSource(seed+'|assembly-'+variant),parts:T.BufferGeometry[]=[];
 const forms=[[-.28,.40,0,.98,1.12,.84,10],[.72,.08,.06,.83,.72,.80,11],[-1.04,-.12,.3,.72,.54,.73,12],[.15,-.38,.82,.85,.33,.53,10],[-.9,-.4,-.48,.60,.32,.57,11],[.97,-.45,.73,.42,.27,.46,12]];
 for(const [i,a]of forms.entries()){
  const g=erodedMass(seed+'|core-'+i, i<2?32:20,a[6]);
  // Different weathered joint directions connect the silhouette without identical lobes.
  g.scale(a[3],a[4],a[5]);g.rotateY((r()-.5)*.8+variant*.48);g.rotateZ((r()-.5)*.38);
  g.translate(a[0]*(variant===1?-1:1),a[1],a[2]);parts.push(g);
 }
 const g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());g.computeBoundingBox();g.computeBoundingSphere();return g;
}

export function mountFidelityGeology(scene:T.Scene,plan:FieldPlan,height:(x:number,z:number)=>number,loaded:()=>void){
 const mineral=new T.TextureLoader().load('/assets/wave1-detail/desert-granite-v1.webp',loaded,undefined,loaded);
 mineral.colorSpace=T.SRGBColorSpace;mineral.wrapS=mineral.wrapT=T.MirroredRepeatWrapping;mineral.anisotropy=4;
 const r=randomSource(plan.seed+'|fidelity-assemblies'),s=Math.sin(plan.heading),c=Math.cos(plan.heading),o=new T.Object3D();
 const dominant=r()<.5?-1:1,placements:{x:number;z:number;size:number;angle:number;variant:number}[]=[];
 const put=(side:number,f:number,size:number,variant:number)=>{const x=plan.eye[0]+s*f+c*side,z=plan.eye[2]-c*f+s*side;
  if(collisionFootprint(plan,x,z,size*1.9))return;
  placements.push({x,z,size,angle:Math.atan2(plan.eye[0]-x,plan.eye[2]-z)+(r()-.5)*.65,variant});};
 // Rock shoulders form a receding chain, not a wall across the open plain.
 for(const [side,f,size,v]of [[7,12,2.7,0],[10.5,20,2.2,1],[14,34,1.7,2],[5,5,1.05,2],[8.5,8,1.3,1],[20,61,1.2,0]])put(side*dominant,f,size,v);
 for(const [side,f,size,v]of [[8.5,17,1.7,1],[5,5.7,.8,2],[13,31,1.1,0],[21,68,.9,2]])put(-side*dominant,f,size,v);
 for(let i=0;i<46;i++){const f=48+r()*700;put((i%2?1:-1)*(10+f*(.1+r()*.48)),f,.25+r()*.9,i%3);}
 for(let v=0;v<3;v++)for(const far of [false,true]){
  const selected=placements.filter(p=>p.variant===v&&(Math.hypot(p.x-plan.eye[0],p.z-plan.eye[2])>48)===far),mat=new T.MeshStandardMaterial({roughness:.9,vertexColors:true});
  mat.onBeforeCompile=shader=>{
   shader.uniforms.geoMineral={value:mineral};
   shader.vertexShader='varying vec3 geoWorld,geoNormal;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    vec4 geoP=vec4(transformed,1.);vec3 geoN=normal;
    #ifdef USE_INSTANCING
    geoP=instanceMatrix*geoP;geoN=mat3(instanceMatrix)*geoN;
    #endif
    geoWorld=(modelMatrix*geoP).xyz;geoNormal=normalize(mat3(modelMatrix)*geoN);`);
   shader.fragmentShader=`varying vec3 geoWorld,geoNormal;uniform sampler2D geoMineral;
    vec3 geoSample(vec3 p){vec3 w=pow(abs(geoNormal),vec3(4.));w/=max(.001,w.x+w.y+w.z);return texture2D(geoMineral,p.yz/2.3).rgb*w.x+texture2D(geoMineral,p.xz/2.3).rgb*w.y+texture2D(geoMineral,p.xy/2.3).rgb*w.z;}
   `+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`diffuseColor.rgb=geoSample(geoWorld)*.95;
    #include <roughnessmap_fragment>`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
    float geoHeight=dot(geoSample(geoWorld),vec3(.2126,.7152,.0722))*.005;
    vec3 geoQ0=dFdx(-vViewPosition),geoQ1=dFdy(-vViewPosition),geoR1=cross(geoQ1,normal),geoR2=cross(normal,geoQ0);
    float geoDet=dot(geoQ0,geoR1);
    vec3 geoGrad=(geoR1*dFdx(geoHeight)+geoR2*dFdy(geoHeight))*sign(geoDet)/max(abs(geoDet),.00001);
    normal=normalize(normal-clamp(geoGrad,vec3(-.32),vec3(.32)));`);
  };mat.customProgramCacheKey=()=> 'fidelity-granite-triplanar-1';
  const mesh=new T.InstancedMesh(far?erodedMass(plan.seed+'|far-rock-'+v,14,10):weatheredAssembly(plan.seed,v),mat,selected.length);mesh.name='field-jointed-bedrock';
  selected.forEach((p,i)=>{o.position.set(p.x,height(p.x,p.z)+p.size*.30,p.z);o.rotation.set(0,p.angle,(r()-.5)*.12);o.scale.setScalar(p.size);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);mesh.setColorAt(i,new T.Color('#c29b7a').lerp(new T.Color('#d8b796'),r()*.65));});
  mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();scene.add(mesh);
 }
 scene.userData.fidelityGeology={assemblies:placements.length,dominant,seed:plan.seed,representation:'six connected weathered cores per assembly; receding geological shoulders'};
}

const fields=`
float fqHash(vec2 p){p=fract(p*vec2(.1031,.11369));p+=dot(p,p.yx+19.19);return fract(p.x*p.y);}
float fqN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(fqHash(i),fqHash(i+vec2(1,0)),f.x),mix(fqHash(i+vec2(0,1)),fqHash(i+vec2(1,1)),f.x),f.y);}
float fqF(vec2 p){return fqN(p)*.58+fqN(p*2.07+9.3)*.28+fqN(p*4.19-3.)*.14;}
`;

/** Last material adapter in the existing chain. No exposure/postprocess/water edits. */
export function installFidelityMaterials(scene:T.Scene,biome:FieldBiome,plan:FieldPlan,sun:T.DirectionalLight){
 const old=scene.onBeforeRender;let installed=false;
 scene.onBeforeRender=function(...args){old.apply(this,args);if(installed)return;installed=true;
  const seen=new Set<T.Material>();
  scene.traverse(o=>{if(!(o instanceof T.Mesh))return;const ground=o.name==='connected-field-terrain',rock=o.name==='field-jointed-bedrock',grass=/meadow|dry-grass|dry-fibres/.test(o.name),leaf=/juvenile-leaves|unnamed-open-shrub/.test(o.name);
   if(o.name==='desert-unnamed-open-shrub'){
    const source=o.geometry,p=source.attributes.position,col=source.attributes.color;
    const positions=Array.from(p.array as ArrayLike<number>),colors=Array.from(col.array as ArrayLike<number>),indices=Array.from(source.index!.array as ArrayLike<number>),rand=randomSource(plan.seed+'|sheltered-xeric-leaves');
    for(let i=0;i<p.count;){if(col.getY(i)<=col.getX(i)*1.03){i++;continue;}
     if(i+3>=p.count)break;
     for(let copy=0;copy<2;copy++){
      const base=positions.length/3,dx=(rand()-.5)*.095,dy=(rand()-.5)*.085,dz=(rand()-.5)*.095;
      for(let k=0;k<4;k++){positions.push(p.getX(i+k)+dx,p.getY(i+k)+dy,p.getZ(i+k)+dz);colors.push(col.getX(i+k)*(.82+rand()*.22),col.getY(i+k)*(.88+rand()*.20),col.getZ(i+k));}
      indices.push(base,base+1,base+2,base,base+2,base+3);
     }i+=4;
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();o.geometry=g;source.dispose();
   }
   if(o.name==='field-dimensional-meadow'){
    const g=o.geometry,p=g.attributes.position;
    for(let row=0;row<p.count;row+=3){let cx=0,cz=0;for(let k=0;k<3;k++){cx+=p.getX(row+k)/3;cz+=p.getZ(row+k)/3;}
     for(let k=0;k<3;k++)p.setXYZ(row+k,cx+(p.getX(row+k)-cx)*.64,p.getY(row+k)*1.12,cz+(p.getZ(row+k)-cz)*.64);}
    p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();
   }
   for(const mat of Array.isArray(o.material)?o.material:[o.material]){
    if(seen.has(mat))continue;seen.add(mat);
    if(mat instanceof T.ShaderMaterial&&mat.uniforms.shadowPigment){
     mat.uniforms.shadowPigment.value.set('#304f3b');mat.uniforms.midPigment.value.set('#648a4a');mat.uniforms.highPigment.value.set('#c4d47b');mat.uniforms.rimStrength.value=.33;
     const before=mat.onBeforeCompile,key=mat.customProgramCacheKey.bind(mat);
     mat.onBeforeCompile=(shader,renderer)=>{before.call(mat,shader,renderer);
      shader.fragmentShader=shader.fragmentShader.replace('shaded=attentionGrade(shaded);',`shaded=attentionGrade(shaded);
       float fqCrownSun=smoothstep(.25,.88,actualNdotL)*smoothstep(.3,.85,attentionHeight);
       shaded=mix(shaded,highPigment*(.65+actualNdotL*.35),fqCrownSun*.65);
       shaded*=mix(vec3(.80,.94,1.10),vec3(1.),smoothstep(.1,.5,actualNdotL));`);
     };mat.customProgramCacheKey=()=>key()+'|fidelity-crown-light-1';mat.needsUpdate=true;continue;
    }
    if(mat instanceof T.MeshBasicMaterial&&o.userData.foliageBillboards){
     const before=mat.onBeforeCompile,key=mat.customProgramCacheKey.bind(mat);
     mat.onBeforeCompile=(shader,renderer)=>{before.call(mat,shader,renderer);
      shader.vertexShader='varying float fqCanopySun;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('canopyLight=vec3(.40,.53,.57)',`fqCanopySun=max(0.,dot(worldN,splitSunDirection));canopyLight=vec3(.32,.46,.55)`);
      shader.fragmentShader='varying float fqCanopySun;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
       float fqLeafValue=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
       vec3 fqLeafBody=mix(vec3(.038,.095,.055),vec3(.24,.30,.075),smoothstep(.12,.75,fqCanopySun));
       diffuseColor.rgb=mix(diffuseColor.rgb,fqLeafBody*(.7+sqrt(fqLeafValue)*.7),.72);`);
     };mat.customProgramCacheKey=()=>key()+'|fidelity-far-crown-1';mat.needsUpdate=true;continue;
    }
    if(!(mat instanceof T.MeshStandardMaterial)||(!ground&&!rock&&!grass&&!leaf))continue;
    const before=mat.onBeforeCompile,key=mat.customProgramCacheKey.bind(mat);
    mat.onBeforeCompile=(shader,renderer)=>{before.call(mat,shader,renderer);
     // Replace the earlier severe art-field attenuation, rather than stacking a
     // brightness adjustment over its almost extinguished direct illumination.
     if(biome!=='desert')shader.fragmentShader=shader.fragmentShader.replace('edgeShade*.97','edgeShade*.48').replace('edgeShade*.50','edgeShade*.28');
     shader.vertexShader='varying vec3 fqWorld;varying float fqBlade;\n'+shader.vertexShader;
     shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      vec4 fqP=vec4(transformed,1.);
      #ifdef USE_INSTANCING
      fqP=instanceMatrix*fqP;
      #endif
      fqWorld=(modelMatrix*fqP).xyz;fqBlade=clamp(position.y/.65,0.,1.);`);
     shader.fragmentShader='varying vec3 fqWorld;varying float fqBlade;\n'+fields+shader.fragmentShader;
     shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`
      vec2 fq=fqWorld.xz;
      float fqMass=fqF(fq*.12+fqN(fq*.025)*4.),fqMeso=fqF(fq*1.8),fqGrain=fqN(fq*65.);
      float fqNearDetail=1.-smoothstep(18.,100.,distance(cameraPosition,fqWorld));
      ${ground?biome==='desert'?`
       float fqWash=fqF(vec2(fq.x*.32+sin(fq.y*.09)*1.5,fq.y*.10));
       vec3 fqEarth=mix(vec3(.30,.19,.12),vec3(.64,.40,.20),smoothstep(.28,.72,fqMass));
       fqEarth=mix(fqEarth,vec3(.74,.54,.33),smoothstep(.48,.72,fqWash)*.65);
       float fqGravel=smoothstep(.70,.82,fqN(fq*18.))*smoothstep(.4,.62,fqMeso);
       float fqRills=(1.-smoothstep(.015,.05,abs(fqF(fq*vec2(.7,.19))-.5)))*smoothstep(.4,.6,fqMass);
       float fqOldValue=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
       diffuseColor.rgb=fqEarth*mix(.76,1.24,clamp(fqOldValue*2.2,0.,1.))*(1.+(fqMeso-.5)*.32*fqNearDetail+(fqGrain-.5)*.12*fqNearDetail);
       diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.72,.77,.85),fqGravel*.4*fqNearDetail+fqRills*.16);
      `:biome==='mangrove'?`
       float fqWet=1.-smoothstep(.005,.18,fqWorld.y);
       float fqInk=clamp(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722))/.22,.3,1.8);
       vec3 fqSediment=mix(vec3(.27,.22,.17),vec3(.57,.40,.24),smoothstep(.22,.76,fqMass));
       fqSediment=mix(fqSediment,vec3(.15,.17,.15),fqWet*.65);
       diffuseColor.rgb=fqSediment*mix(.55,1.40,fqMeso)*mix(.70,1.20,fqInk)*(1.+(fqGrain-.5)*.18*fqNearDetail);
      `:`
       float fqBare=smoothstep(.56,.71,fqN(fq*.16+fqN(fq*.055)*3.));
       vec3 fqMeadow=mix(vec3(.19,.23,.105),vec3(.54,.43,.17),smoothstep(.22,.75,fqMass));
       fqMeadow=mix(fqMeadow,vec3(.39,.33,.22),fqBare*.82);
       float fqInk=clamp(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722))/.25,.35,1.6);
       diffuseColor.rgb=fqMeadow*mix(.72,1.22,fqInk)*(1.+(fqMeso-.5)*.25*fqNearDetail+(fqGrain-.5)*.08*fqNearDetail);
      `:''}
      ${rock?`float fqStone=fqF(fqWorld.xy*1.4+fqWorld.z*.3);diffuseColor.rgb*=mix(vec3(.88,.92,1.02),vec3(1.20,1.12,.97),fqStone);`:''}
      ${grass?`vec3 fqGrassBase=mix(vec3(.065,.10,.04),vec3(.20,.19,.065),fqMass);vec3 fqGrassTip=mix(vec3(.31,.35,.105),vec3(.60,.43,.15),smoothstep(.20,.65,fqMass));diffuseColor.rgb=mix(fqGrassBase,fqGrassTip,smoothstep(.20,.88,fqBlade))*(.85+fqMeso*.25);`:''}
      #include <roughnessmap_fragment>
      ${ground?`roughnessFactor=mix(.38,.96,smoothstep(.0,.17,fqWorld.y));`:''}
     `);
     // Broad broken canopy transmission stays on the terrain when orbiting.
     shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
      vec2 fqLightP=fqWorld.xz-vec2(${plan.eye[0]},${plan.eye[2]});
      float fqAlong=dot(fqLightP,vec2(${Math.sin(plan.heading)},${-Math.cos(plan.heading)}));
      float fqLateral=dot(fqLightP,vec2(${Math.cos(plan.heading)},${Math.sin(plan.heading)}));
      float fqOpening=smoothstep(.26,.64,fqF(fqWorld.xz*.20+vec2(fqAlong*.035,0.)));
      float fqFocal=(1.-smoothstep(4.,18.,abs(fqLateral)))*smoothstep(0.,8.,fqAlong);
      float fqPatterned=fqFocal*(.25+.75*fqOpening);
      reflectedLight.directDiffuse*=mix(.68,1.38,fqPatterned);
      reflectedLight.indirectDiffuse*=mix(vec3(.83,.93,1.08),vec3(1.05,1.,.87),fqPatterned);
     `);
    };mat.customProgramCacheKey=()=>key()+`|fidelity-1|${biome}|${ground}|${rock}|${grass}`;mat.needsUpdate=true;
   }
  });
  scene.userData.fidelityMaterials={biome,seed:plan.seed,worldSpace:true,waterUnchanged:true};
 };
 sun.shadow.intensity=.80;scene.userData.recipeShadowDirty=true;
}


