# WorldTree v0.8 validation

- 93 automated TypeScript tests passed, including the original 81 regression tests and 12 export-contract checks. Coverage includes original catalog parity, the generated geographic worker, 19 representative global coordinate cases, every biome/realm, native-range boundaries, cross-continent exclusions, treeless/open contexts, six habitats, deterministic exports, missing data, taxonomy homonyms and unvalidated environmental filters.
- All 15 original Python tests passed unchanged.
- ESLint and TypeScript checks passed.
- Next.js production build and static export passed.
- Original 463 geographic tile hashes, display hash and both preserved prototype JSON files verified. New public/source normalized-data hashes verified.
- npm installation/lockfile audit reported zero vulnerabilities.

## Coverage measured by the checked-in audit

400 accepted sourced taxa; 338 native botanical countries represented; 846 terrestrial ecoregions plus Rock and Ice. Verified species/ecoregion joins: **0**. At one accurate interior test point per ecoregion in natural forest mode: **471** documented regional range candidate pools and **375** biome/realm fallback profiles. The 375 include 51 predominantly treeless tundra contexts, 279 open-vegetation contexts, and 45 forest-climate/catalog fallback contexts. Fifteen botanical boundary gaps at audit points fall back safely. No point-sample statistic claims full polygon or actual forest coverage.

Urban, grassland, wetland, coastal and alpine modes use ecological growth-form fallbacks across all 846 sampled ecoregions. Local planting examples remain explicitly provisional; source native ranges are not treated as planted-tree evidence. All 62 original taxon names resolve to accepted WCVP names without modifying the original associations.

The actual RESOLVE polygon classifies central Cairo as **Nile Delta flooded savanna**, biome 9; a separate Cairo desert-edge point is tested as desert, biome 13. Expected labels are never forced over the source data. Rock and Ice's misleading source biome code 11 is handled through its actual ecoregion ID 0.

## Deployment verification

The release is deployed only as a Vercel **Preview** in the existing project. Public HTTP, served asset integrity and global lookup smoke tests are run against the returned URL before handoff. The exact Preview URL and deployed application commit are returned with the release. The production domain remains the previously approved blank placeholder.

## Export-contract acceptance

`TreeSpecies` includes optional canonical `heightMeters`. Exports preserve the legacy `matureHeightM` field, copy a supplied legacy range to the canonical field when needed, and prefer an explicitly supplied canonical range. The 400 current catalog records remain unchanged: unknown heights omit the canonical field. Contract tests check all required species fields across the catalog, nonmutation, synthetic supplied ranges, confidence/evidence and source preservation, deterministic seeds, six habitat modes, unvalidated environmental constraints, and insufficient-data results. Synthetic range fixtures are test data only and never enter the ecological catalog.

## Browser verification limit

Rendered mobile/device testing is optional for this acceptance pass, as agreed with the user, and is not a release gate. It was not rerun; no v0.8 mobile screenshot or real touch-flow pass is claimed. An earlier desktop inspection was blocked by a Windows Firewall security dialog for a stopped Python server. The v0.7 initial layout review at 390 × 844 is not represented as v0.8 verification. CSS retains the mobile breakpoint, large controls, document scrolling and MapLibre touch controls. Public HTML/viewport checks and live worker/data smoke tests are separate from rendered browser verification.

## Data-quality and licensing limits

WCVP v16's actual source archive specifies CC BY 3.0, despite the GBIF Darwin Core variant advertising CC BY 4.0. The archive license is retained. TDWG coordinates are old and coarse; boundaries can disagree at coasts. Native-country and broad-climate evidence do not verify local habitat or ecoregion membership. No evergreen/deciduous, mature-height, precise elevation, soil, local moisture, current vegetation-cover or street-tree inventory is invented. Active environmental filters with missing evidence withhold species instead of treating unknown as suitable.
