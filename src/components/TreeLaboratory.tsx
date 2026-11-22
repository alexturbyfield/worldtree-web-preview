'use client';
import {useEffect,useMemo,useState,useRef} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {createLabRecipe,parseLabQuery,labQuery,labSpecies,type LabQuery} from '@/lib/forest/laboratory';
import {presets} from '@/lib/forest/presets';
import {hashSeed} from '@/lib/forest/random';
import {treeCacheStats,type PaintedTree} from '@/lib/forest/painterly';
import FoliageAtlas from './FoliageAtlas';
import {studioDefaults,type StudioSettings} from '@/lib/studio/groups';
import type {mountStudio,StudioMetrics} from '@/lib/studio/renderer';
import type {RenderStats} from '@/lib/forest/render-types';
const ForestCanvas=dynamic(()=>import('./ForestCanvas'),{ssr:false,loading:()=> <div className="forest-stage forest-loading">Preparing the painterly atelier…</div>});
export default function TreeLaboratory(){
  const params=useSearchParams(),parsed=useMemo(()=>{try{return {value:parseLabQuery(params),error:''};}catch(e){return {value:null,error:(e as Error).message};}},[params]);
  if(!parsed.value)return <main className="forest-invalid"><Link href="/lab">Reset laboratory</Link><p role="alert">{parsed.error}</p></main>;
  return params.get('editor')==='previous'?<LaboratorySession initial={parsed.value}/>:<UnifiedAtelier initial={parsed.value}/>;
}
function LaboratorySession({initial}:{initial:LabQuery}){
  useEffect(()=>{if(process.env.NODE_ENV==='production'&&'serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').then(()=>navigator.serviceWorker.ready).then(reg=>reg.active?.postMessage({type:'CACHE_ASSETS',urls:performance.getEntriesByType('resource').map(r=>r.name)})).catch(()=>{});},[]);
  const [draft,setDraft]=useState(initial),[query,setQuery]=useState(initial),[stats,setStats]=useState<RenderStats|null>(null),[notice,setNotice]=useState('');
  // Scrubbing a slider updates at most once after a short pause, never per frame.
  useEffect(()=>{const timer=setTimeout(()=>{setQuery(draft);window.history.replaceState(null,'',`/lab?editor=previous&${labQuery(draft)}`);setNotice('');},200);return()=>clearTimeout(timer);},[draft]);
  const recipe=useMemo(()=>createLabRecipe(query),[query]),tree=recipe.trees[0],painted=tree.model as PaintedTree,palette=tree.canopy?.palette??painted.palette;
  const skeletonHash=useMemo(()=>String(hashSeed(JSON.stringify(tree.model.segments))),[tree.model]);
  const change=(patch:Partial<LabQuery>)=>setDraft(q=>({...q,...patch}));
  const regenerate=()=>change({structuralSeed:String(hashSeed(draft.structuralSeed+'|next'))});
  const repaint=()=>change({appearanceSeed:String(hashSeed(draft.appearanceSeed+'|next'))});
  const download=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({...recipe,studio:query,sceneUrl:window.location.href},null,2)+'\n'],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`wildloom-${query.presetId}-${query.structuralSeed.replace(/[^a-z0-9_-]/gi,'_')}.json`;a.click();URL.revokeObjectURL(url);setNotice('Tree recipe exported with independent structure and appearance seeds.');};
  return <main className="forest-app atelier-app" data-testid="tree-laboratory" data-structure-hash={skeletonHash} data-appearance-seed={query.appearanceSeed}>
    <header className="forest-header"><Link className="forest-back" href="/">← Explore the world</Link><Link className="forest-brand" href="/lab">Wildloom <span>TREE ATELIER</span></Link><span className="preview-badge">PREVIEW <b>0.1</b></span></header>
    <div className="forest-layout atelier-layout"><section className="forest-view atelier-view" aria-label="Tree laboratory preview">
      <ForestCanvas recipe={recipe} lab debug={query.debug} selected={null} onPick={()=>{}} focusRequest={null} onMetrics={setStats} onDiagramFallback={()=>change({renderMode:'diagram'})}/>
      <div className="atelier-specimen"><div><span className="eyebrow">SPECIMEN {query.structuralSeed.slice(0,20)} · {query.renderMode.toUpperCase()}</span><h1>{presets[query.presetId].name}</h1><p className="scientific">{labSpecies[query.presetId]}</p></div><div className="atelier-pigments">{palette&&<><div>{[palette.shadow,palette.body,palette.light,painted.palette?.bark??'#8d7060'].map(c=><i key={c} style={{background:c}}/>)}</div><span>{palette.name}</span></>}</div></div>
      <p className="atelier-footnote">Full crowns, living colour. Canopy dimensions and pigments are artistic studies; local ecological presence remains unverified.</p>
    </section><aside className="forest-sidebar atelier-sidebar" aria-label="Tree laboratory controls"><div className="eyebrow">GROWTH & PIGMENT</div><h2>A tree, made yours.</h2><p className="atelier-intro">Build a generous crown. Layer soft boughs and clouds of green. Keep every seed yours.</p>
      <label>Species preset<select aria-label="Species preset" value={draft.presetId} onChange={e=>change({presetId:e.target.value})}>{Object.values(presets).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <label>Renderer<select aria-label="Renderer" value={draft.renderMode} onChange={e=>change({renderMode:e.target.value as LabQuery['renderMode']})}><option value="painterly">Painterly</option><option value="performance">Performance · larger clumps</option><option value="diagram">Diagram · preserved renderer</option></select></label>
      <div className="atelier-divider"/>
      <label>Structural seed<input aria-label="Structural seed" maxLength={64} value={draft.structuralSeed} onChange={e=>change({structuralSeed:e.target.value})}/></label>
      <label>Appearance seed<input aria-label="Appearance seed" maxLength={64} value={draft.appearanceSeed} onChange={e=>change({appearanceSeed:e.target.value})}/></label>
      <div className="atelier-button-pair"><button className="forest-primary" onClick={regenerate}>Regenerate tree</button><button onClick={repaint}>New pigments</button></div>
      <p>Appearance changes pigments, not the skeleton. Scene placement has a separate seed in the forest explorer.</p>
      <div className="atelier-divider"/>
      {(['stylization','foliageDensity','asymmetry','fluffiness','clumpOverlap','surfaceLeafDetail','branchExposure'] as const).map((key,i)=><label key={key}>{['Stylization','Foliage density','Asymmetry','Fluffiness','Clump overlap','Surface leaf detail','Branch exposure'][i]}<output>{Math.round((draft[key]??.65)*100)}%</output><input type="range" min="0" max="1" step="0.05" aria-label={['Stylization','Foliage density','Asymmetry','Fluffiness','Clump overlap','Surface leaf detail','Branch exposure'][i]} value={draft[key]??.65} onChange={e=>change({[key]:Number(e.target.value)})} disabled={draft.renderMode==='diagram'}/></label>)}
      <label>Debug view<select aria-label="Debug view" value={draft.debug} disabled={draft.renderMode==='diagram'} onChange={e=>change({debug:e.target.value as LabQuery['debug']})}><option value="none">Finished tree</option><option value="wireframe">Wireframe</option><option value="skeleton">Branch skeleton</option><option value="cards">Foliage cards · outlines</option></select></label>
      <label className="foliage-wind"><input type="checkbox" aria-label="Subtle foliage wind" checked={draft.wind??true} disabled={draft.renderMode==='diagram'} onChange={e=>change({wind:e.target.checked})}/> Subtle foliage wind</label><p>Reduced-motion preferences pause wind. Appearance changes pigment. Crown envelopes, clump positions and branches keep their structural seed.</p><FoliageAtlas appearanceSeed={query.appearanceSeed}/><details className="atelier-metrics" open><summary>Performance & geometry</summary><dl><dt>Draw calls</dt><dd data-testid="metric-calls">{stats?.calls??'—'}</dd><dt>Triangles / frame</dt><dd>{stats?.triangles.toLocaleString()??'—'}</dd><dt>CPU scene build</dt><dd>{stats?.buildMs?.toFixed(1)??'—'} ms</dd><dt>CPU render submission</dt><dd>{stats?.renderCpuMs?.toFixed(1)??'—'} ms</dd><dt>Wood segments</dt><dd>{tree.model.segments.length}</dd><dt>Canopy clumps</dt><dd>{stats?.foliageMasses??0}</dd><dt>Surface details</dt><dd>{stats?.foliageCards??0}</dd><dt>Atlas dimensions</dt><dd>{stats?.atlasSize??'—'}</dd><dt>Cached variants</dt><dd>{treeCacheStats().variants} / {treeCacheStats().capacity}</dd></dl><p>Geometry stays cached while wind and the camera animate. Use “Profile 5s orbit” in the viewport for measured frame timing. CPU submission time is not GPU time.</p></details>
      <button onClick={download}>Download tree recipe · JSON</button>{notice&&<p role="status">{notice}</p>}<p className="atelier-license">Custom procedural geometry · <a href="/third-party/three-LICENSE.txt">Three.js MIT</a></p>
    </aside></div>
  </main>;
}

