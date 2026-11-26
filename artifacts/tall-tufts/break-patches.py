from pathlib import Path
p=Path('src/lib/forest/savanna-recipe.ts');s=p.read_text()
s=s.replace('edgeMat,tuft?240:', "edgeMat,tuft==='c'?150:tuft?240:")
s=s.replace("if(tuft==='c'){x=side*(2.2+r()*4.5);z=23+r()*8;}", "if(tuft==='c'){const theta=r()*6.283,rad=Math.sqrt(r());x=side*(side<0?5.4:7.2)+Math.cos(theta)*rad*2.;z=(side<0?25:22)+Math.sin(theta)*rad*2.3;}")
s=s.replace('*(tuft?.65+r()*.4:', "*(tuft==='c'?.35+r()*.55:tuft?.65+r()*.4:")
s=s.replace("name:'Arched highlight tufts',blades:11,width:.032,height:1.8,bend:1.15", "name:'Broken arched highlight tufts',blades:7,width:.032,height:1.65,bend:1.05")
s=s.replace('frameInstances:tuft?240:', "frameInstances:tuft==='c'?150:tuft?240:")
s=s.replace("tuftProfile(tuft).highlight+'*(1.-smoothstep(18.,65.,d))'", "tuftProfile(tuft).highlight+(tuft==='c'?'*(1.-smoothstep(18.,65.,d))':'')")
p.write_text(s)
