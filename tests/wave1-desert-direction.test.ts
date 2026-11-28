import {test} from 'node:test';
import assert from 'node:assert/strict';
import {desertRelief,erodedMass} from '../src/lib/forest/wave1-desert-direction';

test('implicit eroded rock is deterministic and closed, without sub-voxel joint holes',()=>{
 const g=erodedMass('29|weathered-0',18),again=erodedMass('29|weathered-0',18),p=g.attributes.position.array;
 assert.deepEqual(p,again.attributes.position.array);assert.ok(p.length>1000);
 for(const x of [...p,...g.attributes.normal.array])assert.ok(Number.isFinite(x));
 const edges=new Map<string,number>(),vertex=(i:number)=>[p[i],p[i+1],p[i+2]].map(x=>Math.round(x*1e5)).join(',');
 for(let i=0;i<p.length;i+=9){const a=[vertex(i),vertex(i+3),vertex(i+6)];for(let j=0;j<3;j++){const key=[a[j],a[(j+1)%3]].sort().join('|');edges.set(key,(edges.get(key)||0)+1);}}
 assert.ok([...edges.values()].every(n=>n===2));g.dispose();again.dispose();
});

test('arid relief remains low, continuous and seed-dependent without a mountain backdrop',()=>{
 let variation=false;
 for(let x=-50;x<50;x+=5)for(let z=-50;z<50;z+=5){const a=desertRelief('29',x,z);assert.ok(Math.abs(a)<.7);assert.ok(Math.abs(a-desertRelief('29',x+.1,z))<.04);assert.equal(a,desertRelief('29',x,z));variation||=Math.abs(a-desertRelief('41',x,z))>.05;}
 assert.ok(variation);
});
