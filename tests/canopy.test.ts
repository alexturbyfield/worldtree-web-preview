import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateCanopy,defaultCanopy,type CanopyClump} from '../src/lib/forest/canopy';
import {canopyGeometry} from '../src/lib/forest/canopy-geometry';
import {generatePainterlyTree,defaultArt} from '../src/lib/forest/painterly';
import {createLabRecipe,parseLabQuery,labQuery} from '../src/lib/forest/laboratory';
import {parseSceneQuery,sceneQuery} from '../src/lib/forest/query';
const tree=(presetId='oak',structuralSeed='29',appearanceSeed='moss')=>generatePainterlyTree({presetId,structuralSeed,appearanceSeed,...defaultArt});
const shapes=(clumps:CanopyClump[])=>clumps.map(({color,...shape})=>{assert.match(color,/^#[0-9a-f]{6}$/);return shape;});
for(const [species,architecture] of [['douglas','layered-conical'],['spruce','layered-conical'],['oak','rounded'],['pine','open-pads'],['acacia','umbrella']]){
  test(`${species}: reproducible full crown, independent pigments, distinct structural seeds`,()=>{
    const model=tree(species),a=generateCanopy(model),b=generateCanopy(model),repaint=generateCanopy(tree(species,'29','copper')),regrow=generateCanopy(tree(species,'17'));
    assert.deepEqual(a,b);assert.equal(a.envelope.architecture,architecture);assert.deepEqual(shapes(a.clumps),shapes(repaint.clumps));assert.notDeepEqual(a.clumps.map(c=>c.color),repaint.clumps.map(c=>c.color));assert.notDeepEqual(shapes(a.clumps),shapes(regrow.clumps));
    assert.ok(a.clumps.length>=10&&a.clumps.length<50);assert.ok(a.coarseClumps.length<a.clumps.length);assert.ok(a.surfaceCards.length<=12);
    for(const c of [...a.clumps,...a.coarseClumps]){assert.ok([...c.position,...c.scale,c.rotation].every(Number.isFinite));assert.ok(c.scale.every(n=>n>0));assert.ok(c.attachmentIndex<model.segments.length);}
    // Overlapping envelopes: no isolated cloud fragments, including a connected conifer leader.
    for(const c of a.clumps){assert.ok(a.clumps.some(d=>d!==c&&Math.hypot(...c.position.map((v,i)=>(v-d.position[i])/(c.scale[i]+d.scale[i])))<1.25),'isolated clump '+c.id);}
    assert.ok(a.dimensions.height>0&&a.dimensions.crownWidth>0);assert.ok(a.bounds.min[1]>-1);
    const average=(clumps:CanopyClump[])=>clumps.reduce((n,c)=>n+c.scale.reduce((a,b)=>a*b,1),0)/clumps.length;
    assert.ok(average(a.coarseClumps)>average(a.clumps),'coarse crowns use larger clumps');
  });
}
test('fluffiness and overlap enlarge crowns; branch exposure opens them; surface detail leaves structure intact',()=>{
  const model=tree(),small=generateCanopy(model,{fluffiness:0,clumpOverlap:0}),full=generateCanopy(model,{fluffiness:1,clumpOverlap:1}),exposed=generateCanopy(model,{branchExposure:1}),defaulted=generateCanopy(model);
  assert.ok(full.dimensions.crownWidth>small.dimensions.crownWidth);assert.ok(exposed.dimensions.crownWidth<defaulted.dimensions.crownWidth);
  const detailed=generateCanopy(model,{surfaceLeafDetail:1}),plain=generateCanopy(model,{surfaceLeafDetail:0});assert.deepEqual(detailed.clumps,plain.clumps);assert.equal(plain.surfaceCards.length,0);assert.ok(detailed.surfaceCards.length>defaulted.surfaceCards.length);
  assert.equal(generateCanopy(generatePainterlyTree({presetId:'oak',structuralSeed:'29',appearanceSeed:'moss',...defaultArt,foliageDensity:0})).clumps.length,0);
  for(const v of [-1,2,NaN,Infinity])assert.throws(()=>generateCanopy(model,{fluffiness:v}));
});
test('closed deformed lofts have outward winding, smooth finite normals and cheap distant LODs',()=>{
  for(const kind of ['cloud','bough'] as const)for(let variant=0;variant<3;variant++){
    const near=canopyGeometry(kind,variant),far=canopyGeometry(kind,variant,true),repeat=canopyGeometry(kind,variant);
    assert.notStrictEqual(near,repeat);assert.deepEqual(near.getAttribute('position').array,repeat.getAttribute('position').array);assert.ok(near.index!.count>far.index!.count);assert.ok(near.index!.count/3<200);
    for(const geometry of [near,far]){for(const name of ['position','normal','color','uv'])assert.ok(Array.from(geometry.getAttribute(name).array).every(Number.isFinite));
      const p=geometry.getAttribute('position'),idx=geometry.index!,edges=new Map<string,number>(),key=(i:number)=>[p.getX(i),p.getY(i),p.getZ(i)].map(n=>Math.round(n*1e5)).join(',');
      let volume=0;
      for(let i=0;i<idx.count;i+=3){const ids=[idx.getX(i),idx.getX(i+1),idx.getX(i+2)],a=ids.map(n=>[p.getX(n),p.getY(n),p.getZ(n)]);volume+=a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])+a[0][1]*(a[1][2]*a[2][0]-a[1][0]*a[2][2])+a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]);
        for(let j=0;j<3;j++){const e=[key(ids[j]),key(ids[(j+1)%3])].sort().join('|');edges.set(e,(edges.get(e)??0)+1);}}
      assert.ok(volume>0,'outward winding');assert.ok([...edges.values()].every(n=>n===2),'closed surface after seam/pole welding');
    }near.dispose();far.dispose();repeat.dispose();
  }
});
test('new controls survive direct links and recipe export; Diagram remains unchanged',()=>{
  const params='fluffiness=0.6&clumpOverlap=0.9&surfaceLeafDetail=0.2&branchExposure=0.3';
  const q=parseLabQuery(new URLSearchParams(params));assert.deepEqual(parseLabQuery(new URLSearchParams(labQuery(q))),q);
  const r=createLabRecipe(q);assert.deepEqual(r.trees[0].canopy!.controls,{fluffiness:.6,clumpOverlap:.9,surfaceLeafDetail:.2,branchExposure:.3});assert.equal(r.schemaVersion,'0.1.0');
  const scene=parseSceneQuery(new URLSearchParams('lat=47&lon=-122&'+params));assert.deepEqual(parseSceneQuery(new URLSearchParams(sceneQuery(scene))),scene);
  const diagram=createLabRecipe({...q,renderMode:'diagram'});assert.equal(diagram.trees[0].canopy,undefined);assert.deepEqual(diagram.trees[0].model,generatePainterlyTree(q));
  assert.deepEqual(defaultCanopy,{fluffiness:.78,clumpOverlap:.82,surfaceLeafDetail:.3,branchExposure:.12});
});
