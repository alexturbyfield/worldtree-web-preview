import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';
import { validateCoordinates } from './catalog';
export interface EcoProperties { ECO_ID: number; ECO_NAME: string; BIOME_NAME: string; BIOME_NUM: number; REALM: string; COLOR_BIO?: string }
export type EcoCollection = FeatureCollection<Polygon | MultiPolygon, EcoProperties>;
export function tileKey(lat: number, lon: number) { validateCoordinates(lat,lon); return `${Math.min(35,Math.floor((lon+180)/10))}-${Math.min(17,Math.floor((lat+90)/10))}`; }
export function lookup(lat: number, lon: number, data: EcoCollection): EcoProperties | undefined {
  validateCoordinates(lat,lon);
  return data.features.find(f => {
    const b = f.bbox;
    if (b && (lon<b[0] || lat<b[1] || lon>b[2] || lat>b[3])) return false;
    return booleanPointInPolygon([lon,lat],f,{ignoreBoundary:false});
  })?.properties;
}
export const biomeColors: Record<number,string> = {1:'#4a8661',2:'#9b9f51',3:'#477755',4:'#719a69',5:'#376f66',6:'#75a49a',7:'#b1ad69',8:'#bec482',9:'#80b6a3',10:'#a59e80',11:'#b6c9b4',12:'#a2a368',13:'#cead7f',14:'#558f89',0:'#d8ded9',98:'#d8ded9'};
export const biomeNames: Record<number,string> = {1:'Tropical moist forests',2:'Tropical dry forests',3:'Tropical conifer forests',4:'Temperate broadleaf forests',5:'Temperate conifer forests',6:'Boreal forests / taiga',7:'Tropical grasslands & savannas',8:'Temperate grasslands',9:'Flooded grasslands',10:'Montane grasslands',11:'Tundra',12:'Mediterranean woodland',13:'Deserts & xeric shrublands',14:'Mangroves'};
