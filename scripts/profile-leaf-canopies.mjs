import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const origin=new URL(process.argv[2]??'http://127.0.0.1:3001').origin;
const baseline='https://worldtree-web-preview-av6sk0w7p-alex-turbyfield.vercel.app',output='public/showcase/leaf-canopies';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const measurements=[],views=[],errors=[];
const hash=value=>createHash('sha256').update(value).digest('hex');
const watch=page=>{page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|Shader Error|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});};
const ready=page=>page.locator('[data-testid="forest-stage"][data-state="ready"]').waitFor({timeout:60000});
try{
  const study=await browser.newPage({viewport:{width:900,height:800}});watch(study);
  let structuralHash;
  for(const before of [true,false]){
    await study.goto('http://127.0.0.1:3002/'+(before?'?before=1':''));await study.waitForFunction(()=>document.body.dataset.ready);
    for(let view=0;view<(before?1:4);view++){
      await study.evaluate(view=>window.canopyStudy.view(view*Math.PI/2),view);
      const result=await study.evaluate(async()=>{
        const s=window.canopyStudy,image=new Image();image.src=s.pixels();await image.decode();
        const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);const p=ctx.getImageData(0,0,c.width,c.height).data;
        let all=0,covered=0;const luminance=[];
        for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(((x/c.width-.5)/.18)**2+((y/c.height-.5)/.14)**2<1){all++;const i=(y*c.width+x)*4;if(p[i+3]>128){covered++;luminance.push(p[i]*.2126+p[i+1]*.7152+p[i+2]*.0722);}}
        luminance.sort((a,b)=>a-b);
        return {...s.stats(),centralCoverage:covered/all,luminanceP10:luminance[Math.floor(luminance.length*.1)],luminanceP90:luminance[Math.floor(luminance.length*.9)],geometry:JSON.stringify(s.cards)};
      });
      if(result.opaqueScaffoldMeshes!==(before?1:0))throw Error('Visible scaffold count is incorrect');
      if(!before&&result.centralCoverage<.9)throw Error('Large central gap: '+result.centralCoverage);
      if(!before&&result.luminanceP90<result.luminanceP10*1.5)throw Error('Insufficient rounded light-to-dark shading');
      structuralHash=hash(result.geometry);delete result.geometry;
      views.push({before,view,...result,structuralHash});
      await study.screenshot({path:`${output}/isolated-${before?'before':'after-'+view}.png`});
    }
  }
  await study.reload();await study.waitForFunction(()=>document.body.dataset.ready);
  if(hash(await study.evaluate(()=>JSON.stringify(window.canopyStudy.cards)))!==structuralHash)throw Error('Repeated seed altered geometry');
  await study.setViewportSize({width:390,height:844});await study.reload();await study.waitForFunction(()=>document.body.dataset.ready);await study.screenshot({path:`${output}/isolated-mobile.png`});await study.close();
  await writeFile(`${output}/isolated-validation.json`,JSON.stringify({views,errors,policy:'Coverage measures the central projected ellipse only, not every silhouette pixel. Four 90-degree views. Brightness percentiles check volume contrast, not photometric botanical accuracy. Identical geometry hash after reload.'},null,2)+'\n');
  const page=await browser.newPage({viewport:{width:1440,height:1000}});watch(page);
  for(const [version,base] of [['before',baseline],['after',origin]]){
    for(const species of ['oak','douglas','acacia']){
      await page.goto(`${base}/lab?species=${species}&structure=29&appearance=moss&wind=0`);await ready(page);await page.screenshot({path:`${output}/${version}-${species}.png`});
      if(version==='after'&&species==='oak'){await page.getByRole('button',{name:'Close-up foliage',exact:true}).click();await page.screenshot({path:`${output}/after-oak-closeup.png`});}
    }
  }await page.close();
  for(const [name,mobile,mode,count] of [['desktop-painterly-36',false,'painterly',36],['mobile-painterly-30',true,'painterly',30],['mobile-painterly-36',true,'painterly',36],['mobile-performance-36',true,'performance',36]]){
    for(const [version,base] of [['before',baseline],['after',origin]]){
      const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await context.newPage();watch(p);
      await p.goto(`${base}/explore?lat=47.6062&lon=-122.3321&density=${count}&seed=42&structure=grove-1&appearance=pigment-1&mode=${mode}&wind=1`);await ready(p);
      const stage=p.getByTestId('forest-stage');if(version==='after'&&Number(await stage.getAttribute('data-foliage-masses'))!==0)throw Error('Solid foliage in final forest');
      const buildMs=Number(await stage.getAttribute('data-build-ms'));
      await p.screenshot({path:`${output}/${version}-${name}.png`});
      await p.getByRole('button',{name:'Profile 5s orbit',exact:true}).click();await p.waitForFunction(()=>document.querySelector('[data-testid="forest-stage"]')?.dataset.benchmark,null,{timeout:60000});
      const result=JSON.parse(await stage.getAttribute('data-benchmark'));measurements.push({name,version,mode,trees:count,buildMs,...result});
      console.log(`${version} ${name}: ${result.fps.toFixed(1)} fps · ${result.calls} calls · ${result.triangles} triangles · ${result.foliageCards} cards · ${result.foliageMasses} solid clumps`);
      await context.close();
    }
  }
  if(errors.length)throw Error(errors.join('\n'));
  await writeFile(`${output}/performance.json`,JSON.stringify({browser:browser.version(),measuredAt:new Date().toISOString(),origin,baseline,method:'Sequential before/after 5 second orbit pairs, same scene seeds/camera/density, wind on. Main-pass draw calls/triangles. Chromium SwiftShader, mobile 390 x 844 emulation, not a physical Android benchmark. CPU submission is not GPU timing.',measurements,errors},null,2)+'\n');
}finally{await browser.close();}
