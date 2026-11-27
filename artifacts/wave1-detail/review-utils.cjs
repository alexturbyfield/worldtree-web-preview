async function semanticMask(page,kind){return page.evaluate(kind=>{
 const {r,s,c}=window.__visual,materials=[],clones=[],fog=s.fog,background=s.background;s.fog=null;s.background=null;
 const maskMaterial=(original,white)=>{const clone=original.clone();if(clone.isShaderMaterial)clone.uniforms=original.uniforms;const previous=original.onBeforeCompile,key=original.customProgramCacheKey.bind(original);
 clone.onBeforeCompile=function(shader,renderer){previous.call(this,shader,renderer);const i=shader.fragmentShader.lastIndexOf('}');shader.fragmentShader=shader.fragmentShader.slice(0,i)+`gl_FragColor=vec4(${white?'1.':'0.'},${white?'1.':'0.'},${white?'1.':'0.'},1.);\n`+shader.fragmentShader.slice(i);};clone.customProgramCacheKey=()=>key()+'|semantic-'+kind+'-'+white;clones.push(clone);return clone;};
 try{s.traverse(obj=>{if(!obj.isMesh)return;materials.push([obj,obj.material]);const white=kind==='water'?obj.isReflector:/field-(dimensional|distant)-meadow/.test(obj.name);
 if(obj.isReflector){const clone=obj.material.clone();clone.uniforms=obj.material.uniforms;clone.fragmentShader='#include <common>\n#include <logdepthbuf_pars_fragment>\nvoid main(){\n#include <logdepthbuf_fragment>\ngl_FragColor=vec4('+ (white?'1.,1.,1.,1.':'0.,0.,0.,1.') +');\n}';clone.customProgramCacheKey=()=> 'water-semantic-'+kind;obj.material=clone;clones.push(clone);}else obj.material=Array.isArray(obj.material)?obj.material.map(m=>maskMaterial(m,white)):maskMaterial(obj.material,white);});r.render(s,c);return r.domElement.toDataURL();}
 finally{materials.forEach(([obj,m])=>obj.material=m);clones.forEach(m=>m.dispose());s.fog=fog;s.background=background;r.render(s,c);}
 },kind);}

async function captureDiagnostics(page){const d=await page.evaluate(()=>{
 const {r,s,c}=window.__visual,eye=s.userData.recipeEye;r.setPixelRatio(1);r.setSize(640,360,false);c.aspect=16/9;c.updateProjectionMatrix();c.position.fromArray(eye.position);c.lookAt(...eye.target);c.updateMatrixWorld();for(let i=0;i<3;i++)r.render(s,c);
 const normal=r.domElement.toDataURL();s.userData.showStagingDebug(true);r.render(s,c);const proxy=r.domElement.toDataURL();s.userData.showStagingDebug(false);
 const capsule=s.getObjectByName('diagnostic-character-capsule'),base=s.userData.stagingAudit.minimumGroundAboveWater,p=s.userData.wave1.plan,intersections=[],grassHeights=[];
 s.traverse(obj=>{if(!obj.isInstancedMesh)return;const blockers=/jointed-bedrock|contact-gravel|unnamed-open-shrub|juvenile-(leaves|stems)|fallen-shore-twigs/.test(obj.name),grass=/field-(dimensional|distant)-meadow/.test(obj.name);if(!blockers&&!grass)return;obj.geometry.computeBoundingBox();const box=obj.geometry.boundingBox,local=obj.matrixWorld.clone();
 for(let i=0;i<obj.count;i++){obj.getMatrixAt(i,local);const bounds=box.clone().applyMatrix4(obj.matrixWorld.clone().multiply(local)),dx=local.elements[12]-p.eye[0],dz=local.elements[14]-p.eye[2],forward=dx*Math.sin(p.heading)-dz*Math.cos(p.heading),side=dx*Math.cos(p.heading)+dz*Math.sin(p.heading),distance=Math.hypot(side,forward-Math.max(2.8,Math.min(6.2,forward)));
 if(grass){if(distance<.85)grassHeights.push(bounds.max.y-local.elements[13]);continue;}
 if(bounds.max.y<base+.1||bounds.min.y>base+2.)continue;
 for(let f=2.8;f<=6.2;f+=.2){const x=p.eye[0]+Math.sin(p.heading)*f,z=p.eye[2]-Math.cos(p.heading)*f,bx=Math.max(bounds.min.x-x,0,x-bounds.max.x),bz=Math.max(bounds.min.z-z,0,z-bounds.max.z);if(bx*bx+bz*bz<.35*.35){intersections.push({mesh:obj.name,instance:i});break;}}
 }});
 return{normal,proxy,staging:s.userData.stagingAudit,intersections,actualGrassHeightInApproach:grassHeights.length?Math.max(...grassHeights):null,plan:p};});
 d.waterMask=await semanticMask(page,'water');d.grassMask=await semanticMask(page,'grass');return d;
}
module.exports={captureDiagnostics,semanticMask};
