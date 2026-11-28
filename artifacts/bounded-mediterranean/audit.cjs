require('tsx/cjs');const fs=require('fs'),{gunzipSync}=require('zlib');
const {lookup,tileKey}=require('../../src/lib/geography.ts'),{lookupBotanicalArea}=require('../../src/lib/botanical.ts'),{resolveVegetation}=require('../../src/lib/vegetation.ts'),{createSceneRecipe}=require('../../src/lib/forest/recipe.ts'),{resolveEnvironmentSelection}=require('../../src/lib/forest/environment-registry.ts');
const botanical=JSON.parse(fs.readFileSync('public/data/v08/botanical-countries.geojson','utf8'));
const points=[['france',43.85,3.75],['portugal',38.5,-8.4],['italy',42.8,12.1]];
const rows=points.map(([id,lat,lon])=>{
 const geography=lookup(lat,lon,JSON.parse(gunzipSync(fs.readFileSync(`public/data/resolve-2017/tiles/${tileKey(lat,lon)}.geojson.gz`))))??null,botanicalArea=lookupBotanicalArea(lat,lon,botanical);
 const profile=resolveVegetation({lat,lon,geography,botanicalArea,habitat:'forest',seed:'mediterranean-1'}),recipe=createSceneRecipe(profile,{seed:'29',density:36,structureSeed:'mediterranean-1',appearanceSeed:'garden',wind:false});
 const query=new URLSearchParams({lat:String(lat),lon:String(lon),habitat:'forest',seed:'29',density:'36',structure:'mediterranean-1',appearance:'garden',wind:'0',mode:'painterly',autoEnvironment:'bounded-auto-v1'});
 return {id,lat,lon,query:String(query),ecoregion:geography,botanicalArea,palette:recipe.palette.map(t=>({scientificName:t.scientificName,sources:t.sources})),drawableNames:[...new Set(recipe.trees.map(t=>t.species.scientificName))],decision:resolveEnvironmentSelection(recipe,String(query)).automatic};
});fs.writeFileSync(__dirname+'/'+(process.argv[2]||'audit')+'.json',JSON.stringify(rows,null,2));console.log(rows.map(r=>({id:r.id,eco:r.ecoregion?.ECO_ID,realm:r.ecoregion?.REALM,area:r.botanicalArea?.code,oak:r.palette.filter(t=>/^Quercus (ilex|suber)$/.test(t.scientificName)),drawable:r.drawableNames,status:r.decision?.status})));
