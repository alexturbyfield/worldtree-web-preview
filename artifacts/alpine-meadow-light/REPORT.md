# Alpine meadow light and treeline study

[Before/after hero and inspection](comparison.png) · [Thumbnail](thumbnail.png) · [Structured evidence](experiment.json)

The supplied reference uses dark, cool conifer and meadow framing around a luminous golden opening, with pink/purple/cream flower banks and progressively quieter tree silhouettes. Actual reference and rendered screenshots were visually interpreted; this is an agent provisional judgment, not human approval.

## What changed

Only two runtime files changed: `src/lib/forest/alpine-recipe.ts` and `alpine-adapter.ts`. New opt-in `alpineArt=meadow` retains the previous fallback. Additions: shared world-space ground/grass pigment fields; cooler foreground and irregular warm opening; lower ambient fill and stronger directional/shadow contrast; gentle midground shoulders; a single batched irregular treeline; 612 additional flower instances clustered along the opening. Existing ground detail texture, rocks, sky, backdrop and primary tree architecture remain. No new assets or dependencies.

The art-directed value field is independent from physical tree shadows; it remains on the terrain when the camera moves. Actual tree/rock directional shadows remain active. This is not a screen vignette. The illustration remains distant and synthetic, with no claim of regional geographic evidence.

## Observation and limits

Three bounded rounds: thin treeline and hidden highlight patch → broader boughs/shoulders and relocated light → suppression of warm foreground leakage and darker lower boughs. Final seed29 and41 show a cool foreground, warm middle opening and clearer flower banks. Normal views, elevated views, thumbnail and an approximately90-degree rotation were actually inspected. The rotation still exposes flat lateral continuation and the repeated distant panorama. Conifers remain visibly geometric, flowers still repeat spike construction, and ground detail lacks the concept's rich brush-shaped masses. Better than the prior study; not a finished or human-approved environment. No full-resolution final approval image.

## Performance and checks

Seed29 hero: 12→13 draw calls, 583316→663056 triangles (+13.7%). Inspection: 438212→517952 triangles. 286 batched middle/far tree silhouettes;22 original detailed conifers;764 flower clumps;3448 grass/low clumps;15 rocks. Seed41 hero:675193 triangles. The scene remains above the earlier550k provisional triangle target; no phone test or mobile approval. No additional texture memory. Grass casts no individual hard shadows.

TypeScript passes;3 existing alpine recipe tests pass. Captures report no shader/page errors; implemented plant constraints show0 violations and plant-rock clearance0 overlaps. These are technical checks, not aesthetic approval. [Alpine fallback pixel comparison](fallback-regression.json) verifies the unmodified opt-out hero/inspection. Puget/savanna/rainforest were not recaptured; no new regression claim for them. No commit, push or deployment.

## Preview

http://localhost:3001/explore?lat=51.17&lon=-116.18&habitat=forest&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&alpine=treeline&palette=A&backdrop=subtle&alpineArt=meadow

Remove `alpineArt=meadow` for the previous study; add `camera=inspection`, or use seed41. This artistic treatment is tuned to paletteA; other palette states need separate visual review. Source baseline text snapshots, round images and capture scripts remain here. Stop for user review; the next highest-value work is a softer conifer/forest-edge representation and continuous low lateral shoulders rather than more density.
