# Wave 1 — visual-review checkpoint

Three runnable biome prototypes are available. **The visual acceptance criteria are not met.** Actual vision inspection found major defects in all three; none is human-approved or promoted into default/global recipes. The strongest technical checkpoints remain opt-in, with the existing generic renderer accessible. No Wave 2 expansion, commit, push or deployment was performed.

![Real references, unchanged generic baselines and retained prototypes](comparison.png)

![Inspection views expose remaining weaknesses](inspection.png)

## Preview and source organization

The combined development preview is running on port3001. Use the existing encounter/orbit UI; append `&camera=inspection` for the elevated starting view. Replace `seed=29` with41 for another training seed.

| Study | Preview | Isolated workstream |
|---|---|---|
| Desert / xeric shrubland13 | [Open seed29](http://localhost:3001/explore?lat=34&lon=-116.15&habitat=forest&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&camera=human&wave1=desert) | `feat/biome-desert-lab`, sibling worktree `worldtree-biome-labs/desert` |
| Mangrove14 | [Open seed29](http://localhost:3001/explore?lat=25.2&lon=-80.9&habitat=coastal&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&camera=human&wave1=mangrove) | `feat/biome-mangrove-lab`, sibling worktree `worldtree-biome-labs/mangrove` |
| Flooded grassland9 | [Open seed29](http://localhost:3001/explore?lat=26.209957419&lon=-80.9383825925&habitat=wetland&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&camera=human&wave1=flooded) | `feat/biome-flooded-grassland-lab`, sibling worktree `worldtree-biome-labs/flooded` |

All workstreams start at `b1f4a12d21d281f74fed23932daa056d2da845cb`; changes are uncommitted working changes on the requested local branches. Their modules have also been copied into the base working tree for combined review. Nothing was merged into main. Shared integration is owned centrally, avoiding competing renderer edits.

Existing authored Puget, savanna, rainforest and alpine paths were inspected before implementation. These three new categories previously used generic terrain/specimen presentation rather than authored complete scenes. The bounded implementation extends the existing renderer with one opt-in adapter, not another rendering pipeline or reference authority.

## Actual visual critique

The parent agent interpreted actual photographs and screenshots with the vision-capable `view_image` tool. Module agents also reviewed their own captures. Parent initial critiques were separate from module implementation, but not blind or independent human reviews. Final reference/baseline/prototype and inspection sheets above were actually inspected. Metadata and RGB checks were never treated as aesthetic approval.

| Biome | Visible evidence and severity | Diagnosis / next investment | Decision |
|---|---|---|---|
| Desert | **Major:** smooth ochre/clay outcrops, geometric green shrub lobes and expansive uniform substrate. Inspection exposes isolated dressing islands and rounded mound-like ridges. Holdout5189 still contains a disproportionately large cropped foreground rock. | Current rock surface/normal representation and fixed foreground anchor logic are inadequate; smooth ridge functions do not reproduce the photographed fracture/erosion hierarchy. A subsequent rock/substrate representation study is warranted, rather than more instance density. | Reject artistic approval. Retain rolled-back prototype only for review. |
| Mangrove | **Major:** recognizable prop roots and dark reflections establish identity, but crowns are noisy leaf marks, banks form planar canal ledges, pale far trees leave gaps, and inspection reveals an almost barren landscape outside the decorated corridor. Seed617 retains these defects. | The existing red-mangrove architecture is useful. Shore-field geometry, wet-to-dry material transition and multi-directional vegetation continuation need coordinated work. Generic stacked ellipsoids did not solve continuity attractively. | R2 stronger than alternatives, but not good enough to approve. |
| Flooded grassland | **Major:** seed29 presents a broad smooth canal; seeds41/613 emphasize lush but repetitive grass and can hide most water from human height. Inspection shows hard bank ribbons, sparse distant geometry and similar network structure. | World-area water fraction alone does not predict projected encounter composition. Water-window scale, bank transition and correlated near/far vegetation fields need joint evaluation. | R3 improves dimensional plants; overall artistic acceptance fails. |

Reference relationships remain the target: fractured geological hierarchy and sparse connected xeric vegetation; mangrove root/canopy enclosure around irregular water openings; wetland vegetation masses interlocking with small reflective windows. Current prototypes do not yet reproduce those relationships convincingly.

## Experiments, evidence and stopping

- **Desert:** R1 crude rocks/sparse near vegetation; R2 shrub cones resembled conifers; R3 lobed shrubs improved identity but remained mechanical. Training29 inspection exposed circular/grid gravel stamps, which were rolled back. Earlier holdout5171 remains negative evidence; after rollback/freeze a fresh5189 still failed foreground scale. Sources, photos, matched baseline, seeds29/41/5189 and rejected5171 are in [desert evidence](../wave1-desert/) and [Lab record](../../visual-lab/wave1/desert/README.md).
- **Mangrove:** R1 mirror response and shore appearance; R2 darker reflection/damp substrate retained. R3 closing gaps with stacked canopy ellipsoids looked mechanical and was rejected; R2 restored. Seeds29/41 and post-art-freeze617 are in [mangrove evidence](../wave1-mangrove/). The original source freeze is retained in [experiment.json](../../visual-lab/wave1/mangrove/experiment.json). Parent later corrected only continuation-tree selection indices, preserving original-source inspection identity and rendering appearance;617 was reproduced, not claimed as another unseen seed.
- **Flooded:** R1 sparse pale sticks and broad river; R2 stiff V-shapes/mechanical banks rejected; R3 curved multi-blade clumps provisionally retained. Seeds29/41 and frozen holdout613 were evaluated without tuning to613. See [comparison](../wave1-flooded/comparison.png), [raw checks](../wave1-flooded/validation.json) and [review](../../visual-lab/wave1/flooded/review.json).

Three correction rounds per parallel workstream are exhausted. No additional artistic rounds were started during integration. No human preference labels or approved-best records were changed.

### Capture defect discovered and corrected

Three.js planar reflection invokes a nested render with an inverted reflection camera. The old probe allowed that camera to overwrite the main camera reference. Original mangrove R1/R2 hero captures and initial critiques based on them are **invalid hero-comparison evidence**, retained for diagnosis only. The shared probe now tracks primary-framebuffer renders; its nested-render regression test passes. Corrected R1/R2 and final captures were actually inspected. The rejected R3 was assessed with the corrected probe.

## Ecology and layers

- Mojave sample resolves to ECO433 / BIOME13. No named local tree palette is supported; unnamed xeric-shrub growth-form dressing does not assert Joshua-tree presence merely because the reference photo includes them.
- Florida mangrove sample resolves to ECO612 / BIOME14. A narrow canonical resolver extension returns accepted native-country catalogue taxa with existing supported mangrove architecture. Here that is **Rhizophora mangle**, a documented regional candidate, not verified point flora. Existing source architecture supplies prop roots. Salinity, tide and local abundance are unknown; no extra species were invented. Rear specimens are explicitly labelled presentation reuse, not observed population data.
- Everglades sample resolves to ECO581 / BIOME9. No trees are injected. Sedges/grasses are unnamed growth-form representations, not confirmed local taxa.

Placement and hydrology are deterministic art-direction hypotheses, not surveyed geography. Season, weather and time-of-day states are separately recorded: neutral/unresolved season, fixed clear weather, fixed directional light. Mangrove tide is an additional synthetic presentation state. Dynamic weather, phenology and measured tidal simulation were not implemented.

## Performance and checks

640×360, fixed camera/light/input seeds, existing software/headless renderer. Integration counts explicitly disable renderer-info auto-reset to include nested reflection submissions; static shadow maps are warm/cached. CPU submissions are not completed GPU frame times.

| Seed29 hero | Draw submissions | Submitted triangles | Scene instances |
|---|---:|---:|---|
| Desert | 9 | 285,316 | 213 rocks +420 shrubs;0 trees |
| Mangrove | 15, including reflection | 1,535,238 | 36 tree presentations, including8 rear reuses;339 substrate accents +46 distant masses |
| Flooded | 6 | 469,378 | 5,700 sedge clumps;0 trees |

Generic baselines: desert/flooded2 draws and2,060 triangles; original mangrove hero4 draws/322,748 triangles. Added cost buys distinct biome structure, but the visual benefit remains insufficient for global promotion. [Raw integrated measurements](integration.json), [performance summary](performance.json) and per-workstream records retain counts/timing samples. Texture-object counts are recorded; full texture-memory totals, hardware alpha overdraw and mobile device performance were not measured. No mobile approval is claimed.

- TypeScript check passed; seven focused Wave1 tests and the reflection-probe test passed.
- Broader ecology checks:31/32 passed. Existing `tests/global.test.ts` expects400 taxa, while **the unchanged base commit already contains402**. No ecological catalogue data was edited, and this unrelated assertion was not weakened.
- Integrated captures selected the expected real RESOLVE biome in all three cases and reported no page/shader/asset errors.
- Continuous field reproduction/source-preservation checks pass. RGB near-black fractions remain nonsemantic diagnostics; no automatic artistic continuity/repetition detector is claimed.
- **Protected regressions:7/7 pixel-identical**, zero changed pixels: Puget hero, rainforest hero/inspection, retained savanna hero/inspection, selected alpine hero/inspection. [Detailed regression result](regression.json).

Reproduce: `node artifacts/wave1/validate.cjs` for integration (port3001; unchanged-base mangrove baseline uses desert worktree port3002), `node artifacts/wave1/protected.cjs before|after`, then `node artifacts/wave1/regression.cjs`. Workstream capture scripts document their dedicated ports3002/3003/3004. Lower resolution does not avoid scene-generation cost; hero/inspection reuse each generated scene.

## Files and reusable findings

Shared source: `src/lib/forest/painted-renderer.ts`, new `wave1.ts`, narrow `src/lib/vegetation.ts` resolver branch, and `scripts/studies/visual-quality.cjs` probe fix. Isolated implementations: `wave1-desert.ts`, `wave1-mangrove.ts`, `wave1-flooded.ts`. Tests cover opt-in real-biome gating, field determinism, ecological source preservation, regional candidate honesty, source-tree selection and reflection-safe capture. Existing Lab manifest/index and Wave1 evidence/report files organize references and outcomes; no separate Art Bible was created.

**Technically supported shared improvements:** strict actual-biome opt-in dispatch; reflection-safe primary-camera capture; renderer statistics across nested passes; narrow source-supported regional mangrove candidate resolution; shared contact-height fields for substrate/placement. Their tests and protected captures support technical reuse, not artistic approval.

**Still proposed:** coordinated water/soil/vegetation fields and multi-directional distant continuation. **Rejected for global rules:** current desert gravel stamps/shrub/rock representation, mechanical mangrove ellipsoid walls, and wetland canal-dominated composition. Do not generalize these unsuccessful constructions.

Recommendation: retain the approved environments, review these negative/positive comparisons, and focus the next authorized study on one representation problem. Mangrove root/water identity is the strongest foothold, but requires a real shoreline-and-continuation pass before expansion. Human choice and approval are still required; Wave2 should wait.
