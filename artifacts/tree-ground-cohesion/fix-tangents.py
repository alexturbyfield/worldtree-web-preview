from pathlib import Path
p=Path('src/lib/forest/tree-experiment.ts');s=p.read_text();s=s.replace('first=study.segments.length,wood:Segment[]=[];', 'first=study.segments.length,wood:Segment[]=[],direction=anchor.map((v,k)=>v-parent.anchor[k]) as Point,length=Math.hypot(...direction),tangent=direction.map(v=>v/length) as Point;')
s=s.replace("depth:2,pathId,parentPathId:parent.branchId,color:'#81705a'", "depth:2,pathId,parentPathId:parent.branchId,tangentA:tangent,tangentB:tangent,capStart:false,capEnd:i===3,color:'#81705a'")
p.write_text(s)
