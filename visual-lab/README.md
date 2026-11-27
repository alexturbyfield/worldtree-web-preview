# Wildloom Visual Learning Lab

This is a local experiment/review tool built on the existing renderer and `scripts/studies/visual-quality.cjs`. It stores experiment memory and explicit preferences. **It does not train a model, infer human approval, or automatically replace the main encounter scene with a winner.**

## Prairie rolling-terrain / dressing checkpoint

[Actual before/after and rejected grass](../artifacts/prairie-volume/comparison.png) · [Preview, regional sources and critique](../artifacts/prairie-volume/REPORT.md) · [Decisions](../artifacts/prairie-volume/review.json). Stronger rolling shoulders, seedheads, forbs and sparse shrubs are provisionally retained. Broad brush cards failed as terraces and are disabled by default; dense prairie grass remains unresolved. Seeds29,41 and a frozen holdout inspected;13 protected views unchanged. No human approval, global promotion or deployment.

## Prairie ground gate — not passed

[Actual experiment views](../artifacts/prairie-ground/comparison.png) · [Critique and local preview](../artifacts/prairie-ground/REPORT.md) · [Session decisions](../artifacts/prairie-ground/review.json). Opt-in biome8 groundwork is technically runnable but still flat/lawn-like at human height. Three rounds are spent; no grass/flower stage or holdout started. Continuous terrain fixes are isolated, thirteen protected views are unchanged, and a low grass-mass representation is proposed rather than approved.

## Current Wave 2 human approval

The user approved the current batch, including the latest temperate yellow-green highlights. [Approval and pinned images](feedback/wave2-current-batch-approved.json). This supersedes earlier agent-only retention labels for the presented artistic baselines; historical rejected evidence remains intact. No deployment, global promotion, ecological verification or mobile performance approval is inferred.

## Temperate tree-lighting range checkpoint

[Concept / before / retained and bark shadows](../artifacts/temperate-light-range/comparison.png) · [Measured values, controls and costs](../artifacts/temperate-light-range/REPORT.md) · [Review decisions](../artifacts/temperate-light-range/review.json). Wood now receives actual alpha-cutout crown shadows; selective foliage highlights and dirt albedo are lighter. A brighter but washed-out foreground treatment was rejected. Seeds 29, 41 and a frozen holdout inspected; seven protected views unchanged. Agent retention only, not human approval.

## Temperate forest continuity checkpoint

[Concept / before / retained](../artifacts/temperate-forest-depth/comparison.png) · [Critique, preview and costs](../artifacts/temperate-forest-depth/REPORT.md) · [Agent decisions and evidence-backed rules](../artifacts/temperate-forest-depth/review.json). Mixed-height source-baked patches and saplings close the under-canopy gap; the first black-curtain bake was rejected. Crown pigments are quieter. Seeds 29, 41 and a frozen holdout were inspected; seven protected views are unchanged. Agent retention only, no human approval or global promotion.

## Wave 2 — autonomous living-floor checkpoint

[Matched before/after](../artifacts/wave2-autonomous/before-after.png) · [Concept comparison](../artifacts/wave2-autonomous/retained-concept-comparison.png) · [Report and previews](../artifacts/wave2-autonomous/REPORT.md) · [Autonomous session, decisions and rules](global-expansion/autonomous-session.json).

User-authorized progress-based iteration supersedes the old fixed-round cap **for this session**, without rewriting older experiments. Retained changes improve moss/duff/litter, grounded rocks/roots, temperate continuation and true tundra branchlets; failed distributions, camera obstruction and ineffective changes were rejected. Secondary inspection exposed a boreal moss regression, repaired and validated with a fresh holdout. **No scene is newly human-approved or globally promoted.** All seven protected environments remain unchanged across 13 views. Current images still show major material, foliage, terrain and continuation limitations.

## Global expansion — concept-led Wave 2 checkpoint

