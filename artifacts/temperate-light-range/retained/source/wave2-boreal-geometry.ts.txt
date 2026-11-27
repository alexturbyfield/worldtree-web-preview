import * as T from 'three';
import type {SceneRecipe} from './recipe';
import type {TreeModel,Point,Segment} from './tree';
import type {Canopy} from './canopy';
import {defaultCanopy} from './canopy';
import {randomSource} from './random';
import {expansionHeight,type ExpansionPlan} from './wave2-shared';

/** Explicit genus families: high open pine crown, drooping spruce/fir tiers, sparse larch tiers. */
export function borealTree(seed:string,name:string,size:number,framing=false):TreeModel{
 const r=randomSource(seed),pine=/Pinus/.test(name),larch=/Larix/.test(name),h=(pine?23:25)*(.84+r()*.30)*size,radius=(framing?4.8:pine?6.0:6.3)*(.9+r()*.24)*size,base=pine?.40:framing?.22:.15,segments:Segment[]=[],lean=(r()-.5)*.6;
 const at=(t:number):Point=>[Math.sin(t*2)*lean,t*h,Math.sin(t*3)*lean*.55];
 for(let j=0;j<15;j++){const t=j/15,u=(j+1)/15;segments.push({a:at(t),b:at(u),r0:.45*size*Math.pow(1-t,.85)+.015,r1:.45*size*Math.pow(1-u,.85)+.01,depth:0});}
 const levels=pine?10:14,phase=r()*6.283;
 for(let level=0;level<levels;level++){const f=level/(levels-1),t=base+f*(.96-base),reach=radius*(pine?(.74+.23*Math.sin(f*3.8)):(1-f*.92))*(.89+r()*.2);
  for(let arm=0;arm<(pine?5:6);arm++){if(r()<(larch?.14:.07))continue;const a=phase+level*2.399+arm*6.283/(pine?5:6)+(r()-.5)*.30,axis=new T.Vector3(Math.cos(a),0,Math.sin(a)),start=new T.Vector3(...at(t));
   const middle=start.clone().addScaledVector(axis,reach*.54).add(new T.Vector3(0,pine?.45:-reach*.17,0)),end=start.clone().addScaledVector(axis,reach).add(new T.Vector3(0,pine?.8:-reach*.14+.18,0)),root=.105*size*(1-f*.7);
   segments.push({a:start.toArray() as Point,b:middle.toArray() as Point,r0:root,r1:root*.58,depth:1},{a:middle.toArray() as Point,b:end.toArray() as Point,r0:root*.58,r1:.008,depth:1});
   for(let twig=0;twig<(pine?4:5);twig++){const t2=.27+twig*.135,center=start.clone().lerp(end,t2);center.y-=Math.sin(t2*Math.PI)*reach*.12;
    for(const side of [-1,1]){const sideAxis=new T.Vector3(-axis.z,0,axis.x),length=reach*(1-t2)*(.35+r()*.09),tip=center.clone().addScaledVector(axis,length*.35).addScaledVector(sideAxis,length*side).add(new T.Vector3(0,-length*.17,0));segments.push({a:center.toArray() as Point,b:tip.toArray() as Point,r0:root*.22,r1:.004,depth:2});}
   }
  }
 }
 return {seed,presetId:pine?'pine':'spruce',segments,foliage:[],parameters:{height:h,crownRadius:radius,crownBase:base,trunkRadius:.45*size,taper:.95,recursion:2,whorls:levels,spread:1,droop:pine?.05:.25},dimensions:{height:h,crownWidth:radius*2,crownDepth:radius*2}};
}
export function borealEmptyCanopy(model:TreeModel):Canopy{return {controls:{...defaultCanopy,branchExposure:.18,surfaceLeafDetail:0},envelope:{architecture:'layered-conical',center:[0,model.parameters.height*.55,0],radius:[model.parameters.crownRadius,model.parameters.height*.4,model.parameters.crownRadius],base:model.parameters.crownBase*model.parameters.height,top:model.parameters.height},clumps:[],coarseClumps:[],surfaceCards:[],bounds:{min:[-model.parameters.crownRadius,0,-model.parameters.crownRadius],max:[model.parameters.crownRadius,model.parameters.height,model.parameters.crownRadius]},dimensions:model.dimensions,palette:{name:'boreal genus bough',shadow:'#243f38',body:'#52774a',light:'#b9bd64'}};}

