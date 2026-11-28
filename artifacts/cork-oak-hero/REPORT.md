# Short cork-oak hero

[Before/after in scene](before-after.png) · [Isolated tree](isolated.png) · [Branch-only](branches.png) · [Bark detail](bark.png) · [Elevated scene](inspection.png) · [Lab review](../../visual-lab/mediterranean/cork-oak/review.json).

Local preview: http://localhost:3001/explore?lat=43.72&lon=3.58&habitat=forest&seed=29&density=36&structure=mediterranean-1&appearance=garden&wind=0&expansion=mediterranean . Use the existing dev server on3001. No deployment.

Changed: `src/lib/forest/cork-oak-hero.ts` (short procedural scaffold, branch-attached sprays, own hero meshes and metre-scaled longitudinal bark UVs); `mediterranean-recipe.ts` (foreground regional cork-oak candidate only); `mediterranean-adapter.ts` (mount/dispose hero and resource tracking); `tests/mediterranean.test.ts` (candidate identity, deterministic tapered scaffold, finite textured geometry). Assets: `public/assets/cork-oak/bark-v1.webp`, `leaves-v1.webp`; original generated PNGs retained here. Reference and critique recorded under existing `visual-lab/mediterranean/cork-oak/`.

Visible improvement: a short, thick, low-forking trunk with unequal winding main branches and faster taper into finer shoots. Generated cork bark plates now follow branch length without the shared world's vertical UV stretching. Generated cutout leaf sprigs replace the generic foreground oak atlas. The hero uses real directional lighting, cutout shadows and a restrained direct-light diffuse wrap; no exposure, global palette or ambient changes. Actual scene, isolated, branch-only and bark images were inspected.

Retain provisionally, not final visual approval. The crown is still too tufted and dark relative to the reference; gaps between leaf masses, overly exposed upper twigs and some abrupt branch junctions remain the largest problems. Further density increases alone are not the recommended fix: foliage should bridge related shoots while preserving readable major limbs.

All10 background trees were deep-compared against the frozen previous recipe: geometry, placements, source species and seeds unchanged. Terrain, grass, rocks, shrubs, sky, camera, lighting and matte unchanged. Existing catalogue supplies Quercus suber as a regional candidate; local occurrence and substrate suitability remain unverified. No named plant data was invented.

Validation: TypeScript passed;5 targeted tests passed; final scene capture had zero console/page errors. Scene18 calls/1,649,632 submitted triangles, versus16/1,647,828 before the hero replacement. Two new1024 textures, approximate uncompressed RGBA+mip memory10.7MiB total. These are software desktop rendering counts, not mobile performance approval.

Limitations: isolated hero is not yet wired into the per-tree click inspector; orbit and elevated views work. Hero wind animation deferred. One fixed seed only; no holdouts, full regression suite, commit, push or deploy. Prior rejected evidence and material-workbench changes preserved.