[Actual concepts versus renders](../artifacts/wave2-concepts/retained-concept-comparison.png) · [Report and preview links](../artifacts/wave2-concepts/REPORT.md) · [Seed/holdout views](../artifacts/wave2-concepts/hero-seeds.png) · [Inspection](../artifacts/wave2-concepts/inspection-seeds.png) · [Session/rule decisions](global-expansion/concept-session.json).

The user accepted the construction plans, then three isolated workstreams implemented them. Boreal bough volume and temperate enclosure improve, but floor/light/continuation remain major gaps; tundra crossed mats fail the artistic gate. Temperate C3 black-crown regression was rejected and C2 restored. **No new biome is artistically approved or globally promoted.** Three correction rounds are spent and fresh holdouts are revealed; do not reset this budget or tune silently against them. All seven protected scenes remain unchanged across 13 views. The supplied sheet's bottom-row “Result” is reference artwork, never runtime evidence.

## Earlier global expansion — first Wave 2 review

[Inventory](global-expansion/INVENTORY.md) · [Prototype report](../artifacts/wave2/REPORT.md) · [Matched comparison](../artifacts/wave2/comparison.png) · [Session and rejected findings](global-expansion/wave2-session.json).

The user authorized boreal6, temperate4 and tundra11 development. Explicit `expansion` previews are implemented; all seven protected environments remain pixel-identical across 13 views. **New prototypes are below the artistic target and have no human approval.** Three correction rounds are exhausted; holdouts have been revealed. Preserve the evidence and do not silently resume tuning or promote recipes globally. The latest Wave 1 user provisional approvals supersede the older initial-checkpoint status below; see [the feedback record](feedback/wave1-provisional-baselines.json).

## Parallel biome expansion — Wave 1

[Review checkpoint](../artifacts/wave1/REPORT.md) · [Real reference / baseline / prototype comparison](../artifacts/wave1/comparison.png) · [Inspection views](../artifacts/wave1/inspection.png) · [Workstream records](wave1/README.md).

Desert13, mangrove14 and flooded grassland9 are explicit opt-in studies, guarded by actual RESOLVE metadata. Three bounded workstreams retain rejected evidence and frozen seed checks. **None is artistically approved or ready for global recipe promotion.** Existing protected woodland, rainforest, savanna and alpine captures are pixel-identical. Do not reset exhausted experiment budgets or treat revealed holdouts as unseen.


## Alpine cross-biome experiment

[Report and art-direction checkpoint](../artifacts/alpine-study/REPORT.md) · [Recipe/schema/grammar](alpine/README.md) · [Actual compositions](../artifacts/alpine-study/compositions.png) · [Palette states](../artifacts/alpine-study/palettes.png).

The first alpine study uses the existing renderer with a pure procedural plan and opt-in adapter. Three composition families, three palette states,9 training cases and3 post-freeze holdouts were evaluated. R3 geology was rejected; R2 is retained only as the strongest **technical** checkpoint. **None meets the artistic target or has human approval.** Major terrain/conifer/composition defects and a treeline budget miss are documented. Protected Puget, rainforest and retained savanna captures are pixel-identical. See the separate authorized [alpine controller](alpine/controller.json); do not reset its exhausted correction budget or treat revealed holdouts as unseen.

## Review the current experiments

Start the app if necessary:

```powershell
npm run dev -- --port 3001
```

Start the local human-review page in another terminal:

```powershell
node scripts/studies/visual-learning-lab.cjs serve
```

Open **http://127.0.0.1:3111**. It displays the baseline, three candidates, hero/inspection images, exact parameters, differences, objective findings, agent critiques and references. Image choices and judgment checkboxes are unselected by default.

To approve, explicitly choose a candidate, confirm inspection of both views, answer both “better than previous?” and “good enough?” positively, enter your name and reason, and submit. A critical technical failure blocks approval. Rejecting all candidates retains the previous best. Rejecting a previously approved result restores the earlier unrevoked approval. Local reviewer identity is self-declared, not authenticated or cryptographically verified.

