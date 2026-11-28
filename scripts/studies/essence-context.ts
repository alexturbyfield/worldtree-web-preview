// Temporary art-direction recipes. Uses the production forest renderer without changing it.
import {mountPaintedForest} from '../../src/lib/forest/painted-renderer';
import {sceneLibraryStudy} from '../../src/lib/forest/library';
import {createLabRecipe,parseLabQuery,labSpecies} from '../../src/lib/forest/laboratory';
import {terrainHeight,type SceneTree} from '../../src/lib/forest/recipe';
import {randomSource} from '../../src/lib/forest/random';
import {mapVisual,presets} from '../../src/lib/forest/presets';
import type {CameraView} from '../../src/lib/forest/render-types';
const seed='essence-context-29';
const standCenters={coast:[[-12,-9],[9,-13],[-12,9],[12,6]],understory:[[-12,-12],[11,-13],[-13,8],[12,7]]};
function mountStudy(kind:'coast'|'understory',view:'overview'|'human'){
 const rand=randomSource(seed+'|'+kind),recipe=createLabRecipe(parseLabQuery(new URLSearchParams('species=oak&structure=29&appearance=garden&wind=0')));
 const trees:SceneTree[]=[];
 standCenters[kind].forEach(([cx,cz],patch)=>{
  const count=kind==='coast'?4:5;
  for(let i=0;i<count;i++){
   const id=kind==='coast'?(patch%2?'stilt-mangrove':'avicennia'):(i<2?'rubber':'cacao');
   const x=cx+(rand()-.5)*13,z=cz+(rand()-.5)*12,index=trees.length;
   const structure=index===0?'29':`29|${kind}|${id}|${index}`,appearance=`garden|${index%4}`,size=.72+rand()*.28;
   const studio=sceneLibraryStudy(id,structure,appearance,size)!;
   const species={id,scientificName:labSpecies[id],commonName:presets[id].name,confidence:'provisional visual model',evidenceLevel:'visual study only',origin:'Art-directed context; not a sampled ecological palette or native-presence claim.',sources:[],visual:mapVisual(labSpecies[id])};
   trees.push({id:`study-${index}`,index,species,seed:structure,appearanceSeed:appearance,revision:0,position:[x,terrainHeight(x,z,seed),z],rotation:rand()*Math.PI*2,sizeScale:size,studio,model:studio.model});
  }
 });
 Object.assign(recipe,{trees,palette:[...new Map(trees.map(t=>[t.species.id,t.species])).values()],seed,structureSeed:'29',appearanceSeed:'garden',requestedTreeCount:trees.length,habitat:kind==='coast'?'coastal':'forest',terrain:{widthMeters:100,depthMeters:100,source:'Existing synthetic forest terrain; no tidal or site data.'},distribution:'Four seeded artist-directed species patches; not measured stand density.',message:'Temporary composition study, no location or ecological inference.',wind:false});
 const humanY=terrainHeight(3,30,seed)+1.7;
 const camera:CameraView=view==='overview'?{position:[39,33,52],target:[0,7,0]}:{position:[3,humanY,30],target:[-1,8,-5]};
 const host=document.getElementById('study') as HTMLDivElement;
 const runtime=mountPaintedForest(host,recipe,()=>{},stats=>Object.assign(window,{studyStats:stats}),message=>{throw Error(message)},camera);
 Object.assign(window,{studyRuntime:runtime,studyRecipe:{kind,view,camera,seed,trees:trees.map(t=>({species:t.species.scientificName,structure:t.seed,appearance:t.appearanceSeed,position:t.position,rotation:t.rotation,size:t.sizeScale})),limitations:['Art-directed grouping, not a verified natural community.','Coastal terrain is the unchanged synthetic forest ground; no tides or salinity simulation.','Cacao and rubber form an artistic understory/shade composition, not a claimed natural stand.','Mangrove roots retain the approved flat local substrate and may intersect uneven synthetic terrain.']}});
}
Object.assign(window,{mountStudy});
