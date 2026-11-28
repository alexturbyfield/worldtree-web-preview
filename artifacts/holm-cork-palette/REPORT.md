# Holm oak — cork-like olive shadow range

[Matched before/after](comparison.png). Changed only `src/lib/forest/holm-oak-study.ts`: lighter olive shadow/body pigments and a softened Holm-only cool-fill multiplier applied by the existing tree-attention material hook. The earlier palette-only adjustment did not fully fix the dark underside because the later lighting multiplier was still suppressing it. No global light, exposure or ambient change.

Actual scene render inspected: shaded crowns are more readable olive, closer to current cork oak; top colors remain muted golden-green. Existing clump repetition remains. Geometry, hierarchical normals,50/50 texture blend, cork oak, ground, camera and lighting unchanged.

Preview: http://localhost:3001/explore?lat=43.72&lon=3.58&habitat=forest&seed=29&density=36&structure=mediterranean-1&appearance=garden&wind=0&expansion=mediterranean

TypeScript passed; final browser capture zero errors, unchanged18 draw calls/1,822,040 triangles. No additional tests, commit, push or deployment. Exact change and feedback: `visual-lab/mediterranean/holm-oak/cork-palette-review.json`.
