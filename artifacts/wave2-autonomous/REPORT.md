# Autonomous Wave 2 — living floors and dimensional low cover

**Visual-review checkpoint.** The forest floors and tundra representation visibly improve over the retained baseline, but the scenes remain below the concepts' artistic quality. No artistic approval, global promotion, commit, push or deployment is implied.

[Matched before/after](before-after.png) · [Concept versus actual render](retained-concept-comparison.png) · [Seeds and fresh holdouts](hero-seeds.png) · [Inspection views](inspection-seeds.png) · [Regional cases](regional.png)

All scene images are actual WebGL captures. The generated images are **material textures**, not substitute environment renders. Root inspected the concepts, intermediate experiments and final hero/inspection/regional sheets. Specialist implementers inspected their own work; no independent external reviewer or human approval is claimed. Parallel specialists reached service usage limits after their implementation handoffs; root completed subsequent choices, reversions and validation.

## Visible changes

| Environment | Retained improvement | Remaining artistic gap |
| --- | --- | --- |
| Boreal | Moss/duff artwork replaces the olive blanket and scattered marks. Weathered, moss-blended stones, grounded roots and continuous low banks now frame the foreground. Enclosure and source-linked trees remain unchanged. | Floor relief and low shrubs still look simplified; the warm middle opening is weaker than the concept. Bark/crown rhythm and distant continuation remain mechanical. |
| Temperate | Leaf litter, moss communities and root contacts produce a richer floor. Genus-conditioned bark detail is local to this study. A higher physical key reveals a brighter opening, and 320 source-baked distant trees close the exposed blue horizon in the hero view. | Crowns and ferns still have coarse repeated shapes; ground light is not yet as selective as the concept. Distant cards reveal their construction from elevated views. |
| Tundra | Crossed-card stars are removed. Actual branched stems support small curved leaves, with separate near/middle geometry and short sedge-like forms. Linked communities replace even scatter while preserving the character opening. | Pale repetitive foliage, thin woody silhouettes, weak rolling landform character and limited distant biological detail remain major gaps. This is not a finished heath representation. |

The checkpoint is retained for demonstrated material/representation progress, not because a round count expired. The concepts remain the target. Next priority is canopy/material depth and selective illumination in the forests, plus more convincing clump-scale form and terrain integration in tundra; increasing density is not the remedy.

## Autonomous decisions and rejected evidence

- **Boreal:** isolated white artifacts to stone bodies using hide-caps/hide-stones diagnostics; corrected linear albedo instead of exposure. Rejected triangle-selected moss caps, replacing them with a continuous rock-material blend. Narrowed excessive clearance and moved existing anchors into readable edge framing without adding rocks. Added a real moss albedo layer. Elevated inspection then exposed oversized moss blobs beyond the stand: the first distribution was rejected and repaired with persistent shelter gating and finer irregular edges. Earlier captures and the first freeze remain preserved.
- **Temperate:** retained readable directional contrast, detailed litter/bark/root contact and moss blended using actual branch-group shelter. Persistent growth inputs are separate from projected sunlight. Added existing-system source impostors with opt-in distance bounds. A CPU optical score proposed a new key; the actual fixed-energy comparison supported it here, while the score's boreal winner was visually rejected.
- **Tundra:** replaced cards with genuine branchlets, then reduced exposed wood and tessellation rather than adding plants. Rejected a noise-threshold community model that emptied the near field. A linked-swath alternative kept the same plant count. Independent RNG streams exposed a camera-blocking rock: bounds-based camera/approach clearance fixed it. A later clump-value tweak had no clear artistic benefit and was reverted.

Examples: [Rejected barren foreground](tundra-community-r1/tundra-29-hero.png), [rejected camera obstruction](tundra-swaths-r1/tundra-29-hero.png), [white-body diagnostic](diagnostic-boreal/no-caps.png), [boreal light proposal](diagnostic-boreal-selected-key/candidate-sun.png), [retained temperate key](diagnostic-temperate-selected-key/candidate-sun.png). Numeric optical coverage did not decide aesthetics.

## Implementation and reusable findings

Changes remain in the existing opt-in Wave 2 adapters and local helpers:

- Boreal: `wave2-boreal.ts`, `wave2-boreal-floor.ts`; original bough architecture retained.
- Temperate: `wave2-temperate.ts`, `wave2-temperate-concept.ts`, `wave2-temperate-surfaces.ts`.
- Tundra: `wave2-tundra.ts`, `wave2-tundra-heath.ts`, `wave2-tundra-branchlets.ts`.
- Shared opt-in support: `wave2-shared.ts` preserves full albedo RGB, shares world texture coordinates/materials with relief, and offers experimental field helpers. The rejected community-height option is inactive. `wave1-impostors.ts` gains optional radius bounds; existing defaults remain unchanged.

The existing capture/review scripts were reused and extended, not replaced with another framework. New captures snapshot source files and record cameras, lights, render settings and counters. The session baseline is recoverable in `baseline-source/`; later candidate source snapshots are beside their reports. Early candidates retain images/parameters/reasons, but do not all have complete intermediate source snapshots—this limitation is explicit.

