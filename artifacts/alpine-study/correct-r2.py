from pathlib import Path
p=Path('src/lib/forest/alpine-recipe.ts');s=p.read_text().replace("sun:'#ffe1a1'","sun:'#fff1cf'").replace('smooth(.38,.95,slope)*.82+smooth(65,170,y)*.68','smooth(.3,.7,slope)*.82+smooth(35,110,y)*.85')
s=s.replace('crest=1+.11*Math.sin(v*r.spurs+p.phase)+.05*Math.sin(v*r.spurs*2.3)', 'crest=1+.18*Math.sin(v*r.spurs*1.7+p.phase)+.07*Math.sin(v*r.spurs*3.1)')
p.write_text(s)
p=Path('src/lib/forest/alpine-adapter.ts');s=p.read_text().replace("lerp(new T.Color('#4e774a'),.3)","lerp(new T.Color('#367942'),.7)").replace("shade=new T.Color(a.shade)","shade=new T.Color(a.shade).lerp(new T.Color('#244e3d'),.25)").replace('opening*.25+f.patch*.12','opening*.08+f.patch*.04').replace("sun.intensity=id==='C'?2.3:3.","sun.intensity=id==='C'?2.:2.6").replace('fill.intensity=.24','fill.intensity=.4').replace('o.intensity=.75','o.intensity=.9')
# Branch-tier cores are a cheap LOD representation behind the existing procedural boughs, not replacement tree generators.
s=s.replace(" const waterMaterial=", " const coreMat=new T.MeshStandardMaterial({roughness:1}),cores=new T.InstancedMesh(coniferCoreGeometry(),coreMat,p.trees.length);cores.name='alpine-conifer-cores';cores.castShadow=true;cores.receiveShadow=true;p.trees.forEach((t,i)=>{o.position.set(t.x,alpineHeight(p,t.x,t.z),t.z);o.rotation.set(0,t.rotation,0);o.scale.set(t.width,t.height,t.width);o.updateMatrix();cores.setMatrixAt(i,o.matrix);});cores.computeBoundingSphere();scene.add(cores);created.push(cores);plantBatches.push({mesh:cores,locations:p.trees,kind:'tree'});\n const waterMaterial=")
s=s.replace("kind:'grass'|'flower'|'rock'", "kind:'grass'|'flower'|'rock'|'tree'")
s=s.replace("batch.kind==='rock'?'rock':'grass'", "batch.kind==='rock'?'rock':batch.kind==='tree'?'tree':'grass'")
s+='''
/** Irregular overlapping conifer bough envelopes: core value masses under the existing needle sprays. */
function coniferCoreGeometry(){const positions:number[]=[],indices:number[]=[],rings=5,sides=11;for(let tier=0;tier<5;tier++){const base=positions.length/3,bottom=.17+tier*.15,height=.31-tier*.022,radius=1-tier*.18;for(let k=0;k<=rings;k++){const t=k/rings;for(let j=0;j<=sides;j++){const a=j/sides*6.283,r=radius*Math.pow(1-t,.85)*(1+.12*Math.sin(a*3+tier)+.06*Math.sin(a*7-tier));positions.push(Math.cos(a)*r,bottom+height*t-.025*(1-t)*Math.sin(a*3+tier),Math.sin(a)*r);}}for(let k=0;k<rings;k++)for(let j=0;j<sides;j++){const a=base+k*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,a+1,b,b+1);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;}
'''
p.write_text(s)
