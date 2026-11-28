import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Vector3,Quaternion} from 'three';
import {studioDefaults,parseStudio,studioQuery,createStudioStudy,studioKinds} from '../src/lib/studio/groups';
import {studioGeometry} from '../src/lib/studio/geometry';
import {generatePainterlyTree} from '../src/lib/forest/painterly';
test('studio controls and direct links round-trip; malformed controls fail honestly',()=>{
  assert.deepEqual(parseStudio(new URLSearchParams(studioQuery(studioDefaults))),studioDefaults);
  for(const bad of ['size=0','size=Infinity','density=NaN','overlap=2','detail=-1','colorVariation=1.1','view=unknown','mode=world'])assert.throws(()=>parseStudio(new URLSearchParams(bad)));
  assert.equal(parseStudio(new URLSearchParams('structure='+'s'.repeat(80))).structure.length,64);
});
for(const kind of studioKinds)test(`${kind}: branch attachments, deterministic buffers, independent pigments and intact source skeleton`,()=>{
  const q={...studioDefaults,mode:'trees' as const},a=createStudioStudy(kind,q),snapshot=JSON.stringify(a.model.segments),b=createStudioStudy(kind,q),repaint=createStudioStudy(kind,{...q,appearance:'morning'});
  assert.deepEqual(a,b);assert.deepEqual(a.model.segments,repaint.model.segments);assert.deepEqual(a.groups,repaint.groups);assert.notDeepEqual(a.fronds.map(f=>f.color),repaint.fronds.map(f=>f.color));
  const unpaint=(fronds:typeof a.fronds)=>fronds.map(({color,...rest})=>{assert.match(color,/^#[0-9a-f]{6}$/);return rest;});assert.deepEqual(unpaint(a.fronds),unpaint(repaint.fronds));
  for(const group of a.groups){const segment=a.model.segments[group.branchIndex],p=new Vector3(...group.anchor).sub(new Vector3(...segment.a)),d=new Vector3(...segment.b).sub(new Vector3(...segment.a));assert.ok(p.clone().cross(d).length()<1e-5);assert.ok(p.dot(d)>=-1e-6&&p.dot(d)<=d.lengthSq()+1e-6);assert.ok(group.radii.every(n=>n>0));}
  const x=studioGeometry([a],[0]),y=studioGeometry([b],[0]);assert.equal(x.index!.count,a.fronds.length*24);assert.equal(x.getAttribute('position').count,a.fronds.length*9);
  for(const [name,attribute] of Object.entries(x.attributes)){assert.deepEqual(attribute.array,y.getAttribute(name).array);assert.ok(Array.from(attribute.array).every(Number.isFinite));}
  const range=kind==='broadleaf'?[0,3]:kind==='flower'?[4,7]:[8,11];assert.ok(a.fronds.every(f=>f.tile>=range[0]&&f.tile<=range[1]));
  assert.equal(JSON.stringify(a.model.segments),snapshot);assert.notDeepEqual(a.fronds,createStudioStudy(kind,{...q,structure:'86'}).fronds);x.dispose();y.dispose();
});
test('single groups show one connected source branch path, not detached neighboring wood',()=>{
  for(const kind of studioKinds){const study=createStudioStudy(kind,studioDefaults);assert.equal(study.groups.length,1);assert.ok(study.segments.length>0);for(let i=1;i<study.segments.length;i++)assert.deepEqual(study.segments[i-1].b,study.segments[i].a);}
});
test('size, overlap and density affect foliage; zero density removes all surfaces',()=>{
  const small=createStudioStudy('broadleaf',{...studioDefaults,size:.5}),large=createStudioStudy('broadleaf',{...studioDefaults,size:1.5});
  const a=studioGeometry([small],[0]),b=studioGeometry([large],[0]);assert.ok(b.boundingSphere!.radius>a.boundingSphere!.radius*2);a.dispose();b.dispose();
  assert.equal(createStudioStudy('flower',{...studioDefaults,density:0}).fronds.length,0);
  assert.ok(createStudioStudy('flower',{...studioDefaults,density:1}).fronds.length>createStudioStudy('flower',{...studioDefaults,density:.1}).fronds.length);
  const open=createStudioStudy('broadleaf',{...studioDefaults,overlap:0}),full=createStudioStudy('broadleaf',{...studioDefaults,overlap:1});assert.ok(full.fronds[0].width>open.fronds[0].width);
});
test('fir fronds follow branch direction and contain downward droop; existing preset is not rewritten',()=>{
  const a=createStudioStudy('conifer',{...studioDefaults,mode:'trees'});for(const f of a.fronds){assert.ok(f.droop>0);const group=a.groups.find(g=>g.id===f.groupId)!,forward=new Vector3(0,1,0).applyQuaternion(new Quaternion(...f.rotation));assert.ok(forward.dot(new Vector3(...group.axis))>-.1);}
  const original=generatePainterlyTree({presetId:'douglas',structuralSeed:studioDefaults.structure,appearanceSeed:studioDefaults.appearance,foliageDensity:1,asymmetry:.72});assert.deepEqual(a.model.segments,original.segments);
});
