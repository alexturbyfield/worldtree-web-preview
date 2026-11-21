import {mountForest as mountDiagram} from './diagram-renderer';
import {mountPaintedForest} from './painted-renderer';
import type {SceneRecipe} from './recipe';
import type {CameraView,RenderOptions,RenderStats,BenchmarkResult} from './render-types';
export type {RenderStats,CameraView,BenchmarkResult} from './render-types';
export function mountForest(host:HTMLDivElement,recipe:SceneRecipe,onPick:(index:number|null)=>void,onStats:(stats:RenderStats)=>void,onError:(message:string)=>void,view?:CameraView,options:RenderOptions={}) {
  if(recipe.renderMode==='diagram'){
    const height=recipe.trees[0]?.model.dimensions.height??16;
    const initialView=options.lab?{position:[height,height*.7,height*1.5] as [number,number,number],target:[0,height*.4,0] as [number,number,number]}:undefined;
    return {...mountDiagram(host,recipe,onPick,onStats,onError,view??initialView),benchmark:():Promise<BenchmarkResult|null>=>Promise.resolve(null)};
  }
  return mountPaintedForest(host,recipe,onPick,onStats,onError,view,options);
}
