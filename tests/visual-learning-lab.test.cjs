const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),os=require('os'),path=require('path'),sharp=require('sharp');
const lab=require('../scripts/studies/visual-learning-lab.cjs');
test('catalog preserves three unique targeted candidates and a bounded triangle budget',()=>{
 const catalog=require('../src/lib/forest/visual-lab-profiles.json');assert.equal(lab.validateCatalog(catalog),true);
 const invalid=JSON.parse(JSON.stringify(catalog));invalid.experiments.A.candidates[0].parameters.worldSeed='different-scene';assert.throws(()=>lab.validateCatalog(invalid),/targeted/);
 const refs=require('../visual-lab/references.json').references;assert.equal(refs.length,8);assert.equal(new Set(refs.map(r=>r.id)).size,8);
 for(const r of refs){assert.ok(r.source&&r.license&&r.principle&&r.positiveCharacteristics.length&&r.defectsToAvoid.length);assert.equal(r.license.trainingEligible,false);assert.ok(fs.existsSync(r.imagePath));}
});
test('controller stops on budget, pending review, unavailable vision and two stalls',()=>{
 assert.equal(lab.canContinue({maxRounds:3,rounds:[]}).allowed,true);
 assert.equal(lab.canContinue({maxRounds:3,rounds:[{status:'awaiting-review'}]}).allowed,false);
 assert.equal(lab.canContinue({maxRounds:3,rounds:[{meaningfulImprovement:false},{meaningfulImprovement:false}]}).allowed,false);
 assert.equal(lab.canContinue({maxRounds:3,rounds:[{},{},{}]}).allowed,false);
 assert.equal(lab.canContinue({maxRounds:3,rounds:[],visionAvailable:false}).allowed,false);
});
test('objective success never implies aesthetic approval; invariant failure is critical',()=>{
 const baseline={findings:[],coverage:{fraction:.5},performance:{triangles:100,calls:2},camera:{x:1},renderSettings:{exposure:1}};
 const candidate={...baseline,lab:{unchangedSystems:{match:true},deterministicReproduction:true,targetLayout:{count:100,occupancyCV:1,gridAlignedFraction:0,duplicatePositionFraction:0}}};
 assert.deepEqual(lab.assess(candidate,baseline),[]);assert.equal(candidate.approved,undefined);
 candidate.lab.unchangedSystems.match=false;assert.ok(lab.assess(candidate,baseline).some(f=>f.severity==='critical'));
 candidate.lab.unchangedSystems.match=true;candidate.coverage={fraction:.05};candidate.biome='savanna';assert.ok(lab.assess(candidate,baseline).some(f=>f.defect.includes('coverage loss')));
});
test('manual sunlit ROI check counts actual masked pixels and declares its proxy scope',async()=>{
 const image=await sharp({create:{width:20,height:10,channels:3,background:'#000'}}).png().toBuffer(),mask=await sharp({create:{width:20,height:10,channels:3,background:'#fff'}}).png().toBuffer();
 const r=await lab.sunlitCheck(image,mask,[.5,.5,1,1]);assert.equal(r.maskPixels,50);assert.equal(r.nearBlackFraction,1);assert.match(r.method,/not a physical/);
});
test('human approval requires both judgments; rejection restores the prior best',t=>{
 const prefix=path.join(os.tmpdir(),'wildloom-lab-test-'),temp=fs.mkdtempSync(prefix),root=path.join(temp,'records'),store=path.join(temp,'store');
 t.after(()=>{const resolved=path.resolve(temp);assert.ok(resolved.startsWith(path.resolve(prefix)));fs.rmSync(resolved,{recursive:true,force:true});});
 const fixture={experiment:'A',biome:'savanna',worldSeed:'29',presentationSeed:'fixture',generatorVersion:'fixture',references:[],baseline:{captures:[]},visionReview:{actor:{type:'agent'},goodEnough:false},candidates:[{id:'a1',parameters:{count:1},criticalFailure:false,objectiveFindings:[],screenshots:{hero:'fixture.png',inspection:'fixture2.png'}}]};
 for(const id of ['A-r1','A-r2']){fs.mkdirSync(path.join(root,id),{recursive:true});fs.writeFileSync(path.join(root,id,'record.json'),JSON.stringify(fixture));}
 const payload={record:'A-r1',decision:'approve',candidateId:'a1',reviewer:'isolated test fixture',reason:'fixture only',inspected:true,betterThanPrevious:true,goodEnough:false};
 assert.throws(()=>lab.humanPreference(payload,{root,store}),/both better/);assert.equal(fs.existsSync(path.join(store,'preferences.jsonl')),false);
 payload.goodEnough=true;lab.humanPreference(payload,{root,store});assert.equal(JSON.parse(fs.readFileSync(path.join(store,'best-known.json'))).A.record,'A-r1');
 lab.humanPreference({...payload,record:'A-r2'},{root,store});assert.equal(JSON.parse(fs.readFileSync(path.join(store,'best-known.json'))).A.record,'A-r2');
 lab.humanPreference({...payload,record:'A-r2',decision:'reject-all'},{root,store});assert.equal(JSON.parse(fs.readFileSync(path.join(store,'best-known.json'))).A.record,'A-r1');
 const events=fs.readFileSync(path.join(store,'preferences.jsonl'),'utf8').trim().split('\n').map(JSON.parse);assert.equal(events.length,3);assert.equal(events[0].actor.type,'human');assert.equal(events[0].training.modelTrained,false);
 assert.deepEqual(lab.bestFromPreferences([{...events[0],actor:{type:'agent'}}]),{});
});
