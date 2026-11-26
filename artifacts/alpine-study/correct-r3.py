from pathlib import Path
p=Path('src/lib/forest/alpine-recipe.ts');s=p.read_text();s="import definition from '../../../visual-lab/alpine/recipe.json';\n"+s
s=s.replace('angle:number;spurs:number}[]','angle:number;spurs:number;summits:number[]}[]')
old='crest=1+.18*Math.sin(v*r.spurs*1.7+p.phase)+.07*Math.sin(v*r.spurs*3.1);mountains=Math.max(mountains,r.height*Math.exp(-Math.pow(Math.abs(u),1.25)*1.8-v*v*.7)*crest);'
new='sample=(v+1.3)/2.6*(r.summits.length-1),k=Math.floor(sample),t=sample-k,crest=k<0||k>=r.summits.length-1?0:r.summits[k]*(1-t)+r.summits[k+1]*t,cross=Math.max(0,1-Math.pow(Math.abs(u),.9));mountains=Math.max(mountains,r.height*cross*crest);'
assert old in s;s=s.replace(old,new)
s=s.replace('const p:AlpinePlan={','const familyRecipe=definition.compositions[family];\n const p:AlpinePlan={').replace("baseElevation:family==='overlook'?2780:family==='treeline'?2350:2550",'baseElevation:familyRecipe.baseElevation').replace("water:family==='valley'",'water:familyRecipe.water').replace("detailedTrees:family==='treeline'?22:family==='valley'?10:4",'detailedTrees:familyRecipe.trees').replace('spurs:4+r()*4}', 'spurs:4+r()*4,summits:[0,.55+r()*.25,.72+r()*.22,.5+r()*.25,.68+r()*.24,.4+r()*.3,0]}').replace('const desired=3600','const desired=definition.performance.grassCount')
p.write_text(s)
p=Path('src/lib/forest/alpine-adapter.ts');s=p.read_text()
s=s.replace("diffuseColor.rgb*=mix(1.,clamp(ink/.42,.75,1.25),.18*", "diffuseColor.rgb*=1.+.035*sin(alpineWorld.y*.17+alpineWorld.x*.02)*smoothstep(130.,350.,d);diffuseColor.rgb*=mix(1.,clamp(ink/.42,.75,1.25),.18*")
p.write_text(s)
