import * as T from 'three';
import type {FieldBiome,FieldPlan} from './wave1-fields';

/** Opt-in material study. World coordinates and real incident light, no scene grading. */
export function installWetLighting(scene:T.Scene,biome:FieldBiome,plan:FieldPlan,sun:T.DirectionalLight,fill:T.DirectionalLight,decisive=false){
 if(biome==='desert')return;
 sun.color.set('#ffe0a8');sun.intensity=4.6;sun.shadow.intensity=.76;sun.shadow.radius=1;sun.shadow.bias=-.001;sun.shadow.normalBias=.2;
 fill.color.set('#8baec8');fill.intensity=.20;
 scene.children.forEach(o=>{if(o instanceof T.HemisphereLight){o.color.set('#abc6d6');o.groundColor.set('#81917e');o.intensity=.50;}});
 const old=scene.onBeforeRender;let installed=false;
 scene.onBeforeRender=function(...args){old.apply(this,args);if(installed)return;installed=true;
  const seen=new Set<T.Material>();
  scene.traverse(o=>{if(!(o instanceof T.Mesh)||o.name==='field-existing-sky'||(o as T.Mesh&{isReflector?:boolean}).isReflector)return;
   for(const mat of Array.isArray(o.material)?o.material:[o.material]){
    if(seen.has(mat))continue;seen.add(mat);
    if(mat instanceof T.MeshBasicMaterial&&o.userData.foliageBillboards){
     const previous=mat.onBeforeCompile,key=mat.customProgramCacheKey.bind(mat),direction={value:sun.position.clone().sub(sun.target.position).normalize()},sunColor={value:sun.color.clone()},power={value:sun.intensity/4.1};
     mat.onBeforeCompile=(shader,renderer)=>{previous.call(mat,shader,renderer);
      Object.assign(shader.uniforms,{splitSunDirection:direction,splitSunColor:sunColor,splitSunPower:power,splitLeafMid:{value:new T.Color(biome==='mangrove'?'#5e8748':'#657f46')}});
      shader.vertexShader='uniform vec3 splitSunDirection,splitSunColor;uniform float splitSunPower;\n'+shader.vertexShader;
      const start=shader.vertexShader.indexOf('canopyLight=hemi*.9'),end=shader.vertexShader.indexOf(';',start);
      if(start<0)throw new Error('Wetland canopy lighting adapter no longer matches transferred-normal shader');
      shader.vertexShader=shader.vertexShader.slice(0,start)+'canopyLight=vec3(.40,.53,.57)+splitSunColor*splitSunPower*pow(max(0.,dot(worldN,splitSunDirection)),1.25)*1.65'+shader.vertexShader.slice(end);
      shader.fragmentShader='uniform vec3 splitLeafMid;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
       float leafInk=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
       diffuseColor.rgb=mix(diffuseColor.rgb,splitLeafMid*(.65+sqrt(max(leafInk,0.))*1.15),.65);`);
     };mat.customProgramCacheKey=()=>key()+'|wet-real-key-2|'+biome;mat.needsUpdate=true;
     const beforeRender=mat.onBeforeRender;mat.onBeforeRender=function(...args){beforeRender.apply(this,args);direction.value.copy(sun.position).sub(sun.target.position).normalize();sunColor.value.copy(sun.color);power.value=sun.intensity/4.1;};
    }else if(mat instanceof T.ShaderMaterial&&mat.uniforms.shadowPigment){
     const u=mat.uniforms;u.shadowPigment.value.set(biome==='mangrove'?'#304f3a':'#385443');u.midPigment.value.set(biome==='mangrove'?'#5e8748':'#657f46');u.highPigment.value.set(biome==='mangrove'?(decisive?'#c4d47b':'#b5ca69'):'#b6be77');u.sage.value=0;u.rimStrength.value=decisive?.45:.25;u.woodland.value=1;u.gradientStrength.value=.55;
     const before=mat.onBeforeCompile,key=mat.customProgramCacheKey.bind(mat);
     mat.onBeforeCompile=(shader,renderer)=>{before.call(mat,shader,renderer);
      // Replace the library's broad fixed fill with cooler readable interior light
      // and stronger response to its existing per-spray actual directional normal.
      shader.fragmentShader=shader.fragmentShader.replace('vec3(.32,.48,.55)+actualSunColor*actualSunPower*actualNdotL*1.65','vec3(.40,.53,.57)+actualSunColor*actualSunPower*pow(actualNdotL,1.35)*1.85');
      if(decisive)shader.fragmentShader=shader.fragmentShader.replace('shaded=attentionGrade(shaded);',`shaded=attentionGrade(shaded);float crownSun=smoothstep(.45,.9,actualNdotL)*smoothstep(.4,.85,attentionHeight)*(1.-smoothstep(55.,180.,distance(attentionWorld,attentionAnchor)));shaded=mix(shaded,highPigment*.75,crownSun*.40);`);
     };mat.customProgramCacheKey=()=>key()+'|wet-incident-1'+(decisive?'|crown-sun-2':'');mat.needsUpdate=true;
    }else if(mat instanceof T.MeshStandardMaterial){
     const ground=o.name==='connected-field-terrain',grass=/meadow/.test(o.name),leaf=/juvenile-leaves/.test(o.name),wood=!!o.userData.treeWood||(!ground&&!grass&&!leaf&&!(o instanceof T.InstancedMesh));
     if(!ground&&!grass&&!leaf&&!wood)continue;
     const previous=mat.onBeforeCompile,key=mat.customProgramCacheKey.bind(mat);
     mat.onBeforeCompile=(shader,renderer)=>{previous.call(mat,shader,renderer);
      shader.vertexShader='varying vec3 wetPigmentWorld;varying float wetBladeHeight;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
       vec4 wetP=vec4(transformed,1.);
       #ifdef USE_INSTANCING
       wetP=instanceMatrix*wetP;
       #endif
       wetPigmentWorld=(modelMatrix*wetP).xyz;wetBladeHeight=clamp(position.y/.7,0.,1.);`);
      shader.fragmentShader=`varying vec3 wetPigmentWorld;varying float wetBladeHeight;
       float wetHash(vec2 p){p=fract(p*vec2(.1031,.11369));p+=dot(p,p.yx+19.19);return fract(p.x*p.y);}
       float wetNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(wetHash(i),wetHash(i+vec2(1,0)),f.x),mix(wetHash(i+vec2(0,1)),wetHash(i+vec2(1,1)),f.x),f.y);}
       `+shader.fragmentShader;
      const anchors=grass?['#5d744d','#94a464','#d8c878']:leaf?['#304f3a','#5e8748','#b5ca69']:wood?['#463e36','#84634c','#c3986c']:biome==='mangrove'?['#514b42','#89715a','#c0a078']:['#5c5b4b','#8c7d5d','#bba477'];
      if(!decisive){if(grass)anchors.splice(0,3,'#596f4c','#91a35d','#d9c77c');else if(ground)anchors.splice(0,3,...(biome==='mangrove'?['#514d43','#88745d','#b59a70']:['#5e5c4c','#8b795c','#b49a6b']));}
      anchors.forEach((c,i)=>shader.uniforms['wetPigment'+i]={value:new T.Color(c)});
      shader.fragmentShader='uniform vec3 wetPigment0,wetPigment1,wetPigment2;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`
       float pigmentField=wetNoise(wetPigmentWorld.xz*.095+wetNoise(wetPigmentWorld.xz*.033)*2.);
       float textureValue=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
       vec3 pigment=mix(wetPigment0,wetPigment1,smoothstep(.18,.64,pigmentField));
       pigment=mix(pigment,wetPigment2,smoothstep(.62,.9,pigmentField)*${grass?'.48':'.24'});
       ${decisive?`float moist=max(1.-smoothstep(.01,.24,wetPigmentWorld.y),.65*smoothstep(.35,.7,wetNoise(wetPigmentWorld.xz*.25))*(1.-pigmentField*.6));
       pigment=mix(pigment,wetPigment0,moist*.7);
       vec3 texturePigment=pigment*${grass?'(.65+textureValue*1.2)':'pow(textureValue/max(.025,dot(pigment,vec3(.2126,.7152,.0722))),1.18)'};
       diffuseColor.rgb=mix(diffuseColor.rgb,texturePigment,${grass?'.85':ground?'.65':'.55'});
       ${ground?`diffuseColor.rgb*=mix(.62,1.32,smoothstep(.25,.74,pigmentField))*(1.-moist*.24);`:''}`:`diffuseColor.rgb=mix(diffuseColor.rgb,pigment*(.75+min(textureValue,1.)*.7),${grass?'.72':ground?'.48':'.55'});`}
       ${grass?'diffuseColor.rgb*=mix(vec3(.72,.84,.81),vec3(1.10,1.04,.88),wetBladeHeight);':''}
       #include <roughnessmap_fragment>
      `);
      // Small diffuse bounce inherits local pigment, most visible on upward surfaces.
      shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
       reflectedLight.indirectDiffuse+=diffuseColor.rgb*vec3(.055,.060,.047)*(.4+.6*max(0.,dot(normal,mat3(viewMatrix)*vec3(0.,1.,0.))));`);
      if(decisive)shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
       reflectedLight.indirectDiffuse+=diffuseColor.rgb*vec3(.11,.095,.062)*(1.-smoothstep(.015,.20,wetPigmentWorld.y));`);
     };mat.customProgramCacheKey=()=>key()+`|wet-pigment-1|${biome}|${ground}|${grass}|${leaf}|${wood}`+(decisive?'|preserved-texture-2':'');mat.needsUpdate=true;
    }
   }
  });
  scene.userData.splitLighting={biome,key:4.6,hemi:.5,fill:.2,palette:'world-space correlated pigments; actual incident lighting; restrained diffuse bounce',geometryChanged:false};
 };
 scene.userData.recipeShadowDirty=true;
}

