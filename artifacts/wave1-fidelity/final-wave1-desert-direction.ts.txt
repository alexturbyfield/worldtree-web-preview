import * as T from 'three';
import {randomSource,hashSeed} from './random';
import {cameraSpace,collisionFootprint,type FieldPlan} from './wave1-fields';
import {desertRockMaterial} from './wave1-desert-detail';

/** Synthetic low-relief drainage, not inferred mountains or measured local geology. */
export function desertRelief(seed:string,x:number,z:number){
 const phase=(hashSeed(seed+'|arid-drainage')%10000)*.001;
 const bend=Math.sin(z*.034+phase)*8+Math.sin(z*.083+phase)*2.3;
 const wash=Math.exp(-Math.pow((x-bend)/3.6,2));
 return .17*Math.sin(x*.064+z*.043+phase)+.12*Math.sin(z*.115-x*.021)-wash*.38;
}

/** Smooth implicit eroded mass cut by joints; marching tetrahedra, not box/sphere meshes. */
export function erodedMass(seed:string,steps=25,character=0){
 const r=randomSource(seed),phase=r()*6.28,tilt=(r()-.5)*.3;
 const smin=(a:number,b:number,k:number)=>{const h=Math.max(0,Math.min(1,.5+.5*(b-a)/k));return b*(1-h)+a*h-k*h*(1-h);};
 const sdf=(x:number,y:number,z:number)=>{
  const warp=.045*Math.sin(y*4+phase)*Math.sin(z*3.7+phase);x+=warp;z+=.035*Math.sin(x*4.3+y*2.9);
  const ell=(cx:number,cy:number,cz:number,rx:number,ry:number,rz:number)=>(Math.hypot((x-cx)/rx,(y-cy)/ry,(z-cz)/rz)-1)*Math.min(rx,ry,rz);
  let d=character===1?smin(ell(-.15,-.25,0,.96,.52,.74),ell(.48,-.36,.05,.61,.38,.70),.12):
   character===2?smin(ell(-.25,0,-.06,.42,1.12,.55),ell(.4,-.25,.05,.45,.75,.5),.09):
   character===3?smin(ell(-.45,-.02,0,.45,.83,.6),ell(.45,-.08,0,.43,.74,.6),.07):
   character===4?smin(ell(-.3,-.05,-.1,.38,1.05,.55),ell(.35,-.45,.15,.55,.36,.6),.10):
   character===5?smin(ell(-.3,.1,-.1,.65,.8,.75),ell(.45,-.25,.1,.6,.48,.6),.10):
   character===6?smin(ell(-.30,-.3,0,.83,.58,.68),ell(.5,-.40,.2,.55,.37,.60),.08):
   smin(ell(-.24,-.03,.02,.71,.92,.72),ell(.48,-.34,.05,.61,.57,.70),.15);
  d=smin(d,ell(-.48,-.57,.48,.60,.30,.55),.10);
  if(character>=10){
   // Broad weathered joint faces, smoothly bevelled where geological planes meet.
   // The previous narrow two-lobe core reads as a spire when stretched upright.
   d=-10;
   const cuts=[[1,.06,.08,.79],[-1,.12,-.05,.91],[.28,1,.08,.79],[-.10,-1,.12,.85],[.03,.08,1,.73],[-.15,-.12,-1,.76],[.73,.51,.44,1.04],[-.76,.37,.43,1.02],[.52,.43,-.69,1.03],[-.49,.72,-.46,1.05]];
   for(const [nx,ny,nz,offset]of cuts)d=-smin(-d,-(x*nx+y*ny+z*nz-offset),.14);
   // Convex weathering softens the planes without returning to an ellipsoidal core.
   d=d*.52+ell(.03,-.04,0,1.04,1.06,.96)*.48;
   const jointA=(x*.61+y*.76+z*.29-.12)/.10,jointB=(-x*.73+y*.19+z*.66+.21)/.095;
   d+=.105*Math.exp(-jointA*jointA)*Math.max(0,Math.min(1,(z+.2)*2.));
   d+=.075*Math.exp(-jointB*jointB)*Math.max(0,Math.min(1,(x+.2)*2.));
   return d+.025*Math.sin(x*4.4+phase)*Math.sin(y*3.6-z*2.7)+.003*Math.sin(z*23+y*14)*Math.sin(x*17-y*9);
  }
  const top=character===2||character===4?.94:character===5?.88:character===1?.55:.66;
  d=Math.max(d,(x*.39+y*.86+z*.18-top)*.65,(-x*.6+y*.26-z*.64-.72)*.65,(x*.17-y*.08+z*.9-.66)*.65);
  // A surface joint rather than a sub-voxel through-cut: thin cuts alias into sky holes.
  const joint=(x+z*.32-y*tilt-.04)/.10;
  d+=.055*Math.exp(-joint*joint)*Math.max(0,Math.min(1,(z-.10)*2.5));
  return d+.016*Math.sin(x*11+phase)*Math.sin(y*9.3-z*5)+.008*Math.sin(z*23+y*14)*Math.sin(x*17-y*9);
 };
 const pos:number[]=[],norm:number[]=[],colors:number[]=[],limit=1.35,step=limit*2/steps,n=steps+1,values=new Float32Array(n*n*n);
 const index=(x:number,y:number,z:number)=>x+n*(y+n*z),point=(x:number,y:number,z:number)=>new T.Vector3(-limit+x*step,-limit+y*step,-limit+z*step);
 for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++){const p=point(x,y,z);values[index(x,y,z)]=sdf(p.x,p.y,p.z);}
 const corners=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]],tetra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]],edges=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
 const normal=(p:T.Vector3)=>{const e=.004;return new T.Vector3(sdf(p.x+e,p.y,p.z)-sdf(p.x-e,p.y,p.z),sdf(p.x,p.y+e,p.z)-sdf(p.x,p.y-e,p.z),sdf(p.x,p.y,p.z+e)-sdf(p.x,p.y,p.z-e)).normalize();};
 for(let z=0;z<steps;z++)for(let y=0;y<steps;y++)for(let x=0;x<steps;x++){
  const points=corners.map(c=>point(x+c[0],y+c[1],z+c[2])),vs=corners.map(c=>values[index(x+c[0],y+c[1],z+c[2])]);
  if(vs.every(v=>v>0)||vs.every(v=>v<0))continue;
  for(const t of tetra){const crossings:T.Vector3[]=[];for(const [a,b]of edges){const ia=t[a],ib=t[b],va=vs[ia],vb=vs[ib];if((va<0)===(vb<0))continue;crossings.push(points[ia].clone().lerp(points[ib],va/(va-vb)));}if(crossings.length<3)continue;
   const center=crossings.reduce((a,p)=>a.add(p),new T.Vector3()).divideScalar(crossings.length),N=normal(center),u=crossings[0].clone().sub(center).normalize(),v=new T.Vector3().crossVectors(N,u);crossings.sort((a,b)=>Math.atan2(a.clone().sub(center).dot(v),a.clone().sub(center).dot(u))-Math.atan2(b.clone().sub(center).dot(v),b.clone().sub(center).dot(u)));
   for(let i=1;i<crossings.length-1;i++)for(const p of [crossings[0],crossings[i],crossings[i+1]]){pos.push(p.x,p.y,p.z);const nv=normal(p);norm.push(nv.x,nv.y,nv.z);const mineral=.92+.06*Math.sin(p.y*9+p.z*4+phase);colors.push(mineral,mineral*.98,mineral*.93);}
  }
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(norm,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeBoundingBox();g.computeBoundingSphere();return g;
}

export function mountDesertDirection(scene:T.Scene,plan:FieldPlan,height:(x:number,z:number)=>number,depth=false,variation=false){
 const r=randomSource(plan.seed+'|rocky-shoulders'),o=new T.Object3D(),s=Math.sin(plan.heading),c=Math.cos(plan.heading),placements:{x:number;z:number;size:number;stretch:number;angle:number;variant:number}[]=[];
 const put=(side:number,forward:number,size:number,variant:number)=>{const x=plan.eye[0]+s*forward+c*side,z=plan.eye[2]-c*forward+s*side;if(collisionFootprint(plan,x,z,size*1.6))return;placements.push({x,z,size,variant,stretch:.85+r()*.45,angle:forward<20?Math.atan2(plan.eye[0]-x,plan.eye[2]-z)+(r()-.5)*.65:r()*6.28});};
 const dominant=r()>.5?-1:1;
 for(const [side,f,size]of (depth?[[10.5,19,2.8],[13.4,27,3.0],[8.5,32,1.8],[4.6,4,1.1],[7.5,11,1.4]]:[[6.7,10,3.3],[8.6,14,3.9],[5.5,16,2.1],[4.6,4,1.35],[8,7,1.8]]))put(side*dominant,f,size,placements.length%6);
 for(const [side,f,size]of (depth?[[11.5,29,1.8],[14.4,41,1.7],[4.9,6.5,.85]]:[[6.1,12,2.2],[7.4,17,2.1],[4.3,5.5,1.0]]))put(-side*dominant,f,size,placements.length%6);
 for(let k=0;k<(depth?110:52);k++){const f=depth?35+r()*640:19+r()*150,side=(k%2?1:-1)*(5+f*(.20+r()*.4));put(side,f,(.4+r()*1.5)*(1-Math.min(.5,f/300)),k%6);}
 for(let variant=0;variant<6;variant++){
  const near=variant<3,g=erodedMass(plan.seed+'|weathered-'+variant,near?25:18,variation?variant+1:0),mat=desertRockMaterial();mat.vertexColors=true;
  const before=mat.onBeforeCompile,key=mat.customProgramCacheKey.bind(mat);mat.onBeforeCompile=(shader,renderer)=>{before.call(mat,shader,renderer);shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   float relief=ddFbm(ddWorld*4.8)*.018;
   vec3 q0=dFdx(-vViewPosition),q1=dFdy(-vViewPosition),R1=cross(q1,normal),R2=cross(normal,q0);
   float determinant=dot(q0,R1);
   vec3 gradient=(R1*dFdx(relief)+R2*dFdy(relief))*sign(determinant)/max(abs(determinant),.00001);
   normal=normalize(normal-clamp(gradient,vec3(-.22),vec3(.22)));
  `);};mat.customProgramCacheKey=()=>key()+'|eroded-mineral-relief-1';
  const list=placements.filter(p=>p.variant===variant),mesh=new T.InstancedMesh(g,mat,list.length);mesh.name='field-jointed-bedrock';
  list.forEach((p,i)=>{o.position.set(p.x,height(p.x,p.z)+p.size*.39,p.z);o.rotation.set((r()-.5)*.15,p.angle,(r()-.5)*.13);o.scale.set(p.size*p.stretch,p.size*(.8+r()*.35),p.size);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);mesh.setColorAt(i,new T.Color('#a87454').lerp(new T.Color('#d5a47a'),r()*.45));});mesh.computeBoundingSphere();mesh.castShadow=mesh.receiveShadow=true;scene.add(mesh);
 }
 scene.userData.desertDirection={version:'eroded-implicit-1',formations:placements.length,dominantSide:dominant,representation:'seeded implicit eroded/jointed masses; six variations, two sampling resolutions',geography:'Synthetic low relief only; no measured elevation or mountain inference'};
}

export function aridGroundMaterial(map:T.Texture){
 const mat=new T.MeshStandardMaterial({map,roughness:.98});mat.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 aridWorld;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\naridWorld=(modelMatrix*vec4(position,1.)).xyz;');
  shader.fragmentShader='varying vec3 aridWorld;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',T.ShaderChunk.map_fragment.replace('vMapUv','aridWorld.xz/3.8'));
 };mat.customProgramCacheKey=()=> 'arid-world-albedo-1';return mat;
}
