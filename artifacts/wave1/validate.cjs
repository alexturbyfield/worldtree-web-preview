// Integration audit. Uses the real renderer and reflection-safe shared capture probe.
require('tsx/cjs');
const {chromium}=require('playwright'),fs=require('fs'),sharp=require('sharp'),crypto=require('crypto');
const {installVisualProbe}=require('../../scripts/studies/visual-quality.cjs');
const {desertStudy}=require('../../src/lib/forest/wave1-desert.ts');
const {mangroveStudy}=require('../../src/lib/forest/wave1-mangrove.ts');
const {floodedStudy}=require('../../src/lib/forest/wave1-flooded.ts');
const out='artifacts/wave1',inspection={position:[70,50,85],target:[0,1,-25]};
const profiles={desert:{study:desertStudy,query:'lat=34&lon=-116.15&habitat=forest',biome:13},mangrove:{study:mangroveStudy,query:'lat=25.2&lon=-80.9&habitat=coastal',biome:14},flooded:{study:floodedStudy,query:'lat=26.209957419&lon=-80.9383825925&habitat=wetland',biome:9}};
async function run(){
 const sources=['src/lib/forest/wave1-mangrove.ts','src/lib/vegetation.ts'];
 const hashes=()=>Object.fromEntries(sources.map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
 const frozen=hashes();fs.writeFileSync('artifacts/wave1-mangrove/freeze.json',JSON.stringify({date:new Date().toISOString(),hashes:frozen,holdout:617,training:[29,41],retained:'R2; selection-index correction only, no new art round',humanApproved:false},null,2));
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});const frames=[];
 try{
  // Desert worktree retains the unchanged base resolver. This is a genuine generic pre-Wave1 mangrove baseline.
  const cases=[{id:'mangrove',seed:29,baseline:true,origin:'http://localhost:3002'},...Object.keys(profiles).map(id=>({id,seed:29})),{id:'mangrove',seed:41},{id:'mangrove',seed:617}];
  for(const spec of cases){const profile=profiles[spec.id],page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,2000));});await page.addInitScript(installVisualProbe);
   const origin=spec.origin??'http://localhost:3001',url=origin+'/explore?'+profile.query+'&seed='+spec.seed+'&density=36&structure=grove-1&appearance=garden&wind=0&camera=human&wave1='+(spec.baseline?'baseline':spec.id);
   console.log('Capture',spec.id,spec.seed,spec.baseline?'original':'integrated');await page.goto(url);await page.locator('[data-testid=forest-stage][data-state=ready]').waitFor({timeout:180000});await page.waitForFunction(()=>window.__visual&&window.__visual.s.userData.labAssetsReady!==false,{}, {timeout:60000});
   for(const view of ['hero','inspection']){const camera=view==='hero'?profile.study.camera({seed:String(spec.seed)}):inspection;
    const d=await page.evaluate(camera=>{const {r,s,c}=window.__visual;r.setPixelRatio(1);r.setSize(640,360,false);c.aspect=16/9;c.updateProjectionMatrix();c.position.fromArray(camera.position);c.lookAt(...camera.target);c.updateMatrixWorld();
     // Disable automatic resets temporarily so nested reflection + primary submissions are both counted.
     const autoReset=r.info.autoReset;r.info.autoReset=false;const times=[],submissions=[];
     try{for(let i=0;i<5;i++){r.info.reset();const start=performance.now();r.render(s,c);if(i>1){times.push(performance.now()-start);submissions.push({...r.info.render});}}}finally{r.info.autoReset=autoReset;}
     const instances=[];s.traverse(o=>{if(o.isInstancedMesh)instances.push({name:o.name,count:o.count,visible:o.visible,trianglesPerInstance:(o.geometry.index?.count??o.geometry.attributes.position.count)/3});});
     return{png:r.domElement.toDataURL(),wave1:s.userData.wave1??null,assetError:s.userData.wave1AssetError??null,submissions,cpuSubmissionMs:times,instances,camera,renderer:r.getContext().getParameter(r.getContext().RENDERER),renderSettings:{exposure:r.toneMappingExposure,toneMapping:r.toneMapping,pixelRatio:r.getPixelRatio()},textureObjects:r.info.memory.textures,geometryObjects:r.info.memory.geometries};
    },camera);
    if(!spec.baseline&&d.wave1?.biome!==profile.biome)throw Error('Real biome gate did not select '+spec.id);
    const stem=spec.baseline?'baseline-matched':`final-${spec.seed}`,folder=spec.id==='mangrove'?'artifacts/wave1-mangrove':out;
    const file=folder+'/'+(spec.id==='mangrove'?stem:spec.id+'-'+spec.seed)+'-'+view+'.png',png=Buffer.from(d.png.split(',')[1],'base64');fs.writeFileSync(file,png);await sharp(png).resize(160,90).png().toFile(file.replace('.png','-thumb.png'));delete d.png;
    const raw=await sharp(png).removeAlpha().raw().toBuffer();let nearBlack=0;for(let i=640*180*3;i<raw.length;i+=3)nearBlack+=.2126*raw[i]+.7152*raw[i+1]+.0722*raw[i+2]<25;
    const findings=[];if(errors.length||d.assetError)findings.push({severity:'critical',defect:'Page, shader or asset error',evidence:[...errors,d.assetError].filter(Boolean)});
    frames.push({id:spec.id,seed:spec.seed,baseline:!!spec.baseline,url,file,view,...d,errors,findings,lowerHalfNearBlackFraction:nearBlack/(640*180)});console.log(file,d.submissions[0]?.calls,d.submissions[0]?.triangles,errors);
   }await page.close();
  }
 }finally{await browser.close();}
 if(JSON.stringify(frozen)!==JSON.stringify(hashes()))throw Error('Source changed after freeze');
 fs.writeFileSync(out+'/integration.json',JSON.stringify({frames,sourceFreeze:frozen,vision:'Actual images require separate vision review. Pixel diagnostics never establish aesthetics.',measurement:'Submitted calls/triangles include nested reflection pass with autoReset disabled; timings are desktop CPU submissions, not GPU frame times or mobile approval.',limitations:['No semantic vegetation buffer in this integration audit; dark lower-half pixels include water, soil and legitimate shadows.','No automatic artistic repetition/scene-boundary detector; these are explicitly reviewed in parent-review.json.','Texture object count is not texture memory or alpha-overdraw measurement.']},null,2));
}
run().catch(e=>{console.error(e);process.exitCode=1});
