'use client';
import {useEffect,useRef,useState} from 'react';
import type {SceneRecipe} from '@/lib/forest/recipe';
import {mountForest,type RenderStats,type CameraView} from '@/lib/forest/renderer';
export default function ForestCanvas({recipe,selected,onPick,focusRequest}:{recipe:SceneRecipe;selected:number|null;onPick:(index:number|null)=>void;focusRequest:{index:number;revision:number}|null}){
  const host=useRef<HTMLDivElement>(null),runtime=useRef<ReturnType<typeof mountForest>|null>(null),pick=useRef(onPick);
  const view=useRef<CameraView|undefined>(undefined);
  const [error,setError]=useState(''),[stats,setStats]=useState<RenderStats|null>(null);
  useEffect(()=>{pick.current=onPick;},[onPick]);
  useEffect(()=>{
    let active=true;
    try{runtime.current=mountForest(host.current!,recipe,index=>pick.current(index),s=>{if(active)setStats(s);},message=>{if(active)setError(message);},view.current);}
    catch{queueMicrotask(()=>{if(active)setError('3D graphics could not start. WebGL2 may be unavailable or disabled. Try another browser or graphics setting. The ecological profile and scene JSON remain available.');});}
    return()=>{active=false;view.current=runtime.current?.view();runtime.current?.dispose();runtime.current=null;};
  },[recipe]);
  useEffect(()=>{runtime.current?.highlight(selected);},[selected,recipe]);
  useEffect(()=>{if(focusRequest)runtime.current?.focus(focusRequest.index);},[focusRequest]);
  return <div className="forest-stage" data-testid="forest-stage" data-state={error?'error':stats?'ready':'loading'} data-calls={stats?.calls} data-triangles={stats?.triangles} data-camera={stats?.camera} data-lod={stats?.lod}>
    <div className="forest-canvas-host" ref={host}/>
    {error?<div className="forest-render-error" role="alert"><b>3D view unavailable</b><p>{error}</p><button onClick={()=>window.location.reload()}>Reload explorer</button></div>:<><div className="forest-stage-label"><span className="live-dot"/> PROCEDURAL FIELD STUDY <b>100 × 100 m</b></div><div className="forest-touch-hint">Drag to orbit · pinch / scroll to zoom · tap a tree</div><div className="forest-quality">{stats?`${stats.quality} · ${stats.lod} · ${stats.calls} draw calls`:'Growing procedural geometry…'}</div></>}
  </div>;
}
