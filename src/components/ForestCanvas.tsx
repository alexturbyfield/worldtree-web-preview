'use client';
import {useEffect,useRef,useState} from 'react';
import type {SceneRecipe} from '@/lib/forest/recipe';
import {mountForest,type RenderStats,type CameraView} from '@/lib/forest/renderer';
export default function ForestCanvas({recipe,selected,onPick,focusRequest,lab=false,debug='none',onMetrics,onDiagramFallback,onReferenceViewChange}:{recipe:SceneRecipe;selected:number|null;onPick:(index:number|null)=>void;focusRequest:{index:number;revision:number}|null;lab?:boolean;debug?:'none'|'wireframe'|'skeleton'|'cards';onMetrics?:(stats:RenderStats)=>void;onDiagramFallback?:()=>void;onReferenceViewChange?:(matches:boolean)=>void}){
  const host=useRef<HTMLDivElement>(null),runtime=useRef<ReturnType<typeof mountForest>|null>(null),pick=useRef(onPick);
  const view=useRef<CameraView|undefined>(undefined);
  const metrics=useRef(onMetrics),referenceView=useRef(onReferenceViewChange);
  const [benchmark,setBenchmark]=useState<import('@/lib/forest/renderer').BenchmarkResult|null>(null),[measuring,setMeasuring]=useState(false);
  const [error,setError]=useState(''),[stats,setStats]=useState<RenderStats|null>(null);
  useEffect(()=>{pick.current=onPick;},[onPick]);
  useEffect(()=>{metrics.current=onMetrics;},[onMetrics]);
  useEffect(()=>{referenceView.current=onReferenceViewChange;},[onReferenceViewChange]);
  useEffect(()=>{
    let active=true;
    try{runtime.current=mountForest(host.current!,recipe,index=>pick.current(index),s=>{if(active){setStats(s);setError('');if(s.frames===1){setBenchmark(null);setMeasuring(false);}metrics.current?.(s);}},message=>{if(active)setError(message);},view.current,{lab,debug,onReferenceViewChange:matches=>referenceView.current?.(matches)});}
    catch{queueMicrotask(()=>{if(active)setError('3D graphics could not start. WebGL2 may be unavailable or disabled. Try another browser or graphics setting. The ecological profile and scene JSON remain available.');});}
    return()=>{active=false;view.current=runtime.current?.view();runtime.current?.dispose();runtime.current=null;};
  },[recipe,lab,debug]);
  useEffect(()=>{runtime.current?.highlight(selected);},[selected,recipe]);
  useEffect(()=>{if(focusRequest)runtime.current?.focus(focusRequest.index);},[focusRequest]);
  const measure=async()=>{setMeasuring(true);setBenchmark(null);try{const result=await runtime.current?.benchmark();setBenchmark(result??null);}finally{setMeasuring(false);}};
  return <div className={`forest-stage ${lab?'lab-stage':''}`} data-testid="forest-stage" data-state={error?'error':stats?'ready':'loading'} data-mode={recipe.renderMode} data-debug={debug} data-foliage-cards={stats?.foliageCards} data-foliage-masses={stats?.foliageMasses} data-wind={stats?.wind} data-calls={stats?.calls} data-triangles={stats?.triangles} data-camera={stats?.camera} data-lod={stats?.lod} data-build-ms={stats?.buildMs} data-benchmark={benchmark?JSON.stringify(benchmark):undefined}>
    <div className="forest-canvas-host" ref={host}/>{lab&&recipe.renderMode!=='diagram'&&<div className="foliage-focus"><button onClick={()=>{runtime.current?.focusFoliage();}}>Close-up foliage</button><button onClick={()=>{runtime.current?.frameTree();}}>Whole tree</button></div>}
    {error?<div className="forest-render-error" role="alert"><b>3D view unavailable</b><p>{error}</p>{onDiagramFallback&&recipe.renderMode!=='diagram'&&<button onClick={onDiagramFallback}>Use Diagram renderer</button>}<button onClick={()=>window.location.reload()}>Reload explorer</button></div>:<><div className="forest-stage-label"><span className="live-dot"/> {lab?'TREE ATELIER':recipe.renderMode==='painterly'?'PAINTERLY FIELD STUDY':recipe.renderMode==='performance'?'PERFORMANCE FIELD STUDY':'DIAGRAM FIELD STUDY'} <b>{lab?'VOLUME / LIGHT / PIGMENT':'100 × 100 m'}</b></div><div className="forest-touch-hint">Drag to orbit · pinch / scroll to zoom · tap a tree</div><div className="forest-quality">{stats?`${stats.quality} · ${stats.lod} · ${stats.calls} draw calls · ${stats.triangles.toLocaleString()} triangles`:'Growing procedural geometry…'}</div>{recipe.renderMode!=='diagram'&&<div className="forest-profile"><button onClick={measure} disabled={measuring||!stats}>{measuring?'Measuring orbit…':'Profile 5s orbit'}</button>{benchmark&&<span data-testid="benchmark-result">{benchmark.fps.toFixed(1)} fps · p95 {benchmark.p95FrameMs.toFixed(1)} ms <small>Measured in this browser</small></span>}</div>}</>}
  </div>;
}
