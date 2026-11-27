# Desert / xeric shrubland Wave1

**Technical opt-in, rejected for artistic approval.** This is not a finished biome.

Preview `/explore?lat=34&lon=-116.15&habitat=forest&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&wave1=desert`. Seeds41 and final frozen holdout5189 are recorded. Existing generic comparison is `wave1=baseline`; artifact validation injects the same study camera in both cases. Inspection `[70,50,85]` target `[0,1,-25]`.

[Primary USGS reference](https://www.usgs.gov/media/images/joshua-tree-national-park-0), explicitly Public Domain, Phil Stoffer. Local reference and manifest are here. It was genuinely inspected. Rounded/interlocking granite, pale alluvial substrate, irregular xeric foliage and broken atmospheric ridges guided the experiment. No Joshua trees were added because the actual resolver yields no named species at this point; only its unnamed xeric-shrub form is used.

`wave1-desert.ts` retains source trees and palette and adds synthetic continuous terrain, three distant geometric ridge layers, instanced weathered outcrops/gravel and dimensional shrub forms. Existing sky asset is reused. No imagegen or downloaded production textures; shader ground treatment is experimental, not production-ready artwork. No terrain/weather/ecology inference from artistic parameters. Season, clear weather and warm oblique light remain separately recorded fixed presentation layers.

## Rejected visual outcomes

Round1: faceted rocks and absent near vegetation. Round2: smoothing helps rock silhouettes but shrubs resemble conifers. Round3: rounded lobes remove conifer shape but remain artificial; substrate inspection exposes repeated circular/grid patterns. Parent performed image-first critique independently of implementation, and rejects artistic approval. Holdout5171 has a dominating cropped boulder; do not tune to it. Three-round budget exhausted.

Major remaining issues: clay-like smooth granite, generic geometric shrubs, uniform/banded substrate, smooth distant mounds and limited robust composition variation. The stamped gravel addition was rolled back after training29 inspection; final source was re-frozen before fresh holdout5189. The conspicuous circles are removed, but the retained uniform ground remains inadequate. Neither technique may enter approved global recipes. No human approval or claim of completion.

## Evidence and checks

`artifacts/wave1-desert/` contains matched baseline/final hero+inspection29, seed41, held-out5189, source freeze/captures, initial/rejected snapshots and earlier revealed5171 and contact comparison. `npx tsc --noEmit` and `npx tsx --test tests/wave1-desert.test.ts` pass. Captures have no page errors.9 draws,285316 triangles,420 shrub instances,213 rock instances. No actual mobile-device/FPS approval; parent handles protected-scene regression after integration. No commit/push/deploy by this workstream.

Reusable candidates only: continuous shared contact-height field and batching of low vegetation/geology, with species evidence separate from reference art. Do not generalize this material, shrub model, hero outcrop position or ridge shape until a later reference-based representation study succeeds.
