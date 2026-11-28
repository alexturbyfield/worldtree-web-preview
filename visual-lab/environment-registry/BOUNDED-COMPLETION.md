# Bounded automatic resolver: representative family coverage

The opt-in `bounded-auto-v1` policy now names **42 regional envelopes across all 14 existing RESOLVE families**. This completes the bounded resolver expansion, not worldwide coverage or artistic approval of every generated encounter. The 100 km engineering bound, exact ecoregion/biome/realm/botanical-country intersection, missing-evidence fallback and explicit-reference priority remain in force.

The user approved the direction (“Perfect. This is a good direction. Finish the rest”). That authorizes completion and preview publication; it is not a new per-coordinate artistic preference label. Previously accepted artwork remains separately pinned.

## Added regional families

| Existing family | Three bounded regions | Source and representation limits |
| --- | --- | --- |
| Tropical dry forest | Costa Rica, Nicaragua, Jalisco | Unnamed seasonal broadleaf architecture; actual catalogue candidates are recorded separately, not attached to the rendered templates. Costa Rica flowering and matte are withheld. |
| Mangrove | Florida, Gabon, Sundarbans | Actual country-native candidates with supported root profiles. Coastal habitat supplies the candidate pool; the picker sets it explicitly. Tide, salinity and shoreline remain synthetic. |
| Tropical moist forest | Amazon, Congo, Borneo | Actual regional candidates with approximate architecture and existing forest-floor/depth systems; tidal-root taxa excluded. |
| Tropical conifer forest | Guatemala, Cuba, Himalayan subtropical pine | Explicit unnamed conifer forms where eligible pines are missing from the resolved catalogue. This does not establish that native pines are absent. |
| Temperate conifer forest | Puget, Alps, coastal British Columbia | Existing genus-conditioned stand and source-linked candidates; accepted Puget artwork remains unchanged. |
| Savanna | Tanzania, Cerrado, Arnhem Land | Retained open-grassland transfer. Unsupported woody identities and Oklahoma hills are withheld. This is not a claim that these habitats are naturally treeless. |
| Flooded grassland | Everglades, Pantanal, Inner Niger | Retained irregular wetland fields and environment-derived water optics; unsupported tree identities withheld. No hydroperiod or local wooded-patch occurrence inferred. |
| Montane grassland | Cordillera Blanca, Ethiopian moorland, Altai | Existing tussock/cushion/rock forms; Andean tree and rosette roles withheld. Location-conditioned snowy distance is restricted by its existing source envelope. |
| Desert / xeric shrubland | Mojave, Atacama, Namib | Retained weathered rockland/soil treatment. Mojave distance artwork is hidden in foreign regions. No invented mountains or iconic named plants. |

The previous fifteen woodland, boreal, tundra, prairie and Mediterranean rules remain. The [Mediterranean record](BOUNDED-MEDITERRANEAN.md) preserves its earlier, unpublished checkpoint; it is included in this release. This extension does not change the biome taxonomy, ecological catalogue or renderer framework.

## Implementation

- Pure resolver policy adds the remaining explicit whitelist entries and family-appropriate habitat/candidate requirements. Default map habitat does not confer missing botanical evidence; for example, use the picker's Coastal setting for mangrove candidates.
- Automatic desert/mangrove/flooded routes select the retained structural rebuild and its existing fidelity/flooded-finish presentation through an adapter argument. No query mutation, new lighting treatment or water tint is introduced. Explicit study/reference behavior remains unchanged.
- Tree inputs are restricted to eligible source candidates for named forest transfers; unsupported open-biome woody inputs are withheld. Dry-forest and montane guards now read automatic regional metadata as well as manual pilot state. The desert foreign-matte guard does likewise.
- A native, touch-sized **Automatic preview location** selector opens all 42 supported trial regions with correct habitat and full deterministic inputs. It clears manual study flags and keeps the normal map/fallback available.

## Reproducible evidence