function UnifiedAtelier({initial}:{initial:LabQuery}){
  const [draft,setDraft]=useState<StudioSettings>({...studioDefaults,unified:true,view:initial.presetId==='douglas'?'conifer':'broadleaf',mode:'trees',structure:initial.structuralSeed,appearance:initial.appearanceSeed,leafScale:1,asymmetry:.7,shape:.5});
  const [live,setLive]=useState(draft),[metrics,setMetrics]=useState<StudioMetrics|null>(null),[error,setError]=useState('');
  const host=useRef<HTMLDivElement>(null),runtime=useRef<ReturnType<typeof mountStudio>|null>(null),saved=useRef<ReturnType<ReturnType<typeof mountStudio>['view']>|undefined>(undefined),lastMode=useRef(draft.mode);
  useEffect(()=>{const timer=setTimeout(()=>setLive(draft),220);return()=>clearTimeout(timer);},[draft]);
  useEffect(()=>{let active=true;import('@/lib/studio/renderer').then(({mountStudio})=>{if(!active)return;try{runtime.current=mountStudio(host.current!,live,m=>{if(active){setMetrics(m);setError('');}},m=>{if(active)setError(m);},lastMode.current===live.mode?saved.current:undefined);lastMode.current=live.mode;}catch{if(active)setError('WebGL could not start. Use the previous Atelier fallback.');}});return()=>{active=false;saved.current=runtime.current?.view();runtime.current?.dispose();runtime.current=null;};},[live]);
  const update=(patch:Partial<StudioSettings>)=>setDraft(q=>({...q,...patch}));
  const fields=live.mode==='leaf'?[['leafScale','Leaf scale',.5,1.5],['detail','Leaf detail',0,1],['colorVariation','Pigment variation',0,1]]:live.mode==='groups'?[['size','Cluster size',.5,1.8],['shape','Cluster shape · rounded / tall',0,1],['density','Fullness',0,1],['overlap','Overlap',0,1],['leafScale','Leaf scale',.5,1.5],['asymmetry','Organic asymmetry',0,1]]:[['size','Cluster size',.5,1.8],['density','Crown fullness',0,1],['overlap','Cluster overlap',0,1],['leafScale','Leaf scale',.5,1.5],['asymmetry','Organic asymmetry',0,1]];
  return <main className="forest-app atelier-app"><header className="forest-header"><Link href="/" className="forest-back">← Explore the world</Link><span className="forest-brand">Wildloom <span>TREE ATELIER</span></span><Link href="/lab?editor=previous">Previous renderer ↗</Link></header>
    <div className="forest-layout atelier-layout"><section className="forest-view atelier-view"><div className="forest-stage" data-testid="unified-stage" data-state={error?'error':metrics?.settingsKey===JSON.stringify(live)?'ready':'loading'}><div className="forest-canvas-host" ref={host}/><div className="forest-stage-label">{live.mode==='leaf'?'LEAF / NEEDLE SPRAY':live.mode==='groups'?'FOLIAGE CLUSTER / BRANCH':'COMPLETE TREE'}</div><div className="forest-stage-foot" style={{position:'absolute',bottom:15,left:20,fontSize:12}}>Drag to orbit · pinch / scroll to zoom</div>{error&&<div className="forest-render-error" role="alert">{error}</div>}</div>
    <div className="atelier-specimen"><div><span className="eyebrow">LEAF → CLUSTER → BRANCH → CROWN → TREE</span><h1>{live.view==='conifer'?'Douglas-fir':'Oak'}</h1><p>Structure {live.structure} · appearance {live.appearance}</p></div></div><p className="atelier-footnote">One seeded hierarchy. Leaf and cluster changes propagate into the crown; branch structure keeps its seed. Artistic growth values.</p></section>
    <aside className="forest-sidebar atelier-sidebar"><div className="eyebrow">UNIFIED TREE EDITOR</div><h2>Grow from the leaf.</h2>
    <label>Species preset<select aria-label="Unified species" value={draft.view} onChange={e=>{saved.current=undefined;update({view:e.target.value as StudioSettings['view']});}}><option value="broadleaf">Oak</option><option value="conifer">Douglas-fir</option></select></label>
    <label>Preview mode<select aria-label="Preview mode" value={draft.mode} onChange={e=>update({mode:e.target.value as StudioSettings['mode']})}><option value="leaf">Leaf</option><option value="groups">Cluster / Branch</option><option value="trees">Full Tree</option></select></label>
    <label>Structural seed<input aria-label="Structural seed" value={draft.structure} maxLength={64} onChange={e=>update({structure:e.target.value})}/></label><label>Appearance seed<input aria-label="Appearance seed" value={draft.appearance} maxLength={64} onChange={e=>update({appearance:e.target.value})}/></label>
    <div className="atelier-button-pair"><button onClick={()=>update({structure:String(hashSeed(draft.structure+'|next'))})}>Regenerate tree</button><button onClick={()=>update({appearance:String(hashSeed(draft.appearance+'|next'))})}>New pigments</button></div>
    {fields.map(([key,label,min,max])=><label key={key}>{label}<output>{Number(draft[key as keyof StudioSettings]).toFixed(2)}</output><input aria-label={String(label)} type="range" min={Number(min)} max={Number(max)} step="0.01" value={Number(draft[key as keyof StudioSettings])} onChange={e=>update({[key]:Number(e.target.value)})}/></label>)}
    <p>Cluster parameters stay active when switching preview modes. Rounded leaf fans and tiered conifer sprays attach to the existing branches.</p><button onClick={()=>runtime.current?.fit()}>Frame tree</button><details open className="atelier-metrics"><summary>Geometry</summary><dl><dt>Draw calls</dt><dd>{metrics?.calls??'—'}</dd><dt>Triangles</dt><dd>{metrics?.triangles??'—'}</dd><dt>Leaf-cluster surfaces</dt><dd>{metrics?.surfaces??'—'}</dd></dl></details><p className="atelier-license">Prototype limited to oak and Douglas-fir. Forest Explorer is unchanged.</p>
    </aside></div></main>;
}
