import * as T from 'three';
import type {FieldBiome,FieldPlan} from './wave1-fields';
import {collisionFootprint,cameraSpace} from './wave1-fields';
import {randomSource} from './random';

/** Isolated world-space texture/light study. No water-shader or ecological data edits. */
export function depthTextureStudy(scene:T.Scene,biome:FieldBiome,plan:FieldPlan,height:(x:number,z:number)=>number,loaded:()=>void,variation=false){
 const maps:T.Texture[]=[],load=(path:string)=>{const map=new T.TextureLoader().load(path,loaded,undefined,loaded);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=4;maps.push(map);return map;};
 const detail=load(biome==='flooded'?'/assets/puget-v1/meadow.png':'/assets/wave1-detail/arid-sediment-v1.webp'),shadow=load('/assets/puget-v1/grass.png');
 const s=Math.sin(plan.heading),c=Math.cos(plan.heading),r=randomSource(plan.seed+'|depth-ground');
 if(biome==='desert'){
  const matte=load('/assets/wave1-detail/desert-distance-v1.webp');matte.wrapS=matte.wrapT=T.ClampToEdgeWrapping;
  const material=new T.MeshBasicMaterial({map:matte,transparent:true,alphaTest:.20,depthWrite:false,side:T.DoubleSide,fog:false,toneMapped:false});
  const backdrop=new T.Mesh(new T.PlaneGeometry(4200,700),material);backdrop.name='depth-distant-plains-matte';backdrop.position.set(plan.eye[0]+s*1550,140,plan.eye[2]-c*1550);backdrop.rotation.y=-plan.heading;scene.add(backdrop);
  // Low land shelves sit beyond the near ecology, not a wall of near mountains.
  for(let layer=0;layer<2;layer++){const g=new T.PlaneGeometry(3600,700,80,12);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),distance=650+layer*430+z;const side=x,base=height(plan.eye[0]+s*distance+c*side,plan.eye[2]-c*distance+s*side);p.setXYZ(i,plan.eye[0]+s*distance+c*side,base+Math.pow(Math.max(0,Math.sin(x*.004+layer*1.9)*.5+.5),3)*(8+layer*9)*Math.pow(Math.sin((z/700+.5)*Math.PI),2),plan.eye[2]-c*distance+s*side);}const ix=g.index!;for(let i=0;i<ix.count;i+=3){const b=ix.getX(i+1);ix.setX(i+1,ix.getX(i+2));ix.setX(i+2,b);}g.computeVertexNormals();const shelf=new T.Mesh(g,new T.MeshStandardMaterial({color:layer?'#a49aa1':'#b5a08c',roughness:1}));shelf.name='depth-low-distant-shelf';scene.add(shelf);}
  // Reuse the existing unnamed grass silhouette as sparse dry functional forms.
  const patches:{x:number;z:number;size:number}[]=[];
  scene.traverse(o=>{if(!(o instanceof T.InstancedMesh)||o.name!=='field-jointed-bedrock')return;const m=new T.Matrix4();for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);const x=m.elements[12],z=m.elements[14],q=cameraSpace(plan,x,z);if(q.forward<0||q.forward>90)continue;for(let j=0;j<4;j++){const px=x+(r()-.5)*4,pz=z+(r()-.5)*4;if(!collisionFootprint(plan,px,pz,1.2))patches.push({x:px,z:pz,size:.35+r()*.55});}}});
  const geometry=new T.PlaneGeometry(1.25,1.1);geometry.translate(0,.55,0);const uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,.28+uv.getX(i)*.40,.04+uv.getY(i)*.58);const mat=new T.MeshStandardMaterial({map:shadow,alphaTest:.35,side:T.DoubleSide,roughness:1});
  mat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float ink=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));diffuseColor.rgb=mix(${variation?'vec3(.055,.11,.035),vec3(.32,.40,.12)':'vec3(.12,.13,.07),vec3(.48,.39,.20)'},sqrt(ink));`);shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=normalize(normal*.25+mat3(viewMatrix)*vec3(0.,.85,0.));');};mat.customProgramCacheKey=()=> 'dry-functional-tuft-2|'+variation;
  const tufts=new T.InstancedMesh(geometry,mat,patches.length),o=new T.Object3D();tufts.name='depth-dry-grass';patches.forEach((p,i)=>{o.position.set(p.x,height(p.x,p.z)-.01,p.z);o.rotation.set(0,r()*6.28,(r()-.5)*.2);o.scale.setScalar(p.size);o.updateMatrix();tufts.setMatrixAt(i,o.matrix);});tufts.receiveShadow=true;tufts.computeBoundingSphere();scene.add(tufts);
  scene.userData.depthDressing={dryTufts:patches.length,ecology:'Unnamed dry grass growth-form study; no new species occurrence claim'};
  if(variation)scene.traverse(o=>{if(!(o instanceof T.InstancedMesh)||o.name!=='desert-unnamed-open-shrub')return;const colors=o.geometry.attributes.color;if(!colors)return;const tint=new T.Color('#77954c'),color=new T.Color();for(let i=0;i<colors.count;i++){color.fromBufferAttribute(colors,i);if(color.g>color.r*1.03){color.lerp(tint,.75);colors.setXYZ(i,color.r,color.g,color.b);}}colors.needsUpdate=true;});
 }
 if(biome==='mangrove'){
  const stones:{x:number;z:number;size:number}[]=[];for(let i=0;i<6500&&stones.length<1900;i++){const forward=2+r()*22,side=(r()-.5)*(8+forward*.8),x=plan.eye[0]+s*forward+c*side,z=plan.eye[2]-c*forward+s*side,h=height(x,z),vein=.5+.5*Math.sin(x*1.7+Math.sin(z*.9)*2.);if(h<.005||r()>.18+vein*.5)continue;stones.push({x,z,size:.012+Math.pow(r(),2)*.06});}
  const pebbles=new T.InstancedMesh(new T.IcosahedronGeometry(1,0),new T.MeshStandardMaterial({roughness:.92}),stones.length),o=new T.Object3D();pebbles.name='depth-washed-gravel';stones.forEach((p,i)=>{o.position.set(p.x,height(p.x,p.z)+p.size*.10,p.z);o.rotation.set(r(),r()*6.28,r());o.scale.set(p.size,p.size*.30,p.size*.8);o.updateMatrix();pebbles.setMatrixAt(i,o.matrix);pebbles.setColorAt(i,new T.Color('#8b806b').lerp(new T.Color('#c7b08a'),r()));});pebbles.receiveShadow=true;pebbles.computeBoundingSphere();scene.add(pebbles);scene.userData.washedGravel={instances:stones.length,maximumHeight:.022,note:'Low exposed mineral fragments; presentation substrate, not character-blocking props'};
 }
 const old=scene.onBeforeRender;let installed=false;
 scene.onBeforeRender=function(...args){old.apply(this,args);const matte=scene.getObjectByName('depth-distant-plains-matte');if(matte)matte.visible=(!scene.userData.environmentSelection?.pilot||scene.userData.environmentSelection.pilot.site.eco===433)&&args[2].position.y<35;if(installed)return;installed=true;const seen=new Set<T.Material>();
  scene.traverse(o=>{if(!(o instanceof T.Mesh))return;const ground=o.name==='connected-field-terrain',grass=/meadow|depth-dry-grass/.test(o.name),rock=o.name==='field-jointed-bedrock',plant=/juvenile|unnamed-open-shrub/.test(o.name);if(!ground&&!grass&&!rock&&!plant)return;
   for(const mat of Array.isArray(o.material)?o.material:[o.material]){if(!(mat instanceof T.MeshStandardMaterial)||seen.has(mat))continue;seen.add(mat);const previous=mat.onBeforeCompile,key=mat.customProgramCacheKey.bind(mat);
    mat.onBeforeCompile=(shader,renderer)=>{previous.call(mat,shader,renderer);Object.assign(shader.uniforms,{depthDetail:{value:detail},depthShadow:{value:shadow}});
     shader.vertexShader='varying vec3 depthWorld;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      vec4 depthP=vec4(transformed,1.);
      #ifdef USE_INSTANCING
      depthP=instanceMatrix*depthP;
      #endif
      depthWorld=(modelMatrix*depthP).xyz;`);
     shader.fragmentShader=`varying vec3 depthWorld;uniform sampler2D depthDetail,depthShadow;
      float dpHash(vec2 p){p=fract(p*vec2(.1031,.11369));p+=dot(p,p.yx+19.19);return fract(p.x*p.y);}
      float dpNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(dpHash(i),dpHash(i+vec2(1,0)),f.x),mix(dpHash(i+vec2(0,1)),dpHash(i+vec2(1,1)),f.x),f.y);}
      float dpLeaf(vec2 p){vec2 a=mat2(.866,-.5,.5,.866)*p/9.,b=mat2(.4,.916,-.916,.4)*p/13.+vec2(.37,.21);vec2 blur=vec2(.04,.03);float A=(texture2D(depthShadow,a).a+texture2D(depthShadow,a+blur).a+texture2D(depthShadow,a-blur).a)/3.;float B=(texture2D(depthShadow,b).a+texture2D(depthShadow,b+blur).a+texture2D(depthShadow,b-blur).a)/3.;return clamp((A+B)*.65,0.,1.);}
     `+shader.fragmentShader;
     shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`
      vec2 dp=depthWorld.xz-vec2(${plan.eye[0].toFixed(3)},${plan.eye[2].toFixed(3)});
      float forward=dot(dp,vec2(${s.toFixed(6)},${(-c).toFixed(6)})),side=dot(dp,vec2(${c.toFixed(6)},${s.toFixed(6)}));
      float dpMedium=dpNoise(depthWorld.xz*.44),dpGrain=dpNoise(depthWorld.xz*23.);
      float pattern=dpLeaf(depthWorld.xz+vec2(forward*.12,side*.18));
      float framing=(1.-smoothstep(3.,13.,forward))*.55+smoothstep(3.5,12.,abs(side))*.45;
      float shade=clamp(framing*(.35+.85*pattern),0.,.85);
      float sunPool=(1.-smoothstep(6.,20.,abs(side)))*smoothstep(1.,12.,forward)*(1.-smoothstep(75.,180.,forward));
      float brokenSun=sunPool*(.45+.55*(1.-pattern));
      ${ground&&biome==='flooded'?`vec3 tuft=texture2D(depthDetail,depthWorld.xz/5.).rgb;float cover=smoothstep(.30,.55,dpMedium);float ink=dot(tuft,vec3(.2126,.7152,.0722));vec3 meadow=mix(vec3(.09,.135,.065),vec3(.55,.50,.22),smoothstep(.025,.40,ink));diffuseColor.rgb=mix(diffuseColor.rgb,meadow,cover*.85);`:''}
      ${ground&&biome==='flooded'&&variation?`float soilRegion=dpNoise(depthWorld.xz*.16+vec2(dpNoise(depthWorld.xz*.055)*3.));float exposedSoil=smoothstep(.56,.71,soilRegion);vec3 soil=mix(vec3(.19,.15,.095),vec3(.36,.27,.15),dpNoise(depthWorld.xz*2.2));diffuseColor.rgb=mix(diffuseColor.rgb,soil,exposedSoil*.88);`:''}
      ${ground&&biome==='mangrove'?`vec3 gravel=texture2D(depthDetail,depthWorld.xz/1.6).rgb;float grit=dot(gravel,vec3(.2126,.7152,.0722));float deposit=smoothstep(.38,.66,dpMedium);diffuseColor.rgb*=mix(.65,1.38,grit)*mix(.9,1.10,deposit);`:''}
      ${grass?`diffuseColor.rgb*=mix(vec3(.77,.84,.80),vec3(1.21,1.10,.74),smoothstep(.25,.75,dpMedium));`:''}
      #include <roughnessmap_fragment>
      ${ground?`roughnessFactor=mix(.42,.98,smoothstep(.015,.20,depthWorld.y));`:''}
     `);
     shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
      float lightPattern=dpLeaf(depthWorld.xz+vec2(dot(depthWorld.xz,vec2(.03,.06))));
      vec2 lightDelta=depthWorld.xz-vec2(${plan.eye[0].toFixed(3)},${plan.eye[2].toFixed(3)});
      float lightForward=dot(lightDelta,vec2(${s.toFixed(6)},${(-c).toFixed(6)})),lightSide=dot(lightDelta,vec2(${c.toFixed(6)},${s.toFixed(6)}));
      float edgeShade=clamp(((1.-smoothstep(3.,13.,lightForward))*.75+smoothstep(3.5,12.,abs(lightSide))*.50)*(.65+.65*lightPattern),0.,.92);
      edgeShade*=1.-smoothstep(18.,55.,length(lightDelta));
      float clearingLight=(1.-smoothstep(6.,20.,abs(lightSide)))*smoothstep(1.,12.,lightForward)*(1.-smoothstep(75.,180.,lightForward))*(1.-lightPattern);
      reflectedLight.directDiffuse*=max(.10,1.-edgeShade*${grass?'.50':'.97'})*(1.+clearingLight*.80);
      reflectedLight.indirectDiffuse*=mix(vec3(1.),${biome==='desert'?'vec3(.72,.64,1.18)':'vec3(.88,.98,1.12)'},edgeShade);
      reflectedLight.indirectDiffuse+=diffuseColor.rgb*${biome==='desert'?(grass?'vec3(.075,.04,.12)':'vec3(.06,.035,.11)'):'vec3(.06,.08,.10)'}*edgeShade;
     `);
    };mat.customProgramCacheKey=()=>key()+`|depth-textured-light-1|${biome}|${ground}|${grass}|${variation}`;mat.needsUpdate=true;
   }
  });scene.userData.depthTexture={version:1,worldAnchored:true,artisticShadowField:'Vegetation-shaped transmission approximation, separate from retained physical shadows',waterShaderUnchanged:true};
 };
 return()=>maps.forEach(m=>m.dispose());
}


