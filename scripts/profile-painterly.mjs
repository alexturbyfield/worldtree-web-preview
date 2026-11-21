import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin=new URL(process.argv[2]??'http://127.0.0.1:3001').origin;
const output='public/showcase/v1.0';await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const measurements=[];
async function ready(page){await page.locator('[data-testid="forest-stage"][data-state="ready"]').waitFor({timeout:60000});}
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
  page.on('pageerror',error=>{throw error;});
  for(const structure of ['17','29','86']){
    await page.goto(`${origin}/lab?species=oak&structure=${structure}&appearance=moss`);await ready(page);
    await page.screenshot({path:`${output}/oak-seed-${structure}.png`});
  }
  await page.goto(`${origin}/lab?species=oak&structure=17&appearance=copper`);await ready(page);await page.screenshot({path:`${output}/oak-seed-17-pigments-copper.png`});
  await page.goto(`${origin}/lab?species=douglas&structure=29&appearance=moss`);await ready(page);await page.screenshot({path:`${output}/douglas-fir-seed-29.png`});
  await context.close();
  for(const [name,mobile,count] of [['desktop-forest-48',false,48],['mobile-forest-30',true,30],['mobile-forest-36',true,36],['mobile-forest-60',true,60]]){
    const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
    const page=await context.newPage();const start=performance.now();
    await page.goto(`${origin}/explore?lat=47.6062&lon=-122.3321&density=${count}&seed=42&structure=grove-1&appearance=pigment-1&mode=painterly`);await ready(page);
    const navigationToReadyMs=performance.now()-start,buildMs=Number(await page.getByTestId('forest-stage').getAttribute('data-build-ms'));
    if(count===48||count===36)await page.screenshot({path:`${output}/${name}.png`});
    await page.getByRole('button',{name:'Profile 5s orbit',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('[data-testid="forest-stage"]')?.dataset.benchmark,null,{timeout:45000});
    const result=JSON.parse(await page.getByTestId('forest-stage').getAttribute('data-benchmark'));
    measurements.push({name,requestedTrees:count,displayedTrees:Number(await page.locator('.forest-count b').innerText()),navigationToReadyMs,buildMs,...result});
    console.log(`${name}: ${result.fps.toFixed(1)} fps, p95 ${result.p95FrameMs.toFixed(1)} ms, ${result.calls} calls, ${result.triangles} triangles`);
    await context.close();
  }
  const report={schemaVersion:'1.0.0',measuredAt:new Date().toISOString(),browser:browser.version(),origin,method:'Sequential 5 second continuous orbit per case. Headless Chromium with SwiftShader allowed. Actual renderer is recorded per case. CPU render submission and browser frame timing are not GPU timings. Mobile uses 390 x 844 emulation, not a physical Android device. Fresh browser context per case; navigation readiness includes network and compilation.',measurements};
  await writeFile(`${output}/performance.json`,JSON.stringify(report,null,2)+'\n');
}finally{await browser.close();}
