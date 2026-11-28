'use client';
import {useEffect,useRef,useState} from 'react';
import {defaultPreset,materialRegistry,materialKeys,setMaterial,resetMaterial,parsePreset,importPreset,serializePreset,publishMaterial,MATERIAL_READY,type MaterialKey} from '@/lib/material-workbench';
import styles from './MaterialWorkbench.module.css';
const storageKey='wildloom:materials:prairie:v1';
export default function MaterialWorkbench(){
 const [hydrated,setHydrated]=useState(false);
 const [preset,setPreset]=useState(defaultPreset),[enabled,setEnabled]=useState(false),[before,setBefore]=useState(false),[status,setStatus]=useState('Overrides off: original materials.'),[sampleTarget,setSampleTarget]=useState<MaterialKey>('prBody'),[reference,setReference]=useState('');
 const canvas=useRef<HTMLCanvasElement>(null),image=useRef<HTMLImageElement>(null);
 useEffect(()=>{try{const saved=localStorage.getItem(storageKey);if(saved)setPreset(parsePreset(saved));}catch{setStatus('Saved preset could not be loaded.');}finally{setHydrated(true);}},[]);
 useEffect(()=>{const send=()=>publishMaterial({preset,enabled:enabled&&!before});send();window.addEventListener(MATERIAL_READY,send);return()=>window.removeEventListener(MATERIAL_READY,send);},[preset,enabled,before]);
 useEffect(()=>{if(!hydrated)return;try{localStorage.setItem(storageKey,serializePreset(preset));}catch{setStatus('Local storage unavailable. Export JSON to save.');}},[preset,hydrated]);
 useEffect(()=>()=>{if(reference)URL.revokeObjectURL(reference);},[reference]);
 const edit=(key:MaterialKey,value:string|number)=>{try{setPreset(p=>setMaterial(p,key,value));}catch(e){setStatus((e as Error).message);}};
 const upload=(file?:File)=>{if(file){if(!file.type.startsWith('image/')){setStatus('Choose an image.');return;}setReference(URL.createObjectURL(file));}};
 const exportJSON=()=>{const url=URL.createObjectURL(new Blob([serializePreset(preset)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='wildloom-prairie-materials.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return <details className={styles.workbench} data-testid="material-workbench"><summary>Material workbench · prairie</summary><div className={styles.body}>
 <label className={styles.row}><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)} aria-label="Enable material overrides"/>Enable overrides</label>
 <button aria-pressed={before} onClick={()=>setBefore(!before)} disabled={!enabled}>{before?'Show edited':'Show before'}</button>
 <p>Edits are local. Locks protect values from edits, resets and imports. Rock color tints the existing stone pigments.</p>
 {materialKeys.map(key=>{const d=materialRegistry[key],locked=!!preset.locks[key];return <fieldset key={key}><legend>{d.label}</legend><div className={styles.row}>
 {d.kind==='color'?<input type="color" aria-label={d.label} value={preset.values[key] as string} disabled={locked} onChange={e=>edit(key,e.target.value)}/>:<input type="range" aria-label={d.label} min={d.min} max={d.max} step={d.step} value={preset.values[key]} disabled={locked} onChange={e=>edit(key,Number(e.target.value))}/>}
 <output>{String(preset.values[key])}</output></div><div className={styles.row}><button aria-label={'Lock '+d.label} aria-pressed={locked} onClick={()=>setPreset(p=>({...p,locks:{...p.locks,[key]:!locked}}))}>{locked?'Locked':'Lock'}</button><button disabled={locked} aria-label={'Reset '+d.label} onClick={()=>setPreset(p=>resetMaterial(p,key))}>Reset</button></div></fieldset>;})}
 <div className={styles.row}><button onClick={()=>setPreset(p=>resetMaterial(p))}>Reset unlocked values</button><button onClick={exportJSON}>Export JSON</button></div>
 <label>Import JSON<input type="file" accept="application/json,.json" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{const json=await file.text();parsePreset(json);setPreset(p=>importPreset(p,json));setStatus('Imported. Existing locks preserved.');}catch(err){setStatus((err as Error).message);}e.target.value='';}}/></label>
 <label>Reference image (stays on this device)<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0])}/></label>
 {reference&&<><label>Sample into<select value={sampleTarget} onChange={e=>setSampleTarget(e.target.value as MaterialKey)}>{materialKeys.filter(k=>materialRegistry[k].kind==='color').map(k=><option key={k} value={k}>{materialRegistry[k].label}</option>)}</select></label><img ref={image} src={reference} alt="Tap reference to sample a pigment" onLoad={()=>{const c=canvas.current,i=image.current;if(c&&i){c.width=i.naturalWidth;c.height=i.naturalHeight;c.getContext('2d')?.drawImage(i,0,0);}}} onPointerDown={e=>{const c=canvas.current;if(!c)return;const b=e.currentTarget.getBoundingClientRect(),x=Math.min(c.width-1,Math.max(0,Math.floor((e.clientX-b.left)/b.width*c.width))),y=Math.min(c.height-1,Math.max(0,Math.floor((e.clientY-b.top)/b.height*c.height))),pixel=c.getContext('2d')?.getImageData(x,y,1,1).data;if(pixel){const hex='#'+Array.from(pixel).slice(0,3).map(n=>n.toString(16).padStart(2,'0')).join('');edit(sampleTarget,hex);setStatus(preset.locks[sampleTarget]?'Target is locked.':'Sampled '+hex);}}}/><canvas ref={canvas} hidden/></>}
 <p role="status">{status} Preset autosaved locally; overrides start off on each visit.</p>
 </div></details>;
}
