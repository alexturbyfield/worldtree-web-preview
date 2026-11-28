const {chromium}=require('playwright'),fs=require('fs');require('tsx/cjs');
const {installVisualProbe}=require('../../scripts/studies/visual-quality.cjs');
const {referenceSceneUrl}=require('../../src/lib/forest/environment-registry.ts');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),page=await browser.newPage({viewport:{width:1280,height:850},acceptDownloads:true}),checks=[],errors=[];
 page.on('pageerror',e=>errors.push(String(e)));await page.addInitScript(installVisualProbe);
 const check=(name,pass)=>{checks.push({name,pass});console.log(name,pass?'PASS':'FAIL');};
 const ready=()=>page.locator('[data-testid=forest-stage][data-state=ready]').waitFor({timeout:180000});
 const open=async()=>{const panel=page.getByTestId('environment-reference-panel');await panel.locator('summary').first().click();await panel.getByText('Bounded automatic resolver',{exact:true}).click();return panel;};
 try{
  const q=new URLSearchParams(require('./cases.json')[0].query);q.delete('autoEnvironment');await page.goto('http://localhost:3001/explore?'+q);await ready();let panel=await open();
  await Promise.all([page.waitForURL(/autoEnvironment=bounded-auto-v1/),page.getByLabel('Environment selection',{exact:true}).selectOption('bounded-auto-v1')]);await ready();panel=await open();
  check('automatic control selects renderer at new location',(await panel.getByTestId('automatic-resolver-state').innerText()).includes('Automatic recipe · unreviewed'));
  check('renderer and UI agree',await page.evaluate(()=>window.__visual.s.userData.environmentSelection.mode==='automatic'&&window.__visual.s.userData.environmentSelection.automatic.ruleId==='woodland-europe'));
  check('no new artistic approval',await page.getByTestId('reference-checkpoint-state').count()===0);
  check('adapter-only tree inspection is unavailable',await page.getByRole('button',{name:'Inspect first tree'}).count()===0);
  const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Download scene recipe · JSON'}).click();await (await downloading).saveAs('artifacts/bounded-resolver/export.json');const exported=JSON.parse(fs.readFileSync('artifacts/bounded-resolver/export.json'));
  check('export includes decision, actual region and botanical country',exported.environmentSelection.automatic.ruleId==='woodland-europe'&&exported.environmentSelection.regional.site.lat===50.7&&exported.botanicalArea.code==='GER'&&exported.environmentSelection.pilot===null);
  await page.getByLabel('Scene seed',{exact:true}).fill('41');await page.getByRole('button',{name:'Apply seeds & density'}).click();await page.waitForFunction(()=>window.__visual?.s.userData.environmentSelection.regional?.inputSeed==='41',{},{timeout:180000});
  check('seed edits preserve automatic mode',new URL(page.url()).searchParams.get('autoEnvironment')==='bounded-auto-v1');
  const back=page.locator('.forest-back');check('back-to-map link preserves opt-in',(await back.getAttribute('href')).includes('autoEnvironment=bounded-auto-v1'));await back.click();
  const link=page.getByRole('link',{name:/Open Location/});await link.waitFor();check('map forwards automatic mode',(await link.getAttribute('href')).includes('autoEnvironment=bounded-auto-v1'));
  check('map makes opt-in visible',await page.getByText('Bounded automatic environment selection is on. Unsupported locations retain the existing fallback.').count()===1);
  await page.waitForFunction(()=>document.querySelector('.open-location')?.getAttribute('aria-disabled')==='false',{},{timeout:120000});await link.click();await ready();panel=await open();check('map-to-scene round trip retains automatic routing',(await panel.getByTestId('automatic-resolver-state').innerText()).includes('Automatic recipe · unreviewed'));
  await page.setViewportSize({width:390,height:844});check('mobile has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));check('automatic selector is touch sized',(await page.getByLabel('Environment selection',{exact:true}).boundingBox()).height>=44);await panel.getByTestId('automatic-resolver-state').screenshot({path:'artifacts/bounded-resolver/mobile-state.png'});
  await page.goto('http://localhost:3001/explore?lat=0&lon=-140&wind=0&autoEnvironment=bounded-auto-v1');await ready();panel=await open();check('ocean fallback is explained',(await panel.getByTestId('automatic-resolver-state').innerText()).includes('No supported terrestrial ecological context'));
  await page.setViewportSize({width:1280,height:850});await page.goto('http://localhost:3001'+referenceSceneUrl('temperate-woodland')+'&autoEnvironment=bounded-auto-v1');await ready();panel=await open();check('approved reference wins over automatic request',(await panel.getByTestId('automatic-resolver-state').innerText()).includes('accepted reference settings take priority'));check('reference checkpoint remains approved',await panel.getByTestId('reference-checkpoint-state').innerText()==='Approved checkpoint');
 }catch(error){check(String(error),false);}finally{await browser.close();fs.writeFileSync('artifacts/bounded-resolver/ui-validation.json',JSON.stringify({checks,errors},null,2));if(checks.some(c=>!c.pass)||errors.length)process.exitCode=1;}
})();
