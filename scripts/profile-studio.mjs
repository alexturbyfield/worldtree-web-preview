import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const origin=new URL(process.argv[2]??'http://127.0.0.1:3001').origin,output='public/showcase/foliage-studio';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const errors=[],measurements=[];
const ready=p=>p.locator('[data-testid="studio-stage"][data-state="ready"]').waitFor({timeout:60000});
try{
  for(const [name,mobile,view,mode] of [['comparison-groups',false,'all','groups'],['comparison-trees',false,'all','trees'],['broadleaf-group',false,'broadleaf','groups'],['blossom-group',false,'flower','groups'],['fir-spray',false,'conifer','groups'],['mobile-broadleaf',true,'broadleaf','groups'],['mobile-blossom',true,'flower','groups'],['mobile-fir',true,'conifer','groups'],['mobile-fir-tree',true,'conifer','trees']]){
    const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1100},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1}),p=await context.newPage();
    p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/THREE|Shader Error/.test(m.text()))errors.push(m.text());});
    await p.goto(`${origin}/studio?view=${view}&mode=${mode}&structure=29&appearance=garden`);await ready(p);await p.screenshot({path:`${output}/${name}.png`});
    if(!mobile&&mode==='groups'&&view!=='all'){
      for(const seed of ['17','86']){await p.goto(`${origin}/studio?view=${view}&mode=${mode}&structure=${seed}&appearance=garden`);await ready(p);await p.screenshot({path:`${output}/${name}-seed-${seed}.png`});}
      await p.goto(`${origin}/studio?view=${view}&mode=${mode}&structure=29&appearance=garden`);await ready(p);
    }
    await p.getByRole('button',{name:'Measure frame time & overdraw',exact:true}).click();await p.waitForFunction(()=>JSON.parse(document.querySelector('[data-testid="studio-stage"]')?.dataset.metrics??'{}').fill,null,{timeout:60000});
    const data=JSON.parse(await p.getByTestId('studio-stage').getAttribute('data-metrics'));
    if(!Number.isFinite(data.fill.meanLayers)||data.fill.meanLayers<=0||data.fill.saturatedPixels||data.fill.quadSaturatedPixels)throw Error('Invalid/capped fill measurement '+name);
    measurements.push({name,mobile,view,mode,...data});
    const heat=await p.locator('.studio-heatmap').getAttribute('src');await writeFile(`${output}/${name}-overdraw.png`,Buffer.from(heat.split(',')[1],'base64'));
    if(name==='broadleaf-group'){const png=await p.getByTestId('studio-atlas').evaluate(c=>c.toDataURL().split(',')[1]);await writeFile(`${output}/foliage-atlas.png`,Buffer.from(png,'base64'));}
    console.log(`${name}: ${data.fps.toFixed(1)} fps; p95 ${data.p95FrameMs.toFixed(1)} ms; ${data.fill.meanLayers.toFixed(2)} alpha layers; ${(data.fill.alphaRejectedFraction*100).toFixed(1)}% quad rejection; ${data.calls} draws; ${data.triangles} triangles`);
    await context.close();
  }
  if(errors.length)throw Error(errors.join('\n'));
  await writeFile(`${output}/performance.json`,JSON.stringify({measuredAt:new Date().toISOString(),browser:browser.version(),origin,method:'Sequential 5-second continuous orbits with the 3D canvas scrolled into view. Main-pass draws/triangles; CPU submission is not GPU timing. Overdraw is a separate depth-disabled alpha coverage raster at 160px width, not hardware fragment invocations. Readback excluded from orbit frame times. Mobile is 390 x 844 touch emulation, not physical Android.',measurements,errors},null,2)+'\n');
  await writeFile(`${output}/reference-comparison.json`,JSON.stringify({references:'Three user-supplied images; kept private, not redistributed.',comparisons:[{reference:1,priority:'Soft layered green and pink crowns, dark interiors, bright outer leaves',implemented:'Pointed oval leaf fans and five-petal blossom clusters on curved overlapping patches; cool interior shading and warm highlights.',limits:'No garden environment, grass, bloom or atmospheric lighting is reproduced.'},{reference:2,priority:'Distinct full tree silhouettes with visible botanical branching',implemented:'Three side-by-side group and branch studies; existing broadleaf and Douglas-fir skeletons preserved.',limits:'The broadleaf and flowering studies share a generic oak skeleton. Blossoms do not identify an oak species or actual flowering behavior. Some patch repetition remains.'},{reference:3,priority:'Horizontal conifer tiers and hanging feathered needle sprays',implemented:'Fir sprays follow source branch directions, with tapered branchlet atlases and downward curvature.',limits:'Needle density, taper and bark remain artist-directed. The silhouette is coarser and more regular than the supplied fir reference.'}],status:'Prototype for user visual approval. Production forest renderer has not been modified.'},null,2)+'\n');
}finally{await browser.close();}
