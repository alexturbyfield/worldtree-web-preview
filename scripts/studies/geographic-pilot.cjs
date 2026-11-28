// Uses the existing Lab observation hook; fixed views, no renderer fork.
const {chromium}=require('playwright'),fs=require('fs'),sharp=require('sharp');
require('tsx/cjs');
const {geographicPilotSites,geographicPilotUrl}=require('../../src/lib/forest/geographic-pilot.ts');
const {installVisualProbe}=require('./visual-quality.cjs');
const root='artifacts/geographic-pilot',origin=process.env.WORLDTREE_TEST_URL||'http://localhost:3001';
async function capture(mode='after',ids){
 fs.mkdirSync(`${root}/${mode}`,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),records=[];
 try{for(const site of geographicPilotSites.filter(s=>!ids||ids.includes(s.id))){
  const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.addInitScript(installVisualProbe);
  const query=new URLSearchParams(geographicPilotUrl(site.id).split('?')[1]);
  if(mode==='before')query.delete('geographicPilot');
  if(mode==='holdout')query.set('seed','91837'); // Recipe frozen before this is rendered; never tune against it.
  try{
   await page.goto(origin+'/explore?'+query);await page.locator('[data-testid=forest-stage][data-state=ready]').waitFor({timeout:180000});
   await page.waitForFunction(()=>window.__visual&&window.__visual.s.userData.labAssetsReady!==false,{},{timeout:120000});
   const result=await page.evaluate(()=>{
    const {r,s,c}=window.__visual;r.setPixelRatio(1);r.setSize(640,360,false);c.aspect=16/9;c.updateProjectionMatrix();
    const views=[];for(const [view,position,target]of [['hero',[0,1.7,34],[0,2.3,-55]],['inspection',[62,38,76],[0,2,-24]]]){
     c.position.fromArray(position);c.lookAt(...target);c.updateMatrixWorld();r.shadowMap.needsUpdate=true;
     for(let n=0;n<3;n++)r.render(s,c);
     views.push({view,png:r.domElement.toDataURL(),camera:{position:c.position.toArray(),quaternion:c.quaternion.toArray(),fov:c.fov},calls:r.info.render.calls,triangles:r.info.render.triangles,textures:r.info.memory.textures});
    }
    return {views,selection:s.userData.environmentSelection,pilot:s.userData.geographicPilot??null,dryForest:s.userData.dryForest??null,prairie:s.userData.prairieLandscape??null,matte:s.userData.landscapeMatte??null,render:{exposure:r.toneMappingExposure,toneMapping:r.toneMapping,pixelRatio:r.getPixelRatio()}};
   });
   for(const v of result.views){fs.writeFileSync(`${root}/${mode}/${site.id}-${v.view}.png`,Buffer.from(v.png.split(',')[1],'base64'));delete v.png;}
   Object.assign(result,{site,query:query.toString(),errors});fs.writeFileSync(`${root}/${mode}/${site.id}.json`,JSON.stringify(result,null,2));records.push(result);console.log(mode,site.id,result.views.map(v=>`${v.view}:${v.calls}/${v.triangles}`).join(' '));
  }catch(e){records.push({id:site.id,error:String(e),errors});console.log('FAILED',site.id,String(e));process.exitCode=1;}finally{await page.close();}
 }}finally{await browser.close();}
 fs.writeFileSync(`${root}/${mode}/report.json`,JSON.stringify(records,null,2));
}
async function sheet(){
 const tiles=[];for(let i=0;i<geographicPilotSites.length;i++){const site=geographicPilotSites[i];for(let j=0;j<2;j++){
  const mode=j?'after':'before';tiles.push({input:await sharp(`${root}/${mode}/${site.id}-hero.png`).resize(320,180).toBuffer(),left:j*320,top:i*180});
 }}await sharp({create:{width:640,height:1620,channels:3,background:'#fff'}}).composite(tiles).png().toFile(`${root}/comparison.png`);
}
if(require.main===module)(process.argv[2]==='sheet'?sheet():capture(process.argv[2],process.argv[3]?.split(','))).catch(e=>{console.error(e);process.exitCode=1;});
