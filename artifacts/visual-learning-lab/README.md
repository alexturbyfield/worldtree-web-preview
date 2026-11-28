# Visual Learning Lab — initial experiments

**The Lab implementation works; these experiments did not produce an approval-quality scene treatment.** Six candidates were actually inspected. All six were rejected for approval, so the previous scene baselines remain selected. The controller stopped after two rounds without an acceptable best-result improvement. Experiment C was not started. No human labels, model training, commit, push or deployment occurred.

## Open the Lab

The local human-review page is running at **http://127.0.0.1:3111**. It shows both experiments, references, matched hero/inspection images, exact parameters, differences, objective findings and written visual judgments. No candidate or checkbox is preselected. You may explicitly approve or reject a treatment; the agent has not submitted a preference on your behalf.

[Usage and reference instructions](../../visual-lab/README.md) · [Reference manifest](../../visual-lab/references.json) · [Portable parameter catalog](../../src/lib/forest/visual-lab-profiles.json)

## Comparisons and records

| Experiment | Comparison | Structured record | Vision critique |
| --- | --- | --- | --- |
| A: Savanna grass | [Baseline + three candidates, hero and inspection](A-r1/comparison.png) | [Full record](A-r1/record.json) | [Actual image review](A-r1/vision-review.json) |
| B: Rainforest ground | [Baseline + three candidates, hero and inspection](B-r1/comparison.png) | [Full record](B-r1/record.json) | [Actual image review](B-r1/vision-review.json) |

Each candidate was rendered at 640×360 with seed 29, structure `grove-1`, appearance `garden`, wind off and unchanged daylight, camera, sky, terrain and primary trees. Hero transforms are the existing encounter camera. The fixed elevated test view is `[34,23,44]` looking at `[-2,7,-12]`. Within each experiment one browser scene was reused: target dressing changed, not the tree generators or whole scene seed. Cameras/render settings, invariant guards, repeat-layout digests and pixel-identical baseline restoration were checked.

No Tier 2 or Tier 3 artistic captures were needed: the defects were already clear at Tier 1, and no candidate was approved. The tool supports higher tiers; the Lab's final-comparison command requires explicit human approval.

## Actual vision findings

Vision interpretation was available through `view_image`. I inspected each hero PNG and the three inspection images side-by-side in an unscaled composite, using the supplied savanna images and the rainforest reference/structured principles. This is separate from image capture, Sharp metadata and pixel metrics.

| Candidate | Better than previous? | Good enough? | Rank | Evidence and decision |
| --- | --- | --- | ---: | --- |
| a1 — soft ribbon clumps | Yes | No | 2 | Recognizable blades improve on the fern-like baseline, but broad radial spikes look agave-like and stiff. Reject for approval. |
| a2 — painterly card masses | No | No | 3 | Pale, skeletal weed-like silhouettes remain despite lower triangle cost and good numerical coverage. Reject. |
| a3 — fine flowing blades | Yes | No | 1 | Best relative grass silhouette, but the radial template and coarse curvature remain rigid and too olive compared with the supplied golden flowing-grass reference. Reject for approval. |
| b1 — low broadleaf islands | No | No | 3 | Weaker foreground framing makes the brown floor look barer. Reject. |
| b2 — layered edge understory | No | No | 2 | Larger angular foreground fronds compete with the opening; more mass does not make the floor botanically convincing. Reject. |
| b3 — broken mixed patches | Slightly | No | 1 | More irregular framing is a small relative gain, but coarse plants, weak litter richness and the inherited inspection boundary remain. Reject for approval. |

The rankings are agent judgments, **not human preferences**. Top rank is not an approval or automatic promotion. The current `best-known.json` has no human-approved profile, and `preferences.jsonl` has zero entries. Frozen starting baselines are retained in `baselines.json` and their source snapshots. Historical retain/revert decisions from the previous quality pass are separately identified as agent-reviewed history, not human approval labels.

The likely grass root cause is the repeated radial template and low segment curvature, rather than a need for another blanket density increase. The rainforest study confirms that rearranging the same angular life-form geometry does not create missing leaf-litter richness. Those are next-experiment hypotheses, not promises that a cosmetic adjustment will solve them.

## Objective findings and performance

All six candidates passed the current critical gates. That did **not** make them attractive. The strongest technical counterexample is a2: fewer triangles, no severe black-vegetation warning, substantial mask coverage, and a worse visual result.

| Case | Hero draw calls | Hero triangles | Lower-half vegetation mask coverage |
| --- | ---: | ---: | ---: |
| Retained savanna baseline | 8 | 57,350 | 73.3% |
| a1 | 8 | 76,350 | 45.6% |
| a2 | 8 | 43,350 | 65.8% |
| a3 | 8 | 72,150 | 50.5% |
| Retained rainforest baseline | 26 | 1,450,298 | 18.6% |
| b1 | 26 | 1,450,298 | 13.5% |
| b2 | 26 | 1,450,298 | 16.5% |
| b3 | 26 | 1,450,298 | 21.2% |

