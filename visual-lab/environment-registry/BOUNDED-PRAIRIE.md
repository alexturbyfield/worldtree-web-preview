# Bounded prairie extension

Status: **experimental, unreviewed**. The existing `bounded-auto-v1` opt-in now includes twelve explicit regional envelopes across woodland, boreal, tundra and prairie. Its prior nine rules and seed derivations are unchanged. No global recipe promotion or deployment occurred in this pass.

The user said “Looks great” about the previously deployed bounded-resolver preview, then authorized adding prairie. This is recorded as approval of that preview, not approval of these new encounters or every coordinate inside an envelope.

## Scope and ecology

| New rule | Actual development coordinate | Ecoregion / realm / botanical country | Representation |
| --- | --- | --- | --- |
| prairie-oklahoma | 36.7, -98.5 | 389 / Nearctic / OKL | Existing sourced regional ecological-site plant candidates; bottomland trees only with explicit conditional study enabled. |
| prairie-pampas | -35.2, -61.2 | 576 / Neotropic / AGE | Unnamed grass/forb forms, no imported Oklahoma shrubs or trees. |
| prairie-mongolia | 47.2, 107.2 | 734 / Palearctic / MON | Unnamed grass/forb forms, no imported Oklahoma shrubs or trees. |

The existing 100 km, ecoregion, biome, realm and botanical-country intersection gates still apply. This is an engineering bound, not measured current land cover. Both the map's default forest habitat and explicit grassland select an **open** prairie recipe; unsupported coastal, wetland, alpine and urban requests retain the fallback. A tree palette is not required to render a treeless biome.

Oklahoma's NRCS provisional ecological-site catalogue provides regional candidates, not verified occurrences at the selected point. Conditional tree metadata is restricted to render-eligible tree names present in both that land-cover catalogue and the actual resolved recipe palette. It does not assert a measured bottomland at the coordinate. No botanical research or new species claims were added.

## Implementation and evidence

The existing grass, rolling terrain, lighting, camera and dressing are reused. The one renderer change extends the existing location-conditioned matte guard from manual pilots to automatic regional selections. The Oklahoma artwork remains available in its source scope and is withheld in the Pampas/steppe. Physical terrain continuation remains visible. No new backdrop was fabricated for those regions.

- [Source/data audit before](../../artifacts/bounded-prairie/before.json) and [after](../../artifacts/bounded-prairie/after.json): actual polygon and botanical-country lookups, plant provenance, decisions and limits.
- [Matched hero comparison](../../artifacts/bounded-prairie/comparison-hero-sheet.png) and [elevated comparison](../../artifacts/bounded-prairie/comparison-inspection-sheet.png), seed 29, wind off, 640×360, same cameras per pair. Before is automatic fallback prior to this extension; after is selected prairie. This compares complete existing pipelines, not isolated material changes.
- [Frozen sources](../../artifacts/bounded-prairie/freeze.json) precede the Mongolian reserved seed **934713**: [hero](../../artifacts/bounded-prairie/holdout/mongolia-hero.png), [inspection](../../artifacts/bounded-prairie/holdout/mongolia-inspection.png). No source tuning followed the holdout.
- [Validation](../../artifacts/bounded-prairie/validation.json): eight protected views are pixel-identical—accepted prairie hero/inspection and previous automatic German woodland, Finnish boreal and Alaskan tundra hero/inspection. The unchanged remaining protected-reference routing is also covered by tests; this pass did not rerender every biome.
- [Targeted tests](../../artifacts/bounded-prairie/tests.log): 74 pass, including real-data prairie selection, determinism, conditional trees, foreign-plant rejection, unsupported habitats and all protected reference priorities. TypeScript and targeted ESLint pass. No full build, full suite or device-performance approval claimed.

Actual vision inspection was available and performed by the implementing agent, not an independent reviewer. The matched sheets and individual hero images plus both holdout views were inspected.

## Visual critique and decision

**Retain as a bounded routing prototype.** The previous bare fallback is replaced by dimensional side grasses, foreground substrate, layered light and rolling continuation. Oklahoma retains its conditional woody framing and distant artwork. Pampas and steppe stay open and tree-free.

Remaining defects, in priority order:

1. **Major:** Pampas and steppe share unnamed vegetation and pigment treatments; distinctive regional nonwoody communities are not established.
2. **Major:** Mongolia seed 29 has a near rise that masks much of the distant landscape. The held-out seed opens a deeper view; neither is newly artistically approved.
3. **Minor:** Elevated views reveal sparse geometric cover beyond the encounter and broad synthetic ground fields. Grass tips and conditional tree foliage remain coarse at review size.

Development heroes submit 14–24 calls and 716,776–911,174 triangles; inspection submits 14–22 calls and 716,776–911,170 triangles. The holdout submits 14 calls / 764,782 triangles. These are inherited adapter costs, not resolver-added geometry. Frame time, alpha overdraw and texture bytes were not measured on a mobile device.

**Experimentally supported reusable finding:** open-biome selection must not depend on a forest tree palette, and location-conditioned asset guards must inspect resolved regional metadata rather than only manual query flags. **Not established:** regional botanical fidelity, continuous geographic terrain or global artistic readiness. Preserve the fallback and request human review before further expansion.

Changed source: `bounded-resolver.ts`, policy JSON, prairie matte guard, dynamic area-count text in `EnvironmentReferencePanel.tsx`; focused tests and this Lab evidence. Existing source snapshots remain recoverable in `artifacts/bounded-prairie/source-before/`.
