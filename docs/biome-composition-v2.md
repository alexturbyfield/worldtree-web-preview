# Biome Composition V2 — first visual pass

[Matched comparison](../artifacts/wildloom-composition-v2-before-after.png) · [Capture counters and ecological evidence](../artifacts/wildloom-biome-v2-report.json)

## Scope

Added `src/lib/forest/composition-archetype.ts` and integrated it into `biome-visual.ts`. The original Puget path remains untouched: its new captured PNG is byte-identical to the V1 approved reference. No ecological records, tree species generators, atlases, or camera transforms changed. Existing V1 source work remains in the working tree.

`CompositionArchetype` works alongside `BiomeVisualProfile`: the biome limits eligible models and defines material/light families; the archetype defines spatial zones, foreground framing, landmark anchors, instance scale ranges, encounter opening, focal light mask, edge shade, distant contrast/saturation, and horizon height. Zones request canopy/palm/understory roles from the already eligible candidate pool, never add species. Placement and instance variation are deterministic. Structural and appearance seeds remain unchanged; scale is an instance transform over existing geometry.

Open Savanna uses one off-center landmark, a small companion group and reduced-scale distant silhouettes. Rainforest Interior uses foreground canopy trunks, overlapping lateral understory, eligible palm placements and rear canopy bands. Both reuse existing batched tree rendering, ground shader hooks and instanced vegetation. Counts stay at seven and 36 trees respectively. Generic ground fans are adapted into curved grass ribbons and arching broad leaves through the existing shared BufferGeometry/InstancedMesh dressing path, with no named plant occurrence implied. This does not implement botanical fern assets.

World-space ground colour uses a broad focal field, low-frequency broken illumination and cool foreground/edge attenuation. The existing physical shadow map remains; its soft-shadow radius is increased for these two archetypes. Background vegetation grading uses the existing attention shader. Distant horizon geometry is a gently varied shared mesh, not a terrain simulation. Original V1 dressing can be viewed with `&biomeComposition=v1`.

## Visual evaluation — stop after this comparison

| Criterion | Savanna | Rainforest |
| --- | --- | --- |
| Biome identity | More open, landmark-led and golden | More enclosed, humid and vertically layered |
| Focal point | Landmark reads clearly; clearing illumination is still modest | Central opening reads, but is not yet strongly luminous |
| Depth separation | Large landmark, grouped companions and quiet distant trees | Near trunk, understory and canopy layers now overlap; distant ridge remains too planar |
| Light and colour | Better foreground contrast; ground is still fairly uniformly ochre | Cool edges and atmospheric depth; focal contrast needs future review |
| Vegetation silhouette | Existing unnamed umbrella fallback has ragged protrusions; not a dedicated local species model | Existing trees/palms preserved; generic ground leaves are visibly coarse and angular |
| Encounter composition | Clearer hierarchy, not final-quality landscape art | Stronger enclosure, not yet the requested illustrated finish |

No automatic follow-up polish performed. Flat horizon exposure, coarse ground plants and fallback canopy quality remain explicit limitations, rather than grounds for changing approved tree generators in this pass. Savanna has no named ecological palette at this location: the conditional unnamed canopy study remains clearly labelled. Amazon candidates have documented broad regional ranges, not verified local occurrence.

## Checks and rendering cost

Same seed 29, structure `grove-1`, appearance `garden`, wind off. All captured camera transforms and tree counts exactly match V1. TypeScript, targeted repeatability/input preservation/eligible-palette/source-seed/missing-data checks passed. Final Chromium captures reported no page or shader errors. `git diff --check` passed (line-ending notices only).

| Scene | Trees | Calls V1 → V2 | Triangles V1 → V2 |
| --- | ---: | ---: | ---: |
| Puget | 43 | 19 → 19 | 675,089 → 675,089 |
| Savanna | 7 | 8 → 8 | 28,970 → 63,750 |
| Amazon | 36 | 19 → 19 | 564,810 → 714,124 |

Draw calls remain fixed. Added shared grass/leaf ribbon segments and changed selection of existing canopy variants raise triangles, especially rainforest (~26%). Counters are actual Chromium software-renderer captures, not Android frame-rate or GPU-overdraw measurements. Mobile hardware performance remains unverified; this is not a claim of meeting a measured device budget. No broad tests, build, deployment or further art iteration.

## Local preview

Run `npm run dev -- --port 3001`. Open the following routes (same camera/seed as the sheet):

- `/explore?lat=-2.3&lon=35.2&habitat=grassland&conditional=1&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human&composition=C`
- `/explore?lat=-3.12&lon=-60.02&habitat=forest&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human&composition=C`

Append `&biomeComposition=v1` for before. Puget retains its existing encounter URL and rendering path.
