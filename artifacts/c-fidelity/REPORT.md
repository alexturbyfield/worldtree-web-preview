# C fidelity checkpoint — 2026-11-25

C remains the human-preferred **architectural direction**, not an approved final render. This pass retains a fuller C2 crown and a modestly stronger world-space value field as an opt-in review candidate. **The high-fidelity foreground-grass objective remains unmet.** Both new solid-blade prototypes were rejected; the retained comparison uses the previous inexpensive grass. Nothing was promoted to the production default, committed, pushed or deployed.

## Review images

- [Matched hero and inspection comparison](comparison.png): original C / retained C2 + ground field, seed29, identical cameras/light/render settings.
- [Tree silhouette, branch-only, foliage-detail and secondary-angle comparison](tree-diagnostics.png).
- [Seed41 and seed73 hero/inspection views](seed-checks.png); [160x90 thumbnail review](thumbnail-review.png).
- [Rejected grass prototype, hero and real close camera](grass-rejected.png).
- Ground-only attempts: [initial](../visual-quality/c-fidelity-ground/savanna-hero.png), [revised/retained](../visual-quality/c-fidelity-ground-revised/savanna-hero.png). The first was too brown; the revision restores lighter gold in the middle. These omit grass and rock dressing deliberately.
- All five tree diagnostics, grass detail and metadata exist for each retained seed under `artifacts/visual-quality/c-fidelity-retained-{29,41,73}/`.

Vision interpretation was available and used: the assistant inspected actual PNG content through `view_image`, including concept, baseline, crown, hero, inspection, detail and thumbnail images. This is distinct from screenshot capture, pixel identity checks or metadata. No final Tier3 renders were generated because the complete scene did not meet the visual bar. The 640x360 close cameras exposed the grass defects without needing Tier2.

## Reference relationships and implementation

The concept uses connected, raised umbrella lobes above readable forks, with warm upper planes and cool interiors. C's old crown consisted of separated thin pads. C2 keeps the identical trunk/fork profile, nominal height9.5m and radius9.5m. Rising secondary and tertiary branches, inner living shoots and inclined/staggered branch-owned foliage connect the lobes. Seed29 modeled extent becomes11.07m high versus9.73m, with crown width remaining about20m. It is not a uniform vertical scale. The new branch-only image supports the canopy, though distal wood is still visually thin.

C2 uses species-scoped green pigments, actual sun-facing material response and a small height/orientation-dependent warm treatment. Upper planes and shaded interiors differ, but the interior still dominates and the crown remains darker and noisier than the reference. This is a partial structural improvement, not foliage-lighting completion.

The concept's warm olive/umber foreground, golden middle and straw/sage distance are translated into an irregular world-XZ field. The near/middle transition follows world-Z relative to the encounter anchor, warped by a broad sine field; ground and grass sample the same pigments. Existing distance atmosphere, sky, original terrain vertices, restrained continuation relief, geology, camera, tree positions and rock anchors remain intact. There is no screen-space vignette or global exposure change. Numeric palette choices remain savanna hypotheses, not universal grammar defaults. The field is composed for this anchored encounter and remains attached to the terrain when viewed from the rotated inspection camera; it is not yet a geographically adaptive illumination model.

The solid-grass experiment used closed triangular cross sections following bowed centerlines, 5-blade/6-section near clumps, 2-blade mid clumps, sparse seed heads, instancing, buried roots, wrapped normals and shared pigments. It reduced detailed frame instances480→320 and added no per-blade shadow casting. The initial 2-section mid blades looked like angular chips. A 4-section narrower revision reduced chips but remained stiff/faceted in the close view, with almost twice the scene triangles. Both were rejected. The retained scene restores the old12-triangle middle and98-triangle near clumps,2200+480 instances, without pretending these satisfy the requested grass fidelity.

## Three bounded rounds

| Round | Hypothesis | Rendered finding | Decision |
|---|---|---|---|
|1 crown|Rising branch hierarchy and inner connectors produce volumetric C|Connected raised umbrella, fork retained; dark/noisy foliage remains|Retain provisionally|
|2 ground, two attempts|Shared irregular warm-near/gold-middle field organizes depth|First too brown; revised middle lighter, strongest effect across seeds41/73|Retain revision provisionally|
|3 grass, two attempts|Closed curved blades improve physical fidelity economically|First angular chips; revision still folded ribbons and too costly|Reject both; restore old grass|

No new budget was opened after these rounds. Validation reused those implementations. [Structured critique](review.json) separates better-than-previous from good-enough-to-approve; no candidate is marked final-approved. [Experiment/provenance](experiment.json) records exact C2 profile, source hashes/snapshots, world/presentation seeds and parameters. Existing failed candidates and previous judgments are preserved.

## Measurements and regressions

