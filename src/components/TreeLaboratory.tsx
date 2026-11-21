'use client';
import {useEffect,useMemo,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {createLabRecipe,parseLabQuery,labQuery,labSpecies,type LabQuery} from '@/lib/forest/laboratory';
import {presets} from '@/lib/forest/presets';
import {hashSeed} from '@/lib/forest/random';
import {treeCacheStats,type PaintedTree} from '@/lib/forest/painterly';
import FoliageAtlas from './FoliageAtlas';
import type {RenderStats} from '@/lib/forest/render-types';
const ForestCanvas=dynamic(()=>import('./ForestCanvas'),{ssr:false,loading:()=> <div className="forest-stage forest-loading">Preparing the painterly atelier…</div>});
export default function TreeLaboratory(){
  const params=useSearchParams(),parsed=useMemo(()=>{try{return {value:parseLabQuery(params),error:''};}catch(e){return {value:null,error:(e as Error).message};}},[params]);
  if(!parsed.value)return <main className="forest-invalid"><Link href="/lab">Reset laboratory</Link><p role="alert">{parsed.error}</p></main>;
  return <LaboratorySession initial={parsed.value}/>;
}
function LaboratorySession({initial}:{initial:LabQuery}){
  useEffect(()=>{if(process.env.NODE_ENV==='production'&&'serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').then(()=>navigator.serviceWorker.ready).then(reg=>reg.active?.postMessage({type:'CACHE_ASSETS',urls:performance.getEntriesByType('resource').map(r=>r.name)})).catch(()=>{});},[]);
  const [draft,setDraft]=useState(initial),[query,setQuery]=useState(initial),[stats,setStats]=useState<RenderStats|null>(null),[notice,setNotice]=useState('');
  // Scrubbing a slider updates at most once after a short pause, never per frame.
  useEffect(()=>{const timer=setTimeout(()=>{setQuery(draft);window.history.replaceState(null,'',`/lab?${labQuery(draft)}`);setNotice('');},200);return()=>clearTimeout(timer);},[draft]);
  const recipe=useMemo(()=>createLabRecipe(query),[query]),tree=recipe.trees[0],painted=tree.model as PaintedTree;
  const skeletonHash=useMemo(()=>String(hashSeed(JSON.stringify(tree.model.segments))),[tree.model]);
  const change=(patch:Partial<LabQuery>)=>setDraft(q=>({...q,...patch}));
  const regenerate=()=>change({structuralSeed:String(hashSeed(draft.structuralSeed+'|next'))});
  const repaint=()=>change({appearanceSeed:String(hashSeed(draft.appearanceSeed+'|next'))});
  const download=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({...recipe,studio:query,sceneUrl:window.location.href},null,2)+'\n'],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`worldtree-${query.presetId}-${query.structuralSeed.replace(/[^a-z0-9_-]/gi,'_')}.json`;a.click();URL.revokeObjectURL(url);setNotice('Tree recipe exported with independent structure and appearance seeds.');};
  return <main className="forest-app atelier-app" data-testid="tree-laboratory" data-structure-hash={skeletonHash} data-appearance-seed={query.appearanceSeed}>
    <header className="forest-header"><Link className="forest-back" href="/">← Explore the world</Link><Link className="forest-brand" href="/lab">WorldTree <span>TREE ATELIER</span></Link><span className="preview-badge">PREVIEW <b>1.1</b></span></header>
    <div className="forest-layout atelier-layout"><section className="forest-view atelier-view" aria-label="Tree laboratory preview">
      <ForestCanvas recipe={recipe} lab debug={query.debug} selected={null} onPick={()=>{}} focusRequest={null} onMetrics={setStats} onDiagramFallback={()=>change({renderMode:'diagram'})}/>
      <div className="atelier-specimen"><div><span className="eyebrow">SPECIMEN {query.structuralSeed.slice(0,20)} · {query.renderMode.toUpperCase()}</span><h1>{presets[query.presetId].name}</h1><p className="scientific">{labSpecies[query.presetId]}</p></div><div className="atelier-pigments">{painted.palette&&<><div>{[painted.palette.shadow,painted.palette.body,painted.palette.light,painted.palette.bark].map(c=><i key={c} style={{background:c}}/>)}</div><span>{painted.palette.name}</span></>}</div></div>
      <p className="atelier-footnote">An expressive botanical silhouette. Dimensions and pigments are artistic studies; no ecological suitability or seasonal state is implied.</p>
    </section><aside className="forest-sidebar atelier-sidebar" aria-label="Tree laboratory controls"><div className="eyebrow">GROWTH & PIGMENT</div><h2>A tree, made yours.</h2><p className="atelier-intro">Shape its silhouette. Find its colours. Every seed grows the same way twice.</p>
      <label>Species preset<select aria-label="Species preset" value={draft.presetId} onChange={e=>change({presetId:e.target.value})}>{Object.values(presets).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <label>Renderer<select aria-label="Renderer" value={draft.renderMode} onChange={e=>change({renderMode:e.target.value as LabQuery['renderMode']})}><option value="painterly">Painterly</option><option value="performance">Performance · fewer cards</option><option value="diagram">Diagram · v1.0 geometric masses</option></select></label>
      <div className="atelier-divider"/>
      <label>Structural seed<input aria-label="Structural seed" maxLength={64} value={draft.structuralSeed} onChange={e=>change({structuralSeed:e.target.value})}/></label>
      <label>Appearance seed<input aria-label="Appearance seed" maxLength={64} value={draft.appearanceSeed} onChange={e=>change({appearanceSeed:e.target.value})}/></label>
      <div className="atelier-button-pair"><button className="forest-primary" onClick={regenerate}>Regenerate tree</button><button onClick={repaint}>New pigments</button></div>
      <p>Appearance changes pigments, not the skeleton. Scene placement has a separate seed in the forest explorer.</p>
      <div className="atelier-divider"/>
      {(['stylization','foliageDensity','asymmetry','foliageDetail'] as const).map((key,i)=><label key={key}>{['Stylization','Foliage density','Asymmetry','Foliage detail'][i]}<output>{Math.round((draft[key]??.65)*100)}%</output><input type="range" min="0" max="1" step="0.05" aria-label={['Stylization','Foliage density','Asymmetry','Foliage detail'][i]} value={draft[key]??.65} onChange={e=>change({[key]:Number(e.target.value)})} disabled={draft.renderMode==='diagram'}/></label>)}
      <label>Debug view<select aria-label="Debug view" value={draft.debug} disabled={draft.renderMode==='diagram'} onChange={e=>change({debug:e.target.value as LabQuery['debug']})}><option value="none">Finished tree</option><option value="wireframe">Wireframe</option><option value="skeleton">Branch skeleton</option><option value="cards">Foliage cards · outlines</option></select></label>
      <label className="foliage-wind"><input type="checkbox" aria-label="Subtle foliage wind" checked={draft.wind??true} disabled={draft.renderMode==='diagram'} onChange={e=>change({wind:e.target.checked})}/> Subtle foliage wind</label><p>Reduced-motion preferences pause wind. Appearance changes only paint; card roots and orientations stay fixed.</p><FoliageAtlas appearanceSeed={query.appearanceSeed}/><details className="atelier-metrics" open><summary>Performance & geometry</summary><dl><dt>Draw calls</dt><dd data-testid="metric-calls">{stats?.calls??'—'}</dd><dt>Triangles / frame</dt><dd>{stats?.triangles.toLocaleString()??'—'}</dd><dt>CPU scene build</dt><dd>{stats?.buildMs?.toFixed(1)??'—'} ms</dd><dt>CPU render submission</dt><dd>{stats?.renderCpuMs?.toFixed(1)??'—'} ms</dd><dt>Wood segments</dt><dd>{tree.model.segments.length}</dd><dt>Rendered foliage masses</dt><dd>{stats?.foliageMasses??0}</dd><dt>Rendered foliage cards</dt><dd>{stats?.foliageCards??0}</dd><dt>Atlas dimensions</dt><dd>{stats?.atlasSize??'—'}</dd><dt>Cached variants</dt><dd>{treeCacheStats().variants} / {treeCacheStats().capacity}</dd></dl><p>Geometry stays cached while wind and the camera animate. Use “Profile 5s orbit” in the viewport for measured frame timing. CPU submission time is not GPU time.</p></details>
      <button onClick={download}>Download tree recipe · JSON</button>{notice&&<p role="status">{notice}</p>}<p className="atelier-license">Custom procedural geometry · <a href="/third-party/three-LICENSE.txt">Three.js MIT</a></p>
    </aside></div>
  </main>;
}
