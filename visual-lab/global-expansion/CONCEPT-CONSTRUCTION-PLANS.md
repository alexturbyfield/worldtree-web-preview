# Wave 2: concept-first construction plans

**Phase 1 only · proposed · awaiting user plan review · 2026-11-26**

Update: the user subsequently answered **Yes**, accepting these construction directions for implementation. This approves the plan only. [Implementation acceptance record](../../artifacts/wave2-concepts/acceptance.json) and the later [rendered checkpoint](../../artifacts/wave2-concepts/REPORT.md) preserve the distinction from artistic approval.

No renderer, generator, camera, material or approved environment was changed for this analysis. Previous failed candidates, exhausted session records and source freeze remain intact. Accepting a plan will authorize a new, separately recorded experiment; it will not retroactively approve the old prototypes or reset their history.

## Evidence and scope

![User-supplied primary concept sheet](references/wave2-concept-sheet.png)

The primary references are the **top-row concept panels**. The middle row is explanatory art supplied with the image. The bottom row labeled “Result (development)” is also part of the supplied reference: it is **not a capture from this repository**. It helps clarify intent but proves no implementation success.

Actual current renderer: [frozen before/prototype sheet](../../artifacts/wave2/comparison.png), [inspection views](../../artifacts/wave2/inspection-seeds.png). Root interpreted the supplied sheet and actual prototype sheet with vision-capable `view_image`; this is agent inspection, not independent or human approval. This document contains observations first, technical hypotheses second. Estimated framing/occupancy values are visual estimates, not measured image masks. Absolute focal length, tree dimensions, geography and illumination cannot be recovered uniquely from one illustration.

Loaded: project AGENTS.md, `visual-review` skill, existing Lab reference manifest, global coverage inventory, Wave 2 session and data checks, three biome adapters and shared adapter. The prior Lab report documents protected-scene baselines and technical tests. No new art bible or separate reference authority is introduced.

## Shared construction contract

- Work in the existing opt-in BIO6/BIO4/BIO11 adapters; preserve generic fallback and all seven protected scenes. Do not route new appearances globally.
- Keep world seed, ecological identity, structural seed, appearance seed and presentation seed distinct. A small serialized plan describes habitat fields, architecture rules, composition constraints and reference-state lighting independently of Three.js objects.
- Derive a front-center staging footprint from the encounter camera, then evaluate terrain and collision clearance. Initial working capsule: approximately 0.45 m radius, 1.8 m height, with a roughly 2 m clear approach. These are **proposed design dimensions**, to use actual character dimensions if available. Low plants and detailed substrate can remain. No trunk, boulder, protruding log or dense tall cover may occupy the capsule. Do not excavate a circular clearing, paint a path or raise a camera pad.
- Compose a layered stand or vegetation field around that opening, rather than sprinkle independent decorative objects. Use shared slope, drainage, substrate, shelter and canopy fields for material and vegetation. Until measured data is available, label these synthetic study fields; never present them as geographic observations.
- Correlate pigment, growth form and contact shading; do not use color noise as a substitute for geometry. Suppress fine contrast with distance. No savanna brush atlas, generic Douglas template for unrelated species, or rounded cellular stamps in the new representation.
- Separate biome identity, seasonal pigmentation, weather and time-of-day lighting. The illustrated warm light is one reference state. Tundra red/russet foliage is a requested visual-state hypothesis, not proof of year-round local vegetation.
- World-space light/shade fields may supplement actual shadows, but must have plausible canopy/landform sources. No screen vignette or black foreground curtain. Preserve readable cool shadow color and fine material detail.

## 1. Boreal — enclosed boughs over a living floor

### Observed artistic relationships

1. **Large:** dark cropped trunks and drooping branches occupy both edges and reach into the upper frame; narrow conifer silhouettes overlap behind them. A small sky opening reinforces vertical scale. Current R4 has separate cone-like specimens around an open lawn.
2. **Medium:** warm pools of light connect an irregular central opening; moss-covered rocks and low shrubs make an interlocking, uneven floor. Current cover reads as detached marks on smooth terrain.
3. **Fine:** moss, needle debris, bark and selective leaf tips enrich the foreground without dissolving the broad shadow masses. Current large angular sprays and simple stones carry the wrong visual weight.

These differences are major. First test enclosure and branch silhouette; increasing forest-floor instances cannot repair the missing bough structure.

### Composition and spatial diagram