Savanna candidates use 2,100 ribbon clumps / 7,500 card clusters / 2,100 fine-blade clumps respectively, in one GPU-instanced grass batch. a1/a3 increase triangles by about 33%/26% without a sufficient visual benefit, so they were not adopted. a2 reduces cost but fails artistically. Rainforest reuses the existing 64 detailed trees and existing dressing batches; no full-detail tree counts increased. Its inspection cost remains 22 calls / 1,433,698 triangles.

Candidate hero CPU submission samples were approximately .1–.6 ms in these captures. These are three synchronous render-submission samples, not GPU times, browser FPS or a physical mobile benchmark. No candidate was adopted on the basis of these numbers. [Summary and raw sample arrays](summary.json) preserve the measurements.

Checks cover severe relative vegetation loss, near-black masked vegetation, reviewed approximate sunlit ROIs, grid alignment/duplicate positions, excessive occupancy uniformity, known opaque floor-stamp reuse, disabled inspection continuation, non-target state changes and major cost regressions. Circular-pattern detection is source-aware and conservative; no universal image classifier is claimed. The current albedo-filtered litter remains intact for every B candidate.

The savanna sunlit ROIs were chosen from the fixed baseline's visibly lit right foreground. Near-black fractions there were about .49% / .014% / .27% for a1/a2/a3. These are actual mask/pixel measurements inside a manually reviewed ROI, **not** a physical direct-sun/shadow buffer. They do not approve shape, color hierarchy or beauty. Rainforest deep-shadow warnings include legitimate shade, and its exposed inspection boundary is an inherited unresolved finding for all three treatments.

## Human preferences and retention

The local form requires an explicit image-inspection confirmation, reviewer name, reason, and positive answers to both quality judgments before approval. Critical failures block it. Labels are self-declared local human input, not authenticated identities. Rejections can revoke approvals and restore the earlier unrevoked best. Preference events are append-only and remain separate from agent critiques.

Each event records scene/biome, seeds, camera/render data, generator parameters/version/source hashes, references, screenshot paths, objective findings, vision judgments, explicit human decision, reason and date. Future preference-label reuse consent is separate from image-rights verification. Source/reference images are not automatically cleared for training merely because preferences are saved.

The current run used two of three permitted rounds. A second unsuccessful round stops the controller; it does not spend the remaining round automatically. Pending reviews, missing vision, changed approved parameters and baseline drift also block generation. A future newly authorized budget can start a named session without deleting old records, preferences or best-known results.

## Verification and source files

The reused architecture is `recipe.ts`/ecological selection → `composition-archetype.ts` → biome dressing in `biome-visual.ts`, `pretty-scene.ts` and `rainforest-depth.ts` → existing tree batching/materials in `painted-renderer.ts`. The Lab adapter sits at the dressing boundary. It does not replace that pipeline, change the world map, regenerate species or rebuild the canopy. Existing Playwright/forest tests and the previous screenshot/mask harness were inspected and reused where applicable.

Passed: targeted TypeScript check; eight focused tests covering the catalog, controller, defect gates, sunlit ROI arithmetic, human approval/rejection and existing objective checks; actual browser checks of the review page; deterministic target replay for all candidates; exact camera/render settings; non-target guards; and byte-identical baseline restoration for both experiments. Positive human-label tests use isolated temporary fixtures only; they do not create project human data.

The approved Puget reference camera was captured before and after Lab integration at 640×360. The PNGs are **byte-identical**, with 19 calls / 675,089 triangles. Scene screenshots taken before the runtime adapter also match both experiment baselines. The metadata-only seed-label correction is recorded in each baseline's provenance; geometry/appearance seeds were not changed.

Implementation files: `src/lib/forest/visual-lab.ts`, `visual-lab-profiles.json`, the small `pretty-scene.ts` hook, extensions to `scripts/studies/visual-quality.cjs`, the new `visual-learning-lab.cjs` controller/review server, `tests/visual-learning-lab.test.cjs`, `visual-lab/` manifests/records/guidance, and the persistent AGENTS.md Lab rule. Existing ecological selection, species generators, tree architecture and approved Puget rendering were preserved. No dependencies or generalized environment framework were added.

One comparison-sheet directory-creation error occurred after A's captures; it was corrected and the sheet composed from the existing captures without regenerating or relabeling the experiment. The original infrastructure failure is retained in A's record, separate from its artistic verdict.

## Remaining visual defects and next experiment

- Savanna grass remains coarse/repeated in the retained scene. The three alternatives are not approval-quality. A future targeted geometry study should test coherent blade lean and smoother curvature before density tweaks.
- Rainforest floor richness remains weak, foreground life-form geometry is angular, and elevated inspection exposes the environment boundary. None was hidden by reintroducing circular stamps, stronger fog or a camera change.
- Distant geological character and acacia silhouette were deliberately left unchanged. Experiment C was not eligible because A/B failed the visual bar.

**No machine learning occurred.** The useful result is a working, bounded process that preserved the previous best, recorded why six technically valid alternatives failed, and left real human approval explicit. The immediate scene-beauty goal remains unresolved; do not describe these rejected candidates as successful scenery improvements.
