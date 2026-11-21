import {randomSource} from './random';

export type FoliageKind='douglas'|'pine'|'spruce'|'broadleaf'|'leaf'|'acacia';
type P=[number,number];
export interface AtlasLeaf {root:P;length:number;width:number;angle:number;lobed:boolean;needle:boolean}
export interface AtlasTile {kind:FoliageKind;label:string;leaves:AtlasLeaf[];stems:P[][]}
export const ATLAS_LABELS=['Douglas-fir flat spray','Pine paired needles','Spruce branchlet','Oak leaf cluster','Individual leaf','Douglas-fir variant','Oak cluster variant','Acacia leaflets'];
const kinds:FoliageKind[]=['douglas','pine','spruce','broadleaf','leaf','douglas','broadleaf','acacia'];
const point=(root:P,a:number,length:number):P=>[root[0]+Math.cos(a)*length,root[1]+Math.sin(a)*length];
/** Morphology is independent of pigment. Unit coordinates, no DOM or random globals. */
export function atlasLayout(seed='worldtree-botanical-v11'):AtlasTile[]{
  return kinds.map((kind,index)=>{
    const rand=randomSource(seed+'|tile|'+index),range=(a:number,b:number)=>a+(b-a)*rand();
    const leaves:AtlasLeaf[]=[],stems:P[][]=[];
    const add=(root:P,length:number,width:number,angle:number,lobed=false,needle=true)=>leaves.push({root,length,width,angle,lobed,needle});
    const axis=(t:number):P=>[.09+t*.79,.51+Math.sin(t*3+index)*.035];
    if(kind==='douglas'){
      stems.push(Array.from({length:14},(_,i)=>axis(i/13)));
      for(let j=0;j<6;j++)for(const side of [-1,1]){
        const root=axis(.12+j*.135),angle=side*range(.65,1.05),length=range(.2,.34)*(1-j*.045),tip=point(root,angle,length);stems.push([root,tip]);
        for(let k=0;k<10;k++)for(const s of [-1,1]){
          const t=.08+k*.085,p:P=[root[0]+(tip[0]-root[0])*t,root[1]+(tip[1]-root[1])*t];
          add(p,range(.085,.13)*(1-t*.25),range(.012,.017),angle+s*range(.78,1.28));
        }
      }
      for(let k=0;k<16;k++)for(const side of [-1,1])add(axis(.25+k*.043),range(.08,.12),.013,side*1.1);
    }else if(kind==='spruce'){
      stems.push(Array.from({length:14},(_,i)=>axis(i/13)));
      for(let j=0;j<35;j++)for(const side of [-1,1]){
        const root=axis(.05+j*.026),length=range(.075,.18)*(1-j*.009);
        add(root,length,range(.015,.022),side*range(.7,1.65));
        if(j%3===0)add(root,length*.58,.01,range(-.45,.45));
      }
    }else if(kind==='pine'){
      const stem=[axis(0),axis(.85)];stems.push(stem);
      for(let j=0;j<9;j++){
        const root=axis(.18+j*.075),side=j%2?1:-1,angle=side*range(.35,1.35);
        // Scots-pine-inspired two-needle fascicles, longer and looser than spruce.
        for(let k=0;k<3;k++)for(const pair of [-1,1])add(root,range(.25,.41),.012,angle+(k-1)*.28+pair*.055);
      }
    }else if(kind==='acacia'){
      stems.push([axis(0),axis(1)]);
      for(let j=0;j<6;j++)for(const side of [-1,1]){
        const root=axis(.12+j*.13),angle=side*1.02,tip=point(root,angle,.22);stems.push([root,tip]);
        for(let k=0;k<7;k++)for(const s of [-1,1]){const p=point(root,angle,.035+k*.025);add(p,.052,.02,angle+s*1.1,false,false);}
      }
    }else if(kind==='leaf'){
      stems.push([[.12,.5],[.24,.5]]);add([.2,.5],.66,.35,.04,true,false);
    }else{
      stems.push([axis(0),axis(.88)]);
      for(let j=0;j<7;j++){
        const root=axis(.12+j*.108),side=j%2?1:-1,angle=side*range(.65,1.12),tip=point(root,angle,.08);stems.push([root,tip]);
        add(tip,range(.2,.3),range(.13,.19),angle,true,false);
      }
      add(axis(.78),.19,.13,.06,true,false);
    }
    return {kind,label:ATLAS_LABELS[index],leaves,stems};
  });
}
export interface FoliageAtlas {canvas:HTMLCanvasElement;alpha:Uint8Array;tileSize:number;width:number;height:number;tiles:AtlasTile[];appearanceSeed:string;mipmaps?:HTMLCanvasElement[]}
const cache=new Map<string,FoliageAtlas>();
export function atlasCacheStats(){return {entries:cache.size,capacity:4};}
/** Canvas rasterization is browser-only; cached across renderer and preview mounts. */
export function getFoliageAtlas(appearanceSeed:string,tileSize=256):FoliageAtlas {
  if(tileSize!==256&&tileSize!==512)throw new Error('Atlas tiles must be 256 or 512 pixels.');
  const key=appearanceSeed+'|'+tileSize,cached=cache.get(key);if(cached){cache.delete(key);cache.set(key,cached);return cached;}
  const canvas=document.createElement('canvas');canvas.width=tileSize*4;canvas.height=tileSize*2;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('Canvas 2D is needed to paint the foliage atlas.');
  const tiles=atlasLayout(),paint=randomSource(appearanceSeed+'|atlas-pigment-v11');
  tiles.forEach((tile,index)=>{
    ctx.save();ctx.translate(index%4*tileSize,Math.floor(index/4)*tileSize);ctx.scale(tileSize,tileSize);ctx.beginPath();ctx.rect(.025,.025,.95,.95);ctx.clip();
    ctx.lineCap='round';ctx.lineJoin='round';
    for(const stem of tile.stems){ctx.beginPath();stem.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle='#927c50';ctx.lineWidth=tile.kind==='broadleaf'?.007:.005;ctx.stroke();}
    for(const leaf of tile.leaves){
      ctx.save();ctx.translate(...leaf.root);ctx.rotate(leaf.angle);const {length:l,width:w}=leaf;
      const path=new Path2D();path.moveTo(0,0);
      if(leaf.lobed){
        for(const side of [-1,1]){
          const points:P[]=Array.from({length:21},(_,i)=>{const t=side===-1?i/20:1-i/20,edge=Math.sin(t*Math.PI)*w*.5*(.72+.28*Math.sin(t*Math.PI*9));return [t*l,side*edge];});
          for(let j=0;j<points.length-1;j++){const p=points[j],next=points[j+1];path.quadraticCurveTo(...p,(p[0]+next[0])/2,(p[1]+next[1])/2);}
        }
      }else{path.quadraticCurveTo(l*.45,-w*.65,l,0);path.quadraticCurveTo(l*.45,w*.65,0,0);}path.closePath();
      const shift=Math.round((paint()-.5)*24),gradient=ctx.createLinearGradient(0,-w*.5,l*.5,w*.5);
      gradient.addColorStop(0,`rgb(${246+Math.min(0,shift)},${242+Math.min(0,shift)},${190+shift})`);
      gradient.addColorStop(.43,`rgb(${180+shift},${205+shift},${143+shift})`);gradient.addColorStop(1,`rgb(${103+shift},${143+shift},${99+shift})`);
      ctx.fillStyle=gradient;ctx.fill(path);ctx.clip(path);
      // Painted midribs, secondary veins and narrow edge highlights stay inside alpha.
      ctx.strokeStyle=leaf.needle?'#b6ca91':'#ecedb0';ctx.lineWidth=leaf.needle?.0012:.003;ctx.beginPath();ctx.moveTo(l*.06,0);ctx.quadraticCurveTo(l*.48,-w*.025,l*.9,0);ctx.stroke();
      if(!leaf.needle){ctx.strokeStyle='#9eb37a';ctx.lineWidth=.0016;for(let j=1;j<6;j++)for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(l*j/7,0);ctx.lineTo(l*(j+.65)/7,side*w*.32*Math.sin(j/7*Math.PI));ctx.stroke();}}
      ctx.strokeStyle=leaf.needle?'#d4dfa7':'#fff2bd';ctx.lineWidth=leaf.needle?.0008:.003;ctx.stroke(path);ctx.restore();
    }
    ctx.restore();
  });
  const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data,alpha=new Uint8Array(canvas.width*canvas.height);for(let i=0;i<alpha.length;i++)alpha[i]=rgba[i*4+3];
  const result={canvas,alpha,tileSize,width:canvas.width,height:canvas.height,tiles,appearanceSeed};cache.set(key,result);if(cache.size>4)cache.delete(cache.keys().next().value!);return result;
}
/** Preserve each tile's alpha coverage in minification; thin needles otherwise vanish. */
export function coverageMipmaps(atlas:FoliageAtlas){
  if(atlas.mipmaps)return atlas.mipmaps;
  const target=new Array<number>(8).fill(0);
  for(let y=0;y<atlas.height;y++)for(let x=0;x<atlas.width;x++)if(atlas.alpha[y*atlas.width+x]>76)target[Math.floor(y/atlas.tileSize)*4+Math.floor(x/atlas.tileSize)]++;
  for(let i=0;i<8;i++)target[i]/=atlas.tileSize*atlas.tileSize;
  const levels:HTMLCanvasElement[]=[atlas.canvas];let source=atlas.canvas;
  while(source.width>1||source.height>1){
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,source.width>>1);canvas.height=Math.max(1,source.height>>1);
    const ctx=canvas.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(source,0,0,canvas.width,canvas.height);
    const image=ctx.getImageData(0,0,canvas.width,canvas.height),p=image.data,tileW=canvas.width/4,tileH=canvas.height/2;
    if(tileW>=1&&tileH>=1)for(let tile=0;tile<8;tile++){
      const x0=tile%4*tileW,y0=Math.floor(tile/4)*tileH,hist=new Uint32Array(256),pixels=tileW*tileH,wanted=Math.round(target[tile]*pixels);
      for(let y=y0;y<y0+tileH;y++)for(let x=x0;x<x0+tileW;x++)hist[p[(y*canvas.width+x)*4+3]]++;
      let count=0,cut=255;while(cut>0&&count<wanted)count+=hist[cut--];const factor=wanted?Math.min(8,83/Math.max(1,cut+1)):0;
      for(let y=y0;y<y0+tileH;y++)for(let x=x0;x<x0+tileW;x++){const i=(y*canvas.width+x)*4+3;p[i]=Math.min(255,p[i]*factor);}
    }
    ctx.putImageData(image,0,0);levels.push(canvas);source=canvas;
  }
  atlas.mipmaps=levels;return levels;
}
export function atlasRect(tile:number):[number,number,number,number]{return [(tile%4)/4,1-(Math.floor(tile/4)+1)/2,1/4,1/2];}
export function atlasAlphaAt(atlas:FoliageAtlas,tile:number,u:number,v:number){
  const x=Math.min(atlas.width-1,Math.max(0,Math.floor((tile%4+u)*atlas.tileSize))),y=Math.min(atlas.height-1,Math.max(0,Math.floor((Math.floor(tile/4)+1-v)*atlas.tileSize)));
  return atlas.alpha[y*atlas.width+x]/255;
}
