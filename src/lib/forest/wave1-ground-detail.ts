import * as T from 'three';
/** Restrained multiscale sediment/vegetation grain; wetness follows actual terrain height. */
export function wetGroundMaterial(detail?:T.Texture){
 const mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.95});
 mat.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 shoreWorld;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nshoreWorld=(modelMatrix*vec4(position,1.)).xyz;');
  shader.fragmentShader=`varying vec3 shoreWorld;
 float shoreHash(vec2 p){p=fract(p*vec2(.1031,.11369));p+=dot(p,p.yx+19.19);return fract(p.x*p.y);}
 float shoreNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(shoreHash(i),shoreHash(i+vec2(1,0)),f.x),mix(shoreHash(i+vec2(0,1)),shoreHash(i+vec2(1,1)),f.x),f.y);}
 `+shader.fragmentShader;
  if(detail){shader.uniforms.shoreAlbedo={value:detail};shader.fragmentShader='uniform sampler2D shoreAlbedo;\n'+shader.fragmentShader;}
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float broad=shoreNoise(shoreWorld.xz*.22),medium=shoreNoise(shoreWorld.xz*2.3+vec2(broad)),grain=shoreNoise(shoreWorld.xz*48.);
 float nearDetail=1.-smoothstep(18.,100.,distance(cameraPosition,shoreWorld));
 float wet=1.-smoothstep(-.045,.14,shoreWorld.y);
 diffuseColor.rgb*=mix(.85,1.12,broad)*(1.+(medium-.5)*.18*nearDetail+(grain-.5)*.14*nearDetail);
 ${detail?'vec3 litter=texture2D(shoreAlbedo,shoreWorld.xz/3.6).rgb;diffuseColor.rgb=mix(diffuseColor.rgb,litter*(.88+.18*broad),nearDetail*.72);':''}
 diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.72,.78,.8),wet*.35);
 `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(.46,roughnessFactor,smoothstep(-.025,.14,shoreWorld.y));');
 };mat.customProgramCacheKey=()=> 'wave1-continuous-wet-substrate-1|'+!!detail;return mat;
}
