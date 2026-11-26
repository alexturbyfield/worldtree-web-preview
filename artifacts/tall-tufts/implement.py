from pathlib import Path
p=Path('src/lib/forest/savanna-recipe.ts');s=p.read_text()
s=s.replace("const dimensional=id==='r-fidelity-solid',", "const tuft=id.startsWith('r-fidelity-tuft-')?id.slice(-1):undefined,dimensional=id==='r-fidelity-solid',")
s=s.replace("full=dimensional||", "full=!!tuft||dimensional||")
s=s.replace('map,contacts,golden,plains,fidelity)', 'map,contacts,golden,plains,fidelity,tuft)')
s=s.replace('dimensional?dimensionalGrassGeometry(false):', 'tuft?tuftGeometry(tuft,false):dimensional?dimensionalGrassGeometry(false):')
s=s.replace('material,golden?style.grassInstances:p.grassInstances','material,tuft?850:golden?style.grassInstances:p.grassInstances')
s=s.replace('dimensional?dimensionalGrassGeometry(true):','tuft?tuftGeometry(tuft,true):dimensional?dimensionalGrassGeometry(true):')
s=s.replace('edgeMat,dimensional?320:', 'edgeMat,tuft?240:dimensional?320:')
s=s.replace('if(dimensional&&i%3!==0)', 'if((dimensional||tuft)&&i%3!==0)')
s=s.replace('*(dimensional?.55+r()*.4:', '*(tuft?.65+r()*.4:dimensional?.55+r()*.4:')
s=s.replace("grassRepresentation:dimensional?", "grassRepresentation:tuft?'curved-smooth-tuft-'+tuft:dimensional?")
s=s.replace('frameInstances:dimensional?320:style.frameGrass','frameInstances:tuft?240:dimensional?320:style.frameGrass,tuftProfile:tuft?tuftProfile(tuft):undefined')
s=s.replace("'r-fidelity-solid'].includes(id)","'r-fidelity-solid','r-fidelity-tuft-a','r-fidelity-tuft-b','r-fidelity-tuft-c'].includes(id)")
s=s.replace('golden=false,plains=false,fidelity=false){','golden=false,plains=false,fidelity=false,tuft?:string){')
s=s.replace("smoothstep(.35,.95,fibreTip)*.12", "smoothstep(${tuft?' .25,.95':'.35,.95'},fibreTip)*${tuft?tuftProfile(tuft).highlight:'.12'}")
s=s.replace("c('#E9B650')},smoothstep(${tuft", "c(tuft?'#FFE0A0':'#E9B650')},smoothstep(${tuft")
s=s.replace("${plains?'mix(.10,.4,1.-smoothstep(8.,28.,distance(cameraPosition,recipeWorld)))':'.12'}", "${tuft?'(.03+.28*smoothstep(.2,.85,fibreTip))':plains?'mix(.10,.4,1.-smoothstep(8.,28.,distance(cameraPosition,recipeWorld)))':'.12'}")
s=s.replace("+'-'+fidelity+'-'+JSON.stringify(p)","+'-'+fidelity+'-'+tuft+'-'+JSON.stringify(p)")
pos=s.index('function surfaceMaterial(')
s=s[:pos]+'''/** Shared ground pigments meet smooth curved tuft surfaces: indexed normals, buried roots, no atlas or blade shadows. */
function tuftProfile(id:string){return id==='a'?{name:'Tall fine fans',blades:9,width:.028,height:1.7,bend:.55,spread:.6,highlight:.3}:id==='b'?{name:'Broad painterly bunches',blades:7,width:.06,height:1.65,bend:.8,spread:.8,highlight:.4}:{name:'Layered flowing tufts',blades:11,width:.04,height:1.8,bend:.9,spread:.7,highlight:.35};}
function tuftGeometry(id:string,near:boolean){
 const p=tuftProfile(id),positions:number[]=[],uv:number[]=[],indices:number[]=[],seed:number[]=[],blades=near?p.blades:3,steps=near?8:4;
 for(let j=0;j<blades;j++){
  const base=positions.length/3,az=(j-(blades-1)*.5)*.27+Math.sin(j*3.4)*.24,dir=new T.Vector3(Math.cos(az),0,Math.sin(az)),side=new T.Vector3(-dir.z,0,dir.x),h=(near?p.height:.7)*(.72+.28*(.5+.5*Math.sin(j*2.7))),lean=p.bend*(.7+.3*Math.cos(j*1.8)),root=side.clone().multiplyScalar(Math.sin(j*2.4)*p.spread*.55).addScaledVector(dir,Math.cos(j*4.1)*.18);
  for(let k=0;k<=steps;k++)for(let col=0;col<3;col++){
   const t=k/steps,u=col-1,width=p.width*(near?1:.8)*Math.pow(Math.max(0,Math.sin(Math.PI*t)),.7),center=root.clone().addScaledVector(dir,lean*t*t),v=center.addScaledVector(side,u*width);v.y=-.08+h*(t-.17*t*t*t)+(1-u*u)*width*.75*Math.sin(t*Math.PI);positions.push(...v.toArray());uv.push(col/2,t);seed.push(0);
  }
  for(let k=0;k<steps;k++)for(let col=0;col<2;col++){const a=base+k*3+col,b=a+3;indices.push(a,a+1,b,a+1,b+1,b);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('seedPart',new T.Float32BufferAttribute(seed,1));g.setIndex(indices);g.computeVertexNormals();return g;
}
''' +s[pos:]
p.write_text(s)
