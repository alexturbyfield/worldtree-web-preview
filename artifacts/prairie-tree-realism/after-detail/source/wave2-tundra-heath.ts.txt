import * as T from 'three';
import {expansionHeight,expansionCommunity,type ExpansionPlan} from './wave2-shared';
import {randomSource} from './random';
import {tundraBranchletGeometry,tundraSedgeGeometry} from './wave2-tundra-branchlets';

/** Synthetic study habitats; no measured soil, exposure or verified local flora inferred. */
function habitat(p:ExpansionPlan,x:number,z:number){
 const noise=(x:number,z:number)=>{const hash=(a:number,b:number)=>{const v=Math.sin(a*127.1+b*311.7)*43758.5453;return v-Math.floor(v);},ix=Math.floor(x),iz=Math.floor(z),a=x-ix,b=z-iz,u=a*a*(3-2*a),v=b*b*(3-2*b);return(hash(ix,iz)*(1-u)+hash(ix+1,iz)*u)*(1-v)+(hash(ix,iz+1)*(1-u)+hash(ix+1,iz+1)*u)*v;};
 const warp=noise(x*.025+p.phase,z*.025)*18;
 const ribbon=noise(x*.052+z*.014+p.phase,z*.018+warp*.045)*.72+noise(x*.13+warp*.07,z*.065)*.28;
 const mineral=noise(x*.07+warp*.05,z*.042-p.phase)*.7+noise(x*.23,z*.17)*.3;
 const shelter=noise(x*.037-p.phase,z*.031+p.phase)*.6+noise(x*.11,z*.04)*.4;
 const community=expansionCommunity(p,x,z),q=Math.min(1,Math.max(0,(community-.35)/.29)),cover=q*q*(3-2*q);
 return {ribbon,mineral,shelter,community,cover,staging:Math.hypot(x,z-29)<.58};
}
/** Camera-derived presentation swaths, frozen in world space after plan creation. */
function communitySkeletons(p:ExpansionPlan){
 const r=randomSource(p.seed+'|heath-linked-swaths'),sideShift=(r()-.5)*.8;
 const local=[
  [[-2.5,1],[-2.1,5],[-5.8,13],[-4.2,25],[-10,43],[-5,65]],
  [[2.6,.5],[2.2,6],[6.9,15],[5.8,28],[12,45],[4,67]],
  [[-9,23],[-5,31],[2,39],[5,50],[-1,66],[9,84]],
 ];
 const ex=p.camera.position[0],ez=p.camera.position[2],dx=p.camera.target[0]-ex,dz=p.camera.target[2]-ez,length=Math.hypot(dx,dz),fx=dx/length,fz=dz/length,rx=-fz,rz=fx;
 return local.map((path,i)=>path.map(([x,depth],j)=>{const offset=j<2?(r()-.5)*.35:(r()-.5)*3.2,side=x+sideShift+offset;return{x:ex+side*rx+depth*fx,z:ez+side*rz+depth*fz,width:(j<2?.65:1.2)+r()*(j<2?.45:1.3),height:.55+r()*.45,id:i};}));
}
function sampleSwath(path:ReturnType<typeof communitySkeletons>[number],t:number,offset:number){
 const u=Math.min(path.length-1.0001,t*(path.length-1)),i=Math.floor(u),f=u-i,a=path[i],b=path[i+1],before=path[Math.max(0,i-1)],after=path[Math.min(path.length-1,i+2)];
 const curve=(key:'x'|'z')=>{const c=a[key],d=b[key],m=(d-before[key])*.5,n=(after[key]-c)*.5;return(2*f*f*f-3*f*f+1)*c+(f*f*f-2*f*f+f)*m+(-2*f*f*f+3*f*f)*d+(f*f*f-f*f)*n;};
 const tx=b.x-a.x,tz=b.z-a.z,len=Math.hypot(tx,tz),width=a.width+(b.width-a.width)*f;
 return{x:curve('x')-tz/len*offset*width,z:curve('z')+tx/len*offset*width};
}
const shaderFields=`
float thHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float thNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(thHash(i),thHash(i+vec2(1.,0.)),f.x),mix(thHash(i+vec2(0.,1.)),thHash(i+vec2(1.)),f.x),f.y);}
vec3 thPigment(vec2 w){
 float warp=thNoise(w*.025+vec2(thPhase,0.))*18.;
 float ribbon=thNoise(vec2(w.x*.052+w.y*.014+thPhase,w.y*.018+warp*.045))*.72+thNoise(vec2(w.x*.13+warp*.07,w.y*.065))*.28;
 float mineral=thNoise(vec2(w.x*.07+warp*.05,w.y*.042-thPhase))*.7+thNoise(w*vec2(.23,.17))*.3;
 float communityWarp=thNoise(vec2(w.x*.021+thPhase,w.y*.023))*2.4;
 float community=thNoise(vec2(w.x*.077+w.y*.018+thPhase,w.y*.058+communityWarp))*.72+thNoise(vec2(w.x*.19+communityWarp,w.y*.14))*.28;
 float cover=smoothstep(.35,.64,community);
 vec3 olive=mix(vec3(.11,.15,.066),vec3(.34,.31,.095),smoothstep(.20,.73,ribbon));
 vec3 russet=mix(vec3(.17,.035,.018),vec3(.35,.085,.025),smoothstep(.23,.83,ribbon));
 vec3 pigment=mix(olive,russet,smoothstep(.47,.72,ribbon)*(1.-thSparse));
 pigment=mix(pigment,vec3(.12,.21,.11),cover*.45*(1.-thSparse)*(1.-smoothstep(.55,.75,ribbon)));
 pigment=mix(pigment,vec3(.25,.23,.16),smoothstep(.60,.85,mineral)*.60);
 return mix(pigment,vec3(.28,.30,.25),thSparse*.75);
}
`;
function pigmentMaterial(p:ExpansionPlan,sparse:boolean,leaves=false,texture?:T.Texture){
 const m=new T.MeshStandardMaterial({color:0xffffff,roughness:.93,side:leaves?T.DoubleSide:T.FrontSide,map:texture});
 m.onBeforeCompile=s=>{
  s.uniforms.thPhase={value:p.phase};s.uniforms.thSparse={value:sparse?1:0};
  s.vertexShader='varying vec3 thWorld;varying float thLocalHeight;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
   vec4 thPosition=vec4(transformed,1.);
   #ifdef USE_INSTANCING
   thPosition=instanceMatrix*thPosition;
   #endif
   thWorld=(modelMatrix*thPosition).xyz;thLocalHeight=position.y;
  `);
  s.fragmentShader='varying vec3 thWorld;varying float thLocalHeight;uniform float thPhase,thSparse;\n'+shaderFields+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',leaves?'':`#ifdef USE_MAP
   vec3 thDetail=texture2D(map,thWorld.xz/2.4).rgb;
   diffuseColor.rgb*=thDetail;
   #endif`);
  s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>',`
   vec3 thColor=thPigment(thWorld.xz);
   float thFine=thNoise(thWorld.xz*${leaves?'3.8':'2.5'});
   thColor*=mix(.84,1.12,thFine);
   ${leaves?'thColor=mix(thColor,vec3(.38,.28,.075),smoothstep(.08,.40,thLocalHeight)*.27*(1.-thSparse));':''}
   ${leaves?'diffuseColor.rgb*=thColor;':'float thValue=dot(thColor,vec3(.2126,.7152,.0722)); diffuseColor.rgb*=mix(vec3(1.),clamp(thColor/max(.08,thValue),vec3(.75),vec3(1.4)),.27);'}
   #include <roughnessmap_fragment>
  `);
 };
 m.customProgramCacheKey=()=>`concept-tundra-living-floor-2-${leaves}-${sparse}`;
 return m;
}

function stoneGeometry(seed:string){
 const random=randomSource(seed),g=new T.SphereGeometry(1,28,18),p=g.attributes.position,phase=random()*6.28;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),d=1+.09*Math.sin(x*8+z*6+phase)+.04*Math.sin(y*16-x*9);p.setXYZ(i,x*d,y*d*.63+.04*Math.sin(x*5+z*3),z*d*(.88+.08*Math.sin(x*3)));}
 g.computeVertexNormals();return g;
}

export function mountTundraHeath(scene:T.Scene,plan:ExpansionPlan,sparse:boolean,load:(path:string)=>T.Texture){
 const group=new T.Group();group.name='concept-tundra-low-heath';scene.add(group);
 const texture=load(sparse?'/assets/wave1-detail/arid-sediment-v1.webp':'/assets/wave2-autonomous/tundra-floor-v1.png'),ground=pigmentMaterial(plan,sparse,false,texture);
 const oldMaterials=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh&&o.name==='expansion-terrain'){for(const m of Array.isArray(o.material)?o.material:[o.material])oldMaterials.add(m);o.material=ground;}});
 const groundOnly=typeof location!=='undefined'&&new URLSearchParams(location.search).get('tundraGroundOnly')==='1';
 const r=randomSource(plan.seed+'|true-heath'),rockR=randomSource(plan.seed+'|tundra-geology'),headR=randomSource(plan.seed+'|tundra-seedheads'),orientationR=randomSource(plan.seed+'|tundra-orientation'),skeletons=communitySkeletons(plan),o=new T.Object3D(),points:{x:number;z:number;scale:number;lod:'near'|'middle';variant:number}[]=[];
 const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.92,side:T.DoubleSide});
 material.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=normalize(normal*.72+mat3(viewMatrix)*vec3(0.,1.,0.)*.28);');};
 material.customProgramCacheKey=()=> 'tundra-true-branchlets-1';
 for(const lod of ['near','middle'] as const){
  let accepted=0;const desired=sparse?(lod==='near'?110:180):(lod==='near'?1050:1550);
  for(let attempt=0;attempt<desired*25&&accepted<desired;attempt++){
   let x:number,z:number;
   const inSwath=!sparse&&r()<(lod==='near'?.72:.58);
   if(inSwath){const path=skeletons[Math.floor(r()*(lod==='near'?2:3))],t=lod==='near'?r()*.78:.40+r()*.60,offset=(r()+r()+r()-1.5)*.82,point=sampleSwath(path,t,offset);x=point.x;z=point.z;}
   else{x=(r()-.5)*(lod==='near'?58:180);z=lod==='near'?38-r()*60:5-r()*155;}
   const d=Math.hypot(x,z-34),h=habitat(plan,x,z);
   if(lod==='middle'&&d<35||h.staging||r()>(sparse?.24:inSwath?.95:.72)*(1-h.mineral*.35))continue;
   points.push({x,z,scale:(lod==='near'?1.5:1.1)*(0.70+r()*.6),lod,variant:Math.floor(r()*3)});accepted++;
  }
 }
 for(const lod of ['near','middle'] as const)for(let variant=0;variant<3;variant++){
  const selected=points.filter(p=>p.lod===lod&&p.variant===variant),mesh=new T.InstancedMesh(tundraBranchletGeometry(plan.seed+'|'+variant,lod),material,selected.length);mesh.name='tundra-true-branchlet-'+lod+'-'+variant;
  selected.forEach((p,i)=>{const h=habitat(plan,p.x,p.z),approach=Math.min(1,Math.max(.25,(Math.hypot(p.x,p.z-29)-.4)/1.3)),color=sparse?'#949578':h.ribbon>.61?'#b9654e':h.community>.55?'#8aa56c':h.shelter>.48?'#b8c197':'#bba75b';
   o.position.set(p.x,expansionHeight(plan,p.x,p.z),p.z);const dx=(expansionHeight(plan,p.x+.1,p.z)-expansionHeight(plan,p.x-.1,p.z))/.2,dz=(expansionHeight(plan,p.x,p.z+.1)-expansionHeight(plan,p.x,p.z-.1))/.2;o.rotation.set(dz*.7,orientationR()*Math.PI*2,-dx*.7);o.scale.set(p.scale,p.scale*approach*(.65+h.shelter*.7),p.scale);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);mesh.setColorAt(i,new T.Color(color).multiplyScalar(.9+orientationR()*.25));});
  mesh.castShadow=false;mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);
 }
 const stones:{x:number;z:number;scale:number}[]=[];
 for(let i=0;i<120;i++){const x=(rockR()-.5)*145,z=40-rockR()*190,h=habitat(plan,x,z);if(h.staging||h.mineral<.53)continue;stones.push({x,z,scale:.20+rockR()**2*1.6});}
 for(const side of [-1,1])stones.push({x:side*(3.2+rockR()*2.3),z:27+rockR()*3,scale:.75+rockR()*.5});
 const ex=plan.camera.position[0],ez=plan.camera.position[2],fx=plan.camera.target[0]-ex,fz=plan.camera.target[2]-ez,forwardLength=Math.hypot(fx,fz),forwardX=fx/forwardLength,forwardZ=fz/forwardLength,rightX=-forwardZ,rightZ=forwardX;
 let clearanceAdjusted=0;
 for(let i=0;i<stones.length;i++){
  const stone=stones[i],rx=stone.x-ex,rz=stone.z-ez,depth=rx*forwardX+rz*forwardZ,across=rx*rightX+rz*rightZ,radius=stone.scale*1.9;
  // Conservative deformed, nonuniform-scaled bounds protect camera near-space
  // and the complete approach, not merely the character footprint center.
  if(depth>-2-radius&&depth<10+radius&&Math.abs(across)<.95+radius){const desired=(across<0?-1:across>0?1:i%2?-1:1)*(.95+radius);stone.x+=(desired-across)*rightX;stone.z+=(desired-across)*rightZ;clearanceAdjusted++;}
 }
 for(let kind=0;kind<3;kind++){
  const material=new T.MeshStandardMaterial({roughness:.94,map:texture});material.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
   vec3 mineralDetail=texture2D(map,vMapUv).rgb;float mineralValue=dot(mineralDetail,vec3(.2126,.7152,.0722));
   diffuseColor.rgb*=clamp(.58+sqrt(mineralValue)*.55,.55,1.12);
   #endif`);};
  const rock=new T.InstancedMesh(stoneGeometry(plan.seed+'|stone'+kind),material,Math.ceil(stones.length/3));rock.name='tundra-embedded-mineral-stone-'+kind;
  let n=0;stones.forEach((p,i)=>{if(i%3!==kind)return;o.position.set(p.x,expansionHeight(plan,p.x,p.z)+p.scale*.20,p.z);o.rotation.set((rockR()-.5)*.3,rockR()*6.28,(rockR()-.5)*.35);o.scale.set(p.scale*(1+rockR()*.6),p.scale,p.scale);o.updateMatrix();rock.setMatrixAt(n,o.matrix);rock.setColorAt(n,new T.Color('#969c92').lerp(new T.Color('#b4b59f'),rockR()*.7));n++;});rock.count=n;rock.castShadow=rock.receiveShadow=true;rock.computeBoundingSphere();group.add(rock);
 }
 // Sparse unnamed pale heads: no regional sedge identity or season asserted.
 const stem=new T.CylinderGeometry(.002,.003,.32,3),head=new T.IcosahedronGeometry(.025,0),stemPositions:{x:number;z:number}[]=[];
 for(let i=0;i<(sparse?30:420);i++){const x=(headR()-.5)*38,z=35-headR()*45,h=habitat(plan,x,z);if(!h.staging&&h.shelter>.51&&h.mineral<.70)stemPositions.push({x,z});}
 for(const [geo,name,mat,y]of [[stem,'tundra-rare-stalks',new T.MeshStandardMaterial({color:'#a99961',roughness:1}),.15],[head,'tundra-pale-functional-seedheads',new T.MeshStandardMaterial({color:'#d8d1b2',roughness:.9}),.32]] as const){const mesh=new T.InstancedMesh(geo,mat,stemPositions.length);stemPositions.forEach((p,i)=>{o.position.set(p.x,expansionHeight(plan,p.x,p.z)+y,p.z);o.rotation.set(.12,r()*6.28,.16);o.scale.setScalar(.7+r()*.6);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});mesh.name=name;mesh.computeBoundingSphere();group.add(mesh);}
 const sedges=new T.InstancedMesh(tundraSedgeGeometry(plan.seed+'|short-sedge'),new T.MeshStandardMaterial({color:'#c4b97b',roughness:.94,side:T.DoubleSide}),stemPositions.length);sedges.name='tundra-curved-short-sedge-functional-form';stemPositions.forEach((p,i)=>{o.position.set(p.x,expansionHeight(plan,p.x,p.z),p.z);o.rotation.set(0,r()*6.28,0);o.scale.setScalar(.65+r()*.5);o.updateMatrix();sedges.setMatrixAt(i,o.matrix);});sedges.receiveShadow=true;sedges.computeBoundingSphere();group.add(sedges);
 group.visible=!groundOnly;
 const hardApproachClearance=stones.reduce((min,stone)=>{const rx=stone.x-ex,rz=stone.z-ez,depth=rx*forwardX+rz*forwardZ,radius=stone.scale*1.9;return depth>-2-radius&&depth<10+radius?Math.min(min,Math.abs(rx*rightX+rz*rightZ)-radius):min;},Infinity);
 scene.userData.expansionDressing={instances:{lowHeath:points.length,nearBranchlets:points.filter(p=>p.lod==='near').length,middleBranchlets:points.filter(p=>p.lod==='middle').length,rocks:stones.length,seedheads:stemPositions.length},identity:'Unnamed dwarf-shrub/lichen/seedhead functional study; local flora unverified',seasonalState:'Russet pigment reference state independent of biome identity',staging:'Low substrate only inside character approach',hardApproachClearance:{halfWidth:.9,conservativeHorizontalRadius:'1.9 × specimen scale',adjustedRocks:clearanceAdjusted,minimumMeters:Number.isFinite(hardApproachClearance)?hardApproachClearance:null},groundOnly,communitySkeletons:skeletons,randomStreams:['true-heath','tundra-geology','tundra-seedheads','tundra-orientation']};
 return()=>{scene.remove(group);ground.dispose();oldMaterials.forEach(m=>m.dispose());group.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});};
}
