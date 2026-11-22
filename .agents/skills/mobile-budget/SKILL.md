---
name: mobile-budget
description: Apply cheap, targeted mobile performance checks to Wildloom foliage experiments.
---
# Mobile budget
- First measure frame time, draw calls, triangles, pixel ratio, shadows, and whether foliage uses alpha masking.
- Treat 30 FPS (~33.3 ms/frame) as an initial mobile target, not a guarantee.
- Prefer opaque canopy cores, sparse alpha-tested silhouette tufts, shared materials, instancing, and cached variants.
- Avoid full profiling sessions unless specifically requested.
- Report what was actually measured and on which device; do not invent GPU metrics.
- If measurements are unavailable, state what to inspect next.
