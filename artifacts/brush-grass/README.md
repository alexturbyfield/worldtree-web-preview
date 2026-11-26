# Brush-weight grass study

[Matched before/after](comparison.png) · [Concept / baseline / rejected / retained](review-sheet.png) · [Close and inspection views](details.png) · [Thumbnail comparison](thumbnail-review.png) · [Structured review/measurements](record.json)

The concept carries foreground visual weight in broad, flowing gold masses; fine blades reinforce those masses. Dense C read as many stiff separate ribbons. This study replaces those ribbons in an **opt-in** variant with painted clump surfaces, while retaining the sparse C tree, camera, ground, sky, lights, rocks and deterministic seed29.

## What was tested and observed

1. Generated four independent painterly grass silhouettes using the built-in **image_gen** tool with transparent output. The [exact prompt](atlas-prompt.txt) requested coherent grass masses, feathered arched tips, olive/amber bodies and restrained golden accents. The [raw generated PNG](generated-atlas.png) is saved here. The project asset is [public/assets/savanna-brush/painted-tufts-v1.webp](../../public/assets/savanna-brush/painted-tufts-v1.webp), converted with sharp while preserving alpha. Native output is1254x1254, not the requested2048: it was not upscaled or presented as native2K. The asset is new generated artwork, not a crop of the concept.
2. The first render used crossed bowed surfaces, strong tip tint and painted luminance. Actual image inspection found repeated pale rounded bushes. **Rejected**, with source and images preserved.
3. The revision aligns two bowed surfaces with the dominant grass flow, broadens them, reduces tip tint, retains painted hue/luminance and suppresses distant card detail. Actual hero/thumbnail inspection reads it as connected amber strokes with less blade-level contrast. **Retained provisionally for art direction**, not final-approved. It is closer in mass/flow, but the reference remains more luminous and richly structured.

Close views still reveal alpha surfaces and repeated tuft construction. The new result is softer at the encounter camera, not a solved all-distance physical grass representation. Inspection shows thinner distant dressing; no claim of complete concept matching or perfect ground blending. All actual hero, close and elevated PNGs were inspected through a vision-capable tool; metrics alone did not choose the result.

## Integration

Existing `src/lib/forest/savanna-recipe.ts` gains `r-fidelity-tuft-brush`. It reuses the density masks and world-space pigments,2400 coarse midground and500 near clumps. Two aligned curved surfaces per clump; alpha-tested painted silhouette; no per-card shadow casting. Original dense C remains available and its recapture is pixel-identical to the stored reference.

The atlas uses sRGB, mipmaps and anisotropy8. Its generated gutters were narrower than requested, so the shader attenuates cell borders before alpha testing. This limits edge bleeding but is not full production-atlas approval. AlphaTest is0.24; this is masked opaque rendering, not a blur postprocess, bloom, exposure boost or screen filter. Texture detail is combined with the shared world pigment field instead of replacing ground colors independently.

## Cost / checks

|640x360 hero|Draw calls|Submitted triangles|Grass clumps|
|---|---:|---:|---:|
|Dense C baseline|11|416,922|4,850|
|First brush trial, rejected|11|96,922|2,900|
|Revised brush trial|11|88,922|2,900|

Triangles drop about79%, but alpha overlap can dominate fragment cost. The new native atlas adds about8MiB theoretical RGBA+mip memory; capture's generic material-uniform inventory may not enumerate this injected shader texture, so it is reported explicitly. **No mobile device/FPS approval or hardware alpha-overdraw measurement.** Local submission/completion samples are retained in JSON, not treated as device frame times.

`npx tsc --noEmit` passed. Runtime page/shader errors: none. Placement reproduction and unchanged-system guards pass. Dense C baseline recapture is pixel-identical. Puget/rainforest source paths were not edited and were not recaptured in this small pass. Only seed29 was reviewed. No full build/test suite, deployment, commit or push.

## Files / reproducibility

- `src/lib/forest/savanna-recipe.ts`: isolated brush asset/material/geometry branch; old variants unchanged.
- `public/assets/savanna-brush/painted-tufts-v1.webp`: new alpha artwork.
- `visual-lab/feedback/brush-weight-direction.json`: user's explicit softer brush-weight request, without inferring approval.
- This folder preserves prompt, source snapshots, generated artwork, reference observations, two iteration decisions, camera/settings/parameters, measurements and critiques. No universal artistic rule or human-approved result was created.

Preview on the existing local server:

`http://localhost:3001/explore?lat=-2.3&lon=35.2&habitat=grassland&conditional=1&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human&composition=C&groundLighting=B&illumination=on&pretty=on&treeStudy=C&labCandidate=r-fidelity-tuft-brush`

Use `labCandidate=r-fidelity-tuft-c-dense` for the previous dense C. Stop here for art-direction review: judge the broad brush weight before investing in better close-range volume, atlas diversity or sparse 3D silhouette detail.
