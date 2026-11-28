# Prairie Gate A: ground and horizon study

**Gate A is not visually passed.** The scene runs, but actual image inspection does not justify adding grass/flowers to conceal the current flatness. No artistic approval or global promotion.

[Actual baseline and experiment views](comparison.png) | [Structured decisions](review.json) | [Validation](validation.json)

[Local opt-in preview](http://localhost:3001/explore?lat=36.5736504415&lon=-98.3419281896&habitat=grassland&expansion=prairie&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)

## What was implemented

Three runtime files: `wave1.ts` adds the guarded opt-in biome-8 route; `wave3-prairie.ts` adds a ground-only adapter and deterministic engine-neutral community fields; `wave2-shared.ts` adds prairie-only height/terrain-grid branches. Existing approved branches retain identical calculations.

The adapter reuses the renderer, sky artwork, existing painterly meadow texture, material pipeline, lighting and capture harness. It uses one continuous nonuniform terrain grid, from fine near spacing to coarse far spacing, instead of independently cut rings. Subtle synthetic terrain rolls are anchored to the human-height camera footing. A CPU-baked world field coordinates growth, moisture-like suitability, pigment exposure and irregular earth patches. These are art fields, not measured environmental data. The shader retains near texture detail and suppresses it at distance.

No named grass/flower species, automatic trees, mountain range, paths, new UI or new raster assets were introduced. Trees are absent for this ground-only gate, not prohibited from the whole biome. The actual geographic lookup confirms ECO389, Central-Southern US mixed grasslands, BIOME8. Other representative regions remain planned, not validated.

## Visual critique

The initial mustard treatment read as bare earth and exposed ring-edge streaks. The continuous grid removes the ring discontinuities; later explicit sky ordering prevents background rendering from interfering with distant land. Those changes were not separately isolated as the cause of each original streak.

The greener revisions show connected green/gold communities in elevated views. From human height, however, the ground remains too lawn-like. The low camera compresses broad fields into horizontal value strips. Texture and small terrain rolls alone have not supplied the intermediate vegetation shapes, natural framing or luminous tip hierarchy of the primary concept. These are major visible defects. Passing TypeScript and reducing triangles do not make the result acceptable.

Three rounds are recorded and spent. No fine grass, flowers or unseen holdout were generated after this failed gate. The new recipe remains an isolated diagnostic preview, and the generic renderer remains available by removing `expansion=prairie`.

## Recommended next representation

Test a **continuous low grass-mass surface** with vegetation-scale relief, coherent normals and root-integrated pigment, before introducing fine blades. This differs from the rejected savanna strip/patch representations: no independently raised rectangular islands or crossed-card mats. It is an untested hypothesis, not a promoted reusable rule. A new bounded experiment is needed under the project's three-round session rule.

## Validation and preservation

Targeted TypeScript passed. Existing opt-in/biome-routing test passed. Additional artifact checks confirm deterministic fields, source immutability, wrong-biome/Rock-and-Ice guards, camera footing and bounded field values.

Seeds 29 and 41 were rendered at 640x360, human-height and elevated. Latest draw cost: 2 calls / 73720 submitted triangles, zero vegetation instances. Tracked texture allocation includes the existing meadow/sky and a 1 MiB community field. No mobile GPU performance approval.

Thirteen protected views are pixel-identical: Puget, savanna, rainforest, alpine and all three Wave2 environments. The initial boreal comparison used a stale pre-moss-correction retained image; it was corrected to the validated frame that also matches the approved deployed commit1076523 byte-for-byte. The approval record preserves that pointer correction. Wave1 biome implementations themselves were not modified.

Reference/plan records and this experiment are saved in the existing Lab. No commit, push or deployment; live build remains unchanged.
