# Mediterranean — corrective Checkpoint 1 pass

**Retain provisionally as a clear structural improvement; not concept-quality, not human-approved, and not ready to advance automatically to Checkpoint 2.** One implementation pass, seed29, same fixed camera, same matte, no autonomous correction loop.

[Before / after](before-after.png) · [Concept / current](concept-comparison.png) · [Hero](hero.png) · [Inspection](inspection.png) · [Structured review](../../visual-lab/mediterranean/checkpoint-1-r2-review.json).

Local preview: http://localhost:3001/explore?lat=43.72&lon=3.58&habitat=forest&seed=29&density=36&structure=mediterranean-1&appearance=garden&wind=0&expansion=mediterranean . Run `npm run dev -- --port 3001` if needed.

## Visible result
The foreground thicket no longer fills the image. The oak frames the left, the pale rock groups are visible, and the central valley/sky opening exposes the distant matte. Compact small-leaf shrubs replace the enlarged tundra geometry. Actual hero and inspection images were viewed against the supplied concept and rejected baseline; this was primary-agent visual inspection, not independent review.

The result is still substantially less attractive than the concept. Three main defects remain:
1. Middle-distance vegetation is sparse and speckled, with insufficient connected shrub masses or terrain rhythm. The matte reads as a narrow horizontal band, not convincing integrated depth.
2. Oak wood, foliage sprays and rock forms remain coarse. Bright angular leaf sprays and smooth bark do not match the concept's sculptural tree.
3. The invented straight soil fallback and out-of-bounds mask repetition are removed, but inspection still reveals projection-derived streaks. The reference needs terrain-aware route interpretation, not simple projection alone. Flat soil/material color is also unresolved; detailed material work remains deferred.

## Changes
- `src/lib/forest/mediterranean-recipe.ts`: lateral oak placement, narrower crown and smaller sprays; source identities/seeds retained; no soil-route invention outside reference frustum.
- `src/lib/forest/mediterranean-shrub.ts`: compact, branch-supported small-leaf geometry with near/middle/far detail. Opaque dimensional leaves, not crossed cards or closed spherical crowns. Unnamed ecological growth-form approximation.
- `src/lib/forest/mediterranean-adapter.ts`: shrub representation/distribution with low lateral framing; prevent soil-mask clamp repetition outside the world field.
- `tests/mediterranean.test.ts`: outside-view soil behavior and physical shrub bounds/LOD checks, alongside existing nonmutation/seed/source-routing and actual wood-construction checks.
- `visual-lab/mediterranean/checkpoint-1-r2-review.json`: observations, limitations, provisional decision and rejected projection assumption. Original failed evidence remains intact. Before/after source snapshots and capture configuration are stored here.

The supplied references and previously generated matte are unchanged. Camera, terrain height function, grass geometry, lighting, species data and approved biome implementations are unchanged. Smaller shrub counts reduce cost rather than filling the scene with more geometry. No new assets, dependencies, research, commit, push or deployment.

## Checks and performance
`npx tsc --noEmit`: passed. `npx tsx --test tests/mediterranean.test.ts`:4 passed,0 failed. Capture:zero page/console errors; assets loaded. Hero:16 calls,1,647,828 submitted triangles,15 geometries,9 textures (previous17 calls,2,098,928 triangles). Approximately21.5% fewer submitted triangles. Inspection:14 calls,1,647,824 triangles; matte hidden as declared. Instances:5,200 grass,720 shrubs,108 rocks and11 source-linked oak occurrences. These are headless desktop/software renderer counts, not mobile performance approval. No other seeds, holdouts or comprehensive protected-scene renders were run in this bounded pass.

Recommendation: keep this correction as the new provisional composition baseline, but resolve connected middle-ground masses and terrain-aware soil trajectory before advancing. Wait for human art direction.
