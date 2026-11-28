# Shared conifer and flower assortment — provisional visual checkpoint

[Before/after and conifer detail](comparison.png) · [Flower assortment](flower-assortment.png) · [Puget shared-model comparison](puget-comparison.png) · [Seeds/archetype/palette/holdout](validation.png)

## Decision

Retain the curved needle-spray representation provisionally. It removes smooth cone cores, gives branch-owned irregular foliage a recognizable conifer edge, and improves both alpine and Puget. The new flower assortment adds upright pink/lavender spires, low violet blossoms and airy ivory clusters. **This is better than the baseline at hero scale, not final artistic or human approval.** Actual reference, rendered hero/detail/branch-only/flower/inspection/thumbnail/holdout images were interpreted with vision by the implementing agent; no independent review is claimed.

The first solid-volume construction looked like waxy broad leaves and was rejected. The needle-atlas construction was retained after fixing double-darkened far foliage and eye-level blossom visibility. No density increase was used to replace the tree representation problem. Existing trunk/branch architecture, tree positions, ecological data and structural/appearance seeds remain intact.

## Scope across environments

The improved model is the **shared `douglas-v1` foliage representation**, including existing explicitly mapped visual fallbacks, through the normal Studio/library geometry and material path. It is not an alpine-only replacement and does not turn cedar, pine or broadleaf species into firs. The alpine trees remain Douglas-fir-derived functional growth forms rather than verified local taxa. Middle-distance alpine trees use the same needle-spray vocabulary in a cheaper instanced LOD. Flowers are reusable geometry assets currently assigned only to the alpine meadow study, not introduced into unrelated ecosystems.

Savanna and rainforest hero/inspection captures are pixel-identical after regression correction. Puget's trees and their physical shadow coverage intentionally change under the requested same-model update; its sky, composition, placement and lighting remain. `conifer=legacy` reproduces the original Puget image pixel-for-pixel. [Regression](regression.json), [fallback](fallback-regression.json).

A shared anisotropy2→4 change initially altered unrelated biomes. This was caught, corrected to conifer-only4, recaptured, and documented. The first source freeze and revealed seed8879 are archived. A fresh freeze preceded unseen seed8893; runtime hashes remained unchanged afterward. No silent holdout tuning or reset of the three artistic-round budget.

## What the images demonstrate

- Hero/thumbnail: clearer tree mass-edge hierarchy and more readable colorful flower framing around the luminous opening.
- Detail: boughs still look chunky in places. Flower petals/leaves are geometric and need softer forms; their three silhouettes are distinct but not final fidelity.
- Generalization: seeds29/41, valley41, paletteB29, final frozen holdout8893 retain the basic relationships. Existing A-specific meadow color handling in paletteB remains a limitation.
- Inspection: no new placement failure; distant forest/terrain continuation remains simplified. This task does not repair the flat lateral horizon.

The original volume frame was inspected in-session but its raw helper PNG was accidentally overwritten during the later needle test. Rejected source is preserved as `rejected-volume.ts.txt`; the copied intermediate needle images are labeled correctly, not presented as volume evidence. The original volume image remains in the conversation. Other before/final frames and source hashes are retained.

## Performance and checks

|Scene/view|Before triangles|Final triangles|Draw calls before→final|
|---|---:|---:|---:|
|Alpine29 hero|663056|641908|13→14|
|Alpine29 inspection|517952|548020|13→14|
|Puget29 hero|675089|643121|19→19|

22 detailed conifers plus286 distant instances;764 flowers in three batches (356/204/204);3448 grass/low clumps;15 rocks. Fewer hero triangles is not proof of faster rendering: alpha coverage and memory increased. New1254² RGBA atlas is about8MiB per uploaded texture with mipmaps; current alpine near/far copies add roughly15MiB net over the software-economy original, excluding driver allocation. Asset is generated artwork with real alpha, not downloaded geographic imagery.

One5.03s orbit on SwiftShader software rendering at640×360 measured6.36FPS, median162.8ms/p95170.3ms browser frame intervals, mean CPU submission0.55ms. Not a hardware GPU timer or mobile test. Near-foliage depth-disabled overlap proxy:4.87 surviving layers per occupied pixel, peak32,0 saturated; excludes far standard-material trees and normal terrain/wood occlusion. [Benchmark](benchmark.json), [proxy](alpha-overlap.json). Mobile readiness is not approved.

TypeScript and10 targeted tests pass (3 alpine recipe,2 conifer/flower,5 existing Lab). Captures show no shader/page errors; implemented plant constraints/rock clearance report0 violations/overlaps. These tests cannot approve aesthetics. No full build/lint suite, commit, push or deployment.

## Persistent workflow and reusable learning

Updated `AGENTS.md`, existing Lab README and `art-direction-policy.json` with adaptive experiment choice, image-first critique, explicit reviewer attribution, expected artistic/reusable value, existing-tool reuse, source freeze/unseen validation and meaningful stopping rules. The legacy fixed-three catalog and all historical rejections remain preserved. [Structured experiment](experiment.json) records the loaded permanent/reusable/task-specific context, architecture, diagnoses, measurements, provenance, decisions and limits. No additional agent framework or trained model was created.

Shared tree and landscape grammars gain scoped **experimentally-supported** mass/edge and flower-role findings. Human approval remains null. The conifer profile records the new shared representation and limitations; savanna-specific or alpine-specific numbers are not universal defaults.

## Files and preview

Runtime: new `src/lib/studio/conifer-foliage.ts`, `src/lib/forest/meadow-flowers.ts`; modified studio `geometry.ts`/`renderer.ts`, alpine `adapter`/`recipe`; new `public/assets/conifer-v2/fir-sprays-v1.png`. New targeted test `tests/conifer-flowers.test.ts`. Guidance/records: AGENTS, Lab README/policy, tree/landscape grammars, alpine conifer profile and this artifact directory. Pre-existing unrelated dirty work was preserved.

Preview: http://localhost:3001/explore?lat=51.17&lon=-116.18&habitat=forest&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&alpine=treeline&palette=A&backdrop=subtle&alpineArt=meadow

Add `conifer=legacy` for the prior tree rendering, or `camera=inspection`; use seed41 or8893 for recorded alternatives. The same conifer default is active wherever `douglas-v1` is selected in other environments. Next high-value work is softer bough/petal detail and lower atlas residency/overlap, followed by lateral environmental continuation. Stop here for human review.
