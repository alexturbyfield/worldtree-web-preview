import type {SceneRecipe,SceneTree} from './recipe';
import {sceneLibraryStudy} from './library';
import {generatePainterlyTree} from './painterly';
import {generateCanopy,defaultCanopy} from './canopy';
/** Existing art geometry, explicitly unidentified; no botanical range is asserted. */
export function unnamedBiomeTree(r:SceneRecipe,kind:'broadleaf'|'mangrove'):SceneTree{
 const presetId=kind==='mangrove'?'red-mangrove':'oak',seed=r.structureSeed+'|unnamed-'+kind,appearance=r.appearanceSeed+'|unnamed-'+kind;
 const studio=sceneLibraryStudy(presetId,seed,appearance,1,{...r.art,foliageDetail:r.art.foliageDetail??.65,fluffiness:r.art.fluffiness??defaultCanopy.fluffiness,clumpOverlap:r.art.clumpOverlap??defaultCanopy.clumpOverlap}),raw=studio?.model??generatePainterlyTree({presetId,structuralSeed:seed,appearanceSeed:appearance,...r.art}),canopy=studio?undefined:generateCanopy(raw,r.art);
 return {id:'unnamed-'+kind,index:0,seed,appearanceSeed:appearance,revision:0,position:[0,0,0],rotation:0,studio,model:canopy?{...raw,dimensions:canopy.dimensions}:raw,canopy,foliageCards:canopy?.surfaceCards??[],species:{id:'unnamed-'+kind,scientificName:null,commonName:'Unnamed '+kind+' growth form',confidence:'biome design fallback',evidenceLevel:'biome_realm_fallback',origin:'Source biome context only; not a verified local species',sources:[],visual:{presetId,fallback:true,reason:'Shared art architecture, no named taxon asserted'}}};
}

