# Live environment review

This release publishes the user-selected painted alpine meadow for real-device review. It does not approve its performance. Existing renderer performance controls remain available; no new UI was added.

Use the same device, browser, viewport and seed for both alpine links, let assets finish loading, then run **Profile 5s orbit**. Record FPS, median/p95 frame interval, renderer, pixel ratio and triangles. CPU submission is not GPU time. Desktop SwiftShader comparisons showed a large slowdown despite fewer draw calls/triangles; real phone performance is not yet measured.

- Painted alpine: `/explore?lat=51.17&lon=-116.18&habitat=forest&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&alpine=treeline&palette=A&backdrop=subtle&alpineArt=meadow&meadowField=brush`
- Previous alpine: same URL with `meadowField=legacy`.
- Retained savanna: `/explore?lat=-2.3&lon=35.2&habitat=grassland&conditional=1&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human&composition=C&groundLighting=B&illumination=on&pretty=on&treeStudy=C3&labCandidate=r-fidelity-tuft-cohesion`
- Rainforest: `/explore?lat=-3.12&lon=-60.02&habitat=forest&rainforest=v5&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human&composition=C&groundLighting=B&illumination=on&pretty=on`
- Puget: `/explore?lat=47.6062&lon=-122.3321&habitat=forest&conditional=0&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&encounter=1&camera=human&composition=C&groundLighting=B&illumination=on&pretty=on`

Alpine defaults now enable the painted field, composed meadow and subtle distant backdrop. Explicit `meadowField=legacy`, `alpineArt=off` and `backdrop=legacy` preserve earlier opt-outs. `conifer=legacy` retains the original shared conifer representation. Existing seeds, tree architecture and ecological source data remain intact.

The user's style selection and deployment authorization are recorded separately from performance approval in `visual-lab/feedback/alpine-painted-field-selection.json`. Historical rejection/source freezes stay unchanged. Large `artifacts/` evidence is preserved in Git but excluded from Vercel upload. Private reference-image derivatives remain local; generated production artwork is included. No merge to main.
