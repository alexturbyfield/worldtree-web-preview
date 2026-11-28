# Wave1 concept-fidelity review checkpoint

![Concept / retained baseline / candidate](concept-overview.png)

This is a visible change, **not concept-quality approval or completion of the artistic target**. Desert framing is substantially stronger; mangrove mud/light separation is more readable; flooded grass is warmer. The isolated rock test improved through rejected spire, egg and slab constructions, but does **not** satisfy the requested “visually excellent rock” gate. Flooded holdout vegetation becomes too pale. These remain open gates, not passing tests disguised as artistic success.

## Images

- [Matched before/after overview](before-after.png), [thumbnail comparison](thumbnails.png).
- Desert: [full-resolution concept comparison](desert-concept-full.png), [matched A/B](desert-ab-full.png).
- Mangrove: [full-resolution concept comparison](mangrove-concept-full.png), [matched A/B](mangrove-ab-full.png).
- Flooded: [full-resolution concept comparison](flooded-concept-full.png), [matched A/B](flooded-ab-full.png).
- [Three-seed hero views](hero-seeds.png), [elevated views](inspection-seeds.png). Development29/41; frozen holdout27139. Concepts are upscaled from supplied originals in full-resolution sheets; candidate renders are native1920×1080.
- [Isolated current rock assembly](rock-isolated-r1.png); rejected [spire](rejected-spire.png), [rounded core](rejected-rounded-core.png), [slab](rejected-slab-core.png). [Mirrored texture tiling study](granite-mirrored-3x3.png).

## What visibly changed

**Desert:** replaces the small separate rocks with connected upright/slumped geological shoulders, asymmetric foreground cropping and receding smaller forms. New joint-cut/weathered implicit geometry and generated granite albedo replace the clay-like surface. Lower-detail distant cores avoid submitting the full assembly at every distance. The same sparse shrubs carry denser leaf masses; no new named botanical occurrence. Ground receives coordinated mineral, erosion and sediment variation. Open horizon, character footprint and original low relief remain.

**Mangrove:** existing positions, tree architecture and water openings remain. Crown normals drive selective warmer foliage highlights with cool interiors. Sediment has warm exposed deposits, darker wet material and stronger texture contrast. The earlier severe art-shadow attenuation is reduced rather than covered with exposure or emission. World-space broken light retains local texture; physical tree shadows remain independent.

**Flooded:** narrower, taller existing near ribbons and height-dependent golden tips replace the uniformly green material response. Spatial pigment fields and exposed soil remain stable in world space. A material-selector defect initially prevented the new grass shader from running; corrected captures are retained separately. The first active version was rejected as excessively pale, then moderated. Holdout27139 still shows too much pale straw, so this recipe is not robustly accepted.

No water tint, water-shader edit, exposure change, bloom, new sky, ecological data change or protected-biome modification. Original `variation` and generic fallbacks remain accessible.

## Critique and decision

| Severity | Visible discrepancy | Decision / next useful work |
|---|---|---|
| Major | Desert cores are still overly simple and smooth compared with naturally fractured concept rocks; granular texture cannot replace structural detail | Keep isolated negative evidence. Do not label the assembly excellent. A genuinely sculptural rock representation is the next highest-value investment |
| Major | Desert foreground has stronger anchors but still too little connected medium-scale substrate and low vegetation richness | Retain composition provisionally; develop geological shoulders/substrate together rather than add random counts |
| Major | Mangrove remains too open, with coarse spray silhouettes and obvious separate specimens | Material gains retained provisionally. Current fixed architecture/layout limits near-concept enclosure; do not hide this with fog |
| Major | Flooded grass becomes pale and repetitive across the holdout; ground is still lawn-like in places | Do not promote over the best-known recipe. Revisit representation/pigment under multiple actual lighting responses |
| Minor | Artificial mineral texture repetition and distant shape reuse remain possible | Mirrored/triplanar preview reduces seams, not proof of unrecognizable repetition |

Full-resolution inspection also shows pale crown flecks and coarse polygonal litter/seedlings in mangrove, plus hard, repeated grass silhouettes and conspicuous light/dark ground separation in flooded grassland. More pigmentation changes alone will not fix those representation problems. Stop this checkpoint rather than claim the open gates passed: next prioritize a genuinely sculptural geological asset/assembly, then test reuse of the retained savanna brush-clump technique for wetland grass while preserving regional growth forms and water fields.

Root agent interpreted actual images; no independent reviewer or human final approval is claimed. [Initial diagnosis](DIAGNOSIS.md), [strip measurements](final-measurements.json), [structured session](../../visual-lab/wave1/fidelity-session.json). Display-space RGB strips are composition diagnostics, not material masks, physical luminance or aesthetic approval.

## Reproduction and cost

Use the preceding preview URLs with `artPass=fidelity`; `artPass=variation` restores the matched baseline.

- [Desert](http://localhost:3001/explore?lat=34&lon=-116.15&habitat=forest&wave1=desert&fieldStudy=rebuild&artPass=fidelity&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)
- [Mangrove](http://localhost:3001/explore?lat=25.2&lon=-80.9&habitat=coastal&wave1=mangrove&fieldStudy=rebuild&artPass=fidelity&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)
- [Flooded experimental candidate](http://localhost:3001/explore?lat=26.209957419&lon=-80.9383825925&habitat=wetland&conditional=1&wave1=flooded&fieldStudy=rebuild&artPass=fidelity&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)

Seed29 submitted calls/triangles, including nested reflection passes: desert19→19 and938,144→897,240 (−4.4%); mangrove25→25 and2,656,622 unchanged; flooded21→21 and2,182,574 unchanged. [Validation, instance counts and CPU submission samples](validation.json). These software-WebGL samples are not mobile/GPU frame-time evidence. Granite adds about5.33MiB uncompressed mipmapped RGBA memory; detailed nonindexed near assembly vertex buffers add significant memory even though distant LOD keeps submitted triangles down. Mobile cost is unapproved.

Seed29 occurrences: desert56 geological assemblies (8 detailed near,48 simplified far),8 shrubs,298 dry tuft/fibre instances and2,067 gravel fragments; mangrove95 source presentation trees,650 stand cards and4,700 instanced juvenile/litter/twig/gravel elements; flooded24 conditional source trees,100 stand cards,14,151 meadow clumps and23 seedheads. These are presentation counts, not ecological abundance or verified local occurrences.

Seven fresh protected captures are pixel-identical: [regression](regression.json). [Geometry checks](geometry-checks.json) are finite and closed at1e−6 weld tolerance; coarser tolerance collapses tiny edges ([analysis](mesh-tolerance.json)). Targeted TypeScript and diff checks are recorded in session validation; no full suite/build/device audit. [Source freeze](freeze.json) preceded holdout generation; no artistic tuning against holdout.

Runtime files: `src/lib/forest/wave1-fidelity.ts`, `wave1-desert-direction.ts`, `wave1-rebuild.ts`. New generated asset: `public/assets/wave1-detail/desert-granite-v1.webp`; [built-in image-generation prompt/provenance](generated-asset.json). No new dependencies or UI. Lab evidence remains separate from human preference records. No commit, push, deploy, Wave2 or global promotion.
