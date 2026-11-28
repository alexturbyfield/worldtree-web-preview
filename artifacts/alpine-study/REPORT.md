# Alpine cross-biome study — experimental, not visually approved

**The technical prototype works, but none of the three scenes meets the supplied artistic target.** Terrain geology is still too smooth/simple, the overlook does not communicate its height strongly enough, conifer envelopes remain generic, and inspection views need richer continuation. All three final artistic judgments are **not good enough**. The strongest technical checkpoint is preserved; no alpine result was promoted as approved.

## Review the actual output

- [Three compositions: hero and inspection](compositions.png).
- [Three coordinated palettes for every composition](palettes.png).
- [Training seeds29/41/73](training-seeds.png); [held-out seeds101/131/167](holdout-review.png).
- [Thumbnail-scale comparison](thumbnail-review.png); [initial, retained and rejected ridge experiments](rounds.png).
- [Conifer complete foliage/core study](conifer-complete.png), [same camera branch-only](conifer-branches.png), [physical meadow detail](meadow-detail.png).
- [Structured artistic critique](review.json), [performance](performance.json), [regression checks](regression.json), [experiment/provenance index](experiment.json).

All five supplied JPEG references and the actual rendered PNGs were interpreted with vision. Capturing images, reading metadata, numeric checks and image interpretation were treated separately. Review used640x360 native frames, close cameras and160x90-equivalent thumbnails. Wide contact sheets combine low-resolution captures; they are not1920x1080 final renders. No Tier3 output was generated because no scene passed the visual bar.

## Independent reference analysis

[Observations, interpretations and hypotheses were saved before scenery implementation](01-reference-analysis.json). Phone UI and black borders were excluded from artistic interpretation. The [reference manifest](../../visual-lab/alpine/references.json) contains paths, source/license caveats, positive relationships and defects to avoid. No external reference images were downloaded; user image rights/reuse consent were not inferred.

Three relationships dominate the references:

1. Broad valley/shoulder forms lead toward sharper, quieter remote geological silhouettes. Foreground rocks repeat that structure at smaller scales.
2. Dark asymmetric foreground/tree masses frame luminous meadow openings. Fine grass and flowers support the larger values; they do not compete uniformly across the image.
3. Environmental continuity connects drainage, lush growth, soil and rock. Trees occur in irregular treeline islands, with progressive cool atmospheric separation.

The five references differ: #1 uses tall conifer enclosure and a lit stream valley; #2 uses an open illustrated basin and angular geology; #3 stresses lush low meadow/water contact; #4 emphasizes an elevated rocky shoulder and a descending valley; #5 uses soft conifer groups and large lateral flower masses. Their layouts were not copied.

