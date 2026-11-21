import {mountPaintedForest as mountDiagram} from './mass-renderer';
import {mountPaintedForest} from './painted-renderer';
import type {SceneRecipe} from './recipe';
import type {CameraView,RenderOptions,RenderStats} from './render-types';
export type {RenderStats,CameraView,BenchmarkResult} from './render-types';
export function mountForest(host:HTMLDivElement,recipe:SceneRecipe,onPick:(index:number|null)=>void,onStats:(stats:RenderStats)=>void,onError:(message:string)=>void,view?:CameraView,options:RenderOptions={}) {
  if(recipe.renderMode==='diagram'){
    const runtime=mountDiagram(host,recipe,onPick,s=>onStats({...s,foliageMasses:recipe.trees.reduce((n,t)=>n+t.model.foliage.filter((_,i)=>s.lod!=='distant'||i%3===0).length,0),foliageCards:s.lod==='distant'?0:recipe.trees.reduce((n,t)=>n+Math.min(t.model.foliage.filter(f=>'card' in f&&f.card).length,s.quality.includes('mobile')||s.quality==='software economy'?10:18),0),wind:false}),onError,view,options);
    return {...runtime,focusFoliage:()=>runtime.focus(0),frameTree:()=>runtime.focus(0)};
  }
  return mountPaintedForest(host,recipe,onPick,onStats,onError,view,options);
}