Human submissions append to `preferences.jsonl`; agent critiques append separately to `agent-reviews.jsonl`. `best-known.json` contains only explicit human-approved profiles. `baselines.json` preserves the existing starting checkpoints and images; those entries are not newly human-approved by this Lab. Human choices influence future Lab baselines. Main scenes remain unchanged unless explicitly previewing `labCandidate=a1`, etc., or a later authorized integration adopts a result.

The current A and B rounds rejected every candidate as not good enough. There are **zero actual human preference entries**. The agent rankings remain visible for comparison; first place is not approval.

## Controlled generation

`src/lib/forest/visual-lab-profiles.json` is the engine-neutral catalog. A varies only grass geometry/material/height/density. B varies only understory placement/scale and filtered litter footprint size. Both keep world seed 29, structure `grove-1`, appearance `garden`, camera, sky, lights, terrain and primary trees fixed. B preserves the successful albedo-based circular-stamp removal.

`src/lib/forest/visual-lab.ts` applies one profile to existing dressing. It restores the original target arrays before every candidate, reuses all non-target geometry, and rebuilds only the grass batch when required. Within each experiment, the browser/scene stays alive for baseline, candidates, diagnostic masks and camera transitions. It verifies target-layout reproduction and non-target invariants, then restores and recaptures the baseline byte-for-byte.

```powershell
node scripts/studies/visual-learning-lab.cjs run A
node scripts/studies/visual-learning-lab.cjs run B
```

These commands currently refuse further generation because this task's session stopped after two unsuccessful rounds. That is intentional. Do not delete or rewrite evidence to bypass the controller.

For a **new user-authorized task/budget**, archive the old controller and begin a named session:

```powershell
node scripts/studies/visual-learning-lab.cjs new-session next-authorized-study
```

Previous records, source snapshots, human preferences and best-known results are retained. Round IDs continue increasing, preventing overwrite. The historical catalog runner has three candidates; new studies choose their count adaptively. Keep at most three rounds per authorized session and stop after two rounds without useful improvement. Pending vision reviews and unavailable vision also block further generation.

Within a declared comparison, hold non-target systems fixed. The targeted family may involve parameter refinement, a new representation, or a broader art-direction hypothesis. Do not silently randomize the whole scene or disable guards to hide undeclared changes. A broader hypothesis needs an explicit experiment contract and appropriately scoped adapter/guards. Bump `generatorVersion` when generator semantics change, and preserve approved definitions. Geometry forecasts are bounded before rendering. A changed approved parameter definition or generator version must be reconciled with its frozen snapshot before a new comparison. A changed baseline image also blocks continuation rather than silently accepting a new “best.”

## Creative autonomy and art-direction checkpoints

### Reference-to-Recipe staged studies

### Golden plains and procedural tree grammar

[Study/checkpoint](../artifacts/golden-plains-trees/REPORT.md) · [Landscape grammar](landscape-color-grammar.json) · [Tree grammar](procedural-tree-grammar.json) · [Evidence schema](visual-grammar.schema.json) · [Declarative acacia architectures](acacia-architectures.json).

The `r-plains` opt-in preserves R2 while testing warmer distance-dependent ground/grass pigments, half added apron relief, and near/mid grass geometry roles. `treeStudy=A|B|C|baseline` replaces only the selected visual hero through `SpeciesDesign.visualGrammar`, shared path hierarchy and existing studio rendering. It preserves ecological identity, positions and independent individual seeds. A is the provisional recommendation; B is an alternative and C's current island-like treatment is rejected. No architecture is human-approved.

Reference observations were saved before implementation. First horizontal-pad trees and dark/noisy first grass attempt are retained negative examples. The record includes isolated silhouettes, full source branch-only diagnostics, material detail, secondary views, three seed checks, color-texture estimates and an isolated additive alpha-overdraw proxy. C's cheaper proxy did not make it the better artistic candidate. Age/environment and far-LOD art remain proposed despite technical controls. New human feedback must be attached to these actual captures/source versions; do not infer approval from the agent's preference. The controller is paused at the requested art-direction checkpoint and must not generate further iterations automatically.

