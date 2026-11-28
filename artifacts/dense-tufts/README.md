# Dense C grass checkpoint

Built on the user's preferred C arched grass, with the sparse C tree. One targeted density/placement iteration, actually rendered and visually inspected at640x360 hero, elevated inspection and grass-detail cameras. No geometry/material redesign.

[Before/after](comparison.png) · [Close grass view](../visual-quality/dense-c-first/grass-detail.png) · [Full capture/configuration data](record.json)

Grass increases from1000 to4850 GPU-instanced tufts:4000 coarse midground and850 detailed near tufts. Foreground grass now forms overlapping golden swaths around the opening and rock anchors. Density and height fade through the central clearing; placement uses seeded low-frequency masks instead of uniform scatter or the old rectangular side groups. Ground pigments, curved C blades and warm tip highlights remain unchanged. No individual blade-shadow casting, no new alpha textures, sky, lights, props or tree architecture changes.

At640x360 the scene stays at11 draw calls and goes from108922 to416922 submitted triangles (3.83x). This is the explicit cost of the much denser coverage, not a mobile-performance approval. Two instanced grass batches; no draw per tuft. Device GPU/FPS and hardware fragment overdraw were not measured. Capture metadata includes local CPU submission/completion samples.

Visible result: substantially richer foreground grass, readable bright middle opening, sparse tree retained. Remaining caveats: blades still have the somewhat reed-like style of C, close-up ribbons remain visible, elevated inspection emphasizes the ground material more than the grass geometry. Dense result is provisionally retained for user review, not marked human-approved.

Validation: `npx tsc --noEmit` passed; target layout reproduces deterministically; unchanged-system guards match; no page/shader errors. Previous C recapture is pixel-identical to its saved reference. Only seed29 was tested in this quick pass. No Puget or rainforest source paths changed; they were not recaptured here. Old C and all prior alternatives remain available.

Files changed: `src/lib/forest/savanna-recipe.ts` adds only the opt-in dense-C branch; `visual-lab/feedback/dense-c-tufts.json` records the user's explicit preference and request. Captures, baseline/final source snapshots, parameters and review are stored in this folder. No commit, deployment or push.

Preview on the running local server:

`http://localhost:3001/explore?lat=-2.3&lon=35.2&habitat=grassland&conditional=1&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human&composition=C&groundLighting=B&illumination=on&pretty=on&treeStudy=C&labCandidate=r-fidelity-tuft-c-dense`

Change only `labCandidate` to `r-fidelity-tuft-c` for previous C. The ordinary app default is preserved; dense presentation is opt-in.
