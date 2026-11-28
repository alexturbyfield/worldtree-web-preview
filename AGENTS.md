<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Wildloom prototype agent instructions

We are in visual-prototype mode, not production-hardening mode.

- Make the smallest change that answers the user's current visual question.
- Preserve deterministic structural, appearance, and scene seeds.
- Keep the current renderer as a fallback; do not rewrite unrelated systems.
- Prefer existing Three.js, TypeScript, and project dependencies; do not add dependencies without explaining why.
- Do not conduct broad web research, comprehensive testing, full lint suites, cross-browser audits, or performance optimization unless requested.
- Run only the cheapest relevant check (e.g. targeted TypeScript check or a quick build if necessary). Do not claim unrun tests passed.
- Do not deploy, commit, or push unless explicitly asked in the task.
- Keep changes localized. If the task will touch more than 3 files or needs architectural changes, briefly propose a smaller slice first.
- At the end report: files changed, visual change, preview instructions, and any obvious caveat, in 5 lines or fewer.
- Use the provided reference images as visual targets. Do not replace reference-driven art direction with generic foliage assumptions.

## Mandatory visual quality rule

Successful code execution does not constitute successful visual output. For every task that changes a rendered scene:

1. Establish a recoverable baseline before modifying the scene.
2. Make small, reversible changes that address specific visual problems.
3. Render reproducibly with fixed seeds, cameras, lighting and resolution.
4. Inspect actual screenshots, not merely code, logs, image metadata or geometry statistics.
5. Compare against the previous best-known result, including historical references when available.
6. Identify defects in composition, geometry, vegetation, materials, lighting, repetition, terrain, atmosphere and scene boundaries.
7. Reject or revert obvious visual regressions.
8. Continue correcting the highest-priority defect while within the task's iteration budget.
9. Preserve the best-known successful result rather than automatically accepting the latest version.
10. Stop when the target is met, progress stalls, or the budget is exhausted; stop after two consecutive failures to improve.
11. Report remaining visual problems honestly.
12. Never claim visual approval unless the rendered images were actually inspected. Agent inspection is not user approval.

Verify and report whether visual-content interpretation is available. Capturing an image, reading metadata and computing pixel metrics are different capabilities from seeing it. Without vision inspection, use deterministic/objective checks and report the limitation; do not run speculative artistic loops.

Use progressive review: Tier 1 640×360 after meaningful changes; Tier 2 1280×720 or targeted crops only for unresolved material/alpha/detail problems; Tier 3 1920×1080 only for accepted final comparisons. Preserve aspect ratio and scene/render settings within each comparison. Lower output resolution does not reduce geometry-generation cost; reuse browser sessions, scene inputs and camera transitions where possible.

Record each correction's hypothesis, visible evidence, measurements, severity (critical/major/minor), and accept/revise/revert decision. Keep the best checkpoint recoverable. Objective checks support artistic judgment; they cannot approve aesthetics. Protect approved biomes with regression captures. Honor the user-specified cycle limit (at most four targeted cycles by default); do not spend unused cycles automatically.

## Visual Learning Lab

For controlled scenery experiments, use [the Visual Learning Lab](visual-lab/README.md) and consult its reference manifest, previous review reasons, frozen baselines and explicit human preferences before proposing another variant. Separate “better than previous” from “good enough to approve”; a numerical gain or first-place ranking satisfies neither automatically.

Choose candidate count adaptively: a diagnosed fix, calibration sweep, distinct representations, or broad compositions according to uncertainty. Keep at most three rounds per authorized session and stop after two without useful improvement. Do not generate three cosmetic candidates automatically. Do not reset its session budget to evade a stop. Preserve all-rejected outcomes and the previous best. Only explicit human input may create human preference labels or promote the human-approved best; never submit the review form on the user's behalf without an explicit instruction. Agent critiques remain separately attributed. Saved preferences do not mean that machine learning or verified image-licensing consent has occurred.

## Creative autonomy and art-direction checkpoints

Work as a senior technical artist, not merely a procedural parameter optimizer. Small, reversible scope does not mean small artistic ambition. You are explicitly authorized to prototype technically challenging approaches when the current representation cannot reach the reference-driven visual target.

Explore three intervention levels:

1. **Refinement:** improve existing parameters and materials.
2. **Representation:** replace inadequate geometry, shaders, textures, placement systems or rendering techniques within an isolated experiment.
3. **Art direction:** explore fundamentally different compositions, terrain structures, silhouettes and visual treatments for experimental savanna and rainforest candidates.

When repeated tuning produces weak results, diagnose whether the failure is implementation quality, an inadequate representation or a weak artistic concept. Escalate to representation or art-direction exploration instead of repeatedly optimizing an unsuitable technique or concept. The existing Lab catalog describes current experiments; it is not a prohibition on new techniques. Declare a new experiment's scope and extend its adapter/guards deliberately when necessary; do not bypass invariants to conceal undeclared changes.

For representation uncertainty, compare genuinely different constructions in the number justified by information value, not cosmetic variants. Grass alternatives might be curved overlapping cards, painterly textured clumps, and a ground-material/instanced-vegetation hybrid. Prefer three ambitious distinct ideas to ten minor variations. Record each construction's artistic hypothesis and intervention level.

Custom shaders, procedural geometry, texture generation, terrain algorithms and instancing strategies are authorized. Keep source changes isolated and reversible, preserve the current fallback, and avoid unnecessary rewrites of stable shared systems. Evaluate mobile cost alongside actual visual improvement. Additional complexity is justified by a substantial demonstrated visual gain, not by technical novelty alone.

Ask for an intermediate art-direction checkpoint when:

