import {randomSource} from '../forest/random';
import type {StudioSettings} from './groups';
export const studioAtlasLabels=['Oval leaf fan','Lanceolate fan','Layered broadleaf','Small leaf spray','Blossom cloud','Cupped petals','Hanging blossoms','Small flower spray','Fir bough','Drooping fir spray','Needle branchlet','Fine needle fan'];
const cache=new Map<string,HTMLCanvasElement>();
export function studioAtlas(q:StudioSettings,mobile=false){
  const tile=mobile?128:256,key=JSON.stringify([q.appearance,q.detail,q.colorVariation,tile,q.unified,q.leafScale]);const old=cache.get(key);if(old)return old;
  const canvas=document.createElement('canvas');canvas.width=tile*4;canvas.height=tile*3;const ctx=canvas.getContext('2d')!;
  for(let index=0;index<12;index++){
    const kind=Math.floor(index/4),shape=randomSource('studio-atlas-morphology-'+index),paint=randomSource(q.appearance+'|atlas-'+index),variation=q.colorVariation;
    ctx.save();ctx.translate(index%4*tile,Math.floor(index/4)*tile);ctx.scale(tile,tile);ctx.beginPath();ctx.rect(.035,.035,.93,.93);ctx.clip();ctx.lineCap='round';
    if(kind===0){
      const count=q.unified&&index===0?1:42+Math.round(q.detail*24);for(let j=0;j<count;j++){
        const a=j*2.399+index*.6,rad=count===1?0:.34*Math.sqrt((j+.5)/count),x=.5+Math.cos(a)*rad,y=.5+Math.sin(a)*rad,l=count===1?.68:(.12+shape()*.075)*(q.leafScale??1),w=l*(index===1?.3:.48),angle=a+(shape()-.5)*2;
        ctx.save();ctx.translate(x,y);ctx.rotate(angle);const path=new Path2D();path.moveTo(-l*.5,0);path.bezierCurveTo(-l*.2,-w*.7,l*.25,-w*.45,l*.55,0);path.bezierCurveTo(l*.2,w*.55,-l*.2,w*.65,-l*.5,0);
        const c=(paint()-.5)*variation*22,gradient=ctx.createLinearGradient(-l*.3,-w,l*.2,w);gradient.addColorStop(0,`rgb(${191+c},${211+c},${131+c})`);gradient.addColorStop(.42,`rgb(${127+c},${169+c},${105+c})`);gradient.addColorStop(1,`rgb(${65+c},${114+c},${83+c})`);ctx.fillStyle=gradient;ctx.fill(path);ctx.clip(path);
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
