# Quick tall-tuft comparison

The sparse original C crown is used in every image. The user preference for sparsity supersedes the agent's earlier fuller-C2 recommendation, without erasing that experiment.

[Hero comparison](comparison.png) · [Close views and rejected hedge](details.png) · [Inspection comparison](inspection.png) · [Reproducible parameters and measurements](record.json)

- **A — fine fans:** tall, narrow curved blades. Less noisy than the previous fragments but weak foreground framing.
- **B — broad bunches:** more substantial silhouettes; rejected for broad upright ribbon appearance in the close view.
- **C — arched tufts:** strongest provisional direction. Narrower, smoothly shaded curved blades, variable height, gold near the tips, roots sharing terrain pigments/texture/light. The first placement formed artificial hedges and was rejected. The revision uses fewer clumps in asymmetric broken patches around the rocks and edges.

C is better for this request, but still somewhat reed-like and too similar between individual clumps. Roots blend more closely; **perfect blending and final artistic quality are not claimed**. The scene remains open, with the sparse forked tree. Each grass patch is GPU instanced and does not cast hard individual blade shadows. No new bitmap artwork, assets, sky or lighting changes.

|640x360 hero|Calls|Triangles|Grass instances|
|---|---:|---:|---:|
|Baseline|11|107,962|2,680|
|A|11|144,442|1,090|
|B|11|129,082|1,090|
|C first/rejected hedge|11|159,802|1,090|
|C revised|11|108,922|1,000|

Only seed29 was reviewed in this quick pass. Target layout reproduction and unchanged-system guards pass. All captures have the same camera/light/seed; actual hero and close-view PNGs were visually interpreted. The hero vegetation-coverage detector clears for C revised; inspection coverage still flags sparse geometry. This is a diagnostic, not aesthetic approval. No page/shader errors. Triangle cost is about0.9% above baseline; no physical mobile device benchmark or hardware overdraw measurements were performed. Grass is opaque curved/cupped indexed geometry with shared normals, not alpha cards.

Changed source: `src/lib/forest/savanna-recipe.ts` only, with opt-in A/B/C tuft geometry, placement and tip-lighting branches. `visual-lab/feedback/sparse-crown-tall-tufts.json` records the explicit user feedback; `visual-lab/procedural-tree-grammar.json` points to that preference without deleting C2 evidence. Existing renderer/defaults and previous candidate IDs remain available. Puget/rainforest paths were not edited; this quick pass did not recapture them. Targeted `npx tsc --noEmit` passed. No commit/deploy/push.

Preview recommended C on the existing local server:

`http://localhost:3001/explore?lat=-2.3&lon=35.2&habitat=grassland&conditional=1&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human&composition=C&groundLighting=B&illumination=on&pretty=on&treeStudy=C&labCandidate=r-fidelity-tuft-c`

Use `r-fidelity-tuft-a` or `r-fidelity-tuft-b` for the alternatives, and `r-fidelity` for the baseline. Source snapshots, exact parameters, matrices/determinism summaries, performance data and the rejected C layout are retained in this folder and `artifacts/visual-quality/tuft-*`. No human approval is inferred from the agent recommendation. Stop here for review.
