# Corrected tropical dry woodland reference

Preview: http://localhost:3001/explore?lat=10.85&lon=-85.61&habitat=forest&seed=29&density=24&wind=0&expansion=dryforest&drySeason=flowering

Source changed: src/lib/forest/tropical-dry-forest.ts only. Existing region/biome gate and other environments unchanged. Recoverable baseline: source/baseline.ts.txt and before.png. Retained source: source/retained.ts.txt.

New assets: public/assets/dry-forest/gumbo-bark-v2.webp and guanacaste-leaf-v2.webp. The generated leaf study was inadequate for guanacaste; primary trees use geometric compound leaves instead. Secondary foliage remains provisional. Existing soil albedo/normal/roughness and woodland matte reused.

Visible changes: stronger broad-canopy enclosure, taller reddish peeling-bark right frame, seasonal pink focal tree, lateral grasses and rocks, thorny woody shrubs, vines and smaller curled litter. Character staging remains open. Ground and topography fields are synthetic, not surveyed.

Final image: final.png, 1280x720, seed29. 129 draw calls; 2,886,634 submitted triangles. TypeScript passed and capture recorded no browser errors. No mobile validation or protected-scene captures. No commits, deployment or global promotion.

Not concept-quality. Remaining: mechanical compound foliage and flat secondary sprays; coarse disconnected grass shading; exposed pale backdrop and weak light transitions. Retain layout as an unfinished prototype for user review. Three bounded correction renders preserved; no human approval inferred.

Flowering is separate opt-in drySeason=flowering, a supported regional candidate presentation without claimed exact local phenology. Full ecological provenance and decisions: visual-lab/dry-forest/corrected-reference-review.json.
