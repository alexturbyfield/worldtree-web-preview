# Global biome expansion — inventory and review proposal

**Status: audit and proposal only. No environment/resolver implementation, new rendering, deployment or global promotion.**

Recommendation: develop **boreal forest (6), temperate broadleaf/mixed woodland (4), and Arctic tundra (11)** next, in parallel after this selection is reviewed. Preserve all seven existing recipe directions. The user's latest approval makes the three latest Wave1 checkpoints provisional artistic baselines; it does not verify ecological data, approve mobile performance, or erase earlier rejected evidence.

[Machine-readable audit](inventory.json) · [Explicit provisional approval and baseline pins](../feedback/wave1-provisional-baselines.json).

## What the actual map contains

Wildloom uses the existing **14 RESOLVE biome IDs**, not a new taxonomy. The local dataset has847 features:846 terrestrial ecoregions plus one Rock and Ice feature. The latter is `ECO_ID=0`, stored with `BIOME_NUM=11` and `REALM=N/A`; it must be handled before tundra. Code also recognizes sentinel biome IDs0/98, but they are not additional populated biome categories in this import.

| ID | Existing Wildloom label | Ecoregions | Approx. display-map area, million km² | Developed coverage today |
|---:|---|---:|---:|---|
|1|Tropical moist forests|230|19.54|Amazon recipe; Neotropic routing, one principal regional testbed|
|2|Tropical dry forests|56|3.88|Generic growth forms; no developed environment family|
|3|Tropical conifer forests|15|0.67|Generic conifer fallback; no developed environment family|
|4|Temperate broadleaf forests|83|12.54|Generic tree assets, no dedicated environment; **Puget does not cover this category**|
|5|Temperate conifer forests|47|3.74|Puget ecoregion-specific scene; alpine reference also lies here|
|6|Boreal forests / taiga|26|15.32|Generic species/form fallback; no developed boreal environment|
|7|Tropical grasslands & savannas|58|21.39|East African/Afrotropic savanna direction, not all global savannas|
|8|Temperate grasslands|48|10.57|Open growth-form fallback; no developed steppe/prairie recipe|
|9|Flooded grasslands|25|1.15|Wave1 wetland mosaic; Everglades testbed|
|10|Montane grasslands|46|4.87|Alpine habitat technique is reusable; **no validated biome10 routing/coverage**|
|11|Tundra|51|8.44|Treeless ecological fallback, no developed tundra environment|
|12|Mediterranean woodland|40|3.29|Sclerophyll growth-form fallback, no developed environment family|
|13|Deserts & xeric shrublands|102|26.34|Wave1 desert; Mojave testbed|
|14|Mangroves|19|0.30|Wave1 tidal forest; Florida testbed|

Counts come from `data/global/ecoregions.json`, excluding Rock and Ice. Area values are **coarse priority proxies**, calculated from simplified `display.geojson` polygons;12 display features have empty geometry. They are not scientific biome areas, current land cover, or verified recipe coverage. The authoritative coordinate audit uses compressed lookup tiles, not display polygons. Full RESOLVE names, realms and exact counts remain in the JSON.

Seven developed recipe directions therefore sample **six distinct map-biome IDs** at their retained coordinates. That is not six globally solved families. Seven categories lack a dedicated developed recipe; biome10 remains an additional habitat-to-map generalization gap.

## Seven recipes: routing versus demonstrated regional support

