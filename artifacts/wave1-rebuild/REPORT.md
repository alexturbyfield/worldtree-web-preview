# Wave1 composition rebuild — structural gate, not artistic approval

The prototypes use a new spatial construction, not the old canal/outcrop layouts with extra decoration. **They still fail the composition gate and are rejected for default/global adoption.** The main remaining failure is large, underarticulated foreground space and unreliable water visibility. No material-detail pass was used to conceal that failure. Existing Wave1 and generic paths remain fallback comparisons.

![Primary concept / structural hero / inspection](concepts.png)

## Preview the new construction

These are local, opt-in prototypes in the existing renderer. `fieldStudy=rebuild` is required; omitting it retains the previous Wave1 presentation. The actual RESOLVE biome gate still applies.

- [Desert29](http://localhost:3001/explore?lat=34&lon=-116.15&habitat=forest&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&wave1=desert&fieldStudy=rebuild)
- [Mangrove29](http://localhost:3001/explore?lat=25.2&lon=-80.9&habitat=coastal&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&wave1=mangrove&fieldStudy=rebuild)
- [Flooded29, conditional wooded-habitat study](http://localhost:3001/explore?lat=26.209957419&lon=-80.9383825925&habitat=wetland&conditional=1&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&wave1=flooded&fieldStudy=rebuild)

Use41 or997 for the other captured seeds; drag the existing orbit view to inspect. The capture harness also records an elevated camera relative to each selected encounter position. No new UI, commit, push, deployment, Wave2 or global recipe promotion.

## Reference observations before construction

The three user-approved **concept targets** remain primary; that approval does not approve these implementations or establish depicted species presence. Actual images were interpreted with vision, including the prior failed checkpoint.

1. Foreground is a traversable low-detail land surface framed asymmetrically by larger side forms. Its interest comes from contact shadows, small substrate changes and low vegetation, not a uniform bare pad.
2. The middle distance contains interconnected masses and visible negative space: geological shoulders in desert, root/crown/water interlock in mangrove, and horizontal grass/pool mosaics in flooded grassland.
3. Warm key-lit edges and cool shadow interiors organize depth; fine texture supports those larger relationships.

The prior scenes failed at these relationships. The new representation was judged first on space and silhouette; it was not credited simply for adding more geometry.

## What structurally changed

`wave1-fields.ts` is a pure, engine-neutral deterministic field and camera plan. Domain-warped multiscale landform values drive elevation, water depth, substrate, moisture, community suitability and woody/rock eligibility. Fields continue beyond the near mesh and exist independently of the camera. This is synthetic terrain/habitat, not measured geography.

The camera searches existing walkable margins, sampling a4m-wide forward footprint out to8m for dry clearance and restrained relief. It does **not** add a raised camera mask, sandbar or circular clearing. Object placement uses the selected camera for staging/framing exclusions; the world heights remain unchanged. Tests verify that selection does not mutate the field.

`wave1-rebuild.ts` adapts this plan to the existing scene renderer:

- **Desert:** open horizon; connected substrate/outcrop eligibility replaces three fixed rock clusters. New bevelled, uneven joint-plane blocks replace the displaced spherical basis. Sizes are constrained near the camera and the forward view remains open. Sparse low dressing follows field suitability. This is a new geological prototype, **not yet convincing weathered geology**.
- **Mangrove:** source-eligible procedural mangroves are distributed over suitable tidal margins in all directions, not alternating two-row positions beside one channel. Water openings arise from the terrain field. Physical near roots are retained; far source trees are simplified and supplemented with source-derived alpha impostors.
- **Flooded:** shallow pools, drier patches, grass communities and conditional woody patches share the same height/moisture field. The previous broad canal function is not used. Existing curved sedge geometry is reused. Placeholder tree islands/margins occur only in the explicitly enabled conditional study and on drier field values.

`wave1-impostors.ts` bakes four isolated views of an existing procedural source tree once, using the **same renderer**, then instances those silhouettes into the far habitat field. It does not create another tree generator or download fantasy forest imagery. First-bake cost and atlas memory are additional costs; repetition and angle dependence remain limitations.

The shared environment-derived reflection/Fresnel/depth/sediment optics are unchanged. No green/teal water multiplier was restored. Season, weather and time-of-day remain separate fixed study states; synthetic hydrology is not claimed as observed seasonal flooding or tide data.

## Ecology-to-rendering audit and correction

The old resolver description already called BIOME9 a mosaic, but its exposed fallback forms only included open groundcover. `createSceneRecipe` therefore had no conditional wooded form to render. A conditional `riparian_canopy` form is now supplied for flooded grassland. Default species selection remains conservative; active environmental filters still withhold unsupported traits.

Everglades tree islands/hardwood hammocks on slightly elevated ground are supported regionally by [NPS habitat descriptions](https://www.nps.gov/ever/learn/nature/habitats.htm) and [the NPS hardwood-hammock account](https://www.nps.gov/ever/learn/nature/hardwoodhammock.htm). These sources support the **habitat relationship**, not tree presence at the selected coordinate or the generated elevations.

| Evidence class | Representation in this study |
|---|---|
| Documented regional species candidates | Existing mangrove resolver/catalogue candidates, including Florida Rhizophora mangle; local occurrence remains unverified |
| Verified local flora | None newly established. Existing verified ecoregion/habitat associations can take precedence, but are not proof of current point occurrence |
| Unnamed ecological growth forms | Conditional flooded broadleaf/riparian canopy with `scientificName:null`, plus low vegetation forms. The existing broadleaf visual template is a **shape placeholder**, not a claim that its template species is native here |
| Artistic constraints | Synthetic elevation/moisture, camera selection, view exclusions, specimen reuse, stand counts and distant impostors; never botanical observations |

Thus the dominant biome no longer prevents a conditional wooded mosaic, while a concept illustration never inserts unsupported named flora. Source tree inspection indices remain associated with their original recipe individuals; presentation reuses are not abundance records.

## Actual rounds and decisions

![Immediate structural comparisons](rounds.png)

| Round | Visible evidence | Decision |
|---|---|---|
| R1 | Canals disappeared, but mangrove became a sparse lagoon, desert blocks crowded the view, and far fields had weak silhouettes | Reject composition; no material refinement |
| R2 | More framing and surrounding trees, but roots entered staging; mangrove submitted over6m triangles in the default counter and still did not form a convincing continuous forest | Reject full-detail continuation as an adoption candidate |
| R3 | Wider near-object clearance, lighter far models and baked source impostors improve framing/continuation. Initial clipped-stand baking produced rectangular cutoffs; isolated-tree baking corrected that implementation defect | Retain the corrected construction as an opt-in technical experiment; **composition gate still fails** |

Three structural rounds were used. The R3 bake correction repairs the same representation; it is not a new artistic direction. Rejected images/source evidence remain. No further detail was layered onto the failed composition.

## Multi-seed review and diagnosis

[Seed comparisons](seeds.png) · [Elevated views](inspection.png) · [Thumbnail comparison](thumbnails.png) · [Raw captures/statistics](validation.json) · [Field checks](field-checks.json).

Training29/41 and holdout997 were captured at640×360, hero and elevated views. Source was frozen before997 and not tuned afterward.73 was used only for deterministic field tests. Full-resolution/fine-material rendering was not warranted by the failed structural gate. Composite sheets contain the original640px renders, not new1920px validation renders.

- **Desert, major:** new block/joint silhouettes and an open horizon are structurally different, but rock scale rhythm and substrate hierarchy remain weak. Large foregrounds still read as plain ochre ground; the blocks need better geological construction, not a cosmetic noise layer.
- **Mangrove, major:** side roots/crowns and ground shadows frame usable dry space, and far trees continue beyond the old corridor. The space nevertheless reads too dry and open; water pools are too small in some human views and the far forest remains sparse/pale. Impostor repetition/angle limitations are unresolved.
- **Flooded, major:** inspection now shows a true land/water/wooded-patch mosaic, while hero views29/41 read too much like dry parkland. This fails wetland identity despite dry staging and conditional tree support. Grass remains sharp/noisy and areas around it too bare, but material tuning is blocked by the composition failure.

The terrain-only forward-cone audit measures visible-water sample fractions of **3.1% and3.7% for flooded29/41**, versus19.9% for997. Mangrove41 measures8.5%. This supports a specific diagnosis: camera scoring overvalues woody framing/dry margins and samples water too sparsely. **Most sampled water is not terrain-occluded**; the audit does not confirm an occlusion-only explanation. The next high-value correction is image-weighted water/land composition selection and natural low-vegetation transitions, not additional random pools or trees. Metrics remain diagnostics, not artistic approval.

The hard near-vegetation exclusion and coarse substrate also contribute to an overly empty staging appearance. Dry field clearance does not prove attractive staging or guarantee that every root/branch extent is character-safe. Those acceptance items remain open.

## Validation and performance

- TypeScript passed.10 focused ecology/field/dispatcher tests plus the reflection-probe test passed. No full test/build suite was run; the previously known400-vs402 catalogue-count assertion was not changed.
- Dry clearance, field continuity, deterministic variation, no terrain mutation during camera selection, conditional unnamed canopy and RESOLVE gating are tested.
- All18 frozen seed/view captures report no page/shader errors.
- Protected regression: **7/7 pixel-identical**—Puget hero, savanna hero/inspection, rainforest hero/inspection and alpine hero/inspection. See `regression.json`.
- Warm steady-state counters disable `renderer.info.autoReset`, including nested reflection renders. Initial bake work is excluded from steady state. CPU submissions are not GPU completion times or mobile-device approval.

| Seed29 | Draw submissions | Submitted triangles | Presentation instances |
|---|---:|---:|---|
| Desert | 7 | 469,088 | 225 jointed blocks; sparse low vegetation, exact counts in raw metadata |
| Mangrove | 15 | 2,813,502 | 95 source tree presentations with far simplification;650 source impostors; low vegetation |
| Flooded | 15 | 2,737,490 | 24 conditional tree presentations;100 source impostors; field-driven sedges |

These are still substantial costs without demonstrated sufficient artistic benefit. Far grass currently uses excessive geometric detail; the result is **not mobile approved**. Each wet-biome impostor atlas is1024² with render-target attachments, plus the unchanged reflection/depth resources. Texture-object counts and CPU samples are retained, but total GPU texture memory, hardware alpha overdraw and device FPS were not measured.

## Reusable findings and remaining status

**Technically supported, not globally art-approved:** engine-neutral terrain-first fields; selecting an existing walkable margin rather than deforming it toward the camera; conditional habitat growth forms independent of dominant biome; source-derived baked silhouettes using the existing renderer; explicit nested-pass accounting.

**Rejected for adoption:** full-detail far continuation cost, clipped stand cards, the current camera objective as a robust aesthetic selector, and current rock/grass/substrate fidelity. **Proposed:** projected water/land weighting and ecological low-height transitions for staging. No speculative technique was promoted into approved global artistic rules.

Current-task files: new `wave1-fields.ts`, `wave1-rebuild.ts`, `wave1-impostors.ts`; dispatcher gate in `wave1.ts`; conditional BIOME9 form in `vegetation.ts`; export of existing sedge geometry in `wave1-flooded.ts`; `tests/wave1-fields.test.ts`; Lab session/index and evidence here. The original generic renderer and previous studies remain accessible.

Reproduce: `node artifacts/wave1-rebuild/validate.cjs`, `node artifacts/wave1-rebuild/audit.cjs`, and `node artifacts/wave1-rebuild/package.cjs`. See source snapshots/hash freeze and `visual-lab/wave1/rebuild-session.json`. Human approval remains null; approved concept direction is recorded separately from implementation judgment.

