# Wildloom visual quality pass

**The visual target is only partly met. Four correction cycles were used: two retained, two rejected.** The selected working source preserves the grass/material correction and the rainforest floor-artifact fix. It restores historical savanna terrain and the original V5 continuation behavior after rejecting the proposed replacements. Neither scene is being declared visually approved.

## Images

Each native comparison contains hero before/after on top and inspection before/after below. Individual sources are real 1920×1080 renders, not enlarged Tier 1 screenshots.

| Scene | Native comparison | Smaller presentation preview | Final hero | Final inspection |
| --- | --- | --- | --- | --- |
| Savanna | [Comparison](savanna-comparison.png) | [Preview](savanna-preview.png) | [Hero](final-best/savanna-hero.png) | [Inspection](final-best/savanna-inspection.png) |
| Rainforest | [Comparison](rainforest-comparison.png) | [Preview](rainforest-preview.png) | [Hero](final-best/rainforest-hero.png) | [Inspection](final-best/rainforest-inspection.png) |

The complete frozen before images are in `final-before/`. Rejected native evidence is in `rejected-tier3/`. Do not mistake those candidates for the retained result. Tier 1 baselines are in `baseline/`; earlier, better references are in `historical/`. The original approved [Puget reference](../wildloom-biome-v3-puget.png) and the inspected [rainforest concept reference](rainforest-concept-reference.png) remain available.

## Permanent rule and capability

[AGENTS.md](../../AGENTS.md) now requires baseline capture, actual image inspection, comparison against the best-known result, regression rejection, bounded correction and honest reporting for future appearance changes across all biomes. Existing instructions were preserved.

Vision inspection was available and used through `view_image`. I interpreted the actual image content: the barren savanna foreground, faceted ridge, circular floor stamps, detached outer foliage, flat teal backdrop, and exposed forest edge. The retained native hero and inspection images were also inspected. This is separate from Sharp metadata, pixel statistics and renderer counters. Tier 3 inspection caused two provisional decisions to be reversed; the latest render was not automatically accepted. Agent inspection is not user approval.

[Workflow and commands](../../docs/visual-quality-workflow.md) describe the reusable runner, progressive tiers, exact settings, checkpoints and stop conditions. [Capture configuration](capture-config.json) and each report store reproducible seeds and actual camera transforms. `checkpoint-manifest.json` records source hashes and the Git base; both the dirty starting source and the selected result are recoverable as `.ts.txt` snapshots. No commit, push or deployment was performed.

## Iteration history

| Cycle | Highest-priority defect / hypothesis | Change | Observation and final decision |
| --- | --- | --- | --- |
| 1 | **Major:** little grass, black debris-like fragments. Dark tint, flat card response and a sampler excluding near ground were plausible combined causes. | Crossed cards, upward wrapped shading response, lighter instance tint, golden albedo, correlated broader coverage and shorter central grass. Exposure unchanged. | Hero coverage 10.5%→73.3%; near-black overlap 37.2%→0.34%. Grass reads as a golden landscape again. **Retain**, with coarse/repeated silhouettes still visible at detail resolution. |
| 2 | **Major:** sparse unlit triangles form an artificial mountain wall. | Smooth-normal lit heightfield with broad talus. | Tier 1 looked better; native inspection revealed a disconnected left end with sky beneath it. **Reject and revert.** Historical biome terrain is retained; the original Pass 1 faceted addition is also removed. |
| 3 | **Major:** repeated circular forest-floor patches. | Reject dark atlas substrate through an albedo-based alpha cutoff; retain smaller, nonuniform leaf/root fragments and harmonize tint. | Circles disappear from both views while real tree shadows remain. **Retain.** Litter is now subtle and needs future calibration against the concept. |
| 4 | **Critical:** inspection reveals the finite rainforest. The entire backdrop hides above 18 m, while ground ends at 100 m. | Test wider terrain, persistent distant cards and 240 outer shrubs. | Tier 1 hid the edge; Tier 3 exposed detached-looking foliage and a flat teal curtain. **Reject and revert.** The inspection boundary remains unresolved. |

Only rollbacks and validation followed the four cycles. No fifth correction was attempted. Per-cycle captures and source snapshots preserve the evidence. Detailed structured critiques, hypotheses, recommendations and decisions are in [review.json](review.json).

The rainforest circles were traced to **520 copies of four atlas patches containing opaque dark humus**, not to tree shadows or the vegetation density field. About 55.1% of the source atlas was alpha-covered; 40.8% of those covered pixels averaged below 50/255. The shader now rejects low linear-albedo substrate between .045 and .095, leaving leaf/root fragments over continuous terrain. The same-camera disappearance validates that diagnosis. Existing shadows were not disabled to disguise it.

## Visual assessment of the retained result

