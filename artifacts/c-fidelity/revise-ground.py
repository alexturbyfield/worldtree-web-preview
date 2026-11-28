from pathlib import Path
p=Path('src/lib/forest/savanna-recipe.ts');s=p.read_text().replace("progress=smoothstep(3.,38.,north)","progress=smoothstep(2.,30.,north)").replace("vec3 middle=mix(${c('#CB9138')},${c('#E9B650')},smoothstep(.15,.78,s));", "vec3 middle=mix(${c('#E9B650')},${c('#FFE0A0')},smoothstep(.12,.85,s)*.72);")
p.write_text(s)