Start at 1.6–1.7 m eye height, near-level optical axis, inferred horizontal field of view roughly 55–65 degrees. Fit the **cropped concept panel aspect ratio, approximately 1.5:1**, before widening to the app's 16:9. Camera numbers are initial fitting hypotheses. Exact framing means matching the image relationships, not claiming recovered camera calibration.

Screen-space guide, normalized top-left origin: boughs across upper corners; near trunks mostly in outer 15–20% width; an irregular opening around x=0.35–0.65 from y≈0.55 downward. Distant ground convergence around y≈0.55–0.62, partly obscured by stand layers. No continuous clear horizon. Preserve foreground lateral rock/shrub overlap and a detailed low central footing.

```text
CONCEPT VIEW — relative zones, not fixed object coordinates
┌── cropped drooping boughs ── sky slit ── boughs ──┐
│ near trunk / overlapping narrow conifer stand    │
│ cool stand   warm interrupted opening  cool stand│
│ moss/stone   low, traversable footing   moss/rock │
└────────────────── eye at ~1.7 m ─────────────────┘
GROUND LOGIC: shelter/canopy → moss and needles;
              rooted rock margins → shrubs/debris;
              approach → low cover, not bare soil.
```

### Geometry and representation

- Terrain: connected shallow shoulders, root relief and drainage hollows; no periodic noise humps or invented mountains. Initially use local relief of decimeters across several meters, with broader low slopes driven by context. Exact amplitudes remain tunable hypotheses.
- Trees: species-conditional conifer architecture with an actual tapering leader, hierarchical whorls, drooping secondary boughs, flattened needle-bearing sprays and irregular gaps. Let near trees extend above frame; crown bases and branch lengths vary with modeled shelter/competition. Do not turn every tree into a dense cone.
- Stand: clustered recruitment and mortality gaps produce overlapping near, middle and far bough silhouettes. Trunks and roots constrain ground plants. Mid-distance silhouettes still require real supporting branches; distant stand cards may supplement geometry when baked from the correct eligible architecture.
- Floor: continuous moss substrate plus low dimensional moss/heath patches at edges and in sheltered hollows; embedded lichen/moss rocks; a few weathered logs outside the approach, with plausible ground contact. Fallen wood is ecological structure, not a mandatory prop per seed.

### Materials and lighting

Ground layers: needle/organic duff, moss, exposed moist soil and rock mineral. Low-frequency moisture/shelter fields choose connected regions; textured edge masks create irregular transitions. Near detail is moss fibrils/needle fragments and bark grooves; middle detail resolves as cushions and root/rock edges; far detail becomes coherent cool stand/floor values. Organic surfaces are rough; damp soil lowers roughness locally, never a uniform glossy carpet. New tileable art must be seamless and inspected; high-quality artwork must be sourced/generated rather than replaced with blurry noise.

Reference-state sun appears high to upper-left/back-left; direction is an inference. Test branch-oriented illumination and warm needle edges, with deep cool green interiors. Several connected light pools should cross the clearing, broken by bough shadows; shade is substantial but visibly green. Bounce from moss softly colors lower bark/foliage. Distance separates trunks with restrained cool haze, beginning behind the focal stand rather than at the camera.

### Ecology, distributions and variation

At Finland 66.5,26, recorded catalogue candidates include `Picea abies`, `Picea obovata`, `Pinus sylvestris`, `Betula pubescens` and `Betula pendula`. These are regional candidates, **not verified point occurrences or stand proportions**. Use only habitat-supported eligible candidates; build spruce/pine architecture as needed rather than re-label Douglas geometry. The Iceland birch-only case must remain birch woodland, even though it cannot reproduce this conifer reference. Record it as a conditional regional recipe, not a conifer-fidelity test failure to conceal.

Moss, low heath, red shrubs and fungi in an illustration do not establish a local taxon. Nonwoody catalogue support is missing: keep unnamed functional forms and explicitly label autumn red pigmentation provisional until regional evidence supports it. Exclude decorative flowers if no appropriate habitat support exists.

Use multi-scale shelter/duff/moisture fields, tree competition and branch occupancy to distribute cover. Favor moss on sheltered substrate and rock tops where modeled moisture permits; avoid universal moss on exposed dry stone. Seed changes alter connected light openings, bough height, stand asymmetry and rock/log group structure, not just rotations. Preserve the opening by selecting compatible camera/stand configurations rather than moving documented source trees secretly.

### Required gaps and first construction gate

