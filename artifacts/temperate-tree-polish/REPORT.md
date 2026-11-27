# Temperate tree polish

[Matched before/after](comparison.png) | [Structured critique](review.json) | [Determinism checks](data-checks.json) | [Protected comparisons](regression.json)

Preview: http://localhost:3001/explore?lat=50.5&lon=10.5&habitat=forest&expansion=temperate&seed=29&density=36&structure=grove-1&appearance=garden&wind=0

Changed runtime files: wave2-temperate-concept.ts and wave2-temperate-surfaces.ts. No shared atlas, global generator, ecological data, ground, camera, stand-layout or scene-light changes.

The wrong atlas cells included flowers and conifer sprays. Source-design broadleaf sprays now replace them. Smaller varied sprays break up sheets; additional branch-owned birch sprays fill the temperate crowns. Tangent-continuous wood rings remove joint gaps. A single bark albedo, local diffuse bounce and genus-specific weathering retain readable trunks: marked pale birch, smoother mottled beech/hornbeam and fissured oak. Earlier bark-only brightening was insufficient; albedo diagnostics led to larger weathering variation.

Actual hero, elevated, bark and leaf close-up images were interpreted by the primary agent. Agent retention is not human approval. The result improves the baseline but still has oversized/flat close-up leaves, simplified branching and a synthetic stand boundary in inspection. No claim of concept-quality fidelity.

Seeds 29 and 41 reproduce exactly, preserve source data, tree transforms, branch endpoints/radii and species/seed identities. TSC passed; no broad build/lint suite. Seven protected Puget, savanna, rainforest and alpine views are pixel-identical; Wave 1 runtime code untouched.

Seed 29: 12 draw calls unchanged, 721818 to 788238 submitted triangles (+9.2%). Seed 41: 12 calls / 805166 triangles. Texture allocation unchanged; alpha overdraw unmeasured. Headless software capture timings do not establish mobile GPU performance.

The sparse-birch request is interpreted as birches within temperate woodland; separate Iceland forest is untouched. Sources and intermediate evidence preserved. No commit/push/deploy.
