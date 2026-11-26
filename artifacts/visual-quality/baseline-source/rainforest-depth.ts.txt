import * as T from 'three';
import {randomSource,hashSeed} from './random';
import {terrainHeight,type SceneRecipe} from './recipe';

/** Presentation only. V4 and the canonical ecological recipe remain available unchanged. */
export function rainforestV5(){return typeof location==='undefined'||!['v3','v4'].includes(new URLSearchParams(location.search).get('rainforest')??'');}

export function installRainforestDepthResponse(material:T.Material,kind:string){
 const previous=material.onBeforeCompile;
 material.onBeforeCompile=function(shader,renderer){
  previous.call(this,shader,renderer);
  if(kind==='library'){
   if(shader.uniforms.attentionAir)shader.uniforms.attentionAir.value=new T.Color('#35665e').convertLinearToSRGB();
   shader.fragmentShader=shader.fragmentShader.replace('smoothstep(76.,175.,atmosphereDepth)','(.18*smoothstep(24.,65.,atmosphereDepth)+.72*smoothstep(55.,125.,atmosphereDepth))');
   shader.fragmentShader=shader.fragmentShader.replace('gl_FragColor=vec4(shaded,1.);',`float deepForest=smoothstep(25.,100.,length(attentionWorld-cameraPosition));
    float forestValue=dot(shaded,vec3(.2126,.7152,.0722));
    shaded=mix(shaded,mix(shaded*vec3(.75,.86,.85),forestValue*vec3(.49,.78,.70),.27),deepForest*.68);
    gl_FragColor=vec4(shaded,1.);`);
  }
 };
 material.customProgramCacheKey=()=>`rainforest-depth-v5-${kind}`;
}

