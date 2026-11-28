export const materialRegistry = {
 prShade:{label:'Grass shadow',kind:'color',default:'#385d4b'},
 prBody:{label:'Grass body',kind:'color',default:'#748a56'},
 prSun:{label:'Sunlit grass',kind:'color',default:'#e7cb85'},
 prSoil:{label:'Soil',kind:'color',default:'#806948'},
 rockColor:{label:'Rock color',kind:'color',default:'#8c8470'},
 tipIntensity:{label:'Grass tip highlights',kind:'number',default:1,min:0,max:2,step:.01},
 detailStrength:{label:'Ground texture detail',kind:'number',default:.75,min:0,max:1.5,step:.01},
 soilBlend:{label:'Soil blending',kind:'number',default:1,min:0,max:2,step:.01},
 rockCoverage:{label:'Rock coverage',kind:'number',default:1,min:0,max:1,step:.01},
} as const;
export type MaterialKey=keyof typeof materialRegistry;
export type MaterialValues={[K in MaterialKey]:typeof materialRegistry[K]['kind'] extends 'color'?string:number};
export interface MaterialPreset {version:1;biome:'prairie';values:MaterialValues;locks:Partial<Record<MaterialKey,boolean>>}
export const materialKeys=Object.keys(materialRegistry) as MaterialKey[];
export function defaultPreset():MaterialPreset{return {version:1,biome:'prairie',values:Object.fromEntries(materialKeys.map(k=>[k,materialRegistry[k].default])) as MaterialValues,locks:{}};}
export function setMaterial(p:MaterialPreset,k:MaterialKey,v:string|number):MaterialPreset{
 const d=materialRegistry[k];if(p.locks[k])return p;
 if(d.kind==='color'?typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v):typeof v!=='number'||!Number.isFinite(v)||v<d.min||v>d.max)throw Error('Invalid '+d.label);
 return {...p,values:{...p.values,[k]:v}};
}
export function resetMaterial(p:MaterialPreset,key?:MaterialKey){let next=p;for(const k of key?[key]:materialKeys)next=setMaterial(next,k,materialRegistry[k].default);return next;}
export function parsePreset(json:string):MaterialPreset{
 const data=JSON.parse(json);if(data?.version!==1||data?.biome!=='prairie'||!data.values||!data.locks)throw Error('Expected prairie material preset version 1');
 let p=defaultPreset();for(const k of materialKeys){p=setMaterial(p,k,data.values[k]);if(data.locks[k]!==undefined&&typeof data.locks[k]!=='boolean')throw Error('Invalid lock');}
 return {...p,locks:Object.fromEntries(materialKeys.map(k=>[k,data.locks[k]===true]))};
}
export function serializePreset(p:MaterialPreset){return JSON.stringify(parsePreset(JSON.stringify(p)),null,2);}
/** Existing locks win during import; imported locks apply to previously unlocked values. */
export function importPreset(current:MaterialPreset,json:string){const incoming=parsePreset(json);let p=current;for(const k of materialKeys)p=setMaterial(p,k,incoming.values[k]);return {...p,locks:{...incoming.locks,...Object.fromEntries(materialKeys.filter(k=>current.locks[k]).map(k=>[k,true]))}};}
export const MATERIAL_EVENT='wildloom:material-change',MATERIAL_READY='wildloom:material-ready';
export interface MaterialEdit {preset:MaterialPreset;enabled:boolean}
export function publishMaterial(edit:MaterialEdit){window.dispatchEvent(new CustomEvent(MATERIAL_EVENT,{detail:edit}));}
