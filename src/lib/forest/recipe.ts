import type {VegetationProfile,VegetationHabitat} from '../global-types';
import {mapVisual, presets, type VisualMapping} from './presets';
import {generateTree, type TreeModel, type Point} from './tree';
import {hashSeed,randomSource} from './random';
export interface SceneSpecies {
  id:string;scientificName:string|null;commonName:string;confidence:string;
  evidenceLevel:string;origin:string;sources:string[];visual:VisualMapping;
}
export interface SceneTree {id:string;index:number;species:SceneSpecies;seed:string;revision:number;position:Point;rotation:number;model:TreeModel}
export interface SceneRecipe {
  schemaVersion:'0.9.0';location:VegetationProfile['location'];ecoregion:VegetationProfile['geography'];
  habitat:VegetationHabitat;seed:string;environment:VegetationProfile['environment'];
  evidenceLevel:VegetationProfile['evidenceLevel'];ecologicalStatus:VegetationProfile['status'];
  requestedTreeCount:number;trees:SceneTree[];palette:SceneSpecies[];conditionalStudy:boolean;
  terrain:{widthMeters:100;depthMeters:100;source:string};distribution:string;
  message:string;limitations:string[];sources:VegetationProfile['sources'];
}
export function terrainHeight(x:number,z:number,seed:string){
  const phase=(hashSeed(seed)%6283)/1000;
  return Math.sin(x*.055+phase)*1.1+Math.cos(z*.073-phase)*.8+Math.sin((x+z)*.12+phase)*.25;
}
export function createSceneRecipe(profile:VegetationProfile,{seed=profile.seed,density=28,revisions={},conditional=false}:{seed?:string;density?:number;revisions?:Record<number,number>;conditional?:boolean}={}):SceneRecipe {
  if(!Number.isInteger(density)||density<0||density>40)throw new Error('Scene density must be an integer from 0 to 40.');
  const palette:SceneSpecies[]=profile.species.map(t=>({id:t.id,scientificName:t.scientificName,commonName:t.commonNames[0]??t.scientificName,confidence:t.confidence,evidenceLevel:profile.evidenceLevel,origin:profile.evidenceLevel==='verified_ecoregion'?'Evidence-linked ecoregion candidate':'Documented native botanical country; local presence unverified',sources:t.sources,visual:mapVisual(t.scientificName,t.assetArchetype)}));
  const blocked=profile.status==='insufficient_data'||profile.status==='naturally_treeless'||profile.environment.unvalidated.length>0;
  if(!palette.length&&!blocked&&profile.provisionalCandidates.length&&profile.habitat==='urban'){
    for(const t of profile.provisionalCandidates)palette.push({id:t.id,scientificName:t.scientific_name,commonName:t.common_name,confidence:'provisional',evidenceLevel:'provisional_locality',origin:`Provisional legacy planting candidate · ${t.origin.replaceAll('_',' ')}`,sources:t.species_evidence_url?[t.species_evidence_url]:[],visual:mapVisual(t.scientific_name,t.archetype)});
  }
  if(!palette.length&&!blocked){
    const forms=profile.growthForms.filter(f=>/(canopy|conifer|broadleaf|mangrove|krummholz|tree)/.test(f.archetype)&&(!f.conditional||conditional));
    for(const f of forms)palette.push({id:f.archetype,scientificName:null,commonName:f.name,confidence:'biome design fallback',evidenceLevel:'biome_realm_fallback',origin:f.conditional?'Conditional canopy study; habitat unverified':'Unnamed growth form; no local species presence asserted',sources:[],visual:mapVisual(null,f.archetype)});
  }
  if(blocked)palette.length=0;
  const rand=randomSource(seed+'|placement'),cells=Array.from({length:64},(_,i)=>i);
  for(let i=cells.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]];}
  const positions=cells.map(i=>[(i%8-3.5)*11+rand()*3-1.5,0,(Math.floor(i/8)-3.5)*11+rand()*3-1.5] as Point);
  const trees:SceneTree[]=palette.length?positions.slice(0,density).map((p,index)=>{
    const species=palette[index%palette.length],revision=revisions[index]??0;
    const individualSeed=String(hashSeed(`${seed}|individual|${index}|${revision}`));
    p[1]=terrainHeight(p[0],p[2],seed);
    return {id:`tree-${index}`,index,species,seed:individualSeed,revision,position:p,rotation:randomSource(seed+'|rotation|'+index)()*Math.PI*2,model:generateTree(individualSeed,presets[species.visual.presetId])};
  }):[];
  return {schemaVersion:'0.9.0',location:profile.location,ecoregion:profile.geography,habitat:profile.habitat,seed,environment:profile.environment,evidenceLevel:profile.evidenceLevel,ecologicalStatus:profile.status,requestedTreeCount:density,trees,palette,conditionalStudy:conditional,terrain:{widthMeters:100,depthMeters:100,source:'Synthetic seeded terrain; not a digital elevation model.'},distribution:'Seeded stratified design spacing and equal palette cycling; not ecological abundance or spawn probability.',message:trees.length?profile.description:profile.title+'. '+profile.description,limitations:[...profile.limitations,'All tree shapes, height and crown dimensions are art-directed procedural design values, not measured or sourced botanical traits.','Only three architectures are implemented; palms, mangrove roots and other specialist forms use labelled visual fallbacks.','Density, placement and synthetic terrain are design controls, not inferred current forest cover.'],sources:profile.sources};
}
