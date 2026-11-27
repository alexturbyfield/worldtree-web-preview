import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {installGroundLighting,type groundCompositionField} from '../src/lib/forest/environment-foundations';
test('textured ground shade is opt-in; default fields retain their untextured shader and no sampler',()=>{
 const field:ReturnType<typeof groundCompositionField>={settings:{foregroundDarkness:.34,sideFraming:.13,focalWidth:[9,20],transitionSoftness:.75,warmth:.08,irregularity:.7},center:[0,12],forward:[0,-1],phase:1};
 for(const texture of [undefined,new T.Texture()]){
  const material=new T.MeshStandardMaterial(),shader={uniforms:{} as Record<string,{value:unknown}>,vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader};
  installGroundLighting(material,field,true,false,undefined,false,texture);material.onBeforeCompile(shader as unknown as Parameters<T.MeshStandardMaterial['onBeforeCompile']>[0],{} as T.WebGLRenderer);
  assert.match(shader.vertexShader,/modelMatrix\*instanceMatrix\*/);
  if(texture){assert.equal(shader.uniforms.groundShadeMap.value,texture);assert.match(shader.fragmentShader,/groundLeafShade/);}else{assert.equal(shader.uniforms.groundShadeMap,undefined);assert.doesNotMatch(shader.fragmentShader,/groundLeafShade/);}
  const fn=shader.fragmentShader.split('vec2 groundLightingWeights')[1].split('vec3 groundLightingApply')[0];assert.doesNotMatch(fn,/cameraPosition/);
  material.dispose();texture?.dispose();
 }
});
