import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
async function ready(page:Page){await expect(page.getByTestId('studio-stage')).toHaveAttribute('data-state','ready',{timeout:60000});}
const metrics=(page:Page)=>page.getByTestId('studio-stage').evaluate(e=>JSON.parse(e.getAttribute('data-metrics')!));
test('studio comparison, all controls, stable direct links and zero-density empty foliage',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/studio?view=all');await ready(page);const initial=await metrics(page);expect(initial.groups).toBe(3);expect(initial.calls).toBeLessThanOrEqual(3);
  await page.getByRole('button',{name:'Branch studies',exact:true}).click();await expect(page).toHaveURL(/mode=trees/);await ready(page);expect((await metrics(page)).groups).toBeGreaterThan(3);
  await page.getByRole('button',{name:'Foliage groups',exact:true}).click();await expect(page).toHaveURL(/mode=groups/);await ready(page);
  for(const [label,key,value] of [['Cluster size','size','1.4'],['Cluster density','density','0.95'],['Layer overlap','overlap','0.9'],['Leaf silhouette detail','detail','0.5'],['Color variation','colorVariation','0.2']]){await page.getByLabel(label,{exact:true}).fill(value);await expect(page).toHaveURL(new RegExp(key+'='+value));await ready(page);}
  await page.getByLabel('Cluster density',{exact:true}).fill('0');await expect(page).toHaveURL(/density=0(?:&|$)/);await ready(page);expect((await metrics(page)).surfaces).toBe(0);
  await page.getByLabel('Cluster density',{exact:true}).fill('0.75');await expect(page).toHaveURL(/density=0.75/);await ready(page);const current=page.url(),count=(await metrics(page)).surfaces;await page.reload();await ready(page);expect(page.url()).toBe(current);expect((await metrics(page)).surfaces).toBe(count);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
test('studio atlas distinguishes leaves, blossoms and needles; appearance changes preserve alpha',async({page})=>{
  await page.goto('/studio?view=flower');await ready(page);const canvas=page.getByTestId('studio-atlas');
  const pixels=()=>canvas.evaluate((c:HTMLCanvasElement)=>{const data=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;let alpha=2166136261,rgb=2166136261,clear=0,solid=0;for(let i=0;i<data.length;i++){if(i%4===3){alpha=Math.imul(alpha^data[i],16777619);if(!data[i])clear++;if(data[i]>200)solid++;}else rgb=Math.imul(rgb^data[i],16777619);}return {alpha:alpha>>>0,rgb:rgb>>>0,clear,solid};});
  const before=await pixels();expect(before.clear).toBeGreaterThan(10000);expect(before.solid).toBeGreaterThan(1000);
  await page.getByLabel('Studio appearance seed').fill('orchard');await expect(page).toHaveURL(/appearance=orchard/);await ready(page);const after=await pixels();expect(after.alpha).toBe(before.alpha);expect(after.rgb).not.toBe(before.rgb);
  await page.getByRole('button',{name:'Douglas-fir',exact:true}).click();await expect(page).toHaveURL(/view=conifer/);await ready(page);
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download study · JSON',exact:true}).click();const exported=JSON.parse(await readFile((await (await download).path())!,'utf8'));expect(exported.settings.view).toBe('conifer');expect(exported.settings.appearance).toBe('orchard');expect(exported.source).toContain('no geographic');
});
test('studio orbit and pinch/wheel operate the actual 3D canvas',async({page,isMobile})=>{
  await page.goto('/studio?view=broadleaf');await ready(page);const canvas=page.locator('.studio-canvas canvas'),before=await canvas.screenshot(),box=(await canvas.boundingBox())!,x=box.x+box.width*.5,y=box.y+box.height*.5;
  if(isMobile){const cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+i*8,y:y-i*2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}else{await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+80,y+20,{steps:8});await page.mouse.up();await page.mouse.wheel(0,-250);}
  expect((await canvas.screenshot()).equals(before)).toBe(false);
});
test('studio measures frame time and alpha overdraw without replacing the forest',async({page})=>{
  await page.goto('/studio?view=conifer');await ready(page);const initial=await metrics(page);await page.getByRole('button',{name:'Measure frame time & overdraw',exact:true}).click();await expect.poll(async()=>!!(await metrics(page)).fill,{timeout:45000}).toBe(true);const m=await metrics(page);
  expect(m.fps).toBeGreaterThan(0);expect(m.p95FrameMs).toBeGreaterThan(0);expect(m.fill.meanLayers).toBeGreaterThan(1);expect(m.fill.meanQuadLayers).toBeGreaterThanOrEqual(m.fill.meanLayers);expect(m.fill.alphaRejectedFraction).toBeGreaterThan(0);expect(m.fill.alphaRejectedFraction).toBeLessThan(1);expect(m.fill.saturatedPixels).toBe(0);expect(m.fill.quadSaturatedPixels).toBe(0);expect(m.buildMs).toBe(initial.buildMs);expect(m.fill.method).toContain('Not hardware');
  await expect(page.getByText('Awaiting visual approval.',{exact:false})).toBeVisible();
});
test('invalid studio links and unavailable WebGL report accessible errors',async({page})=>{
  await page.goto('/studio?density=NaN');await expect(page.locator('main').getByRole('alert')).toContainText('supported range');await expect(page.locator('.studio-canvas canvas')).toHaveCount(0);
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){if(type==='webgl'||type==='webgl2')return null;return original.apply(this,[type,...args] as Parameters<typeof original>);} as typeof original;});
  await page.goto('/studio?view=broadleaf');await expect(page.locator('main').getByRole('alert')).toContainText('WebGL2 could not start');
});
