# Flooded grassland — exposed sediment and tree finish

![Matched before and after](hero-ab.png)

[Full-resolution A/B](hero-ab-full.png) · [Ground close-up](ground-detail-ab.png) · [Tree close-up](tree-detail-ab.png) · [Elevated A/B](inspection-ab.png) · [Three hero seeds](hero-seeds.png) · [Three inspection seeds](inspection-seeds.png).

## Visible change

The former green foreground now contains broad, visibly brown exposed-earth regions. Existing high-quality tidal sediment artwork supplies fine gravel, organic fragments and compacted soil; two world-space sampling scales preserve detail. The irregular mask controls both material blending and grass height, so large blades no longer grow uniformly through bare patches. Taller lateral clumps remain as framing. There is no circular clearing primitive, staging uplift or hydrology edit.

Trees retain source individuals, seeds, positions, growth forms and the distinctive forked architecture. Near foliage sprays overlap modestly more; distant group-based thinning replaces the old every-twelfth-spray reduction and giant sprays. Secondary branch geometry remains visible to support those crowns. Cooler green interiors, restrained yellow-green crown highlights and reduced fine leaf contrast make the crowns more coherent. No new named species or local botanical claim, new tree generator or leaf atlas.

## Review and iteration

Actual concept and render contents were inspected by the root agent through `view_image`; no independent reviewer or human approval claimed. The supplied wetland concept informed bare foreground sediment, uneven grass boundaries and quiet green crowns.

1. **R1, revise:** dirt became obvious, but too dark; uniform thinning weakened side framing. Tree mass continuity improved.
2. **R2, retain provisionally:** lighter, less orange soil preserves granular detail; ragged boundaries and protected side clumps give a more natural opening. The shared soil mask remains deterministic and attached to terrain when orbiting.
3. **Robustness:** development29/41 plus frozen untouched63817. Holdout has more exposed soil, but retains the water mosaic and readable foreground. No tuning after holdout. [Freeze and source hashes](freeze.json), [mask checks](mask-checks.json).

Remaining limitations: seed29 has a broad, softly edged grassy remnant within the dirt; some grass stays too straw-colored in strong light; leaf silhouettes remain visibly atlas-based at close range. The tree pass is a visual refinement, not a claim of perfection or final biome approval. No unrelated scenery was added.

## Preview

[Open the flooded-only candidate](http://localhost:3001/explore?lat=26.209957419&lon=-80.9383825925&habitat=wetland&conditional=1&wave1=flooded&fieldStudy=rebuild&artPass=flooded-finish&seed=29&density=36&structure=grove-1&appearance=garden&wind=0). Use seeds41/63817 and the existing orbit/inspection controls. `artPass=fidelity` restores the matched before view. Other biome previews retain their existing modes.

## Scope and cost

Runtime files changed: `src/lib/forest/wave1-flooded-finish.ts` and the flooded-only hooks in `src/lib/forest/wave1-rebuild.ts`. Existing texture reused: `public/assets/wave1-detail/tidal-mud-v1.webp`. No new artwork, dependencies or UI. Water shader, field heights, camera, lighting settings and ecological data are unchanged.

Seed29 warmed submitted work, including reflection passes: **21→21 draw calls;2,182,574→2,414,846 triangles (+10.6%)**. Additional work is tree crown/secondary-branch detail; grass instances remain batched. The soil texture adds runtime texture memory and fragment sampling; no GPU/device frame-time or mobile performance approval is claimed. Seed41 submits2,550,190 triangles; holdout63817 submits2,476,950. [Matched validation and instance/staging metadata](validation.json).

Targeted TypeScript and diff checks pass. All captured frames have no page/shader errors. Fresh native-resolution desert and mangrove hero/elevated views are pixel-identical to the preceding checkpoint. Puget/savanna/rainforest/alpine paths were not modified; their captures were not repeated in this flooded-only pass. No broad suite/build/device audit.

Candidate and source evidence are recorded in the existing Visual Learning Lab. No human-approved best pointer changed. Nothing committed, pushed, deployed or globally promoted.
