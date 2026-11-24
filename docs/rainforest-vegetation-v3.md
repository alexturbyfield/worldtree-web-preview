# Amazon Rainforest Vegetation Architecture V3

[Before / after / elevated comparison](../artifacts/rainforest-v3-comparison.png) · [Representative silhouettes](../artifacts/rainforest-v3-silhouettes.png) · [Exact counts and counters](../artifacts/rainforest-v3-report.json)

## Diagnosis grounded in the renderer

`createSceneRecipe()` in `forest/recipe.ts` selects the resolver-approved palette and calls `sceneLibraryStudy()` in `forest/library.ts`. That reuses `speciesV1Study()` in `studio/species-v1.ts`. `arrangeArchetype()` in `forest/composition-archetype.ts` then creates composition instances, rendered through `libraryFoliageBatch()` and the painted forest renderer. Ecological eligibility is unchanged.

The V2 Amazon actually uses Swietenia macrophylla (`mahogany`), Hevea brasiliensis (`rubber`), Cecropia peltata (`cecropia`), Euterpe precatoria (`acai`) and Theobroma cacao (`cacao`). Kapok and Asian dipterocarps are not present or added. Regional range evidence does not verify local occurrence at this coordinate.

- Mahogany has one tall leader and formerly `base=.5`, `apicalBias=.5`, `radiusProfile=[.75,1.05,.22]`: elevated branch initiation plus strong rise toward the leader top leaves a clear bole and thin elevated crown segments. `speciesV1Study()` computes primary origins from base/leaderTop and secondaries from each primary; leaf guides follow those curves.
- Rubber's old forkHeight `.52` and base `.46` create a high scaffold. It and mahogany supply the elevated isolated crown masses.
- Açaí legitimately has a slender largely bare stem and terminal fronds (`form='palm'`, base `.93`); turning it into a branching broadleaf would contradict its identity. Cecropia legitimately has open palmate umbrellas (`form='palmate'`, base `.62`). Both were compositionally misused as substitutes for a connecting main canopy.
- Foreground large lobed leaves are Cecropia, not oak. Additional oversized solid fans come from `dressBiome()` using the same generic ground geometry for grass, shrubs and understory, with size multipliers 1/2/3 and foreground scaling.

## One implementation pass

Three source files changed in this pass; no renderer, atlas, lighting or ecological database edits:

- `studio/species-v1.ts`: mahogany base `.5 → .42`, primary/secondary rise `.35/.4 → .18/.26`, clusterSize `2.05 → 2.35`, radius profile `[.75,1.05,.22] → [.85,1.08,.58]`, apical bias `.5 → .18`. Existing buttresses and shared primary/secondary generation remain. Rubber forkHeight `.52 → .38`, base `.46 → .34`, rise `.12/.18 → .26/.3`, radius profile `[.88,1.05,.62] → [.76,1.08,.73]`. This changes only these two rainforest species profiles wherever they are used; it does not fork generators.
- `forest/composition-archetype.ts`: explicit stratum metadata and optional eligible-design preference; two mahogany emergents, 14 main-canopy instances, eight smaller Cecropia/açaí subcanopy instances, 12 cacao understory instances. Near canopy shoulders overlap the camera edges; rear canopy anchors maintain irregular bands. Rear main-canopy instances retain essential fronds and alternate foliage groups for lower detail using existing batching. No additional trees.
- `forest/biome-visual.ts`: Amazon-only ground scale reductions (grass ×.5, shrub ×.34, understory ×.25) and irregular patches around existing woody bases. The opening remains protected. No inferred environmental features or named ground-plant species are invented. Dedicated fern/shrub species assets remain unavailable; unnamed broadleaf dressing is not claimed to be a botanical palette.

Structure/appearance seeds remain independent and unchanged. Sky, fog, physical light settings, focal illumination and encounter camera remain unchanged. Puget and savanna captured PNGs are byte-identical to their V2 counterparts.

## Counts and cost

36 trees: 12 Swietenia, 4 Hevea, 5 Cecropia, 3 Euterpe, 12 cacao. Of those, 2 are emergent, 14 main canopy, 8 subcanopy and 12 understory. These are art-directed instances, not ecological abundance. Ground dressing retains 480 small ground fans, 140 shrub-form fans and 160 understory fans (780 unnamed instances).

V2 → V3: 19 → 19 draw calls; 714,124 → 596,624 triangles (~16.5% reduction). Actual Chromium software-renderer counters at the encounter camera, not Android FPS/GPU measurements. TypeScript, targeted deterministic/input/palette/seed/missing-data checks and diff whitespace checks passed. Final scene captures report no page/shader errors. No comprehensive tests, build or deployment.

## Visual evaluation / limitations

Foreground scale is improved and main-canopy shoulders now interlock overhead, with smaller palmate saplings and cacao below. Mahogany remains an emergent with integrated buttresses, rubber keeps its multi-leader identity, and palms are not converted to generic trees.

The elevated diagnostic still exposes large canopy gaps and the coarse horizon surface. Background thinning can make crowns look granular; several mahogany crowns still read as separated branch masses. Warm focal illumination is weaker than the intended illustrated target, and existing planar shaft hints remain visibly artificial. These are unresolved, not a claim of a finished convincing rainforest. No extra fog was added to mask them. Stop after this first pass for visual review.

The silhouette sheet compares mahogany, rubber and cacao using structural seed 29 and normalized framing, not their relative world heights or literal individual forest seeds. Elevated view is a coverage diagnostic of the actual scene, not a separate showcase.

## Preview

Run `npm run dev -- --port 3001`, then open:

`/explore?lat=-3.12&lon=-60.02&habitat=forest&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human&composition=C&groundLighting=B&illumination=on`

Baseline is preserved as an image; no source rollback or extra runtime version system was introduced for this pass.
