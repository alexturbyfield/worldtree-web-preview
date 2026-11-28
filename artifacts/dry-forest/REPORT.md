# Tropical dry woodland prototype

Preview: http://localhost:3001/explore?lat=10.85&lon=-85.61&habitat=forest&seed=29&density=24&wind=0&expansion=dryforest

Changed source: src/lib/forest/tropical-dry-forest.ts; src/lib/forest/wave1.ts (opt-in biome-2 and ACG coordinate gate). Existing fallback and other scene implementations untouched.

Generated assets: public/assets/dry-forest/distance.png; soil-albedo.webp; soil-normal.png; soil-roughness.png. Soil normals/roughness are deterministic image-derived approximations, not measured PBR maps. Reused cork oak bark and leaf sprays are provisional representations, not correct guanacaste compound leaves or peeling gumbo-limbo bark.

Final inspected capture: final.png, seed29, fixed 1280x720 hero camera. 73 draw calls, 2,930,594 submitted triangles. No device timing or mobile approval. TypeScript passed. Browser capture reported no errors. Protected captures and broad regressions not run; isolated route only.

Agent assessment: readable spreading architecture and warm woodland continuation improved from first capture, but target fidelity is not met. Highest-priority remaining defects: open uniform floor; speckled crown lighting; weak midground woodland layering. Vines and convincing thorny-shrub morphology remain deferred. User review required; no artistic approval inferred.

Reference conflict: supplied concept depicts alpine scenery. Snow mountains and rosette vegetation deliberately excluded from Central American seasonal dry forest. Terrain and regional-candidate occurrences are synthetic, not a surveyed site reconstruction. Flowering trumpet trees omitted pending phenology evidence. Fixed reference season/light state, not global biome defaults.

Evidence and source hashes: visual-lab/dry-forest/review.json. Source baseline and rejected captures preserved under artifacts/dry-forest/. No commit, push, deployment or global promotion.
