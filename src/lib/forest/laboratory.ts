import {presets,mapVisual} from './presets';
import {defaultArt,generatePainterlyTree,type ArtControls,type RenderMode} from './painterly';
import {generateTree} from './tree';
import type {SceneRecipe,SceneTree} from './recipe';
export interface LabQuery extends ArtControls {presetId:string;structuralSeed:string;appearanceSeed:string;renderMode:RenderMode;debug:'none'|'wireframe'|'skeleton'}
export const labSpecies:Record<string,string>={douglas:'Pseudotsuga menziesii',spruce:'Picea abies',pine:'Pinus sylvestris',oak:'Quercus robur',acacia:'Vachellia tortilis'};
export function parseLabQuery(p:Pick<URLSearchParams,'get'>):LabQuery {
  const presetId=p.get('species')??'oak',renderMode=p.get('mode')??'painterly',debug=p.get('debug')??'none';
  if(!Object.hasOwn(presets,presetId)||!['painterly','diagram'].includes(renderMode)||!['none','wireframe','skeleton'].includes(debug))throw new Error('Unknown laboratory preset or display mode.');
  const art={...defaultArt};for(const key of Object.keys(art) as (keyof ArtControls)[]){if(p.get(key)!==null)art[key]=Number(p.get(key));if(!Number.isFinite(art[key])||art[key]<0||art[key]>1)throw new Error('Laboratory sliders must be between 0 and 1.');}
  return {presetId,structuralSeed:(p.get('structure')??'17').slice(0,64),appearanceSeed:(p.get('appearance')??'moss').slice(0,64),renderMode:renderMode as RenderMode,debug:debug as LabQuery['debug'],...art};
}
export function labQuery(q:LabQuery){return new URLSearchParams({species:q.presetId,structure:q.structuralSeed,appearance:q.appearanceSeed,mode:q.renderMode,debug:q.debug,stylization:String(q.stylization),foliageDensity:String(q.foliageDensity),asymmetry:String(q.asymmetry)}).toString();}
export function createLabRecipe(q:LabQuery):SceneRecipe {
  const preset=presets[q.presetId],scientificName=labSpecies[q.presetId];
  const tree:SceneTree={id:'tree-0',index:0,seed:q.structuralSeed,appearanceSeed:q.appearanceSeed,revision:0,position:[0,0,0],rotation:0,species:{id:q.presetId,scientificName,commonName:preset.name,confidence:'visual design only',evidenceLevel:'insufficient_data',origin:'Laboratory study; no geographic presence or native-range claim.',sources:[],visual:mapVisual(scientificName)},model:q.renderMode==='diagram'?generateTree(q.structuralSeed,preset):generatePainterlyTree(q)};
  return {schemaVersion:'1.0.0',location:null,ecoregion:null,habitat:'forest',seed:'laboratory',structureSeed:q.structuralSeed,appearanceSeed:q.appearanceSeed,renderMode:q.renderMode,art:{stylization:q.stylization,foliageDensity:q.foliageDensity,asymmetry:q.asymmetry},purpose:'visual_laboratory',environment:{requested:{moisture:'any',coastal:'any',elevationM:null,seasonality:'any'},observed:{moisture:null,coastal:null,elevationM:null,seasonality:null},unvalidated:[],policy:'Visual laboratory only; no environmental suitability inferred.'},evidenceLevel:'insufficient_data',ecologicalStatus:'insufficient_data',requestedTreeCount:1,trees:[tree],palette:[tree.species],conditionalStudy:false,terrain:{widthMeters:20,depthMeters:20,source:'20 metre laboratory plinth; no geographic terrain.'},distribution:'One artist-directed tree study, not an ecological population.',message:'A visual growth study. No local ecological presence is asserted.',limitations:['All dimensions, colours and branching patterns are procedural design choices, not sourced botanical traits.','Pigment palettes are artistic colour studies, not verified leaf phenology.'],sources:[]};
}
