# Alpine painted grassland — visual direction, not technically accepted

[Before/after direction](direction-comparison.png) · [Ground-only comparison](ground-only.png) · [Earlier close integration study](comparison.png) · [3×3 ground artwork preview](ground-3x3.png) · [Earlier seed/palette/holdout checks](validation.png)

**The new field is visually more coherent, but its performance is substantially worse. It remains opt-in; the previous alpine scene stays active.** This pass is not a completed production-quality meadow or mobile approval. Actual supplied concept, savanna reference, before/new hero, ground-only, close-up, inspection, thumbnail and prior frozen holdout screenshots were visually interpreted by the implementing agent. No independent reviewer or human approval is claimed.

## What changed

New painterly meadow albedo replaces the old fibre texture in the experiment. Broad green/cool-shadow/yellow-green fields coordinate ground and vegetation. Shared savanna bowed brush geometry and unchanged tuft atlas add soft grass masses, with curved dimensional accents. Cards are GPU instanced and cast no individual hard shadows. Ground and grass roots share pigment/detail; detail fades above the roots so it cannot smear into vertical stripes. Terrain normals are transferred after rock clearance.

Four padded flower illustrations replace polygonal flower spikes in one instanced atlas batch: paintbrush, violet fleabane, western-anemone-inspired white flowers and a pale fleabane variation. Existing banks plus six irregular drifts give broader flower fields; isolated flower marks are removed. Existing slope/rock/drainage checks, deterministic seeds and an open focal area remain. No tree architecture, tree positions, rock positions, terrain, camera, sky, lights or ecological occurrence data changed.

Regional inspiration is the [Parks Canada Rocky Mountain wildflower guide](https://parks.canada.ca/~/media/pn-np/ab/banff/natcul/pdfs/wildflowers_of_the_rocky_mountains.ashx), whose indexed text names paintbrush, western anemone and fleabanes. Full PDF retrieval timed out. This is regional art guidance for the Banff/Lake Louise query, not a point-occurrence survey, validated bloom calendar or exact botanical reconstruction. New images were generated independently; no copyrighted reference photographs were downloaded.

## Iteration decisions

1. First transfer: richer surface and flowers, but tufts too short and dimensional accents nearly black. Revise.
2. Taller bowed tufts and grass normals: better body, but vertical card streaks remain. Revise.
3. Root-normal transfer alone barely helps. Isolated tuft and compiled shader inspection identify the actual streak source: fine ground detail projected along the entire card. Fade it with physical height; retain that visual correction.

The three artistic rounds are exhausted. Subsequent **technical** performance diagnostics did not introduce a new artistic direction or tune against a holdout. Early alpha rejection, vertex macro shading and CPU-baked macro pigments preserve the look but do not adequately fix cost. Lower atlas filtering, front-to-back sorting and removing shadow reception give too little benefit; those latter changes are not adopted. Existing physical shadows and anisotropy8 remain.

Keep the useful texture/root/flower assets and source evidence, but reject this dense overlapping-card representation for promotion. Next study should compare coverage-aware near cards and lower-overdraw middle distance rather than keep optimizing this shader or transferring raw savanna counts into a smaller meadow.

## Measurements

|Seed29 view|Before|Experimental|Draw calls before→new|
|---|---:|---:|---:|
|Hero triangles|641908|501884|14→12|
|Inspection triangles|548020|407996|14→12|

3448 grass/low clumps retained:3132 bowed brush clumps plus316 dimensional accents.936 flower-card clumps.15 rocks. Rock clearance:298 grass and39 flower clumps relocated,0 removed/overlapping. Implemented ecological checks:0 violations. Trees, rocks and camera data are unchanged. [Invariants](invariants.json).

The matched software-renderer orbit initially fell from6.02FPS to1.57FPS. A later vertex-field correction measured6.23→1.89FPS; CPU-baked field fixed-camera readbacks remained about520ms. These are **bad relative results**, despite fewer triangles. Shadow/filter/sort ablations and removal of the brush layer localize most added cost to the cards; the exact hardware fragment bottleneck is not certified. [Benchmarks](benchmark.json), [initial rejected benchmark](rejected-fragment-field-benchmark.json), [ablations](shadow-cost-ablation.json).

All runs use SwiftShader,640×360 framebuffer, pixel ratio1. Browser frame intervals/readback wall times are not hardware GPU timers or a phone benchmark. Additional RGBA+mip texture estimate about16MiB for brush and flower atlases; the new1254² ground replaces a similarly sized detail texture. Hardware alpha overdraw was not measured. No mobile approval.

## Validation and provenance

Puget hero, rainforest hero/inspection, retained savanna hero/inspection and alpine opt-out hero/inspection recaptures are pixel-identical. [Regression](regression.json). Later performance-helper changes are alpine-only; protected renderer/source paths did not change afterward.

The pre-performance version was tested on treeline29/41, valley41, paletteB and held-out9973 after its original freeze. Its holdout/source are archived. Final CPU-baked experimental version has hero/inspection29 captures and technical ablations. It is not technically accepted, so a new final holdout10007 remains reserved and ungenerated rather than wasting another holdout on a rejected representation. No silent tuning against9973. [Final experimental freeze](final-experimental-freeze.json), [structured critique/history](experiment.json), [controller](controller.json).

TypeScript passes;5 existing targeted alpine/conifer/flower tests pass. These do not certify the new GPU material. Actual captures report no shader/page errors. No full lint/build, commit, push or deployment.

The artwork3×3 repeat reveals periodic forb motifs and imperfect source-edge matching. Runtime mirrored wrapping avoids hard colour jumps, with macro fields breaking repetition. Do not label this a certified seamless production texture. Close-up cards still read as layered painted surfaces. Existing flat lateral/inspection continuation remains unresolved. No whole-scene artistic approval is recorded.

## Files and preview

New `src/lib/forest/alpine-meadow.ts`; modified `alpine-adapter.ts`, `alpine-recipe.ts`; `savanna-recipe.ts` only exports its existing brush/reed geometry with unchanged default behaviour. New `public/assets/alpine-meadow/meadow-ground-v1.png` and `regional-flowers-v1.png`. Shared landscape grammar stores scoped root-detail evidence and a proposed alpha-coverage budget lesson; it does not approve the failed full representation. This artifact folder contains source snapshots, capture/diagnostic scripts, images, hashes and measurements. Prior work remains recoverable.

Experimental preview: http://localhost:3001/explore?lat=51.17&lon=-116.18&habitat=forest&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&alpine=treeline&palette=A&backdrop=subtle&alpineArt=meadow&meadowField=brush

Remove `meadowField=brush` for the retained scene. The recommended next art target is this softer meadow and more natural flower silhouettes, but the next implementation must use substantially less overlapping alpha coverage. Stop for visual and representation-direction review.
