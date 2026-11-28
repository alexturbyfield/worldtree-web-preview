# Central American tropical pine-oak prototype

Preview: http://localhost:3001/explore?lat=14.507672&lon=-89.435797&habitat=forest&seed=29&density=24&wind=0&expansion=tropicalpine

Source: src/lib/forest/tropical-pine.ts (new isolated study); src/lib/forest/wave1.ts (opt-in biome-3 regional route); src/lib/forest/wave2-shared.ts (new ID and guarded woodland-slope terrain mode). Existing biomes retain previous modes. Lab concept and review records added. Recoverable source baselines and rejected images are under artifacts/tropical-pine/.

Assets: public/assets/tropical-pine/distance.png; pine-sprays.webp; floor-albedo.webp, rock-albedo.webp, moss-albedo.webp, bark-albedo.webp; corresponding floor/rock/moss/bark-normal.png and *-roughness.png. Normal/roughness channels are deterministic albedo-derived approximations, not independent measured PBR data. Terrain uses litter normals with moss albedo blending; supplied moss normals are not separately blended into its shader. Generated atlas and matte provenance/hashes are in visual-lab/tropical-pine/review.json.

Visible result: tall high-crown pines, mixed oak proxy crowns, needle litter, connected sheltered moss, rootbeds, weathered stones, twigs, patchy grass, low shrubs and fern forms; descending synthetic woodland shoulder and illustrated forested ridges. No unsupported stream or alder added. Flowers deferred for regional/seasonal evidence. Pine/oak region supported by USAC field transects, but selected-point occurrences remain unverified. Generic oak/understory models do not assert named local species.

Final inspected image: final.png, seed29, fixed 1280x720 camera. 87 draw calls, 2,089,088 submitted triangles. TypeScript passed; no captured browser errors. Frame timing, mobile testing, protected-scene captures and multi-seed checks not run. No commit/push/deployment/global promotion.

This is an unfinished visual prototype, not concept-quality: pine foliage is sparse, oak highlights pale, fern silhouettes too flat, and bare gaps still separate the stand from the matte. Fuller oak crowns and richer rooted floor improved the first capture, but final artistic approval is explicitly pending. Stop for review; next highest-value work is pine crown massing and canopy light control, then middle-distance continuity.
