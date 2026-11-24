# Biome art direction V1 — first architecture study

[Three encounter-camera views](../artifacts/wildloom-biome-v1-comparison.png) · [Capture report](../artifacts/wildloom-biome-v1-report.json)

## Separation of responsibilities

`resolveVegetation` still owns ecological eligibility. `createSceneRecipe` still generates eligible source individuals, source evidence, deterministic structure/appearance seeds and existing design models. `BiomeVisualProfile` in `src/lib/forest/biome-visual.ts` is a presentation registry matched by ecoregion ID or biome plus biogeographic realm. It cannot add taxa to the eligible palette. The composer selects/reuses existing eligible models and changes their design-instance positions/rotation; it does not edit species records or rebuild their geometry. Profile role weights are composition choices, not ecological abundance. The canonical input recipe is not mutated.

Existing land-cover and SoilGrids map layers remain independent observations/predictions; this visual prototype does not infer ground species, soil moisture or substrate measurements from them. Existing terrain geometry, picking, library species batching, LOD, renderer disposal and seed utilities are reused. New dressing uses shared instanced geometry and materials; no geometry is rebuilt each frame.

## Profiles and what drives rendering now

- **Distribution:** supported design preferences, layer-role weights, tree count cap, open-scattered versus layered composition, foreground/midground bands and a reserved elliptical encounter opening. These only restrict an already eligible palette. Palms are selected only when eligible source palm models exist.
- **Ground:** texture reference or seeded painted-grass palette, soil colour/blend, repeat scale and broad variation. Savanna uses warm golds and red-brown soil; Amazon reuses the painted forest-floor texture with humid green/brown colour treatment.
- **Vegetation:** grass/shrub/understory instance counts, height, blade width and palette. Shared generic forms are unnamed dressing, not species observations.
- **Landscape/sky:** open versus enclosed horizon treatment, colour, reusable sky texture/tint and fog near/far. Existing illustrated cloud artwork is shared rather than regenerated.
- **Lighting:** sun direction, colour/intensity, ambient colour/intensity and ambient ground bounce (the visual shadow-colour control). Standard shadow maps are preserved. New profiles use a soft ground focal multiplier and foreground shade strength.
- **Composition/camera:** clearing radius, layer counts, enclosure treatment and initial camera pose. Orbit and tree inspection remain available. High-enclosure profiles add three inexpensive translucent shaft hints; these are art geometry, not volumetric scattering.

Puget is deliberately a **protected legacy adapter**: its approved material, mask, vignette, illumination, ridge, sky, dressing and camera code remains authoritative. Its registry entry documents that appearance; editing every descriptive Puget field will not yet replace all legacy constants. The new adapter is used only for the two new profiles. This is incremental integration, not a claim that all old rendering constants have been migrated.

## Evidence and representative scenes

| Profile | Location / context | Evidence limit |
|---|---|---|
| Puget | 47.6062, −122.3321; Puget lowland forests | Existing regional candidates and labeled visual fallbacks preserved |
| East African savanna | −2.3, 35.2; Southern Acacia-Commiphora bushlands and thickets | Existing resolver has **no named species palette** here. The screenshot explicitly enables conditional unnamed `savanna_canopy`, using the existing umbrella-canopy design fallback. These are not claimed Vachellia occurrences |
| Amazon | −3.12, −60.02; Japurá-Solimões-Negro moist forests | Country-range candidates, not confirmed local occurrence: Swietenia macrophylla, Hevea brasiliensis, Euterpe precatoria, Cecropia peltata and Theobroma cacao. Coastal/mangrove design models are not used in this inland composition |

The savanna is capped at seven isolated design trees, not a continuous woodland treeline. Amazon uses 36 eligible source-model instances split into canopy, palm and understory roles. Puget retains its 43-instance approved composition. Reused models can appear more than once; counts and size variation are artistic, not age/density measurements.

## Validation and remaining work

TypeScript passed. Targeted deterministic checks confirmed repeatability, unchanged input recipes, original model-object reuse, subset-of-palette selection and the reserved opening. Final browser captures report no page/shader errors. All screenshots use seed 29, structure `grove-1`, appearance `garden`, wind off, identical aspect ratio. Puget's captured image is byte-identical to the approved matte-sky scene. Renderer counters are in the capture report; they are not GPU or physical Android performance measurements.

Remaining work: named ecological joins for East African savanna; habitat/occurrence refinement of broad Amazon country candidates; higher-quality biome-specific shrub/understory leaves and litter, roots beyond those already in tree models, biome-specific cloud sets and regional land-cover/soil wiring. New ground/grass lacks Puget's full stochastic multi-material and blade-edge soil treatment. The horizon adapter is intentionally coarse. Rainforest shaft hints are planar and may look artificial from some angles; real volumetric lighting is not implemented. Palms have dedicated existing models but understory dressing remains generic. Some tree silhouettes repeat because this pass reuses source individuals. No individual tree polish was attempted.

This is one visual architecture pass, not final scene art. Stop for review; no deployment.

## Preview

Start `npm run dev -- --port 3001`, then use:

- `/explore?lat=47.6062&lon=-122.3321&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human`
- `/explore?lat=-2.3&lon=35.2&habitat=grassland&conditional=1&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human`
- `/explore?lat=-3.12&lon=-60.02&habitat=forest&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human`

Remove `encounter=1` for the original explorer. Source changes: `biome-visual.ts`, composition dispatch in `encounter.ts`, profile light dispatch in `painted-renderer.ts`, and the existing explorer-link condition in `ForestExplorer.tsx`. No generators, ecology records, observed map datasets, or new UI panels were added.