Confirmed current gaps: `composeExpansionForest` applies generic visual fallbacks; `mountExpansionDressing` uses savanna brush cards; rocks and pigment fields create detached coarse patches. Develop isolated species-driven conifer bough/spray representation and moss/duff floor adapter. Reuse deterministic routing, capture harness, texture loading and instancing. First gate: branch-only plus full-canopy silhouette in concept framing, gray simple floor. Reject if still an open specimen park; only then develop the living floor and layered light.

## 2. Temperate — interconnected crowns enclosing a luminous opening

### Observed artistic relationships

1. **Large:** a pale leaning trunk and branch arch connect the foreground to a continuous overhead canopy; sky is fragmented into bright small gaps. R4 shows isolated rounded crowns and a large uninterrupted sky area.
2. **Medium:** fern/leafy understory, roots and partially buried rocks overlap the bottom corners. The central opening is compressed, winding and light-filled, not a broad smooth brown clearing.
3. **Fine:** leaf groups have upper light/interior shade hierarchy; mixed litter/soil and restrained small flowers support depth. R4 has coarse disconnected floor shapes and thin birches.

The priority is connected crown/branch structure, followed by the floor-to-understory transition; brighter green alone will not establish woodland enclosure.

### Composition and spatial diagram

Eye 1.6–1.7 m, near-level view, starting field of view 55–65 degrees and concept panel aspect ≈1.5:1. Foreground trunks form an asymmetric arch, not a mirrored pair. Near foliage occupies much of the top third; bright distant opening sits around x≈0.45–0.60,y≈0.45–0.60. Lower central footing is traversable and irregularly vegetated. The soil trace visible in the art is a negative-space cue, **not authorization to add a trail**.

```text
┌── leaning trunk/branch ─ connected canopy arch ─┐
│ layered leaves       small light gaps   trunks │
│ understory     luminous middle opening   shade │
│ ferns/roots   low litter + clear footing  rock │
└──────────────── eye at ~1.7 m ────────────────┘
GROUND LOGIC: canopy litter + roots + shelter overlap;
              understory thins gradually into the opening.
```

### Geometry, materials and light

Terrain uses gentle root shelves, embedded rock and shallow litter hollows, not a manicured plane. Species-driven broadleaf branches spread and interlock; crowns combine connected structural limbs, clustered sprays, uneven edges and deliberate negative spaces. The pale foreground bark implies birch-like morphology, but no illustrated trunk dictates local species. Maintain thick-support hierarchy and plausible branch attachments; branch-only diagnostics must explain each foliage mass.

Floor representation: layered leaf litter over organic soil; selective root geometry and partly buried stones; fern-like fronds and broadleaf shoots as named assets only after evidence, otherwise labeled functional forms. Understory rises along sheltered edges and tree bases, with low gaps connected across the middle ground. No uniform fern ring, equal trunk spacing or identical crown balls.

Albedo uses tan/umber litter, mossy green margins and rich leaf pigments sharing world-space illumination. Give litter curl and overlap selectively in foreground geometry; use continuous, low-contrast texture further away. Bark needs orientation-aware texture/roughness and trunk-specific morphology; smooth pale bark must not be applied to oak/beech indiscriminately. Ground is mostly rough with localized damp darker patches. Leaves need correct normals, coherent warm top surfaces, cool undersides and restrained backlight; no global emissive canopy.

Reference sunlight appears upper-left/upper-center, inferred from luminous leaves and interrupted ground highlights. A canopy occupancy field should predict the larger light windows, with real branches casting coherent shadows. Cool green fill keeps foliage interiors readable; litter bounce gives subtle warm lower stems. Foreground contains both bright leaves and cool shade, not a uniform dark band. Far trunks merge gradually into lower-contrast green without near fog.

### Ecology and correlated rules

Central Europe 50.5,10.5 returns recorded regional candidates `Quercus robur`, `Fagus sylvatica`, `Betula pendula`. Select supported mixtures and architecture by habitat/context; no assertion that these exact proportions occur at the point. Birch can supply a pale lateral frame where eligible; oak/beech should keep their own branching/bark. Appalachian and East Asian tests must not inherit European taxa just because their crown looks attractive. Catalogue data has zero verified species–ecoregion links, so all such source taxa retain candidate status.

Fern and violet/blue floral details are unsupported local species in the current nonwoody catalogue. Use sparse unnamed forms only with explicit placeholder status; obtain evidence before promoting named regional plants. Concept composition does not verify a particular bloom season.

