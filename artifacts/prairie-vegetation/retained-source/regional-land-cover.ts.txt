import prairie from '../../data/prairie-land-cover.json';
export type RegionalPlant=typeof prairie.plants[number];
/** Regional habitat palette, never a verified point occurrence or abundance model. */
export function regionalLandCover(ecoregionId:number,botanicalCode:string|undefined,habitat:string):RegionalPlant[]{
 return ecoregionId===prairie.ecoregionId&&botanicalCode===prairie.botanicalArea&&['forest','grassland','wetland'].includes(habitat)?prairie.plants:[];
}
