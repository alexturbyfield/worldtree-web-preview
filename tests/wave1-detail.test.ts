import {test} from 'node:test';import assert from 'node:assert/strict';
import {fieldPlan,waterViewScore,collisionFootprint,stagingHeightFactor,type FieldPlan} from '../src/lib/forest/wave1-fields';
import {tidalWater} from '../src/lib/forest/wave1-water';import {meadowGeometry,meadowMaterial} from '../src/lib/forest/wave1-meadow-detail';

test('wetland camera retains dry approach and samples visible middle/side water across training seeds',()=>{
 for(const biome of ['mangrove','flooded']as const)for(const seed of ['29','41']){const p=fieldPlan(biome,seed),v=waterViewScore(biome,seed,p.eye[0],p.eye[2],p.heading);assert(p.stagingClearance>.07);assert(v.fraction>.12&&v.fraction<.7);assert(v.nearSides>.05);}
});
test('collision footprint follows rotated encounter and low cover transitions smoothly',()=>{
 const p={eye:[10,2,20],heading:Math.PI*.5}as FieldPlan;
 assert(collisionFootprint(p,14.5,20));assert(!collisionFootprint(p,14.5,22));assert(stagingHeightFactor(p,14.5,20)<.1);assert(stagingHeightFactor(p,14.5,25)>.9);
});
test('near water depth samples actual centred terrain rather than coarse distant cells',()=>{
 const h=(x:number,z:number)=>.1+(x-100)*.001+(z+60)*.002,optics=tidalWater(h,.15,2200,0,0,[100,-60]);
 try{const uniforms=(optics.water.material as import('three').ShaderMaterial).uniforms,raw=uniforms.nearDepthField.value.image.data as Float32Array,i=32,j=181;
 const expected=Math.max(0,.15-h(100+(i/255-.5)*160,-60+(j/255-.5)*160));assert(Math.abs(raw[j*256+i]-expected)<1e-6);assert.equal(optics.depthSampling.nearMetresPerTexel,.625);assert.equal(uniforms.nearEnabled.value,1);
 }finally{optics.dispose();}
});
test('near/far grass shader variants are separate and short cover stays below capsule clearance',()=>{
 const near=meadowMaterial(false),far=meadowMaterial(true);assert.notEqual(near.customProgramCacheKey(),far.customProgramCacheKey());near.dispose();far.dispose();
 for(const lowDetail of [false,true]){const g=meadowGeometry(lowDetail);g.computeBoundingBox();assert(g.boundingBox!.max.y*.1<.08);assert(Array.from(g.getAttribute('position').array).every(Number.isFinite));g.dispose();}
});
