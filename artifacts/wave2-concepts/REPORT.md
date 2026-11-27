# Wave 2: concept-led implementation checkpoint

**Retained for review; the concepts' artistic quality has not been reached.** Boreal enclosure improved substantially and temperate now has an interconnected canopy. Tundra has richer continuous coverage but exposes a failed crossed-mat construction. Three correction rounds are exhausted. The seven protected environments remain unchanged. No commit, push, deployment or global promotion occurred.

## Look at the actual result

![Supplied concept / actual retained render](retained-concept-comparison.png)

[Rejected structural start → retained render](structure-to-retained.png) · [Hero seeds and holdouts](hero-seeds.png) · [Inspection views](inspection-seeds.png) · [Regional cases](regional.png) · [Thumbnail evaluation](retained-thumbnails.png)

The references are the **top-row concepts** in the user-supplied sheet. Its bottom row labeled “Result” is reference artwork, never a Wildloom capture. The comparison above uses actual WebGL screenshots on the right. Root inspected the reference, intermediate captures, final hero/inspection sheets and regional views using image-content interpretation. Each workstream agent also inspected its captures and supplied critiques. These are agent reviews, not human approval; the workstream implementers were not independent aesthetic reviewers.

### What visibly changed, and what remains wrong

| Biome | Demonstrated improvement | Highest remaining defects | Decision |
| --- | --- | --- | --- |
| Boreal | Rolled, textured branch-attached lobes finally have vertical mass at eye level. Connected crowns and closer middle trees replace the original skeletal stand. | **Major:** flat, speckled olive floor instead of moss/duff/roots; simple faceted rocks and pole-like trunks; weak warm focal pools. Inspection exposes finite stand/continuation gaps. | Retain C3 as the strongest structural prototype. Below concept target. |
| Temperate | Interconnected broadleaf canopy and near understory enclose an opening; leaf litter is smaller and less distracting. | **Major:** uniform green foliage, mechanical branching/bark, weak focal sunlight and insufficient forest-floor layering. Inspection reveals the compact stand surrounded by an open plane. | Retain C2 with conservative fern clearance. Reject C3 near-black crown regression and restore the previous best. |
| Tundra | Dedicated heath artwork and shared community fields replace the generic brush geometry; near-black alternating faces were reduced and stones are mineral-neutral. | **Major:** flattened crossed-card stars, ochre-dominant palette, weak terrain form, exposed ground/card transitions and finite detailed cover. Broad mats still fail to read as intricate living heath. | Preserve C3 as technical evidence; reject it as concept-quality. Do not density-tune the failed construction. |

At thumbnail size the forest enclosure gains survive. At normal/detail scale, repeated geometry, flat material values and the tundra mat intersections remain obvious. The elevated images are particularly important negative evidence: these are not yet robust, endless forests or finished tundra landscapes. Additional counts or passing tests cannot approve them.

## Implementation

The accepted [construction plans](../../visual-lab/global-expansion/CONCEPT-CONSTRUCTION-PLANS.md) were implemented in three isolated parallel workstreams, coordinated around one shared opt-in base adapter. The [human acceptance record](acceptance.json) authorizes the plan and implementation; it does not label new images approved.

Runtime files:

- `src/lib/forest/wave2-boreal.ts` and new `wave2-boreal-geometry.ts`: source-linked genus-conditional conifer scaffolds, attached textured boughs, low moss/heath and embedded stones. Supporting branches remain in data for inspection; selected branch drawing is suppressed to avoid dominant naked spokes.
- `src/lib/forest/wave2-temperate.ts` and new `wave2-temperate-concept.ts`: birch/oak/beech-conditioned branching hypotheses, branch-owned leaf groups, connected stand, litter and fern-like functional forms. The lighting hook is instrumented but artistically inconclusive.
- `src/lib/forest/wave2-tundra.ts` and new `wave2-tundra-heath.ts`: treeless warped community fields, mineral substrate, dedicated alpha-masked heath batches and sparse seed-head forms. Rejected opaque leaf geometry remains unused historical prototype code, not runtime vegetation.
- `src/lib/forest/wave2-shared.ts`: optional concept substrate and continuation controls. Previous calls retain their behavior; the seven developed environments never enter this opt-in adapter. No broad renderer rewrite or new UI was introduced.

