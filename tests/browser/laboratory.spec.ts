import {test,expect,type Page} from '@playwright/test';
import {readFile} from 'node:fs/promises';
async function ready(page:Page){await expect(page.getByTestId('forest-stage')).toHaveAttribute('data-state','ready',{timeout:60000});}
async function downloadTree(page:Page){const waiting=page.waitForEvent('download');await page.getByRole('button',{name:'Download tree recipe'}).click();return JSON.parse(await readFile((await (await waiting).path())!,'utf8'));}
test('laboratory seed independence, controls, debug views, presets and Diagram fallback',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/lab?species=oak&structure=17&appearance=moss');await ready(page);
  const lab=page.getByTestId('tree-laboratory'),stage=page.getByTestId('forest-stage');
  const skeleton=await lab.getAttribute('data-structure-hash');
  await page.getByLabel('Appearance seed',{exact:true}).fill('copper');
  await expect(lab).toHaveAttribute('data-appearance-seed','copper');await ready(page);
  await expect(lab).toHaveAttribute('data-structure-hash',skeleton!);
  await page.getByLabel('Foliage density',{exact:true}).fill('0');
  await expect(page).toHaveURL(/foliageDensity=0(?:&|$)/);await ready(page);
  const bare=await downloadTree(page);expect(bare.trees[0].model.foliage).toHaveLength(0);await expect(lab).toHaveAttribute('data-structure-hash',skeleton!);
  await page.getByLabel('Foliage density',{exact:true}).fill('0.8');
  await page.getByLabel('Asymmetry',{exact:true}).fill('1');await expect(lab).not.toHaveAttribute('data-structure-hash',skeleton!);
  await page.getByLabel('Debug view',{exact:true}).selectOption('skeleton');await expect(stage).toHaveAttribute('data-debug','skeleton');await ready(page);
  await page.getByLabel('Debug view',{exact:true}).selectOption('wireframe');await expect(stage).toHaveAttribute('data-debug','wireframe');await ready(page);
  await page.getByLabel('Debug view',{exact:true}).selectOption('none');await expect(stage).toHaveAttribute('data-debug','none');
  for(const preset of ['spruce','pine','acacia','douglas']){await page.getByLabel('Species preset').selectOption(preset);await expect(page).toHaveURL(new RegExp('species='+preset));await ready(page);expect(Number(await stage.getAttribute('data-triangles'))).toBeGreaterThan(500);}
  await page.getByLabel('Renderer',{exact:true}).selectOption('diagram');await expect(stage).toHaveAttribute('data-mode','diagram');await ready(page);
  await page.getByLabel('Renderer',{exact:true}).selectOption('painterly');await expect(stage).toHaveAttribute('data-mode','painterly');await ready(page);
  const recipe=await downloadTree(page);expect(recipe.location).toBeNull();expect(recipe.trees[0].species.confidence).toBe('visual design only');
  const last=await lab.getAttribute('data-structure-hash');await page.getByRole('button',{name:'Regenerate tree',exact:true}).click();await expect(lab).not.toHaveAttribute('data-structure-hash',last!);await ready(page);
  const link=page.url(),hash=await lab.getAttribute('data-structure-hash');await page.reload();await ready(page);await expect(lab).toHaveAttribute('data-structure-hash',hash!);expect(page.url()).toBe(link);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.screenshot({path:`test-results/v10-${info.project.name}-laboratory.png`,fullPage:true});expect(errors).toEqual([]);
});
test('forest rendering modes preserve ecology; live profiling does not rebuild geometry',async({page})=>{
  await page.goto('/explore?lat=47.6062&lon=-122.3321&density=36&seed=42');await ready(page);
  const stage=page.getByTestId('forest-stage'),initialBuild=await stage.getAttribute('data-build-ms');
  await page.getByRole('button',{name:'Profile 5s orbit',exact:true}).click();
  await expect(page.getByTestId('benchmark-result')).toBeVisible({timeout:30000});
  const result=JSON.parse((await stage.getAttribute('data-benchmark'))!);expect(result.frames).toBeGreaterThan(0);expect(result.durationMs).toBeGreaterThanOrEqual(5000);expect(result.renderer).toBeTruthy();expect(result.fps).toBeGreaterThan(0);
  await expect(stage).toHaveAttribute('data-build-ms',initialBuild!);
  const read=async()=>{const waiting=page.waitForEvent('download');await page.getByRole('button',{name:'Download scene recipe'}).click();return JSON.parse(await readFile((await (await waiting).path())!,'utf8'));};
  const painted=await read();await page.getByLabel('Forest renderer').selectOption('diagram');await expect(stage).toHaveAttribute('data-mode','diagram');await ready(page);const diagram=await read();
  expect(diagram.evidenceLevel).toEqual(painted.evidenceLevel);expect(diagram.trees.map((t:{species:unknown})=>t.species)).toEqual(painted.trees.map((t:{species:unknown})=>t.species));expect(diagram.trees.map((t:{position:unknown})=>t.position)).toEqual(painted.trees.map((t:{position:unknown})=>t.position));
});
