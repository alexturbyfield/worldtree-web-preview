import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
async function ready(page:Page){await expect(page.getByTestId('forest-stage')).toHaveAttribute('data-state','ready',{timeout:60000});}
async function recipe(page:Page){const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download tree recipe'}).click();return JSON.parse(await readFile((await (await event).path())!,'utf8'));}
test('botanical cutouts replace all crown masses; several seeds retain species identity',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  for(const species of ['douglas','oak','pine','spruce','acacia'])for(const seed of ['17','29']){
    await page.goto(`/lab?species=${species}&structure=${seed}&appearance=moss&wind=0`);await ready(page);
    const stage=page.getByTestId('forest-stage');await expect(stage).toHaveAttribute('data-foliage-masses','0');expect(Number(await stage.getAttribute('data-foliage-cards'))).toBeGreaterThan(40);
    const r=await recipe(page);const allowed=species==='douglas'?[0,5]:species==='spruce'?[2]:species==='pine'?[1]:species==='acacia'?[7]:[3,4,6];expect(r.trees[0].foliageCards.every((c:{tile:number})=>allowed.includes(c.tile))).toBe(true);
    if(seed==='29'&&['douglas','oak'].includes(species)){await page.getByRole('button',{name:'Close-up foliage',exact:true}).click();await page.screenshot({path:`test-results/v11-${info.project.name}-${species}-closeup.png`});await page.getByRole('button',{name:'Whole tree',exact:true}).click();}
  }
  expect(errors).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test('appearance recolours atlas pixels without moving cards or altering alpha silhouettes',async({page})=>{
  await page.goto('/lab?species=douglas&structure=29&appearance=moss&wind=0');await ready(page);
  const before=await recipe(page),atlas=page.getByTestId('foliage-atlas');
  const pixels=()=>atlas.evaluate((canvas:HTMLCanvasElement)=>{const p=canvas.getContext('2d')!.getImageData(0,0,canvas.width,canvas.height).data;let alpha=2166136261,rgb=2166136261,opaque=0,clear=0;for(let i=0;i<p.length;i++){if(i%4===3){alpha=Math.imul(alpha^p[i],16777619);if(p[i]===0)clear++;if(p[i]>240)opaque++;}else rgb=Math.imul(rgb^p[i],16777619);}return {alpha:alpha>>>0,rgb:rgb>>>0,opaque,clear};});
  const a=await pixels();expect(a.opaque).toBeGreaterThan(10000);expect(a.clear).toBeGreaterThan(a.opaque);
  await page.getByLabel('Appearance seed',{exact:true}).fill('copper');await expect(page.getByTestId('tree-laboratory')).toHaveAttribute('data-appearance-seed','copper');await ready(page);
  const after=await recipe(page),b=await pixels();expect(b.alpha).toBe(a.alpha);expect(b.rgb).not.toBe(a.rgb);expect(after.trees[0].model.segments).toEqual(before.trees[0].model.segments);
  const geometry=(cards:{color:string}[])=>cards.map(({color,...rest})=>{expect(color).toMatch(/^#/);return rest;});expect(geometry(after.trees[0].foliageCards)).toEqual(geometry(before.trees[0].foliageCards));
  await page.getByLabel('Debug view',{exact:true}).selectOption('cards');await expect(page.getByTestId('forest-stage')).toHaveAttribute('data-debug','cards');await ready(page);
});
test('Performance reduces cards, Diagram retains masses, wind and detail controls work',async({page})=>{
  await page.goto('/lab?species=douglas&structure=29&wind=0');await ready(page);const stage=page.getByTestId('forest-stage'),count=Number(await stage.getAttribute('data-foliage-cards'));
  await page.getByLabel('Renderer',{exact:true}).selectOption('performance');await expect(stage).toHaveAttribute('data-mode','performance');await ready(page);expect(Number(await stage.getAttribute('data-foliage-cards'))).toBeLessThan(count);await expect(stage).toHaveAttribute('data-foliage-masses','0');
  await page.getByLabel('Renderer',{exact:true}).selectOption('diagram');await expect(stage).toHaveAttribute('data-mode','diagram');await ready(page);expect(Number(await stage.getAttribute('data-foliage-masses'))).toBeGreaterThan(0);
  await page.getByLabel('Renderer',{exact:true}).selectOption('painterly');await expect(stage).toHaveAttribute('data-mode','painterly');await ready(page);
  await page.getByLabel('Foliage detail',{exact:true}).fill('0.1');await expect(page).toHaveURL(/foliageDetail=0.1/);await ready(page);expect(Number(await stage.getAttribute('data-foliage-cards'))).toBeLessThan(count);
  await page.getByLabel('Subtle foliage wind',{exact:true}).check();await expect(stage).toHaveAttribute('data-wind','true');const build=await stage.getAttribute('data-build-ms');await expect(stage).toHaveAttribute('data-build-ms',build!);
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await ready(page);await expect(stage).toHaveAttribute('data-wind','false');
});
