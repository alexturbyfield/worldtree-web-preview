# Independent concept versus retained variation checkpoint

Loaded: AGENTS, prototype-fast/visual-review skills, Lab workflow/policy, variation/depth/rebuild records, actual concept comparison and retained hero renders. Vision: actual image interpretation by root, not an independent reviewer. No human candidate approval inferred.

## Desert
1. **Critical: weak framing and geological hierarchy.** Concept has a large connected upright/slumped rock shoulder and low basal forms. Current image has small rounded props on a vast plane; the near shrubs dominate more than geology. Replace the assembly representation and its scale hierarchy, retaining open horizon and walkable center.
2. **Major: surface values lack mineral structure.** Concept has warm compacted earth, pale weathered facets, gravel and cool irregular shade. Current foreground is a soft brown smear, with tiny dots that contribute little at review scale. Coordinate multiscale mineral pigments and physical rock contact, avoid adding random counts.
3. **Major: sparse unreadable growth forms and shallow recession.** Concept uses low green shrubs/grass around mineral anchors and progressively smaller formations. Current shrubs are leggy, high contrast and disconnected. Improve leaf mass and anchor vegetation to geological shelter; preserve regional uncertainty.

## Mangrove
1. **Major: insufficient luminous openings.** Concept mixes golden leaf edges and wet foreground pools with deep cool canopy. Current canopy is saturated flat green and the foreground evenly dark brown. Target directional material response and broken canopy light, not exposure.
2. **Major: sediment materials collapse together.** Dry mud, wet reflective sediment, litter and mineral fragments have little distinct response. Preserve texture contrast while sharing warm/cool light fields; tie roughness to height above water.
3. **Major: crown and root depth remain stylized.** Layered concept crowns have rounded masses/negative space; current cards and slender trunks remain legible. Preserve required source architecture/layout; improve crown-scale light rather than invent local species.

## Flooded
1. **Major: lawn-like values.** Concept has rich golden/olive connected grass masses with shadowed bases. Current grass and terrain are gray-green with abrupt dark fan clumps. Coordinate material pigments with height and spatial fields.
2. **Major: angular repeated fans.** Concept has flowing, overlapping silhouettes. Current near ribbons have sharp repeated angles. Test narrower, more arched blades without additional instances or individual shadows.
3. **Major: weak transition detail.** Concept has muddy sediment, shallow margins and layered low grass; current material reads as repeating marks. Preserve mosaic, use irregular exposed soil and multiscale detail restrained by distance.

`baseline-measurements.json` records display-space luminance, HSV saturation, red-minus-blue and dark-pixel fraction in fixed image strips. These are diagnostic proxies, not linear irradiance, semantic material masks or artistic approval. Silhouette/occupancy and shoreline assessments above are visual estimates: concept rock/vegetation framing occupies roughly 35–45% of desert lower view vs roughly 15–25% retained; wetland water stays principally in a narrow middle strip in retained views vs interleaved openings in concepts. Preserve wetland layout this pass, report that residual difference.

Hypothesis: foreground geological scale hierarchy plus a coordinated final world-space material adapter produces a much larger visible gain than more instance counts. New adapter remains opt-in, with all prior modes intact. First gate: isolated rock assembly before judging full scene. User explicitly authorized progress-based rounds; record all rejected results and stop/change representation after two failures on a specific issue.
