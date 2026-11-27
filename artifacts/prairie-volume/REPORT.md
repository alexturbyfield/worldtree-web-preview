# Prairie rolling terrain and regional dressing

[Concept / before / retained / rejected grass comparison](comparison.png) | [Review decisions](review.json) | [Validation](validation.json)

[Local retained preview](http://localhost:3001/explore?lat=36.5736504415&lon=-98.3419281896&habitat=grassland&expansion=prairie&seed=29&density=36&structure=grove-1&appearance=garden&wind=0). Add `prairieBrush=1` only to inspect the rejected broad-card grass construction. The normal preview excludes it.

## Retained changes

Three runtime files: `wave2-shared.ts`, `wave3-prairie.ts` and new `wave3-prairie-dressing.ts`.

Prairie-only height fields now have stronger aperiodic rolls and broad, seed-varied shallow shoulders. They remain connected landforms, with camera footing anchored and no raised staging platform. The existing continuous grid also carries low vegetation-mass relief. These are synthetic art-directed shapes, not measured local geology.

The active dressing adds 260 curved grass clumps, 140 finer branching seedhead clumps, 160 yellow forb clumps, 120 purple forb clumps and 12 small branching shrub groups. Ground and grass roots share a single pigment sampler. Existing instances were redistributed toward the side foreground, and the low-grass height falloff was narrowed around the character area. Tall seedheads are excluded from the front-center corridor. Flower patches respond to the community field; woody dressing is guarded to this regional study.

The new explicit user request authorized a coordinated terrain/vegetation study after the previous ground-only gate failed. That earlier failure and its exhausted budget remain recorded; it was not retroactively approved.

## Regional reasoning

[NRCS Rolling Sands / Central Rolling Red Plains context](https://edit.sc.egov.usda.gov/catalogs/esd/078C/R078CY014OK) supports rolling terrain, mixed perennial grass structure, forbs and a small shrub component. [USFWS Salt Plains context](https://www.fws.gov/refuge/salt-plains/about-us) confirms mixed-grass prairie and rolling sand hills in the wider region. Neither source verifies the exact ecological site or plants at the selected point. Rendering uses unnamed functional forms; no regional candidates were falsely inserted as verified local taxa. See [structured evidence](../../visual-lab/global-expansion/prairie-regional-evidence.json).

The concept's useful additions are small flower communities, seedheads, low shrubs and irregular exposed substrate. Large boulders, mature foreground trees and other unsupported landmarks were not copied merely to fill space.

## Actual visual judgment

Human-height seed29 and41 images visibly show stronger rolling landforms and flowering/shrub accents compared with the earlier plane. Seed41 has a particularly clear grass-covered shoulder and valley opening. The low-grass front center remains readable.

**The dense grass technique failed.** Reused broad painterly brush cards made visible terrace-like bands. Increasing painted contrast exaggerated those edges. That contrast was rolled back, and the two broad-card batches are disabled by default. Their code and images remain available as negative evidence; the successful-looking savanna asset was not assumed universally transferable.

The retained version is a terrain/dressing checkpoint, not a finished beautiful prairie. Its surface remains too lawn-like, fine grass is sparse, and the simplified forb/shrub forms need more natural hierarchy. The next representation should supply genuinely dimensional overlapping grass silhouettes at moderate density, rather than another broad-card contrast adjustment. No dense-grass or overall-biome artistic approval is claimed.

## Validation, holdout and cost

Actual hero/elevated images inspected for seeds29 and41. Recipe frozen before holdout8924519; no retuning afterward. The holdout retains the landform and flora treatment, but a shoulder reduces the long-distance opening and the foreground remains lawn-like. That limitation is recorded rather than concealed.

Targeted TypeScript and existing deterministic/guard/source-preservation checks pass. Thirteen protected Puget, savanna, rainforest, alpine, boreal, temperate and tundra views are pixel-identical. No changes to Wave1 implementations or approved tree models.

Retained steady-frame cost: **7 draw calls, 201144 submitted triangles, 692 active vegetation instances**, versus2 calls /73720 triangles in the previous ground-only study. The disabled comparison batches contain6500 instances and are still constructed for reversible comparison; their setup and cached atlas are an explicit prototype cost, not a mobile optimization. No per-card cast shadows. Terrain/shrub shadows add work when shadow maps refresh. Alpha overdraw and mobile GPU time were not measured; no device approval.

No new raster asset, UI, dependency, commit, push or deployment. The public live build remains unchanged.
