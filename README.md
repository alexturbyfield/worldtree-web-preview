# WorldTree v0.8 · Global Ecological Expansion

WorldTree maps potential ecological context and builds evidence-labelled vegetation palettes for procedural worlds. Next.js 16 / TypeScript / React / MapLibre GL JS; exported static files run on Vercel without a Python server, credentials, or a running desktop.

Repository: https://github.com/alexturbyfield/worldtree-web-preview (private). Each release is deployed as a **public Vercel Preview** in the existing `worldtree-web-preview` project. The project's production domain contains only the user-approved blank bootstrap page. The release handoff includes the exact Preview URL and deployed commit.

## Actual coverage

- **400** distinct accepted WCVP tree taxa; native-country records represent **336** botanical countries. This is a coverage sample, not an exhaustive flora or a list of dominant species.
- **846** RESOLVE terrestrial ecoregions across 14 biomes and eight realms, plus the source's Rock and Ice feature.
- **0** verified species-to-ecoregion associations. The supported hierarchy exists, but no unverified relationships are relabelled as verified.
- Natural forest mode, sampled at **one unsimplified-source interior point per ecoregion**: **445** points yield documented regional native-range candidates; **401** yield biome/realm growth-form fallbacks. These counts do not assert complete coverage of those polygons.
- Of those fallback points, 51 have predominantly treeless tundra context, 279 have open vegetation context, and 71 have a forest-context climate/catalog gap. Fifteen audit points have no matching coarse botanical-country polygon; they still receive ecological fallbacks.
- Wetland, coastal, alpine, grassland and urban modes use conditional growth forms unless explicit habitat evidence exists. Native-country records are not used to invent street-tree inventories or wetland species associations.
- All **18 original profiles, 62 original taxa and 71 original habitat associations** are preserved unchanged. All 62 original names link to accepted WCVP taxa, including synonym changes. Original planting/locality associations remain explicitly provisional, in a secondary collapsible panel.

Download the complete sampled audit from `/data/v08/coverage.json`; compact counts are in `/data/v08/coverage-summary.json`. The map's Evidence layer uses this **point-sampled audit**, not a claim of continuous species-range coverage. Dashed rectangles identify preserved provisional locality examples and are not the primary resolver.

## Selection and confidence

1. Verified species/ecoregion/habitat associations with explicit evidence URLs.
2. WCVP documented native botanical-country association, intersected with the actual selected coordinate's WGSRPD country. Broad WCVP climate descriptions are compared conservatively to the RESOLVE biome. This comparison is a design inference, not species-specific habitat validation.
3. Biome + biogeographic realm growth-form fallback. No local species presence is asserted.
4. Explicit insufficient-data response for unclassified coordinates, ocean, inland water, unknown biomes, or missing geographic data.

Tundra and Rock and Ice do not receive invented forest palettes. Deserts and grassland/savanna/montane grassland contexts default to open vegetation; exceptional woody or riparian patches require local evidence. Mangroves get a growth-form fallback without an unsupported tropical-tree list. Current forest cover, urban planting, elevation, soils, moisture and salinity are unmeasured.

The **six habitat modes** are Natural forest, Urban / planted, Grassland & savanna, Wetland & riparian, Coastal, and Alpine / high elevation. Environmental filters accept moisture, elevation, coastal/inland and seasonal leaf habit requests. Because those measurements/traits are absent, active environmental filters **withhold species** and label the constraint as unvalidated; unknown values never silently pass. Clearing the filters restores the range-based candidate pool.

Seeds deterministically shuffle the eligible palette and select up to 12 taxa. There are **no abundance percentages, ecological spawn probabilities, or invented weights**. Exported JSON preserves the seed, coordinates, geographic evidence, requested/unknown environmental metadata, species, asset archetypes, growth forms, evidence level, source URLs and limitations. `nativeRegions` uses TDWG Level-3 codes; `ecoregionIds`, `biomeIds` and species-level `habitats` stay empty where unsourced. Leaf habit/evergreen and mature height remain unknown. Archetypes are labelled as procedural design choices, not measured traits.

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

Node.js 24; `npm ci`, then `npm run dev`. No new runtime dependency was needed for v0.8.

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

Do not promote WorldTree to production. Existing Vercel authentication is used. Preview protection was disabled as explicitly requested for public Android access; no account secrets are shipped. `.codex-attachments/`, `.vercel/`, environment files, raw source downloads and credentials are excluded from Git and deployment.
