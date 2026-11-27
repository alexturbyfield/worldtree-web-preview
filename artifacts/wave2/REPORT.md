# Wave 2 — first review checkpoint

Status: runnable, opt-in experimental prototypes. **Not artistically approved; not globally promoted.** The user's “Yes” authorized the selected boreal, temperate woodland and tundra workstreams, not approval of these new images. No commit, push or deployment was performed.

## Actual visual result

Root inspected the rendered images with image-content interpretation, including references, intermediate hero views, development/holdout hero and inspection sheets, regional views and sparse Svalbard. This was agent review, not an independent reviewer or human approval. Captures, metadata and pixel comparisons are separate evidence. The images show improvement over the generic renderer, but do not meet the desired painterly quality.

![Same-camera generic baseline / prototype comparison](comparison.png)

[Real references versus prototype](references.png) · [Development and holdout hero views](hero-seeds.png) · [Inspection views](inspection-seeds.png) · [Regional views](regional.png)

### Highest-priority defects

| Scene | Visible evidence | Severity | Cause / next experiment |
| --- | --- | --- | --- |
| All three | Inspection views expose rounded cellular pigment fields and coarse repeated low-cover shapes. | Major | Confirmed analytic fields and shared brush representation; replace their visual construction in a new bounded ground-first experiment rather than add instances. |
| Boreal | Recognizable enclosed conifer stand, but large angular foliage sprays and weak selective sunlight flatten the floor. | Major | Existing fallback foliage geometry is confirmed; lighting contribution is a hypothesis requiring a material diagnostic. Preserve this as the strongest technical prototype only. |
| Temperate | Park-like spacing, thin birches and disconnected floor dressing; crowns lack forest enclosure. | Major | Source-derived crown fallbacks and occurrence composition need a representation/composition experiment. Do not assume higher density solves it. |
| Tundra | Flat olive field, pasted-looking cover and simple rocks; sparse Svalbard is especially barren. | Major | Reusing savanna brush geometry does not establish moss/heath structure. Develop continuous low vegetation and substrate together. |
| Regional tests | Canada/Siberia conifers share much visual structure despite different candidate identities. | Major | Generic visual fallbacks and family/seed terrain fields are confirmed; regional eligibility is not geographic visual generalization. |

The three correction rounds are exhausted. R4 is retained for inspection and source recovery, not accepted as a successful artistic outcome. No full-resolution final validation was generated because the artistic gate failed. Do not silently tune against the now-revealed holdouts.

## Implementation and scope

New `src/lib/forest/wave2-shared.ts` supplies deterministic, engine-neutral synthetic plans/fields plus an existing-renderer adapter. Three small adapters (`wave2-boreal.ts`, `wave2-temperate.ts`, `wave2-tundra.ts`) define their palettes and composition. `wave1.ts` selects them only through an explicit expansion query matching actual RESOLVE metadata. RockIce, missing metadata and wrong-biome requests retain the fallback.

Existing source trees are reused as presentation occurrences with original species identities/seeds. Boreal admits regional catalogue conifer/birch/poplar candidates; Iceland's birch edge remains birch-only. Temperate uses eligible broadleaf candidates; tundra has no trees. These are **regional candidates, not verified local flora**. Generic Douglas/birch visual templates are explicitly labeled approximations; low plants are unnamed functional forms. Ecological source recipes are not mutated.

The adapter reuses existing grass assets, ground textures, sky, instancing, materials and forest-card bake. `wave1-impostors.ts` adds an optional override without changing its previous defaults. `painted-renderer.ts` maps repeated presentation picks to canonical source indices only for the new studies. That post-freeze callback correction changes no artistic parameters; it has a targeted type check, not an end-to-end inspection-picking UI test.

Near/mid/far terrain continuation is synthetic and low-relief. No geographic mountains, lakes, snow or named nonwoody species were invented. Terrain is currently family/seed-driven, not derived from measured regional elevation/hydrology. Season, weather and time are separate reference-state metadata, not completed simulations or a production global resolver.

