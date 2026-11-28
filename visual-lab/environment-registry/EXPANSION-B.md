# Geographic expansion B: boreal, tundra and mangrove

Adds nine opt-in locations to the existing pilot, for eighteen locations across six families. Automatic geographic routing is unchanged. The dry-forest canopy and its retained continuation pass are untouched. New variants remain experimental; the user's instruction to continue expansion is not a species-occurrence claim or artistic approval of these variants.

Use **Approved reference scenes → Geographic pilot · experimental** in the explorer.

| Family | Site | Source ecoregion | Catalogue and representation |
| --- | --- | --- | --- |
| Boreal | Finland | 717 | Supported spruce, pine and birch candidates; existing genus-conditioned architecture |
| Boreal | Canadian Shield | 370 | Supported pine/spruce and birch/aspen candidates; unrelated broadleaf entries are excluded from this rendering pool |
| Boreal | East Siberia | 710 | Larch, spruce, pine and birch candidates; needle artwork remains approximate |
| Tundra | Alaskan coast | 407 | Unnamed low-cover functional forms; no trees |
| Tundra | Chukchi Peninsula | 772 | Unnamed low cover; audited near the antimeridian |
| Tundra | High Arctic | 778 | Existing sparse polar-desert adapter; no invented local plant names |
| Mangrove | Florida | 612 | Source-supported *Rhizophora mangle* regional candidate and matching root profile |
| Mangrove | Gabon | 111 | Source-supported *Rhizophora mangle* regional candidate and matching root profile |
| Mangrove | Sundarbans | 323 | Source-supported *Avicennia marina* regional candidate and matching root profile |

The [local-data audit](../../artifacts/geographic-expansion-b/audit.json) records exact coordinates, botanical-country codes, scientific names, source URLs and source polygons. Country-native ranges remain broad candidates, not verified point occurrences. The High-Arctic point lies in the Svalbard botanical area while RESOLVE labels its polygon “Russian Arctic desert”; the source label is preserved rather than silently corrected or used as geopolitical evidence.

## Reuse and guards

No new scenery generators, taxonomy, plant catalogue, materials or lighting systems were created. The existing pilot gate now supports the additional families. Boreal and mangrove require a catalogue-backed candidate with a supported architecture; unsupported candidates cannot activate those adapters. Tundra exports `none` for tree identity. Missing geography, rock/ice, conflicting selectors and unmeasured requested filters retain the conservative fallback.

Mangrove explicitly selects the retained `rebuild` adapter with the `fidelity` reference material state. It cannot accidentally route through the rejected two-row canal scene. Water reflections, sediment optics and ripples remain unchanged. Hydrology and forest distribution are synthetic, not local tidal surveys.

The existing scene/structure/appearance seed separation is preserved. New site IDs derive deterministic scene variation without changing the seeds or visuals of the first nine pilot locations. Season, weather and time of day remain reference-state layers, not inferred climate measurements.

## Validation and review

Primary captures use seed 29 at 640×360. Each family's existing encounter camera is used, including mangrove's hydrology-aware staging camera; before/after views for each site use the same transform. The generic fallback may show no scenery at a mangrove encounter camera outside its small terrain footprint. Such a blank baseline is documented as a fallback extent limitation, not hidden or counted as artistic approval of the pilot.

After the recipe freeze, seed 62417 is reserved for East Siberia, Chukchi and Sundarbans. No tuning against those captures is authorized by this experiment.

- [Hero and inspection gallery](../../artifacts/geographic-expansion-b/gallery.png)
- [Before/after gallery](../../artifacts/geographic-expansion-b/comparison.png)
- [Reserved-seed views](../../artifacts/geographic-expansion-b/holdout-sheet.png)
- [Structured review and validation](expansion-b-review.json)

Inherited limitations—plain bark, repeated bough or low-cover motifs, synthetic relief, restricted regional catalogues and imperfect distant continuation—are review findings. A render, test pass or populated location selector does not establish global recipe quality. Broader routing and deployment remain separate steps.
