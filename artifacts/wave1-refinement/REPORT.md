# Wave1 refinement — incomplete visual checkpoint

**This pass does not meet the requested visual acceptance criteria.** Water response has improved and unsupported desert mountains are disabled, but the character staging, substrate fidelity, canopy layering and environmental continuation still require substantial work. No biome is approved or promoted globally. No commit, push, deployment or Wave2 work occurred.

![Concept / retained hero / inspection](comparison.png)

Actual concept images and actual renders were interpreted with vision. The concepts organize low foreground openings between dense lateral silhouettes, selective warm edges over cool contact shadows, and interlocking middle-distance masses. The current renders remain much simpler, flatter and less intricate. Reference-specific objects were not copied or used as evidence of local species presence.

## Retained changes

- `src/lib/forest/wave1-water.ts`: shared planar actual-environment reflection, Schlick Fresnel with normal-incidence reflectance0.02, sampled terrain depth, Beer-style attenuation and a common sediment optical model. Reflection colors are no longer multiplied by a biome green/teal color. Ripples depend on the explicit wind input; they are static spatial ripples, not fluid simulation.
- `wave1-mangrove.ts`: uses the shared optical path; prop-root/species architecture is retained. Local vegetation appears in reflections where the actual reflected scene contains it. Root-like dressing avoids the camera-derived central footprint.
- `wave1-flooded.ts`: replaces sky-only tinted water with actual environment reflection and the same optical model. Existing curved sedge geometry and original placement are retained after rejecting the experimental foreground clearance.
- `wave1-desert.ts`: disables synthetic distant mountain ranges because this scene has no measured supporting terrain evidence; reduces shrubs420→110, distributes them near/mid distance, warms mineral pigments and displaces rock anchors out of the camera-derived staging footprint. Prior rock geometry restored after the fracture prototype failed.

Transmission is an **analytic sediment approximation**, not refracted rendering of actual submerged stones/plants. Sediment and absorption coefficients are authored shared optical properties, not measured regional water chemistry. No uniform green post-multiplier is applied. Fine ripple roughness/multisample filtering and true refraction remain incomplete.

## Rejected experiments and stop decision

1. R1 camera-derived raised margin produced an obvious long peninsula. Reject.
2. R2 shorter, irregular margin still produced an angular/artificial sandbar. Reject and restore original wetland terrain heights. Low-resolution shoreline topology and an independent height uplift are an inadequate implementation of character-friendly shore composition.
3. The R2 low-subdivision rock prototype replaced clay mounds with mechanical triangular facets. Reject; restore prior rock geometry.

Two successive staging attempts failed visually. The standing stop rule applies; no more cosmetic adjustments were layered onto the failed construction. These are implementation/representation failures, not evidence that a natural dry shoreline is a bad artistic idea. A subsequent approach should design the encounter margin jointly with shoreline topology and moisture/vegetation fields, rather than raise a camera mask through an existing channel. The current wet-biome foreground is **not character-ready**.

Rejected images remain in `artifacts/visual-quality/wave1-refinement-water-r1/` and `wave1-refinement-water-r2/`; source baselines are preserved as `.ts.txt` files here. Their renders are not the current retained scene.

## Reproduction and seeds

Current existing preview URLs still use port3001 and `wave1=desert|mangrove|flooded` at the Wave1 locations. The generic renderer remains accessible with the query omitted or `wave1=baseline`. No approved-biome geometry, materials or lighting were changed.

Run `node artifacts/wave1-refinement/retained.cjs` for hero and elevated inspection captures at640×360, seeds29/41 and fresh holdout839. Final recipe frozen before839; no source tuning after that holdout.829 was revealed during superseded captures and is not treated as unseen. `freeze.json` records the retained source hashes; `superseded-freeze.json` and the `final-*` captures are earlier evidence, superseded after rejecting foreground vegetation removal. Season/weather/time layers remain separately recorded fixed study states.

Per-seed evidence: `artifacts/visual-quality/wave1-refinement-retained-29/`, `...-41/`, `...-839/`, each with all three biomes' hero/inspection images and raw reports. New concept paths, observations, hypothesis/status and failures are recorded in `visual-lab/wave1/refinement-session.json`; human approval remains null. No trained model or human preference is inferred.

## Critique and remaining work

| Scene | Actual visible result | Remaining major defects |
|---|---|---|
| Desert | More open horizon, warmer substrate, fewer shrubs | Clay-like rocks remain, substrate lacks convincing fractures/erosion and ground-frequency hierarchy, weak foreground framing; no finished geological representation |
| Mangrove | Sky/cloud colors and localized canopy reflection are readable without fixed green tint | No dry character margin, repetitive leaf marks, planar canal banks, pale distant trees and barren inspection surroundings |
| Flooded | Warm sky reflection replaces uniform green overlay; curved grass retained | Large water opening still dominates29; hard shoreline ribbons, uniform middle-distance grass and insufficient near/mid/far variation |

The supplied concepts' luminous key light, coordinated contact shadows, rich substrate and integrated foreground are not reproduced adequately. No claim of visual approval.

## Validation and costs

TypeScript passes; six focused desert/mangrove/flooded tests pass. Captures report no page/shader errors. Seven protected captures remain pixel-identical: Puget hero, savanna hero/inspection, rainforest hero/inspection and alpine hero/inspection; see `regression.json`.

Harness seed29 counters: desert6 calls/157,510 triangles (previous9/285,316); flooded8/835,378 (previous6/469,378), reflecting an additional scene reflection render; mangrove12/1,451,722 as reported by the existing probe. **These default auto-reset counters are not a complete cross-pass GPU audit** and should not be compared directly with the earlier explicitly summed mangrove counts. Raw reports preserve CPU submission samples, texture objects and instance counts. No mobile device/GPU completion/alpha-overdraw approval is claimed.

Each water depth field is256×256 float (~256KiB); each planar reflection is512×256 plus render-target attachments. Full texture/render-target memory was not audited. Flooded grassland's extra reflection render is a material performance cost that needs device evaluation before adoption.

The five isolated optical acceptance scenarios—blue sky only, golden clouds, local green vegetation, sediment shallows and wind/ripple comparison—have **not** all been captured and validated. Mixed scene captures demonstrate plausible color separation but do not substitute for those tests. Water and staging acceptance remain open.

Next high-value work: a coherent shore/encounter topology representation, followed by real geological fracture/substrate assets and canopy mass organization. Do not expand biome coverage or generalize these unapproved recipes.
