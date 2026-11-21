export type Architecture = 'central-leader-conifer' | 'spreading-broadleaf' | 'umbrella-canopy';
export interface GrowthPreset {
  id: string; name: string; architecture: Architecture;
  height: [number, number]; crownRadius: [number, number]; crownBase: number;
  trunkRadius: number; taper: number; whorls: number; branches: number;
  recursion: number; spread: number; droop: number; leafColor: string;
}
/** Art-directed dimensions in metres. These are NOT sourced botanical traits. */
export const presets: Record<string, GrowthPreset> = {
  douglas: {id:'douglas',name:'Douglas-fir',architecture:'central-leader-conifer',height:[19,28],crownRadius:[3.3,4.5],crownBase:.18,trunkRadius:.43,taper:.94,whorls:10,branches:5,recursion:2,spread:.8,droop:.15,leafColor:'#36684e'},
  spruce: {id:'spruce',name:'Norway spruce',architecture:'central-leader-conifer',height:[16,25],crownRadius:[2.8,4],crownBase:.12,trunkRadius:.36,taper:.96,whorls:11,branches:5,recursion:2,spread:.78,droop:.32,leafColor:'#31594c'},
  pine: {id:'pine',name:'Scots pine',architecture:'central-leader-conifer',height:[14,23],crownRadius:[3.4,5],crownBase:.52,trunkRadius:.34,taper:.9,whorls:6,branches:5,recursion:2,spread:1,droop:-.04,leafColor:'#52735a'},
  oak: {id:'oak',name:'Oak',architecture:'spreading-broadleaf',height:[10,17],crownRadius:[4.5,6.5],crownBase:.32,trunkRadius:.52,taper:.83,whorls:4,branches:4,recursion:3,spread:1,droop:-.12,leafColor:'#618448'},
  acacia: {id:'acacia',name:'Acacia',architecture:'umbrella-canopy',height:[7,12],crownRadius:[5.5,7],crownBase:.48,trunkRadius:.33,taper:.88,whorls:3,branches:5,recursion:3,spread:1.3,droop:-.06,leafColor:'#84924f'},
};
export interface VisualMapping {presetId:string; fallback:boolean; reason:string}
export function mapVisual(scientificName:string|null, archetype=''):VisualMapping {
  const n=scientificName?.toLowerCase()??'';
  const exact:Record<string,string>={'pseudotsuga menziesii':'douglas','picea abies':'spruce','pinus sylvestris':'pine','quercus robur':'oak','vachellia tortilis':'acacia','acacia tortilis':'acacia'};
  if(exact[n])return {presetId:exact[n],fallback:false,reason:'Species design preset; dimensions are artistic, not measured traits.'};
  const presetId=/acacia|vachellia|senegalia|umbrella|savanna/i.test(n+' '+archetype)?'acacia':/^pinus /.test(n)?'pine':/picea|abies|pseudotsuga|larix|conifer|needle/i.test(n+' '+archetype)?'spruce':'oak';
  return {presetId,fallback:true,reason:`Visual archetype fallback (${presets[presetId].architecture}); not a species-specific reconstruction.`};
}
