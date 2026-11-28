# Tree/ground cohesion checkpoint

[Matched hero comparison and foreground crop](comparison.png) · [Elevated comparison](inspection.png) · [Exact source/parameters and review](record.json)

This pass implements the user's three requests while preserving the retained tall brush,192 reed clumps, rock clearance, sky, lighting, camera, ecological identities, locations and seeds. It is a new opt-in presentation (`treeStudy=C3`, `labCandidate=r-fidelity-tuft-cohesion`), with previous C/tall-hybrid left accessible.

## Changes and actual observations

**Background acacias:** eligible existing acacia trees now use the same sparse forked/layered C procedural study as the foreground tree, with their original individual structure/appearance seeds and existing ecological identities/positions. Profiles scale to previous apparent height up to mature C size. Shared library batching/material/atlas gives a consistent foliage vocabulary. The first render was thin at distance; widening background leaf sprays20% and length15% improved mass readability without adding groups. Background attention/atmosphere still keeps them quieter than the focal tree. No new species or ecological selection changes.

**Ground/card-root palette:** warmed the shared near-field shade/body to `#876A3D` / `#B68B46`, with rolling shade `#80663D`, and reduced painted fibre contrast to70% of its prior amount. This reduces the gray-brown ground contrast beneath the amber cards. Both ground and card-root pigments sample the same world field, retaining the existing6–30cm height-based texture/atlas transition; it is not an independent flat tint or exposure change. Mid/far atmospheric pigments, relief, ground assets and placement stay intact.

**Foreground upper clump:** original C trunk, forks,153 groups and612 sprays are preserved; exactly1 group with4 sprays is appended, supported by4 short branch segments. The first placement looked slightly detached; the retained revision lowers it into overlap with the existing upper crown. Final153→154 groups,612→616 sprays,740→744 wood segments. It does not refill or stretch the sparse crown. Foreground crop is from the same fixed camera coordinates, not a different tree framing.

Actual640x360 hero/inspection/grass-detail renders and matched foreground crops were interpreted with vision. The revised result has more consistent background silhouettes/color, a warmer ground-to-grass relationship, and a small upper silhouette addition. Remaining issues: distant leaves still fragment at small pixel sizes; some low grass-card edges and background foliage overlaps behind the hero trunk remain; the inspection ground is still comparatively smooth. This is provisional agent review, not final human approval.

## Implementation correction / iteration history

The initial new supporting branch lacked tangent metadata required by `paintedWoodGeometry`, causing scene initialization to fail. Browser exception inspection identified it; tangent/cap metadata was corrected locally in the adapter, without changing the shared renderer. TypeScript alone did not reveal this runtime contract. No failed image was accepted.

First successful render: warm ground and common background treatment retained, but thin background sprays/detached upper clump revised. Second successful render: wider background sprays and overlapping upper clump retained for review. Previous evidence and fallbacks remain untouched.

## Verification and cost

|Seed29,640x360 hero|Draw calls|Triangles|
|---|---:|---:|
|Previous tall hybrid / C|12|122,266|
|Retained cohesion / C3|11|174,552|

The background trees share the existing acacia foliage batch, replacing separate legacy cards. More detailed branch-owned backgrounds increase triangles42.8% while removing one draw call. No new image/atlas assets. These are local headless-renderer counts, not mobile FPS or device approval; hardware alpha overdraw was not measured.

Checks run: `npx tsc --noEmit`;4 existing targeted tree tests; artifact-level assertions verifying C3 determinism, source immutability, unchanged tree count/ecological object references/positions/individual seeds, unchanged original foreground groups/fronds, and exactly1 added group. All pass. Successful captures have no page/shader errors, and non-target guards/layout reproduction pass. Old tall-hybrid screenshot recapture is pixel-identical. Rock clearance still reports0 overlaps and the same3342 plants/15 rocks. Puget/rainforest code paths were not changed and were not recaptured. Only seed29 was visually reviewed; no broad build/tests, commit, push or deploy.

The existing isolated-foliage diagnostic now includes background foliage because acacias share a batch. Do not treat it as an isolated foreground-tree comparison; use the matched hero crop supplied here.

## Files

- `src/lib/forest/tree-experiment.ts`: opt-in C3 background treatment and one branch-owned foreground clump.
- `src/lib/forest/savanna-recipe.ts`: opt-in coordinated ground/root palette; retained grass, heights, counts and clearance.
- `visual-lab/feedback/tree-ground-cohesion.json`: user's positive prior feedback and three requested refinements, without inferring approval of this new result.
- This folder preserves source snapshots, fixed capture data, structural checks, critiques, iteration history and performance measurements.

## Preview

`http://localhost:3001/explore?lat=-2.3&lon=35.2&habitat=grassland&conditional=1&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human&composition=C&groundLighting=B&illumination=on&pretty=on&treeStudy=C3&labCandidate=r-fidelity-tuft-cohesion`

For the prior baseline, use `treeStudy=C&labCandidate=r-fidelity-tuft-hybrid-tall`. Stop here for visual review.
