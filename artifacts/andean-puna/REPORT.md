# Andean puna study

Preview: http://localhost:3001/explore?lat=-9.88&lon=-77.19&habitat=forest&seed=29&density=24&wind=0&expansion=andean

Changed source: src/lib/forest/andean-puna.ts; src/lib/forest/wave1.ts (opt-in regional biome-10 route); src/lib/forest/wave2-shared.ts (TypeScript study-ID union only). Lab reference and review records added. Existing scene implementations and fallback remain unchanged.

Assets: public/assets/andean-puna/distance.png plus soil-, rock-, cover-, bark-albedo.webp, corresponding *-normal.png and *-roughness.png. Four generated atlas quadrants are used as materials; normal/roughness channels are deterministic luminance-derived approximations, not measured scans. Asset hashes and provenance: visual-lab/andean-puna/review.json.

Visible result: narrow curved tussocks, sculptural low cover, gravel/lichen surfaces, juvenile Puya forms, small twisted Polylepis grove, a valley shoulder and illustrated snowy Cordillera Blanca distance. Synthetic environmental fields coordinate cover with slope/moisture/rock. This is seasonal puna, not a generic paramo recipe or a surveyed landscape. Regional flora supported by SERNANP; exact selected-point occurrence unverified. Flowers and mature Puya flower spikes omitted.

Final inspected screenshot: final.png, fixed seed29, 1280x720. 21 draw calls; 2,268,504 submitted triangles. TypeScript passed; no captured browser errors. No device performance approval, additional seeds or protected-scene regression captures. No commit/push/deployment/global promotion.

Unfinished: grass remains too uniformly straw-colored, Polylepis leaves are coarse, distant ground communities too simple and matte light integration too weak. Retained as a review prototype, not concept-quality or human-approved. Previous rejected captures and source baseline are preserved. Next highest-value work: plant material/silhouette refinement and middle-distance community contrast.
