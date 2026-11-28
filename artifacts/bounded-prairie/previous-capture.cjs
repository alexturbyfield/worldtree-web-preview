const fs=require('fs'),{chromium}=require('playwright');require('tsx/cjs');
const {installVisualProbe}=require('../../scripts/studies/visual-quality.cjs');
const {resolveBoundedEnvironment}=require('../../src/lib/forest/bounded-resolver.ts');
const {wave1Study}=require('../../src/lib/forest/wave1.ts');
const root='artifacts/bounded-prairie/previous',cases=require('../bounded-resolver/cases.json').filter(c=>['germany','finland','alaska'].includes(c.id));
async function capture(mode){
 fs.mkdirSync(`${root}/${mode}`,{recursive:true});const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),records=[];
 try{for(const entry of cases.filter(c=>mode!=='holdout'||['japan','siberia','chukchi-dateline'].includes(c.id))){
  const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.addInitScript(installVisualProbe);
  const q=new URLSearchParams(entry.query);let regional=entry.regional;
  if(mode==='before')q.delete('autoEnvironment');
  if(mode==='holdout'){
   q.set('seed','530219');const source=require('./coordinate-audit.json').find(c=>c.id===entry.id);regional=resolveBoundedEnvironment({location:{lat:entry.lat,lon:entry.lon},ecoregion:source.ecoregion,botanicalArea:source.botanicalArea,habitat:source.habitat,palette:entry.regional.eligibleTreeCandidates},q.toString()).recipe;
  }
  const r={seed:regional.effectiveSeed},hero=wave1Study(r,'',{kind:'wave',adapter:regional.site.family,sceneId:null,regional}).camera(r);
  try{
   await page.goto('http://localhost:3001/explore?'+q);await page.locator('[data-testid=forest-stage][data-state=ready]').waitFor({timeout:180000});await page.waitForFunction(()=>window.__visual&&window.__visual.s.userData.labAssetsReady!==false,{},{timeout:120000});
   const result=await page.evaluate(({hero})=>{
    const {r,s,c}=window.__visual;r.setPixelRatio(1);r.setSize(640,360,false);c.aspect=16/9;c.updateProjectionMatrix();const views=[];
    for(const [view,position,target]of [['hero',hero.position,hero.target],['inspection',[62,40,76],[0,2,-24]]]){
     c.position.fromArray(position);c.lookAt(...target);c.updateMatrixWorld();r.shadowMap.needsUpdate=true;for(let n=0;n<3;n++)r.render(s,c);
     views.push({view,png:r.domElement.toDataURL(),camera:{position:c.position.toArray(),quaternion:c.quaternion.toArray(),fov:c.fov,far:c.far},calls:r.info.render.calls,triangles:r.info.render.triangles,textures:r.info.memory.textures});
    }
    return {views,selection:s.userData.environmentSelection,render:{resolution:[640,360],pixelRatio:r.getPixelRatio(),exposure:r.toneMappingExposure,toneMapping:r.toneMapping}};
   },{hero});
   if(mode!=='before'&&result.selection?.automatic?.status!=='selected')throw Error('Renderer did not select automatic route: '+JSON.stringify(result.selection?.automatic));
   for(const view of result.views){fs.writeFileSync(`${root}/${mode}/${entry.id}-${view.view}.png`,Buffer.from(view.png.split(',')[1],'base64'));delete view.png;}
   Object.assign(result,{id:entry.id,query:q.toString(),errors});fs.writeFileSync(`${root}/${mode}/${entry.id}.json`,JSON.stringify(result,null,2));records.push(result);console.log(mode,entry.id,result.views.map(v=>`${v.view}:${v.calls}/${v.triangles}`).join(' '));
  }catch(error){records.push({id:entry.id,error:String(error),errors});console.log('FAILED',entry.id,String(error));process.exitCode=1;}finally{await page.close();}
 }}finally{await browser.close();}fs.writeFileSync(`${root}/${mode}/report.json`,JSON.stringify(records,null,2));
}
capture(process.argv[2]??'after').catch(e=>{console.error(e);process.exitCode=1;});
