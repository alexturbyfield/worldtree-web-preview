import {randomSource} from '../forest/random';
import {batchSpecies} from './species-v1';
import type {StudioSettings} from './groups';
export const studioAtlasLabels=['Oval leaf fan','Lanceolate fan','Layered broadleaf','Small leaf spray','Blossom cloud','Cupped petals','Hanging blossoms','Small flower spray','Fir bough','Drooping fir spray','Needle branchlet','Fine needle fan'];
const cache=new Map<string,HTMLCanvasElement>();
/** Sparse oak sprig study: nine lobed leaves on connected, unequal twig forks. */
function drawOakLeafSpray(ctx:CanvasRenderingContext2D,q:StudioSettings){
  const shape=randomSource(q.structure+'|oak-spray-study'),paint=randomSource(q.appearance+'|oak-spray-study');
  const twig=(points:number[])=>{ctx.beginPath();ctx.moveTo(points[0],points[1]);ctx.bezierCurveTo(points[2],points[3],points[4],points[5],points[6],points[7]);ctx.strokeStyle='#77845a';ctx.lineWidth=.009;ctx.stroke();ctx.strokeStyle='rgba(202,204,137,.55)';ctx.lineWidth=.003;ctx.stroke();};
  twig([.5,.9,.47,.68,.54,.4,.49,.13]);twig([.49,.7,.43,.58,.35,.49,.27,.29]);twig([.5,.56,.61,.54,.68,.44,.73,.28]);twig([.49,.73,.6,.74,.7,.68,.78,.56]);
  const leaves=[ [.45,.72,-2.8,.24],[.57,.72,-.25,.24],[.37,.5,-2.8,.23],[.27,.29,-1.9,.2],[.48,.46,-2.1,.23],[.51,.23,-1.48,.18],[.62,.49,-.9,.24],[.73,.28,-1.15,.19],[.74,.61,-.8,.19] ];
  for(const [x,y,angle,length] of leaves){
    const l=length*(.94+shape()*.12),w=l*(q.palette==='sage'?.66:.48),c=(paint()-.5)*16;
    ctx.save();ctx.translate(x,y);ctx.rotate(angle+(shape()-.5)*.15);ctx.scale(l,w);
    ctx.beginPath();ctx.moveTo(-.065,0);ctx.lineTo(.07,0);ctx.strokeStyle='#87965e';ctx.lineWidth=.026;ctx.stroke();
    const leaf=new Path2D();leaf.moveTo(0,0);
    leaf.bezierCurveTo(.08,-.08,.05,-.28,.18,-.22);leaf.bezierCurveTo(.22,-.5,.4,-.52,.39,-.22);leaf.bezierCurveTo(.48,-.55,.62,-.48,.55,-.18);leaf.bezierCurveTo(.68,-.43,.81,-.34,.72,-.12);leaf.bezierCurveTo(.83,-.25,.91,-.14,1,0);
    leaf.bezierCurveTo(.91,.16,.84,.27,.73,.12);leaf.bezierCurveTo(.81,.35,.66,.45,.56,.19);leaf.bezierCurveTo(.63,.5,.47,.55,.4,.23);leaf.bezierCurveTo(.42,.52,.22,.49,.18,.22);leaf.bezierCurveTo(.06,.29,.08,.08,0,0);leaf.closePath();
    const gradient=ctx.createLinearGradient(.15,-.5,.65,.48);gradient.addColorStop(0,`rgb(${157+c},${188+c},${99+c})`);gradient.addColorStop(.45,`rgb(${99+c},${153+c},${79+c})`);gradient.addColorStop(1,`rgb(${53+c},${104+c},${76+c})`);ctx.fillStyle=gradient;ctx.fill(leaf);
    ctx.save();ctx.clip(leaf);ctx.strokeStyle='rgba(221,222,151,.55)';ctx.lineWidth=.016;ctx.beginPath();ctx.moveTo(.02,0);ctx.quadraticCurveTo(.5,-.025,.94,0);ctx.stroke();
    for(const t of [.24,.44,.64,.8])for(const sign of [-1,1]){ctx.strokeStyle=sign<0?'rgba(225,224,158,.32)':'rgba(31,78,57,.3)';ctx.lineWidth=.009;ctx.beginPath();ctx.moveTo(t-.07,0);ctx.quadraticCurveTo(t+.02,sign*.1,t+.07,sign*.3);ctx.stroke();}ctx.restore();
    ctx.strokeStyle='rgba(206,218,137,.4)';ctx.lineWidth=.012;ctx.stroke(leaf);ctx.restore();
  }
}
/** Tropical sprays share the existing alpha atlas and Sage paint, with distinct leaf architecture. */
function drawEmergentSpray(ctx:CanvasRenderingContext2D,q:StudioSettings){
  const id=q.presetId!,rand=randomSource(q.structure+'|emergent-spray|'+id),paint=randomSource(q.appearance+'|emergent-paint|'+id),palmate=id==='kapok',pinnate=id==='mahogany',count=palmate?7:pinnate?7:5;
  ctx.strokeStyle='#687750';ctx.lineWidth=.009;ctx.beginPath();ctx.moveTo(.5,.92);ctx.quadraticCurveTo(.48,.57,.5,palmate?.58:.12);ctx.stroke();
  for(let i=0;i<count;i++){
    const side=i%2?1:-1,terminal=pinnate&&i===count-1,t=(i+.7)/(count+1),x=palmate?.5:terminal?.5:.5+side*.15,y=palmate?.64:pinnate?(terminal?.14:.8-Math.floor(i/2)*.2):.85-t*.68;
    const angle=palmate?-Math.PI/2+(i-3)*.37+(rand()-.5)*.07:terminal?-Math.PI/2:side>0?-.52-rand()*.2:Math.PI+.52+rand()*.2;
    const length=(palmate?.37:pinnate?.24:.29)*(.88+rand()*.2),width=length*(palmate?.27:pinnate?.62:id==='dipterocarp-alatus'?.39:.65);
    ctx.beginPath();ctx.moveTo(.5,y+.055);ctx.lineTo(x,y);ctx.strokeStyle='#72805a';ctx.lineWidth=.007;ctx.stroke();
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);const leaf=new Path2D();leaf.moveTo(0,0);
    leaf.bezierCurveTo(length*.22,-width*.6,length*.7,-width*.55,length*.91,-width*.08);leaf.lineTo(length,0);leaf.bezierCurveTo(length*.69,width*.5,length*.2,width*.62,0,0);leaf.closePath();
    const c=(paint()-.5)*14,g=ctx.createLinearGradient(0,-width,length*.2,width);g.addColorStop(0,`rgb(${160+c},${183+c},${113+c})`);g.addColorStop(.5,`rgb(${100+c},${147+c},${91+c})`);g.addColorStop(1,`rgb(${55+c},${101+c},${80+c})`);ctx.fillStyle=g;ctx.fill(leaf);
    ctx.save();ctx.clip(leaf);ctx.strokeStyle='rgba(212,218,155,.44)';ctx.lineWidth=.003;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(length*.94,0);ctx.stroke();
    for(const t of [.25,.43,.61,.77])for(const sign of [-1,1]){ctx.strokeStyle='rgba(196,209,148,.2)';ctx.lineWidth=.0015;ctx.beginPath();ctx.moveTo(length*(t-.08),0);ctx.quadraticCurveTo(length*t,width*sign*.15,length*(t+.07),width*sign*.38);ctx.stroke();}
    ctx.restore();ctx.restore();
  }
}
/** Palmate blades, strap leaves and pinnate palm fronds use the same cutout atlas. */
function drawSpecialFoliage(ctx:CanvasRenderingContext2D,q:StudioSettings,underside=false){
 const form=batchSpecies[q.presetId!].form,paint=randomSource(q.appearance+'|special-foliage|'+form),shape=randomSource(q.structure+'|special-foliage-shape|'+form),c=(paint()-.5)*12;
 const gradient=ctx.createLinearGradient(.2,.1,.7,.9);gradient.addColorStop(0,`rgb(${(underside?196:165)+c},${(underside?207:188)+c},${(underside?178:122)+c})`);gradient.addColorStop(.48,`rgb(${(underside?156:100)+c},${(underside?179:150)+c},${(underside?151:91)+c})`);gradient.addColorStop(1,`rgb(${(underside?113:52)+c},${(underside?143:100)+c},${(underside?122:79)+c})`);ctx.fillStyle=underside?'#b8c9ad':gradient;
 if(form==='palmate'){
  const shape=randomSource(q.structure+'|palmate-lobes'),leaf=new Path2D();for(let i=0;i<=144;i++){const a=i/144*Math.PI*2-Math.PI/2,r=.17+.27*Math.pow((1+Math.cos((a+Math.PI/2)*8))/2,.28),x=.5+Math.cos(a)*r,y=.5+Math.sin(a)*r*(.94+shape()*.025);if(i)leaf.lineTo(x,y);else leaf.moveTo(x,y);}leaf.closePath();ctx.fill(leaf);ctx.save();ctx.clip(leaf);ctx.strokeStyle='rgba(210,224,167,.62)';ctx.lineWidth=.007;for(let i=0;i<8;i++){const a=i/8*Math.PI*2-Math.PI/2;ctx.beginPath();ctx.moveTo(.5,.5);ctx.lineTo(.5+Math.cos(a)*.41,.5+Math.sin(a)*.41);ctx.stroke();}ctx.restore();
 }else if(form==='rosette'){
  const leaf=new Path2D();leaf.moveTo(.5,.96);leaf.bezierCurveTo(.19,.66,.29,.27,.5,.035);leaf.bezierCurveTo(.71,.28,.81,.67,.5,.96);leaf.closePath();ctx.fill(leaf);ctx.strokeStyle='rgba(210,224,155,.65)';ctx.lineWidth=.012;ctx.beginPath();ctx.moveTo(.5,.93);ctx.quadraticCurveTo(.51,.55,.5,.07);ctx.stroke();
 }else{
  ctx.strokeStyle='#a1b574';ctx.lineWidth=.012;ctx.beginPath();ctx.moveTo(.5,.96);ctx.quadraticCurveTo(.47,.5,.5,.045);ctx.stroke();
  for(let i=0;i<18;i++)for(const sign of [-1,1]){const t=(i+1)/20,y=.91-t*.84,span=.36*Math.pow(Math.sin(t*Math.PI),.62),tipX=.5+sign*span,tipY=y-.1-.035*shape();const leaf=new Path2D();leaf.moveTo(.5,y);leaf.bezierCurveTo(.5+sign*span*.4,y+.014,tipX,tipY+.025,tipX,tipY);leaf.bezierCurveTo(.5+sign*span*.6,y-.078,.5,y-.038,.5,y);leaf.closePath();ctx.fill(leaf);}
 }
}
/** Reuses the atlas pipeline; silhouette shapes are V1 species design studies. */
function drawLibrarySpray(ctx:CanvasRenderingContext2D,q:StudioSettings){
  const species=batchSpecies[q.presetId!],rand=randomSource(q.structure+'|library-atlas|'+q.presetId),paint=randomSource(q.appearance+'|library-atlas|'+q.presetId);
  if(['palmate','rosette','palm'].includes(species.form)){drawSpecialFoliage(ctx,q);return;}
  ctx.strokeStyle='#627254';ctx.lineWidth=.008;ctx.beginPath();ctx.moveTo(.5,.91);ctx.quadraticCurveTo(.45,.5,.52,.1);ctx.stroke();
  if(species.emergent){drawEmergentSpray(ctx,q);return;}
  const count=species.conifer?7:species.form==='willow'?13:species.form==='silver-birch'?7:species.form==='ash'?9:7;
  for(let i=0;i<count;i++){
    const t=(i+.7)/(count+1),side=i%2?1:-1,terminal=species.form==='ash'&&i===count-1,x=terminal?.5:.5+side*(species.conifer?.12:species.form==='ash'?.15:.17)*(1-t*.25),y=species.form==='ash'?(terminal?.13:.82-Math.floor(i/2)*.16):.84-t*.64;
    ctx.beginPath();ctx.moveTo(.5,y+.07);ctx.quadraticCurveTo(.5+side*.08,y+.03,x,y);ctx.strokeStyle='#6e8058';ctx.lineWidth=.006;ctx.stroke();
    ctx.save();ctx.translate(x,y);ctx.rotate(terminal?-Math.PI/2:species.form==='willow'?1.05+side*.3:side>0?-.5-rand()*.4:Math.PI+.4+rand()*.4);
    const length=(species.conifer?.31:species.form==='maple'?.23:species.form==='willow'?.25:species.form==='silver-birch'?.18:species.form==='ash'?.23:.19)*(.85+rand()*.25),width=length*(species.form==='willow'?.16:species.form==='maple'?1.05:species.form==='aspen'?.92:species.form==='ash'?.38:species.form==='silver-birch'?.83:species.conifer?.65:.62);
    const leaf=new Path2D();
    if(species.form==='maple'){
      const points=[[0,0],[.1,-.2],[.18,-.17],[.15,-.52],[.36,-.36],[.44,-.7],[.57,-.38],[1,0],[.6,.35],[.47,.63],[.37,.35],[.17,.5],[.2,.18],[.08,.16]];
      points.forEach(([a,b],j)=>j?leaf.lineTo(a*length,b*width):leaf.moveTo(a*length,b*width));leaf.closePath();
    }else if(species.form==='willow'){
      leaf.moveTo(0,0);leaf.bezierCurveTo(length*.22,-width*.8,length*.8,-width*.4,length,0);leaf.bezierCurveTo(length*.7,width*.6,length*.15,width*.55,0,0);
    }else{
      leaf.moveTo(0,0);for(let side=0;side<2;side++)for(let k=0;k<=28;k++){const t=side?1-k/28:k/28;
        const contour=species.form==='silver-birch'?(t<.34?t/.34:(1-t)/.66):species.form==='aspen'?Math.sqrt(Math.max(0,1-Math.pow((t-.5)*2,2))):Math.pow(Math.sin(Math.PI*t),.7)*(1-t*.25);
        const lobes=species.conifer?(.76+.24*Math.cos(t*Math.PI*(species.form==='cedar'?8:14))):(.92+.08*Math.cos(t*Math.PI*24));leaf.lineTo(t*length,(side?1:-1)*contour*width*.5*lobes);
      }leaf.closePath();
    }
    const c=(paint()-.5)*15,g=ctx.createLinearGradient(0,-width,length*.3,width);g.addColorStop(0,`rgb(${162+c},${188+c},${120+c})`);g.addColorStop(.45,`rgb(${100+c},${150+c},${91+c})`);g.addColorStop(1,`rgb(${52+c},${102+c},${79+c})`);ctx.fillStyle=g;ctx.fill(leaf);ctx.save();ctx.clip(leaf);ctx.strokeStyle='rgba(214,220,157,.42)';ctx.lineWidth=.002;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(length*.9,0);ctx.stroke();ctx.restore();ctx.restore();
  }
}
export function studioAtlas(q:StudioSettings,mobile=false){
  const library=!!q.presetId&&!!batchSpecies[q.presetId];
  const oakStudy=q.unified&&q.view==='broadleaf'&&(q.mode==='groups'||q.mode==='trees'&&q.palette==='sage'),tile=mobile?128:256,key=JSON.stringify([q.appearance,q.detail,q.colorVariation,tile,q.unified,q.leafScale,oakStudy,oakStudy?q.structure:'',library?q.presetId:'',library?q.structure:'']);const old=cache.get(key);if(old)return old;
  const canvas=document.createElement('canvas');canvas.width=tile*4;canvas.height=tile*3;const ctx=canvas.getContext('2d')!;
  for(let index=0;index<12;index++){
    const kind=Math.floor(index/4),shape=randomSource('studio-atlas-morphology-'+index),paint=randomSource(q.appearance+'|atlas-'+index),variation=q.colorVariation;
    ctx.save();ctx.translate(index%4*tile,Math.floor(index/4)*tile);ctx.scale(tile,tile);ctx.beginPath();ctx.rect(.035,.035,.93,.93);ctx.clip();ctx.lineCap='round';
    if(library&&batchSpecies[q.presetId!].form==='palmate'&&index===1){drawSpecialFoliage(ctx,q,true);}
    else if(library&&index===0){drawLibrarySpray(ctx,q);}
    else if(oakStudy&&index===0){drawOakLeafSpray(ctx,q);}
    else if(kind===0){
      const count=q.unified&&index===0?1:(q.unified?100:42)+Math.round(q.detail*24);for(let j=0;j<count;j++){
        const a=j*2.399+index*.6,rad=count===1?0:.34*Math.sqrt((j+.5)/count)*(q.unified?.84+.14*Math.sin(a*3+index)+shape()*.15:1),x=.5+Math.cos(a)*rad,y=.5+Math.sin(a)*rad,l=count===1?.68:(q.unified?.075+shape()*.04:.12+shape()*.075)*(q.leafScale??1),w=l*(q.unified?.7:index===1?.3:.48),angle=a+(shape()-.5)*2;
        ctx.save();ctx.translate(x,y);ctx.rotate(angle);const path=new Path2D();if(q.unified){path.moveTo(-l*.5,0);for(let side=0;side<2;side++)for(let k=0;k<=20;k++){const t=side?1-k/20:k/20,edge=Math.sin(t*Math.PI)*w*.5*(.8+.2*Math.cos(t*Math.PI*8));path.lineTo((t-.5)*l,(side?1:-1)*edge);}path.closePath();}else{path.moveTo(-l*.5,0);path.bezierCurveTo(-l*.2,-w*.7,l*.25,-w*.45,l*.55,0);path.bezierCurveTo(l*.2,w*.55,-l*.2,w*.65,-l*.5,0);}
        const c=(paint()-.5)*variation*22,gradient=ctx.createLinearGradient(-l*.3,-w,l*.2,w);gradient.addColorStop(0,`rgb(${(q.unified?156:191)+c},${211+c},${(q.unified?101:131)+c})`);gradient.addColorStop(.42,`rgb(${(q.unified?91:127)+c},${169+c},${(q.unified?83:105)+c})`);gradient.addColorStop(1,`rgb(${65+c},${114+c},${83+c})`);ctx.fillStyle=gradient;ctx.fill(path);ctx.clip(path);
        ctx.strokeStyle='rgba(217,229,169,.40)';ctx.lineWidth=.002;ctx.beginPath();ctx.moveTo(-l*.4,0);ctx.quadraticCurveTo(0,-w*.05,l*.4,0);ctx.stroke();if(q.detail>.35){ctx.strokeStyle='rgba(44,91,70,.25)';ctx.lineWidth=.0015;for(let v=0;v<3;v++){const t=-l*.2+v*l*.18;ctx.beginPath();ctx.moveTo(t,0);ctx.lineTo(t+l*.1,-w*.3);ctx.stroke();}}ctx.restore();
      }
    }else if(kind===1){
      const count=24+Math.round(q.detail*24);for(let j=0;j<count;j++){
        const a=j*2.399+index,rad=.35*Math.sqrt((j+.5)/count),x=.5+Math.cos(a)*rad,y=.5+Math.sin(a)*rad,r=.026+shape()*.018;
        ctx.save();ctx.translate(x,y);ctx.rotate(shape()*6.28);const c=(paint()-.5)*variation*26;
        for(let petal=0;petal<5;petal++){ctx.save();ctx.rotate(petal*Math.PI*2/5);const path=new Path2D();path.moveTo(0,0);path.bezierCurveTo(-r*.68,-r*.65,-r*.62,-r*1.55,0,-r*1.25);path.bezierCurveTo(r*.61,-r*1.54,r*.7,-r*.55,0,0);const g=ctx.createLinearGradient(0,-r*1.4,0,0);g.addColorStop(0,`rgb(${250+Math.min(0,c)},${216+c},${233+c})`);g.addColorStop(.52,`rgb(${235+c*.4},${164+c},${201+c})`);g.addColorStop(1,`rgb(${149+c},${91+c},${145+c})`);ctx.fillStyle=g;ctx.fill(path);ctx.restore();}ctx.fillStyle='#f9deb1';ctx.beginPath();ctx.arc(0,0,r*.14,0,6.28);ctx.fill();ctx.restore();
      }
    }else{
      // A tapered, feathered Douglas-fir branchlet, not parallel filled leaf strips.
      const bend=(index%4-1.5)*.035,axis=(t:number)=>[.5+Math.sin(t*2.8)*bend,.09+t*.8];
      ctx.strokeStyle='#4f7860';ctx.lineWidth=.005;ctx.beginPath();for(let j=0;j<=20;j++){const [x,y]=axis(j/20);if(j)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();
      for(let row=0;row<11;row++)for(const side of [-1,1]){
        const t=.1+row*.073,[x,y]=axis(t),span=(.32-row*.019)*(.9+shape()*.2),tipX=x+side*span,tipY=y+.095+shape()*.035;
        ctx.strokeStyle='#71996d';ctx.lineWidth=.0035;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+side*span*.6,y+.025,tipX,tipY);ctx.stroke();
        const count=11+Math.round(q.detail*7);for(let n=0;n<count;n++)for(const s of [-1,1]){
          const u=(n+.3)/count,px=x+(tipX-x)*u,py=y+(tipY-y)*u,l=(.035+shape()*.023)*(1-u*.2)*(q.leafScale??1),c=(paint()-.5)*variation*28;
          ctx.strokeStyle=(row+n)%3===0?`rgb(${181+c},${202+c},${120+c})`:`rgb(${92+c},${143+c},${92+c})`;ctx.lineWidth=.0042;
          ctx.beginPath();ctx.moveTo(px,py);ctx.quadraticCurveTo(px+side*l*.2,py+s*l*.4,px+side*l*.6,py+s*l);ctx.stroke();
        }
      }

    }ctx.restore();
  }cache.set(key,canvas);if(cache.size>4)cache.delete(cache.keys().next().value!);return canvas;
}
