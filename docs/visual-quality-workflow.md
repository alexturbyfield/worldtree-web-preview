# Wildloom visual quality workflow

The mandatory rule is in [AGENTS.md](../AGENTS.md). Execution, metadata, pixel measurements and visual interpretation are separate checks. None substitutes for the others.

## Current review tools

Use `scripts/studies/visual-quality.cjs`. It uses the installed Playwright, Three.js devtools observation hook and Sharp; no dependencies were added. The existing browser tests remain in `tests/browser` and the seed/model tests in `tests/forest.test.ts`. This workflow does not replace them or run the full suite.

The scene cases are a small registry inside the script, not a scenery framework. Each saved report includes the actual camera position/quaternion, resolution, renderer counters, instance metadata and findings. Source checkpoints accompany this task under `artifacts/visual-quality/`.

## Capture and review

1. Preserve the working source, including uncommitted files. A Git commit alone is not a baseline when the tree is dirty. Use `.ts.txt` copies so checkpoints do not enter the TypeScript build.
2. Start `npm run dev -- --port 3001`, then `node scripts/studies/visual-quality.cjs serve` in another terminal. The capture service listens only on `127.0.0.1:3110`; the app origin defaults to `http://localhost:3001`. On this setup the `127.0.0.1` app origin failed to resolve the geographic worker under Next development origin protection; use the working localhost origin.
3. Capture the current baseline and, separately, historical references before editing. The same browser remains alive between capture requests.

```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3110 -ContentType application/json -Body '{"label":"baseline","tier":1}' | Select-Object label
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3110 -ContentType application/json -Body '{"label":"historical","tier":1,"variant":"historical","scenes":["savanna","rainforest"]}' | Select-Object label
```

4. Select one concrete defect and write a hypothesis. Change one coherent part of the existing implementation. Run only relevant checks, then capture Tier 1.

```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3110 -ContentType application/json -Body '{"label":"candidate-1","tier":1,"scenes":["savanna"]}' | Select-Object label
```

5. Open the actual PNGs with a vision-capable image viewer/reviewer. Inspect hero and inspection views. Compare with the best-known result, not just the immediately preceding attempt. Record the defect, severity, evidence, confirmed cause or labeled hypothesis, corrective action, and accept/revise/revert decision.
6. Reject obvious regressions. Save the successful source checkpoint. Late detailed inspection may invalidate a provisional Tier 1 acceptance; update the decision and roll it back. Do not count a rollback as a new artistic experiment or use it to sneak in another correction.
7. Use Tier 2 only when a material/detail question remains. Prefer native-resolution crops of the relevant region. Use Tier 3 only for the final comparison of selected results. Final validation can still reject a candidate.

```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3110 -ContentType application/json -Body '{"label":"detail","tier":2,"scenes":["savanna"],"reload":false,"masks":false}' | Select-Object label
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3110 -ContentType application/json -Body '{"label":"final","tier":3,"masks":false}' | Select-Object label
```

Send capture requests sequentially. Use `reload:false` when the existing scene is already the desired version. Cameras, mask passes and output resolutions reuse its generated geometry. A source edit/reload still regenerates the scene: smaller PNGs do not reduce generator cost.

## Reproducibility and tiers

- Seed 29, structure `grove-1`, appearance `garden`, density 36, wind off. Savanna uses the existing conditional canopy option; rainforest uses V5.
- Tier 1: 640×360. Tier 2: 1280×720. Tier 3: 1920×1080. All use aspect 16:9 and render pixel ratio 1, with the original ACES exposure and scene lighting. These are canvas captures, not screenshots of the surrounding UI.
- Hero transforms come from the existing encounter setup and are stored in every report. The rotated elevated test view is `[34,23,44]` looking at `[-2,7,-12]`, shared with the previous visual pass. It is a fixed inspection test, not a claim that every possible orbit has been validated.
- Preserve the same source checkpoint and settings within a comparison. If reconstructing a frozen baseline, restore **all** its saved scene source files together, capture, then restore the selected best checkpoint in a `finally` block.
- `pretty=off` selects the older presentation fallback. It does **not** reconstruct the frozen, defective Pass 1 source after that source has been corrected; use `baseline-source` for that comparison.

## Objective checks and limits

The checker renders a white vegetation silhouette using original geometry, atlas UV mapping and alpha tests. Ground/nonvegetation are removed for this diagnostic pass, then original materials/visibility are restored. Coverage is measured in the lower half of the image. It is an isolated silhouette mask: terrain occlusion is omitted, so it is a proxy, not exact visible ecological coverage.

Weighted display-RGB values below 25/255 inside that mask flag potential black vegetation. Legitimate shadows and occluders also contribute; vision inspection must decide whether sunlit plants are defective. Savanna low coverage and near-black overlap produce major findings. Rainforest deep-shadow candidates are weaker evidence and remain review findings.

Instance metadata flags heavy reuse of floor stamps and disabled inspection continuation. It cannot determine whether an atlas is artistically repetitive. Albedo-filtered leaf fragments still receive a repetition-review warning. Faceting, disconnected terrain, perceived depth, beauty and subtle repeated silhouettes require actual visual interpretation. No automatic artistic approval score is produced.

No mask means unavailable measurements, represented by `null`, rather than a false zero-coverage failure. The tests cover this distinction.

```powershell
node scripts/studies/visual-quality.cjs check baseline candidate-1
node --test tests/visual-quality.test.cjs
npx tsx --test tests/visual-quality-plan.test.ts
```

Reports contain draw calls, triangles and three synchronous CPU render-submission samples. These are not GPU times or FPS. Record a device/frame benchmark separately when that becomes necessary; do not invent mobile performance claims from this diagnostic.

## Final artifacts and stop decisions

```powershell
node scripts/studies/visual-quality.cjs sheet final-before final-best
```

This produces native comparison sheets plus reduced presentation previews. The native sources remain individual 1920×1080 captures. Record source hashes, exact camera checks and the approved-biome regression result. Finish with the retained images, rejected evidence, iteration history, remaining defects and one focused next recommendation.

Use at most the allocated number of correction cycles (four for this task, across both biomes). Stop early if progress stalls or two successive changes fail. If vision inspection is unavailable, do deterministic checks and report what review capability is missing; do not run speculative art loops. Reaching the budget does not mean that the visual target was achieved.