Plain deterministic plans retain seeds, relief and cameras independently of Three.js; generators and renderer adapters remain local prototype code. This is not a finished portable global recipe resolver. Synthetic shelter, moisture, substrate and terrain fields are declared as artistic fields, not measured geography. Geographic terrain data has not been added.

### Ecology and independent states

Regional source candidates and individual seeds are retained; composition does not mutate canonical ecological source recipes. Existing presentation ID suffixes preserve the canonical inspection-index mapping. No end-to-end tap/picking UI test was performed in this pass.

Finland boreal uses eligible regional spruce/pine candidates, not re-labeled Douglas architecture. The Iceland edge remains `Betula pubescens` candidate woodland rather than forced spruce. Central European temperate candidates include oak, beech and birch; East Asian and Appalachian cases use their own resolver output. These are **regional candidates, not verified local occurrence or population proportions**. No botanical validation is implied by a plausible silhouette.

Nonwoody regional catalogue evidence is still missing. Moss, ferns, heath, lichens and pale heads remain unnamed functional studies. Spruce-like artwork reused across needle families does not verify pine/larch anatomy. Sparse Svalbard retains lower cover and mineral substrate; RockIce remains excluded. Red/gold tundra pigmentation is a reference seasonal state, not a year-round biome assertion.

Season, weather and time-of-day are recorded separately from biome identity. The implementation supplies one warm reference lighting/pigment state; it does **not** add a weather simulator, seasonal phenology model or complete time-of-day control layer.

### Generated artwork

The built-in `image_gen` tool produced two experimental assets:

- `public/assets/wave2-concepts/spruce-sprays-v2.png`
- `public/assets/wave2-concepts/heath-mats-v1.png`

Actual resolution is **1254×1254**, despite a 2048 request. Both have alpha ranging 0–255 and were inspected as images and in scenes. Padding is less than requested and narrow colored fringes remain, restrained through alpha testing; neither is asserted production-ready. Spruce v1 retained a white background with alpha 191–249 and was rejected, moved to `rejected-assets/`, and never used in a rendered candidate. The alpha-corrected spruce edit and heath artwork are experimental assets, not environment screenshots. [Exact prompts, tool mode, outputs and limitations](asset-prompts.json).

## Iteration decisions

| Round | Boreal | Temperate | Tundra |
| --- | --- | --- | --- |
| Initial structure | Reject skeletal stand, black tiny moss marks and exposed horizon. | Reject thin disconnected foliage and empty floor. | Reject isolated flecks on olive plane. |
| C1 | Reject broad opaque shelves. Fixing moss's multiplied pigments exposed a worse flat-spray representation. | Retain structural improvement: lower supported crowns, closer layered stand and near understory. | Reject enlarged opaque leaves: slab-like field and repeated striping. |
| C2 | Alpha atlas restores needle detail, but horizontal patches remain edge-on and skeletal. Revise representation. | Retain smaller litter. Selective lighting hook provides little demonstrated improvement. | Dedicated atlas improves coverage, but dark angular faces and crossed-plane construction fail. |
| C3 | Retain rolled lobes and closer middle stand; reduce expensive moss tessellation. | Reject radial/underside normals that crush foliage into near-black masses; restore C2 and retain fern clearance. | Retain reduction of dark faces/mineral rock hue; crossed brush-star representation still fails artistic gate. |

All rendered stages remain in their named directories. [Frozen source copies and hashes](freeze.json) preserve the retained source, while earlier R1–R4 experiments remain in `artifacts/wave2/`. No failed outcome is promoted to a shared artistic rule.

## Reproduction, cameras and tests

Use the existing server at port 3001, or `npm run dev -- --port 3001` if stopped:

