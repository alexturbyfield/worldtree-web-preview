# Short brush + taller reeds

[Matched hero/close comparison](comparison.png) · [Band diagnosis](band-diagnosis.png) · [Structured review and exact parameters](record.json)

The user found the painted brush grass closer but identified vertical bands and requested ground-matched roots plus a shorter grass layer with sparse taller reeds. The new opt-in `r-fidelity-tuft-hybrid` tests that direction. Sparse C tree, world/individual seeds, camera, lighting, ground assets and sky are retained. No new artwork or species.

## Cause and correction

A fixed-camera shader diagnostic compared the original, removing projected terrain detail, and flattening card normals. Removing the world-XZ ground-texture contribution largely removes the vertical streaks; flattening normals retains them. The primary contributor is ground detail being stretched up upright surfaces. See the actual diagnostic PNGs and [comparison](band-diagnosis.png); this finding is scoped to this shader.

The hybrid retains shared world-space ground pigments, contact coloration, atmosphere and texture at planted roots. Ground detail fades out6–30cm above each planted anchor; painted atlas hue/detail and gentle card-normal response fade in through the same physical-height zone. This avoids projecting terrain detail over the entire upright surface and prevents the atlas's amber hue from independently recoloring the root. These are engine-neutral relationships; the numeric range is a savanna experiment, not a universal default. Ground elevation across the entire card is not solved per fragment, so slope contact remains approximate.

Brush surfaces shorten from nominal near1.55m/middle0.7m to0.72m/0.42m **before instance scaling and burial**.2400 middle and750 near brush clumps fill the low layer.96 separately instanced tall grass culm clumps add curved narrow leaves and selective seed heads. "Reeds" here denotes the requested tall grass accents, not a new wetland species. All use the existing seeded placement/pigment vocabulary and no individual grass cast shadows. The brush placement retains soft clearing masks and an open central encounter region.

## Actual review

Two coherent iterations: first hybrid used UV-relative blending; retained revision uses world height above the planted anchor so differently scaled clumps blend at the same physical level. Actual640x360 hero, inspection and fixed close-camera PNGs were inspected through vision. The original band diagnostic was also inspected, not inferred solely from code.

The tall streak walls are substantially reduced. The foreground is lower/quieter, roots have a closer texture/value relationship to the ground, and occasional tall culms give dimensional silhouettes. Remaining issues: some low alpha-card edges/steps are visible; exact slope conformance is incomplete; extreme-close reeds still show geometric leaf strips. Standard inspection remains underdressed at distance. This is a provisional visual improvement, not final human approval or perfect blending.

## Cost and verification

|640x360 hero|Draw calls|Triangles|Brush clumps|Tall culm clumps|
|---|---:|---:|---:|---:|
|Previous brush|11|88,922|2,900|0|
|Retained hybrid|12|109,594|3,150|96|

The extra draw call is one GPU-instanced culm batch, not one call per reed. Submitted triangles rise23.2% versus brush-only, still far below the earlier416,922-triangle dense physical grass. No new texture memory. Alpha overlap/hardware GPU timing/mobile FPS were not measured; lower triangles alone do not establish mobile approval. Local submission/completion samples are recorded in JSON.

`npx tsc --noEmit` passed; page/shader errors none; target layout reproduction and non-target guards match. Old brush recapture is pixel-identical to its saved reference. Only seed29 was checked in this quick pass. No Puget/rainforest source paths changed or recaptures performed. No build, broad tests, commit, push or deployment.

## Files and retained evidence

- `src/lib/forest/savanna-recipe.ts`: opt-in short-brush/height-based blend and batched tall grass; prior variants remain available.
- `visual-lab/feedback/hybrid-grass-direction.json`: user feedback, without inferred approval of the new result.
- `visual-lab/landscape-color-grammar.json`: scoped experimentally-supported projection/contact rule, linked to diagnostic and rendered evidence; no universal palette defaults or human approval.
- This folder: recoverable source snapshots, fixed diagnostic camera, before/after renders, exact settings, review findings and performance data.

## Preview

Use the existing local server:

`http://localhost:3001/explore?lat=-2.3&lon=35.2&habitat=grassland&conditional=1&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human&composition=C&groundLighting=B&illumination=on&pretty=on&treeStudy=C&labCandidate=r-fidelity-tuft-hybrid`

Compare previous brush by changing only `labCandidate=r-fidelity-tuft-brush`. The default renderer and all previous study IDs are preserved. Stop here for visual review.