Follow-up: [Golden hills and foreground report](../artifacts/savanna-golden-hills/REPORT.md). User feedback favored the direction/colors while requesting stronger framing and vibrancy. The new opt-in `r-golden` retains R2: illustrated hills plus terrain continuation, richer shared pigment and asymmetric outcrop framing. R1's panorama seam and R3's opaque grass-bank regression are preserved as negative examples; R3 was reverted. Seeds29/41/73, rotated continuity, protected-default hashes and performance are recorded. GH1/GH2 have scoped agent evidence; NGH1 is rejected. No new scene or rule is human-approved. The controller stops at the pending checkpoint rather than automatically accepting the latest version.

Use [the portable recipe schema](recipe.schema.json) and [savanna recipe/evidence](savanna-recipe.json) to translate whole-image observations into procedural hypotheses. Each rule separates directly observed reference evidence from inferred implementation, and stores effect, systems, evaluation, confidence, biome constraints, cross-biome reuse and provenance. Statuses are **proposed**, **experimentally-supported**, **human-approved**, and **rejected**. A provisional gate pass is agent evidence, not user approval; later whole-scene review may narrow or withdraw early support. Never convert a negative technique or matching metric into an approved rule.

The [Reference-to-Recipe report](../artifacts/reference-to-recipe-savanna/REPORT.md) contains ground/grass/foreground comparisons, both camera controls, seed stress tests and remaining failures. `scripts/studies/recipe-gates.cjs` reuses `visual-quality.cjs` and snapshots sources/parameters into staged records. Gates allow an initial attempt plus at most three corrections each, stop after two failures to improve, and require actual image review before proceeding. The existing controller also records the pending recipe checkpoint; do not bypass it by returning to three-candidate generation. Diagnostic seed captures after a failed composition gate are counterexamples, not a Gate D pass.

Captured `recipeEye` is explicitly opt-in and applies the same terrain-relative 1.7m camera to all compared controls. Also retain comparisons at the original camera: changing camera must not masquerade as a rendering improvement. Seeded determinism and projected framing robustness are separate checks. The default savanna, Puget and rainforest remain unchanged.

Preserve current negative lessons: opaque curved grass masses and canopy patches (S); skeletal two-strip groups (B1/B2); low-segment triangles (B3); alpha-to-coverage without MSAA (unrepaired B4); doubly dark stone pigment and stale shadow maps (C1); seed-41 foreground overfill/floating distant landform. The repaired painted-ground/rooted-fibre direction remains experimental, not human-approved. Record any future user feedback with the exact gate/capture/source and their stated reason; none has been inferred here. No model training has occurred.

### Savanna representation study (S)

The controlled S catalog adds three different constructions: `sa` curved painterly alpha masses, `sb` a continuous ground material with sparse parallax geometry, and `sc` a hybrid of substrate, low canopy relief and selected textured masses. The ground material is an explicitly declared target; terrain geometry, trees, sky, lighting and protected biomes remain guarded. Geometry-only coverage excludes this substrate and cannot establish its success. Preserve raw masks and require actual surface review rather than interpreting an incomplete mask as approval.

The [saved study report](../artifacts/savanna-representation-study/REPORT.md) links the frozen diagnosis, calibration, grammar, both rejected rounds, multiscale measurements, asset provenance, protected-scene byte comparisons and the pending human checkpoint. Both S rounds were rejected; the original baseline remains active. Do not reset the stopped session or regenerate further variants without a new authorized effort. Preview only by adding `labCandidate=sa`, `sb` or `sc` to the fixed savanna query; ordinary scenes retain their existing appearance.

`node artifacts/savanna-representation-study/analyze.cjs` regenerates the private comparison sheets and descriptive multiscale metrics from saved captures. The existing `serve` preference form lists S records as well as historical A/B records. Human decisions stay separate from the agent's reject-all recommendation; no training occurred.

