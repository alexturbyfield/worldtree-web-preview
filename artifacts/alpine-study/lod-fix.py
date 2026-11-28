from pathlib import Path
p=Path('src/lib/forest/painted-renderer.ts');s=p.read_text().replace("import {readAlpineOptions}","import {alpineHeight,readAlpineOptions}")
s=s.replace('(t.studio&&segment.depth<=2)', '(t.studio&&segment.depth<=(alpine&&Math.hypot(t.position[0]-alpine.alpinePlan.camera.position[0],t.position[2]-alpine.alpinePlan.camera.position[2])>60?1:2))')
s=s.replace("const far=!lab&&camera.position.distanceTo(controls.target)>(mobile?76:125);", "const far=alpine?camera.position.y-alpineHeight(alpine.alpinePlan,camera.position.x,camera.position.z)>25:!lab&&camera.position.distanceTo(controls.target)>(mobile?76:125);")
p.write_text(s)
