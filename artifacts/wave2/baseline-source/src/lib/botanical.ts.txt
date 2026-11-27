import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import type {FeatureCollection,Polygon,MultiPolygon} from 'geojson';
import type {BotanicalArea} from './global-types';
import {validateCoordinates} from './catalog';
export type BotanicalCollection = FeatureCollection<Polygon|MultiPolygon,{LEVEL3_COD:string;LEVEL3_NAM:string}>;
export function lookupBotanicalArea(lat:number,lon:number,data:BotanicalCollection):BotanicalArea|null {
  validateCoordinates(lat,lon);
  const f=data.features.find(f=>{
    const b=f.bbox;if(b&&(lon<b[0]||lat<b[1]||lon>b[2]||lat>b[3]))return false;
    return booleanPointInPolygon([lon,lat],f,{ignoreBoundary:false});
  });
  return f?{code:f.properties.LEVEL3_COD,name:f.properties.LEVEL3_NAM}:null;
}
