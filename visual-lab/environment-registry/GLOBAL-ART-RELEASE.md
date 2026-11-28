# Worldwide biome art encounters

The user authorized worldwide encounter delivery: “Can we release the rest of the world? I want the art encounter view for that area to be the view you get when you click on a location.” This authorizes default map navigation and a production release. It does not assign artistic approval or verified local ecology to every generated scene.

## Behavior

- Map taps, named-place selections and coordinate searches open `/explore` immediately with `autoEnvironment=global-auto-v1`. Open Location also defaults to this mode. The first view is the existing biome art encounter camera, rather than the generic tree-diagram view.
- The resolver derives a family from the existing RESOLVE biome mapping. No trial-distance or country whitelist limits worldwide mode. Actual location, ecoregion, botanical area and deterministic seed/tile remain in the exported recipe.
- Forest/coastal/open habitat defaults follow the source biome. Explicit references, studies, diagram mode, urban requests and active unmeasured constraints retain their prior priority/fallback semantics. The adapter never changes explicit reference habitat inputs.
- Source-backed compatible regional trees are used where available. Missing compatible trees/countries use **explicitly unnamed** broadleaf, conifer or mangrove art growth forms. Their scientific names and occurrence claims remain empty; no nearest-country species list is imported.
- Ocean, source rock/ice, unknown geometry and unsupported contexts retain explained fallbacks. The generic view and the original 42-area bounded resolver remain selectable. Old unflagged study/bookmark URLs retain their existing behavior.
- A new service-worker cache version refreshes the app shell/lookup assets for returning visitors. The decorative map pin no longer intercepts taps; map readiness is stored as state rather than read from a ref during render.

## Scope and preserved art

The existing adapters, ground/grass, water optics, lighting states, trees and matte-loading infrastructure are reused. Location-conditioned mattes remain restricted to their supported source envelopes. Synthetic terrain and fixed reference lighting are **not** measured local topography, land cover, weather or season.

Two fallback defects were corrected during review: an anonymous Mediterranean proxy initially used a wet-forest scaffold, and an Antarctic ecoregion name omitted the word “Antarctic” and received dense heath. Mediterranean proxies now reuse the retained evergreen-oak art composition with unnamed attribution; the actual Antarctic realm selects the existing sparse polar treatment. Rejected images are preserved under `artifacts/global-release/rejected-*`.

## Evidence

- [World data audit](../../artifacts/global-release/audit.json): 847 stored sample coordinates rechecked against the actual runtime geometry, botanical boundaries and catalogue. **844** select an art recipe across all **14** families; three resolve to source rock/ice and retain fallback. Two of those are nominal Antarctic tundra audit points overlapped by the runtime rock/ice feature; the resolver honors the actual lookup rather than inventing a match. This is a sampled routing audit, not a continuous visual or ecological survey.
- **81** audit points require an unnamed tree-architecture fallback. This reflects catalogue/architecture limits, not evidence that regional trees are absent.
- [Hero gallery](../../artifacts/global-release/hero-sheet.png), [inspection gallery](../../artifacts/global-release/inspection-sheet.png): 15 actual scenes, all 14 families plus an additional anonymous-mangrove case, fixed seed 29, wind disabled, 640×360. Actual art cameras were used. The implementing agent inspected both galleries; no independent reviewer or new human artistic approval is claimed.
- [Recipe/router freeze](../../artifacts/global-release/freeze.json) and final reserved seed **275103**: [hero](../../artifacts/global-release/holdout/785-hero.png), [inspection](../../artifacts/global-release/holdout/785-inspection.png). Initial seed 618379 evidence is also preserved. No art recipe was tuned against the final holdout. A subsequent map-only marker/readiness fix addressed navigation, not scenery.
- [Global-mode protected parity](../../artifacts/global-release/protected-global/parity.json): all 30 accepted hero/inspection views remain pixel- and geometry-identical with worldwide mode requested. The earlier bounded-mode regression captures are separately retained.
- [Tests](../../artifacts/global-release/tests.log): **126 passed**. TypeScript and targeted source/UI ESLint passed. The documented legacy full-suite failures were not rerun or altered.
- [Browser checks](../../artifacts/global-release/ui-local.json): real map tap, first art-camera position, coordinate search beyond trial regions, visible worldwide mode, generic-view escape, ocean fallback and mobile-width overflow all passed. Production staging and final live checks are recorded beside them.

## Visual critique and limitations

The release changes scene selection and navigation, not the quality ceiling of every adapter. Regional specificity remains uneven: some forest stands show encounter-sized edges from above, grassland/steppe transfers share generic communities, and distance weakens where foreign mattes are correctly withheld. Anonymous Mediterranean trees have less specimen character than a catalogue-backed cork-oak hero. Antarctic substrate remains a stylized sparse-ground approximation, not observed surface cover.

Renderer-reported sample counts span roughly 0.26–3.1 million triangles. Some previously audited regional mangroves exceed 5.6 million. Device frame time, alpha overdraw and texture-memory bytes remain unmeasured; this release does not establish mobile performance approval.

**Experimentally supported:** source-biome art selection can cover the terrestrial lookup without fabricated species, preserve references, expose fallbacks and open directly from map interaction. **Human-authorized:** making that flow the default and publishing it. **Not approved by this record:** final artistic quality at every location, species occurrence, actual geology/hydrology or performance on every phone.

The bounded records remain historical evidence, not a competing art-direction system. Next work should improve regional plant communities, distance assets and expensive mobile cases using those records rather than relaxing provenance or copying unsupported landmarks.
