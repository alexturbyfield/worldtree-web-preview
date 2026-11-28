# Wildloom · Foliage Studio prototype

The separate **`/studio`** route compares broadleaf foliage, decorative blossoms and Douglas-fir sprays. It is a reference-driven prototype for **user visual approval**. The Forest Explorer, map, existing Tree Atelier, ecological selection and all files under `src/lib/forest/` remain unchanged from commit `ed6f49a4b12d9808116881c4559d38d932b5be20`. No production deployment or forest integration is part of this prototype release.

The three supplied images guide soft layered crowns, irregular botanical silhouettes, cool dark interiors, warm outer highlights, pink blossom clouds and horizontal drooping fir boughs. They remain private; no reference pixels are copied into the repository or deployment. [Reference comparison and remaining gaps](public/showcase/foliage-studio/reference-comparison.json) records the actual match and limitations. The prototype does not reproduce the references' scenery, atmospheric lighting or bark. Some patch repetition remains; the fir is coarser and more regular than the supplied example. The decorative blossom study uses the existing broadleaf skeleton and makes no species/flowering-phenology claim.

A reusable seeded Canvas pipeline paints **12 alpha-masked atlas tiles**: four oval/lanceolate leaf fans, four five-petal blossom clusters and four feathered fir branchlets. Transparent backgrounds, internal gradients, leaf veins, petal centers and needle detail are generated locally. Four cached atlas canvases are retained; one texture/material is shared across all foliage in a comparison. Structural seeds affect branches and foliage placement; appearance seeds change pigment without moving geometry or altering atlas alpha. Detail controls texture morphology; density controls surfaces. All five sliders and both seeds are encoded in shareable URLs.

The existing custom trunk/branch generator is imported without changes. New foliage groups project their anchors onto real source branch segments. Broadleaf and blossom groups overlap three staggered layers of irregular curved patches. Fir groups follow each branch's direction, using shorter overlapping branchlets and world-down droop along the original horizontal tiers. Each open surface has a 3 × 3 grid (eight triangles), with painterly envelope normals and darker inner layers. There are no closed foliage volumes, downloaded meshes, images or third-party tree generators. Foliage and wood are each batched into one draw call. Geometry is generated only when settings change; camera movement does not rebuild it. GPU resources are disposed when the study changes.

The studio provides group comparisons and full branch/tree studies, orbit and zoom, cluster size/density, overlap, silhouette detail, pigment variation, independent seeds, atlas PNG download, JSON study export and live frame/fill measurements. Camera framing survives pigment/control changes; **Frame studies** resets it. Mobile initially selects one kind for readable inspection. Explicit comparison links remain supported. Unavailable WebGL and malformed URLs have accessible errors. The forest renderer is not imported into the new studio renderer or modified by it.

Screenshots: [three groups](public/showcase/foliage-studio/comparison-groups.png), [three tree silhouettes](public/showcase/foliage-studio/comparison-trees.png), [broadleaf](public/showcase/foliage-studio/broadleaf-group.png), [blossoms](public/showcase/foliage-studio/blossom-group.png), [fir spray](public/showcase/foliage-studio/fir-spray.png), [mobile fir tree](public/showcase/foliage-studio/mobile-fir-tree.png), [transparent atlas](public/showcase/foliage-studio/foliage-atlas.png). Structural seeds 17, 29 and 86 are captured for each group type.

## Studio frame time and fill

The **Measure frame time & overdraw** button runs a five-second continuous orbit with the canvas in view. Browser frame intervals supply FPS/median/p95; CPU submission is not GPU timing. A separate 160-pixel-wide depth-disabled additive pass counts alpha-covered foliage layers, then a second pass counts unmasked surface coverage. It reports potential alpha overdraw, rejected surface area, peak and capped pixels, plus a heatmap. This is a sampled geometric coverage estimate, **not a hardware fragment-invocation counter**. Readback is excluded from orbit timings. Values depend on view; counts cap at 255 and the UI identifies capped measurements. Default recorded cases have no saturated alpha or unmasked samples.

Sequential Chromium 159 / SwiftShader results; mobile is 390 × 844 touch emulation, not a physical Android benchmark. Studio software pixel ratios are 1 desktop / 0.85 mobile. Hardware caps are 1.5 / 1.25. Tree comparisons are much more expensive than isolated groups even though both use two draws.

