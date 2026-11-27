# Temperate forest: concept appeal and continuity

[Concept / before / retained comparison](comparison.png) | [Inspection](inspection.png) | [Review decisions and reusable rules](review.json) | [Checks and performance](validation.json)

[Preview seed 29](http://localhost:3001/explore?lat=50.5&lon=10.5&habitat=forest&expansion=temperate&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)

## Three highest-impact gaps observed before implementation

1. **Forest depth, major.** The concept is a continuous interior: low leaves, trunks, intermediate crowns and deep forest overlap. Wildloom exposed bright blue/brown beneath a level canopy underside. An isolated tall source tree repeated as distant cards preserved the same clear-trunk gap.
2. **Interlocking shapes, major.** In the concept, saplings, ferns, rocks and leaning trunks cross the boundaries between foreground, middle and distance. The render divided into a low floor carpet, bare stems and overhead foliage. Detail within each band did not repair that separation.
3. **Foliage value hierarchy, major.** The concept uses deep green shadow as a broad mass around limited warm foliage accents. Too much of the render's canopy was pale lime. Light was not selective enough to establish forest depth.

These are direct image observations. The specific repeated-source and shader causes were then confirmed in code. The supplied sheet's bottom row is reference artwork, not a Wildloom rendering.

## Retained experiment

Three opt-in runtime files: `src/lib/forest/wave2-temperate-depth.ts` (new), `wave2-temperate.ts`, `wave2-temperate-concept.ts`. No shared renderer rewrite, new dependency, image download or global recipe change.

- Replace the single-specimen distant ring with 210 instanced, staggered forest patches. Four mixed-height stand images are baked from current eligible source trees with the existing leaf renderer. Low regeneration and taller crowns overlap vertically. These are presentation proxies, not botanical occurrence records.
- Add 22 small batched source-linked saplings between the floor and main canopy. They frame the sides without changing canonical mature trees or obstructing the staging footprint.
- Restrain the broad lime foliage response and rim lighting. Keep richer shaded green interiors and reserve the stronger warm response for selected upper/exterior regions.
- Reject the initial near-black backdrop. Retain a brighter source bake and restrained cool distance treatment applied only to the continuation. No foreground fog, screen-space vignette or dark ground curtain added.

## Actual visual result

The retained seed 29 and 41 hero images close the bright under-canopy strip and read as an enclosed forest instead of three separated bands. Variable sapling and backdrop heights interrupt the horizontal division. Crown greens are quieter. The untouched post-freeze seed 9182743 retains enclosure and staging; a 90-degree view has forest continuation, although the side floor remains too bare.

This is substantially better forest continuity, **not concept-quality artistic approval**. The concept still has more convincing branch hierarchy, small-scale leaf structure, fern silhouettes, varied floor dressing and selective dappled light. Current large fern leaves remain bright/faceted; broadleaf sprays and exposed branch scaffolds remain stylized. Elevated inspection shows the synthetic stand and approximate billboard parallax. Next highest-value experiment: a representative broadleaf/understory material-and-silhouette study, rather than more distant tree density.

## Validation and cost

Actual images inspected by the primary agent; no claim of independent or human approval. Camera, lighting, main-tree geometry/positions, source species and deterministic seeds are unchanged. Pure data checks passed for seeds 29 and 41. Targeted TypeScript check passed. No full build or lint suite run.

Seven protected Puget, savanna, rainforest and alpine views are pixel-identical. Wave 1 renderer code is untouched.

Seed 29: 12 to 15 draw calls, 788238 to 942962 submitted triangles (+19.6%). Seed 41: 15 calls / 968442 triangles. Holdout: 15 calls / 995966 triangles. Estimated tracked texture allocation rises about 14 MiB (the 2048-square baked atlas replaces the old smaller atlas). Bake cost is incurred once per scene; captures do not measure mobile GPU performance or alpha overdraw. No mobile approval.

The heuristic lower-canopy blue-hole fraction falls from 4.8% to zero in seed 29 and 3.6% to zero in seed 41; near-black pixels in that region also decrease. Those diagnostics support the observed closure and rejection of the dark curtain, not aesthetic approval.

Sources are frozen in `freeze.json`; holdout was generated afterward without retuning. All intermediate images and source snapshots remain recoverable. No commit, push or deployment.
