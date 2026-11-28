# Mediterranean reconstruction — Checkpoint 1 construction plan

Status: proposed reference-matching prototype; seed 29 only, one implementation pass. No new artistic approval, global promotion, commit or deployment.

## Instructions and evidence loaded
AGENTS.md permanent visual/prototype rules; visual-lab/README.md retained/rejected summaries; docs/visual-quality-workflow.md; existing art-direction-policy.json; shared expansion terrain/asset loading, procedural oak/temperate architecture, dimensional meadow geometry, instancing, prairie pigment and material-workbench changes, horizon matte and renderer artRevision/asset-ready hooks. All four supplied images were opened with vision-capable image inspection. Reference paths are in references/; source versions of modified renderer adapters are recoverable under artifacts/mediterranean-checkpoint1/source/. No separate reference authority created.

## Independent observations
1. A single dark, diagonal foreground oak unifies the left and top frame. Its open undersides preserve a valley view; this is neither a closed forest nor a park of evenly spaced specimens.
2. The soil mask shows an irregular route broadening toward the camera, stepping slightly right then left toward the central middle distance. Rocks and plant tongues interrupt it. Its silhouette is not a soft oval clearing or a continuous smooth ribbon.
3. Pale rocks and connected olive/silver plant masses repeat at diminishing scales. The near right shoulder rises, while a descending central route exposes overlapping landforms in the distance. Midground occupancy matters more than individual flower detail.
4. Albedo separates brown bark/soil, muted yellow-olive tree foliage, gray-sage shrubs, warm pale stone and small purple/yellow/cream accents. The black upper region excludes sky; it is not a material color.
5. Luminance separates very dark wood/shrub interiors from selective bright rock tops and grass tips. Distant ridges are cooler and lower contrast. The sunlight comes from upper left, slightly toward the viewer.

## Portable scene specification and implementation hypotheses
- Fixed human eye: [0,1.7,16], target [0,-9,-65], existing 47-degree vertical FOV, 16:9. Approximate reconstruction, not a solved photographic camera. Local world north is the view direction, without asserting a surveyed compass bearing.
- Near 0–25m: cropped spreading oak at left, asymmetrical embedded pale rock groups, shrub shoulders and retained narrow curved grass representation. Front-center footprint remains unobstructed.
- Middle 25–220m: shallow descending swale, rising lateral shoulders, correlated olive/sage scrub with irregular gaps, scattered candidate oaks sized by depth. Hierarchical rocks cluster on shoulders rather than filling the soil route.
- Far 220–900m: simplified shrub/tree communities merge with one generated RGBA garrigue plate; distant low ridges and limestone exposures only, sky remains procedural. World-plane parallax; edge fade and inspection/unsupported-angle hide policy. Manifest records geography, seed, season, lighting/weather and projection intent; no image-generation service.
- Terrain: existing expansion base reused; opt-in terrain mesh vertices adapted to a continuous valley/shoulder height field. No renderer rewrite or replacement of grass geometry.
- Soil: supplied camera-space mask is sampled through a frozen reference camera into a terrain-rooted world-space field. Current camera movement cannot drag the soil mask. Outside the reference frustum use a seeded route field. It is not used as a UV/screen overlay.
- Principal foliage: adapt existing branch-supported oak hierarchy, retaining source taxon/individual seeds. Full flower/material fidelity is deferred to Checkpoint 2; current pigments are provisional albedo anchors, not baked shadows.
- Lighting: existing directional sun at upper-left, cool restrained fill, real cutout crown/rock shadows plus existing material response. Distance fog leaves foreground clear; no bloom or global color filter.

## Regional integrity
Initial testbed: 43.72N, 3.58E, Hérault, France. Actual local lookup: ECO799 Northeast Spain and Southern France Mediterranean forests, biome12, FRA botanical country. Existing WCVP catalogue contains Quercus ilex native to FRA; fixed structure seed mediterranean-1 exposes it in the existing sampled palette. Only those source candidates supply the oak presentation occurrences. Country range is not verified local presence. The normal 12-taxon sample also includes irrelevant montane taxa; the adapter must not equate that sample with suitable local habitat.

Regional limestone-garrigue context is supported by [BRGM](https://infoterre.brgm.fr/rapports/RP-51718-FR.pdf) and [Rhône-Méditerranée water authority](https://www.rhone-mediterranee.eaufrance.fr/milieux-aquatiqueseaux-souterrainescontexte-hydrogeologique/les-formations-calcaires-et-le-karst). [Haut-Languedoc park](https://www.parc-haut-languedoc.fr/sites/parc-haut-languedoc.fr/files/files/EDL_PNRHL_Foret_Fili%C3%A8re-bois_240507.pdf) supports regional holm-oak woodland. None verifies this coordinate's current vegetation or topography. Exact ridge geometry, stone type at the footprint, soil chemistry, shrubs/flowers and depicted abundance remain synthetic/unnamed growth-form approximations. No nearby high mountains or coastline will be added. Flower species identification is deferred, not invented.

## First-pass evaluation
Capture fixed hero and elevated views after composition construction; compare with original at thumbnail/640 review size. Record three largest mismatches and submitted triangles/calls. Keep all source inputs and the isolated matte. Stop at this checkpoint without material/albedo/luminance fidelity stages or autonomous correction loops. Candidate remains pending human review even if technically valid.
