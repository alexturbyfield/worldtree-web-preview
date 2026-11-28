# Cork oak — quasi-realistic painterly treatment

[Matched before/after](comparison.png): original left, new treatment right. Existing seed29, same camera, lighting, exposure, geometry, alpha texture and instance transforms.

Changed `src/lib/forest/cork-oak-hero.ts` only at runtime: blend normalized 3D crown/terminal-cluster/card fields0.45/0.40/0.15; retain50% physically lit original leaf texture color and50% brighter painterly pigment driven by the actual directional sun. Bark keeps its generated texture with a modest pigment lift and lower bump strength. Geometry, source tree data, branch architecture and leaf placement are unchanged. Holm-oak materials and all other environment implementations are untouched.

Actual image review: foliage reads as illuminated olive rather than dark muddy tufts; bark is more readable. Crown remains sparse and tips can be quite pale; this pass intentionally does not reshape or fill it. Provisional cork treatment, not user approval. The user's approval of the right-hand holm-oak treatment is separately recorded.

Preview: http://localhost:3001/explore?lat=43.72&lon=3.58&habitat=forest&seed=29&density=36&structure=mediterranean-1&appearance=garden&wind=0&expansion=mediterranean . New cork treatment is default; append `&corkTreatment=original` for the old appearance.

TypeScript passed;7 focused checks passed; actual shader renders had zero page/console errors. Position/UV/instance-matrix hashes match. Both isolated renders:2 draw calls/18,048 triangles. No physical-device performance claim, architectural refactor, commit, push or deployment. Evidence and feedback: `visual-lab/mediterranean/cork-oak/halfway-treatment-review.json`.
