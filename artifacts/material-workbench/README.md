# Material Workbench v0.1

Branch: `feat/material-workbench`. Baseline: `8a1d39b0d41ff5251525aac5b007b52b76c8c667` (the requested hash omitted `b76c8`). No source commit, push or production promotion performed.

Open `/explore?lat=36.5736504415&lon=-98.3419281896&habitat=grassland&conditional=1&seed=29&density=36&structure=grove-1&appearance=garden&wind=0&expansion=prairie&workbench=1`, expand the bottom-right workbench and enable overrides. The editor starts disabled each visit; the locally autosaved preset is retained. Reference images stay in memory on-device. Tap the uploaded image to sample into the selected pigment. Locks protect editing, resets and imports. Unlock before resetting a protected parameter. Export/import uses prairie preset schema version 1.

## Implementation
- `src/lib/material-workbench.ts`: typed engine-neutral parameter descriptors, validated versioned presets, locks/reset/import/export and editor events.
- `src/lib/forest/prairie-material-bindings.ts`: per-scene shared mutable uniforms, original-relative rock tint and bounded existing-instance coverage; increments existing artRevision.
- `src/lib/forest/wave3-prairie-dressing.ts`, `wave3-prairie.ts`: shared uniform binding only. Existing scene construction, geometry, camera, lighting and placement retained.
- `src/components/MaterialWorkbench.tsx`, `MaterialWorkbench.module.css`: opt-in collapsible touch editor, local persistence, reference sampler and JSON workflow.
- `src/components/ForestExplorer.tsx`: opt-in editor mount and query-flag preservation.
- `tests/material-workbench.test.ts`: serialization, invalid input, lock/reset/import and default/disabled binding preservation.

## Verification
`npx tsc --noEmit` passed. Seven focused tests passed across material-workbench, prairie-ground-lighting, prairie-land-cover and prairie-tree-finish tests. Browser validation in `validation.json`: disabled overrides and enabled defaults pixel-identical to pre-edit baseline; before/reset pixel-identical; wind-off live invalidation without remount; 24 calls, 1,002,290 triangles and 23 geometries both before/edited. Reduced rock coverage never adds geometry. Reference sampling, lock/reset behavior, invalid-import handling and 390px mobile panel bounds passed. Baseline and edited 640x360 images were actually visually inspected; edited ground/grass becomes warmer, composition remains unchanged. This verifies an editor, not new artistic approval.

## Limitations
Prairie bindings only. Rock color is a relative tint preserving distinct baseline stone batches. Coverage hides/restores a deterministic prefix of existing instances (0–100%); it does not introduce more rocks or new placement. Existing bump scale and lighting are retained. No spatial painting, named preset library, cross-device storage or physical-mobile performance approval. Reference images are not saved with presets. Rendering measurements are desktop headless SwiftShader submission counts, not device performance. Existing other-biome shaders and recipes were untouched; no broad protected-scene capture suite was run.
