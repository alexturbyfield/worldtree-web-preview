# Holm oak — three material choices

[Actual A/B/C tree and scene comparison](comparison.png). Top: matched isolated tree. Bottom: matched encounter camera. Each panel640×360; seed29, same light, camera, silhouette and geometry.

A — Warm painterly olive: smooth warm olive/yellow-green highlights, readable green interiors, restrained leaf texture. Recommended for the existing illustrated environment; highlights are deliberately bright and somewhat pale.
B — Soft silver-sage: cooler silver-green palette and gentler transitions. Calm, airy, least textured; sacrifices some depth and warmth.
C — Graphic golden-green: stronger saturation and narrow shadow/highlight bands. Boldest stylization; greater risk of neon tips and visible crown clump boundaries.

Changed runtime file: `src/lib/forest/holm-oak-study.ts`. Shared mutable material uniforms expose A/B/C without regeneration. Existing treatment remains the default. Bark pigment and bump strength vary per option; lighting/exposure, cork oak, geometry, texture assets, placement and alpha cutouts are unchanged. Silhouette approval is recorded separately from the pending material choice in `visual-lab/mediterranean/holm-oak/material-options-review.json`.

Preview URL: http://localhost:3001/explore?lat=43.72&lon=3.58&habitat=forest&seed=29&density=36&structure=mediterranean-1&appearance=garden&wind=0&expansion=mediterranean&holmMaterial=A . Change the final A to B or C; omit it for baseline. No deployment.

Checks: TypeScript passed;7 focused tests passed. Browser captured all three from one scene using live uniform edits. Source geometry UUIDs, vertex/instance counts, scene identity, triangles and draw calls identical. Baseline restoration is pixel-identical; zero page/console errors.18 calls/1,822,040 triangles for every option. No mobile-device test or artistic approval inferred. No commit, push or deployment. Source snapshot and full capture validation are in this folder.
