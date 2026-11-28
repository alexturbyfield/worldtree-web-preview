from pathlib import Path
p=Path('src/lib/forest/tree-experiment.ts');s=p.read_text();s=s.replace("import type {SceneRecipe}","import type {StudioStudy} from '../studio/groups';\nimport type {Point,Segment} from './tree';\nimport type {SceneRecipe}")
s=s.replace("['baseline','A','B','C','C2']", "['baseline','A','B','C','C2','C3']")
s=s.replace("const p=profiles.profiles[requested as keyof typeof profiles.profiles]", "const p=profiles.profiles[(requested==='C3'?'C':requested) as keyof typeof profiles.profiles]")
s=s.replace("const studio=speciesV1Study('acacia',q,()=>[],design),replacement={...hero,model:studio.model,studio};", "let studio=speciesV1Study('acacia',q,()=>[],design);if(requested==='C3')studio=withUpperClump(studio);const replacement={...hero,model:studio.model,studio};")
s=s.replace("t=>t.id===hero.id?replacement:t)", "t=>{if(t.id===hero.id)return replacement;if(requested!=='C3'||t.model.presetId!=='acacia')return t;const scale=Math.min(1,Math.max(.3,t.model.dimensions.height/9.73)),profile={...p,height:p.height*scale,radius:p.radius*scale,trunk:{...p.trunk,radius:p.trunk.radius*scale,leaderSpread:p.trunk.leaderSpread*scale},foliage:{...p.foliage,width:p.foliage.width*scale,length:p.foliage.length*scale}};const background=speciesV1Study('acacia',librarySettings('acacia',t.seed,t.appearanceSeed??recipe.appearanceSeed),()=>[],{...design,height:profile.height,radius:profile.radius,trunk:profile.trunk.radius,visualGrammar:profile});return {...t,model:background.model,studio:background};})")
s+='''
/** Exactly one extra living clump; the existing sparse C crown and its source seed remain unchanged. */
function withUpperClump(study:StudioStudy):StudioStudy{
 const parent=[...study.groups].filter(g=>g.anchor[1]>study.model.dimensions.height*.72).sort((a,b)=>Math.hypot(a.anchor[0],a.anchor[2])-Math.hypot(b.anchor[0],b.anchor[2]))[0];if(!parent)return study;
 const anchor:Point=[parent.anchor[0]*.55,study.model.dimensions.height+.2,parent.anchor[2]*.65],pathId=Math.max(...study.segments.map(s=>s.pathId??0))+1,id=study.groups.length,first=study.segments.length,wood:Segment[]=[];
 for(let i=0;i<4;i++){const at=(t:number)=>parent.anchor.map((v,k)=>v+(anchor[k]-v)*t) as Point;wood.push({a:at(i/4),b:at((i+1)/4),r0:.035*(1-i*.19),r1:.035*(1-(i+1)*.19),depth:2,pathId,parentPathId:parent.branchId,color:'#81705a'});}
 const group={...parent,id,anchor,center:anchor,radii:[1.3,.5,1.1] as Point,branchId:pathId,parentBranchId:parent.branchId,branchIndex:first+3,axis:anchor.map((v,k)=>v-parent.anchor[k]) as Point};
 const sprays=study.fronds.filter(f=>f.groupId===parent.id).map((f,i)=>({...f,groupId:id,position:f.position.map((v,k)=>anchor[k]+(v-parent.anchor[k])*.8) as Point,width:f.width*.8,length:f.length*.8,essential:i===0}));
 const segments=[...study.segments,...wood],model={...study.model,segments,dimensions:{...study.model.dimensions,height:anchor[1]+.7}};
 return {...study,model,segments,groups:[...study.groups,group],fronds:[...study.fronds,...sprays]};
}
'''
p.write_text(s)
p=Path('src/lib/forest/savanna-recipe.ts');s=p.read_text()
s=s.replace("const tall=id==='r-fidelity-tuft-hybrid-tall',", "const cohesion=id==='r-fidelity-tuft-cohesion',tall=cohesion||id==='r-fidelity-tuft-hybrid-tall',")
s=s.replace('brush?loadBrush():undefined,hybrid)', 'brush?loadBrush():undefined,hybrid,cohesion)')
s=s.replace('surfaceMaterial(recipe,0,map,[],true,plains,fidelity)', 'surfaceMaterial(recipe,0,map,[],true,plains,fidelity,undefined,undefined,false,cohesion)')
s=s.replace("'h',undefined,true)", "'h',undefined,true,cohesion)")
s=s.replace('brushAtlas?:T.Texture,hybrid=false){','brushAtlas?:T.Texture,hybrid=false,cohesion=false){')
s=s.replace("near=mix(${c('#6C603E')},${c('#99763C')}", "near=mix(${c(cohesion?'#876A3D':'#6C603E')},${c(cohesion?'#B68B46':'#99763C')}")
s=s.replace("a=mix(a,${c('#6C603E')},rollShade", "a=mix(a,${c(cohesion?'#80663D':'#6C603E')},rollShade")
s=s.replace('${p.textureContrast.toFixed(4)}*(.4+.6*fine)', '${(p.textureContrast*(cohesion?.7:1)).toFixed(4)}*(.4+.6*fine)')
s=s.replace("+'-'+hybrid+'-'+JSON.stringify(p)","+'-'+hybrid+'-'+cohesion+'-'+JSON.stringify(p)")
s=s.replace("'r-fidelity-tuft-hybrid-tall'].includes(id)","'r-fidelity-tuft-hybrid-tall','r-fidelity-tuft-cohesion'].includes(id)")
s=s.replace("brushHeightMultiplier:tall?1.75:1,", "brushHeightMultiplier:tall?1.75:1,...(cohesion?{rootPalette:'warm-amber-olive-v2',nearPigments:['#876A3D','#B68B46','#80663D'],textureContrastMultiplier:.7}:{}),")
p.write_text(s)
