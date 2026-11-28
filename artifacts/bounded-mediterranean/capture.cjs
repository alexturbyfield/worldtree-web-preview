const fs=require('fs'),{chromium}=require('playwright');const {installVisualProbe}=require('../../scripts/studies/visual-quality.cjs');
const root=__dirname;
(async()=>{const mode=process.argv[2]||'after',rows=JSON.parse(fs.readFileSync(root+'/before.json')),browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),report=[];fs.mkdirSync(root+'/'+mode,{recursive:true});
 try{for(const entry of rows.filter(r=>mode!=='holdout'||r.id==='italy')){
  const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.addInitScript(installVisualProbe);const q=new URLSearchParams(entry.query);if(mode==='holdout')q.set('seed','715903');
  try{await page.goto('http://localhost:3001/explore?'+q);await page.locator('[data-testid=forest-stage][data-state=ready]').waitFor({timeout:180000});await page.waitForFunction(()=>window.__visual&&window.__visual.s.userData.labAssetsReady!==false,{},{timeout:120000});
   const result=await page.evaluate(()=>{const {r,s,c}=window.__visual;r.setPixelRatio(1);r.setSize(640,360,false);c.aspect=16/9;c.updateProjectionMatrix();const views=[];
    for(const [view,p,t]of [['hero',[0,1.7,16],[0,-6.225925925926,-44]],['inspection',[40,32,48],[0,-5,-45]]]){c.position.fromArray(p);c.lookAt(...t);c.updateMatrixWorld();r.shadowMap.needsUpdate=true;for(let i=0;i<3;i++)r.render(s,c);views.push({view,png:r.domElement.toDataURL(),camera:{position:p,target:t,fov:c.fov,far:c.far},calls:r.info.render.calls,triangles:r.info.render.triangles,textures:r.info.memory.textures});}
    return {views,selection:s.userData.environmentSelection,backdrop:s.userData.landscapeMatte,withheld:s.userData.withheldRegionalMattes,landscape:s.userData.mediterranean,cork:s.userData.corkHero,exposure:r.toneMappingExposure};});
   if(mode!=='before'&&result.selection.automatic?.status!=='selected')throw Error('Automatic prairie not selected');for(const v of result.views){fs.writeFileSync(`${root}/${mode}/${entry.id}-${v.view}.png`,Buffer.from(v.png.split(',')[1],'base64'));delete v.png;}
   report.push({id:entry.id,query:String(q),errors,...result});console.log(mode,entry.id,result.views.map(v=>`${v.view}:${v.calls}/${v.triangles}`).join(' '));
  }catch(e){report.push({id:entry.id,error:String(e),errors});process.exitCode=1;console.log(String(e));}finally{await page.close();}
 }}finally{await browser.close();fs.writeFileSync(root+'/'+mode+'/report.json',JSON.stringify(report,null,2));}
})();

