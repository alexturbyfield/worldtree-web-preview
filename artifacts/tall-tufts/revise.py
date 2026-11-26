from pathlib import Path
p=Path('src/lib/forest/savanna-recipe.ts');s=p.read_text()
s=s.replace("x=side*(5+r()*6);z=28+r()*11;", "x=side*(5+r()*6);z=28+r()*11;if(tuft==='c'){x=side*(2.2+r()*4.5);z=23+r()*8;}")
s=s.replace("name:'Layered flowing tufts',blades:11,width:.04,height:1.8,bend:.9,spread:.7,highlight:.35", "name:'Arched highlight tufts',blades:11,width:.032,height:1.8,bend:1.15,spread:.65,highlight:.45")
s=s.replace("v.y=-.08+h*(t-.17*t*t*t)", "v.y=-.08+h*(id==='c'?Math.sin(t*Math.PI*(.65+.08*Math.sin(j*1.3))):(t-.17*t*t*t))")
s=s.replace("${tuft?tuftProfile(tuft).highlight:'.12'}", "${tuft?tuftProfile(tuft).highlight+'*(1.-smoothstep(18.,65.,d))':'.12'}")
p.write_text(s)
