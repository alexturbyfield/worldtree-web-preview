// Run with the local app on port 3001: npm run dev -- --port 3001
const {chromium}=require('playwright'),{build}=require('esbuild'),sharp=require('sharp'),fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const base=process.env.WILDLOOM_PREVIEW||'http://localhost:3001';
const query='/explore?lat=47.6062&lon=-122.3321&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=';
const output='artifacts/wildloom-foundation-';
const studiesOnly=process.argv.includes('--studies-only');
const save=(name,data)=>fs.writeFileSync(output+name+'.png',Buffer.from(data.split(',')[1],'base64'));
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
async function sheet(name,width,height,title,subtitle,images,labels=[]){
  const svg=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#edf0e7"/><g font-family="Arial" fill="#263e35"><text x="25" y="36" font-size="25">${title}</text><text x="25" y="69" font-size="17">${subtitle}</text>${labels.map(l=>`<text x="${l.x}" y="${l.y}" font-size="20">${l.text}</text>`).join('')}</g></svg>`);
  await sharp(svg).composite(images).png().toFile(output+name+'.png');
}
(async()=>{
  fs.mkdirSync('artifacts',{recursive:true});fs.mkdirSync('.vercel',{recursive:true});
  await build({entryPoints:['scripts/studies/environment-foundations.ts'],bundle:true,format:'iife',platform:'browser',outfile:'.vercel/environment-foundations.js'});
  const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
  const report={preview:base+query+'human',views:[],checks:{},studies:[],caveats:['Desktop Chromium / SwiftShader software rasterizer; not a physical mobile GPU benchmark.','Grass uses alpha masking, no cast shadows; renderer counters include submitted instances even when shader distance-culling removes them.','Focal emphasis is a soft world-space ellipsoid; overlapping crowns can share some emphasis.','No generators, species selection, structural/appearance/scene seeds, leaf atlases, terrain heights, composition or cameras were changed.']};
  let recipe=studiesOnly?JSON.parse(fs.readFileSync('.vercel/foundation-recipe.json')):undefined;
  if(studiesOnly)Object.assign(report,JSON.parse(fs.readFileSync(output+'report.json')),{studies:[]});
  for(const view of studiesOnly?[]:['human','inspection']){
    const page=await browser.newPage({viewport:{width:1600,height:1050}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.addInitScript(()=>{window.__THREE_DEVTOOLS__=new EventTarget();window.__THREE_DEVTOOLS__.addEventListener('observe',e=>{const renderer=e.detail;if(!renderer.isWebGLRenderer)return;const render=renderer.render;renderer.render=function(scene,camera){window.foundationCapture={renderer:this,scene,camera};return render.call(this,scene,camera);};});});
    await page.goto(base+query+view,{timeout:120000});
    await page.locator('[data-testid=forest-stage]:is([data-state=ready],[data-state=error])').waitFor({timeout:90000});assert.equal(await page.getByTestId('forest-stage').getAttribute('data-state'),'ready',await page.getByTestId('forest-stage').innerText());await page.waitForTimeout(1400);
    const state=await page.evaluate(()=>{const {renderer,scene,camera}=window.foundationCapture;renderer.render(scene,camera);const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,environment:scene.userData.environment,renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),pixelRatio:renderer.getPixelRatio(),shadows:renderer.shadowMap.enabled,shadowSizes:scene.children.filter(o=>o.isLight&&o.castShadow).map(o=>o.shadow.mapSize.toArray()),camera:camera.position.toArray(),target:camera.getWorldDirection(new camera.position.constructor()).toArray(),viewport:[renderer.domElement.clientWidth,renderer.domElement.clientHeight]};});
    await page.locator('.forest-canvas-host canvas').screenshot({path:output+(view==='human'?'integrated-puget':'inspection')+'.png'});
    if(view==='human'){
      const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:/Download scene recipe/}).click()]);await download.saveAs('.vercel/foundation-recipe.json');recipe=JSON.parse(fs.readFileSync('.vercel/foundation-recipe.json'));
      await page.getByRole('button',{name:'Profile 5s orbit'}).click();await page.getByTestId('benchmark-result').waitFor({timeout:90000});state.benchmark=JSON.parse(await page.getByTestId('forest-stage').getAttribute('data-benchmark'));
    }
    report.views.push({view,...state,errors});assert.deepEqual(errors,[]);await page.close();
  }
  if(fs.existsSync('.vercel/encounter-encounter.json')){
    const before=JSON.parse(fs.readFileSync('.vercel/encounter-encounter.json'));
    const preserved=r=>({trees:r.trees,palette:r.palette,seed:r.seed,structureSeed:r.structureSeed,appearanceSeed:r.appearanceSeed,encounter:r.encounter,terrain:r.terrain});
    assert.equal(hash(preserved(recipe)),hash(preserved(before)));report.checks.existingEncounterRecipeUnchanged=true;
  }
  const studyRecipe={encounter:recipe.encounter,seed:recipe.seed,appearanceSeed:recipe.appearanceSeed,trees:['maple','douglas-v1'].map(id=>recipe.trees.find(t=>t.model.presetId===id&&t.studio))};
  const page=await browser.newPage({viewport:{width:1600,height:1050}}),studyErrors=[];page.on('pageerror',e=>studyErrors.push(e.message));page.on('console',m=>{if(m.type()==='error')studyErrors.push(m.text());});
  await page.setContent('<html><body style="margin:0"></body></html>');await page.addScriptTag({path:'.vercel/environment-foundations.js'});
  const preservation=await page.evaluate(recipe=>window.foundationStudy.preservation(recipe),studyRecipe);Object.assign(report.checks,preservation);assert(Object.values(preservation).every(Boolean));
  const assets=await page.evaluate(()=>window.foundationStudy.assets());
  save('ground-tile',assets.tile);save('ground-3x3-raw',assets.tiled);save('grass-atlas',assets.atlas);
  assert.equal(assets.edgeError,0);assert(assets.deterministicTile&&assets.deterministicAtlas);
  await sheet('ground-3x3',818,900,'PAINTERLY GROUND / 3 × 3 CONTINUOUS TILES','No gutters at joins · identical opposite edge pixels · 256 px tile / 7 m world repeat',[{input:Buffer.from(assets.tiled.split(',')[1],'base64'),left:25,top:100}]);
  delete assets.tile;delete assets.tiled;delete assets.atlas;report.checks.ground=assets;
  const grass=await page.evaluate(recipe=>window.foundationStudy.grass(recipe),studyRecipe);save('grass-close',grass.png);delete grass.png;
  const mobileGrass=await page.evaluate(recipe=>window.foundationStudy.grass(recipe,true),studyRecipe);delete mobileGrass.png;
  await sheet('grass-study',1150,960,'GRASS / PAINTERLY ATLAS → GPU INSTANCES','Four padded silhouettes · deterministic scale / yaw / lean / pigment · crossed near cards',[{input:await sharp(output+'grass-atlas.png').resize(768,192).toBuffer(),left:25,top:90},{input:Buffer.from(fs.readFileSync(output+'grass-close.png')),left:25,top:290}]);
  report.studies.push({kind:'grass-desktop',...grass},{kind:'grass-mobile-density',...mobileGrass});
  const treatments=[['FOREGROUND',8],['MIDGROUND',43],['BACKGROUND',88]],treeImages=[],labels=[];
  for(const [row,preset] of ['maple','douglas-v1'].entries()){
    const identities=[];
    for(const [column,[label,depth]] of treatments.entries()){
      const image=await page.evaluate(({recipe,preset,depth})=>window.foundationStudy.tree(recipe,preset,depth),{recipe:studyRecipe,preset,depth});
      save(`tree-${preset}-${label.toLowerCase()}`,image.png);treeImages.push({input:Buffer.from(image.png.split(',')[1],'base64'),left:column*560,top:130+row*725});delete image.png;identities.push(image.identity);report.studies.push({kind:'identical-tree',...image});
      labels.push({x:column*560+25,y:115+row*725,text:`${preset} / ${label}`});
    }
    assert(identities.every(i=>hash(i)===hash(identities[0])));
  }
  await sheet('tree-hierarchy',1680,1580,'TREE COLOR / IDENTICAL SPECIMENS, THREE SPATIAL TREATMENTS','Same geometry, seed, pigments, atlas, lighting, scale and camera in each row. Diagnostic depths: 8 / 43 / 88 m.',treeImages,labels);
  const focal=await page.evaluate(recipe=>window.foundationStudy.tree(recipe,'douglas-v1',88,1),studyRecipe);save('tree-focal-weight-1',focal.png);delete focal.png;report.studies.push({kind:'focal-weight',...focal});
  report.checks.identicalTreeGeometryAndSeeds=true;report.checks.studyErrors=studyErrors;assert.deepEqual(studyErrors,[]);
  report.implementation={source:['src/lib/forest/environment-foundations.ts','src/lib/forest/encounter.ts','src/lib/forest/painted-renderer.ts'],fallback:'mountPaintedForest(..., {environment:false}) restores the previous encounter dressing and tree colors. Baseline and Diagram are unchanged.',focal:'mountPaintedForest(..., {environment:{focal:{treeIndex:0,weight:0.8}}})',reproduce:'npm run dev -- --port 3001; node scripts/studies/capture-environment-foundations.cjs'};
  fs.writeFileSync(output+'report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify({views:report.views,ground:report.checks.ground,grass:report.studies.slice(0,2),studyErrors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