## Reproduction

Use the existing dev server on port 3001, or `npm run dev -- --port 3001` if stopped.

- [Boreal seed 29](http://localhost:3001/explore?lat=66.5&lon=26&habitat=forest&expansion=boreal&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)
- [Temperate seed 29](http://localhost:3001/explore?lat=50.5&lon=10.5&habitat=forest&expansion=temperate&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)
- [Tundra seed 29](http://localhost:3001/explore?lat=69&lon=-150&habitat=forest&expansion=tundra&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)

Existing inspection/orbit remains available. The screenshot harness uses the recorded fixed inspection camera; the app's inspection preset is functional but differs from that capture camera. `capture.cjs` stores exact cameras/render settings and reuses pages for hero/inspection. Review tier is 640×360; use `WIDTH` for detailed captures only when warranted. `review.cjs` rebuilds comparison sheets and structured validation from the captures; `data-checks.cjs` checks pure composition invariants.

Recoverable pre-edit source: `baseline-source/src/` (text copies). Frozen artistic source hashes and post-freeze correction: [freeze.json](freeze.json). All historical R1–R4 renders remain; the pre-existing uncommitted work was preserved.

## Tests and generalization

- Development seeds 29, 41, 73; frozen holdouts boreal 20717, temperate 23819, tundra 26123. No artistic changes followed holdout generation.
- Additional seed-41 coordinates: Canada, Siberia, Iceland birch edge, Appalachia, East Asia, Siberian tundra and Svalbard. Full configurations are in `regional.cjs` and per-frame reports.
- 62 captures, zero recorded page/shader/asset errors. Deterministic same-input composition and unchanged source data checks passed; incorrect routing and RockIce guards passed.
- **13 protected views across all seven developed environments are pixel-identical** to their retained baselines: Puget hero, and hero/inspection for savanna, rainforest, alpine, desert, mangrove and flooded grassland. [Regression details](regression.json)
- `npx tsc --noEmit` and `git diff --check` passed (existing line-ending warnings only). No full build, lint suite, cross-browser audit or mobile-device test was run.

## Rendering cost

Seed 29 hero, matched camera, warmed renderer counters. Generic before is the existing fallback, not an approved artistic target.

| Scene | Calls before → after | Submitted triangles before → after | Tree occurrences | Instanced supporting elements |
| --- | --- | --- | --- | --- |
| Boreal | 7 → 11 | 223,146 → 587,412 | 48 | 480 distant conifers, 2,100 low cover, 39 stones, 280 low foliage |
| Temperate | 8 → 12 | 250,558 → 486,432 | 34 | 600 source-baked cards, 2,100 low cover, 52 stones, 280 low foliage |
| Tundra | 2 → 7 | 2,060 → 280,248 | 0 | 3,600 low cover, 42 stones, 309 low foliage |

These increases are significant relative to the visual benefit, especially tundra. Raw per-frame CPU submission timings are in the capture reports; software WebGL submission is not GPU frame time or mobile approval. Alpha overdraw is not measured. Texture memory, including dynamic foliage and reflection/shadow targets, is not comprehensively instrumented. No mobile performance claim is made.

## Learning and next step

References and licenses are in the existing Lab manifest and [reference analysis](../../visual-lab/global-expansion/reference-analysis.json); no new art bible or training model was created. Public-domain photos guide principles, not asserted local species or terrain. Root used actual image inspection; delegated reference gathering stopped at a usage cap and did not complete parallel implementation.

The useful reusable result is guarded ecological routing, unchanged source data, deterministic presentation plans and regression capture reuse. These are technically supported, not globally approved artistic rules. Reject savanna brush reuse as a sufficient tundra/heath solution and broad cellular pigment fields as a finished forest-floor treatment. Preserve all negative evidence. Next investment should be a focused ground/low-cover representation experiment for tundra, then broadleaf enclosure, rather than extending more biome categories.
