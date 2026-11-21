# Wildloom v0.1 · Fluffy Painterly Canopies

WorldTree is now **Wildloom**. This release replaces the sparse v1.1 card crowns with connected, overlapping, irregular low-poly foliage volumes. The existing geographic data, ecological evidence, native-range resolution, map and Open Location workflow are preserved. The GitHub repository and Vercel project retain their existing names so links and deployment history continue working.

The seeded hierarchy has a species-specific **primary envelope**, branch-associated **secondary clumps** and restrained **tertiary surface detail**. Douglas-fir and spruce build layered, drooping conical boughs with broad bases and small crown gaps; oak builds an overlapping rounded upper/lower crown; pine uses more open, high branch-end pads; acacia builds a broad connected umbrella canopy with supporting forks. These are artistic growth presets, not measured botanical reconstructions. Clumps use custom closed indexed BufferGeometry lofts with seeded lobes, droop and deformation, not perfect SphereGeometry or ConeGeometry. Each detailed mesh has 196 triangles; the distant mesh has 64.

**Painterly** uses full crowns with shared opaque materials, vertex gradients, procedural brush texture, per-instance greens, warm directional highlights and cool fill. **Performance** uses fewer, larger clumps, two deformation batches per clump kind, Lambert shading and lower resolution. **Diagram** preserves the previous v1.0 geometric renderer unchanged. The v1.1 atlas/card generator remains in source and supplies limited leaf/needle accents. At overview distances these accents disappear entirely: opaque crown silhouettes carry the forest, avoiding dense alpha overdraw. Wind animates only surface accents, not the solid canopy volumes.

The **Tree Atelier** at `/lab` has species, structural/appearance seeds, stylization, density, asymmetry, **Fluffiness, Clump overlap, Surface leaf detail and Branch exposure**. Wireframe, skeleton and surface-card debug views, atlas preview, live statistics, JSON download and whole-tree camera framing remain available. New controls are shareable in URLs and exported recipes. Diagram preserves its original fixed visual settings. Appearance seeds change pigments without moving any branch, clump or surface accent; scene placement seeds do not change the species definitions. Structural descriptors are cached separately from paint. There is no unseeded Math.random() in generation.

Select a map point and choose **Open Location** for a synthetic 100 × 100 metre terrain scene with 0–60 trees, deterministic placement, individual inspection/regeneration and exportable confidence metadata. Default map density is 48 desktop / 36 mobile; mobile map links prefer Performance. The forest uses the same canopy generator as the Atelier. Species without a preset retain their identity and a clearly labelled visual-archetype fallback. Ocean, missing data, naturally treeless contexts and unvalidated environmental filters do not produce invented native forests. Conditional habitat studies remain explicit opt-ins.

Both forest LODs are built once and switched by orbit distance; all matching clumps are instanced by kind and deformation variant, with batched wood and shared materials/textures. Skeleton, painted-tree and crown-descriptor caches are capped at 128 entries each; the atlas canvas cache is capped at four. GPU resources and controls are disposed on scene changes. Shadows update on initial render and LOD changes, not every frame. LOD is currently whole-scene rather than per-tree, so transitions can pop. The camera frames lush canopy volume. Touch orbit, pinch zoom, pan, picking and WebGL failure messaging remain functional. No downloaded meshes, image textures, third-party tree generator or heavy postprocessing is used.

Normal viewing-distance screenshots: [Douglas-fir](public/showcase/wildloom-v0.1/after-douglas-seed-29.png), [broadleaf oak](public/showcase/wildloom-v0.1/after-oak-seed-29.png), [acacia](public/showcase/wildloom-v0.1/after-acacia-seed-29.png), [Seattle forest](public/showcase/wildloom-v0.1/desktop-painterly-36.png), [mobile forest](public/showcase/wildloom-v0.1/mobile-painterly-36.png). Three structural seeds for each main architecture are versioned in that directory, alongside pine and spruce. The previous sparse-card rendering remains documented in [v1.1 screenshots](public/showcase/v1.1/after-douglas-seed-29.png).