interface Surface{p:number[];c:number[];i:number[];uv:number[]}
const surface=():Surface=>({p:[],c:[],i:[],uv:[]});
function spray(s:Surface,a:T.Vector3,b:T.Vector3,width:number,color:T.Color,phase:number,detail=7,roll=0){
 const axis=b.clone().sub(a).normalize(),side=new T.Vector3(-axis.z,0,axis.x).normalize().applyAxisAngle(axis,roll),start=s.p.length/3;
 const tile=Math.abs(Math.floor(phase*17))%4;
 for(let row=0;row<=detail;row++){const t=row/detail,center=a.clone().lerp(b,t);center.y+=Math.sin(t*Math.PI)*width*.13;
  for(const v of [-1,0,1]){const p=center.clone().addScaledVector(side,v*width);p.y-=Math.abs(v)*width*.10;s.p.push(...p.toArray());s.uv.push((tile%2)*.5+(v*.5+.5)*.5,(tile<2?.5:0)+t*.5);const shade=(v===0?1:.98)*(1+Math.sin(phase+row)*.025);s.c.push(color.r*shade,color.g*shade,color.b*shade);}
 }for(let j=0;j<detail;j++)for(let k=0;k<2;k++){const x=start+j*3+k;s.i.push(x,x+3,x+1,x+1,x+3,x+4);}
}
function geometry(s:Surface){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(s.p,3));g.setAttribute('color',new T.Float32BufferAttribute(s.c,3));if(s.uv.length===s.p.length/3*2)g.setAttribute('uv',new T.Float32BufferAttribute(s.uv,2));g.setIndex(s.i);g.computeVertexNormals();g.computeBoundingSphere();return g;}
/** Needle sprays contain many rounded needles: their collective diffuse response wraps across the thin support surface. */
function needleMaterial(map?:T.Texture){const m=new T.MeshStandardMaterial({map,alphaTest:map ? .55 : 0,vertexColors:true,side:T.DoubleSide,roughness:1});m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=normalize(normal*.70+mat3(viewMatrix)*vec3(0.,.75,0.));');};m.customProgramCacheKey=()=> 'boreal-rounded-needle-wrap-3|'+!!map;return m;}

export function mountBorealNeedles(scene:T.Scene,recipe:SceneRecipe,plan:ExpansionPlan,atlas:T.Texture){
 const s=surface(),r=randomSource(recipe.seed+'|needle-paint');
 for(const tree of recipe.trees){if(tree.studio||!/Picea|Pinus|Larix|Abies/.test(tree.species.scientificName??''))continue;
  const pine=/Pinus/.test(tree.species.scientificName??''),near=Math.hypot(tree.position[0],tree.position[2]-34)<48,c=Math.cos(tree.rotation),sn=Math.sin(tree.rotation),transform=(p:Point)=>new T.Vector3(p[0]*c-p[2]*sn+tree.position[0],p[1]+tree.position[1],p[0]*sn+p[2]*c+tree.position[2]);
  for(const segment of tree.model.segments){if(segment.depth!==1||segment.r1!==.008)continue;const a=transform(segment.a),b=transform(segment.b),len=a.distanceTo(b),axis=b.clone().sub(a).normalize(),t=segment.b[1]/tree.model.parameters.height;
   a.addScaledVector(axis,-len*.48);
   const tint=new T.Color('#9fb6aa').lerp(new T.Color('#f4f3d4'),Math.max(0,t-.35)*.8+r()*.10);
   for(const side of [-1,1])spray(s,a,b,len*(pine?.58:.68),tint,r()*6.283,near?4:2,side*(.63+r()*.17));
  }
 }
 const mesh=new T.Mesh(geometry(s),needleMaterial(atlas));mesh.name='boreal-attached-needle-sprays';mesh.castShadow=true;mesh.receiveShadow=false;scene.add(mesh);
 const farS=surface();for(let level=0;level<8;level++)for(let arm=0;arm<5;arm++){const t=level/8,a=arm*1.256+level*2.399,reach=(1-t)*.48,root=new T.Vector3(0,.18+t*.78,0),end=new T.Vector3(Math.cos(a)*reach,root.y-reach*.17,Math.sin(a)*reach);for(const side of [-1,1])spray(farS,root,end,reach*.55,new T.Color('#b8c9bc'),level+arm,2,side*.70);}
 const far=new T.InstancedMesh(geometry(farS),needleMaterial(atlas),recipe.trees.some(t=>/Picea|Pinus|Larix|Abies/.test(t.species.scientificName??''))?420:0),o=new T.Object3D();far.name='boreal-distant-attached-boughs';
 for(let i=0;i<far.count;i++){const angle=r()*6.283,d=72+r()*270,x=Math.cos(angle)*d,z=34+Math.sin(angle)*d;o.position.set(x,expansionHeight(plan,x,z),z);o.rotation.set(0,r()*6.283,0);o.scale.set(10+r()*6,20+r()*9,10+r()*6);o.updateMatrix();far.setMatrixAt(i,o.matrix);}far.computeBoundingSphere();far.receiveShadow=false;scene.add(far);
 return()=>{scene.remove(mesh,far);mesh.geometry.dispose();(mesh.material as T.Material).dispose();far.geometry.dispose();(far.material as T.Material).dispose();};
}

export function mountBorealFloor(scene:T.Scene,plan:ExpansionPlan){
 const group=new T.Group();group.name='boreal-moss-duff-floor';scene.add(group);const r=randomSource(plan.seed+'|living-floor'),o=new T.Object3D();
 const s=surface();for(let j=0;j<10;j++){const angle=r()*6.283,d=Math.sqrt(r())*.70,x=Math.cos(angle)*d,z=Math.sin(angle)*d,reach=.045+r()*.055,width=.025+r()*.03,start=s.p.length/3,c=new T.Color('#718446').lerp(new T.Color('#b1b15f'),r()*.3);
  for(let row=0;row<=2;row++){const t=row/2,w=Math.sin(t*Math.PI)*width;for(const v of [-1,0,1]){const along=(t-.5)*reach;s.p.push(x+Math.cos(angle)*along-Math.sin(angle)*v*w,.008+Math.sin(t*Math.PI)*(1-Math.abs(v)*.45)*.014,z+Math.sin(angle)*along+Math.cos(angle)*v*w);s.c.push(c.r,c.g,c.b);}}
  for(let row=0;row<2;row++)for(let k=0;k<2;k++){const a=start+row*3+k;s.i.push(a,a+3,a+1,a+1,a+3,a+4);}
 }
 const moss=new T.InstancedMesh(geometry(s),needleMaterial(),3100);moss.name='boreal-low-moss-cushions';
 for(let i=0;i<moss.count;i++){const near=i<1500,x=(r()-.5)*(near?44:105),z=near?39-r()*64:40-r()*155,flow=.5+.25*Math.sin(x*.09+Math.sin(z*.07)*2)+.2*Math.sin(z*.055-x*.07),size=.7+r()*1.15;o.position.set(x,expansionHeight(plan,x,z)+.012,z);o.rotation.set(0,r()*6.283,0);o.scale.set(size,.35+flow*.45,size*(.7+r()*.6));o.updateMatrix();moss.setMatrixAt(i,o.matrix);moss.setColorAt(i,new T.Color('#ffffff').lerp(new T.Color('#e5e7bb'),flow*.22));}moss.receiveShadow=true;moss.computeBoundingSphere();group.add(moss);
 const rockGeo=new T.IcosahedronGeometry(1,2),pos=rockGeo.attributes.position,colors:number[]=[];for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),f=1+.12*Math.sin(x*9+z*6)*Math.cos(y*7);pos.setXYZ(i,x*f,y*f*.62,z*f);const c=new T.Color('#77796c').lerp(new T.Color('#788342'),Math.max(0,y)*.75);colors.push(c.r,c.g,c.b);}rockGeo.setAttribute('color',new T.Float32BufferAttribute(colors,3));rockGeo.computeVertexNormals();
 const rocks=new T.InstancedMesh(rockGeo,new T.MeshStandardMaterial({vertexColors:true,roughness:.96}),96);rocks.name='boreal-embedded-moss-stone';
 for(let i=0;i<rocks.count;i++){let x=(r()-.5)*70,z=34-r()*90;if(i<6){x=(i%2?1:-1)*(4.7+r()*4);z=28-Math.floor(i/2)*9;}if(Math.abs(x)<2.4&&z>19&&z<34)x+=x<0?-4:4;const size=i<6?1.1+r()*.8:.16+r()*.8;o.position.set(x,expansionHeight(plan,x,z)-size*.18,z);o.rotation.set((r()-.5)*.5,r()*6.283,(r()-.5)*.4);o.scale.set(size*(1.1+r()*.5),size,size);o.updateMatrix();rocks.setMatrixAt(i,o.matrix);}rocks.castShadow=rocks.receiveShadow=true;rocks.computeBoundingSphere();group.add(rocks);
 const leafGeo=new T.SphereGeometry(1,5,3);leafGeo.scale(.032,.013,.065);const leaves=new T.InstancedMesh(leafGeo,new T.MeshStandardMaterial({roughness:1}),2400);leaves.name='boreal-unnamed-low-heath-leaves';
 for(let i=0;i<leaves.count;i++){const patch=Math.floor(i/40),pr=randomSource(plan.seed+'|heath'+patch),cx=(pr()-.5)*48,cz=32-pr()*75,x=cx+(r()-.5)*1.5,z=cz+(r()-.5)*1.5,clear=Math.abs(x)<2.5&&z>17,h=clear?.05:.10+r()*.25;o.position.set(x,expansionHeight(plan,x,z)+h,z);o.rotation.set(r()*.7,r()*6.283,r()*.5);o.scale.setScalar(.8+r()*.8);o.updateMatrix();leaves.setMatrixAt(i,o.matrix);leaves.setColorAt(i,new T.Color(i%11===0?'#a84d34':'#597342').lerp(new T.Color('#b4ad4b'),r()*.25));}leaves.receiveShadow=true;leaves.computeBoundingSphere();group.add(leaves);
 return()=>{scene.remove(group);group.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(o.material as T.Material).dispose();}});};
}



