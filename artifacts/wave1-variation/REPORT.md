# Greener desert, fuller mangrove and flooded soil patches

![Matched before/after](hero-comparison.png)

[Elevated comparison](inspection-comparison.png) · [Three seeds](hero-seeds.png) · [Inspection seeds](inspection-seeds.png). Actual images were visually interpreted; this is provisional agent retention, not human final approval.

## Changes

- **Desert:** greener existing shrub leaves and dry-grass tufts; six distinct rock profiles replace the uniform rounded form, including low slabs, upright masses and saddles. Placement, staging, distant view and seed streams remain unchanged.
- **Mangrove:** larger overlapping near foliage sprays and more retained far foliage. Tree species, branch/root architecture and locations remain unchanged. Upper framing and crown overlap are visibly fuller.
- **Flooded:** deterministic, irregular world-space dirt regions interrupt the painted grass material. Water layout and all grass/tree positions remain unchanged. Some grass still grows through the soil patches; this is a material treatment, not a density-removal mask.

One candidate was sufficient for this focused request. Seeds29/41 and frozen untouched9157 were inspected. Rock silhouettes and green pigments remain stylized; close mangrove cards and existing grass-fan repetition remain visible limitations. No new species, textures, dependencies or UI.

## Preview

- [Desert](http://localhost:3001/explore?lat=34&lon=-116.15&habitat=forest&wave1=desert&fieldStudy=rebuild&artPass=variation&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)
- [Mangrove](http://localhost:3001/explore?lat=25.2&lon=-80.9&habitat=coastal&wave1=mangrove&fieldStudy=rebuild&artPass=variation&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)
- [Flooded](http://localhost:3001/explore?lat=26.209957419&lon=-80.9383825925&habitat=wetland&conditional=1&wave1=flooded&fieldStudy=rebuild&artPass=variation&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)

Use existing orbit controls or seeds41/9157. `artPass=depth` restores the preceding checkpoint. Nothing committed, pushed, deployed or promoted globally.

## Validation and cost

Six matched hero/elevated pairs at640×360 preserve camera arrays and instance matrices. Additional after views cover41/9157. [Source freeze](freeze.json), [matched checks](matched-checks.json), [Lab decisions](../../visual-lab/wave1/variation-session.json).

TypeScript passes. All six diagnostic rock meshes are finite and closed: [geometry checks](geometry-checks.json). No page/shader failures in captures. Seven protected Puget/savanna/rainforest/alpine views are pixel-identical: [regression](regression.json). Full suite, full build and mobile device tests were not run.

Seed29 warmed submitted work, including reflection passes:

| Scene | Calls | Triangles before→after |
|---|---:|---:|
| Desert |19→19|1,047,072→938,144 (−10.4%)|
| Mangrove |25→25|2,622,046→2,656,622 (+1.3%)|
| Flooded |21→21|2,182,574→2,182,574|

Dirt-mask fragment cost is not captured by triangle counts. CPU samples are diagnostic only; mobile performance is unverified. No new texture memory was introduced.

Runtime files changed: [wave1-desert-direction.ts](../../src/lib/forest/wave1-desert-direction.ts), [wave1-depth-texture.ts](../../src/lib/forest/wave1-depth-texture.ts), [wave1-rebuild.ts](../../src/lib/forest/wave1-rebuild.ts). Prior before-source snapshots and renders remain recoverable in this directory.
