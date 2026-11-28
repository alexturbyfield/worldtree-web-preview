# Wildloom scene renderer audit

Same scene: Seattle, forest, placement seed `29`, structure `grove-1`, appearance `garden`, density 24; camera `(58,39,70)` aimed at `(0,9,0)`.

**Mismatch found:** foreground trees 8 and 10 were **Picea sitchensis**, not Douglas-fir. Their explicit visual fallback selected the legacy `spruce` generator: `generatePainterlyTree -> generateCanopy -> generateCanopyBillboards -> batchCanopyBillboards/canopyBillboardMaterial`. Trees 6 (western hemlock) and 14 (Pacific silver fir) used that same fallback.

Actual Douglas-firs 12 and 15 already followed `sceneLibraryStudy -> createStudioStudy -> evergreenBoughStudy`. Both complete study objects are unchanged against the prior exported recipe.

## Every tree after the routing correction

| Tree indices (zero based) | Visual generator |
|---|---|
| 0,1,3,4,9,16,17,20,22,23 | referenceOak -> attachOakCoverage -> volumetricClusterStudy; explicitly labeled broadleaf fallbacks |
| 2,5,21 | speciesV1Study: Ponderosa pine |
| 7 | speciesV1Study: Quaking aspen |
| 11,13,19 | speciesV1Study: Bigleaf maple |
| 18 | speciesV1Study: Western red cedar |
| 12,15 | evergreenBoughStudy: actual Douglas-fir V1 |
| 6,8,10,14 | evergreenBoughStudy: explicit conifer visual fallbacks, ecological identities retained |

All now draw through `mountForest -> mountPaintedForest -> libraryFoliageBatch -> studioGeometry -> studioFoliageMaterial`: batched curved alpha-cutout atlas patches, no solid canopy geometry.

## Targeted correction and appearance

Changed only `src/lib/forest/presets.ts`, `recipe.ts`, and `painted-renderer.ts`. Added a separate `rendererPresetId` for unsupported conifer fallbacks, retaining the original archetype ID used to derive structural seeds. Batching now keys on the actual study design so the correct species material is used.

V1 settings reach the shared material as `view=conifer`, `evergreenStudy=true`, `palette=sage`; its existing cool shadow/sage outer pigments are `#163c37 / #647f65 / #a5b697`. Atlas tiles 8–11 and individual vertex pigments remain in use. Shared atlases use scene appearance `garden`; per-tree appearance hashes remain independent. Existing forest density/detail controls remain distinct from Atelier defaults and were not changed.

No legacy foliage mesh draws in this capture. The old renderer remains available for Diagram and other existing named presets; the forest still allocates its unused legacy material resource. No geometry generator, density, palette definition, lighting, placement or camera edits.

Validation: TypeScript passed; browser reported no errors; all 24 identities, seeds, positions and rotations matched the prior recipe, and art controls matched exactly. Capture: 9 draw calls, 178,428 triangles, distant LOD on software rendering (not a hardware benchmark). No deployment.

Individual tree trace: [JSON](wildloom-forest-render-audit.json). Screenshot: [PNG](wildloom-forest-render-audit.png).
