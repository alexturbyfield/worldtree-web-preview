# Depth, surface texture and broken-light checkpoint

The desert now opens into a longer landscape: reduced near-rock dominance, intermediate exposures, low distant terrain and a generated land matte. Cooler framing shade surrounds the golden opening. Flooded ground has readable painted grass strokes; mangrove mud has exposed fine mineral fragments. **Selected provisionally for review, not final visual approval.**

![Selected matched hero comparison](selected-hero-comparison.png)

## Images and previews

- [Selected elevated comparison](selected-inspection-comparison.png), [three-seed hero views](selected-hero-seeds.png), [three-seed inspection](selected-inspection-seeds.png), [thumbnail targets/before/after](selected-thumbnails.png), [sky-cropped comparison](selected-no-sky.png).
- [Desert local preview](http://localhost:3001/explore?lat=34&lon=-116.15&habitat=forest&wave1=desert&fieldStudy=rebuild&artPass=depth&seed=29&density=36&structure=grove-1&appearance=garden&wind=0).
- [Mangrove local preview](http://localhost:3001/explore?lat=25.2&lon=-80.9&habitat=coastal&wave1=mangrove&fieldStudy=rebuild&artPass=depth&seed=29&density=36&structure=grove-1&appearance=garden&wind=0).
- [Flooded local preview](http://localhost:3001/explore?lat=26.209957419&lon=-80.9383825925&habitat=wetland&conditional=1&wave1=flooded&fieldStudy=rebuild&artPass=depth&seed=29&density=36&structure=grove-1&appearance=garden&wind=0).

Use41 or8423 for the other captures and existing orbit controls. `artPass=decisive` restores the preceding selected checkpoint; earlier field/generic fallbacks remain. No new UI, commit, push, deploy, global promotion or Wave2.

## Actual visual decisions

Actual vision interpretation was used for concepts, candidate images, targeted1280 horizon controls and final multi-seed hero/elevated sheets. Root agent review only; no independent reviewer or human approval is claimed. Numerical checks do not establish aesthetics.

| Scene | What visibly improved | Remaining problems |
|---|---|---|
| Desert | Foreground no longer closes into a near rock enclosure; receding smaller exposures and distant land create a more expansive read. Cool framing and warm textured opening are visible. | Shrubs remain skeletal, rocks too smooth, some dry cards read as flat glyphs. The matte supports the anchored encounter sector rather than every possible orbit. |
| Mangrove | Foreground sediment has actual small mineral facets catching light, plus finer surface variation and broken shade. | Pebble highlights may be too evenly prominent; shoreline remains too clean; artistic shade is still stylized from elevation. |
| Flooded | Painted blade/clump texture joins the short ground cover to dimensional grass; the sunlit opening has more readable strokes and value variation. | Existing fan-shaped grass repeats; some material tiling remains; holdout lighting is brighter/paler than seed29. |

All three are better than their before views in the targeted respects. None is recorded as good enough for final approval. The high violet-bounce candidate failed elevated desert review: it looked like purple pigment. That component was rolled back to the earlier cool calibration; [original negative inspection evidence](inspection-seeds.png) and [source](rejected-violet-bounce.ts.txt) remain.

## Desert depth and vegetation

Near rock shoulders move farther apart/back and reduce in size; low corner framing remains. Rock occurrences extend from the near encounter into roughly675m of middle distance rather than ending around170m. There are118 formations versus60 in seed29. Existing seeded implicit rock construction is reused; no new tree/species generator.

Two low geometric land shelves continue the ground at several hundred metres, with zero-height edge transitions. A generated transparent land matte sits about1550m away,4200m wide, with most of its lower surface buried behind real terrain. Its low tablelands/open basin suggest further distance. These are illustrative regional-compatible forms, **not measured point-specific topography**. No nearby mountain range or named geological feature is asserted.

The matte is world anchored, prepainted for this warm daylight study and hidden above35m camera height so elevated inspection retains geometry. It is not a360-degree panorama or dynamically relit weather asset. Existing sky/cloud assets stay unchanged. Actual generated image size2172×724, sRGB with alpha/mipmaps: [asset provenance](asset.json).

Seventy-six additional dry grass cards in seed29 cluster around eligible rock margins. They reuse a cropped existing painterly tuft silhouette, recolored to dry pigments and instanced in one batch. Canonical ecological data remains unchanged: these are **unnamed dry functional forms**, not verified local species/abundance. Existing arid shrubs and dry fibres remain. Crop and normal response were corrected after the first render exposed whole-atlas rows and dark silhouettes.

## Wetland surface treatment

Flooded ground reuses an existing painterly meadow albedo through irregular world-space coverage masks, mapped to olive/golden/sage relationships. Its role is local blade-mass structure between existing grass instances. Geometry and all existing wetland instance transforms remain unchanged.

Mangrove uses additional fine sediment detail plus GPU-instanced exposed mineral fragments:1889 in seed29, one batch, approximately3cm maximum visible height. They add actual directional glints instead of relying entirely on flat color/noise. These are substrate details, not character-blocking rocks or species data. Moist/dry roughness still follows terrain height. Water layout, environment reflection, Fresnel, attenuation and ripples are unchanged; no fixed green/teal tint.

## Broken light and cooler framing

A deterministic world-space transmission field supplements the physical tree shadows. It combines softened, overlapping vegetation-alpha patterns with an encounter-anchored side/foreground envelope, fading over18–55m. It remains attached to world terrain when orbiting. This is an **art-directed offscreen-vegetation/cloud approximation**, not a claim that actual offscreen trees generated those shadows.

The field modulates real direct diffuse illumination and a restrained cooler indirect approximation; selected central patches receive additional incident light. Grass, terrain, near rock masses and small plants use coherent world coordinates. No emissive material, bloom, screen-space vignette or global exposure change. Exposure stays1.12. Stronger purple additive bounce was rejected after inspection; selected colors are darker and less saturated.

Three correction rounds were used. Rejected defects include an exposed distant ledge/downward plane winding, a vertically overcompressed matte, whole-atlas tuft rows, repeated shadow-cell stamps and excessive purple bounce. The final shadow construction uses overlapping continuous coordinates and a local distance bound instead of a regular stamp carpet. [Lab session](../../visual-lab/wave1/depth-session.json).

## Validation, cost and limits

- Seeds29/41 plus frozen holdout8423;36 routine640×360 images form18 matched camera pairs. Existing wetland instance matrices/counts are identical; new gravel is additive. Desert placement changes intentionally. [Matched checks](matched-checks.json).
- [Original freeze](freeze.json) precedes holdout generation. [Selection manifest](selection.json) records the later rollback of violet bounce to an earlier tested calibration, with no new geometry/texture/placement/mask tuning. Selected desert views were recaptured for all three seeds.
- Nine static staging/shader audits found positive dry approach samples, zero sampled root intrusions or rock/shrub AABB intersections and no shader failures. [Audit](verification.json). Small gravel is low substrate detail; this is not a physics/navigation simulation. New grass excludes a padded approach footprint.
- Seven protected Puget/savanna/rainforest/alpine views remain pixel-identical. [Results](regression.json). Later color rollback is confined to this opt-in desert shader branch.
- TypeScript and10 targeted field/detail/implicit-rock tests passed. `git diff --check` passed with existing line-ending warnings. No full suite/build or mobile device test.

Seed29 warmed submitted work, including nested water reflections:

| Scene | Calls before→after | Triangles before→after |
|---|---:|---:|
| Desert |14→19|673,392→1,047,072|
| Mangrove |23→25|2,546,486→2,622,046|
| Flooded |21→21|2,182,574→2,182,574|

Desert costs about55% more submitted triangles, chiefly farther instanced rock geometry; its elevated view hides the two-sided matte and submits17calls. Mangrove adds about3% triangles for mineral fragments. Unchanged grassland triangle counts **do not mean unchanged cost**: textured lighting adds fragment work and texture memory.

Individual decoded RGBA+mip estimates: generated matte about8MiB; a reused2048² texture about21MiB;1254² sediment texture about8MiB. Multiple maps are loaded per study. Actual GPU residency, caching and alpha overdraw were not measured. Raw CPU submission samples are desktop/headless diagnostics, not GPU timing, mobile FPS or performance approval. Far-rock LOD and a smaller dedicated shadow mask are sensible follow-up work after the visual direction is accepted.

Runtime files: new [wave1-depth-texture.ts](../../src/lib/forest/wave1-depth-texture.ts), [wave1-desert-direction.ts](../../src/lib/forest/wave1-desert-direction.ts), [wave1-rebuild.ts](../../src/lib/forest/wave1-rebuild.ts), and the versioned [matte asset](../../public/assets/wave1-detail/desert-distance-v1.webp). Existing Lab capture/probe tools are reused; source snapshots, raw rejected/selected renders, hashes and counts remain in this directory. No approved best pointer or human label was changed.