| Retained recipe | Current route/implementation | Confirmed reference coordinate → actual local map label | Current support limit |
|---|---|---|---|
|Puget woodland|`biome-visual.ts`: exact `ECO_ID=364`|47.6062,-122.3321 →364 Puget lowland forests; biome5, Nearctic|One ecoregion override; not a generic temperate broadleaf recipe|
|Golden savanna|`biome-visual.ts` + savanna recipe/brush/tree treatments; biome7 + Afrotropic|−2.3,35.2 →57 Southern Acacia-Commiphora bushlands and thickets|Guard permits33 ecoregions; retained art/ecology is a regional testbed, not33 approvals. Conditional canopy is a growth-form study|
|Amazon rainforest V5|`biome-visual.ts`, composition/rainforest depth adapters; biome1 + Neotropic|−3.12,−60.02 →473 Japurá-Solimões-Negro moist forests|Guard permits81 ecoregions. Amazon species/materials must not become defaults for Congo or Southeast Asia|
|Alpine meadow/treeline|`alpine-recipe.ts` + `alpine-adapter.ts`; explicit URL override|51.17,−116.18 →361 Northern Rockies conifer forests, **biome5**|Three composition families/palettes are presentation studies. No current geographic eligibility gate; source adapter constructs a conifer functional form. Not measured elevation or global biome10 coverage|
|Desert|Wave1 biome13 guard; `fieldStudy=rebuild&artPass=fidelity`|34,−116.15 →433 Mojave desert|Guard permits102 ecoregions. Geology/substrate and unnamed xeric forms are synthetic; not evidence for Saharan dunes or Australian species|
|Mangrove|Wave1 biome14 guard; `fieldStudy=rebuild&artPass=fidelity`|25.2,−80.9 →612 Bahamian-Antillean mangroves|Guard permits19 ecoregions. Florida resolver currently supplies one regional candidate; other realms need their own evidence/profile matches|
|Flooded grassland|Wave1 biome9 guard; `fieldStudy=rebuild&artPass=flooded-finish&conditional=1`|26.209957419,−80.9383825925 →581 Everglades flooded grasslands|Guard permits25 ecoregions. Sedges/grasses and wooded islands are unnamed conditional forms; no verified local tree-island population|

All existing preview modes and generator versions must remain recoverable. Preserve the approved brush grass, terrain continuity, water optics and crown treatments; do not route all regional species through whichever tree happens to look best.

## Catalogue and evidence findings

- Live `taxa.json` contains **402 accepted, distinct woody taxa**. `coverage-summary.json` still says400; its saved mode totals also predate current mangrove resolver changes. Do not use those summaries as fresh coverage proof.
- `ecoregion-associations.json` is **empty**: zero verified species–ecoregion links. WCVP botanical-country native ranges are useful regional candidates, not verified site/stand membership.
- Of402 catalogue taxa, `mapVisual` reports25 exact name-to-design mappings and377 visual fallbacks. There are26 procedural preset entries and20 studio species designs; these are different counts, not402 botanically accurate assets. An “exact mapping” is a code designation, not independently validated morphology.
- Catalogue growth forms are all woody; grasses, sedges, ferns, mosses, lichens and flowers currently lack an equivalent verified regional catalogue. Existing procedural life forms must remain explicitly unnamed until sourced.
- No live taxon has sourced `matureHeightM`/`heightMeters`. Art-directed dimensions cannot be relabelled as measured ecology.
- The live boreal Finland sample returns `Quercus robur` among broad regional candidates; the Appalachian sample includes `Taxodium distichum`. This demonstrates how coarse the native-country + climate filter is. It does **not** establish or refute occurrence at those exact points. Do not turn the first seeded12 candidates into an unquestioned local canopy.
- A useful counterexample to conifer-only biome6 is the existing Iceland birch exception:64.961548,−18.466380 resolves711 Iceland boreal birch forests and alpine tundra, with `Betula pubescens` as its regional catalogue candidate. Keep that broadleaf architecture; do not force spruce just because the biome is boreal.
- Requested moisture, elevation, coast/inland and seasonal habit are not observed measurements. The existing resolver conservatively withholds species when active filters lack evidence. Preserve that behavior; add evidence-backed adapters rather than bypassing it.
- `ground-v1` provides a **Seattle-only** WorldCover/SoilGrids demonstration. It is not a global terrain, hydrology or soil service. No global measured relief source was found. Do not invent nearby mountains, lakes, wetland hydrology or snowline from latitude/biome labels.

## Missing families ranked

These rankings are artistic/engineering judgments informed by the local map footprint and visual coverage—not measured aesthetic scores.

| Priority | Family | Distinctiveness / coverage / reuse |
|---:|---|---|
|1|6 Boreal forest|Largest missing forest footprint in the coarse area audit; slender conifer layering, mossy floor and optional evidence-supported wet margins. Reuses conifer grammar, rainforest depth and wetland transitions|
|2|4 Temperate broadleaf/mixed forest|83 ecoregions and a large global footprint. A true broadleaf woodland is missing despite Puget; provides branching crowns, leaf-litter/understory relationships and reusable mixed stands|
|3|11 Tundra|Very different treeless composition, low vegetation and long terrain-led depth. Tests the no-tree ecological gate rather than adding another forest. Must distinguish heath/sedge tundra from polar desert and Rock and Ice|
|4|8 Temperate grasslands|Large footprint across48 ecoregions; high transfer value from savanna/alpine grasses. Defer one wave to avoid another grassland dominating the immediate diversity test; no automatic acacias|
|5|12 Mediterranean woodland/scrub|Strong regional identity across five realms; excellent rock/shrub/woodland mosaic test. Lower mapped footprint; catalogue does not justify copying Mediterranean-basin species to Cape fynbos or California|
|6|2 Tropical dry forest|Distinct structural ecology across56 ecoregions, but needs better regional dry-forest species and phenology evidence. Dry-forest identity must not be reduced to a dry-weather toggle|
|7|3 Tropical conifer forest|Smallest missing footprint in this audit;15 ecoregions. Reuse the conifer family after boreal, with appropriate warm-region architectures and evidence|

