# Temperate prairie / steppe: reference-led construction plan

Status: supplied concepts inspected; construction proposal only. No scenery implementation, new bitmap generation, commit, push or deployment in this pass. Existing approved scenes and the live build remain unchanged.

## Inputs actually loaded

AGENTS permanent operating rules; Visual Learning Lab README and approval records; existing global inventory; visual-review skill; actual supplied images 1, 2 and 3; savanna representation all-rejected report; retained savanna brush/reed implementation; alpine ground/vegetation pigment integration. Image-content interpretation is available and was used. This is primary-agent analysis, not independent review or user approval of a new recipe.

## Reference interpretation, before construction

**Primary: image 3 (`prairie-wave3-primary`).** Dark foreground grass and vegetation overlap a luminous middle-distance field; height, color and light vary in connected swaths. Fine lit grass tips emerge from those larger forms. Flower clusters occupy selected pockets rather than evenly decorating the landscape. Distant land progressively loses contrast and becomes cooler. The center is readable because nearby plants are lower and sparser, not because a circle has been cut out of the world.

Three most important relationships:

1. Broad shadowed olive/emerald masses establish the landscape before individual blades resolve. Golden tips and seedheads follow the same swaths instead of becoming unrelated glitter.
2. Taller side silhouettes overlap shorter middle grass; a low central opening leads toward uninterrupted grassland. Negative space supplies depth and scale.
3. Rich, high-contrast foreground color steps smoothly toward luminous straw and cool blue-violet distance. Flowers are chromatic punctuation, not the dominant texture.

**Secondary: image 1 (`prairie-wave3-secondary-light`).** Strong sun-facing edges contrast with cool leaf/bark/rock interiors, and small ground forms anchor larger ones. Its wooded enclosure, large trunk and dirt route are observed, but are unsuitable default prairie structure.

**Secondary: image 2 (`prairie-wave3-secondary-palette`).** Sage/straw vegetation, purple flower accents and warm stones coordinate with cool distance. Its coast, cliffs and mature woody cover are observed visual content, not geographical evidence or a prairie prescription.

**Written brief takes precedence:** no mandatory hero trees, woodland canopy, trail, coastline, large rock formations or unsupported mountains. Do not copy flower species or tree positions from any illustration. The primary image is itself a wooded grassland edge; retain its grass/light relationships while allowing the actual site to be treeless.

## Construction hypothesis

An attractive prairie should read as a continuous living surface with fine-dimensional detail emerging from shared material, growth and illumination fields. Reuse the successful ground-root integration and soft brush/reed division of labor, rather than placing isolated tufts over a generic plane. The early savanna A/B/C constructions remain rejected: faceted patches, skeletal debris and material-only bare earth are negative examples, not starting defaults.

