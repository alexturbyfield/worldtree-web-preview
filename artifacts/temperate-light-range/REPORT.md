# Temperate lighting range and leaf shadows

[Concept / before / retained](comparison.png) | [Structured critique](review.json) | [Validation](validation.json)

[Preview](http://localhost:3001/explore?lat=50.5&lon=10.5&habitat=forest&expansion=temperate&seed=29&density=36&structure=grove-1&appearance=garden&wind=0)

## Values and artistic interpretation

Display-space Rec709 luminance, 0-255; each cell is **P05 shadow / P95 highlight / P99 bright accent**. These are robust image-distribution anchors, not physical light intensities or exact min/max. Reference foliage uses a manually selected upper region and green/gold chroma filter, reference wood a near-birch polygon, and soil a central brown region. Render values use actual material-ID masks; dirt additionally excludes green moss. The reference and render have different shapes, species mix and distributions, so matching the numbers alone would not approve the image.

| Material | Concept | Before | Retained |
|---|---|---|---|
| foliage | 43 / 220 / 242 | 57 / 116 / 142 | 48 / 191 / 225 |
| wood | 14 / 121 / 186 | 17 / 194 / 219 | 9 / 160 / 203 |
| soil | 53 / 222 / 236 | 34 / 107 / 126 | 34 / 140 / 165 |

Foliage now reaches a much broader highlight range while preserving cool interior greens. The retained dirt reaches isolated values around 214, but its highlight coverage and median remain below the concept. A stronger broad-field treatment brought soil P95 to 207; actual inspection rejected it because it washed out the foreground. The retained treatment confines that gain farther into the clearing.

## Changes

Three opt-in runtime files only:

- `wave2-temperate-concept.ts`: explicit `temperateFoliageResponse` shadow/body/sunlit pigments, interior strength and highlight gain/strength. Sun-facing upper/exterior foliage receives the wider range; actual sun power still drives it. The existing world-space clearing field gives a stronger art-directed diffuse response to the middle-distance ground, with a shorter near transition. This is a lighting approximation, not physical GI. Global exposure and key intensity stay unchanged.
- `wave2-temperate-surfaces.ts`: canonical wood previously cast shadows but **did not receive them**. It now receives the existing actual alpha-tested crown shadow map; sapling wood also receives shadows. Reduced flat bark bounce reveals cool leaf-pattern shade. Dirt/litter albedo is lightened in linear material space, preserving the original texture and independently blended moss. No new bitmap, emission, painted bark cookie or screen-space shadow overlay.
- `wave2-temperate.ts`: tighter 60 m near shadow span, lower normal bias, stronger physical shadow response, and a 2048 desktop shadow map. Coarse-pointer devices retain 1024.

No tree geometry, source ecology, seed, placement, camera, sky, UI or global renderer change. Background remains quieter than near crowns. The source PNG is unchanged; the local dirt albedo adjustment is reversible.

## What the images demonstrate

Matched bark views show actual leaf-pattern shadow breakup on previously flat trunks and branches. Hero views have brighter warm crown accents against deep green interiors and lighter textured dirt in the middle ground. Seeds 29 and 41 plus frozen holdout 1529371 retain the encounter opening. Actual images were inspected by the primary agent; no independent or human artistic approval claimed.

Remaining major gaps: coarse/large leaf sprays, simplified branching, bright faceted ferns and less highlight coverage than the concept. These limits cannot be solved indefinitely through light gain. The next useful representation test is a smaller-scale layered leaf/spray and branch-support study, rather than stronger global lighting.

## Checks and cost

Targeted TypeScript and deterministic/source-geometry checks passed. Camera, source tree transforms and branch endpoints/radii are unchanged. Seven Puget, savanna, rainforest and alpine regression views are pixel-identical. No full build/lint suite.

Steady capture counts remain 15 draw calls and 942962 triangles (seed 29), 968442 (seed 41), 893224 (holdout). Desktop shadow-map color storage increases by approximately 12 MiB, with additional depth/driver overhead. No mobile GPU/alpha-overdraw approval. Shadow rendering costs are not represented by warmed steady-frame counters alone.

Frozen source hashes remain intact after the holdout. Sources, masks, original and rejected screenshots are preserved in this directory. Baseline semantic masks were generated from identical, unchanged geometry after correcting the unlit-ID capture; they do not infer vegetation from RGB. No commit, push, deploy or global promotion.