The persistent policy is in [AGENTS.md](../AGENTS.md) and its structured counterpart is [art-direction-policy.json](art-direction-policy.json). This is explicit creative latitude for technically ambitious, isolated work. It does not approve any existing candidate or authorize changes to the protected Puget identity.

Think and work as a senior technical artist. Choose among three intervention levels:

| Level | Appropriate work | Escalation signal |
| --- | --- | --- |
| Refinement | Parameters, material response, existing placement controls | Useful representation, insufficient tuning |
| Representation | Different geometry, shaders, textures, placement systems or rendering techniques | Repeated tuning cannot overcome the current construction's visible limitations |
| Art direction | Different compositions, terrain structures, dominant silhouettes or visual treatments | The concept itself is weak, or multiple viable aesthetics need comparison |

The current A/B profiles and adapter limits document the first studies; they are not the permanent boundary of what the Lab may explore. Extend the catalog and an isolated adapter for a new construction when needed. Declare changed systems explicitly, retain checks outside that scope, and preserve the previous best/fallback. Do not turn an ambitious experiment into an unrelated renderer rewrite.

### Candidate diversity and diagnosis

For representation uncertainty, compare genuinely different constructions in the number justified by information value. For example: curved overlapping grass cards; painterly textured clumps; a ground-material plus instanced-vegetation hybrid. Three height/density/tint variants of the same unsuitable construction do not satisfy that diversity requirement. The initial A/B studies remain historical evidence and must not be relabeled retroactively as successful ambitious exploration.

Custom shaders, procedural geometry, texture generation, terrain algorithms and instancing strategies are available techniques. Judge them by inspected output and mobile rendering cost. A complex approach earns its cost through a substantial demonstrated artistic gain, not novelty or a better metric alone.

For every failed experiment, classify the likely cause as **implementation quality**, **inadequate representation**, **weak artistic concept**, or a documented combination. Label unverified causes as hypotheses. Fix implementation faults before judging the idea, but do not repeatedly tune a representation or concept that cannot approach the references.

Between checkpoints, work autonomously: artistic hypothesis → reversible implementation → reproducible render → actual image inspection → diagnosis → revise/reject → preserve the strongest result. Objective checks veto technical failures and inform cost decisions; they never confer aesthetic or human approval.

### When to ask for artistic guidance

Use a checkpoint when substantially different directions are viable, competing aesthetics require a choice, a promising winner significantly diverges from references, two candidates have complementary strengths with no clear winner, repeated experiments fail to approach the target, or a major change would alter an approved scene's identity.

A checkpoint must contain:

1. **Two or three actual rendered candidate images**, with paths/links to the reproducible captures. Include relevant inspection views when they affect the choice. Do not replace available images with prose.
2. A short description of what distinguishes each direction.
3. Its major artistic and technical tradeoffs, including mobile cost and unresolved defects.
4. Your own recommendation and why.
5. **One specific question** that the user's artistic preference can resolve.

Do the ordinary technical investigation first. A shader compile issue, incorrect normals or a known placement bug does not require an artistic question. Do not seek repeated permission for technical experimentation already authorized by the user.

### Recording hypotheses, checkpoints and feedback

The existing record format can retain additional fields in its vision critique, and human preference events already link to the record, screenshots, parameters and critique. Use those fields deliberately. A critique/checkpoint may include:

```json
{
  "interventionLevel": "representation",
  "artisticHypothesis": "A specific construction should produce a specific reference-led visual improvement",
  "constructionDiversity": ["curved cards", "textured clumps", "material/instance hybrid"],
  "failureDiagnosis": {
    "classification": "inadequate-representation",
    "status": "hypothesis",
    "visualEvidence": ["Actual inspected defect and its image path"]
  },
  "artDirectionCheckpoint": {
    "status": "awaiting-user-guidance",
    "candidateImagePaths": ["actual candidate image path", "another actual candidate image path"],
    "differencesAndTradeoffs": ["Specific artistic and mobile-cost tradeoffs"],
    "recommendation": "A reasoned preference, not a human approval",
    "question": "One specific artistic question"
  }
}
```

