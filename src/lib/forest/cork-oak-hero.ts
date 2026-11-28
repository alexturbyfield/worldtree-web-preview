import * as T from 'three';
import type {SceneRecipe,SceneTree} from './recipe';
import type {Point,Segment} from './tree';
import {randomSource} from './random';
export interface CorkSpray {position:Point;rotation:[number,number,number,number];size:number;tint:string}
export interface CorkHero {source:SceneTree;position:Point;segments:Segment[];sprays:CorkSpray[];height:number}
export type CorkScene=SceneRecipe&{corkHero?:CorkHero};
/** Low fork and irregular changes of direction; terminal sprays remain branch-owned. */
export function corkOakHero(source:SceneTree,position:Point):CorkHero{
 const random=randomSource(source.seed+'|cork-oak-hero-v1'),segments:Segment[]=[],sprays:CorkSpray[]=[];let pathId=0;
 const tuple=(p:T.Vector3)=>p.toArray() as Point,vec=(p:Point)=>new T.Vector3(...p);
 const path=(points:Point[],radius:number,endRadius:number,depth:number,parentPathId?:number)=>{
  const curve=new T.CatmullRomCurve3(points.map(vec)),id=pathId++,steps=depth<2?12:6;
  for(let i=0;i<steps;i++){const a=i/steps,b=(i+1)/steps,rad=(t:number)=>endRadius+(radius-endRadius)*Math.pow(1-t,1.4);segments.push({a:tuple(curve.getPoint(a)),b:tuple(curve.getPoint(b)),r0:rad(a),r1:rad(b),depth,pathId:id,parentPathId,tangentA:tuple(curve.getTangent(a)),tangentB:tuple(curve.getTangent(b)),capEnd:i===steps-1});}
  return {curve,id};
 };
 const trunk=path([[0,-.06,0],[-.18,.43,.06],[.12,1.05,-.08],[.02,1.62,0]],.57,.34,0);
 const arms:Point[][]=[[[1.0,1.86,.15],[2.55,2.62,-.12],[3.70,3.65,-.35]],[[-1.15,2.0,.15],[-2.20,2.80,.42],[-3.85,3.42,.15]],[[-.35,2.57,-.20],[.56,3.65,-.75],[.20,4.67,-1.05]],[[.35,2.16,-1.13],[-.85,2.94,-2.25],[-1.25,4.04,-3.0]]];
 arms.forEach((control,arm)=>{
  const start=trunk.curve.getPoint(.68+arm*.085),jitter=(p:Point):Point=>[p[0]+(random()-.5)*.22,p[1]+(random()-.5)*.20,p[2]+(random()-.5)*.25],primary=path([tuple(start),...control.map(jitter)],.30-arm*.018,.055,1,trunk.id);
  for(let shoot=0;shoot<5;shoot++){
   const t=.35+shoot*.145,root=primary.curve.getPoint(t),tangent=primary.curve.getTangent(t),side=new T.Vector3(-tangent.z,0,tangent.x).normalize().multiplyScalar(shoot%2?-1:1),reach=1.05+random()*.70,rise=.65+random()*.70;
   const end=root.clone().addScaledVector(side,reach).addScaledVector(tangent,.45+random()*.45).add(new T.Vector3(0,rise,0)),bend=root.clone().lerp(end,.48).add(new T.Vector3((random()-.5)*.45,-.16+random()*.43,(random()-.5)*.35));
   const secondary=path([tuple(root),tuple(bend),tuple(end)],(.08+(1-t)*.055),.014,2,primary.id);
   for(let twig=0;twig<3;twig++){
    const u=.42+twig*.24,a=secondary.curve.getPoint(u),azimuth=random()*Math.PI*2,length=.52+random()*.55,b=a.clone().add(new T.Vector3(Math.cos(azimuth)*length,.32+random()*.58,Math.sin(azimuth)*length)),middle=a.clone().lerp(b,.52).add(new T.Vector3((random()-.5)*.20,(random()-.5)*.20,(random()-.5)*.18));
    const terminal=path([tuple(a),tuple(middle),tuple(b)],.025,.004,3,secondary.id);
    for(let node=0;node<5;node++)for(let fan=0;fan<3;fan++){
     const along=.28+node*.17,anchor=terminal.curve.getPoint(along),angle=azimuth+fan*2.399+node*.8,offset=.10+random()*.18,center=anchor.clone().add(new T.Vector3(Math.cos(angle)*offset,(random()-.3)*.18,Math.sin(angle)*offset));
     const normal=new T.Vector3(Math.cos(angle)*.65,.5+random()*.6,Math.sin(angle)*.65).normalize(),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),normal).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),random()*6.283));
     sprays.push({position:tuple(center),rotation:q.toArray() as [number,number,number,number],size:.62+random()*.40,tint:new T.Color('#a3aa84').lerp(new T.Color('#d9d6a3'),random()*.42).getStyle()});
    }
   }
  }
 });
 for(let i=0;i<4;i++){const a=i*2.399;path([[Math.cos(a)*.79,-.08,Math.sin(a)*.79],[Math.cos(a)*.40,.12,Math.sin(a)*.40],[0,.40,0]],.11,.12,1);}
 return {source,position,segments,sprays,height:Math.max(...segments.map(s=>s.b[1]))+.6};
}
/** Metre-scaled longitudinal UVs follow each curved path, not world Y. */
export function corkWoodGeometry(segments:Segment[]){
 const paths=new Map<number,Segment[]>();for(const segment of segments){const id=segment.pathId??0,list=paths.get(id)??[];list.push(segment);paths.set(id,list);}
 const positions:number[]=[],normals:number[]=[],uvs:number[]=[],indices:number[]=[];
 for(const list of paths.values()){
  const sides=list[0].depth===0?20:list[0].depth===1?14:8,start=positions.length/3;let length=0;
  for(let row=0;row<=list.length;row++){
   const segment=list[Math.min(row,list.length-1)],last=row===list.length,center=new T.Vector3(...(last?segment.b:segment.a)),tangent=new T.Vector3(...(last?segment.tangentB!:segment.tangentA!)),frame=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),tangent),radius=last?segment.r1:segment.r0;
   if(row)length+=center.distanceTo(new T.Vector3(...list[row-1].a));
   for(let side=0;side<=sides;side++){const a=side/sides*Math.PI*2,normal=new T.Vector3(Math.cos(a),0,Math.sin(a)).applyQuaternion(frame),p=center.clone().addScaledVector(normal,radius);positions.push(p.x,p.y,p.z);normals.push(normal.x,normal.y,normal.z);uvs.push(side/sides,length/.75);}
  }
  for(let row=0;row<list.length;row++)for(let side=0;side<sides;side++){const a=start+row*(sides+1)+side,b=a+sides+1;indices.push(a,b,a+1,a+1,b,b+1);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeBoundingSphere();return g;
}
export function mountCorkOakHero(scene:T.Scene,hero:CorkHero,load:(url:string)=>T.Texture){
 const group=new T.Group();group.name='cork-oak-hero';group.position.fromArray(hero.position);scene.add(group);
 const bark=load('/assets/cork-oak/bark-v1.webp');bark.repeat.set(2.0,1.0);
 const woodGeometry=corkWoodGeometry(hero.segments);
 const woodMaterial=new T.MeshStandardMaterial({map:bark,bumpMap:bark,bumpScale:.065,color:'#b3a796',roughness:.98}),wood=new T.Mesh(woodGeometry,woodMaterial);wood.name='cork-oak-hero-wood';wood.castShadow=wood.receiveShadow=true;group.add(wood);
 const leaf=load('/assets/cork-oak/leaves-v1.webp');leaf.wrapS=leaf.wrapT=T.ClampToEdgeWrapping;
 const geometry=new T.PlaneGeometry(1,1,2,2),p=geometry.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,.12*(1-Math.abs(p.getX(i))*2)*(1-Math.abs(p.getY(i))*2));geometry.computeVertexNormals();
 const material=new T.MeshStandardMaterial({map:leaf,alphaTest:.48,side:T.DoubleSide,roughness:.86});
 const crown=new T.Box3();hero.sprays.forEach(s=>{const c=new T.Vector3(...s.position),r=new T.Vector3().setScalar(s.size*.35);crown.expandByPoint(c.clone().sub(r));crown.expandByPoint(c.clone().add(r));});
 const centers=new Float32Array(hero.sprays.length*3),radii=new Float32Array(hero.sprays.length*3);
 for(let start=0;start<hero.sprays.length;start+=15){const box=new T.Box3();for(const s of hero.sprays.slice(start,start+15)){const c=new T.Vector3(...s.position),r=new T.Vector3().setScalar(s.size*.22);box.expandByPoint(c.clone().sub(r));box.expandByPoint(c.clone().add(r));}const center=box.getCenter(new T.Vector3()),radius=box.getSize(new T.Vector3()).multiplyScalar(.5).max(new T.Vector3(.05,.05,.05));for(let i=start;i<Math.min(start+15,hero.sprays.length);i++){center.toArray(centers,i*3);radius.toArray(radii,i*3);}}
 geometry.setAttribute('corkClusterCenter',new T.InstancedBufferAttribute(centers,3));geometry.setAttribute('corkClusterRadii',new T.InstancedBufferAttribute(radii,3));
 const key=scene.children.find(o=>o instanceof T.DirectionalLight&&o.castShadow) as T.DirectionalLight;
 const treatment={corkTreatment:{value:1},corkCrownCenter:{value:crown.getCenter(new T.Vector3())},corkCrownRadii:{value:crown.getSize(new T.Vector3()).multiplyScalar(.5)},corkSun:{value:key.position.clone().sub(key.target.position).normalize()},corkShade:{value:new T.Color('#4b6641')},corkBody:{value:new T.Color('#8d9b50')},corkSunlit:{value:new T.Color('#d7d17d')}};
 const choose=(name:string)=>{const modern=name!=='original';treatment.corkTreatment.value=modern?1:0;woodMaterial.color.set(modern?'#cabca5':'#b3a796');woodMaterial.bumpScale=modern?.055:.065;scene.userData.artRevision=(scene.userData.artRevision??0)+1;};scene.userData.corkTreatment=choose;choose(new URLSearchParams(location.search).get('corkTreatment')??'halfway');
 // Normal wrapping for thin leaves, preserving real key-light response and cool interiors.
 material.onBeforeCompile=shader=>{
  treatment.corkSun.value.copy(key.position).sub(key.target.position).normalize();Object.assign(shader.uniforms,treatment);
  shader.vertexShader='uniform float corkTreatment;uniform vec3 corkCrownCenter,corkCrownRadii;attribute vec3 corkClusterCenter,corkClusterRadii;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <defaultnormal_vertex>',`#include <defaultnormal_vertex>
   if(corkTreatment>.5){vec3 p=(instanceMatrix*vec4(position,1.)).xyz;
    vec3 hull=normalize((p-corkCrownCenter)/(corkCrownRadii*corkCrownRadii)+vec3(0.,.00001,0.));
    vec3 cluster=normalize((p-corkClusterCenter)/(corkClusterRadii*corkClusterRadii)+vec3(0.,.00001,0.));
    vec3 card=normalize(mat3(instanceMatrix)*objectNormal);
    transformedNormal=normalMatrix*normalize(hull*.45+cluster*.40+card*.15);
   }`);
  shader.fragmentShader='uniform float corkTreatment;uniform vec3 corkSun,corkShade,corkBody,corkSunlit;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
   if(corkTreatment>.5){normal*=faceDirection;}else{normal=normalize(normal*.75+mat3(viewMatrix)*vec3(0.,.25,0.));}`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <lights_physical_pars_fragment>',T.ShaderChunk.lights_physical_pars_fragment.replace('reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );','reflectedLight.directDiffuse += (irradiance+directLight.color*.10*(1.-dotNL))*diffuseBRDF*(1.-F);'));
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`if(corkTreatment>.5){
    vec3 worldN=inverseTransformDirection(normal,viewMatrix);float v=clamp(dot(worldN,corkSun)*.5+.5,0.,1.);
    vec3 paint=mix(corkShade,corkBody,smoothstep(.12,.66,v));paint=mix(paint,corkSunlit,smoothstep(.55,.95,v)*.78);
    float ink=clamp(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722))/.20,.70,1.20);
    outgoingLight=mix(outgoingLight,paint*mix(1.,ink,.18),.50);
   }\n#include <opaque_fragment>`);
 };material.customProgramCacheKey=()=> 'cork-oak-hierarchical-halfway-1';

 const foliage=new T.InstancedMesh(geometry,material,hero.sprays.length),o=new T.Object3D();foliage.name='cork-oak-hero-leaf-sprays';
 hero.sprays.forEach((spray,i)=>{o.position.fromArray(spray.position);o.quaternion.fromArray(spray.rotation);o.scale.setScalar(spray.size);o.updateMatrix();foliage.setMatrixAt(i,o.matrix);foliage.setColorAt(i,new T.Color(spray.tint));});foliage.computeBoundingSphere();foliage.castShadow=foliage.receiveShadow=true;group.add(foliage);
 scene.userData.corkHero={species:hero.source.species,sourceSeed:hero.source.seed,position:hero.position,designHeight:hero.height,segments:hero.segments.length,sprays:hero.sprays.length,textures:['bark-v1.webp','leaves-v1.webp'],status:'experimental hero; no local occurrence or substrate suitability verified',inspection:'Orbit/elevated views supported; separate hero is not yet connected to the per-tree click inspector'};
 return()=>{scene.remove(group);woodGeometry.dispose();woodMaterial.dispose();geometry.dispose();material.dispose();delete scene.userData.corkHero;delete scene.userData.corkTreatment;};
}
