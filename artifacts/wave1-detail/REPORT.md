# Wave1 environmental detail checkpoint

The retained field layouts are developed further, without returning to canals or changing the protected scenes. **There is visible progress, especially water visibility and wetland framing, but these scenes still do not meet the concept quality bar.** Retained provisionally for review; no global/default promotion, commit, push or deployment.

![Concept / developed hero / elevated view](concepts.png)

## Review and previews

- [Structural before / developed after](before-after.png), [three seeds](seeds.png), [elevated views](inspections.png), [thumbnail scale](thumbnails.png), [character proxy](staging.png). Wet cameras were deliberately reselected; this is not a same-camera isolated material A/B. Desert camera remains unchanged; sky seam orientation differs.
- [Desert local preview](http://localhost:3001/explore?lat=34&lon=-116.15&habitat=forest&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&wave1=desert&fieldStudy=rebuild)
- [Mangrove local preview](http://localhost:3001/explore?lat=25.2&lon=-80.9&habitat=coastal&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&wave1=mangrove&fieldStudy=rebuild)
- [Flooded local preview](http://localhost:3001/explore?lat=26.209957419&lon=-80.9383825925&habitat=wetland&conditional=1&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&wave1=flooded&fieldStudy=rebuild)

Change seed to41 or1237 and orbit using existing controls. Append stagingDebug=1 for the temporary capsule. Omit fieldStudy=rebuild for the prior Wave1 fallback; wave1=baseline preserves the generic renderer.

## Actual visual assessment

Vision interpretation is available and used. Root inspected the final concept, seed, elevated, before/after and water-diagnostic sheets. An independent critique-only agent inspected12 images atR5; its [review](independent-review.json) is separate from implementation and does not cover later changes. Agent retention is not human approval.

### desert

Retain material development provisionally; reject as final reference-quality scene. Better than structural baseline: yes. Good enough to approve: no.

- **major:** Hero views retain a dominant almost bare sand foreground. Eight shrubs remain tiny at this camera; the concept has readable intermediate-scale plants at rock bases. Technical hypothesis: Scale and silhouette construction, rather than plant count, remain inadequate. Next: Develop one readable low branching shrub silhouette around existing rock flanks; do not add an arbitrary dense blanket.
- **major:** Large rocks still read as broad regular blocks; surface fractures improve texture more than silhouette. Technical hypothesis: Bevelled box joint construction cannot supply convincing multi-scale geological masses alone. Next: Test a fractured multi-block rock construction in isolation before integrating it.

### mangrove

Retain visible water, sediment and juvenile pockets for continued development. Better than structural baseline: yes. Good enough to approve: no.

- **major:** All hero seeds retain a broad smooth brown approach and a clean soil-water edge; foreground detail is weaker than concept wet litter/root transitions. Technical hypothesis: Shallow transmission uses analytic sediment rather than the terrain albedo; shoreline-scale material and cover transitions remain insufficient. Next: Coordinate actual substrate detail with shallow transmission and place low litter/seedling patches along existing wetness contours.
- **major:** Separate crowns and thin root lines leave large sky gaps, especially seed29. Concept crowns and roots interlock into layered framing. Technical hypothesis: Existing near-tree architecture and crown grouping need a representation-level test. Next: Retain layouts and species resolver; compare crown/root mass connectivity on one fixed source tree.
- **minor:** Inspection water retains fine regular ripple bands and the distant horizon separates into pale horizontal layers. Technical hypothesis: Analytic ripple periodicity and terrain/sky/fog transition remain visible. Next: Test multi-scale ripple normals and far-field blend independently.

### flooded

Retain the more legible wetland; do not approve grass representation as final. Better than structural baseline: yes. Good enough to approve: no.

- **major:** Side grass shows repeated radial fans and wide angular/sword-like faces; concept grass has flowing soft overlapping silhouettes. Technical hypothesis: One repeated ribbon clump and large near scaling limit silhouette variety. Next: Prototype a small set of asymmetric clump constructions using the shared pigment field, rather than increasing density.
- **major:** Inspection reveals sparsely dressed islands; holdout1237 retains a broad calm foreground and a comparatively thin middle-distance water opening. Technical hypothesis: Local cover and camera scoring do not yet balance projected water, vegetation occlusion and staging together. Next: Next experiment should score actual projected occupied water and connected short-cover masses; do not tune this frozen holdout.
- **minor:** Water margins remain sharp and fine periodic ripples are visible from inspection. Technical hypothesis: Analytic water substrate lacks local sediment/plant detail. Next: Reuse the mangrove shallow-substrate investigation, without green tint.

## Water and staging evidence

| View | Water/full frame | Water/lower half | Water/middle band | Dry approach minimum | Prop AABB / root hits |
|---|---:|---:|---:|---:|---:|
| mangrove 29 | 9.9% | 19.5% | 31.9% | 0.261m | 0 / 0 |
| flooded 29 | 4.5% | 8.5% | 14.0% | 0.148m | 0 / 0 |
| mangrove 41 | 10.1% | 19.7% | 31.2% | 0.167m | 0 / 0 |
| flooded 41 | 7.0% | 13.2% | 21.7% | 0.137m | 0 / 0 |
| mangrove 1237 | 11.5% | 22.5% | 36.7% | 0.261m | 0 / 0 |
| flooded 1237 | 8.2% | 15.5% | 25.4% | 0.074m | 0 / 0 |

Water pixels are semantic visible-geometry masks at640×360, including terrain/vegetation occlusion. Middle band is rows180–289. These are not the earlier terrain-only cone percentages. The same old cone audit improves flooded29 from3.1% to49.3%,41 from3.7% to54.7%; **it is a proxy, not an aesthetic target or actual screen coverage**. [Full audits](field-checks.json). Holdout1237 cone visibility is13.4% for flooded, revealing remaining robustness weakness; actual image still shows a pool across the middle.

All nine staging diagnostics have positive sampled terrain height and zero conservative root/prop intersections. Grass in the swept approach is at most0.030m. Capsule radius.35m,height1.7m, short approach2.8–6.2m and radius.85m. This is a source-segment/static-AABB/height audit with an actual rendered proxy, **not a character physics or navigation simulation**. No terrain was raised for staging.

[Water controls](water-qa.png) show both biomes with plain blue sky/no vegetation, cloud sky/no vegetation, actual vegetation, shallow sediment, and stronger ripples. Blue/cloud/green reflections change with the reflected environment rather than a biome tint. Shallow views remain muted brown but lack real bottom texture/refraction. Static hidden-object controls retain existing ground shadow maps; only reflection color is being isolated. Wind-driven distortion is visible, but inspection still exposes periodic structure. No physical water validation is claimed.

## Implementation and major parameters

Runtime files changed in this detail pass: `wave1-fields.ts`, `wave1-rebuild.ts`, `wave1-water.ts`, `wave1-impostors.ts`, and the isolated `wave1-{desert,mangrove,meadow,ground}-detail.ts` helpers under [src/lib/forest](../../src/lib/forest). Shared integration is limited to `environment-foundations.ts` and `painted-renderer.ts`. The new albedo is under [public/assets/wave1-detail](../../public/assets/wave1-detail); targeted checks are in [wave1-detail.test.ts](../../tests/wave1-detail.test.ts). Earlier Wave1 dispatcher/ecology changes remain part of the existing uncommitted baseline, not newly invented detail-pass ecology. Lab records and capture scripts are linked below; exact runtime source hashes are in the freeze manifest.

- **fields/rebuild adapter:** same domain-warped topology; small wetland datum adjustment, dry-margin camera objective with middle/side water weighting. Smooth low-cover height falloff rather than an empty circular pad. Existing tree source identities/seeds retained. Mangrove95 and conditional flooded24 presentation tree occurrences; no population survey claim.
- **desert helper:** connected mineral plates, chipped joint steps, triplanar material, contact gravel and up to8 low branching unnamed xeric forms replacing the same number of dry-fibre instances. Existing225 rock transforms and open horizon retained; no mountains.
- **mangrove helper/ground:** four instanced batches for juvenile leaves/stems, litter and twigs; moisture/root-associated pockets and visible side anchors. Independently generated mud/litter asset, actual1254×1254, sRGB, mipmaps, anisotropy4, world repeat3.6m. [3×3 preview](tidal-mud-3x3.png); not a cropped concept or claimed2K asset.
- **meadow helper:** opaque curved/folded ribbons,180tri near versus30tri distant, sparse16tri seedheads; connected near swaths plus short-cover community. Shared field-derived pigment, diffuse-only directional thin-leaf response, tree-shadow reception with blade shadow casting disabled.
- **water:** original environment reflector/Fresnel/attenuation retained, centered near depth texture .625m/texel versus8.59m distant, irregular ripple phase and restrained reflection filtering. Analytic sediment transmission, no true refraction/fluid simulation.
- **shared foliage:** optional field-study atmospheric range120–650m with50% blend; default shader/cache behavior preserved. Attention anchors use actual encounter plan. Camera-facing continuation removes edge-on inspection card lines. Existing sky matte reused; mirrored repeat rejected.

Ecology remains distinct from presentation: mangrove named source is a regional candidate, not verified local occurrence. Flooded wooded patches are conditional unnamed growth forms, scientificName:null. Juvenile/desert forms are explicitly unnamed placeholders. Season, weather and time-of-day remain separate recorded layers, not asserted dynamic simulations.

## Performance

Seed29 steady-state submitted work, including nested planar-reflection passes:

| Biome | Calls before → after | Triangles before → after | Presentation trees | Total instanced elements | Reported completed-render median ms |
|---|---:|---:|---:|---:|---:|
| desert | 7 → 11 | 469,088 → 564,028 | 0 | 3,181 | 0.30 |
| mangrove | 15 → 23 | 2,813,502 → 2,546,486 | 95 | 3,461 | 1.00 |
| flooded | 15 → 21 | 2,737,490 → 2,182,574 | 24 | 14,274 | 1.00 |

Instanced totals include leaf/litter/card elements, not plant population counts. Mangrove29:650 continuation cards,209 juvenile stems,1026 leaves,1532 litter pieces,44 twigs. Flooded29:2310 near clumps,11841 low/far clumps,100 continuation cards,23 seedhead accents. Desert29:225 rocks,2706 contact chips,8 shrubs,242 dry fibres. Full per-seed counts and triangle costs are in [validation.json](validation.json).

Timing uses three warmed render/gl.finish wall-clock samples in headless ANGLE/SwiftShader; these reported API durations are not device frame-rate guarantees. Baseline timings were CPU submission only and are not comparable. No mobile performance approval. Near/far terrain partition reduces submitted triangles in wetlands despite added dressing. Desert adds about20% triangles and4calls for material/detail benefit; not a free change. Water reflection RT512×256; far source atlas1024². New mud albedo is about8.0MiB decoded RGBA+mips, mineral map about1.3MiB. Total texture residency/alpha overdraw not measured; opaque grass adds no alpha-card overdraw, existing foliage/cards still do.

## Validation, preservation and provenance

-18 final640×360 views: three biomes × training seeds29/41 + frozen unseen1237 × hero/inspection. Recipe frozen before holdout; no runtime source edits afterward. [Freeze and hashes](freeze.json). Source snapshots retain the baseline and final state.
- Actual final screenshots inspected; no1920 renders generated for unapproved scenes. No page/shader errors in the nine captures. Flooded41 near-black grass mask falls16.0%→0%; flooded29 still has3.7% overlap under real tree shade, recorded rather than concealed.
- Seven protected captures are pixel-identical: Puget hero, rainforest/savanna/alpine hero and inspection. [Regression results](regression.json); later edits are isolated field-study helpers.
- npx tsc --noEmit passed;14 targeted detail/fields/dispatch/mangrove/flooded tests passed; git diff --check passed with line-ending warnings. Full build/suite, mobile and physics testing not run.
- [Lab session and demonstrated/rejected rules](../../visual-lab/wave1/detail-session.json), [independent R5 critique](independent-review.json), [capture script](validate.cjs), [water diagnostics](water-qa.cjs). Generated asset provenance and actual dimensions recorded; reference rights remain unverified/private.

## Retained and rejected learning

- **R1: revise.** Water increases, but rock micro-normal peppering and weak occupancy remain.
- **R2: mixed.** Pepper correction retained. Mirrored sky produces obvious cloud symmetry and is rejected.
- **R3: revise.** Water/juvenile silhouettes improve. Foreground cover remains weak; no layout restart.
- **R4: mixed.** Wetland occupancy improves. Gray desert basin and diagonal zebra bands rejected.
- **R5: retain provisionally.** Meaningful material/foreground improvement; independent reviewer still rejects final approval.
- **R6: retain provisionally.** Intermediate desert detail and grass dimensionality improve, but silhouettes still below target.
- **R7 and diagnostics: retain provisionally.** Edge-on inspection card lines fixed. Seed41 near-black grass decreases from16.0% to0% in the same semantic mask. Seed29 retains3.7% near-black overlap under actual tree shade. Final wet darkening is applied after generated albedo.

Only supported findings are labelled experimentally-supported. Mirrored sky repetition and striped/gray desert sediment remain negative examples. No human preference or human-approved best pointer was fabricated. Latest user approval concerns structural layouts for further development only; historical rejection records remain intact.

## Next review

Retain this source checkpoint while reviewing the images. Recommend prioritizing shoreline-to-substrate integration and a less repetitive grass construction, then a proper fractured-rock silhouette prototype. The current desert in particular remains below the requested environmental richness; adding numerical detail has not solved that artistic gap. No Wave2 or global recipe adoption.