/** Bounded shared batches, stable world masks, no additional full-detail tree generators. */
export function mountRainforestDepth(scene:T.Scene,recipe:SceneRecipe,ground:T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>){
 const random=randomSource(recipe.seed+'|rainforest-depth-v5'),textures:T.Texture[]=[],stats:{name:string;instances:number;triangles:number}[]=[],dummy=new T.Object3D();
 const backdrop=new T.Group();backdrop.name='rainforest-v5-encounter-backdrop';scene.add(backdrop);
 let disposed=false;
 const texture=(path:string)=>{const map=new T.TextureLoader().load(path,()=>{if(!disposed)scene.userData.artRevision=(scene.userData.artRevision??0)+1;});map.colorSpace=T.SRGBColorSpace;map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;map.anisotropy=4;textures.push(map);return map;};
 const walls=texture('/assets/amazon-v5/forest-wall.webp'),decals=texture('/assets/amazon-v5/floor-decals.webp'),foliage=texture('/assets/puget-v1/foliage.png');
 const batch=(name:string,geometry:T.BufferGeometry,material:T.Material,count:number,parent:T.Object3D=scene)=>{const mesh=new T.InstancedMesh(geometry,material,count);mesh.name='rainforest-v5-'+name;parent.add(mesh);stats.push({name,instances:count,triangles:(geometry.index?.count??geometry.getAttribute('position').count)/3*count});return mesh;};
 const put=(mesh:T.InstancedMesh,i:number,x:number,y:number,z:number,sx:number,sy:number,sz:number,yaw:number,color?:string)=>{dummy.position.set(x,y,z);dummy.rotation.set(0,yaw,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(color)mesh.setColorAt(i,new T.Color(color));};
 const atlas=(geometry:T.BufferGeometry,count:number,columns:number,rows:number,choices?:number[])=>{
  const tiles=Float32Array.from({length:count},()=>{const n=Math.floor(random()*(choices?.length??columns*rows));return choices?choices[n]:n;});geometry.setAttribute('forestTile',new T.InstancedBufferAttribute(tiles,1));
  return (material:T.Material)=>{material.onBeforeCompile=shader=>{shader.vertexShader='attribute float forestTile; varying vec2 forestUv;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>\nforestUv=(vec2(mod(forestTile,${columns}.),${rows-1}.-floor(forestTile/${columns}.))+uv)/vec2(${columns}.,${rows}.);`);shader.fragmentShader='varying vec2 forestUv;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',T.ShaderChunk.map_fragment.replace('texture2D( map, vMapUv )','texture2D( map, forestUv )'));};material.customProgramCacheKey=()=>`forest-atlas-${columns}-${rows}`;};
 };
 // Three overlapping tangent rings provide 360-degree coverage without following the camera.
 const wallGeo=new T.PlaneGeometry(1,1),wallMat=new T.MeshBasicMaterial({map:walls,alphaTest:.3,side:T.DoubleSide,fog:true});atlas(wallGeo,108,2,2)(wallMat);
 const wall=batch('forest-wall',wallGeo,wallMat,108,backdrop);let index=0;
 for(const [radius,count,height] of [[50,36,15],[65,24,46],[85,24,53],[112,24,60]])for(let i=0;i<count;i++){
  const angle=(i+.37*index/count)*Math.PI*2/count,width=2*radius*Math.tan(Math.PI/count)*1.65,h=height*(.9+random()*.2);
  put(wall,index++,Math.sin(angle)*radius,h*.5-8,Math.cos(angle)*radius,width,h,1,angle,['#658b76','#749a87','#89aa98'][Math.min(2,Math.floor(index/36))]);
 }
 const lower=batch('lower-understory',new T.CylinderGeometry(1,1,1,64,1,true),new T.MeshBasicMaterial({color:'#183d32',side:T.DoubleSide}),3,backdrop);
 [64,84,111].forEach((radius,i)=>put(lower,i,0,-3,0,radius,17,radius,0));
 // Reuse recognizable source proportions for inexpensive outer trunks/crown masses.
 const sources=recipe.trees.filter(t=>t.model.dimensions.height>25),trunks=batch('outer-trunks',new T.CylinderGeometry(.48,.8,1,5),new T.MeshLambertMaterial({color:'#494d38'}),32,backdrop),crowns=batch('outer-crowns',new T.IcosahedronGeometry(1,1),new T.MeshLambertMaterial({color:'#325f42',flatShading:true}),192,backdrop);
 for(let i=0;i<32;i++){
  const source=sources[i%sources.length]??recipe.trees[0],angle=i*Math.PI*2/32,radius=49+random()*18,x=Math.sin(angle)*radius,z=Math.cos(angle)*radius,h=Math.min(46,source.model.dimensions.height)*(.85+random()*.2),y=terrainHeight(x,z,recipe.seed);
  put(trunks,i,x,y+h*.5,z,1,h,1,angle);
  for(let j=0;j<6;j++){const a=j*2.399,w=T.MathUtils.clamp(source.model.dimensions.crownWidth*.34,3.5,7);put(crowns,i*6+j,x+Math.cos(a)*w*.6,y+h-3+(j%3)*1.8,z+Math.sin(a)*w*.6,w,3+random()*3,w*.85,a,['#456a46','#315847','#3e6950'][i%3]);}
 }
 const anchors=Array.from({length:35},(_,i)=>{const tree=recipe.trees[i%recipe.trees.length];return [tree.position[0],tree.position[2]];});
 anchors.push([-9,27],[10,27],[-17,19],[18,21]);
 const spot=()=>{for(let trial=0;trial<80;trial++){const a=anchors[Math.floor(random()*anchors.length)],angle=random()*Math.PI*2,radius=Math.sqrt(random())*6.5,x=a[0]+Math.cos(angle)*radius,z=a[1]+Math.sin(angle)*radius,opening=Math.hypot(x/7,(z-2)/13),approach=Math.hypot(x/4,(z-24)/11);if(opening>1.08&&approach>1&&Math.abs(x)<47&&Math.abs(z)<46)return [x,z];}return [18+(random()-.5)*8,-25+random()*8];};
 for(const [name,count,size] of [['ferns',220,.8],['palms',120,.85],['seedlings',240,1.2]] as const){const source=scene.getObjectByName('rainforest-v4-'+name) as T.InstancedMesh;if(!source)continue;const mesh=batch(name,source.geometry,Array.isArray(source.material)?source.material[0]:source.material,count);mesh.receiveShadow=true;for(let i=0;i<count;i++){const [x,z]=spot(),s=size*(.65+random()*.85);put(mesh,i,x,terrainHeight(x,z,recipe.seed),z,s,s,s,random()*Math.PI*2,['#9db99a','#aec099','#c1cb9e'][i%3]);}}
 // Broadleaf/fern card clusters, no grass or flowers. Atlas cells remain padded.
 const leafGeo=new T.PlaneGeometry(1,1);leafGeo.translate(0,.5,0);const leafMat=new T.MeshLambertMaterial({map:foliage,alphaTest:.35,side:T.DoubleSide,color:'#a1b995'});atlas(leafGeo,850,4,2,[0,1,2,3,6,7])(leafMat);const leaves=batch('foliage-cards',leafGeo,leafMat,850);leaves.receiveShadow=true;
 for(let i=0;i<850;i++){const [x,z]=spot(),s=.6+random()*1.1;put(leaves,i,x,terrainHeight(x,z,recipe.seed)-.03,z,s*1.5,s,1,random()*Math.PI*2);}
 // Small terrain-conforming litter, moss and root patches preserve the open floor.
 const decalGeo=new T.PlaneGeometry(1,1,2,2);decalGeo.rotateX(-Math.PI/2);const decalMat=new T.MeshStandardMaterial({map:decals,alphaTest:.25,roughness:1,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,depthWrite:false,color:'#a28d68'});atlas(decalGeo,520,2,2)(decalMat);
 const phase=(hashSeed(recipe.seed)%6283)/1000;
 const previousDecal=decalMat.onBeforeCompile;decalMat.onBeforeCompile=function(shader,renderer){previousDecal.call(this,shader,renderer);shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nvec3 floorWorld=(modelMatrix*instanceMatrix*vec4(transformed,1.)).xyz;\ntransformed.y+=sin(floorWorld.x*.055+${phase})*1.1+cos(floorWorld.z*.073-${phase})*.8+sin((floorWorld.x+floorWorld.z)*.12+${phase})*.25+.04-floorWorld.y;`);};
 const floor=batch('floor-decals',decalGeo,decalMat,520);floor.receiveShadow=true;
 for(let i=0;i<520;i++){let [x,z]=spot();if(i%5===0){x=(random()-.5)*17;z=-10+random()*32;}const s=.7+random()*1.8;put(floor,i,x,terrainHeight(x,z,recipe.seed)+.025,z,s,1,s,random()*Math.PI*2);}
 const priorGround=ground.material.onBeforeCompile;
 ground.material.onBeforeCompile=function(shader,renderer){priorGround.call(this,shader,renderer);shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float mossField=smoothstep(.1,.8,sin(biomeWorld.x*.17+sin(biomeWorld.z*.11)*2.)*cos(biomeWorld.z*.14));
 float dampField=.5+.5*sin(biomeWorld.x*.09-biomeWorld.z*.12);
 diffuseColor.rgb*=mix(vec3(.71,.65,.54),vec3(.63,.88,.63),mossField*.62)*mix(.83,1.12,dampField);`);};ground.material.customProgramCacheKey=()=> 'amazon-ground-depth-v5';
 // Inspection reveals the real canopy; encounter-only walls never form an elevated cylinder.
 const previousRender=scene.onBeforeRender;
 scene.onBeforeRender=function(renderer,s,camera,geometry,material,group){backdrop.visible=camera.position.y-terrainHeight(camera.position.x,camera.position.z,recipe.seed)<18;previousRender.call(this,renderer,s,camera,geometry,material,group);};
 scene.userData.rainforestV5={fullDetailTrees:recipe.trees.length,lowDetailTrees:32,batches:stats,additionalInstances:stats.reduce((n,b)=>n+b.instances,0),limitations:['Encounter-only wall cards hide above 18 m eye height; elevated inspection exposes finite geometry.','Outer crown masses reuse source species proportions, not full branch architecture.','Layered depth fog, not volumetric scattering.']};
 return()=>{disposed=true;textures.forEach(t=>t.dispose());scene.onBeforeRender=previousRender;};
}
