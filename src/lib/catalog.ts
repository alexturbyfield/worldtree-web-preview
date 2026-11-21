import source from '../../data/species_associations.json';

export type Habitat = 'forest' | 'urban';
export interface TreeCandidate { id: string; common_name: string; scientific_name: string; archetype: string; origin: string; role: string; confidence: string; taxon_id?: string; species_evidence_url?: string; range_verified?: boolean; ecoregion_verified?: boolean }
export interface Locality { id: string; name: string; bounds: { north: number; south: number; east: number; west: number }; sources: { name: string; url: string }[]; habitats: Partial<Record<Habitat, TreeCandidate[]>> }
export const catalog = source.locality_profiles as Locality[];
export function validateCoordinates(lat: number, lon: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) throw new Error('Enter latitude −90 to 90 and longitude −180 to 180.');
}
export function recommend(lat: number, lon: number, habitat: Habitat = 'forest', profiles = catalog) {
  validateCoordinates(lat, lon);
  if (habitat !== 'forest' && habitat !== 'urban') throw new Error('Habitat must be forest or urban.');
  const matches = profiles.filter(({ bounds: b }) => lat >= b.south && lat <= b.north && lon >= b.west && lon <= b.east).sort((a,b) => (a.bounds.north-a.bounds.south)*(a.bounds.east-a.bounds.west)-(b.bounds.north-b.bounds.south)*(b.bounds.east-b.bounds.west));
  const profile = matches[0];
  const species = profile?.habitats[habitat] ?? [];
  return { status: species.length ? 'provisional_locality_match' : 'no_curated_species', profile: species.length ? profile : undefined, species, confidence: species.length ? 'low' : 'none', method: 'coarse_coordinate_bbox' };
}
export const catalogStats = { profiles: catalog.length, taxa: new Set(catalog.flatMap(r => Object.values(r.habitats).flat().map(t => t.scientific_name))).size };
export interface Place { name: string; lat: number; lon: number }
const names = ['Seattle','Atlanta','Tokyo','Vancouver Island','Southern Scandinavia','British lowlands','Western Mediterranean','Alps','Western Amazon','Congo Basin','East African savanna','South African bushveld','Western Ghats','Borneo','Eastern Australia','New Zealand North Island','Patagonia','Northeastern US'];
export const places: Place[] = catalog.map((r,i) => ({ name: names[i], lat: (r.bounds.north+r.bounds.south)/2, lon: (r.bounds.west+r.bounds.east)/2 }));
Object.assign(places[0],{lat:47.6062,lon:-122.3321}); Object.assign(places[1],{lat:33.749,lon:-84.388}); Object.assign(places[2],{lat:35.6762,lon:139.6503});
export function parseCoordinates(text: string): Place | undefined {
  const parts = text.trim().split(/[,\s]+/);
  if (parts.length !== 2 || parts.some(p => !p || !Number.isFinite(Number(p)))) return;
  const [lat,lon] = parts.map(Number); validateCoordinates(lat,lon);
  return { name: 'Selected coordinates', lat, lon };
}
