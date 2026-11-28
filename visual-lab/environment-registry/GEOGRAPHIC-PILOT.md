# Geographic resolver pilot v1

The original nine-site experiment is preserved below. [Expansion B](EXPANSION-B.md) adds nine boreal, tundra and mangrove locations to the same opt-in selector; it does not change automatic global routing.

This opt-in experiment tests transfer of the accepted woodland, prairie and dry-woodland recipes. It does not expand automatic map routing or confer artistic approval on new locations. The existing registry and Visual Learning Lab remain the metadata and evidence authorities.

Open **Approved reference scenes → Geographic pilot · experimental** in the explorer. Nine sites are selectable. Query URLs contain a `geographicPilot` ID and full scene inputs; they never pretend to be accepted reference checkpoints.

| Family | Locations | RESOLVE ecoregions | Ecological adaptation |
| --- | --- | --- | --- |
| Temperate woodland | Central Europe; Appalachia; Japan | 686; 331; 683 | Existing catalogue-backed oak/beech/maple/birch and related broadleaf candidates feed the connected-canopy scaffold. Unsupported architectures cannot activate this pilot. |
| Prairie / steppe | Oklahoma; Humid Pampas; Mongolian–Manchurian steppe | 389; 576; 734 | Only Oklahoma receives its documented regional plant catalogue and conditional tree option. Other sites retain unnamed grass/forb forms, with no imported Oklahoma woody plants. |
| Tropical dry woodland | Costa Rica; Nicaragua; Jalisco, Mexico | 527; 527; 534 | Current country-native catalogue candidates are recorded separately. The accepted Guanacaste/gumbo-limbo pair is not present in the catalogue: the rendered architecture remains explicitly unnamed seasonal growth forms. Flowering and the Costa Rica matte are withheld. |

The gate requires the actual source ecoregion, biome and a location within 0.08 degrees of the audited coordinate. Missing geography, rock/ice, unsupported habitats, unmeasured requested filters and conflicting reference/study selectors return the existing geographic fallback with an explanation. This is a bounded experiment envelope, not a verified habitat boundary.

## Determinism and reuse

The shared adapters are reused rather than copied. A versioned derivation combines the input scene seed and site ID for environmental composition. Structure and appearance streams remain independent. The original input seed and derived scene seed are exported in the pilot manifest; every variant remains unreviewed.

The nine sites use one fixed camera and reference lighting state in the comparison. This is not a local season, weather or solar-angle inference. Terrain, soils, moisture fields, abundance and plant dimensions remain synthetic. No DEM, current land-cover raster or selected-point botanical survey was added.

## Evidence and retained negative findings

- [Local catalogue and polygon audit](../../artifacts/geographic-pilot/sites-audit.jsonl): actual RESOLVE, TDWG botanical country and source-linked candidate names.
- [Matched fallback versus pilot views](../../artifacts/geographic-pilot/comparison.png): each row is one site in the table's order; left is existing geographic fallback, right is pilot; 640×360 originals are alongside their JSON records.
- [Recipe freeze](../../artifacts/geographic-pilot/recipe-freeze.json): source hashes recorded before reserved-seed rendering.
- [Protected-scene parity](../../artifacts/geographic-pilot/protected/parity.json): hero and inspection views for all fifteen accepted references.
- [Validation and agent critique](geographic-pilot-review.json): pass/fail evidence and remaining artistic problems; no inferred human preferences.

One portability defect was rejected: exporting the Oklahoma hills artwork to the Pampas and steppe. Those first captures are preserved under `artifacts/geographic-pilot/rejected-regional-matte/`. The retained pilot withholds that painting outside its source ecoregion; physical terrain continuation remains. The accepted prairie is unchanged.

## Next decisions

Regional native-range evidence does not establish local habitats or flowering. Broad climate filtering currently leaves very few dry-forest candidates, so expanding named tree roles requires evidence-backed catalogue work and species-appropriate profiles, not relabeling generic trees. Pampas and steppe need regional nonwoody data and independently reviewed cover proportions. Woodland transfers its enclosure more readily, but the shared leaf silhouettes and bark differentiation remain approximate.

A future automatic resolver can use **protected accepted reference → evidence-supported regional adapter → biome/realm/habitat recipe → conservative generic fallback**. This pilot implements only the opt-in, evidence-limited adapter stage. Broader rollout, new species claims and global promotion require separate review.