In parallel with later waves, expand the **regional variants of existing families**: Asian/African moist forest, non-African savanna, non-Mojave deserts, global mangroves/wetlands, and montane environments outside the Northern Rockies. Those are coverage gaps even when a family has a developed artistic baseline.

## Proposed next three workstreams

| Workstream | Artistic hypothesis and transferred tools | Ecological constraints | Checked representative coordinates |
|---|---|---|---|
|Boreal forest, biome6|Narrow crown rhythm, rich low floor, irregular conifer/broadleaf groups, cool depth with selective warm light. Reuse alpine layered boughs, rainforest continuation, flooded material transitions|No universal snowy forest or permanent lake. Use spruce/pine/larch/birch candidates only with adequate regional/habitat evidence; a Douglas-fir fallback is a representation, not a native identity|66.5,26 →717 Scandinavian and Russian taiga;55,−105 →377 Midwest Canadian Shield forests;62,129 →710 East Siberian taiga|
|Temperate broadleaf/mixed woodland, biome4|Branch-supported rounded crowns, connected low planting, exposed earth/leaf-litter openings and overlapping depth. Reuse tree grammar, Puget composition principles and flooded soil/grass coordination|Not “autumn” as a biome. Avoid applying one oak form to all regional taxa; do not place wetland candidates on dry slopes solely because country ranges match|50.5,10.5 →686 Western European broadleaf forests;35.6,−83.5 →331 Appalachian-Blue Ridge forests;36,138 →683 Taiheiyo montane deciduous forests|
|Arctic tundra mosaic, biome11|Low correlated vegetation masses, exposed earth/stone, shallow drainage only where supported, broad restrained landforms and distant light. Reuse alpine fields, grassland frequency hierarchy and wetland material masks|Default treeless. No conifer insertion, default snow, invented mountain wall or lush heath in polar desert; unnamed non-woody forms until regional flora is sourced|69,−150 →408 Arctic foothills tundra;70,100 →781 Taimyr-Central Siberian tundra;78,16 →778 Russian Arctic desert—an intentionally sparse edge case|

The last column is **completed map/ecological routing inspection**, not rendered multi-seed validation. The proposed environments have not been implemented or visually approved. Candidate references will go into the current Lab manifest after selection, using licensed/user-supplied art and real ecological photographs. No separate Art Bible.

## Scalable resolver architecture — proposal, not implementation

Use the existing `resolveVegetation → createSceneRecipe → renderer adapter` path. Add a small routing/recipe contract around it rather than a parallel renderer.

1. **Canonical geography and evidence.** Read authoritative RESOLVE tiles and botanical areas. Handle `ECO_ID=0`, unknown/ocean/coastal gaps and ambiguous boundaries before selecting vegetation. Retain source versions, confidence, location and input uncertainty.
2. **Habitat context.** Keep the existing habitat vocabulary. Combine measured elevation/slope, soil, moisture, salinity/tide, drainage and land cover when available. Unknown stays unknown. Separate observed context from synthetic visual-study fields and user requests. Biome dominance does not prohibit conditional local mosaics.
3. **Ecological eligibility.** Keep verified local/ecoregion associations, documented regional candidates, unnamed functional forms and artistic constraints separate. Source-backed compatibility filters precede tree selection. Missing evidence produces labelled conservative growth forms, not false native species assertions.
4. **Existing biome family recipe.** Key shared rules by current `BIOME_NUM`, with realm/habitat constraints. Reuse current portable recipe schema and Lab rules. Select among ecologically compatible composition archetypes using deterministic streams; do not create847 handcrafted scene recipes.
5. **Necessary local overrides.** Exact ecoregion overrides only for documented differences that shared traits cannot express: genuinely distinct growth architecture, substrates, hydrology, treeline or geological context. Puget364 remains an explicit protected override. Prefer realm/trait constraints where several ecoregions share the same rule; every override needs evidence and tests.
6. **Presentation layers.** Apply season/phenology, weather, solar/time-of-day and hydrological state as separate serializable inputs. Snow, leaf loss, warm light and flooding are not fixed biome pigments. Unknown plant traits cannot support automatic phenology claims. Tide and water availability have their own evidence/state, not a green water color override.
7. **Engine-neutral resolved plan.** Produce recipe/version, source IDs, eligible vegetation roles, synthetic/measured field provenance, canonical individual seeds, separate presentation placements, material roles, near/middle/far composition, continuation strategy, state layers and budget forecasts. Three.js consumes it through existing adapters. Unity export is a future consumer, not work for this wave.
8. **Visual/performance gate.** Use the existing Lab's references, captures, critiques, preferences and best-known retention. Provisional human baseline approval stays distinct from global recipe approval and device performance approval.

