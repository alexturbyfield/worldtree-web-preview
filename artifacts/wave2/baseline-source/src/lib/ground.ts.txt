export type Bounds=[number,number,number,number];
export interface Grid {width:number;height:number;bounds:Bounds}
export interface LandGrid extends Grid {rle:number[]}
export interface SoilGrid extends Grid {layers:Record<string,{values:(number|null)[]|null}>}
export function gridIndex(g:Grid,lat:number,lon:number){const [w,s,e,n]=g.bounds;if(!Number.isFinite(lat)||!Number.isFinite(lon)||lon<w||lon>=e||lat<=s||lat>n)return -1;return Math.floor((n-lat)/(n-s)*g.height)*g.width+Math.floor((lon-w)/(e-w)*g.width);}
export function landClass(g:LandGrid,lat:number,lon:number){let i=gridIndex(g,lat,lon);if(i<0)return null;for(let j=0;j<g.rle.length;j+=2){if(i<g.rle[j+1])return g.rle[j]||null;i-=g.rle[j+1];}return null;}
export function soilValue(g:SoilGrid,property:string,lat:number,lon:number,stat='mean'){const i=gridIndex(g,lat,lon);if(i<0)return null;const values=['sand','silt','clay'].map(p=>g.layers[p+'_mean']?.values?.[i]);if(values.some(v=>v==null)||Math.abs(values.reduce<number>((s,v)=>s+(v??0),0)-100)>10)return null;return g.layers[property+'_'+stat]?.values?.[i]??null;}
// Future inferred ground palettes must use a separate result, never overwrite observed classes/fractions.
export interface InferredGroundPalette {ecoregionId:number;taxonIds:string[];evidence:string[];confidence:'regional'|'provisional';methodVersion:string}
