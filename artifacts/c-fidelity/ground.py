from pathlib import Path
p=Path('src/lib/forest/savanna-recipe.ts');s=p.read_text()
s=s.replace("const plains=id.startsWith('r-plains'),", "const fidelity=id.startsWith('r-fidelity'),plains=id.startsWith('r-plains')||fidelity,")
s=s.replace("full=id==='r-full'||", "full=id==='r-fidelity'||id==='r-full'||")
s=s.replace("hasGrass=id==='r-grass'||", "hasGrass=id==='r-fidelity-grass'||id==='r-grass'||")
s=s.replace('map,contacts,golden,plains)', 'map,contacts,golden,plains,fidelity)').replace('map,[],true,plains)', 'map,[],true,plains,fidelity)')
s=s.replace("'r-plains'].includes(id)","'r-plains','r-fidelity-ground','r-fidelity-grass','r-fidelity'].includes(id)")
s=s.replace('golden=false,plains=false){','golden=false,plains=false,fidelity=false){')
s=s.replace("return a;}\n `;", "${fidelity?`float north=34.-p.y+sin(p.x*.045+p.y*.027)*5.;float progress=smoothstep(3.,38.,north);vec3 near=mix(${c('#6C603E')},${c('#99763C')},smoothstep(.15,.85,s));vec3 middle=mix(${c('#CB9138')},${c('#E9B650')},smoothstep(.15,.78,s));a=mix(near,middle,progress);float breakLight=smoothstep(.63,.96,sweep(p+vec2(11.,-3.)));a=mix(a,${c('#E9B650')},breakLight*(1.-progress)*.4);float rollShade=(1.-smoothstep(.24,.57,sweep(p+vec2(-8.,12.))))*.26;a=mix(a,${c('#6C603E')},rollShade*(1.-progress*.7));`:''}return a;}\n `;")
s=s.replace("float painted=clamp", "${fidelity?`base=mix(base,${c('#C7B28A')},smoothstep(65.,145.,length(recipeWorld.xz-vec2(0.,34.))))*.65);`:''}float painted=clamp") if False else s
# Existing stable distance ramps retain world anchoring; new pigment supplies near/middle organization.
s=s.replace("+'-'+plains+'-'+JSON.stringify(p)","+'-'+plains+'-'+fidelity+'-'+JSON.stringify(p)")
p.write_text(s)
