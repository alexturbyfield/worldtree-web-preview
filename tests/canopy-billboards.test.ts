import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {ellipsoidNormal,transformCanopyNormal,generateCanopyBillboards} from '../src/lib/forest/canopy-billboards';
import {canopyBillboardGeometry,batchCanopyBillboards,installCanopyShader} from '../src/lib/forest/canopy-billboard-material';
import {generateCanopy} from '../src/lib/forest/canopy';
import {generatePainterlyTree} from '../src/lib/forest/painterly';
import {canopyAtlasLayout} from '../src/lib/forest/foliage-atlas';
const model=(presetId='oak',appearanceSeed='moss')=>generatePainterlyTree({presetId,structuralSeed:'29',appearanceSeed});
const close=(a:number[],b:number[])=>a.forEach((n,i)=>assert.ok(Math.abs(n-b[i])<1e-6,`${a} != ${b}`));
test('ellipsoid normals use inverse squared radii, ellipsoid rotation and parent inverse transpose',()=>{
  const n=ellipsoidNormal([2,1,0],[0,0,0],[2,1,3]);close(n,new THREE.Vector3(.5,1,0).normalize().toArray());
  const rotation=.63,center=new THREE.Vector3(5,7,-2),p=new THREE.Vector3(2,1,0).applyAxisAngle(new THREE.Vector3(0,1,0),rotation).add(center);
  const actual=ellipsoidNormal(p.toArray(),center.toArray(),[2,1,3],rotation),expected=new THREE.Vector3(.5,1,0).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),rotation);close(actual,expected.toArray());
  const parent=new THREE.Matrix4().compose(new THREE.Vector3(2,3,4),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,1,0).normalize(),.8),new THREE.Vector3(2,.5,3));
  const transformed=new THREE.Vector3(...transformCanopyNormal(actual,parent));
  // A transformed tangent remains perpendicular under a nonuniform parent scale.
  const tangent=new THREE.Vector3(0,0,1).cross(expected).normalize().transformDirection(parent);assert.ok(Math.abs(transformed.dot(tangent))<1e-6);assert.ok(Math.abs(transformed.length()-1)<1e-6);
});
for(const preset of ['oak','douglas','spruce','pine','acacia'])test(`${preset}: deterministic cards preserve scaffolds and separate structure from pigment`,()=>{
  const canopy=generateCanopy(model(preset)),snapshot=JSON.stringify(canopy),args=[canopy.clumps,preset,'29','moss'] as const;
  const a=generateCanopyBillboards(...args),b=generateCanopyBillboards(...args),repaint=generateCanopyBillboards(canopy.clumps,preset,'29','copper'),far=generateCanopyBillboards(canopy.coarseClumps,preset,'29','moss',true),cheap=generateCanopyBillboards(canopy.coarseClumps,preset,'29','moss',true,true);
  assert.deepEqual(a,b);assert.equal(JSON.stringify(canopy),snapshot);assert.ok(a.length>far.length&&far.length>cheap.length);assert.notDeepEqual(a,generateCanopyBillboards(canopy.clumps,preset,'17','moss'));
  const geometry=(cards:typeof a)=>cards.map(({color,...rest})=>{assert.match(color,/^#/);return rest;});assert.deepEqual(geometry(a),geometry(repaint));assert.notDeepEqual(a.map(c=>c.color),repaint.map(c=>c.color));
  let inside=0,outside=0;
  for(const card of a){const c=canopy.clumps[card.scaffoldId],p=new THREE.Vector3(...card.position).sub(new THREE.Vector3(...c.position)).applyAxisAngle(new THREE.Vector3(0,1,0),-c.rotation).divide(new THREE.Vector3(...c.scale)),radius=p.length();assert.ok(radius>=.84&&radius<=1.07);if(radius<1)inside++;else outside++;
    close(card.normal,ellipsoidNormal(card.position,c.position,c.scale,c.rotation));assert.ok(Math.abs(Math.hypot(...card.normal)-1)<1e-6);assert.ok(card.size.every(n=>n>0&&Number.isFinite(n)));assert.ok(card.rotation.every(Number.isFinite));
  }assert.ok(inside&&outside);
});
test('card instances share a four-vertex sheet and independent normal attributes',()=>{
  const c=generateCanopy(model()),cards=generateCanopyBillboards(c.clumps,'oak','29','moss'),g=canopyBillboardGeometry(cards);
  assert.equal(g.getAttribute('position').count,4);assert.equal(g.index!.count,6);assert.equal(g.getAttribute('canopyNormal').count,cards.length);assert.equal(g.getAttribute('atlasRect').count,cards.length);g.dispose();
  const material=new THREE.MeshLambertMaterial(),shader={vertexShader:THREE.ShaderLib.lambert.vertexShader,fragmentShader:THREE.ShaderLib.lambert.fragmentShader,uniforms:{}} as Parameters<THREE.Material['onBeforeCompile']>[0];
  installCanopyShader(material,{value:0},{value:0});material.onBeforeCompile(shader,{} as THREE.WebGLRenderer);assert.match(shader.vertexShader,/transformedNormal=normalMatrix\*canopyNormal/);assert.ok(!shader.fragmentShader.includes('normal *= faceDirection'));assert.match(shader.vertexShader,/mix\(leafR,faceR/);material.dispose();
});
test('all canopy atlas tiles contain many leaves, with distinct broadleaf/needle morphology',()=>{
  const tiles=canopyAtlasLayout();assert.deepEqual(tiles,canopyAtlasLayout());assert.equal(tiles.length,8);assert.ok(tiles.every(t=>t.leaves.length>20));assert.ok(tiles[0].leaves.every(l=>l.needle));assert.ok(tiles[3].leaves.every(l=>l.lobed));assert.ok(tiles[4].leaves.every(l=>!l.lobed&&!l.needle));
});

test('indexed batches bake identical seeded attributes and repeat transferred normals at all four corners',()=>{
  const canopy=generateCanopy(model()),cards=generateCanopyBillboards(canopy.clumps,'oak','29','moss'),a=batchCanopyBillboards(cards),b=batchCanopyBillboards(cards);
  assert.equal(a.getAttribute('position').count,cards.length*4);assert.equal(a.index!.count,cards.length*6);
  for(const [name,attr] of Object.entries(a.attributes))assert.deepEqual(attr.array,b.getAttribute(name).array);
  cards.forEach((card,i)=>{for(let j=0;j<4;j++){const n=a.getAttribute('canopyNormal'),c=a.getAttribute('cardCenter');close([n.getX(i*4+j),n.getY(i*4+j),n.getZ(i*4+j)],card.normal);close([c.getX(i*4+j),c.getY(i*4+j),c.getZ(i*4+j)],card.position);}assert.ok(a.boundingSphere!.containsPoint(new THREE.Vector3(...card.position)));});a.dispose();b.dispose();
});
