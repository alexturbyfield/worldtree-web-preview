# Mediterranean reconstruction — Checkpoint 1

**Decision: reject this prototype's composition. Do not proceed to Checkpoint 2.** This is a runnable isolated experiment, not a successful concept reconstruction. The actual rendered images were inspected, and their visual defects outweigh the working code. The generic default remains unchanged; no recipe is globally promoted.

[Concept beside actual hero](concept-comparison.png) · [Actual composite hero](hero.png) · [Elevated inspection](inspection.png) · [Isolated generated RGBA matte](matte-original.png) · [Structured critique and provenance](../../visual-lab/mediterranean/checkpoint-1-review.json) · [Construction plan](../../visual-lab/mediterranean/CHECKPOINT-1-PLAN.md).

Local preview: http://localhost:3001/explore?lat=43.72&lon=3.58&habitat=forest&seed=29&density=36&structure=mediterranean-1&appearance=garden&wind=0&expansion=mediterranean . This is the rejected candidate retained for inspection, not an approved preset. Run `npm run dev -- --port 3001` if the server is stopped. No preview was deployed.

## Three largest mismatches
1. **Critical — foreground occlusion.** The broad oak and enlarged shrub leaves fill the view instead of framing a visible valley. The matte is technically present but contributes only small background openings. Correct projected canopy/understory occupancy before any material polish.
2. **Critical — foliage representation.** The enlarged low branchlet asset produces oversized angular leaves and crisscross stems, rather than compact, connected Mediterranean shrub masses. The oak's leaf scale and smooth trunk also miss the reference. Reject this scaled shrub approach; increasing density would make it worse.
3. **Major — soil/rock/landform hierarchy.** Pale rock anchors are concealed, the ground remains flat in color, and the elevated view exposes straight continuation of the provisional soil route beyond the reference frustum. Replace that continuation and verify the major silhouettes without understory before evaluating matte overlap.

## What was built
- One opt-in, geographically gated Mediterranean adapter with a descending valley, lateral shoulders, principal oak roles, shrub fields, embedded rock groups and retained curved grass geometry. All new placements deterministic from seed29; original source individuals/taxonomy retained.
- Frozen-camera projection of the supplied soil reference onto a terrain-rooted world field. The live camera does not drive the soil pattern. The near reference projection is implemented; the provisional out-of-frustum fallback failed visual inspection.
- Shared `landscape-matte.ts` loader with engine-neutral contextual metadata: location/ecoregion/biome, topographic evidence, land cover, presentation seed, season/time/weather, orientation/horizon, physical plane placement and allowed camera envelope. Existing sky and fog remain separate. It supports multiple declared planes, but this prototype uses exactly one. No runtime image-generation service or automatic relighting.
- One offline-generated RGBA limestone-garrigue landscape asset. The loaded asset identity is frozen; reproducibility of the image generator's internal randomness is not claimed. The matte is hidden in elevated inspection and outside its encounter envelope. Broad geology is regionally plausible; exact ridges are synthetic, not derived from a DEM. The current occlusion prevents visual integration approval.

## Counts and checks
Hero at640x360: **17 draw calls; 2,098,928 submitted triangles; 16 geometries; 9 textures**. Inspection:15 calls;2,098,924 triangles. Dressing:5,200 existing curved-grass instances;1,720 instanced shrubs;108 instanced rocks;11 candidate-oak presentation occurrences. These costs are high for an unsuccessful image and do not establish mobile suitability. CPU submission time is not GPU frame time or device FPS.

`npx tsc --noEmit` passed. Three targeted Mediterranean tests passed: deterministic/nonmutating source-linked composition and actual wood-geometry construction; geographic/opt-in fallback routing; stable reference soil sampling and matte context/envelope declarations. One runtime branch-tangent defect was found and corrected before the successful capture. Final capture had zero page/console errors and no asset failures. Passing these checks is not artistic approval.

No holdouts, other seeds or full protected-scene render suite were run under the requested exploratory scope. Approved biome recipe sources were not changed. Shared edits are restricted to an ID type union, explicit opt-in dispatch, and pick-source mapping for this new candidate. Existing uncommitted material-workbench changes were preserved. No commit, push, deployment or global promotion.

## Files changed for this checkpoint
New runtime files: `src/lib/forest/mediterranean-recipe.ts`, `mediterranean-adapter.ts`, `landscape-matte.ts`.
Small integration changes: `src/lib/forest/wave1.ts`, `wave2-shared.ts`, `painted-renderer.ts`.
Assets: `public/assets/mediterranean/herault-garrigue-distance-v1.webp`, `reference-soil-mask.json`.
Checks: `tests/mediterranean.test.ts`.
Lab: four entries in existing `visual-lab/references.json`; `visual-lab/mediterranean/` holds all four supplied references, construction plan, regional candidate evidence, asset manifest and rejected experiment review. Capture configuration, images, original matte and frozen source hashes are here. The four supplied originals are local reference material; no claim of redistributed rights or training eligibility is made.

## Ecological/geographic conflicts
Actual map lookup is ECO799, Northeast Spain and Southern France Mediterranean forests; botanical area FRA. Existing WCVP data documents Quercus ilex in France, not verified occurrence at43.72,3.58. Fixed structural seed `mediterranean-1` exposes this existing candidate in the normal sampled palette; no new named taxon was invented. Country-range sampling also returns irrelevant montane candidates, which this presentation excludes. Woody shrubs and grass remain unnamed growth-form placeholders; flower identification and fidelity were not attempted.

Regional limestone-garrigue context is supported by [BRGM](https://infoterre.brgm.fr/rapports/RP-51718-FR.pdf); regional holm-oak woodland by [Haut-Languedoc park](https://www.parc-haut-languedoc.fr/sites/parc-haut-languedoc.fr/files/files/EDL_PNRHL_Foret_Fili%C3%A8re-bois_240507.pdf). These do not establish exact coordinate lithology, soil, habitat, terrain heights or current land cover. No unsupported high mountains, sea or landmarks were added. The matte depicts synthetic low regional-style ridges in one compatible golden-hour state; a different state requires a compatible asset, not tinting this one indiscriminately.

Recommendation: authorize another **Checkpoint 1 composition/representation pass**, not Checkpoint 2. Solve the clear valley view and shrub leaf scale first. Preserve this failed result as a negative example. No successful global artistic rule has been inferred from it.