- [Boreal](http://localhost:3001/explore?lat=66.5&lon=26&habitat=forest&expansion=boreal&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)
- [Temperate woodland](http://localhost:3001/explore?lat=50.5&lon=10.5&habitat=forest&expansion=temperate&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)
- [Tundra](http://localhost:3001/explore?lat=69&lon=-150&habitat=forest&expansion=tundra&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)

Hero cameras remain 1.7 m above their terrain. Captures use 640×427 (approximately the concept panel aspect), vertical FOV 47°, and recorded world targets. Framing is concept-led and approximately fitted, **not a uniquely recovered physical camera or exact object-layout reconstruction**. Tundra C3 lowers the target to move the horizon toward the concept; its C2→C3 comparison therefore changes camera aim. The initial R4 historical images also have different cameras and aspect; performance comparisons below are not image A/B claims.

`capture.cjs` reuses the existing visual probe and one browser per batch, with hero/inspection transitions on the same scene. `review.cjs` makes concept comparisons, thumbnails and display-RGB diagnostics. `validate.cjs` runs recorded holdout/regional sets. `finish.cjs` assembles sheets, checks source hashes and compares protected pixels. No new review framework or dependencies were added.

- Development seeds: **29, 41, 73**. Fresh holdouts chosen only after source freeze: **810951 boreal, 940218 temperate, 428445 tundra**. No artistic source changes after reveal.
- Seven additional seed-41 regional cases: Canada, Siberian boreal, Iceland birch edge, Appalachia, East Asia, Siberian tundra and Svalbard. Similar same-family landforms remain a generalization limitation; eligibility variation is not geographic terrain reconstruction.
- 38 retained/development/holdout/regional hero+inspection captures have zero recorded render errors. Intermediate failures and negative evidence are preserved separately.
- Pure composition checks pass deterministic same-input identity/placement and unchanged full canonical source data, plus wrong-biome/unknown/RockIce guards. Separate repeat-render pixel reproduction results are recorded alongside validation.
- A conservative transformed-bounds detector found **no rock/fern overlap** with the proposed 0.45 m staging footprint in the captured development, holdout and regional cases. This checks actual dressing geometry bounds rather than only empty pixels. It is not a complete character capsule/triangle collision test, slope traversal test or playable-character validation; low cover is intentionally traversable.
- **All 13 protected views across seven environments are pixel-identical** to retained baselines. Puget hero; savanna/rainforest/alpine/desert/mangrove/flooded hero+inspection. Existing protected artistic limitations were not silently changed.
- Targeted `npx tsc --noEmit` passes. No full build, full lint suite, cross-browser audit or mobile device test was run.

[Structured validation and performance](validation.json) · [Composition checks](data-checks.json) · [Diagnostic color/edge findings](retained-objective.json)

## Cost

Seed29 warmed counters; R4 is the rejected previous prototype, not an approved aesthetic baseline. Camera/geometry/light arrangements changed. Calls count submissions, not frame rate.

| Biome | Calls R4 → retained | Submitted triangles R4 → retained | Detailed source-linked tree occurrences | Other instances |
| --- | --- | --- | --- | --- |
| Boreal | 11 → 11 | 587,412 → 797,220 | 48 | 420 far bough forms; 3,100 moss cushions; 2,400 low leaves; 96 stones |
| Temperate | 12 → 10 | 486,432 → 711,028 | 48 | 8,753 litter leaves; 260 fern forms; 35 stones |
| Tundra | 7 → 13 | 280,248 → 466,016 | 0 | 6,200 heath mats; 62 stones; 171 stalks and 171 heads |

Visible texture-object RGBA+mipmap estimates: approximately **38.4 MiB boreal, 31.4 MiB temperate, 24.0 MiB tundra**. These exclude hidden targets, shadow maps, some allocations and actual driver compression. Alpha overdraw is unmeasured and may be significant for overlapping bough/heath cards. Raw software WebGL CPU submission timings are available in capture reports; they are not mobile/GPU performance approval. Higher triangle cost has not yet earned concept-level visual quality.

## Evidence-backed learning and next decision

Experimentally supported locally: branch-attached rolled lobes supply visible conifer mass where horizontal planes fail; connected crown envelopes and layered middle trees establish woodland enclosure; alpha validation must precede asset integration; green vertex pigment multiplied by green instance pigment can cause near-black linear-space values. These are findings with provenance, not globally approved recipes.

Rejected/inconclusive: opaque shelf foliage, horizontal edge-on conifer cards, enlarged flat heath leaves, compressed crossed heath mats, and radial normals without a compatible fill/translucency response. The temperate sunlight hook compiled for two actual-sun materials but did not provide the intended visual hierarchy. Successful compilation does not validate that artistic hypothesis.

Recommended next investment: **boreal/temperate living-floor and illumination representation**, with layered moss/duff/rock material and supported crown shadow/translucency diagnostics; retain the enclosure gains. Tundra needs a distinct branchlet-supported shrub or proper-volume mat prototype before any density/material polishing. Elevated-view continuation also requires deliberate development. A larger continuation is an art-direction checkpoint, not permission to reset this session's three-round budget. The current result is useful learning and structural progress; the user's beauty/concept-fidelity goal remains unresolved.
