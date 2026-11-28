# Holm-oak reference pass

Provisional species treatment, not final artistic approval. [Reference / actual tree](reference-comparison.png) · [Normalized silhouette comparison](silhouette-comparison.png) · [Scene before/after](before-after.png) · [Isolated beauty](beauty.png) · [Branch-only](branches.png) · [Bark detail](bark.png) · [Structured Lab review](../../visual-lab/mediterranean/holm-oak/review.json).

Preview: http://localhost:3001/explore?lat=43.72&lon=3.58&habitat=forest&seed=29&density=36&structure=mediterranean-1&appearance=garden&wind=0&expansion=mediterranean . Existing dev server on3001; no deployment. The new treatment applies to the10 Mediterranean background holm oaks; the foreground cork-oak hero is preserved.

## What visibly changed
Short trunks now support broad, dense, internally branched crowns with smaller foliage gaps. Generated fine-scaled gray-brown bark differs from the cork oak's large cork plates; generated muted olive/sage leaf sprigs replace the generic leaf atlas. Bark UVs follow curved branch length. Cutout depth shadows use the same sprig shape as the visible foliage. Existing rendering, batching, LOD and tree picking are retained.

The first actual render was too upright, scalloped and yellow-green. One bounded correction broadened the branch envelope and connected foliage sectors. Inspection showed that the existing palette shader replaced texture hue; the local material now retains the generated leaf albedo alongside painterly shading. No global exposure or ambient change. Reference and actual final beauty/silhouette/branch/bark/scene images were inspected by the primary agent, not an independent reviewer.

Remaining: the edge still has too many similar scalloped lobes; broad highlights and shaded interiors are less varied than the photograph; trunk flare and fine branches remain approximate. Retain for review, not a claim of a finished photorealistic match. Normalized silhouette comparison fits each tree to the same image height; this is a shape diagnostic, not a solved photographic camera calibration.

## Files
- `src/lib/forest/holm-oak-study.ts`: declarative seeded short-trunk/domed architecture; local texture, longitudinal UV and alpha-depth binding to existing batches; diagnostic view hook.
- `src/lib/forest/mediterranean-recipe.ts`: selects the new architecture for its existing Quercus ilex presentation individuals.
- `src/lib/forest/mediterranean-adapter.ts`: scoped installation/cleanup.
- `tests/holm-oak.test.ts`: determinism, nonmutation, taper/branch hierarchy, crown bounds and source separation.
- `public/assets/holm-oak/bark-v1.webp`, `leaves-v1.webp`: generated1024 textures; original PNGs retained here.
- `visual-lab/mediterranean/holm-oak/`: both supplied references and review/provenance. Previous experiment evidence remains intact. Source snapshots and capture scripts are stored here.

## Validation and preservation
TypeScript passed;7 targeted holm/Mediterranean checks passed. Final capture had zero page/console errors. The frozen prior recipe was compiled and compared: cork hero data deep-equal; all10 background identities, source seeds, positions and rotations unchanged. Background architecture/materials changed intentionally. Ground, grass, shrubs, rocks, sky, matte, lighting and camera unchanged. Other biome adapters were not changed; no full visual regression suite or holdout runs claimed.

Hero scene18 calls and1,822,040 submitted triangles, compared with18 calls and1,649,632 before (+10.5%). Inspection16 calls/1,822,036 triangles. Same17 geometries and11 uploaded textures reported. Alpha overdraw and physical mobile performance not measured. Two1024RGBA+mip textures imply approximately10.7MiB uncompressed image storage; actual GPU allocation differs. Species remains an existing regional catalogue candidate, not verified local occurrence. No ecological data changed, commit, push, deployment or global promotion.
