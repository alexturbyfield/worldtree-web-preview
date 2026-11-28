# Bounded Mediterranean extension

Status: **local experimental transfer, unreviewed and unpublished**. The policy now contains fifteen regional rules across five existing families. The published preview remains the twelve-rule prairie milestone; production is unchanged.

Subsequent release: this previously local milestone is included in the [bounded completion preview](BOUNDED-COMPLETION.md). The original critique, tests and unreviewed artistic status below remain preserved.

## Construction and evidence gates

This extension adds the existing French, Portuguese and Italian Mediterranean trial scopes to `bounded-auto-v1`. The same actual ecoregion, biome, realm, botanical-country and 100 km engineering boundary gates apply. No nearest-region substitution or new taxonomy is introduced.

| Rule | New coordinate | Actual source intersection |
| --- | --- | --- |
| mediterranean-france | 43.85, 3.75 | ECO 799 / biome 12 / Palearctic / FRA |
| mediterranean-portugal | 38.5, -8.4 | ECO 805 / biome 12 / Palearctic / POR |
| mediterranean-italy | 42.8, 12.1 | ECO 795 / biome 12 / Palearctic / ITA |

All three contain country-native Quercus ilex and Quercus suber candidates in the existing catalogue. This is range evidence, not verified selected-point occurrence. Only those two names are eligible for the existing oak adapter. Shrubs and ground cover remain unnamed forms. Forest habitat is supported; other habitat requests retain the fallback.

The existing composition needs a holm-oak scaffold before it can mount its optional cork-oak hero. A cork-only palette, or a nonzero source scene without a drawable holm oak, now returns an explicit architecture/source fallback instead of declaring an empty woodland successful. Density zero remains an intentional tree-free control. No tree, material, terrain, camera or lighting implementation changed.

The existing shared matte pipeline already reads automatic regional metadata. Its 0.08-degree Hérault source-location restriction is retained, independently of the broader resolver envelope. The plate is withheld at all three new points. Unit tests verify that it still loads within the original source envelope. No Hérault landscape is exported to Portugal or Italy; no replacement terrain or coastline is invented.

## Rendered evidence and critique

- [Before audit](../../artifacts/bounded-mediterranean/before.json), [after audit](../../artifacts/bounded-mediterranean/after.json): actual polygons, botanical countries, source links, drawable source names and decisions.
- [Hero comparison](../../artifacts/bounded-mediterranean/comparison-hero-sheet.png), [elevated comparison](../../artifacts/bounded-mediterranean/comparison-inspection-sheet.png): matched seed 29, camera, wind disabled and 640×360. Before is the prior generic fallback; after is the existing Mediterranean adapter, including its lighting/atmosphere.
- [Freeze](../../artifacts/bounded-mediterranean/freeze.json), then Italian reserved seed **715903**: [hero](../../artifacts/bounded-mediterranean/holdout/italy-hero.png) and [inspection](../../artifacts/bounded-mediterranean/holdout/italy-inspection.png). No source changes followed the holdout.
- [Validation](../../artifacts/bounded-mediterranean/validation.json): ten views have zero changed RGB channels—accepted Mediterranean and prairie hero/inspection, plus the three previous automatic prairie encounters in both views. All protected-reference priorities also remain covered by tests. Other biomes were not recaptured in this pass.
- [Targeted tests](../../artifacts/bounded-mediterranean/tests.log): 79 passed. TypeScript and focused ESLint passed. No local full build/full suite or mobile-device approval claimed for this unpublished extension.

Visual-content interpretation was available. The implementing agent inspected both comparison sheets, individual French/Portuguese hero and Italian inspection images, and both holdout views. This is not independent critique or human approval.

**Retain as a routing prototype, not as globally approved artwork.** Sculptural cork-oak framing, holm crowns, pale rock groups, textured substrate and dimensional vegetation replace the sparse generic fallback. Tree architecture and material treatments are the previously retained implementations.

Largest remaining discrepancies:

1. **Major:** without the location-conditioned matte, the far ground becomes shallow and weakly articulated. Region-appropriate background development is required before artistic generalization.
2. **Major:** all three share a similar garrigue/path silhouette and unnamed shrub treatment. This is not evidence of locally appropriate limestone geology, plant communities, or measured land cover.
3. **Minor:** coarse foliage, grass alpha detail and pale rock materials remain visible, especially in elevated inspection. No aesthetic tuning was performed to conceal these inherited limits.

Development heroes/inspection submit 16 draw calls and 1,821,640–1,822,036 triangles; the holdout submits 16 calls / 1,822,036 triangles. These are existing adapter costs; no resolver geometry was added. Mobile frame time, texture bytes and alpha overdraw remain unmeasured.

**Experimentally supported:** regional oak and drawable-source gates prevent unsupported tree substitutions, while the existing matte guard works for automatic selections. **Not established:** regional visual identity or geological fidelity. Next step is human review of the transfer and a separately scoped, geographically justified continuation pass.

Source changes: `bounded-resolver.ts`, its policy JSON and focused resolver tests. Prior recipes and seed derivations remain unchanged. Pre-edit resolver/policy snapshots are preserved in `artifacts/bounded-mediterranean/source-before/`.