| Criterion | Savanna | Rainforest |
| --- | --- | --- |
| Composition and hierarchy | Hero acacia and open sky preserved; short central grass keeps encounter visibility. | Buttressed framing, towering trunks and open center preserved. |
| Natural framing | Stronger near/lateral grass masses; close card forms are still coarse. | Existing large trunks and ferns frame the clearing; angular fronds remain. |
| Focal readability | Central opening stays readable through shorter grass rather than a bare brown void. | Existing warm focal illumination remains readable. |
| Foreground/middle/background | Golden grass, acacia groups and historical low hill separate; distant geology is simple. | Hero view keeps good layered depth; inspection still exposes the environment edge. |
| Vegetation | Continuous varied golden coverage replaces disconnected dark fragments. Three atlas silhouettes still repeat. | Existing botanical tree models and life-form layers remain; no new species evidence is implied. |
| Silhouettes | Acacia remains distinctive; its existing exaggerated leaf sprays were not rebuilt. | Canopy enclosure remains strong; foreground palm/fern shapes remain low-poly. |
| Ground | Broad golden regions and density variation replace most barren brown ground. | Circular stamping is removed; small litter detail is weaker than the concept. |
| Terrain | Both unsuccessful new ridges are removed. Historical terrain is safer but lacks a strong geological identity. | **Fails inspection continuity:** the finite ground/forest boundary is visible. |
| Light and palette | Warm golden grass, green crowns and cool shading; global exposure unchanged. | Strong canopy lighting and teal atmospheric separation preserved. Deep understory shadows still need interpretation, not an automatic brightening. |
| Continuity outside hero | Rotated view captured; broader seamless terrain remains future work. | **Unresolved critical defect**, visible in the final inspection image. |
| Relative attractiveness | Better than the latest barren regression and much richer in grass than the older baseline; still not final-quality vegetation. | Floor is cleaner and more natural than repeated circles; overall quality target remains unmet because of inspection boundaries. |

## Objective checks

- Actual alpha-tested vegetation silhouette masks supply lower-half coverage. This avoids equating brown/gold vegetation with bare ground solely by RGB hue. The isolated mask omits terrain occlusion, so coverage is a proxy.
- Weighted display luminance below 25/255 inside that mask flags near-black candidates. Real shade is included; the metric alone cannot identify direct sunlight or determine artistic success.
- Floor instance count, atlas reuse and backdrop visibility produce structured findings with severity and measurements. Albedo-filtered fragments retain a minor repetition-review warning. No general RGB-only circle detector or geological classifier is claimed.
- Camera transforms, resolution, aspect ratio and page/shader errors are checked. Missing masks are unavailable data (`null`), not invented zero coverage.
- Geometry faceting, disconnected landforms, floor naturalness and background flatness were assessed by vision. They were not inferred from triangle count alone.

The [retained Tier 1 report](retained-review/report.json), [baseline report](baseline/report.json), and [performance data](performance.json) contain the raw findings. These metrics do not approve aesthetics.

## Performance

Measured with headless Chromium software rendering, pixel ratio 1, unchanged static 1024×1024 shadows and fixed cameras. The table uses matched 1920×1080 captures.

| Case | Latest Pass 1 calls / triangles | Retained calls / triangles |
| --- | ---: | ---: |
| Savanna hero | 9 / 30,258 | 8 / 57,350 |
| Savanna inspection | 9 / 30,258 | 8 / 57,350 |
| Rainforest hero | 26 / 1,450,298 | 26 / 1,450,298 |
| Rainforest inspection | 22 / 1,433,698 | 22 / 1,433,698 |
| Puget reference | 19 / 675,089 | 19 / 675,089 |

Savanna adds 89.5% triangles over the sparse failed Pass 1 but remains about 10% below the older historical 63,750-triangle scene. The demonstrated benefit is restored golden coverage. It uses **11,000 crossed-card instances in one draw**, plus 35 shrubs. The hidden 2,800-instance old grass batch remains a reversible fallback; total allocated decorative instances are 13,835. Alpha overdraw/mobile frame rate was not benchmarked, so this is not a mobile-performance approval.

Rainforest keeps **64 detailed trees** and its existing **2,997 decorative/outer instances** (2,662 visible in inspection after its legacy backdrop hides). No extra tree generator or accepted outer shrub batch was added.

Three synchronous CPU submission samples per capture are stored in `performance.json`. They are not GPU times, end-to-end frame intervals, FPS or a physical-device measurement. No significant frame-rate claim is made from them.

## Puget and verification

Puget is **byte-identical before/after at both 640×360 and 1920×1080**. Its reference camera, composition, assets and ecological systems were preserved. All paired final camera transforms are exactly equal, and final captures report no page/shader errors. The existing PCFSoftShadowMap deprecation warning remains outside this task's scope.

Passed: targeted TypeScript check; three objective-check tests; one deterministic/serializable-plan test covering source seed/position preservation, clear-center behavior and seed variation; exact camera checks; Puget image equality. No full test suite, build, mobile audit or deployment was run.

## Files and preview

This task adds the persistent rule, `docs/visual-quality-workflow.md`, `scripts/studies/visual-quality.cjs`, two focused test files and these review artifacts. The retained scene correction is in `src/lib/forest/pretty-scene.ts`. Integration in `biome-visual.ts` and `painted-renderer.ts` was already present from Pass 1 and is preserved. Experimental `rainforest-depth.ts` changes were fully rolled back. Source generators, botanical/ecological data and tree architecture were not changed.

The local dev server remains on port 3001. Use [savanna](http://localhost:3001/explore?lat=-2.3&lon=35.2&habitat=grassland&conditional=1&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human&composition=C&groundLighting=B&illumination=on&pretty=on) or [rainforest](http://localhost:3001/explore?lat=-3.12&lon=-60.02&habitat=forest&rainforest=v5&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human&composition=C&groundLighting=B&illumination=on&pretty=on). `pretty=off` is the historical presentation fallback. The live Vercel preview still shows the previous committed build.

## Next recommendation

**First solve terrain and distant forest continuation from inspection using geometry alone, before adding outer plants or extra haze.** Keep the successful grass and floor fixes frozen. After continuity passes, improve near grass-card silhouettes and subtle litter richness in separate bounded studies. The current budget is exhausted; neither the geological target nor rainforest inspection continuity is being claimed as completed.
