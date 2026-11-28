from pathlib import Path
p=Path('src/lib/forest/savanna-recipe.ts');s=p.read_text().replace('steps=detail?6:2','steps=detail?6:4').replace('(detail?.065:.085)','(detail?.052:.039)').replace('smoothstep(.35,.95,fibreTip)*.28','smoothstep(.35,.95,fibreTip)*.12');p.write_text(s)
