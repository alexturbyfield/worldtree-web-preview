import type {RegionalPlant} from './regional-land-cover';
import type { EcoProperties } from './geography';
import type { TreeCandidate } from './catalog';

export type VegetationHabitat = 'forest' | 'urban' | 'grassland' | 'wetland' | 'coastal' | 'alpine';
export type EvidenceLevel = 'verified_ecoregion' | 'documented_regional_range' | 'biome_realm_fallback' | 'insufficient_data';
export interface EnvironmentFilters { moisture:'any'|'dry'|'mesic'|'wet'; elevationM:number|null; coastal:'any'|'coastal'|'inland'; seasonality:'any'|'evergreen'|'deciduous' }
export interface BotanicalArea { code: string; name: string }
export interface Taxon {
  id: string; scientificName: string; authors: string; accepted: boolean; family: string; genus: string;
  ipniId: string | null; powoId: string; commonNames: string[]; commonNameEvidence: string; synonyms: string[];
  nativeRange: string; nativeAreaCodes: string[]; growthForm: string; climate: string;
  leafHabit: string | null; matureHeightM: [number,number] | null; role: string; archetype: string;
  /** Canonical game-export height range; omitted when not sourced. */
  heightMeters?: [number,number];
  archetypeEvidence: string; sourceId: string; evidenceUrl: string; taxonomyConfidence: string;
  rangeConfidence: string; ecoregionVerified: boolean; habitatVerified: boolean;
  taxonId:string; nativeRegions:string[]; ecoregionIds:string[]; biomeIds:number[]; habitats:string[];
  assetArchetype:string; evergreen:boolean|null; ecologicalRole:string; confidence:'verified'|'regional'|'provisional'; sources:string[];
}
export interface EcoregionAssociation { taxonId: string; ecoregionId: number; habitats: VegetationHabitat[]; verified: boolean; evidenceUrls: string[] }
export interface VegetationProfile {
  schemaVersion: '0.8.0'; location: {lat:number;lon:number}; geography: EcoProperties | null; botanicalArea: BotanicalArea | null;
  habitat: VegetationHabitat; seed: string; evidenceLevel: EvidenceLevel;
  status: 'species_candidates' | 'growth_form_fallback' | 'naturally_treeless' | 'open_vegetation' | 'insufficient_data';
  title: string; description: string; growthForms: {name:string;archetype:string;conditional:boolean}[];
  landCover?: RegionalPlant[];
  species: Taxon[]; regionalSpeciesCount: number; provisionalCandidates: TreeCandidate[];
  limitations: string[]; sources: {name:string;url:string;license:string}[];
  procedural: {method:string;paletteLimit:number;spawnWeights:null;abundance:null};
  environment: {requested:EnvironmentFilters;observed:{moisture:null;elevationM:null;coastal:null;seasonality:null};unvalidated:string[];policy:string};
}

/** Export schema requested by the v0.8 specification; unknown traits remain nullable. */
export type TreeSpecies = Taxon;