Experimental findings, not globally approved artistic rules:

1. Preserving albedo hue/detail is necessary; reducing every surface to luminance times olive pigment destroys material layering.
2. Ground and rock/low-bank material continuity is stronger than separate triangle caps or repeated decorative stamps.
3. Persistent canopy shelter can guide moss independently of sun direction. A 16,384-pixel CPU check found **zero changed moisture/shelter pixels**, while projected illumination changed for 10,446 pixels. [Evidence](time-independence.json)
4. Fixed instance counts do not guarantee coverage: threshold sampling can starve the foreground. Composition and physical bounds require rendered checks.
5. Source-based optical scores suggest experiments; actual images decide retention.

No trained model exists. Human feedback and agent findings remain separate in the existing Lab.

## Assets, ecology and lighting states

Four experimental base-color assets were generated through the built-in `image_gen` tool, saved under `public/assets/wave2-autonomous/`: boreal floor, temperate floor, tundra floor and forest moss. Actual dimensions are **1254×1254**, not the requested 2048. [Prompts](asset-prompts.json) · [moss prompt](moss-prompt.json) · [texture audit](texture-audit.json).

Saved files: `boreal-floor-v1.png`, `temperate-floor-v1.png`, `tundra-floor-v1.png`, `forest-moss-v1.png` in that directory.

Actual textures and 3×3 repeated previews were inspected. No conspicuous hard seams were observed at preview scale; this is not a claim of pixel-identical opposite edges or production texture approval. Source artwork retains some micro-shading, repetition and style limitations. World fields organize larger communities separately from repeated texture detail.

Regional source taxa, seeds and ecological data are preserved. Understory forms remain unnamed where the catalogue lacks verified nonwoody evidence. Iceland stays birch woodland; sparse Arctic habitat is not forced into lush heath; RockIce is excluded. Moss/soil fields are synthetic, not measured local geography. No mountains, water, flowers or named species were invented to match the concepts.

Seasonal pigment, weather and time of day are separate reference states. The implementation does not add a phenology model or weather simulator. Distant temperate foliage uses a fixed studio-light bake approximation, not live physical sunlight; that limitation is recorded in scene metadata.

## Validation and cost

- Development seeds **29, 41, 73**; fresh holdouts **8553620 boreal, 7056763 temperate, 5554973 tundra**. The first boreal holdout **2472814** belongs to the rejected pre-repair distribution and remains preserved. Inspection repair was diagnosed from development seed29, then boreal was refrozen and given a new unseen holdout. Temperate/tundra were not tuned against their holdouts.
- Regional cases: Canadian/Siberian boreal, Iceland birch edge, Appalachia, East Asia, Siberian tundra and Svalbard. Same-family terrain remains synthetic and often similar; these tests do not establish geographic visual fidelity.
- Matched primary comparisons preserve seed29, camera, aspect, tone mapping and exposure. Lighting/material changes are intentional recorded treatments. Hero captures use 640×427; inspection uses the same recorded camera as the previous checkpoint.
- Pure composition/unchanged source-data checks, routing guards and targeted TypeScript pass. Renderer errors are checked in capture reports. No full lint/build suite or mobile-device audit was performed.
- All **13 protected views across the seven approved environments are pixel-identical**. Conservative rock/fern bounds show no staging overlaps in the final validation set; this is not a complete character collision engine or playable traversal test.

| Seed29 hero | Draw calls before → after | Triangles before → after | Main presentation counts |
| --- | --- | --- | --- |
| Boreal | 11 → 15 | 797,220 → 691,432 | 48 trees, 420 distant forms, 24 weathered stones; roots/low banks/shoots batched |
| Temperate | 10 → 12 | 711,028 → 721,818 | 48 trees, 320 source cards, 8,753 litter leaves, 260 fern forms, 35 stones |
| Tundra | 13 → 16 | 466,016 → 1,040,908 | 0 trees; 1,050 near + 1,550 middle branchlet clumps, 64 stones, 191 sedge/head groups |

Tundra removes alpha-card overdraw but more than doubles triangles; GPU benefit is **not established**. Texture scanning is a lower-bound estimate because compile-injected samplers and render targets are not fully enumerated. Each new 1254-square albedo is approximately 8 MiB as uncompressed RGBA with mipmaps. Raw software CPU submission timings are available; they are not mobile frame-rate approval.

[Structured validation](validation.json) · [source freeze](freeze.json) · [first freeze / rejected moss distribution](freeze-before-inspection-repair.json)

## Preview

Use the existing local server on port3001, or `npm run dev -- --port 3001` if stopped:

- [Boreal seed29](http://localhost:3001/explore?lat=66.5&lon=26&habitat=forest&expansion=boreal&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)
- [Temperate seed29](http://localhost:3001/explore?lat=50.5&lon=10.5&habitat=forest&expansion=temperate&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)
- [Tundra seed29](http://localhost:3001/explore?lat=69&lon=-150&habitat=forest&expansion=tundra&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)

Use existing inspection/orbit controls for the secondary view. Do not promote these experimental recipes globally based on this report.
