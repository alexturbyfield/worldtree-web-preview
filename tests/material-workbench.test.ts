import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {defaultPreset,setMaterial,resetMaterial,serializePreset,parsePreset,importPreset,materialKeys} from '../src/lib/material-workbench';
import {prairieMaterialUniforms,bindPrairieMaterials} from '../src/lib/forest/prairie-material-bindings';
test('versioned portable presets round trip and reject malformed inputs',()=>{
 const p=setMaterial(defaultPreset(),'prBody','#aacc44');assert.deepEqual(parsePreset(serializePreset(p)).values,p.values);
 for(const input of ['{}',JSON.stringify({...p,version:2}),JSON.stringify({...p,values:{...p.values,soilBlend:-1}}),JSON.stringify({...p,values:{...p.values,prBody:'red'}})])assert.throws(()=>parsePreset(input));
 assert.throws(()=>setMaterial(p,'detailStrength',NaN));
});
test('locks protect edits, individual/all reset and imported values',()=>{
 let p=setMaterial(defaultPreset(),'prBody','#aacc44');p={...p,locks:{prBody:true}};
 assert.equal(setMaterial(p,'prBody','#ffffff'),p);assert.equal(resetMaterial(p,'prBody').values.prBody,'#aacc44');
 p=setMaterial(p,'soilBlend',.3);assert.equal(resetMaterial(p).values.soilBlend,1);assert.equal(resetMaterial(p).values.prBody,'#aacc44');
 assert.equal(importPreset(p,serializePreset(defaultPreset())).values.prBody,'#aacc44');assert.equal(importPreset(p,serializePreset(defaultPreset())).locks.prBody,true);
});
test('disabled overrides and reset preserve baseline uniforms, colors, geometry and instance counts',()=>{
 const previous=globalThis.window;Object.defineProperty(globalThis,'window',{value:new EventTarget(),configurable:true});
 try{const s=new T.Scene(),m=new T.MeshStandardMaterial({color:'#91816b'}),g=new T.IcosahedronGeometry(),rock=new T.InstancedMesh(g,m,32);rock.name='prairie-foreground-small-stones';s.add(rock);
 const u=prairieMaterialUniforms(),dispose=bindPrairieMaterials(s,u),baseline=m.color.clone(),api=s.userData.materialWorkbench;
 let p=setMaterial(defaultPreset(),'prBody','#ffffff');p=setMaterial(p,'rockColor','#ccddaa');p=setMaterial(p,'rockCoverage',.5);api.apply({preset:p,enabled:true});assert.equal(rock.count,16);assert.equal(u.prBody.value.getHexString(),'ffffff');assert.equal(rock.geometry,g);
 api.apply({preset:p,enabled:false});assert.equal(rock.count,32);assert.ok(m.color.equals(baseline));assert.equal(u.prBody.value.getHexString(),'748a56');
 api.apply({preset:defaultPreset(),enabled:true});assert.ok(m.color.equals(baseline));assert.equal(u.prDetailStrength.value,.75);assert.equal(materialKeys.length,9);assert.equal(s.userData.artRevision,3);dispose();assert.equal(s.userData.materialWorkbench,undefined);
 g.dispose();m.dispose();}finally{Object.defineProperty(globalThis,'window',{value:previous,configurable:true});}
});