| Measured case | FPS | p95 frame ms | Potential alpha layers / filled pixel | Draws | Triangles |
| --- | ---: | ---: | ---: | ---: | ---: |
| comparison-groups | 56.2 | 32.2 | 4.34 | 2 | 798 |
| comparison-trees | 11.3 | 91.0 | 17.51 | 2 | 43,164 |
| broadleaf-group | 58.1 | 28.7 | 4.90 | 2 | 234 |
| blossom-group | 59.1 | 28.7 | 3.98 | 2 | 234 |
| fir-spray | 56.1 | 32.8 | 1.75 | 2 | 330 |
| mobile-broadleaf | 59.9 | 17.7 | 4.61 | 2 | 222 |
| mobile-blossom | 59.7 | 24.2 | 3.49 | 2 | 222 |
| mobile-fir | 59.9 | 18.0 | 1.75 | 2 | 318 |
| mobile-fir-tree | 29.7 | 39.5 | 4.05 | 2 | 26,504 |

[Full measurements](public/showcase/foliage-studio/performance.json) include actual renderer, resolution, scene build time, peak layers and estimated alpha rejection. [Three-tree overdraw heatmap](public/showcase/foliage-studio/comparison-trees-overdraw.png). Dense tree mode remains slow on software rendering; physical Android/GPU performance is unmeasured. This is not a claim that the approach is ready for a populated forest. Visual approval and further scene-scale profiling are required before any integration.

Reproduce with `npm run build`, `npm run preview:local`, then `node scripts/profile-studio.mjs [origin]`. Unit validation covers seeded buffers, branch attachment, independent pigment, size/density/overlap, zero density and preservation of source skeletons. Browser validation covers desktop and 390 × 844 touch controls, actual canvas orbit, all studio controls, atlas alpha, JSON/direct links, frame/fill measurements, invalid links and WebGL failure. The existing application regression suite remains intact.

---

# Wildloom · Transferred-normal leaf canopies

Painterly and Performance now render **overlapping alpha-cutout multi-leaf billboards**. The existing `CanopyClump` centers, radii, rotations, structural seeds, species and hierarchy are retained exactly as invisible ellipsoid scaffolds. No solid canopy geometry is constructed in these two renderers. Diagram preserves its existing debug renderer. Terrain, UI layout, tree placement and camera framing are unchanged; the existing atlas preview now displays the new cluster tiles.

Cards sample a seeded, jittered Fibonacci shell at 0.84–1.07 times each reference ellipsoid. Structural seeds control placement, tilt, scale, roll and texture variant; appearance seeds control pigment only. Neighboring scaffolds reject deeply buried samples. Coarse LOD retains more overlap to avoid bald crowns. Shader-based partial camera-facing bias tilts cards without moving their centers or rebuilding buffers. Hidden back-shell cards are clipped in the vertex shader. Broadleaf tiles combine lobed and oval leaves; eight painted tiles include distinct Douglas-fir, spruce, pine and acacia branchlet clusters. The procedural Canvas atlas supplies transparent backgrounds, veins, painted highlights and tonal variation. Alpha testing uses depth writes; transparent blending is disabled.

Every card vertex receives the same **transferred ellipsoid normal**: first rotate the card center into ellipsoid-local coordinates, then calculate `normalize((P-C)/(R*R))`, rotate back, and apply the tree's inverse-transpose normal transform. The shader applies the batch normal matrix and converts to world space for soft vertex-lit diffuse shading. Billboard plane normals never determine diffuse lighting, and viewing a card from the back does not invert its outward lighting normal. Leaf surface variation is painted into the color atlas; no tangent-space normal map is used. Lighting uses a shared painterly hemisphere/sun/fill approximation rather than expensive per-fragment PBR.

The forest packs four vertices and two indexed triangles per card into **one shared batch per LOD**. Atlas, material, normals and color buffers are shared across the trees; draw calls do not grow with leaf count. Batched cards avoid the high cost of thousands of tiny instances on the tested software driver. Buffers are generated only when the recipe changes. Camera movement and wind update shader values only. Textures, materials, geometry and controls are disposed on scene replacement. Atlas and tree/scaffold caches remain bounded. Picking intersects invisible ellipsoids analytically because card corners tilt on the GPU. Scene recipes retain the original scaffold data and seeds; `foliageCards` remains the legacy surface-accent descriptor field, not an export of these baked billboard buffers.

