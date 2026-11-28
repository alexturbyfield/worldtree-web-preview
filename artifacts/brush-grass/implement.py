from pathlib import Path
p=Path('src/lib/forest/savanna-recipe.ts');s=p.read_text()
s=s.replace('let texture:T.Texture|undefined,hillTexture:T.Texture|undefined;', 'let texture:T.Texture|undefined,hillTexture:T.Texture|undefined,brushTexture:T.Texture|undefined;\n const loadBrush=()=>{if(brushTexture)return brushTexture;scene.userData.labAssetsReady=false;brushTexture=new T.TextureLoader().load(\'/assets/savanna-brush/painted-tufts-v1.webp\',()=>{scene.userData.labAssetsReady=true;},undefined,()=>{scene.userData.labAssetsReady=true;scene.userData.labAssetError=\'Brush atlas failed to load\';});brushTexture.colorSpace=T.SRGBColorSpace;brushTexture.anisotropy=8;return brushTexture;};')
s=s.replace("const dense=id==='r-fidelity-tuft-c-dense',tuft=dense?'c':", "const brush=id==='r-fidelity-tuft-brush',dense=brush||id==='r-fidelity-tuft-c-dense',tuft=brush?'p':dense?'c':")
s=s.replace('map,contacts,golden,plains,fidelity,tuft)', 'map,contacts,golden,plains,fidelity,tuft,brush?loadBrush():undefined)')
s=s.replace('tuft?tuftGeometry(tuft,false):', 'brush?brushGeometry(false):tuft?tuftGeometry(tuft,false):').replace('material,dense?4000:', 'material,brush?2400:dense?4000:')
s=s.replace("mesh.name='lab-savanna-grass';", "if(brush)mesh.geometry.setAttribute('brushTile',new T.InstancedBufferAttribute(Float32Array.from({length:mesh.count},(_,i)=>i%4),1));mesh.name='lab-savanna-grass';")
s=s.replace('tuft?tuftGeometry(tuft,true):', 'brush?brushGeometry(true):tuft?tuftGeometry(tuft,true):').replace('edgeMat,dense?850:', 'edgeMat,brush?500:dense?850:')
s=s.replace("edge.name='lab-savanna-grass';", "if(brush)edge.geometry.setAttribute('brushTile',new T.InstancedBufferAttribute(Float32Array.from({length:edge.count},(_,i)=>(i+1)%4),1));edge.name='lab-savanna-grass';")
s=s.replace('frameInstances:dense?850:', 'frameInstances:brush?500:dense?850:').replace("midInstances:4000,nearInstances:850", "midInstances:brush?2400:4000,nearInstances:brush?500:850")
s=s.replace("'r-fidelity-tuft-c-dense'].includes(id)","'r-fidelity-tuft-c-dense','r-fidelity-tuft-brush'].includes(id)")
s=s.replace('hillTexture?.dispose();','hillTexture?.dispose();brushTexture?.dispose();')
s=s.replace('tuft?:string){','tuft?:string,brushAtlas?:T.Texture){')
s=s.replace('alphaTest:role===2&&!fidelity?.12:0','alphaTest:role===2&&brushAtlas?.24:role===2&&!fidelity?.12:0')
s=s.replace("m.onBeforeCompile=shader=>{\n  shader.vertexShader=", "m.onBeforeCompile=shader=>{\n  if(role===2&&brushAtlas){shader.uniforms.brushAtlas={value:brushAtlas};shader.vertexShader='attribute float brushTile;varying vec2 brushUv;varying vec2 brushLocal;\\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\\nbrushLocal=uv;brushUv=(vec2(mod(brushTile,2.),floor(brushTile/2.))+uv)*.5;');shader.fragmentShader='uniform sampler2D brushAtlas;varying vec2 brushUv;varying vec2 brushLocal;\\n'+shader.fragmentShader;}\n  shader.vertexShader=")
s=s.replace("  if(role===2)shader.fragmentShader", "  if(role===2&&brushAtlas)shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>',`vec4 brushPaint=texture2D(brushAtlas,brushUv);float border=smoothstep(0.,.025,brushLocal.x)*smoothstep(0.,.025,1.-brushLocal.x)*smoothstep(0.,.03,1.-brushLocal.y);diffuseColor.a*=brushPaint.a*border;float stroke=clamp(dot(brushPaint.rgb,vec3(.2126,.7152,.0722))/.43,.65,1.4);diffuseColor.rgb*=mix(1.,stroke,.58);\\n#include <alphatest_fragment>`);\n  if(role===2)shader.fragmentShader")
s=s.replace("+'-'+tuft+'-'+JSON.stringify(p)","+'-'+tuft+'-'+!!brushAtlas+'-'+JSON.stringify(p)")
pos=s.index('function surfaceMaterial(')
s=s[:pos]+'''/** Several gently bowed painterly surfaces form one tuft volume; atlas carries coherent brush masses. */
function brushGeometry(near:boolean){
 const positions:number[]=[],uv:number[]=[],seed:number[]=[],indices:number[]=[],faces=near?3:2,steps=near?4:2;
 for(let f=0;f<faces;f++){const start=positions.length/3,angle=f*Math.PI/faces,co=Math.cos(angle),si=Math.sin(angle);for(let k=0;k<=steps;k++)for(let side=0;side<3;side++){const t=k/steps,u=side/2,x=(u-.5)*(near?1.9:1.65),z=Math.sin(u*Math.PI)*.22+t*t*.22;positions.push(x*co-z*si,-.13+t*(near?1.25:.7),x*si+z*co);uv.push(u,t);seed.push(0);}for(let k=0;k<steps;k++)for(let side=0;side<2;side++){const a=start+k*3+side,b=a+3;indices.push(a,a+1,b,a+1,b+1,b);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('seedPart',new T.Float32BufferAttribute(seed,1));g.setIndex(indices);g.computeVertexNormals();return g;
}
''' +s[pos:];p.write_text(s)