- Multiple substantially different artistic directions are viable, or competing aesthetics require a choice.
- The strongest candidate is promising but significantly diverges from the existing references.
- Two candidates have different strengths and no clear winner.
- Repeated experiments fail to approach the desired visual quality.
- A major change would alter an approved scene's identity; preserve that identity until the user decides.

Before asking, provide two or three actual rendered candidate images, a short account of their differences, major artistic and technical tradeoffs, your recommendation, and **one specific question**. Do not substitute descriptions for available screenshots. Do not ask questions ordinary technical investigation can resolve. Creative checkpoints request artistic guidance; they are not a reason to seek permission again for already-authorized technical experiments.

Between checkpoints, autonomously form an artistic hypothesis, implement a reversible experiment, render and inspect it, diagnose visible failures, revise or reject, and preserve the strongest result. Objective checks reject technical failures; they cannot establish artistic quality. Preserve deterministic generation, ecological plausibility, reproducibility, the approved Puget scene, and mobile performance as an explicit constraint. Do not introduce arbitrary human-made objects or unrelated decorative landmarks.

Record the user's actual approvals, rejections and stated preferences in the Lab with their screenshots, parameters and artistic hypotheses. Distinguish general process preferences from candidate decisions; never infer a candidate approval from broad creative authorization or from an agent's aesthetic judgment. Consult accumulated feedback before subsequent experiments.

Keep the bounded budget and stop rules. Ambitious techniques are allowed within the budget; a budget is not an excuse to limit every experiment to cosmetic tuning. If a promising direction needs a larger effort, preserve the source, renders and evidence, document its potential and remaining cost, then request authorization for that larger effort. Do not reset the budget yourself. If all candidates are poor, reject them, explain what fundamentally must change, and seek artistic guidance when the checkpoint criteria apply.

Success means a visibly compelling, technically credible environment with a meaningful improvement toward the user's artistic vision. Three generated variants, a numerical gain or a passing build are not success. Collaborate at genuine creative decisions instead of guessing indefinitely. See [the Lab policy](visual-lab/art-direction-policy.json) and [checkpoint workflow](visual-lab/README.md#creative-autonomy-and-art-direction-checkpoints).

## Efficient visual development and learning

Load permanent rules here, relevant reusable skills/grammar and architecture notes, then task-specific reference analyses, preferences and retained/rejected records. Record what was loaded. Consult [the workflow](docs/visual-quality-workflow.md) and [structured policy](visual-lab/art-direction-policy.json); do not reconstruct full history or duplicate the Lab.

Critique actual images first: identify the three highest-impact artistic discrepancies before technical justification. Diagnose causes second, separating confirmed facts and hypotheses. Use an independent vision reviewer when available and justified; identify the actual reviewer and never fabricate independence.

Choose experiments by uncertainty: one fix for a confirmed defect; a controlled sweep for calibration; genuinely different constructions for uncertain representation; broad compositions for a new direction; minimal competing prototypes for architectural uncertainty. This supersedes older automatic-three-candidate guidance without rewriting historical results or resetting budgets.

Prioritize expected artistic improvement and reusable learning using severity/visibility, confidence, likely benefit, cost, reuse, information gained on failure and protected-scene risk. Estimates are judgments, not measurements. Optimize artistic improvement per effort, never visual quality by minimizing tokens. Ambitious solutions are warranted when simple representations cannot meet the target.

Reuse the existing Diagnose → Plan → Implement → Capture → Critique → Decide → Record tools. Keep mechanical provenance detailed and routine summaries concise. Test relevant seeds, views, composition families, biomes and visual states. Freeze before revealing at least one unseen final seed; record failures without silent holdout tuning. Retest affected/protected scenes after shared changes; distinguish authorized species updates from unintended regressions.

Stop at the milestone, stalled learning, existing budget/failure limits, or when another improvement has higher expected value. Preserve the best and rejected evidence; do not stop only because easy techniques are exhausted. Seek human art direction at consequential aesthetic or expensive uncertain choices. Report observed change, remaining defects and next action. Efficiency never excuses omitted meaningful experimentation, actual inspection, or reliable evaluation.


## High-priority landscape composition checks

For every environment art pass, inspect these before fine-detail polish: **horizon placement, convincing distant continuation, and textured foreground light/shadow framing**. These are permanent high-priority checks requested by the user, not optional finishing details.

- Compose the horizon deliberately from the concept and encounter needs. Keep human eye height and staging readable; adjust camera aim only within the task's authorization. Never default to a horizon or near ridge that makes the world feel shallow.
- Build overlapping near/middle/far silhouettes. Use geography-compatible terrain and, when useful, a detailed generated or appropriately licensed matte to extend distance. Do not invent mountains, forests or landmarks unsupported by the region. Integrate matte edges, ground contact, palette, illumination and atmosphere; inspect elevated/rotated views and hide or transition encounter-only mattes when necessary.
- Establish natural foreground shadow framing with readable cool values and irregular vegetation/cloud texture, consistent with the key light and plausible surroundings. Favor actual occluders where practical; any art-directed supplement must remain world-space stable, preserve surface detail and agree across terrain and plants. Preserve a luminous focal opening. Avoid black curtains, generic dark corners and screen-space vignettes.
- Assess all three for every biome; implement the appropriate solution rather than adding identical hills, canopy shadows or camera settings everywhere. Protect approved scenes and record rendered evidence. The process priority is user-directed; individual techniques remain proposed/experimental until supported and approved.

The Visual Learning Lab remains the authority: see `compositionPriorities` in [its policy](visual-lab/art-direction-policy.json).