Ecological guidance was checked against primary sources: treeline is a transition zone with increasingly stunted growth, not a hard line ([NPS Olympic subalpine forests](https://www.nps.gov/olym/learn/nature/subalpine-forests.htm)); shelter and elevation affect the form of spruce/fir near treeline ([NPS Rocky Mountain subalpine ecosystem](https://home.nps.gov/romo/learn/nature/subalpine_ecosystem.htm)). These support functional rules, not claims of measured local species occurrence. The prototype uses synthetic fields and a provisional2750m treeline; it is not surveyed terrain, hydrology or vegetation.

## Implementation and transfer audit

The existing `painted-renderer` remains the renderer. Alpine is an opt-in adapter, not a second WebGL/camera/UI pipeline. Existing scenes keep their default paths.

**Directly reused:** deterministic `randomSource/hashSeed`; renderer/camera/shadows; existing conifer StudioStudy and foliage atlas; indexed curved grass geometry; weathered rock geometry; instancing; full plant/rock clearance; screenshot harness; Lab evidence/status discipline.

**Parameterized adapters:** shared world-space pigments; terrain-aware vegetation/rock contact; conifer height/width stress response; distance representation; hero/inspection capture settings. The rock-clearance helper gained optional terrain-height and ecological-acceptance callbacks with unchanged savanna defaults.

**New:** pure alpine plan generator, terrain/environment fields, glacial/overlook/treeline families, narrow terrain-following stream, sparse flower geometry, palette-state updater and recipe/schema/grammar records.

The engine-neutral [recipe](../../visual-lab/alpine/recipe.json), [schema](../../visual-lab/alpine/recipe.schema.json) and [grammar](../../visual-lab/alpine/grammar.json) separate semantic roles, metres, fields and palettes from Three.js. `alpine-recipe.ts` uses no Three.js objects. The adapter builds existing renderer resources from that plan. This is portable design data for future Unity/geographic work, not an implemented exporter.

### Terrain and composition families

- **Valley:** U-shaped cross-section, asymmetric shoulders, remote ridges and a drainage channel. A real water strip follows the same channel field. This is the strongest readable opening, but hills and water/bank contacts remain too simple.
- **Overlook:** raised near shoulder with a physical24m drop into the basin, larger foreground anchors and little/no woody growth above the provisional treeline. Geometry differs, but the camera/foreground relationship does not make the overlook convincing enough.
- **Treeline:** rounded meadow shoulders, irregular conifer groups and distant ridges. It communicates the intended biome most clearly, but core silhouettes remain simplistic and it exceeds the provisional triangle target.

Near, middle and far terrain are actual geometry, sampling one continuous height field. No painted mountain wall supplies the landforms. The existing illustrated sky is reused. The bright flat horizon band in inspection remains an environmental-continuation defect even though far geometry/fog exists; numerical continuity is not visual success.

Hero descriptors vary by family: quiet opening/pass, embedded overlook rock, or exposed conifer. Variation is still limited: tested valley seeds choose the same pass category. This is not yet a full Hero Feature Director or proof of sufficient composition diversity.

### Ecological fields and meadow

Elevation, slope, aspect, exposure, soil, moisture/drainage distance, rock coverage, shelter and correlated patches drive ground colors and placement. Plants reject steep/rocky sites and the channel interior; tree size/placement respond to stress and provisional treeline. Rock-clearance relocation also respects those fields.

Curved indexed instanced grass/low clumps add parallax; sparse flower spikes are selected from moist patches rather than uniformly filling the terrain. Roots share the terrain pigment field, with texture detail suppressed above roots. No per-card grass shadow casting or black-grass exposure workaround. The result still reads too much as a repeated lawn with small flower marks rather than the reference's richer meadow masses.

Rocks use embedded anchors, clustered followers and smaller slope-associated scree. Full transformed plant/rock bounds are checked using alpine height, not the savanna floor. The shapes/materials are still generic blocky boulders; geological structure is not resolved simply by adding these props.

### Conifer profiles and diagnostics

[Functional profiles](../../visual-lab/alpine/conifer-profiles.json) reuse the actual conifer generator, not acacia. Original leader/bough hierarchy, taper and curvature are inherited. Height/radius reduce with exposure/elevation. Source spray thinning, distance-aware wood simplification and coarse inspection LOD reduce detail.

An early investigation added correct transformation for spine-based fronds, but the actual evergreen study uses spray surfaces, so that was not the cause of its sparse canopy. Experimental irregular branch-tier cores restore conifer mass behind the existing sprays. Complete/branch-only diagnostics show both the successful structural inheritance and the unresolved geometric appearance. Full stress-driven branch plasticity/krummholz architecture is not implemented. These are conditional functional growth forms, not verified regional species models.

The existing ecological UI/scene recipe remains the canonical location data; the alpine presentation plan is recorded separately in the Lab. Full geographic integration and matching every functional tree to an occurrence-backed inspector entry remain future work; no local occurrence claim is made here.

### Palette states

A Golden Alpine Afternoon, B Emerald Glacial Valley and C Violet Mountain Dusk use the requested pigment anchors as guidance. Actual ground/plant/rock/tree values, sun/fill, sky tint and distant atmosphere are coordinated. Palette changes update colors/uniforms, not geology or placements. Position/instance-matrix digests remain equal for every recorded transition, and pure-plan tests confirm seed/camera/population independence from palette.

The same terrain supports all three states in one browser scene; it is not three regenerated or recolored composition families. The palette/state mechanism works technically, but does not make the weak terrain beautiful.

## Bounded iteration and best retention

|Round|Changes|Observed result|Decision|
|---|---|---|---|
|R0 baseline|First analytic terrain, grass/flowers, conifer reuse|Huge smooth mounds, yellow field, skeletal conifers, unresolved stream bed|Reject visually|
|R1|Set back ridges, change ecological exposure, near-biased planting, improve bed sampling, transform safeguard|Some spatial/coverage improvement; geology and conifer mass still weak|Keep useful corrections; not approved|
|R2|Greener coordinated pigments/less yellow light, irregular conifer cores, rock/snow exposure|Best technical representation; recognizable alpine elements but inadequate artistic quality|Retain only as experimental checkpoint|
|R3|Piecewise multi-summit ridge representation|Overly simple pyramids rather than credible ridges|Reject and revert|

Three authorized correction rounds per family were used. No additional artistic tuning occurred. Validation then exposed the camera-target-distance LOD problem; an alpine-only height-above-terrain switch and distant-wood simplification corrected that technical issue. The final source was frozen again **before any holdout generation**. Earlier freezes/results are preserved. No source/art parameters changed after final holdout evaluation.

## Generalization and regressions

Nine training cases: every family ×29/41/73, hero and inspection. Reserved holdouts: valley101, overlook131, treeline167. [Final source freeze](freeze.json) records hashes and protocol; [holdout records](holdouts.json) confirm generation after freeze. Holdouts were not used for subsequent tuning.

All tested generated/relocated plants pass the implemented slope/rock/channel constraints; recorded vegetation/rock overlaps are zero. Plans reproduce deterministically, serialize to plain JSON, and vary in geometry/camera with seed/family. Those checks do not certify ecology or aesthetics. Holdouts retain the same major visual failures: simplified geology, weak overlook framing, generic trees and sparse inspection dressing. No candidate is good enough for final visual approval.

Puget hero, rainforest hero/inspection, and retained savanna hero/inspection recaptures are **pixel- and file-identical** to their frozen references. Existing rainforest inspection/near-black warnings remain unchanged. [Regression details](regression.json).

## Performance and technical checks

|Family|Draw calls|Hero triangles across29/41/73|Inspection triangles|
|---|---:|---:|---:|
|Valley|12|422,426–422,898|380,906–381,378|
|Overlook|8|330,442–332,120|same range|
|Treeline|11|582,932–609,549|437,565–438,125|

Treeline misses the provisional550k triangle target by6–11%; holdout167 is601,472. Instanced populations and tree counts are recorded per capture. Roughly3600 total decorative instances per scene include grass/flowers/rocks/cores; no draw call per plant.

Texture estimate: about18.34MiB RGBA8+mips for the reused ground detail, sky, foliage atlas and bark, excluding shadow maps/driver allocation/unused hidden resources. Native source dimensions were measured; injected detail uniforms are reported separately from the generic texture inventory.

One actual5.13s treeline orbit benchmark at640×360 framebuffer, pixel ratio1, on **SwiftShader software rendering** measured7.8FPS, median127.1ms/p95 134.8ms frame intervals, mean CPU submission0.45ms. This is slow local software-renderer output, not a phone test or mobile approval. CPU submission alone would have hidden the cost. [Benchmark](local-benchmark.json).

Conifer alpha overlap proxy at320×180:1.43 surviving layers per occupied pixel,0.538 whole-spray layers per screen pixel,91.35% alpha-rejected, peak6 surviving layers. Depth-disabled8-bit additive raster excludes core/wood/terrain occlusion and is not a hardware fragment counter or normal rendered cost. Grass is opaque geometry. [Proxy method/data](alpha-overlap.json).

Checks run: `npx tsc --noEmit`;3 new pure alpine-plan tests;4 existing tree tests;5 Lab controller/preference tests. They pass. These cover determinism, serialization, palette independence, distinct landforms, training-seed ecological constraints and existing behavior. No full lint/build/cross-browser suite, mobile device benchmark, commit, push or deployment.

## Reusable learning and next decision

The shared landscape grammar gains only scoped evidence for state/structure separation. Alpine grammar supports field coupling, contact, ecological transition and atmosphere relationships technically, with explicit overall-quality limitations. Gaussian mountains and pyramidal ridge attempts remain negative evidence. No failed geology or simplistic conifer core is promoted into an approved global recipe. Saved data does not mean model training occurred.

**Recommendation:** concentrate the next authorized effort on geological representation and a genuinely elevated overlook cross-section. Do not expand to another biome or add more random plants. The references suggest sharper weathered rock planes/cirques, connected shoulders/spurs and controlled atmospheric layers; these need an isolated landform study before meadow detail.

Human checkpoint: should that study target the sharper illustrated geological structure in references2/4, or the softer atmospheric valley structure in references1/5? Both need new actual rendered candidates; current prototypes are evidence of the representation gap, not compelling alternatives to approve.

## Files and preview

New: `src/lib/forest/alpine-recipe.ts`, `alpine-adapter.ts`, `tests/alpine-recipe.test.ts`; `visual-lab/alpine/` contains recipe/schema/palettes-as-recipe-states, references, grammar, conifer profiles and controller. Modified: `painted-renderer.ts` adds an opt-in alpine adapter/LOD hook; `savanna-recipe.ts` exports reusable geometry/clearance with default-compatible optional callbacks; `scripts/studies/visual-quality.cjs` adds optional alpine metadata/palette/page-release/LOD capture; shared `landscape-color-grammar.json` gains the evidence-scoped state rule. Pre-existing uncommitted work was preserved.

Open the existing local server:

- Valley: `http://localhost:3001/explore?lat=51.17&lon=-116.18&habitat=forest&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&alpine=valley&palette=A`
- Change `alpine=overlook` or `alpine=treeline` for the other families; `palette=B` or `palette=C` changes state; `seed=41`/`73` changes the landscape; `camera=inspection` opens the existing elevated view.

Recipe data can be regenerated with `makeAlpinePlan(family, seed, palette)` from the pure module. Capture commands: `node artifacts/alpine-study/capture-validation.cjs`, then `capture-holdout-regression.cjs`; these verify frozen hashes. Do not retune against revealed holdouts under this experiment. Review/records live in this folder; no default approved scene was replaced.