This is a field example, not a completed checkpoint or evidence that screenshots were reviewed. Fill it with real captures and findings. Keep the existing required inspected-image paths and separate better-than-previous/good-enough judgments for a completed vision review. For a genuinely distinct construction, store its exact parameters, source/version and hypothesis with that candidate.

Record actual user approvals, rejections and stated preferences together with the relevant images and parameters. Feedback supplied in conversation can be recorded when explicitly given, with that provenance; never invent a review-form submission or assume a general policy instruction approves a candidate. General artistic/process preferences belong in the policy record; candidate decisions belong in the preference history. Agent recommendations remain separately attributed. Consult both before proposing the next experiment.

### Constraints, budget and success

Experimental savanna and rainforest directions may change boldly. Preserve deterministic generation, ecological plausibility, reproducibility, reversible source checkpoints, the approved Puget scene and mobile performance as an explicit constraint. Do not add arbitrary human-made objects or unrelated decorative landmarks. An approved scene's identity requires a user art-direction decision before a major change is adopted.

Keep the existing bounded controller and stop rules. The budget permits ambitious techniques; it does not justify endless iteration or prohibit representation changes. If a promising direction exceeds the remaining effort, preserve its source and renders, explain the demonstrated potential and remaining work/cost, then ask for a larger authorized effort. Do not silently reset the session. After repeated failures, escalate the hypothesis or seek guidance rather than produce more near-identical variants.

If all candidates are poor, reject all and explain what fundamentally needs to change. Success means visibly compelling, technically credible scenery that meaningfully advances the user's vision. A build, three variants, a top rank or numerical improvement alone is not that success.

## References and rights

`references.json` contains the eight requested categories, artistic principles, positive characteristics and defects to avoid. The current savanna references are user-supplied illustrations; the rainforest reference is an existing local concept. The phone photograph is a supplemental source. Original authorship/licensing has not been verified. They are private local review references, **not cleared training or redistribution assets**.

To add a reference, add a uniquely identified entry with:

```json
{
  "id": "my-licensed-grass-reference",
  "biome": "savanna",
  "category": "grass-structure-distribution",
  "source": {"kind": "local-licensed", "attribution": "Actual creator", "original": "Source/provenance record"},
  "license": {"status": "unverified", "use": "private visual reference", "redistributionAllowed": false, "trainingEligible": false, "note": "Record verified permission before expanding use"},
  "imagePath": "path/to/local-reference.png",
  "principle": "Specific visual principle, not a generic beauty score",
  "positiveCharacteristics": ["What to emulate"],
  "defectsToAvoid": ["What to reject"]
}
```

Use a project-relative local path. Alternatively provide `imageUrl` instead of `imagePath`; the review page presents a manual source link rather than automatically fetching the remote image. No scraping/downloader is included. Keep privately supplied files out of public assets; the existing attachment folder is ignored by Git. Verify rights separately before copying or distributing images. Permission to reuse a human preference label does not grant rights to reference images.

## Objective checks and actual vision review

The reused capture harness renders alpha-aware vegetation masks. The Lab adds relative coverage-loss gates, camera/render-setting equality, non-target invariant guards, deterministic-layout digests, grid-alignment/duplicate-position checks, occupancy uniformity checks and triangle/draw-call regressions. Existing metadata flags known opaque floor-stamp reuse and disabled inspection continuation. These are defect detectors, not a learned aesthetic score or a universal circular-pattern/terrain classifier.

`sunlit-regions.json` contains approximate sunlit ROIs interpreted from the fixed savanna baseline. Near-black vegetation is counted using the real silhouette mask inside those regions. This is **not** a physical direct-sun/shadow segmentation buffer. Do not reuse the ROIs for different cameras without review. Rainforest dark-pixel warnings include legitimate cool shade; vision inspection must distinguish defects from intentional shadows.

