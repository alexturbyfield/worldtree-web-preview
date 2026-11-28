require('tsx/cjs');const fs=require('fs'),{gunzipSync}=require('zlib');
const {lookup,tileKey}=require('../../src/lib/geography.ts'),{lookupBotanicalArea}=require('../../src/lib/botanical.ts'),{resolveVegetation}=require('../../src/lib/vegetation.ts'),{createSceneRecipe}=require('../../src/lib/forest/recipe.ts'),{resolveEnvironmentSelection}=require('../../src/lib/forest/environment-registry.ts');
const botanical=JSON.parse(fs.readFileSync('public/data/v08/botanical-countries.geojson','utf8'));
const points=[['oklahoma',36.7,-98.5],['pampas',-35.2,-61.2],['mongolia',47.2,107.2]];
const rows=points.map(([id,lat,lon])=>{
 const geography=lookup(lat,lon,JSON.parse(gunzipSync(fs.readFileSync(`public/data/resolve-2017/tiles/${tileKey(lat,lon)}.geojson.gz`))))??null,botanicalArea=lookupBotanicalArea(lat,lon,botanical);
 const profile=resolveVegetation({lat,lon,geography,botanicalArea,habitat:'grassland',seed:'grove-1'}),conditional=id==='oklahoma',recipe=createSceneRecipe(profile,{seed:'29',density:6,conditional,structureSeed:'grove-1',appearanceSeed:'garden',wind:false});
 const query=new URLSearchParams({lat:String(lat),lon:String(lon),habitat:'grassland',seed:'29',density:'36',structure:'grove-1',appearance:'garden',conditional:conditional?'1':'0',wind:'0',mode:'painterly',autoEnvironment:'bounded-auto-v1'});
 return {id,lat,lon,query:String(query),ecoregion:geography,botanicalArea,landCover:profile.landCover,palette:recipe.palette.map(t=>({scientificName:t.scientificName,sources:t.sources})),decision:resolveEnvironmentSelection(recipe,String(query)).automatic};
});fs.writeFileSync('artifacts/bounded-prairie/'+(process.argv[2]||'audit')+'.json',JSON.stringify(rows,null,2));console.log(rows.map(r=>({id:r.id,eco:r.ecoregion?.ECO_ID,realm:r.ecoregion?.REALM,area:r.botanicalArea?.code,plants:r.landCover?.length,palette:r.palette.map(t=>t.scientificName),status:r.decision?.status})));
