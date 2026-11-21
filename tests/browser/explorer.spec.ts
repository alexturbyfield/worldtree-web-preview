import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const scene='/explore?lat=47.6062&lon=-122.3321&habitat=forest&seed=42&density=24';
async function ready(page:Page){await expect(page.getByTestId('forest-stage')).toHaveAttribute('data-state','ready',{timeout:60000});}
async function recipeDownload(page:Page){const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download scene recipe'}).click();const download=await event;return JSON.parse(await readFile((await download.path())!,'utf8'));}
async function noOverflow(page:Page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
test('map → scene, picking, individual regeneration, direct link, scene controls and return',async({page,isMobile},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.getByRole('link',{name:'Open Location'})).toHaveAttribute('aria-disabled','false');
  await expect(page.locator('canvas.maplibregl-canvas')).toBeVisible();
  await noOverflow(page);
  await page.getByRole('link',{name:'Open Location'}).click();await ready(page);
  await expect(page).toHaveURL(/\/explore\?/);
  expect(Number(await page.getByTestId('forest-stage').getAttribute('data-calls'))).toBeLessThanOrEqual(10);
  expect(Number(await page.getByTestId('forest-stage').getAttribute('data-triangles'))).toBeGreaterThan(1000);
  const stage=page.getByTestId('forest-stage'),box=(await stage.boundingBox())!;
  // Real raycast picking, without consulting private renderer objects.
  let picked=false;
  for(const [x,y] of [[.5,.6],[.35,.65],[.7,.65],[.4,.5],[.6,.45],[.25,.55]]){
    if(isMobile)await page.touchscreen.tap(box.x+box.width*x,box.y+box.height*y);else await page.mouse.click(box.x+box.width*x,box.y+box.height*y);
    if(await page.getByTestId('selected-tree').count()){picked=true;break;}
  }
  expect(picked,'A visible procedural tree should be pickable through the canvas').toBe(true);
  const selected=page.getByTestId('selected-tree'),seed=await selected.getAttribute('data-individual-seed'),index=Number(await selected.getAttribute('data-tree-index'));
  await expect(selected).toContainText('Botanical height and crown traits remain unknown');
  const before=await recipeDownload(page);
  await page.getByRole('button',{name:'Regenerate this tree',exact:true}).click();await ready(page);
  await expect(selected).not.toHaveAttribute('data-individual-seed',seed!);
  const after=await recipeDownload(page);
  expect(after.trees[index].position).toEqual(before.trees[index].position);
  expect(after.trees.filter((t:{index:number})=>t.index!==index)).toEqual(before.trees.filter((t:{index:number})=>t.index!==index));
  const direct=page.url(),newSeed=await selected.getAttribute('data-individual-seed');
  await page.reload();await ready(page);
  const restored=await recipeDownload(page);expect(restored.trees[index].seed).toEqual(newSeed);expect(page.url()).toEqual(direct);
  await page.getByLabel('Scene seed',{exact:true}).fill('browser-study');
  await page.getByLabel('Design density',{exact:true}).fill('20');
  await page.getByRole('button',{name:'Apply seed & density'}).click();await ready(page);
  const changed=await recipeDownload(page);expect(changed.seed).toBe('browser-study');expect(changed.trees).toHaveLength(20);
  await page.getByRole('button',{name:'Regenerate scene',exact:true}).click();await ready(page);expect((await recipeDownload(page)).seed).not.toBe(changed.seed);
  await page.getByRole('button',{name:'Inspect first tree',exact:true}).click();await expect(selected).toBeVisible();
  await noOverflow(page);await page.screenshot({path:`test-results/v09-${info.project.name}-inspector.png`,fullPage:true});
  await page.getByRole('link',{name:'Back to map'}).click();
  await expect(page.getByRole('heading',{name:'Seattle',exact:true})).toBeVisible();await expect(page.getByLabel('Habitat',{exact:true})).toHaveValue('forest');
  expect(errors).toEqual([]);
});
test('real orbit gestures, distance LOD and responsive viewport',async({page,isMobile},info)=>{
  await page.goto(scene);await ready(page);const stage=page.getByTestId('forest-stage'),initial=await stage.getAttribute('data-camera');
  const box=(await stage.boundingBox())!;
  if(isMobile){
    const cdp=await page.context().newCDPSession(page),x=box.x+box.width*.5,y=box.y+box.height*.65;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+i*9,y:y-i*2}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect(stage).not.toHaveAttribute('data-camera',initial!);
    const beforePinch=await stage.getAttribute('data-camera');
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-60,y},{x:x+60,y}]});
    for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-60+i*5,y},{x:x+60-i*5,y}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(stage).not.toHaveAttribute('data-camera',beforePinch!);await cdp.detach();
  }else{
    await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.6,box.y+box.height*.55,{steps:8});await page.mouse.up();await expect(stage).not.toHaveAttribute('data-camera',initial!);
    await page.mouse.wheel(0,1800);await expect(stage).toHaveAttribute('data-lod','distant');
  }
  await noOverflow(page);await page.screenshot({path:`test-results/v09-${info.project.name}-forest.png`,fullPage:true});
});
test('Atlanta and Tokyo ecology stays regional; unsupported and treeless locations stay empty',async({page})=>{
  for(const [lat,lon,name] of [[33.749,-84.388,'Atlanta'],[35.6762,139.6503,'Tokyo']] as const){await page.goto(`/explore?lat=${lat}&lon=${lon}&seed=42&density=20`);await ready(page);const r=await recipeDownload(page);expect(r.trees,name).toHaveLength(20);expect(r.evidenceLevel).toBe('documented_regional_range');expect(r.trees.every((t:{species:{confidence:string}})=>t.species.confidence==='regional')).toBe(true);}
  for(const [lat,lon] of [[25,-140],[73,-100],[25,10]]){await page.goto(`/explore?lat=${lat}&lon=${lon}&seed=42&density=20`);await ready(page);await expect(page.getByText('No tree palette generated',{exact:true})).toBeVisible();expect((await recipeDownload(page)).trees).toHaveLength(0);}
});
test('invalid links and unavailable WebGL have useful accessible failure states',async({page})=>{
  await page.goto('/explore?lat=999&lon=0');await expect(page.locator('main').getByRole('alert')).toContainText('valid latitude');await expect(page.locator('canvas')).toHaveCount(0);
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,kind:string,...args:unknown[]){if(kind==='webgl2'||kind==='webgl')return null;return original.apply(this,[kind,...args] as Parameters<typeof original>);} as typeof original;});
  await page.goto(scene);await expect(page.locator('main').getByRole('alert')).toContainText('3D view unavailable');expect((await recipeDownload(page)).trees).toHaveLength(24);
});