The capture reports preserve inherited findings separately from new candidate regressions. The current rainforest world boundary is an inherited unresolved defect. Neither a candidate rank nor a feature-level human approval declares the whole environment approved.

Vision capability must be established for each review environment. In this task the assistant actually inspected candidate hero images and inspection composites through `view_image`, with the supplied images/manifest principles as references. If vision is unavailable, record `visionAvailable:false`, supply no fabricated artistic judgments, and stop artistic generation.

Agent-review JSON requires a ranking, justification, inspected source-image paths, and **two independent judgments for each surviving candidate**:

```json
{
  "visionAvailable": true,
  "imagesInspected": ["actual hero PNG path", "actual inspection PNG path"],
  "ranking": ["a3", "a1", "a2"],
  "reason": "Why this order; root cause if the experiment failed",
  "candidates": [
    {"id":"a3", "betterThanPrevious":true, "goodEnough":false, "reason":"A relative gain that still fails the visual bar"}
  ]
}
```

Include all three candidates in a real file. Critical failures may use `judgmentBasis:"objective-critical-rejection"`, `betterThanPrevious:null`, and `goodEnough:false` without claiming unseen images were inspected. The strongest noncritical candidate is provisional only if both judgments are true. Otherwise all are rejected and the previous best remains.

```powershell
node scripts/studies/visual-learning-lab.cjs review A-r1 path/to/actual-vision-review.json
```

## Progressive output and final validation

Routine captures are 640×360. The existing harness supports 1280×720 details/crops where needed. Final Lab captures at 1920×1080 require explicit human approval:

```powershell
node scripts/studies/visual-learning-lab.cjs final A
```

It validates the approved generator/parameter version and captures matched before/after hero and inspection views. No Tier 3 candidates were generated in this task because none passed the visual bar. Lower resolution does not reduce scene-generator costs; the runtime adapter's target-only application is what avoids regenerating trees between variants.

CPU submission samples, draw calls and triangles are recorded. They are not GPU times, FPS or a physical mobile benchmark. Do not interpret a faster ugly candidate as a successful visual result.

## Portable records and future training

Each `artifacts/visual-learning-lab/<round>/record.json` stores scene/query context, seeds, exact parameters and differences from the control candidate, source hashes and frozen source snapshots, reference IDs, actual camera/render data, screenshot paths, objective findings, vision judgments, human status, date and generator version. `preferences.jsonl` appends explicit human comparisons, reasons, camera/render settings and selected parameters. Do not merge agent verdicts into the human-label column.

These records can support a future preference dataset after consent and image-rights checks. No model weights, training job, automated image interpretation model or reinforcement learning were created here.

## Checks

```powershell
node --test tests/visual-learning-lab.test.cjs tests/visual-quality.test.cjs
npx tsc --noEmit
```

Positive human-preference tests run only in isolated temporary fixtures; they do not create project human labels. Consult the task report under `artifacts/visual-learning-lab/README.md` for the actual outcomes and unresolved visual defects.

## Adaptive visual work

For new tasks use [the efficient visual-development protocol](../AGENTS.md#efficient-visual-development-and-learning). It supersedes fixed-three-candidate guidance: choose a focused fix, sweep, distinct representations, broad composition or minimal architecture prototypes according to uncertainty. Historical catalog experiments remain preserved, including their fixed candidate counts and stop records. Do not reset budgets.

Load permanent rules, reusable skills/grammar and task-specific evidence. Critique actual images before implementation justification. Record attribution, hypothesis confidence, strategy, artistic/reusable value, capture inputs, decisions, source freeze and unseen final seed. Reuse the existing harness/controller. Shared changes require affected/protected biome captures. Efficiency never justifies skipping meaningful experiments, visual inspection or honest evaluation.
