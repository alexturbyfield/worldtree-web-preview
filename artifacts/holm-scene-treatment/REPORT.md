# Apply latest holm-oak treatment to scene

[Matched scene comparison](comparison.png) · [Current scene](hero.png) · [Isolated verification](beauty.png).

Changed `src/lib/forest/holm-oak-study.ts`: both near and far Holm-oak batches now default to crown/cluster/card normals0.45/0.40/0.15 and50% original texture-driven /50% brighter A shading. Reuses the exact normal helper from the approved isolated study. Diagnostic experiments retain explicit card/hull controls. No changes to the approved silhouette, leaf geometry, textures, tree placement, new ground/grass materials, cork oak, camera or lighting.

Preview: http://localhost:3001/explore?lat=43.72&lon=3.58&habitat=forest&seed=29&density=36&structure=mediterranean-1&appearance=garden&wind=0&expansion=mediterranean . No extra flags needed. `holmNormals=hull` and `holmNormals=cards` remain explicit fallbacks.

TypeScript and10 focused checks pass. Zero capture errors; counts remain18 draw calls /1,822,040 triangles. Scene and isolated verification rendered and inspected; pixel comparison with the approved isolated halfway treatment recorded in `visual-lab/mediterranean/holm-oak/scene-treatment-review.json`. Other-biome source paths unchanged; no full regression suite or device benchmark. Grass speckling and larger composition limitations remain. Nothing committed, pushed or deployed.
