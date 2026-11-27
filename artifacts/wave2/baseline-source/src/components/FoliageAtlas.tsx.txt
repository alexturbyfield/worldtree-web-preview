'use client';
import {useEffect,useRef} from 'react';
import {CANOPY_ATLAS_LABELS,getFoliageAtlas} from '@/lib/forest/foliage-atlas';
export default function FoliageAtlas({appearanceSeed}:{appearanceSeed:string}){
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{const atlas=getFoliageAtlas(appearanceSeed,512,true),node=canvas.current!;node.width=atlas.width;node.height=atlas.height;node.getContext('2d')!.drawImage(atlas.canvas,0,0);},[appearanceSeed]);
  const download=()=>{const a=document.createElement('a');a.href=canvas.current!.toDataURL('image/png');a.download='wildloom-foliage-atlas.png';a.click();};
  return <details className="foliage-atlas-preview" open><summary>Procedural foliage atlas</summary><p>Eight reusable cutouts · painted pigment before per-tree tint. Transparent gaps remain empty.</p><canvas ref={canvas} data-testid="foliage-atlas" aria-label="Atlas of Douglas-fir, pine, spruce, oak and acacia foliage cutouts"/><ol>{CANOPY_ATLAS_LABELS.map((label,i)=><li key={label}><b>{i+1}.</b> {label}</li>)}</ol><button onClick={download}>Download atlas · transparent PNG</button></details>;
}
