# Subtle alpine backdrop — experimental

[Matched hero and inspection comparison](comparison.png). Actual images were interpreted with vision at 640×360. Baseline seed29, treeline, paletteA, same camera and renderer settings. Previous R2/source/evidence remains accessible; opt-in query preserves default scenes.

The supplied reference uses green meadow shoulders and conifer framing against restrained distant blue ridges. Observed principle: the mountain detail supplies depth without replacing the meadow as the main visual mass. This experiment removes 97.5% of the old synthetic peak amplitude and uses a world-space cylindrical illustrated distance layer. Local terrain, plants and trees retain their existing geometry and seeds. Existing grass/rock/snow fields remain; no new rock/grass/snow texture-blending system was added.

## Result and limits

Better distant silhouette and geological detail; no enormous smooth mountain walls. The first attempt compressed the asset and exposed seams; proportional correction, mirrored wrapping and altitude feathering improved it. The elevated view still reveals sparse terrain and a broad horizon transition. Mirrored repeats are an economical prototype rather than a finished 360-degree panorama. Trees remain visibly mechanical. No final artistic approval, multi-seed robustness claim, new holdout claim or mobile approval.

Close mountains are explicitly disallowed for this unverified-relief profile. No regional DEM has yet been gathered, and generated artwork is not geographic evidence. Future prominent relief must cite a regional elevation source and establish distance, bearing and apparent height. This records the user's direction without pretending that a geographic data pipeline is implemented.

Changed runtime files: `src/lib/forest/alpine-recipe.ts`, `src/lib/forest/alpine-adapter.ts`; generated asset `public/assets/alpine-backdrop/distant-ridges-v1.png`. Additional capture scripts, baseline text snapshots and this review are isolated here. User direction and experiment evidence: [experiment.json](experiment.json). Previous alpine holdouts remain revealed and untouched.

## Cost and checks

Hero: 11→12 draw calls, 582932→583316 submitted triangles. Inspection: 437828→438212 triangles. New 1536×1024 RGBA texture about8MiB with mipmaps; no hardware overdraw/device approval. `npx tsc --noEmit` passes; both captures report no renderer/page errors. Protected scenes were not recaptured in this small opt-in-only study, so no new pixel-regression claim is made.

## Preview

http://localhost:3001/explore?lat=51.17&lon=-116.18&habitat=forest&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&alpine=treeline&palette=A&backdrop=subtle

Remove `backdrop=subtle` for the retained original; add `camera=inspection` for elevated inspection. No commit, push or deployment. Recommended next investment: compose continuous middle-distance wooded shoulders with a bespoke layered panorama, before spending effort on nearby peaks. Stop here for human review.
