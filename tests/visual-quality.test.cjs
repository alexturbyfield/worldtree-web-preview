const {test}=require('node:test'),assert=require('node:assert/strict'),sharp=require('sharp');
const {analyze}=require('../scripts/studies/visual-quality.cjs');
const image=(color)=>sharp({create:{width:20,height:10,channels:3,background:color}}).png().toBuffer();
const meta={instances:[],errors:[]};
test('missing mask is unavailable data, never a vegetation-coverage failure',async()=>{
 const result=await analyze(await image('#ffffff'),null,meta,'savanna','hero');
 assert.equal(result.coverage.available,false);assert.equal(result.findings.length,0);
});
test('actual silhouette mask distinguishes missing cover from black vegetation',async()=>{
 const white=await image('#ffffff'),black=await image('#000000');
 const empty=await analyze(white,black,meta,'savanna','hero');
 assert.equal(empty.coverage.fraction,0);assert.ok(empty.findings.some(f=>f.defect.includes('coverage')));
 const dark=await analyze(black,white,meta,'savanna','hero');
 assert.equal(dark.coverage.fraction,1);assert.equal(dark.coverage.nearBlackFraction,1);assert.ok(dark.findings.some(f=>f.severity==='major'&&f.defect.includes('Near-black')));
 const lit=await analyze(white,white,meta,'savanna','hero');assert.equal(lit.findings.length,0);
});
test('known atlas and disabled continuation remain structured review findings',async()=>{
 const result=await analyze(await image('#808080'),null,{...meta,backdrop:false,instances:[{name:'rainforest-v5-floor-decals',count:520,tiles:4,visible:true}]},'rainforest','inspection');
 assert.equal(result.findings.filter(f=>f.severity==='major').length,2);
 assert.equal(result.findings.find(f=>f.defect.includes('stamps')).measurements.count,520);
});