Model stand neighborhood/competition first; use crown envelope overlap and gap hierarchy to select a view with interconnected foliage and a central light opening. Couple undergrowth to shelter/moisture, litter to canopy cover and roots, stones to substrate exposure. Correlate heights and pigments within communities while varying individual silhouettes. Across seeds, vary the arch's side, crown gap arrangement and embedded-rock groups; never require one exact leaning tree at the same screen position.

### Required gaps and first gate

Existing generic crown/fallback birch rendering and sparse occurrence composition cannot provide the reference arch. Extend eligible broadleaf architecture and branch-supported canopy clustering within the opt-in adapter, preserving protected appearances. Replace generic rosettes and brush floor with litter/understory representations. First gate: connected overhead silhouette and middle opening at matched camera before expensive leaf/litter polish. A higher tree count with unconnected crowns fails this gate.

## 3. Tundra — continuous heath tapestry across shallow terrain

### Observed artistic relationships

1. **Large:** low horizon, broad blue sky and long shallow terrain ribbons establish immense open distance. R4 has the horizon but lacks the connected landform/value structure.
2. **Medium:** russet, gold and olive low-vegetation mats weave around exposed rock and soil. They are continuous communities, not isolated grass clumps or repeated circular patches.
3. **Fine:** foreground low leaves, stalks, lichen/stone texture and pale seed heads add intricate edge detail. R4's pasted brush shapes and smooth stones remain visible at ordinary viewing size.

The priority is a ground-plus-low-vegetation representation that already reads as rich heath before adding seed heads. Trees cannot solve any of these deficits.

### Composition and spatial diagram

Eye approximately 1.4–1.7 m (physical height ambiguous), with 1.7 m as initial character constraint; near-level axis and initial 60–70 degree field of view. Concept horizon lies roughly 38–43% down its panel. Foreground rock/low shrubs occupy lateral corners and some intermediate islands; a low front-center substrate opening remains natural and narrow. Keep the open middle distance, long sky negative space and low distant ridge. No invented dramatic mountains, water or permafrost polygons.

```text
┌──────────── expansive cloud/sky negative space ─┐
│──────────────── low distant land ──────────────│
│ thin cool mats / shallow swales / exposed rock │
│ warm heath ribbons     olive/gold low cover    │
│ rock + leaf detail  low footing  shrub + stalk │
└──────────────── eye at ~1.7 m ────────────────┘
GROUND LOGIC: exposure/drainage/substrate → interwoven
              low communities, not independent stamps.
```

### Geometry and materials

Terrain needs broad shallow shoulders and interconnected depressions with smaller rock/substrate relief; drainage provides directional flow. Avoid both a flat infinite plane and a sequence of procedural hills. Rock clusters vary embed depth and fracture scale; continuous small mineral exposure connects boulders to the surface. No isolated identical rounded gray props.

Develop continuous low mat geometry with irregular contact edges and fine branch/leaf clusters at silhouette boundaries. Suggested construction: low terrain-following instanced dwarf-shrub branchlets plus localized small-leaf clusters, joined visually by a moss/lichen/heath terrain material. Wind-exposed forms stay prostrate; sheltered pockets can rise modestly. Separate sedge-like seed-head tufts are sparse accents where synthetic moisture and regional evidence permit, not a golden grass base reused from savanna.

Ground layers: mineral grit/soil, peat-like organic substrate where habitat supports it, moss/lichen and low shrub leaf mats. Share pigment and height/cover fields with dimensional plants. Foreground has lichen/leaf/stem surface breakup; mid-distance becomes elongated overlapping communities; far detail dissolves into warm/cool ribbons, with no dot carpet. Mostly rough dry leaves/rock, locally damp organic soil. White seed heads are optional functional-form hypotheses; do not identify them as a documented local sedge from pixels alone.

### Light, ecology and variation

Warm light appears from upper-right, an inference. Terrain shoulders, rock tops and selective leaf margins catch gold; shallow swales retain cool gray-green/violet shadows. Shadow direction must agree with rock/plant geometry. Avoid imposing forest canopy dapple on treeless tundra. Fine mottling comes from vegetation/substrate and broad cloud light variation, with any cloud shade separate from biome identity. Blue atmospheric distance progressively lowers contrast without obscuring the foreground.