| System | Proposed construction | Visible test |
|---|---|---|
| Composition | Human-height camera, wide 16:9 view. Low front-center grasses; taller irregular side masses. Keep the horizon open. | Standing-character clearance and visibility without an empty disk, path or foreground wall. |
| Terrain | Low, connected rolls and gentle drainage; scalable near/middle/far ground continuation. Strong relief only with regional terrain evidence. | Landscape reads as miles of grassland at thumbnail and inspection scales, with no repeating ridge wall or exposed edge. |
| Ground | Continuous world-space olive, straw, sage, muted emerald and dark-earth communities. Broad flow plus restrained painterly detail; independent soil/moisture/exposure and lighting inputs. | Ground-only view reads as grassland rather than ochre dirt, noisy cells or a tiled lawn. |
| Near grasses | Curved overlapping blade/tussock geometry, soft painterly brush fill and selective dimensional feathered seedheads. Vary root positions, width, height, lean and orientation within coherent communities. | Parallax and irregular lit silhouettes without opaque strips, star mats, hard card edges or vertical atlas bands. |
| Middle grasses | Connected lower-detail swaths using the same palette, growth and flow fields. | Large/medium shapes remain readable as fine detail falls away. |
| Far grasses | Primarily terrain pigment and soft low silhouettes; optional quiet grassland matte only if geometry continuation proves insufficient. | No identical repeated bushes, horizontal color bands, distant geometry glitter or visible tiling. |
| Dirt transitions | Bare earth emerges where the same growth field weakens; irregular small patches and gradual root blending. | Soil breaks up the surface without making a deliberate trail or large barren stage. |
| Flowers | Batched low forbs in irregular habitat-conditioned communities; muted accents with occasional rich foreground blooms. | Flower identity remains readable near the camera without a carpet of saturated dots. |
| Shrubs/trees | Conditional on actual regional/habitat support; omit woody framing by default. Use supported source architecture, not a savanna acacia substitute. | Treeless seeds remain compositionally attractive. Wooded margins do not become a categorical prairie property. |
| Rocks | Embedded occasional stones only where substrate context supports them. | No decorative boulder collection replacing grassland structure. |
| Lighting | Low directional key with warm tip illumination, cool shadowed grass bases, delicate broad shadows and restrained translucency. Season/weather/time remain independent reference-state layers. | Selective yellow-green/straw highlights, readable dark masses, no white tips, black grass or global exposure substitute. |
| Atmosphere | Smooth distance reduction of contrast/detail and cooler blue-violet pigments in far land. Clear near field. | Distance feels expansive without a fog curtain, mountains or a forest-wall backdrop. |

These are implementation hypotheses, not demonstrated or universal rules. No new global grammar approval is inferred.

## Ecology and representative cases

The existing map category is RESOLVE **8**, not a new taxonomy. Local metadata supplies useful candidate audit cases:

- 389 Central-Southern US mixed grasslands: 36.5736504415, -98.3419281896.
- 734 Mongolian-Manchurian grassland: 45.1511473605, 118.6133970439.
- 578 Patagonian steppe: -43.0765645480, -69.2505809147.

These are catalogue audit points, not completed fresh tile lookups or evidence for local vegetation. Validate routing before using them. Test differences in moisture, soil exposure and woody eligibility rather than repainting one North American scene globally. Flower forms visible in the concept do not establish species presence at any point. The current catalogue is woody-focused; grasses, forbs and seedheads must remain labelled functional-form studies until regional nonwoody records exist. Unknown measured terrain or habitat data must remain unknown; synthetic art fields are explicitly presentation data.

## Smallest implementation slice, once started

Use an opt-in biome-8 adapter through the existing dispatcher. Reuse the current renderer, batching/instancing, ground/vegetation palette integration, terrain continuation and rock-clearance tools. Keep shared changes narrowly scoped and protect all ten approved recipe directions. Do not import an entire savanna scene, its tree composition or its geology as the prairie implementation.

The most useful new capability is a meadow community field coordinating blade/tussock height, density, exposed soil, flower abundance, local pigment and directional flow. Keep that description deterministic and engine-neutral; the existing Three.js adapter consumes it. No separate Art Bible, world generator or framework.

## Staged visual gates

1. **Ground and depth:** capture ground-only and a simple height/massing view at 640x360. Fix large-scale flow, horizon/continuation and the staging transition before adding detail.
2. **Integrated grass:** introduce near/middle representation and sparse seedheads. Inspect 160x90 thumbnail, normal image and targeted detail crops. Revert disconnected color, noise, hard strip shadows or inappropriate anatomy.
3. **Complete prairie:** add localized flower communities and conditional dressing. Inspect hero, rotated and elevated views for seeds 29 and 41, then freeze before revealing a fresh holdout. Use the reference state for matched comparisons and a second lighting state to check material response.

Measure submitted triangles/draw calls, instance counts, texture memory, shader/asset errors and available frame time. Coarse-pointer devices need explicit budgets and real-device evidence; software screenshots do not approve mobile performance. Technical checks detect failures, not beauty. Preserve rejected images and stop after two uninformative attempts on the same problem; change representation instead of increasing density.

No runtime change was made here, so no build/test or new scene render was warranted. The next concrete experiment is Gate 1, using image 3's large light/shadow and vegetation masses while following the written open-prairie constraints.
