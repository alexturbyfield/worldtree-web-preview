# Layered tropical treeline

Changed: src/lib/forest/tropical-pine.ts; new asset public/assets/tropical-pine/treeline-v1.png. Baseline source and image preserved here.

42 to 68 physical pines, a tighter middle-distance stand, and three world-space woodland cards at z=-80/-145/-250. Existing sky, camera, light, foreground and distant hills retained. Shared compositor uses depth testing, edge fades, per-layer fog and bounded camera visibility. Single generated asset is offset and slightly rotated across layers; repetition remains possible outside the hero view.

Actual 640x360 screenshot inspected. Continuous wooded depth replaces most bare horizon gaps, central character opening remains. Pale oak highlights and coarse foreground plants remain. Retain for human review, no artistic approval inferred.

TypeScript passed, no captured browser errors. 119 draw calls / 2,283,946 triangles (previous 87 / 2,089,088). No mobile or frame-time validation, no broad regressions. No commit/push/deployment.

Preview: http://localhost:3001/explore?lat=14.507672&lon=-89.435797&habitat=forest&seed=29&density=24&wind=0&expansion=tropicalpine
