# Wave1 decisive pass — desert selected, wetland experiment rejected

**Desert is substantially recomposed.** The nearly empty plane is replaced by asymmetric foreground rock shoulders, receding smaller exposures, a textured approach and shallow drainage relief. **The wetland experiment did not deliver a convincing improvement and was rolled back.** These are separate outcomes, not a claim that all three scenes succeeded.

![Selected before/after](retained-hero-comparison.png)

## Review images and local previews

- [Selected elevated comparisons](retained-inspection-comparison.png), [thumbnail comparison](retained-thumbnails.png), [selected three-seed heroes](selected-hero-seeds.png), [selected inspection views](selected-inspection-seeds.png).
- [Rejected/experimental hero comparisons](hero-comparison.png), [rejected/experimental elevated comparisons](inspection-comparison.png), [concept comparisons](concept-comparison.png), [candidate sky-cropped comparison](no-sky.png). Raw `final` files mean the frozen experiment, not approval. Wetland images in that folder remain negative evidence.
- [Desert preview](http://localhost:3001/explore?lat=34&lon=-116.15&habitat=forest&wave1=desert&fieldStudy=rebuild&artPass=decisive&seed=29&density=36&structure=grove-1&appearance=garden&wind=0).
- [Retained mangrove preview](http://localhost:3001/explore?lat=25.2&lon=-80.9&habitat=coastal&wave1=mangrove&fieldStudy=rebuild&artPass=decisive&seed=29&density=36&structure=grove-1&appearance=garden&wind=0).
- [Retained flooded preview](http://localhost:3001/explore?lat=26.209957419&lon=-80.9383825925&habitat=wetland&conditional=1&wave1=flooded&fieldStudy=rebuild&artPass=decisive&seed=29&density=36&structure=grove-1&appearance=garden&wind=0).

Change seed to41 or6131; orbit with the existing controls. Remove `artPass=decisive` to restore the previous field-study presentation. `artPass=split` reproduces the preceding checkpoint. Add `wetStudy=rejected` only to replay the rejected wetland experiment. Generic and earlier biome fallbacks remain available. Nothing committed, pushed, deployed or promoted globally.

## What the actual images show

Vision interpretation was used, including the supplied concepts, iteration images, actual160×90 thumbnails, all three seed heroes and elevated sheets. Review is by the root agent; no independent review is claimed. No human final approval was recorded.

### Desert

The thumbnail now has substantial side silhouettes and a readable opening rather than a bare brown foreground with tiny distant blocks. Seed41 reverses the dominant framing side; the holdout also preserves the opening. Local terrain and mass shapes vary deterministically. The generated material makes sediment and fine gravel readable near the viewer.

This is a substantial compositional improvement, **not finished concept-quality geology**. Major remaining defects:

1. Rock faces remain too smooth/swollen and some shaded interiors are too dark; mineral/joint marks do not yet match the concept's eroded geological detail.
2. Shrubs are readable but skeletal, with sparse pale leaves. They need a better low-shrub foliage construction, not more instances.
3. Inspection reveals sparse middle-distance dressing and conspicuous broad sediment fields. Foreground massing is stronger than general environmental richness.

Retain the new composition provisionally for human review. Do not promote its rock representation as a universal approved recipe.

### Mangrove and flooded grassland

Texture-preserving pigment normalization, stronger damp/dry variation, local near-water diffuse bounce and selective crown highlights were tested without changing layout, camera, trees or water optics. Thumbnail gains were small. Elevated views exposed broad cloudy pigment/moisture patches across the terrain; this is an artistic regression, even though the code and geometry checks passed.

**Both wetland candidates were rejected.** The retained presentations are restored. Four fresh hero/elevated captures are pixel-identical to the prior baseline after rollback: [proof](rollback-checks.json). The new wetland goals remain unmet; they are not described as successful. The previous grass fan repetition, clean shoreline boundaries and under-detailed foregrounds remain known limitations.

## Desert implementation

The old225 transforms are no longer used by the new desert mode. Sixty formations create a large asymmetric shoulder, smaller counterweights and irregular receding exposures. Anchors, sizes, rotations and masses are presentation data derived deterministically from the seed and encounter plan. Foreground geometry explicitly respects the character capsule approach. No circular clearing or raised staging pad is introduced.

The new representation samples a smooth implicit eroded mass, clips it with geological joint faces, and meshes it using marching tetrahedra. Six seed-specific forms use two sampling resolutions. This is a replacement for the regular angular mold, not a further variation of it. Bounded world-space normal relief and the existing mineral material supply surface response. A thin through-cut initially produced sky-facing holes; it was replaced with a resolved surface groove before freezing. A targeted closed-surface test verifies the repaired construction on a diagnostic specimen.

Low-relief world-space undulation and shallow sinuous washes modify the existing terrain. A constant vertical offset keeps the old camera at1.7m above its terrain point; it does not carve a camera-following pad. Fields remain fixed while orbiting. These are synthetic illustrative landforms, not measured drainage or geological observations. No mountains or new claims about local terrain were added.

Existing sparse unnamed shrub/dry-grass growth forms and contact gravel are reused around the new formations, then aligned to the modified terrain. No named desert species, iconic cactus or unsupported tree was introduced. The ecological resolver is unchanged.

The new sediment albedo is independently generated artwork, not a crop of the concept. Actual size is **1254×1254**, despite requesting2048; it is not claimed as2K. It uses sRGB, mipmaps, anisotropy4 and3.8m world-space scale. [3×3 tiling preview](arid-3x3.png) was visually inspected: no hard seam is apparent at preview scale, but repeated diagonal mineral structure remains. World-space macro fields reduce rather than eliminate repetition. [Asset provenance](asset.json).

Directional light, contact shadows and cooler atmospheric distance remain coherent. No emissive ground, bloom, exposure increase or global filter was used. Scene exposure remains1.12. The water shader—including actual reflection, Fresnel, attenuation and ripples—is unchanged.

## Validation and performance

- Development seeds29/41 and frozen untouched6131; hero and elevated views,640×360. Eighteen matched before/after pairs have identical camera arrays. Wetland instance transforms remain identical. Desert transforms intentionally change. [Checks](matched-checks.json).
- No tuning against the holdout. The post-holdout change is a selective rollback of the rejected wetland experiment, recorded in [retention.json](retention.json); the original [candidate freeze](freeze.json) and negative images remain intact.
- Nine staging/shader audits found positive dry approach samples, zero rock/shrub AABB intersections, zero source-root intrusions and no shader failures. [Audit](verification.json). Rendered capsule proxies are saved. This is not physics/navigation validation.
- Seven protected captures are pixel-identical: Puget hero, savanna/rainforest/alpine hero and inspection. [Regression results](regression.json). The later rollback changes only the opt-in wetland selection guard.
- TypeScript and10 targeted implicit-rock/relief/detail/field tests pass. `git diff --check` passes with pre-existing line-ending warnings. No full build/suite, full orbit audit or mobile device test.

Seed29 warmed submitted work (main view plus nested reflection passes; static shadow-map bake excluded):

| Scene | Calls before→selected | Triangles before→selected |
|---|---:|---:|
| Desert |11→14|477,028→673,392|
| Mangrove |23→23|2,546,486→2,546,486|
| Flooded |21→21|2,182,574→2,182,574|

Desert costs about41% more submitted triangles and three additional draws for the stronger foreground. Seed29 has60 rock formations,2247 contact chips,8 shrubs and242 dry tufts. Wetland instancing/counts remain unchanged. The new albedo adds approximately8MiB decoded RGBA with mipmaps. Implicit mesh construction also increases generation work; it was not benchmarked on mobile. Raw CPU submission samples are headless diagnostics, not GPU timing or FPS. Alpha overdraw and total texture residency were not measured. No mobile performance approval.

## Files and learning

Runtime edits are localized to new [wave1-desert-direction.ts](../../src/lib/forest/wave1-desert-direction.ts), [wave1-rebuild.ts](../../src/lib/forest/wave1-rebuild.ts), and [wave1-wet-lighting.ts](../../src/lib/forest/wave1-wet-lighting.ts). New [tests](../../tests/wave1-desert-direction.test.ts) and [albedo asset](../../public/assets/wave1-detail/arid-sediment-v1.webp). Baseline/final source snapshots are preserved alongside the captures.

[Lab session](../../visual-lab/wave1/decisive-session.json) records all three correction rounds, failures, image evidence, holdout provenance and per-biome decisions. Foreground massing is experimentally supported; the rock representation remains proposed. Strong low-frequency wetland moisture noise is explicitly rejected. No human preference labels or human-approved best pointers were fabricated.

Next priority: improve the desert's eroded surface/edge character and low-shrub foliage while retaining its new spatial hierarchy. For wetlands, investigate substrate variation at actual shoreline/material scales before attempting another broad pigment field. This pass stops at the bounded review checkpoint; wetland objectives are incomplete.