Conceptual selection precedence: **safe unknown/rock-and-ice handling → explicit protected legacy recipe/version → documented local override → biome+realm+habitat shared recipe → existing conservative generic fallback**. “Protected” means preserve the retained recipe version and all its tested seeds; do not hardcode only the seed29 screenshot. Keep new global resolution opt-in until reviewed. Do not let URL art-study overrides silently manufacture local ecology.

The initial registry should wrap `biome-visual.ts`, alpine and Wave1 adapters. The current dispatcher gives alpine URL overrides precedence, then Wave1, then the three biome visual profiles; the proposed eligibility layer must make that precedence explicit and evidence-safe. Preserve current scenes while replacing accidental routing for new locations.

## Validation and parallel ownership after review

- Three isolated biome adapters/recipe records, developed in separate worktrees/branches from a frozen reviewed base. One coordinated owner for any shared renderer/resolver change; avoid concurrent edits to the shared dispatcher. No shared-system rewrite as a prerequisite.
- Reuse fixed world/structure/appearance streams. Test development29/41/73 in hero and inspection views at the representative coordinates, then freeze each candidate and generate a fresh unrevealed holdout seed. Capture640 first, detail1280 only as needed, final1920 after selection.
- Treat geographic generalization separately from seed generalization. Test multiple realms/regions, wet/dry habitat edges, supported/unsupported tree roles, lookup-tile seams and source gaps. Include the tundra polar-desert case and a boreal/broadleaf transition; do not tune against frozen holdouts without starting a new recorded experiment.
- Completed edge-data probes: dateline land points66.5,±179.5 both resolve772 Chukchi Peninsula tundra across tiles35-15/0-15. The sampled coastal points65,±179.9 return insufficient data;0,−140 ocean and25.7,−80.1 shoreline gap also return no terrestrial recipe. Points50.000001,9.999999 and50.000001,10.000001 agree on686 across the10° tile seam.−80,0 correctly resolves Rock and Ice. The Finland elevation-request probe returns zero species because observed elevation is missing. These are specific successful data checks, **not proof of all topology or rendered visual robustness**.
- Reject imagery with wrong biome identity, weak staging, boundaries, repeated stamps, incoherent palette or invalid species—even if numerical coverage improves. Continue to record successful and rejected techniques in existing Lab rule statuses with provenance.
- After shared changes, recapture all seven protected recipes with their pinned source/assets/parameters and human/inspection cameras. Record actual draw calls, submitted triangles, texture memory, instanced counts, CPU/GPU timing where available and real-device evidence. Do not infer mobile approval from desktop statistics.

Existing reusable gains: ground-first shared pigment fields; soil/material masks shared with vegetation; terrain-rooted foreground dressing and clearance; branch-supported crowns and grouped LOD; environment-derived water reflections/Fresnel/substrate; world-space lighting and layered continuation. Preserve negative lessons: pale/black grass, random debris carpets, circular stamps, canal-only wetlands, primitive rock molds, heavy fog hiding boundaries, and unsupported species/mountain insertion. Approval of the latest scenes does not turn those failed techniques into global rules.

## Decision requested

Approve **boreal forest6 + temperate broadleaf/mixed woodland4 + Arctic tundra11** as the next three workstreams, or replace one before implementation. Temperate grassland8 and Mediterranean woodland12 are the strongest alternatives. No new biome implementation will begin until this inventory and selection are reviewed.
