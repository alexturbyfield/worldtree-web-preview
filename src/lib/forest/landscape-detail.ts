import * as T from 'three';
import {randomSource} from './random';
export const landscapePalette={ridges:['#a5bdc6','#87a6af','#648e90'],grass:['#4c6742','#6f874c','#889c59','#adb775']};
export function landscapeMode(){return typeof location==='undefined'?'C':(new URLSearchParams(location.search).get('landscape')??'C').toUpperCase();}
export function mountainRidges(scene:T.Scene,seed:string){
 const rand=randomSource(seed+'|ridge-landforms');
 const painted=typeof location==='undefined'||new URLSearchParams(location.search).get('mountainTexture')!=='off';
 const ridges:{geometry:T.BufferGeometry;material:T.MeshBasicMaterial;layer:number}[]=[];let disposed=false;
 const texture=painted?new T.TextureLoader().load('/assets/puget-v1/mountain-painted-v1.webp',map=>{
  if(disposed)return;map.colorSpace=T.SRGBColorSpace;map.minFilter=T.LinearMipmapLinearFilter;map.magFilter=T.LinearFilter;map.anisotropy=2;
  for(const ridge of ridges){const c=ridge.geometry.getAttribute('color');for(let i=0;i<c.count;i++){const value=c.getX(i)/new T.Color(landscapePalette.ridges[ridge.layer]).r;c.setXYZ(i,value,value,value);}c.needsUpdate=true;ridge.material.map=map;ridge.material.needsUpdate=true;}
  scene.userData.artRevision=(scene.userData.artRevision??0)+1;
 },undefined,()=>{scene.userData.mountainTextureError='Painted mountain texture unavailable; original ridge colours retained.';}):undefined;
 if(texture){texture.wrapS=T.MirroredRepeatWrapping;texture.colorSpace=T.SRGBColorSpace;texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;}

 for(let layer=0;layer<3;layer++){
  const positions:number[]=[],colors:number[]=[],z=-118+layer*21;
  const heights=[12,17,13,24,18,30,20,36,25,43,29,23,31,20,16,21,12].map((v,i)=>v*(.8+layer*.08)+(rand()-.5)*6+(i===9?layer*1.5:0));
  const color=new T.Color(landscapePalette.ridges[layer]);
  const add=(x:number,y:number,top:boolean)=>{positions.push(x,y,z);const wash=layer===2?Math.sin(x*.061+y*.17)*.025+Math.cos(x*.12-y*.11)*.018:0;const c=color.clone().multiplyScalar((top?1.025:.88)+wash);colors.push(c.r,c.g,c.b);};
  const rolling=typeof location==='undefined'||new URLSearchParams(location.search).get('ridgeShape')!=='old';
  if(!rolling)for(let i=0;i<64;i++){const t=i/4,k=Math.floor(t),f=t-k,y=heights[k]*(1-f)+heights[k+1]*f,x=-130+i*4.0625,t2=(i+1)/4,k2=Math.min(15,Math.floor(t2)),f2=t2-k2,y2=heights[k2]*(1-f2)+heights[k2+1]*f2;add(x,-5,false);add(x,y,true);add(x+4.0625,y2,true);add(x,-5,false);add(x+4.0625,y2,true);add(x+4.0625,-5,false);}
  if(rolling){
   // Broad, overlapping landforms with actual depth, not a curtain or repeated wave.
   const hills=[-118,-62,-8,51,112].map((x,i)=>({x:x+(rand()-.5)*14,u:.43+rand()*.24,radius:43+rand()*24,height:[17,27,19,34,22][i]*(1-layer*.14)}));
   const front=-102+layer*23,depth=67;
   const point=(i:number,j:number)=>{const x=-135+i*270/72,u=j/16,z=front-u*depth;
    let y=-4;for(const hill of hills){const dx=(x-hill.x)/hill.radius,dz=(u-hill.u)/.46;y+=hill.height*Math.exp(-dx*dx*2.15-dz*dz*1.8)*.88;}
    const fade=T.MathUtils.smoothstep(u,0,.19);y=-4+(y+4)*fade;
    return new T.Vector3(x,y,z);
   };
   const vertex=(v:T.Vector3)=>{positions.push(v.x,v.y,v.z);const wash=layer===2?Math.sin(v.x*.061+v.y*.17)*.025+Math.cos(v.x*.12-v.y*.11)*.018:0;const c=color.clone().multiplyScalar(.9+T.MathUtils.clamp((v.y+4)/38,0,1)*.125+wash);colors.push(c.r,c.g,c.b);};
   for(let j=0;j<16;j++)for(let i=0;i<72;i++){const a=point(i,j),b=point(i+1,j),c=point(i,j+1),d=point(i+1,j+1);[a,c,b,b,c,d].forEach(vertex);}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  const uv:number[]=[];for(let i=0;i<positions.length;i+=3)uv.push((positions[i]+130)/80+layer*.17,(positions[i+1]+5)/80+layer*.06);g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  const material=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide,fog:false});
  if(painted){const air=new T.Color(landscapePalette.ridges[layer]);material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>\n#ifdef USE_MAP\ndiffuseColor.rgb=mix(vec3(${air.r.toFixed(5)},${air.g.toFixed(5)},${air.b.toFixed(5)}),diffuseColor.rgb,${[.28,.53,.82][layer].toFixed(3)});\n#endif`);};material.customProgramCacheKey=()=>`painted-mountain-v1-${layer}`;}
  scene.add(new T.Mesh(g,material));ridges.push({geometry:g,material,layer});
 }
 return ()=>{disposed=true;texture?.dispose();};
}
/** Toroidally wrapped brush groups, not pixel noise or downloaded photographic texture. */
function flatLandscapeGrass(seed:string,size=2048,palette=landscapePalette.grass){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const g=canvas.getContext('2d')!,r=randomSource(seed+'|meadow-brush');g.fillStyle=palette[1];g.fillRect(0,0,size,size);
 for(let group=0;group<1700;group++){
  const cx=r()*size,cy=r()*size,angle=(r()-.5)*.7;
  for(let blade=0;blade<7;blade++){
   const x=cx+(r()-.5)*45,y=cy+(r()-.5)*32,length=12+r()*36,width=2+r()*5,lean=angle*length+(r()-.5)*8,pigment=palette[Math.floor(r()*palette.length)];
   for(const ox of [-size,0,size])for(const oy of [-size,0,size]){if(x+ox<-50||x+ox>size+50||y+oy<-60||y+oy>size+60)continue;g.fillStyle=pigment;g.globalAlpha=.12+blade*.025;g.beginPath();g.moveTo(x+ox-width,y+oy);g.quadraticCurveTo(x+ox+lean*.35,y+oy-length*.55,x+ox+lean,y+oy-length);g.quadraticCurveTo(x+ox+width+lean*.4,y+oy-length*.35,x+ox+width,y+oy);g.fill();}
  }
 }
 g.globalAlpha=1; // Match opposite edge texels for filtered repetition.
 g.putImageData(g.getImageData(0,0,1,size),size-1,0);g.putImageData(g.getImageData(0,0,size,1),0,size-1);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;texture.anisotropy=4;return texture;
}
export function grassGroups(seed:string){const r=randomSource(seed+'|meadow-groups'),groups=Array.from({length:42},()=>({x:(r()-.5)*88,z:(r()-.5)*82,rx:2.4+r()*4.5,rz:1.7+r()*3.4}));return(x:number,z:number)=>{let weight=0;for(const g of groups)weight=Math.max(weight,Math.exp(-1.8*((x-g.x)**2/g.rx**2+(z-g.z)**2/g.rz**2)));return Math.min(1,weight*1.35);};}

