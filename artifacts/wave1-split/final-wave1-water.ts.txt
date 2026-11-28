import * as T from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
/** Camera-derived encounter footprint; terrain anchored after composition, never screen-pixel shading. */
export function stagingWeight(x:number,z:number,eye:[number,number],target:[number,number]){
 const dx=target[0]-eye[0],dz=target[1]-eye[1],l=Math.hypot(dx,dz),f=((x-eye[0])*dx+(z-eye[1])*dz)/l,s=Math.abs(((x-eye[0])*dz-(z-eye[1])*dx)/l);
 const smooth=(a:number,b:number,v:number)=>{const t=T.MathUtils.clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
 return smooth(0,2,f)*(1-smooth(6+Math.sin(x*.6)*.8,13+Math.sin(x*.4+z*.3),f))*(1-smooth(1.3+f*.09,3+f*.16,s));
}
/** Planar environment reflection + sampled terrain depth. No biome tint/overlay. */
export function tidalWater(height:(x:number,z:number)=>number,level:number,size:number,center:number,wind=0,nearCenter?:[number,number]){
 const n=256,depth=new Float32Array(n*n);for(let j=0;j<n;j++)for(let i=0;i<n;i++)depth[j*n+i]=Math.max(0,level-height((i/(n-1)-.5)*size,(j/(n-1)-.5)*size+center));
 const map=new T.DataTexture(depth,n,n,T.RedFormat,T.FloatType);map.minFilter=map.magFilter=T.LinearFilter;map.needsUpdate=true;
 const nearExtent=160,nearDepth=new Float32Array(n*n),origin=nearCenter??[0,center];
 if(nearCenter)for(let j=0;j<n;j++)for(let i=0;i<n;i++)nearDepth[j*n+i]=Math.max(0,level-height(origin[0]+(i/(n-1)-.5)*nearExtent,origin[1]+(j/(n-1)-.5)*nearExtent));
 const nearMap=new T.DataTexture(nearDepth,n,n,T.RedFormat,T.FloatType);nearMap.minFilter=nearMap.magFilter=T.LinearFilter;nearMap.needsUpdate=true;
 const water=new Reflector(new T.PlaneGeometry(size,size),{textureWidth:512,textureHeight:256,clipBias:.003,color:0xffffff});water.rotation.x=-Math.PI/2;water.position.set(0,level,center);
 const m=water.material as T.ShaderMaterial;
 Object.assign(m.uniforms,{depthField:{value:map},extent:{value:new T.Vector3(size,center,level)},windStrength:{value:Math.max(0,wind)},sediment:{value:new T.Color('#8b7656')},absorption:{value:new T.Vector3(1.1,1.6,2.3)}});
 Object.assign(m.uniforms,{nearDepthField:{value:nearMap},nearExtent:{value:new T.Vector3(nearExtent,origin[0],origin[1])},nearEnabled:{value:nearCenter?1:0}});
 m.vertexShader=m.vertexShader.replace('varying vec4 vUv;','varying vec4 vUv; varying vec3 waterWorld;').replace('vUv = textureMatrix','waterWorld=(modelMatrix*vec4(position,1.)).xyz;\n vUv = textureMatrix');
 m.fragmentShader=`uniform sampler2D depthField,nearDepthField;uniform vec3 extent,nearExtent,sediment,absorption;uniform float windStrength,nearEnabled;varying vec3 waterWorld;\nfloat rippleHash(vec2 p){p=fract(p*vec2(.1031,.11369));p+=dot(p,p.yx+19.19);return fract(p.x*p.y); }\nfloat rippleNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(rippleHash(i),rippleHash(i+vec2(1,0)),f.x),mix(rippleHash(i+vec2(0,1)),rippleHash(i+vec2(1,1)),f.x),f.y); }\n`+m.fragmentShader;
 m.fragmentShader=m.fragmentShader.replace('vec4 base = texture2DProj( tDiffuse, vUv );',`vec3 V=normalize(cameraPosition-waterWorld);
 float depth=texture2D(depthField,vec2(waterWorld.x/extent.x+.5,(waterWorld.z-extent.y)/extent.x+.5)).r;
 vec2 nearUV=(waterWorld.xz-nearExtent.yz)/nearExtent.x+.5;
 float nearWeight=nearEnabled*(1.-smoothstep(.42,.49,max(abs(nearUV.x-.5),abs(nearUV.y-.5))));
 depth=mix(depth,texture2D(nearDepthField,clamp(nearUV,0.,1.)).r,nearWeight);
 float wind=min(windStrength,2.),phase=rippleNoise(waterWorld.xz*.14)*5.;
 float ripple=(.00018+wind*.0011)*smoothstep(.003,.12,depth);
 vec2 waves=vec2(sin(waterWorld.x*.83+waterWorld.z*.61+phase),cos(waterWorld.z*1.13-waterWorld.x*.31+phase*1.7));
 vec3 N=normalize(vec3(waves.x*ripple*12.,1.,waves.y*ripple*12.));
 vec4 reflectedUV=vUv;reflectedUV.xy+=waves*ripple*vUv.w;
 float rough=(.00035+wind*.0008)*(.65+rippleNoise(waterWorld.xz*.21)*.5);
 vec4 offset=vec4(rough*vUv.w,rough*vUv.w,0.,0.);
 vec4 base=texture2DProj(tDiffuse,reflectedUV)*.5+texture2DProj(tDiffuse,reflectedUV+offset)*.25+texture2DProj(tDiffuse,reflectedUV-offset)*.25;
 vec3 transmission=exp(-absorption*depth/max(.2,abs(dot(V,N))));
 float grain=.92+.08*sin(waterWorld.x*8.1+sin(waterWorld.z*3.7));
 vec3 substrate=sediment*grain;
 vec3 underwater=substrate*transmission+sediment*.35*(1.-transmission);
 float F=.02+.98*pow(1.-max(0.,dot(V,N)),5.);
 base.rgb=mix(underwater,base.rgb,F);`);
 m.fragmentShader=m.fragmentShader.replace('blendOverlay( base.rgb, color )','base.rgb');
 return {water,dispose:()=>{map.dispose();nearMap.dispose();water.dispose();},limitations:'Analytic sediment transmission, not screen-space refraction; static wind-conditioned ripples, no fluid simulation.',depthSampling:{farMetresPerTexel:size/n,nearMetresPerTexel:nearCenter?nearExtent/n:null}};
}