Reproduce with `node scripts/profile-wildloom.mjs [origin]`, using `npm run preview:local` if no origin is supplied. Measurements below are sequential five-second continuous orbits with wind enabled, headless Chromium 159 / SwiftShader. Mobile means a 390 × 844 touch viewport, whose scene canvas is 390 × 447; it is **not a physical Android GPU benchmark**. Pixel ratios are capped at 0.85 Painterly / 0.7 Performance on software rendering. Triangle/draw counts cover the main rendered pass, not shadow-pass GPU work. Software fill rate limits the larger desktop canvas. The mobile 60-tree cases remain below 30 fps; reduce density or use Performance. Thirty or sixty fps is not guaranteed on every device.

| Measured case | Clumps | Draw calls | Triangles | Average fps | p95 frame ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| desktop-painterly-36 | 648 | 9 | 47,564 | 11.8 | 90.8 |
| mobile-painterly-30 | 538 | 9 | 39,852 | 39.1 | 27.5 |
| mobile-painterly-36 | 648 | 9 | 47,564 | 29.4 | 37.5 |
| mobile-painterly-60 | 1080 | 9 | 77,900 | 20.3 | 51.7 |
| mobile-performance-36 | 648 | 7 | 47,564 | 38.3 | 27.5 |
| mobile-performance-60 | 1080 | 7 | 77,900 | 25.1 | 43.7 |

Full renderer strings, build time, navigation readiness, CPU submission time and frame timing are in [performance.json](public/showcase/wildloom-v0.1/performance.json). Both modes use the same coarse clump set at overview distance; Performance further reduces batches and resolution. Normal forest views use zero surface cards; close Atelier views use up to 12 small accents. The **Profile 5s orbit** button measures the current browser without rebuilding geometry.

Validation includes **135 TypeScript tests**, **15 preserved Python tests**, geographic source/public hash verification, TypeScript checks, ESLint and a production static build. All **18 browser tests passed** across desktop and 390 × 844 touch layouts: species identity across multiple seeds, connected crown descriptors, independent pigments, controls, Performance reduction, preserved Diagram, atlas alpha, reduced motion, camera interaction, picking, ecology, direct links and unsupported locations. Geometry tests check closed surfaces, outward winding, finite normals, overlap and reduced LOD cost. The v1.0/v1.1 historical screenshots and data remain versioned.

## Actual coverage

- **400** distinct accepted WCVP tree taxa; native-country records represent **338** botanical countries. This is a coverage sample, not an exhaustive flora or a list of dominant species.
- **846** RESOLVE terrestrial ecoregions across 14 biomes and eight realms, plus the source's Rock and Ice feature.
- **0** verified species-to-ecoregion associations. The supported hierarchy exists, but no unverified relationships are relabelled as verified.
- Natural forest mode, sampled at **one unsimplified-source interior point per ecoregion**: **471** points yield documented regional native-range candidates; **375** yield biome/realm growth-form fallbacks. These counts do not assert complete coverage of those polygons.
- Of those fallback points, 51 have predominantly treeless tundra context, 279 have open vegetation context, and 45 have a forest-context climate/catalog gap. Fifteen audit points have no matching coarse botanical-country polygon; they still receive ecological fallbacks.
- Wetland, coastal, alpine, grassland and urban modes use conditional growth forms unless explicit habitat evidence exists. Native-country records are not used to invent street-tree inventories or wetland species associations.
- All **18 original profiles, 62 original taxa and 71 original habitat associations** are preserved unchanged. All 62 original names link to accepted WCVP taxa, including synonym changes. Original planting/locality associations remain explicitly provisional, in a secondary collapsible panel.

Download the complete sampled audit from `/data/v08/coverage.json`; compact counts are in `/data/v08/coverage-summary.json`. The map's Evidence layer uses this **point-sampled audit**, not a claim of continuous species-range coverage. Dashed rectangles identify preserved provisional locality examples and are not the primary resolver.

## Selection and confidence

