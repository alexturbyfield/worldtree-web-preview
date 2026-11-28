# Wave1 split artistic refinement — review checkpoint

Wetland layouts, water optics, camera plans and ecological selection are preserved. Lighting/material changes are isolated from composition. Desert uses a new multi-piece joint-plane construction at the existing rock anchors. **The improvement is modest, and none of these scenes meets the approved concepts yet.** Everything remains opt-in, local and uncommitted.

![Matched hero comparisons](hero-comparison.png)

## Images and preview

- [Matched elevated comparisons](inspection-comparison.png), [all matched views](comparison.png), [concept targets versus new renders](concept-comparison.png).
- [Sky-cropped comparisons](no-sky.png), [three-seed hero sheet](seeds.png), [three-seed inspection sheet](inspection-seeds.png), [isolated geology gate](geology-study.png).
- [Desert local preview](http://localhost:3001/explore?lat=34&lon=-116.15&habitat=forest&wave1=desert&fieldStudy=rebuild&artPass=split&seed=29&density=36&structure=grove-1&appearance=garden&wind=0).
- [Mangrove local preview](http://localhost:3001/explore?lat=25.2&lon=-80.9&habitat=coastal&wave1=mangrove&fieldStudy=rebuild&artPass=split&seed=29&density=36&structure=grove-1&appearance=garden&wind=0).
- [Flooded local preview](http://localhost:3001/explore?lat=26.209957419&lon=-80.9383825925&habitat=wetland&conditional=1&wave1=flooded&fieldStudy=rebuild&artPass=split&seed=29&density=36&structure=grove-1&appearance=garden&wind=0).

Use the existing orbit controls or change seed to41/1879. Remove `artPass=split` to view the retained prior checkpoint. The original Wave1 and generic fallback also remain available. No new UI.

## Visual critique before technical conclusions

Actual vision inspection was used for reference/candidate images, isolated rocks, shadow controls, final seed/inspection sheets and sky-cropped comparisons. This session's reviewer is the root agent; **no independent review is claimed**. Human approval remains pending.

| Scene | Observed improvement | Remaining major discrepancies | Decision |
|---|---|---|---|
| Mangrove | More readable physical shadow shapes; warmer sunlit sediment against cooler fill; local plant faces retain directional contrast | Broad muddy foreground remains too smooth; material mixing reduces some texture contrast; crown highlights remain strongly green rather than selectively golden; shoreline still too clean | Retain isolated lighting study provisionally; not concept-quality approval |
| Flooded | Richer near-tree pigments after rejecting pale sage foreground; clearer cast shadows and connected grass pigment variation | Grass still repeats angular fans; low approach remains lawn-like with sky removed; wet-to-dry transitions and distant coverage remain weak | Retain modest lighting improvement; grass geometry unchanged |
| Desert | Rocks now have interlocking unequal fragments, interrupted tops and contact debris; sparse shrubs are more readable | Surfaces still look freshly fractured and angular; three molds repeat; broad foreground remains underdeveloped | Retain assembly direction for review; not finished geological representation |

The sky-cropped views are an important failure check: they still reveal weak substrate/vegetation richness. Better lighting does not solve those underlying limitations. Inspection views retain fine periodic ripple structure and pale distant horizon layering; those existing defects were not hidden or rebuilt in this pass.

## Track A — lighting and material response

The opt-in adapter uses the existing renderer and actual light objects. Key direction stays unchanged for valid before/after comparison. Warm key intensity4.0→4.6, cool hemisphere .65→.50, directional fill .30→.20; exposure stays1.12. Physical shadow strength .65→.76. No bloom, global saturation/filter, scene exposure boost or geometry additions.

Material pigments use the supplied ranges as linearized sRGB anchors under illumination. World-space correlated fields coordinate grass/ground variation. Small diffuse bounce approximates indirect illumination without emission. Leaf bases/tips and existing crown normals retain local light variation. Existing distance atmosphere remains in place.

Two diagnoses were tested rather than guessed:

1. **Shadow stippling:** [1280 current](shadow-current.png), [shadow disabled](shadow-no-shadows.png), and [bias-adjusted](shadow-bias-adjust.png). Bias/radius adjustment resolves the objectionable pattern while retaining physical tree shadows. Final bias−.001, normal bias .2, radius1 are study-scale settings, not universal renderer defaults.
2. **Foliage light response:** [opposite-sun mangrove](mangrove-29-opposed.png) and [opposite-sun flooded](flooded-29-opposed.png) change actual light direction while preserving geometry/camera. They show directional response. The initial attribution to a hardcoded Basic-material mangrove path was incorrect: the actual mangrove uses library ShaderMaterials, already linked to the sun. Material audits corrected that diagnosis. The adapter also handles the hardcoded billboard fallback **when that path is used**, but it is not credited as the cause of this mangrove's improvement.

The early distant sage palette applied to foreground trees was visibly too pale and is rejected. Foreground pigments were restored to richer greens before freezing. Current ground palette mixing remains a limitation because it suppresses some texture contrast; it is recorded as proposed rather than a demonstrated global material rule.

Water's shader, reflection capture, Fresnel, sampled depth, sediment attenuation and wind ripples are unchanged. Its reflected colors change only with the lit environment. No green/teal override was added. Shallow transmission remains the prior analytic sediment approximation, without true bottom refraction.

## Track B — geological representation

The isolated test came first. The first fragment stack remained regular and flat-topped; [its image](rock-isolated-r1.png) and source snapshot are preserved as a rejection. The retained construction uses convex fragments formed by joint-plane intersections, unequal main masses, medium foot fragments, small fracture debris and varied bedding orientations. Geometry is instanced in three deterministic variants. Existing225 rock anchors/orientations and the open horizon are unchanged.

The unit assembly contains812/816/812 triangles versus1200 in each previous block. Vertex pigments only modulate the existing stone albedo; an initial double-pigment darkening was corrected during isolation. Contact gravel remains tied to rock anchors. Ground gains low-contrast broken exposed flakes and runoff pigmentation, with existing compacted/mobile sediment fields. No new mountains, iconic plants or named species.

Up to8 existing unnamed branching xeric shrubs are scaled1.85× near rock formations. Plant counts and ecological labels remain unchanged. This improves intermediate silhouette readability but does not yet make the desert foreground convincing. A separate weathering/shape study is warranted before more surface polish.

## Matched validation and cost

Captures use640×360, identical camera arrays, seed, wind, sky, aspect and render settings. Changed lights/materials are the intended experimental variables. Seeds29 and41 support development;1879 was reserved and generated only after the recipe freeze. No runtime source edits followed its evaluation. [Freeze/hashes](freeze.json).

- **18 matched view pairs:** all camera arrays match. Wetland instance counts/transforms match exactly across all three seeds and both views. Desert rock anchors match; shrub scale changes are intentional. [Checks](matched-checks.json).
- **Nine staging audits:** positive sampled dry approach heights, zero conservative source-root intrusions, zero rock/shrub AABB intersections along the capsule approach, zero shader compilation failures. [Audit and material inventory](verification.json). These are static geometric checks plus rendered capsule proxies, not a physics/navigation simulation.
- **Seven protected captures are pixel-identical:** Puget hero; rainforest, savanna and alpine hero/inspection. [Results](regression.json). Existing protected-scene critique warnings remain historical; no unrelated fixes were made.
- `npx tsc --noEmit` passed. Nine targeted geology/detail/field tests passed; `git diff --check` passed with existing line-ending warnings. No full suite/build or mobile device test.

Seed29 warmed submitted work, including nested water reflection passes:

| Scene | Calls before→after | Triangles before→after |
|---|---:|---:|
| Desert |11→11|564,028→477,028|
| Mangrove |23→23|2,546,486→2,546,486|
| Flooded |21→21|2,182,574→2,182,574|

Desert reduces87,000 submitted triangles, about15.4% of total work. Wetland shader arithmetic changes have unmeasured device cost despite unchanged geometry/calls. Counters come from headless ANGLE/SwiftShader and include reflection passes; CPU submission samples are recorded, not presented as FPS/GPU timing or mobile approval. No new textures/dependencies were added. Existing alpha foliage/continuation overdraw remains unmeasured; physical grass remains opaque.

## Files, learning and stopping decision

Runtime edits are confined to [wave1-rebuild.ts](../../src/lib/forest/wave1-rebuild.ts), [wave1-desert-detail.ts](../../src/lib/forest/wave1-desert-detail.ts), and new [wave1-wet-lighting.ts](../../src/lib/forest/wave1-wet-lighting.ts). [Geology test](../../tests/wave1-geology.test.ts). Fields, ecological catalog, water shader and protected render paths are unchanged.

[Lab session](../../visual-lab/wave1/split-session.json) separates observations, implementation hypotheses, confirmed diagnoses, rejected techniques and approval status. Capture scripts are [capture.cjs](capture.cjs), [isolate.cjs](isolate.cjs), [verify.cjs](verify.cjs), [shadow diagnostic](shadow-diagnostic.cjs) and [checks.cjs](checks.cjs). Before/final source snapshots and raw captures remain recoverable here.

Three targeted correction cycles were used: reject the regular rock stack; evaluate working material/assembly prototypes; correct shadow bias and foreground palette. The GLSL reserved-word compile failure was repaired and never treated as artistic evidence. The final opt-in state is retained provisionally, not globally promoted. No human approval labels or best-known approved pointers were changed.

Recommend the next pass investigate preservation of substrate detail under palette/light variation, then weathered geological edges. Do not add more grass or random objects to conceal the remaining bare surfaces. Nothing committed, pushed or deployed; no Wave2 started.
