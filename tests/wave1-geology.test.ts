import {test} from 'node:test';
import assert from 'node:assert/strict';
import {geologicalAssembly} from '../src/lib/forest/wave1-desert-detail';

test('joint-plane assemblies are reproducible, bounded and cheaper than the previous1200-triangle block',()=>{
 const signatures=new Set<string>();
 for(let variant=0;variant<3;variant++){
  const a=geologicalAssembly(variant),b=geologicalAssembly(variant);
  assert.deepEqual(a.attributes.position.array,b.attributes.position.array);
  assert.ok(a.attributes.position.count/3<1200);
  for(const value of a.attributes.position.array)assert.ok(Number.isFinite(value)&&Math.abs(value)<1.5);
  for(const value of a.attributes.normal.array)assert.ok(Number.isFinite(value));
  signatures.add(Buffer.from(a.attributes.position.array.buffer).toString('base64'));
  a.dispose();b.dispose();
 }
 assert.equal(signatures.size,3);
});