The isolated prototype was validated before replacing the forest renderer. Four 90-degree views against a contrasting background render zero opaque scaffold meshes, identifiable overlapping leaves and strong rounded shading. The central projected ellipse has more than 99% alpha coverage in all four views; this is a sampled central-area metric, not proof that every silhouette pixel is filled. Repeating the seed after reload produces an identical geometry hash. The isolated clump submits **one draw call / 100 triangles**, versus **one / 196** for its former solid mesh. [Before](public/showcase/leaf-canopies/isolated-before.png), [after](public/showcase/leaf-canopies/isolated-after-0.png), [reverse view](public/showcase/leaf-canopies/isolated-after-2.png), [mobile](public/showcase/leaf-canopies/isolated-mobile.png), [validation data](public/showcase/leaf-canopies/isolated-validation.json).

Tree/forest screenshots: [oak before](public/showcase/leaf-canopies/before-oak.png), [oak after](public/showcase/leaf-canopies/after-oak.png), [leaf close-up](public/showcase/leaf-canopies/after-oak-closeup.png), [Douglas-fir](public/showcase/leaf-canopies/after-douglas.png), [acacia](public/showcase/leaf-canopies/after-acacia.png), [forest before](public/showcase/leaf-canopies/before-desktop-painterly-36.png), [forest after](public/showcase/leaf-canopies/after-desktop-painterly-36.png).

Reproduce the isolated study and paired measurements in separate terminals:

```
npx esbuild scripts/canopy-study.ts --bundle --platform=browser --format=iife --outfile=.vercel/canopy-study.js
node scripts/serve-canopy-study.mjs
npm run preview:local
node scripts/profile-leaf-canopies.mjs [new-app-origin]
```

The profile script compares against the exact prior deployed solid-clump release with identical coordinates, seeds, density, UI and camera. Runs are sequential five-second continuous orbits with wind enabled, Chromium 159 / SwiftShader. Mobile uses a 390 × 844 touch viewport (scene canvas 390 × 447), **not a physical Android device**. Main-pass draw calls and submitted triangles exclude shadow-pass work. Software-only pixel ratios are reduced from 0.85/0.7 to 0.65/0.55 for Painterly/Performance; hardware quality caps remain unchanged. This is a quality/performance tradeoff, not an equal-resolution benchmark.

| Case | Version | Pixel ratio | Draw calls | Triangles | FPS | p95 ms |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| desktop-painterly-36 | before | 0.85 | 9 | 47,564 | 13.4 | 75.4 |
| desktop-painterly-36 | after | 0.65 | 4 | 19,038 | 7.2 | 157.8 |
| mobile-painterly-30 | before | 0.85 | 9 | 39,852 | 35.6 | 29.8 |
| mobile-painterly-30 | after | 0.65 | 4 | 16,044 | 24.1 | 47.1 |
| mobile-painterly-36 | before | 0.85 | 9 | 47,564 | 31.1 | 34.2 |
| mobile-painterly-36 | after | 0.65 | 4 | 19,038 | 19.6 | 54.3 |
| mobile-performance-36 | before | 0.7 | 7 | 47,564 | 38.2 | 29.9 |
| mobile-performance-36 | after | 0.55 | 4 | 16,492 | 31.7 | 33.5 |

[Full measurements](public/showcase/leaf-canopies/performance.json) include actual renderer, scene build time, frame intervals and card counts. Dense alpha-tested foliage remains slower than solid clumps on SwiftShader, particularly on the larger desktop canvas. Performance mode is recommended for mobile/software forests. Physical Android GPU performance is unmeasured. Whole-scene LOD can pop; far cards have less leaf detail; foliage does not cast shadows in this implementation (wood retains its existing shadows). No opaque sphere or ellipsoid is used even as a distant color proxy. The Profile button measures the current browser without rebuilding geometry.

Validation passed: **144 TypeScript tests, 15 preserved Python tests, 18 desktop/mobile browser tests, ESLint, TypeScript checks, production build and data hash verification**. Coverage includes deterministic buffers, seed independence, inverse-squared-radius normals, rotated/scaled parent transforms, per-vertex transferred attributes, atlas morphology, closed legacy geometry, ecology and UI regressions. The preserved data, confidence labels, species fallback policy and historical screenshots remain unchanged. The Tree Atelier keeps all existing growth, seed and debug controls. Species shapes are artistic presets, not sourced botanical measurements.

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