- [Actual data audit before](../../artifacts/bounded-completion/before.json) and [after](../../artifacts/bounded-completion/after.json): 27 new coordinates matched to source polygons, realm, botanical country and catalogue provenance. Existing pilot anchors define the bounds; no nearest-country substitution is made.
- Seed 29, wind disabled, 640×360: [hero comparisons 1](../../artifacts/bounded-completion/after-hero-sheet-1.png), [2](../../artifacts/bounded-completion/after-hero-sheet-2.png), [3](../../artifacts/bounded-completion/after-hero-sheet-3.png); corresponding [inspection 1](../../artifacts/bounded-completion/after-inspection-sheet-1.png), [2](../../artifacts/bounded-completion/after-inspection-sheet-2.png), [3](../../artifacts/bounded-completion/after-inspection-sheet-3.png). These compare full pipelines at matched adapter-camera poses; old finite fallback geometry can lie outside those poses, explaining empty baseline mangrove views. This is not an isolated material comparison.
- [Source freeze](../../artifacts/bounded-completion/freeze.json), then reserved seed **826519**, one new seed per remaining family: [hero](../../artifacts/bounded-completion/holdout-hero-sheet-1.png), [inspection](../../artifacts/bounded-completion/holdout-inspection-sheet-1.png). No runtime source changes followed the freeze or holdout inspection.
- [Validation](../../artifacts/bounded-completion/validation.json): all 27 development scenes and nine held-out scenes rendered without page errors; named-role and asset guards passed.
- [Protected parity](../../artifacts/bounded-completion/protected/parity.json): all **30** accepted hero/inspection views have zero changed RGB channels and identical draw calls/triangles.
- [Targeted tests](../../artifacts/bounded-completion/tests.log): **108 passed**. TypeScript and focused source/UI/test ESLint passed. The full historical suite was not run; documented legacy failures were not altered.
- [Browser checks](../../artifacts/bounded-completion/ui-validation.json): all 42 picker options, automatic navigation for desert/mangrove/flooded habitats, manual-flag removal, 44px touch target, mobile-width layout and ocean fallback passed.

Actual visual interpretation was available. The implementing agent inspected all six matched comparison sheets, both frozen-seed sheets and selected individual hero images. There was no independent reviewer and no new human artistic approval. The existing Lab remains the authority; no model-training claim is made.

## Critique and retained limits

The transfers expose existing floor detail, atmospheric treatment, grassland continuation, rock framing and reflective water that the generic fallback lacks. This is functional/routing improvement; it does not make every transfer concept-quality.

| Family | Largest visible remaining issue |
| --- | --- |
| Dry forest | Heavy warm soil/bark and repetitive distant crown rows; exposed foreground varies strongly by seed. |
| Mangrove | Forest enclosure remains shallow in some views; distant repetition and very high Sundarbans geometry cost. |
| Rainforest | Coarse tree/understory forms and a finite encounter-centered stand become obvious from above. |
| Tropical conifer | Sparse bare floor and generic conifer architecture; regional needle/species identity is unresolved. |
| Temperate conifer | Repeated trunks/needles and encounter-scale enclosure remain evident in inspection. |
| Savanna | Generic prairie-like pigment/forms, missing supported woody communities, and a nearby rise limiting distance. |
| Flooded grassland | Angular/repetitive grass and broad bare staging surfaces; regional communities and wooded mosaics need further evidence. |
| Montane | Similar golden tussocks across regions; weak distant identity once foreign Andean artwork is withheld. |
| Desert | Large rocks frame the opening, but elevated terrain looks repetitive and distant regional geology remains generic. |

These are recorded limitations, not silently promoted global art rules. No aesthetic correction loops or new asset generation occurred. The previous best-known accepted references remain intact.

Development views submit **10–137 calls, 652,184–5,630,862 triangles and 7–19 textures**. Held-out views submit **10–137 calls, 663,952–3,060,862 triangles and 7–18 textures**. These are renderer-reported existing adapter costs. The 5.6M-triangle Sundarbans transfer is a significant mobile concern. Device frame time, texture byte memory and alpha overdraw are unmeasured; mobile performance approval is not claimed.

## Reusable result and release

**Experimentally supported:** a shared bounded resolver can dispatch all existing families while preserving explicit references, regional botanical provenance and asset restrictions. Automatic adapter arguments can reuse retained artistic finishes without adding conflicting URL study flags. **Not established:** global geographic continuity, local species occurrence, current land cover, measured geology/hydrology or final regional artwork quality.

The completion is an isolated preview release on `feat/bounded-environment-resolver`; production/default routing is not promoted. Publication URL and deployed browser evidence are recorded in `artifacts/bounded-completion/`. Further work should target regional flora/backdrops and actual mobile budgets before increasing coverage or making automatic mode the default.

[Live preview](https://worldtree-web-preview-hdjswxsn9-alex-turbyfield.vercel.app/explore?lat=50.7&lon=10.8&seed=29&wind=0&autoEnvironment=bounded-auto-v1): expand **Approved reference scenes → Automatic preview location** to choose any of the 42 regions. The remote build and all ten [deployed browser checks](../../artifacts/bounded-completion/ui-validation-deployed.json) passed; [publication record](../../artifacts/bounded-completion/publication.json) pins the deployed source commit. Desktop software-WebGL with a mobile viewport is not a real mobile-device test.
