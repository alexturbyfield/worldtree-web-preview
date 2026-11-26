from pathlib import Path
p=Path('src/lib/forest/savanna-recipe.ts');s=p.read_text()
s=s.replace('plains?physicalGrassGeometry(false):fibreGeometry()', 'fidelity?dimensionalGrassGeometry(false):plains?physicalGrassGeometry(false):fibreGeometry()')
s=s.replace('plains?physicalGrassGeometry(true):fibreGeometry()', 'fidelity?dimensionalGrassGeometry(true):plains?physicalGrassGeometry(true):fibreGeometry()')
s=s.replace('edgeMat,golden?style.frameGrass:240','edgeMat,fidelity?320:golden?style.frameGrass:240')
s=s.replace('const a=anchors[i%anchors.length],angle=r()*6.28,radius=1.4+r()*2,x=a.x+Math.cos(angle)*radius,z=a.z+Math.sin(angle)*radius*.7;', 'const a=anchors[i%anchors.length],angle=r()*6.28,radius=1.4+r()*2;let x=a.x+Math.cos(angle)*radius,z=a.z+Math.sin(angle)*radius*.7;if(fidelity&&i%3!==0){const side=i%3===1?-1:1;x=side*(5+r()*6);z=28+r()*11;}')
s=s.replace('p.grassHeight*(.35+r()*.35)','p.grassHeight*(fidelity?.55+r()*.4:.35+r()*.35)')
s=s.replace('alphaTest:role===2?.12:0','alphaTest:role===2&&!fidelity?.12:0')
s=s.replace("role===2?'diffuseColor.rgb*=mix(1.,1.04,fibreTip);diffuseColor.a*=smoothstep(0.,.12,fibreTip)*(1.-smoothstep(70.,120.,d));'", "role===2?(fidelity?`diffuseColor.rgb=mix(diffuseColor.rgb,${c('#E9B650')},smoothstep(.35,.95,fibreTip)*.28);`:'diffuseColor.rgb*=mix(1.,1.04,fibreTip);diffuseColor.a*=smoothstep(0.,.12,fibreTip)*(1.-smoothstep(70.,120.,d));')")
# Opaque, closed, instanced cross sections. Reduced detail uses the same construction, not cards.
pos=s.index('function surfaceMaterial(')
s=s[:pos]+'''/** Closed triangular cross-sections follow a bowed centreline; roots are buried, tips taper to zero.
 * No atlas, transparency or per-blade shadow maps. All variation is deterministic local geometry. */
function dimensionalGrassGeometry(detail:boolean){
 const vertices:number[]=[],uv:number[]=[],seed:number[]=[],blades=detail?5:2,steps=detail?6:2;
 const triangle=(a:T.Vector3,b:T.Vector3,c:T.Vector3,ta:number,tb:number,tc:number,part=0)=>{for(const [v,t]of [[a,ta],[b,tb],[c,tc]] as [T.Vector3,number][]){vertices.push(...v.toArray());uv.push(.5,t);seed.push(part);}};
 for(let j=0;j<blades;j++){
  const az=(j-(blades-1)*.5)*.43+Math.sin(j*3.7)*.16,dir=new T.Vector3(Math.cos(az),0,Math.sin(az)),side=new T.Vector3(-dir.z,0,dir.x),h=.7+(j%3)*.16,reach=.45+(j%3)*.14;
  const ring=(t:number,k:number)=>{const center=dir.clone().multiplyScalar((j-(blades-1)*.5)*.19+reach*t*t).addScaledVector(side,Math.sin(j*2.1)*.24+.08*Math.sin(t*3.14+j));center.y=-.06+h*(t-.2*t*t*t);const width=(detail?.065:.085)*Math.pow(Math.max(0,Math.sin(t*Math.PI)),.65),theta=k*2*Math.PI/3+.4*t;return center.addScaledVector(side,Math.cos(theta)*width).add(new T.Vector3(0,Math.sin(theta)*width*.3,0));};
  for(let k=0;k<steps;k++)for(let side=0;side<3;side++){const a=k/steps,b=(k+1)/steps;triangle(ring(a,side),ring(a,side+1),ring(b,side),a,a,b);triangle(ring(a,side+1),ring(b,side+1),ring(b,side),a,b,b);}
 }
 if(detail){const stem=(t:number,k:number)=>new T.Vector3(.15+t*t*.25+Math.cos(k*2.094)*.008,t*1.18,Math.sin(k*2.094)*.008);for(let k=0;k<3;k++){triangle(stem(0,k),stem(0,k+1),stem(1,k),0,0,1,1);triangle(stem(0,k+1),stem(1,k+1),stem(1,k),0,1,1,1);}for(let j=0;j<4;j++){const y=.96+j*.055,c=new T.Vector3(.4,y,0);for(let k=0;k<3;k++)triangle(c.clone().add(new T.Vector3(Math.cos(k*2.094)*.026,-.025,Math.sin(k*2.094)*.026)),c.clone().add(new T.Vector3(Math.cos((k+1)*2.094)*.026,-.025,Math.sin((k+1)*2.094)*.026)),c.clone().add(new T.Vector3(.015,.06,0)),.8,.8,1,1);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('seedPart',new T.Float32BufferAttribute(seed,1));g.computeVertexNormals();return g;
}
''' +s[pos:]
p.write_text(s)
