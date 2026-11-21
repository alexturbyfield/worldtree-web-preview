import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin=new URL(process.argv[2]??'http://127.0.0.1:3001').origin,output='public/showcase/v1.1';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const measurements=[];
async function ready(page){await page.locator('[data-testid="forest-stage"][data-state="ready"]').waitFor({timeout:60000});}
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
  page.on('pageerror',error=>{throw error;});
  for(const species of ['douglas','oak']){
    await page.goto(`${origin}/lab?species=${species}&structure=29&appearance=moss&mode=diagram&wind=0`);await ready(page);await page.screenshot({path:`${output}/before-${species}-masses.png`});
    for(const seed of ['17','29','86']){
      await page.goto(`${origin}/lab?species=${species}&structure=${seed}&appearance=moss&mode=painterly&wind=0`);await ready(page);await page.screenshot({path:`${output}/after-${species}-seed-${seed}.png`});
      if(seed==='29'){
        await page.getByRole('button',{name:'Close-up foliage',exact:true}).click();await page.screenshot({path:`${output}/closeup-${species}.png`});
        if(species==='oak'){const base64=await page.getByTestId('foliage-atlas').evaluate(c=>c.toDataURL('image/png').split(',')[1]);await writeFile(`${output}/foliage-atlas.png`,Buffer.from(base64,'base64'));}
      }
    }
  }
  for(const species of ['pine','spruce']){await page.goto(`${origin}/lab?species=${species}&structure=29&appearance=moss&wind=0`);await ready(page);await page.getByRole('button',{name:'Close-up foliage',exact:true}).click();await page.screenshot({path:`${output}/closeup-${species}.png`});}
  await context.close();
  const cases=[['desktop-painterly-36',false,'painterly',36],['mobile-painterly-30',true,'painterly',30],['mobile-painterly-36',true,'painterly',36],['mobile-painterly-60',true,'painterly',60],['mobile-performance-36',true,'performance',36],['mobile-performance-60',true,'performance',60]];
  for(const [name,mobile,mode,count] of cases){
    const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
    const page=await context.newPage(),start=performance.now();
    await page.goto(`${origin}/explore?lat=47.6062&lon=-122.3321&density=${count}&seed=42&structure=grove-1&appearance=pigment-1&mode=${mode}&wind=1`);await ready(page);
    const navigationToReadyMs=performance.now()-start,stage=page.getByTestId('forest-stage'),buildMs=Number(await stage.getAttribute('data-build-ms'));
    if(Number(await stage.getAttribute('data-foliage-masses'))!==0)throw new Error('New foliage renderer contains masses');
    if(count===36)await page.screenshot({path:`${output}/${name}.png`});
    await page.getByRole('button',{name:'Profile 5s orbit',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[data-testid="forest-stage"]')?.dataset.benchmark,null,{timeout:45000});
    const result=JSON.parse(await stage.getAttribute('data-benchmark'));
    measurements.push({name,mode,wind:true,requestedTrees:count,displayedTrees:Number(await page.locator('.forest-count b').innerText()),navigationToReadyMs,buildMs,...result});
    console.log(`${name}: ${result.fps.toFixed(1)} fps · p95 ${result.p95FrameMs.toFixed(1)} ms · ${result.calls} calls · ${result.triangles} triangles · ${result.foliageCards} cards · ${result.foliageMasses} masses`);
    await context.close();
  }
  await writeFile(`${output}/performance.json`,JSON.stringify({schemaVersion:'1.1.0',measuredAt:new Date().toISOString(),browser:browser.version(),origin,method:'Sequential 5 second continuous orbit, wind enabled, fresh context per case. Actual GPU/renderer string and pixel ratio recorded. Mobile is 390 x 844 emulation, not a physical Android benchmark. CPU submission time is not GPU timing. Shader warm-up and network are included in navigation readiness, not orbit-only frame statistics.',measurements},null,2)+'\n');
}finally{await browser.close();}
