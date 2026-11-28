# Holm oak — material A, hull-following normals

[Matched before/after](before-after.png) · [Scene](hero.png) · [Lab evidence](../../visual-lab/mediterranean/holm-oak/hull-normals-review.json).

Changed `src/lib/forest/holm-oak-study.ts`: retains A as the default material; replaces spray/grid normal variation with a smooth ellipsoidal crown-gradient normal at each existing world-batched vertex. Normals are computed in each tree's local coordinates and rotated back to world space. Bark, geometry positions/indices/UVs, alpha cutouts, lighting, camera, cork hero and other biomes are unchanged. `tests/holm-hull-normals.test.ts` verifies normalization, hull direction and continuity. This is not a new shader or scene-generation pipeline.

Actual images inspected: broad warm upper-left illumination and cool lower-canopy shadow replace the noisy alternating card lighting. The treatment now looks smooth and dimensional; fine surface detail may be too subdued. Retained for review, not additional artistic approval. No autonomous follow-up pass.

Preview: http://localhost:3001/explore?lat=43.72&lon=3.58&habitat=forest&seed=29&density=36&structure=mediterranean-1&appearance=garden&wind=0&expansion=mediterranean . A is now default; append `&holmMaterial=A&holmNormals=cards` for old normals. Other material choices remain available; `holmMaterial=baseline` explicitly restores prior material treatment.

TypeScript passed;8 focused tests passed; browser capture had zero errors. Counts remain18 draw calls/1,822,040 submitted triangles. Pixel foreground-mask comparison is stored in the Lab record. No device performance claim, holdout/regression sweep, commit, push or deploy.