1. Verified species/ecoregion/habitat associations with explicit evidence URLs.
2. WCVP documented native botanical-country association, intersected with the actual selected coordinate's WGSRPD country. Broad WCVP climate descriptions are compared conservatively to the RESOLVE biome. This comparison is a design inference, not species-specific habitat validation. WCVP’s broad “temperate” category includes several boreal larches and birches; their documented native countries remain mandatory.
3. Biome + biogeographic realm growth-form fallback. No local species presence is asserted.
4. Explicit insufficient-data response for unclassified coordinates, ocean, inland water, unknown biomes, or missing geographic data.

Tundra and Rock and Ice do not receive invented forest palettes. Deserts and grassland/savanna/montane grassland contexts default to open vegetation; exceptional woody or riparian patches require local evidence. Mangroves get a growth-form fallback without an unsupported tropical-tree list. Current forest cover, urban planting, elevation, soils, moisture and salinity are unmeasured.

The **six habitat modes** are Natural forest, Urban / planted, Grassland & savanna, Wetland & riparian, Coastal, and Alpine / high elevation. Environmental filters accept moisture, elevation, coastal/inland and seasonal leaf habit requests. Because those measurements/traits are absent, active environmental filters **withhold species** and label the constraint as unvalidated; unknown values never silently pass. Clearing the filters restores the range-based candidate pool.

Seeds deterministically shuffle the eligible palette and select up to 12 taxa. There are **no abundance percentages, ecological spawn probabilities, or invented weights**. Exported JSON preserves the seed, coordinates, geographic evidence, requested/unknown environmental metadata, species, asset archetypes, growth forms, evidence level, source URLs and limitations. `nativeRegions` uses TDWG Level-3 codes; `ecoregionIds`, `biomeIds` and species-level `habitats` stay empty where unsourced. Leaf habit/evergreen and mature height remain unknown. Archetypes are labelled as procedural design choices, not measured traits.

The game export's optional `heightMeters: [min, max]` field is emitted only when a range is supplied. A supplied canonical `heightMeters` takes precedence; otherwise a non-null legacy `matureHeightM` range is also exposed under the canonical name. The legacy field and all other metadata remain available for compatibility. All 400 current records have unknown heights, so their exports omit `heightMeters` and retain `matureHeightM: null`. Exporting never fills in traits, changes confidence, or mutates the source profile.

## Interface

Pan and zoom the real map; tap a coordinate; search 37 named places or arbitrary `latitude, longitude` pairs. Seattle, Atlanta and Tokyo shortcuts remain. Global presets include Manaus, Kinshasa, Antananarivo, Cairo, Berlin, Yakutsk, Mumbai, Borneo, Perth, Auckland, Reykjavík, Pacific/Caribbean islands, Sahara and Arctic tundra. This is local preset/coordinate search, not worldwide street-address geocoding.

Browse/search all 400 taxa by scientific name, available preserved common names, or reconciled legacy synonyms. Detail panels show accepted identifiers, source native ranges, lifeforms, broad climate, unknown traits, confidence limitations and Kew references. Only the 62 legacy taxa have imported common names; these vernacular labels remain provisional. The majority of imported records show scientific names.

The responsive interface preserves large map controls and mobile document scrolling. The app shell, display ecology, botanical boundaries, catalog, audit and downloaded detailed lookup tiles are cached after an online visit. New tiles and OpenStreetMap street detail require connectivity. This is partial offline support, not a complete offline planet. WebGL, Web Workers and DecompressionStream support are needed for the full experience.

## Data provenance, licensing and reproduction