/** Layered painted fans: cool undergrowth, overlapping bent blades and restrained warm edges. */
export function landscapeGrass(seed:string,size=2048,palette=['#263e32','#426447','#6d914e','#a9b76b']){
 if(typeof location!=='undefined'&&new URLSearchParams(location.search).get('grassPaint')==='flat')return flatLandscapeGrass(seed,size);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const g=canvas.getContext('2d')!,r=randomSource(seed+'|painted-meadow-v2'),unit=size/2048;
 g.fillStyle=palette[1];g.fillRect(0,0,size,size);
 const fans=Array.from({length:360},()=>({x:r()*size,y:r()*size,lean:(r()-.5)*.9,rotation:(r()-.5)*2.1,scale:(.65+r()*.75)*unit,phase:r(),blades:Array.from({length:9},(_,i)=>({spread:(i-4)*18+(r()-.5)*15,height:70+r()*120,width:5+r()*12,bend:(r()-.5)*30,base:(r()-.5)*60,tint:r()}))}));
 // Identical brush work on wrapped copies; random values are resolved before wrapping.
 for(let pass=0;pass<3;pass++)for(const f of fans)for(const ox of [-size,0,size])for(const oy of [-size,0,size]){
  if(f.x+ox<-300*unit||f.x+ox>size+300*unit||f.y+oy<-300*unit||f.y+oy>size+300*unit)continue;
  g.save();g.translate(f.x+ox,f.y+oy);g.rotate(f.rotation);g.scale(f.scale,f.scale);
  for(const b of f.blades){
   const length=b.height*(pass===0?1.13:pass===1?1:.63),root=b.spread,tip=root+b.spread*.48+f.lean*length+b.bend,w=b.width*(pass===0?1.6:pass===1?1:.38);
   const grad=g.createLinearGradient(root,15,tip,-length);
   grad.addColorStop(0,(pass===0?palette[0]:palette[1])+'00');grad.addColorStop(.23,(pass===0?palette[0]:palette[1])+'cc');grad.addColorStop(.53,pass===0?palette[1]:palette[2]);grad.addColorStop(1,pass===0?palette[1]:palette[3]);g.fillStyle=grad;g.globalAlpha=pass===0?.65:pass===1?.92:.42;
   g.beginPath();g.moveTo(root-w,16+b.base);g.bezierCurveTo(root-w*1.7,-length*.28+b.base*.4,tip-w+b.bend,-length*.88,tip+b.bend,-length);g.bezierCurveTo(tip+w*.6+b.bend,-length*.66,root+w*1.3,-length*.18+b.base*.4,root+w,16+b.base);g.fill();
   if(pass===1&&b.tint>.63){g.strokeStyle='rgba(211,215,146,.48)';g.lineWidth=1.3;g.beginPath();g.moveTo(root-w*.25,-length*.12);g.quadraticCurveTo(root+f.lean*length*.4-w*.4,-length*.56,tip,-length*.96);g.stroke();}
  }g.restore();
 }
 g.globalAlpha=1;g.putImageData(g.getImageData(0,0,1,size),size-1,0);g.putImageData(g.getImageData(0,0,size,1),0,size-1);
 const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.anisotropy=4;return t;
}
/** Scalar coverage/tonal mask; baked once, sampled in world space, never treated as colour. */
function cellularDirtMask(seed:string,size=512){
 const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d')!,pixels=g.createImageData(size,size),salt=randomSource(seed+'|dirt-patches')()*10000;
 const hash=(x:number,y:number)=>{let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^(salt|0);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295;};
 const noise=(x:number,y:number)=>{const ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy,a=u*u*(3-2*u),b=v*v*(3-2*v);return (hash(ix,iy)*(1-a)+hash(ix+1,iy)*a)*(1-b)+(hash(ix,iy+1)*(1-a)+hash(ix+1,iy+1)*a)*b;};
 const fbm=(x:number,y:number)=>noise(x,y)*.57+noise(x*2.03+7,y*2.03-3)*.29+noise(x*4.07-2,y*4.07+8)*.14;
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  const x=i/(size-1)*100-50,z=j/(size-1)*100-50,brown=fbm(x*.048+11,z*.048+19),wx=x*.13+(fbm(x*.04,z*.04)-.5)*1.8,wz=z*.13+(fbm(x*.04+18,z*.04+7)-.5)*1.8,ix=Math.floor(wx),iz=Math.floor(wz);let d=9;
  for(let u=-1;u<=1;u++)for(let v=-1;v<=1;v++){const cx=ix+u,cz=iz+v;d=Math.min(d,Math.hypot(wx-cx-hash(cx,cz),wz-cz-hash(cx+137,cz-27)));}
  const k=(j*size+i)*4;pixels.data[k]=Math.round(Math.max(0,Math.min(1,.69-d*.9+(brown-.5)*.42))*255);pixels.data[k+1]=Math.round(brown*255);pixels.data[k+2]=0;pixels.data[k+3]=255;
 }
 g.putImageData(pixels,0,0);const t=new T.CanvasTexture(c);t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;return t;
}

