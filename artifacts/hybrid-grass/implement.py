from pathlib import Path
p=Path('src/lib/forest/savanna-recipe.ts');s=p.read_text()
s=s.replace("const brush=id==='r-fidelity-tuft-brush',", "const hybrid=id==='r-fidelity-tuft-hybrid',brush=hybrid||id==='r-fidelity-tuft-brush',")
s=s.replace("tuft=brush?'p':", "tuft=hybrid?'h':brush?'p':")
s=s.replace('brush?loadBrush():undefined)', 'brush?loadBrush():undefined,hybrid)')
s=s.replace('brush?brushGeometry(false):', 'brush?brushGeometry(false,hybrid):').replace('brush?brushGeometry(true):', 'brush?brushGeometry(true,hybrid):')
s=s.replace('edgeMat,brush?500:', 'edgeMat,hybrid?750:brush?500:')
s=s.replace('frameInstances:brush?500:', 'frameInstances:hybrid?750:brush?500:').replace('nearInstances:brush?500:850','nearInstances:hybrid?750:brush?500:850')
s=s.replace("... (dense?", "... (dense?")
s=s.replace("tuftProfile:tuft?tuftProfile(tuft):undefined,", "tuftProfile:tuft?tuftProfile(tuft):undefined,...(hybrid?{representation:'short-root-matched-brush-plus-reeds',brushHeight:[.42,.72],reeds:96,rootTextureFade:[.03,.36]}:{}),")
s=s.replace("'r-fidelity-tuft-brush'].includes(id)","'r-fidelity-tuft-brush','r-fidelity-tuft-hybrid'].includes(id)")
s=s.replace('function brushGeometry(near:boolean){','function brushGeometry(near:boolean,short=false){')
s=s.replace("-.16+t*(near?1.55:.7)", "-.16+t*(short?(near?.72:.42):(near?1.55:.7))")
s=s.replace('tuft?:string,brushAtlas?:T.Texture){','tuft?:string,brushAtlas?:T.Texture,hybrid=false){')
s=s.replace("${p.textureContrast.toFixed(4)}*(.4+.6*fine)", "${p.textureContrast.toFixed(4)}*(.4+.6*fine)${hybrid&&role===2?'*(1.-smoothstep(.03,.36,fibreTip))':''}")
s=s.replace("${brushAtlas?'.10':tuft?", "${brushAtlas?'.10':hybrid?'.3*(1.-smoothstep(20.,50.,d))':tuft?")
s=s.replace("diffuseColor.rgb*=mix(1.,stroke,.36);", "diffuseColor.rgb*=mix(1.,stroke,.36${hybrid?'*smoothstep(.04,.45,brushLocal.y)':''});")
s=s.replace("diffuseColor.rgb*=mix(vec3(1.),strokeHue,.3);", "diffuseColor.rgb*=mix(vec3(1.),strokeHue,.3${hybrid?'*smoothstep(.04,.45,brushLocal.y)':''});")
s=s.replace("${tuft?'(.03+.28*smoothstep(.2,.85,fibreTip))':", "${hybrid&&brushAtlas?'(.08*smoothstep(.08,.6,fibreTip))':tuft?'(.03+.28*smoothstep(.2,.85,fibreTip))':")
s=s.replace("+'-'+!!brushAtlas+'-'+JSON.stringify(p)","+'-'+!!brushAtlas+'-'+hybrid+'-'+JSON.stringify(p)")
# Insert one sparse batched layer, using a separate presentation stream so brush layout stays deterministic.
pos=s.index('  const after=guard(targets);')
s=s[:pos]+'''  if(hybrid){
   const reedMaterial=surfaceMaterial(recipe,2,map,contacts,true,true,true,'h',undefined,true),reed=new T.InstancedMesh(reedGeometry(),reedMaterial,96),r=randomSource(recipe.seed+'|hybrid-reeds-1'),o=new T.Object3D();reed.name='lab-savanna-grass';reed.receiveShadow=true;reed.castShadow=false;materials.push(reedMaterial);reed.geometry.setAttribute('grassSeedPresent',new T.InstancedBufferAttribute(new Float32Array(reed.count).fill(1),1));
   for(let i=0;i<reed.count;i++){let x=0,z=0;for(let n=0;n<40;n++){x=(r()-.5)*26;z=15+r()*19;const gap=Math.exp(-x*x/20-(z-25)**2/100);if(r()>gap*.94)break;}o.position.set(x,terrainHeight(x,z,recipe.seed)-.025,z);o.rotation.set(0,.4+Math.sin(x*.04+z*.065)*.3+(r()-.5)*.8,0);const scale=.65+r()*.6;o.scale.set(.75+r()*.4,scale,.75+r()*.4);o.updateMatrix();reed.setMatrixAt(i,o.matrix);}reed.computeBoundingSphere();scene.add(reed);created.push(reed);count+=reed.count;for(const n of reed.instanceMatrix.array)digest=Math.imul(digest^Math.round(n*10000),16777619);
  }
''' +s[pos:]
pos=s.index('function surfaceMaterial(')
s=s[:pos]+'''/** Sparse dimensional accents above the low brush layer: curved leaves and one slender seeded culm. */
function reedGeometry(){
 const positions:number[]=[],uv:number[]=[],indices:number[]=[],seed:number[]=[];
 const strip=(height:number,lean:number,root:number,width:number,part:number)=>{const start=positions.length/3;for(let k=0;k<=8;k++)for(let side=0;side<3;side++){const t=k/8,u=side-1,w=width*Math.pow(Math.max(0,Math.sin(t*Math.PI)),.8);positions.push(root+lean*t*t+u*w,height*(t-.1*t*t*t)-.045,Math.sin(root*5)*.12+(1-u*u)*w*.8);uv.push(side/2,t);seed.push(part);}for(let k=0;k<8;k++)for(let side=0;side<2;side++){const a=start+k*3+side,b=a+3;indices.push(a,a+1,b,a+1,b+1,b);}};
 for(let j=0;j<3;j++)strip(.9+j*.18,.3+j*.16,(j-1)*.12,.018+j*.003,0);strip(1.65,.26,0,.006,0);
 for(let j=0;j<4;j++){const base=positions.length/3,y=1.28+j*.055,x=.24+(j%2)*.02;positions.push(x-.022,y,0,x+.018,y+.025,.012,x+.007,y+.085,0);uv.push(0,.8,1,.85,.5,1);seed.push(0,0,0);indices.push(base,base+1,base+2);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('seedPart',new T.Float32BufferAttribute(seed,1));g.setIndex(indices);g.computeVertexNormals();return g;
}
''' +s[pos:];p.write_text(s)