**WCVP:** Royal Botanic Gardens, Kew, *World Checklist of Vascular Plants*, version 16, extracted **4 June 2026**, [DOI 10.34885/egs6-cp24](https://doi.org/10.34885/egs6-cp24). Downloaded once from the [official Kew repository](https://sftp.kew.org/pub/data-repositories/WCVP/wcvp.zip). The actual archive's `README_WCVP.xlsx` states **CC BY 3.0**; the GBIF-hosted Darwin Core variant advertises CC BY 4.0. This implementation conservatively follows the downloaded archive's CC BY 3.0 attribution. No images or third-party descriptive prose were imported.

Accepted, non-hybrid species with a tree lifeform and native/extant/non-doubtful distributions are eligible. Priority original/distinctive taxa are followed by a deterministic regional round-robin with genus diversity, capped at 400. Accepted names take precedence over illegitimate homonyms: *Pinus taeda* L. is retained, not *P. taeda* Blanco. WCVP identifiers, IPNI IDs, POWO IDs, source dates and raw source hashes are retained. No occurrences are converted into native ranges. No bulk per-species scraping or API flooding is required.

**Botanical countries:** Brummitt (2001), *World Geographical Scheme for Recording Plant Distributions*, Edition 2, TDWG / Hunt Institute. The [official TDWG Level-3 GeoJSON](https://github.com/tdwg/wgsrpd/tree/master/geojson) is pinned at commit `f68afd99aa94adadaa3e0328e4aadda75ecc4215`. Coordinates are retained; bounding boxes are added for lookup. TDWG's [platform terms](https://www.tdwg.org/about/terms-of-use/) provide CC BY 4.0 unless otherwise stated. These old, coarse botanical boundaries are **not precise species-range polygons** and can miss small islands or disagree with RESOLVE coastlines.

**Ecoregions:** Dinerstein et al. (2017), *An Ecoregion-Based Approach to Protecting Half the Terrestrial Realm*, BioScience 67(6):534–545, [DOI 10.1093/biosci/bix014](https://doi.org/10.1093/biosci/bix014). Ecoregions 2017 © RESOLVE, CC BY 4.0. The original [official source archive](https://storage.googleapis.com/teow2016/Ecoregions2017.zip) is converted to 463 gzip lookup tiles, retaining source vertices inside 10-degree clips. Shapely repairs 69 invalid source geometries; repaired IDs are recorded. Display geometry is separately simplified twice at 0.035 degrees, small islands may disappear, and display coordinates are rounded to four decimals. No simplification is applied to lookup geometry. The source labels Rock and Ice as biome 11 / N/A; ecoregion ID 0 is explicitly excluded from the 846 terrestrial ecoregion count and receives bare-ground/ice context.

Natural Earth land is public domain. Street detail is © OpenStreetMap contributors, ODbL attribution, fetched on demand without offline tile scraping. MapLibre is BSD-3-Clause. Fonts use Google Fonts with system fallbacks.

Normalized versioned records live in `data/global/`; public snapshots and SHA-256 manifests live in `public/data/v08/`. Source archives are excluded from Git and deployment. The original Python prototype and tests remain in `prototype/worldtree/`.

```
python -m pip install -r scripts/requirements-data.txt
npm run data:import   # Only if rebuilding RESOLVE source/tiles
npm run data:global   # WCVP import + coverage audit; downloads cached locally
python scripts/verify_data.py
```

The WCVP importer requires the unsimplified RESOLVE source to create initial interior audit points. Subsequent runs reuse those versioned points. Archive hashes, license evidence, source URLs, normalization changes and missing traits are documented in `/data/v08/provenance.json`.

## Development, validation and deployment

Node.js 24; `npm ci`, then `npm run dev`. No new runtime dependency was needed for Wildloom v0.1.

```
npm run lint
npm run typecheck
npm test
npm run test:python
python scripts/verify_data.py
npm run build
npm run preview:local
```

The last command serves the actual static export on **127.0.0.1:3001**. `next start` does not serve static exports. Worker assets are explicitly bundled/copied before builds; CSS/JavaScript dependencies remain pinned in the lockfile.

Deploy only a preview, retaining the existing project:

```
npx vercel deploy --yes --environment preview --project worldtree-web-preview
node scripts/verify-preview.mjs <preview-url>
npx tsx scripts/verify-global-preview.ts <preview-url>
```

Do not promote Wildloom to production. Existing Vercel authentication is used. Preview protection was disabled as explicitly requested for public Android access; no account secrets are shipped. `.codex-attachments/`, `.vercel/`, environment files, raw source downloads and credentials are excluded from Git and deployment.
