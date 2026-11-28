import {test} from 'node:test';
import assert from 'node:assert/strict';
import {growthProfileStudy,type TreeGrowthProfile} from '../src/lib/studio/growth-profile';
import {studioDefaults} from '../src/lib/studio/groups';
import profiles from '../visual-lab/acacia-architectures.json';
import {treeExperiment} from '../src/lib/forest/tree-experiment';
import {generatePainterlyTree} from '../src/lib/forest/painterly';
import type {SceneRecipe} from '../src/lib/forest/recipe';
const q={...studioDefaults,structure:'fixed-29',appearance:'garden'};
test('declarative architecture reproduces and every leaf guide lies on its owned branch',()=>{
 for(const p of [profiles.profiles.A,profiles.profiles.C2] as TreeGrowthProfile[]){const a=growthProfileStudy('acacia',p,q),b=growthProfileStudy('acacia',p,q);
 assert.deepEqual(a,b);
 for(const g of a.groups){const owned=a.segments.filter(s=>s.pathId===g.branchId);assert.ok(owned.length);let nearest=Infinity;
  for(const s of owned){const d=s.b.map((v,k)=>v-s.a[k]),u=Math.max(0,Math.min(1,d.reduce((n,v,k)=>n+(g.anchor[k]-s.a[k])*v,0)/d.reduce((n,v)=>n+v*v,0)));nearest=Math.min(nearest,Math.hypot(...g.anchor.map((v,k)=>v-s.a[k]-d[k]*u)));}
  assert.ok(nearest<1e-7,'Leaf guide must be attached to an owned wood path');
 }}
});
test('visual wrapper preserves ecological identity, positions and independent individual seeds',()=>{
 const source={id:'hero',index:3,seed:'individual',appearanceSeed:'pigment',position:[-12,0,3],rotation:.2,species:{scientificName:'source species identity'},model:generatePainterlyTree({presetId:'acacia',structuralSeed:'individual',appearanceSeed:'pigment'})};
 const recipe={seed:'world',appearanceSeed:'scene-pigment',trees:[source]} as unknown as SceneRecipe,before=JSON.stringify(recipe);
 const result=treeExperiment(recipe,'A','hero');assert.equal(result.hero!.species,recipe.trees[0].species);assert.equal(result.hero!.position,recipe.trees[0].position);assert.equal(result.hero!.seed,'individual');assert.equal(result.hero!.appearanceSeed,'pigment');assert.equal(JSON.stringify(recipe),before);assert.equal(treeExperiment(recipe,null).recipe,recipe);
 const other=growthProfileStudy('unregistered-visual-profile',profiles.profiles.A,q);assert.equal(other.model.presetId,'unregistered-visual-profile');
});
test('architecture, maturity and environmental response modify structure without changing identity seeds',()=>{
 const a=growthProfileStudy('acacia',profiles.profiles.A,q),b=growthProfileStudy('acacia',profiles.profiles.B,q),c=growthProfileStudy('acacia',profiles.profiles.C,q);
 assert.notDeepEqual(a.segments,b.segments);assert.notDeepEqual(a.segments,c.segments);
 assert.ok(c.segments.filter(s=>s.depth===1).length!==a.segments.filter(s=>s.depth===1).length);
 const young=growthProfileStudy('acacia',{...profiles.profiles.A,age:{maturity:.35}},q);assert.ok(young.model.dimensions.height<a.model.dimensions.height);assert.equal(young.model.seed,a.model.seed);
 const calm=growthProfileStudy('acacia',{...profiles.profiles.B,environment:{windScale:0,phototropism:.03}},q);assert.notDeepEqual(calm.segments,b.segments);
});

test('C2 retains the preferred fork while adding branch-owned vertical canopy support',()=>{const c=profiles.profiles.C,c2=profiles.profiles.C2;assert.deepEqual(c2.trunk,c.trunk);assert.equal(c2.height,c.height);assert.equal(c2.radius,c.radius);const base=growthProfileStudy('acacia',c,q),next=growthProfileStudy('acacia',c2,q);assert.ok(next.groups.length>base.groups.length);assert.ok(next.model.dimensions.height>base.model.dimensions.height);});