|640x360 hero|Draw calls|Triangles|Decorative grass instances|
|---|---:|---:|---:|
|C baseline, seed29|11|107,962|2,680|
|Retained C2+field, seed29|11|112,706|2,680|
|Retained, seed41|11|113,324|2,680|
|Retained, seed73|11|113,024|2,680|
|Rejected first solid grass|11|155,426|2,520|
|Rejected revised solid grass|11|208,226|2,520|

Retained seed29 triangles increase4.4%; revised rejected solid grass increases92.9%. The hero has233 branch-owned guide groups/932 sprays versus153/612, batched through existing foliage geometry. These are spray counts, not one draw per spray. Total wood segment records increase740→1060. Near clump head geometry is present in the batch but collapsed for instances without heads; submitted triangle counts still include it.

Local headless Chromium warm renderer-submission samples are roughly0.3–0.7ms, with synchronous completion samples of similar magnitude. These are three local samples with `gl.finish`, **not frame-time/FPS measurements or mobile approval**. The renderer identifies only as WebKit WebGL; launch enables unsafe SwiftShader but does not establish a physical GPU identity. Existing antialias:false remains unchanged. Material texture inventory estimates about48.35MiB RGBA+mips, unchanged; that includes hidden fallback assets and excludes shadow buffers/driver allocation.

C2 tree alpha-overlap raster proxy: about6.65 surviving layers per occupied pixel,1.22 whole-spray layers per screen pixel in the fixed isolated view,71% alpha-rejected fragments, peak29. This is a depth-disabled 8-bit additive diagnostic, not a GPU hardware counter or normal depth-tested cost. New solid grass uses opaque geometry without alpha masking; its hardware fragment overdraw was not measured. Lack of alpha overdraw is not a reason to accept poor geometry.

Deterministic target-layout reapplication passed for all3seeds, and non-target geometry/material/lighting guards matched. Original C hero/inspection recaptures are byte- and pixel-identical to the baseline. Protected Puget hero and rainforest hero/inspection are byte- and pixel-identical to `lab-initial` references. Rainforest's existing inspection-backdrop and dark-pixel warnings remain unchanged and were not modified in this savanna pass. See [machine-readable measurements](measurements.json).

Cheapest relevant checks run: `npx tsc --noEmit`,4 targeted tree tests,5 Lab controller/preference tests. All passed. No full lint suite, full build, cross-browser test or device benchmark was run.

## Remaining visual defects / recommendation

1. **Major:** physical foreground grass remains insufficient. Rejected solid geometry has parallax but looks ribbon-like; retained grass is sparse and fragmented. Next investment should isolate one genuinely soft, curved, smoothly shaded clump and prove its silhouette/normal response before distributing it. Increasing density is not the fix.
2. **Major:** C2 is fuller, but upper foliage is still too dark and its breakup too sharp. Keep its fork/scaffold and test coherent crown-scale light/normals rather than globally brightening the material or adding more sprays.
3. **Major:** broad foreground remains underdressed; rock/grass overlap is weak. The palette field helps depth but does not make the landscape complete. Seed41 also retains a conspicuous right-side grass line.

The best checkpoint is provisional C2+field with old grass. Review crown volume and foreground/middle value balance before authorizing another representation study. No successful grass rule or final visual approval has been recorded.

## Files and reusable findings

Appearance code: `src/lib/studio/growth-profile.ts` (optional rise/volume controls), `src/lib/forest/tree-experiment.ts` (opt-in C2), `src/lib/forest/painted-renderer.ts` (C2-only foliage treatment), `src/lib/forest/savanna-recipe.ts` (opt-in field and rejected solid prototype). Capture helper: `scripts/studies/visual-quality.cjs` adds an instance-derived grass-detail camera. Test: `tests/tree-growth-profile.test.ts` now exercises C2 ownership/determinism and fork preservation.

Lab: `visual-lab/acacia-architectures.json` preserves A/B/C and adds C2; `procedural-tree-grammar.json` and `landscape-color-grammar.json` add evidence-scoped volume/value rules, proposed foliage-light organization and a rejected solid-grass implementation. `feedback/c-direction-fidelity.json` stores only the user's explicit structural preference. `controller.json` records rounds and stops for review. No existing negative example or preference was erased. Human-approved best is not promoted by an agent review. No model training occurred.

## Preview/reproduction

Use the running local app at port3001:

`/explore?lat=-2.3&lon=35.2&habitat=grassland&conditional=1&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human&composition=C&groundLighting=B&illumination=on&pretty=on&treeStudy=C2&labCandidate=r-fidelity`

Baseline: change `treeStudy=C` and `labCandidate=r-plains`. Rejected prototype: `treeStudy=C2&labCandidate=r-fidelity-solid`. Ground only: `labCandidate=r-fidelity-ground`. All are opt-in; the default renderer remains intact. Capture reproduction: `node artifacts/c-fidelity/capture-validation.cjs`; reuse the existing browser/harness for cheaper targeted captures. Exact cameras, render settings, dimensions and source versions are in the linked JSON records and frozen source folders.
