'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {useSearchParams} from 'next/navigation';
import {parseStudio,studioQuery,type StudioSettings} from '@/lib/studio/groups';
import {studioAtlas,studioAtlasLabels} from '@/lib/studio/atlas';
import type {mountStudio,StudioMetrics} from '@/lib/studio/renderer';
import type {Point} from '@/lib/forest/tree';
import {hashSeed} from '@/lib/forest/random';
const labels={all:'Compare all',broadleaf:'Broadleaf',flower:'Blossom',conifer:'Douglas-fir'};
export default function FoliageStudio(){
  const params=useSearchParams(),parsed=useMemo(()=>{try{return {q:parseStudio(params),error:''};}catch(e){return {q:null,error:(e as Error).message};}},[params]);
  if(!parsed.q)return <main className="studio-invalid"><h1>Foliage Studio</h1><p role="alert">{parsed.error}</p><Link href="/studio">Reset studio</Link></main>;
  return <StudioSession initial={parsed.q} autoMobile={!params.has('view')}/>;
}
function StudioSession({initial,autoMobile}:{initial:StudioSettings;autoMobile:boolean}){
  const [draft,setDraft]=useState(initial),[live,setLive]=useState(initial),[metrics,setMetrics]=useState<StudioMetrics|null>(null),[error,setError]=useState(''),[measuring,setMeasuring]=useState(false);
  const host=useRef<HTMLDivElement>(null),atlas=useRef<HTMLCanvasElement>(null),runtime=useRef<ReturnType<typeof mountStudio>|null>(null);
  const savedView=useRef<{key:string;position:Point;target:Point}|null>(null);
  useEffect(()=>{const media=matchMedia('(max-width: 700px)'),adapt=()=>{if(autoMobile&&media.matches)setDraft(q=>({...q,view:'broadleaf'}));};const frame=requestAnimationFrame(adapt);media.addEventListener('change',adapt);return()=>{cancelAnimationFrame(frame);media.removeEventListener('change',adapt);};},[autoMobile]);
  useEffect(()=>{const timer=setTimeout(()=>{setLive(draft);history.replaceState(null,'',`/studio?${studioQuery(draft)}`);},240);return()=>clearTimeout(timer);},[draft]);
  useEffect(()=>{
    let active=true;import('@/lib/studio/renderer').then(({mountStudio})=>{if(!active)return;try{runtime.current=mountStudio(host.current!,live,m=>{if(active){setMetrics(m);setError('');}},m=>{if(active)setError(m);},savedView.current?.key===live.mode+'|'+live.view?savedView.current:undefined);}catch{if(active)setError('WebGL2 could not start. Try a browser with graphics acceleration. Your settings remain in the URL.');}});
    return()=>{active=false;if(runtime.current){savedView.current={key:live.mode+'|'+live.view,...runtime.current.view()};runtime.current.dispose();}runtime.current=null;};
  },[live]);
  useEffect(()=>{const source=studioAtlas(live,matchMedia('(max-width: 650px)').matches),c=atlas.current!;c.width=source.width;c.height=source.height;c.getContext('2d')!.drawImage(source,0,0);},[live]);
  const update=(patch:Partial<StudioSettings>)=>setDraft(q=>({...q,...patch}));
  const download=(value:unknown,name:string)=>{const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);};
  const profile=async()=>{if(!runtime.current)return;setMeasuring(true);host.current?.scrollIntoView({block:'center',behavior:'auto'});try{const current=runtime.current,result=await current.benchmark();if(runtime.current===current)setMetrics(result);}catch{setError('The measurement was interrupted. Reload the study to retry.');}finally{setMeasuring(false);}};
  return <main className="studio-app" data-testid="foliage-studio" data-settings={JSON.stringify(live)}>
    <header className="studio-header"><Link href="/lab">← Tree Atelier</Link><Link href="/studio" className="studio-brand">Wildloom <span>FOLIAGE STUDIO</span></Link><span className="studio-prototype">VISUAL PROTOTYPE</span></header>
    <div className="studio-layout"><section className="studio-main">
      <div className="studio-heading"><div><span className="studio-kicker">A STUDY IN LAYERS, LIGHT & LIVING FORM</span><h1>Leaves with a little life.</h1><p>Three botanical directions. One shared painterly atlas. A separate study for visual review.</p></div><div className="studio-mode"><button aria-pressed={draft.mode==='groups'} onClick={()=>update({mode:'groups'})}>Foliage groups</button><button aria-pressed={draft.mode==='trees'} onClick={()=>update({mode:'trees'})}>Branch studies</button></div></div>
      <nav className="studio-tabs" aria-label="Foliage comparison">{Object.entries(labels).map(([key,label])=><button key={key} aria-pressed={draft.view===key} onClick={()=>update({view:key as StudioSettings['view']})}>{label}</button>)}</nav>
      <div className="studio-stage" data-testid="studio-stage" data-state={error?'error':metrics?.settingsKey===JSON.stringify(live)?'ready':'loading'} data-metrics={metrics?JSON.stringify({...metrics,fill:metrics.fill?{...metrics.fill,heatmap:undefined}:undefined}):undefined}>
        <div className="studio-canvas" ref={host}/><div className="studio-stage-top"><span>STRUCTURE {live.structure} / PIGMENT {live.appearance}</span><button onClick={()=>runtime.current?.fit()}>Frame studies</button></div>
        {error?<div className="studio-error" role="alert">{error}</div>:<div className="studio-gesture">Drag to orbit · pinch / scroll to zoom</div>}
        <div className="studio-stage-foot">{metrics?`${metrics.surfaces} curved surfaces · ${metrics.calls} draws · ${metrics.triangles.toLocaleString()} triangles`:'Painting the first leaves…'}</div>
      </div>
      <div className="studio-captions">{(live.view==='all'?['broadleaf','flower','conifer']:[live.view]).map(kind=><div key={kind}><span>{kind==='broadleaf'?'01 / BROADLEAF':kind==='flower'?'02 / BLOSSOM':'03 / DOUGLAS-FIR'}</span><h2>{kind==='broadleaf'?'Soft, layered fans':kind==='flower'?'Layered blossom clouds':'Horizontal, drooping sprays'}</h2><p>{kind==='broadleaf'?'Pointed oval leaves, irregular edges and cool interior shadows.':kind==='flower'?'Cupped five-petal flowers, violet depths and warm outer highlights.':'Flattened branchlets follow the existing conifer branch tiers.'}</p></div>)}</div>
      <section className="studio-reference"><span className="studio-kicker">REFERENCE NOTES</span><h2>Silhouette before complexity.</h2><p>The supplied garden and tree studies guide the soft overlapping green and pink crowns. The conifer reference guides broad horizontal tiers, tapered tips and hanging needle sprays. Reference images remain private; these textures and meshes are generated here.</p><p className="studio-review">Awaiting visual approval. This prototype does not replace the map, Tree Atelier or Forest Explorer renderer.</p></section>
    </section><aside className="studio-controls" aria-label="Foliage Studio controls"><span className="studio-kicker">GROWTH & PIGMENT</span><h2>Shape the study</h2>
      {([['size','Cluster size',.5,1.8],['density','Cluster density',0,1],['overlap','Layer overlap',0,1],['detail','Leaf silhouette detail',0,1],['colorVariation','Color variation',0,1]] as const).map(([key,label,min,max])=><label key={key}>{label}<output>{key==='size'?`${draft[key].toFixed(2)}×`:`${Math.round(draft[key]*100)}%`}</output><input aria-label={label} type="range" min={min} max={max} step={key==='size'?.05:.01} value={draft[key]} onChange={e=>update({[key]:Number(e.target.value)})}/></label>)}
      <label>Structural seed<input aria-label="Studio structural seed" value={draft.structure} maxLength={64} onChange={e=>update({structure:e.target.value})}/></label><label>Appearance seed<input aria-label="Studio appearance seed" value={draft.appearance} maxLength={64} onChange={e=>update({appearance:e.target.value})}/></label>
      <div className="studio-pair"><button onClick={()=>update({structure:String(hashSeed(draft.structure+'|next'))})}>Regrow</button><button onClick={()=>update({appearance:String(hashSeed(draft.appearance+'|next'))})}>Repaint</button></div><p className="studio-small">Structure places surfaces on branches. Appearance changes pigment, without moving the skeleton or foliage.</p>
      <section className="studio-measure"><span className="studio-kicker">FRAME TIME & FILL</span><button className="studio-primary" disabled={measuring||!metrics||metrics.settingsKey!==JSON.stringify(live)} onClick={profile}>{measuring?'Measuring 5s orbit…':'Measure frame time & overdraw'}</button>
        <dl><dt>Scene build</dt><dd>{metrics?.buildMs.toFixed(1)??'—'} ms</dd><dt>Frame rate</dt><dd>{metrics?.fps?.toFixed(1)??'—'} fps</dd><dt>p95 frame</dt><dd>{metrics?.p95FrameMs?.toFixed(1)??'—'} ms</dd><dt>Alpha layers / filled pixel</dt><dd>{metrics?.fill?.meanLayers.toFixed(2)??'—'}×</dd><dt>Rejected quad area</dt><dd>{metrics?.fill?`${(metrics.fill.alphaRejectedFraction*100).toFixed(1)}%`:'—'}</dd></dl>
        {metrics?.fill&&<><Image unoptimized width={metrics.fill.width} height={metrics.fill.height} className="studio-heatmap" src={metrics.fill.heatmap} alt="Sampled foliage overlap heatmap: cool colors indicate fewer layers, warm colors indicate more layers"/><p className="studio-small">Depth-disabled coverage sampled at {metrics.fill.width} × {metrics.fill.height}. This estimates potential alpha overdraw; it is not a hardware fragment counter. CPU readback is excluded from frame timing. Blue indicates low fill; red indicates 14+ potential layers.</p>{(metrics.fill.saturatedPixels+metrics.fill.quadSaturatedPixels)>0&&<p className="studio-small">Some sampled pixels reached the 255-layer limit. These overdraw values are lower bounds.</p>}</>}
      </section>
      <details className="studio-atlas"><summary>Shared foliage atlas · 12 tiles</summary><canvas ref={atlas} data-testid="studio-atlas" aria-label="Broadleaf, blossom and Douglas-fir texture atlas"/><ol>{studioAtlasLabels.map(label=><li key={label}>{label}</li>)}</ol><button onClick={()=>{const a=document.createElement('a');a.href=atlas.current!.toDataURL();a.download='wildloom-studio-atlas.png';a.click();}}>Download transparent atlas</button></details>
      <button onClick={()=>download({settings:live,metrics:metrics?{...metrics,fill:metrics.fill?{...metrics.fill,heatmap:undefined}:undefined}:null,source:'Foliage Studio prototype; procedural design values, no geographic or botanical-presence claim.'},'wildloom-foliage-study.json')}>Download study · JSON</button><p className="studio-small">Blossoms are a decorative study on the preserved broadleaf skeleton, not a species identification or phenology claim.</p>
    </aside></div>
  </main>;
}