At Alaska 69,-150 the retained study deliberately supplies no tree occurrences. Current catalogue does not provide a verified regional nonwoody community. Mosses, lichens, dwarf shrubs, sedges and pale seed heads are **unnamed ecological growth-form candidates**, not verified local flora. Regional data/evidence is needed to assign taxa and community/seasonal abundance. Red/gold heath is a provisional seasonal visual state, not a global tundra default. Sparse Svalbard/Arctic-desert habitat must remain sparse; it cannot be covered in rich Alaska-like heath to satisfy the concept. RockIce remains a separate excluded case, never painted as tundra.

Use exposure, drainage, soil depth and rock fraction to choose connected communities. Match plants to substrate and suppress cover on exposed rock; increase mat continuity in suitable soil. Use oriented, warped community boundaries with varied lengths/widths, not a Voronoi/cellular color map. Across seeds, change shallow drainage routes, rock shoulder rhythm and community proportions within ecological bounds. Cross-region comparisons must preserve regional sparse exceptions rather than claim every tundra location can match this illustration.

### Required gaps and first gate

Remove new-study reliance on `brushGeometry` / painted savanna tufts, generic rosettes and rounded pigment cells. Develop dedicated mat/branchlet geometry and linked mineral/organic/leaf material; retain instancing and LOD infrastructure. First gate: ground-only and ground-plus-mat comparison at thumbnail and normal scale. Reject if still olive lawn, obvious stamps, isolated debris or an empty plane; only then add near leaf detail and seed heads.

## Implementation sequence after acceptance

Use three isolated parallel biome workstreams as requested, with one coordinated shared-contract owner to prevent renderer conflicts. No implementation is authorized by this document itself.

1. Save each new experiment's scope, source revision, reference IDs, inherited negative evidence and proposed representation before edits. Keep old R1–R4 and all rejected techniques recoverable.
2. Fit the concept panel camera and aspect first. Record normalized landmark/occupancy estimates and a same-aspect concept comparison. Only then validate the app's 16:9 composition and character capsule. Do not claim unique recovered camera parameters.
3. Build the first structural gate described above with minimal materials. Capture 640-pixel-wide concept-aspect hero and inspection views. Inspect actual content. A composition failure requires a structural correction, not leaf polish.
4. Develop coupled materials and ground vegetation, then directional light response. Use 1280-wide crops only for needles/leaves/alpha/contact problems. Use 1920 final comparisons only after a candidate passes the artistic gate.
5. Track draw calls, submitted triangles, vegetation counts, texture allocations and available frame timings per candidate. No mobile performance approval without device evidence. Costs must be compared with actual visual benefit; no density-only fix.
6. Preserve seeds 29/41/73 for development continuity, freeze recipe before selecting fresh unrevealed holdouts. The old holdouts 20717/23819/26123 are already seen and cannot be called new. Validate regional coordinates from the inventory, including Iceland birch edge, East Asian/Appalachian woodland and sparse Arctic tundra; identify where concept fidelity is ecologically inapplicable.
7. After shared changes, rerun all 13 protected views across seven retained environments and reject unintended changes. Keep current opt-in dispatch and season/weather/time separation.

## Concept-based acceptance gates

| Biome | Primary visual test | Rejection condition |
| --- | --- | --- |
| Boreal | Near bough/trunk enclosure, overlapping narrow crowns, moss/duff/rock floor and connected light pools | Open conifer park, cone blobs, lawn, unsupported species template or uniformly dark floor |
| Temperate | Connected canopy arch with small sky holes, supported branches, layered understory and luminous middle opening | Separate lollipop crowns, huge sky opening, bare brown stage, generic pale trunks |
| Tundra | Long shallow terrain flow, interwoven continuous low communities, intricate near mineral/leaf detail | Savanna brush reuse, repeated circular cells, isolated pasted tufts, flat monochrome plane |

Compare silhouettes, spatial occupancy, near/mid/far values, material scale and warm/cool distribution against the actual panel. Estimate occupancy by scene/vegetation masks when available; use RGB diagnostics only as warnings. A better metric is not artistic approval. Check the landscape at thumbnail size before detail work, and inspect with the sky cropped out to expose weak ground composition.

Each decision record must separate observation, hypothesized cause, attempted technique, render evidence, technical cost, better-than-previous judgment, good-enough judgment and explicit human preference. All rules in this document are **proposed**; previous technical evidence does not validate these new artistic hypotheses. No rule is globally promoted, no preference model is trained, and no new candidate is human-approved.

**Plan-review question:** Do these three construction directions capture the concepts well enough to proceed: bough-enclosed moss forest, connected broadleaf canopy, and continuous low heath tapestry?
