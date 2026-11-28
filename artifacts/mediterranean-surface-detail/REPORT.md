# Mediterranean ground and grass texture pass

[Matched before/after](comparison.png) · [Elevated view](after-inspection.png) · [Review](../../visual-lab/mediterranean/surface-detail-review.json).

Changed one runtime file: `src/lib/forest/mediterranean-adapter.ts`. Reuses the existing generated meadow and sediment maps. Terrain and grass roots now share multiscale world-space color/detail sampling, with rotated/warped sediment, restrained broad dry/green variation and distance-reduced fine detail. Soil bump sampling uses the same UV field as its albedo; roughness remains matte. No new geometry, dependencies or image generation. Dirt coverage/trajectory and grass placement unchanged; no sharpening of the existing mask is claimed.

Actual images inspected: foreground dirt has more readable gravel/mineral grain, and the flat olive ground carries woven grass texture with coherent root pigmentation. Retain provisionally. Largest remaining problem is dark, speckled middle-distance grass geometry; this material pass does not solve it. Projected soil-mask limitations and simple vegetation communities remain below the concept target. Trees, grass geometry, terrain, placement, camera, lighting and protected biome implementations are unchanged.

Preview: http://localhost:3001/explore?lat=43.72&lon=3.58&habitat=forest&seed=29&density=36&structure=mediterranean-1&appearance=garden&wind=0&expansion=mediterranean . Append `&groundDetail=original` for the prior surface treatment.

TypeScript and7 focused tests passed. Browser caught a reserved GLSL identifier; it was fixed before the successful render, which had zero page/console errors. Matched cameras, instance counts, calls and submitted triangles verified:18 calls/1,822,040 triangles in both hero images. Texture count11→12. More texture sampling/bump work adds fragment cost; physical mobile performance unmeasured. No holdouts, full regression suite, commit, push or deployment. Source checkpoint and capture settings preserved here.
