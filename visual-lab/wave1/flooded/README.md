# Flooded grassland Wave 1 checkpoint

Preview `/explore?lat=26.209957419&lon=-80.9383825925&habitat=wetland&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&camera=human&wave1=flooded`.

The coordinate resolves to Everglades flooded grasslands, ECO_ID581 / RESOLVE9. The original resolver has no supported local tree palette here; no arbitrary tree or named local sedge species was inserted. Vegetation is explicitly unnamed open-groundcover grass/sedge growth form.

Read `reference-analysis.json`, `review.json`, and `freeze.json`. Source snapshots, matched baseline/candidate images, thumbnails, capture scripts and raw performance data live in `artifacts/wave1-flooded/`.

Reproduce after starting the development server on3004:

- `node artifacts/wave1-flooded/capture.cjs r3` — matched generic baseline/candidate, seed29.
- `node artifacts/wave1-flooded/validate.cjs` — frozen recipe seeds29/41/holdout613, hero/inspection, field continuity/determinism and renderer diagnostics.
- `npx tsx --test tests/wave1-flooded.test.ts` — source population preservation and continuous deterministic fields.

All screenshots were genuinely interpreted by the flooded task agent. Root independently reviewed R1 against the NPS photo before reading its implementation. Agent preference is separate from human approval. Three rounds were used; R3 is retained provisionally for review, **not visually approved**.

Important limitations: mechanical banks and insufficient distant vegetation remain; procedural seed layouts are too similar; water reflects only the sky texture, not local geometry; the field is synthetic microtopography, not surveyed hydrology. Season is inherited, weather is a fixed clear study state, and time of day is a separate fixed light state. Mobile hardware was not tested.

References: USGS and NPS public-domain photographs; licenses/provenance are recorded per image. Add future references to the existing Lab manifest rather than creating another reference system.