/** Scuffed clearings and interrupted short passages, with recovering grass between them. */
export function dirtPatchMask(seed:string,size=512){
 const texture=cellularDirtMask(seed,size);
 if(typeof location!=='undefined'&&new URLSearchParams(location.search).get('dirtWear')==='cellular')return texture;
 const c=texture.image as HTMLCanvasElement,g=c.getContext('2d')!,pixels=g.getImageData(0,0,size,size),r=randomSource(seed+'|worn-pockets-v1');
 const anchors=[[-23,-23],[5,-14],[-6,4],[18,12],[-18,23],[28,-32],[-35,-3],[34,29],[-1,34],[-32,-39]];
 const traces=anchors.map(([x,z],i)=>{const angle=r()*Math.PI*2,length=7+r()*14,curve=(r()-.5)*length*.9,width=1.6+r()*3.1,points=[];
  for(let j=0;j<=8;j++){const u=j/8,t=(u-.5)*length,bend=Math.sin(u*Math.PI)*curve;points.push({x:x+Math.cos(angle)*t-Math.sin(angle)*bend,z:z+Math.sin(angle)*t+Math.cos(angle)*bend,width:width*(.25+.75*Math.pow(Math.sin(Math.PI*u),.7))*(.8+r()*.4)});}
  return {points,weight:.7+(i%3)*.2};
 });
 const score=new Float32Array(size*size),values=new Uint8Array(size*size),viewWeights=new Float32Array(size*size);let targetWear=0;
 const coverage=(v:number)=>{const t=Math.max(0,Math.min(1,(v-.42)/.22));return t*t*(3-2*t);};
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  const x=i/(size-1)*100-50,z=j/(size-1)*100-50,index=j*size+i;values[index]=pixels.data[index*4];let wear=0;
  // Weight near-ground area by projected importance in the anchored encounter view.
  const distance=34-z,weight=distance>14&&distance<95&&Math.abs(x+.037*distance)<distance*.7?1/(distance*distance*distance):0;viewWeights[index]=weight;targetWear+=weight*coverage(values[index]/255);
  for(const trace of traces){let contact=0;for(let k=0;k<8;k++){const a=trace.points[k],b=trace.points[k+1],dx=b.x-a.x,dz=b.z-a.z,u=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz))),d2=(x-a.x-u*dx)**2+(z-a.z-u*dz)**2,width=a.width+(b.width-a.width)*u;contact=Math.max(contact,Math.exp(-d2/(width*width)));}wear+=contact*trace.weight;}
  // Coherent broken margins and grassy recovery, rather than evenly stamped bare spots.
  const recovery=.5+.25*Math.sin(x*.42+Math.sin(z*.24))+.25*Math.cos(z*.37-x*.19),broad=pixels.data[index*4+1]/255;
  score[index]=wear*(.72+.48*broad)-recovery*.12+(broad-.5)*.08;
 }
 // Rank transfer preserves the exact coverage/value histogram of the approved cellular mask.
 const order=Array.from({length:score.length},(_,i)=>i).sort((a,b)=>score[a]-score[b]||a-b);values.sort();
 for(let rank=0;rank<order.length;rank++)pixels.data[order[rank]*4]=values[rank];
 // Match approximate visible coverage, not merely unweighted whole-map area.
 let lo=-.3,hi=.3;for(let step=0;step<14;step++){const bias=(lo+hi)/2;let area=0;for(let i=0;i<order.length;i++)if(viewWeights[i])area+=viewWeights[i]*coverage(pixels.data[i*4]/255+bias);if(area>targetWear)hi=bias;else lo=bias;}
 const residualGrass=.045,bias=(lo+hi)/2-residualGrass;for(let i=0;i<order.length;i++)pixels.data[i*4]=Math.round(Math.max(0,Math.min(255,pixels.data[i*4]+bias*255)));
 g.putImageData(pixels,0,0);texture.needsUpdate=true;return texture;
}
