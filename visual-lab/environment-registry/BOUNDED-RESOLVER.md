# Bounded automatic resolver v1

Status: **experimental, opt-in, artistically unreviewed**. This milestone selects existing recipes; it does not alter or approve their artwork.

Subsequent scope: the [prairie extension](BOUNDED-PRAIRIE.md) adds three bounded areas, bringing the current policy to twelve. The original nine-area evidence below remains preserved.

## Use

Open a map location, expand **Approved reference scenes → Bounded automatic resolver**, and choose **Bounded automatic · experimental**. The versioned URL flag is `autoEnvironment=bounded-auto-v1`. Back-to-map navigation and seed edits retain the opt-in. Choosing an explicit reference or study takes priority.

Example: `/explore?lat=50.7&lon=10.8&seed=29&habitat=forest&density=36&structure=grove-1&appearance=garden&wind=0&mode=painterly&autoEnvironment=bounded-auto-v1`.

## Deliberate boundary

The policy reuses nine existing trial records: European/Appalachian/Japanese woodland; Finnish/Canadian/Siberian boreal; Alaskan/Chukchi/polar tundra. Selection requires the trial's exact RESOLVE ecoregion, biome, realm and botanical country, plus a distance of at most 100 km from its anchor. The distance is an engineering rollout boundary, **not evidence of habitat continuity**. No nearest-country or nearest-biome substitutions are made.

Forest selection also requires a supported country-native candidate architecture. These are regional range candidates, not verified local occurrences. Tundra uses unnamed low-cover forms and remains treeless. Missing geography/country, unmeasured requested filters, unsupported habitats, missing drawable sources, invalid versions or out-of-scope locations retain the existing fallback with an exported reason.

The deterministic seed incorporates policy version, family, ecoregion, botanical country, input seed and a quarter-degree coordinate tile. Structure and appearance inputs are preserved. Tiles provide encounter variation, **not continuous geographic terrain**. Seasons, weather and time of day are not inferred from biome identity.

## Evidence and decisions

- [Structured review](bounded-resolver-review.json) records loaded instructions, source provenance, measurements and limitations.
- [Matched hero comparisons](../../artifacts/bounded-resolver/comparison-hero-sheet.png) and [elevated comparisons](../../artifacts/bounded-resolver/comparison-inspection-sheet.png): nine new coordinates beyond the prior manual pilot's point gates. Same camera/seed per pair; before is the old geographic fallback, after is the existing recipe adapter. This is a whole-pipeline comparison, including the adapter's atmosphere and far clip.
- [Frozen-source record](../../artifacts/bounded-resolver/frozen-source.json), then reserved seed **530219** at Japan, Siberia and Chukchi: [hero](../../artifacts/bounded-resolver/holdout-hero-sheet.png), [inspection](../../artifacts/bounded-resolver/holdout-inspection-sheet.png). No recipe tuning followed these captures. One later UI-only correction removed a contradictory fallback sentence; renderer/policy hashes remain frozen.
- [Browser checks](../../artifacts/bounded-resolver/ui-validation.json): 15 checks passed, including actual export, map round trip, seed edits, mobile overflow/touch sizing, ocean fallback and reference priority.
- [Protected parity](../../artifacts/bounded-resolver/protected/parity.json): all 30 accepted hero/inspection captures have zero changed RGB channels and unchanged draw calls/triangles with automatic mode requested.
- [Targeted tests](../../artifacts/bounded-resolver/tests.log): 70 passed. TypeScript and targeted ESLint passed; [production build](../../artifacts/bounded-resolver/build.log) passed. No full test-suite claim; previously documented legacy forest-test failures remain outside this scope.

Actual image interpretation was available. The implementing agent inspected the hero/elevated comparison sheets, held-out sheets and individual hero images. This was **not independent review or human approval**.

Observed benefit: the bounded points select connected woodland, enclosed conifers or treeless low cover instead of the sparse generic fallback. Existing floor detail, illumination and regional palette transfer remain visible. **Major inherited limits:** elevated woodland views expose the encounter-centered forest arrangement and bare gaps; boreal trees/continuation remain repetitive; tundra cover shows repeated sprigs and directional patch boundaries, while polar ground is sparse and ochre. These are restrictions on expansion, not newly accepted aesthetic rules.

Development heroes submit 13–16 draw calls and 243,316–1,033,628 triangles, with 5–13 renderer-reported textures. Held-out heroes submit 15–16 calls and 673,288–1,023,900 triangles. Counts include existing adapters, not additional resolver geometry. Software WebGL checks establish neither device frame time nor mobile approval; texture bytes and alpha overdraw were not measured.

## Reusable finding and next checkpoint

**Experimentally supported:** a pure, versioned decision function can reuse existing adapters, enforce explicit provenance gates, preserve reference priority and explain fallback without changing protected artwork. **Proposed:** extending this boundary to more families. **Human approval required:** automatic regional variations and any wider rollout. No global artistic rule or approval label was promoted.

Before widening: review these selected encounters, address encounter-only continuation where navigation requires it, and validate additional ecological evidence and representative coordinates. Preserve the existing fallback and whitelist; adding a manual trial must not silently enable another automatic rule.

Source changes: `bounded-resolver.ts`, its policy JSON, `geographic-pilot.ts`, `environment-registry.ts`, `recipe.ts`, `wave1.ts`, `regional-pilot-study.ts`, `landscape-matte.ts`, `EnvironmentReferencePanel.tsx`, `ForestExplorer.tsx`, `Explorer.tsx`, plus focused tests. Existing generated scene/material assets were not modified by this pass. Recoverable pre-edit snapshots are in `artifacts/bounded-resolver/source-before/`.
