from pathlib import Path
p=Path('src/lib/forest/savanna-recipe.ts');s=p.read_text()
s=s.replace("const hybrid=id==='r-fidelity-tuft-hybrid',", "const tall=id==='r-fidelity-tuft-hybrid-tall',hybrid=tall||id==='r-fidelity-tuft-hybrid',")
s=s.replace('brushGeometry(false,hybrid)', 'brushGeometry(false,hybrid,tall?1.75:1)').replace('brushGeometry(true,hybrid)', 'brushGeometry(true,hybrid,tall?1.75:1)')
s=s.replace('reedMaterial,96)', 'reedMaterial,tall?192:96)')
s=s.replace('  const after=guard(targets);', "  const rockClearance=tall?clearVegetationFromRocks(scene,created,recipe.seed):undefined;if(rockClearance){count-=rockClearance.removed;digest=2166136261;for(const m of created)if(m instanceof T.InstancedMesh)for(let i=0;i<m.count*16;i++)digest=Math.imul(digest^Math.round(m.instanceMatrix.array[i]*10000),16777619);}\n  const after=guard(targets);")
s=s.replace("brushHeight:[.42,.72],reeds:96", "brushHeight:tall?[.735,1.26]:[.42,.72],brushHeightMultiplier:tall?1.75:1,reeds:tall?192:96,...(rockClearance?{rockClearance}:{})")
s=s.replace("'r-fidelity-tuft-hybrid'].includes(id)","'r-fidelity-tuft-hybrid','r-fidelity-tuft-hybrid-tall'].includes(id)")
s=s.replace('function brushGeometry(near:boolean,short=false){','function brushGeometry(near:boolean,short=false,heightMultiplier=1){')
s=s.replace("-.16+t*(short?(near?.72:.42):(near?1.55:.7))", "-.16+t*(short?(near?.72:.42):(near?1.55:.7))*heightMultiplier")
pos=s.index('/** Portable seeded cluster descriptions:')
s=s[:pos]+'''/** Conservative world-XZ clearance from actual visible rock geometry, including full card/blade lean.
 * Relocate only conflicting plants; preserve rock transforms and unaffected seeded placements. */
function clearVegetationFromRocks(scene:T.Scene,created:T.Mesh[],seed:string){
 scene.updateMatrixWorld(true);const rocks:T.Box3[]=[],matrix=new T.Matrix4(),instance=new T.Matrix4();
 scene.traverse(object=>{if(!(object instanceof T.Mesh)||!(/rock|boulder|stone/i.test(object.name)||object.geometry.type==='IcosahedronGeometry'))return;for(let p:T.Object3D|null=object;p;p=p.parent)if(!p.visible)return;object.geometry.computeBoundingBox();const box=object.geometry.boundingBox!;if(object instanceof T.InstancedMesh){for(let i=0;i<object.count;i++){object.getMatrixAt(i,instance);matrix.multiplyMatrices(object.matrixWorld,instance);rocks.push(box.clone().applyMatrix4(matrix));}}else rocks.push(box.clone().applyMatrix4(object.matrixWorld));});
 const intersects=(box:T.Box3)=>rocks.some(r=>box.min.x<r.max.x+.08&&box.max.x>r.min.x-.08&&box.min.z<r.max.z+.08&&box.max.z>r.min.z-.08),o=new T.Object3D();let moved=0,removed=0,checked=0,remainingOverlaps=0,batch=0;
 for(const mesh of created){if(!(mesh instanceof T.InstancedMesh)||mesh.name!=='lab-savanna-grass')continue;mesh.geometry.computeBoundingBox();const local=mesh.geometry.boundingBox!,bounds=new T.Box3(),attributes=['brushTile','grassSeedPresent'].map(name=>mesh.geometry.getAttribute(name)).filter(Boolean);let write=0;
  for(let i=0;i<mesh.count;i++){checked++;mesh.getMatrixAt(i,instance);o.matrix.copy(instance);o.matrix.decompose(o.position,o.quaternion,o.scale);matrix.multiplyMatrices(mesh.matrixWorld,instance);bounds.copy(local).applyMatrix4(matrix);let blocked=intersects(bounds);
   if(blocked){const x=o.position.x,z=o.position.z,offset=o.position.y-terrainHeight(x,z,seed),r=randomSource(seed+'|rock-clearance|'+batch+'|'+i);for(let trial=0;trial<64;trial++){const angle=r()*Math.PI*2,radius=.6+Math.sqrt(r())*(1.5+trial*.09),nx=x+Math.cos(angle)*radius,nz=z+Math.sin(angle)*radius;if(Math.abs(nx)>48||Math.abs(nz)>48||(Math.abs(nx)<3.5&&nz>15&&nz<31))continue;o.position.set(nx,terrainHeight(nx,nz,seed)+offset,nz);o.updateMatrix();matrix.multiplyMatrices(mesh.matrixWorld,o.matrix);bounds.copy(local).applyMatrix4(matrix);if(!intersects(bounds)){blocked=false;moved++;break;}}}
   if(blocked){removed++;continue;}o.updateMatrix();mesh.setMatrixAt(write,o.matrix);for(const a of attributes)a.setX(write,a.getX(i));if(intersects(bounds))remainingOverlaps++;write++;
  }mesh.count=write;mesh.instanceMatrix.needsUpdate=true;for(const a of attributes)a.needsUpdate=true;mesh.computeBoundingSphere();batch++;
 }
 return {method:'Transformed full vegetation bounds versus actual rock bounds in world XZ,8cm padding',rocks:rocks.length,checked,moved,removed,remainingOverlaps};
}

''' +s[pos:];p.write_text(s)
