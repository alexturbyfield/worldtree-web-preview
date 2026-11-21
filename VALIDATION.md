# Validation status

- ESLint: passed.
- TypeScript: passed.
- Automated TypeScript tests: 49 passed, including 148 catalog comparisons against the original Python and a test of the generated browser lookup worker against actual gzip geographic tiles.
- Original Python tests: all 15 passed without changing their source.
- Data integrity: all 463 tile hashes, display hash, and byte-preserved catalog files passed.
- Dependency audit at installation: zero vulnerabilities reported.
- Next.js production build and static export: passed.
- Production-output local HTTP checks: page, geographic manifest, display overlay, lookup tile and both worker assets returned 200 with appropriate content types.
- Initial browser review at a 390 × 844 viewport: responsive layout inspected. This exposed a MapLibre worker URL problem, subsequently fixed by explicitly bundling/copying and serving both workers. Final production browser and touch-flow verification remains pending because a Windows Firewall prompt blocked the browser. The Python server that caused the prompt was stopped; its replacement binds only to 127.0.0.1.
- GitHub: private repository created and source pushed to `https://github.com/alexturbyfield/worldtree-web-preview`.
- Vercel authentication: succeeded. Project created; no deployments made. CLI refused an initial Preview because its first deployment must be Production. A blank baseline requires the user's explicit exception to the preview-only instruction. No public preview URL exists yet.

Scientific limitations: 18 coarse locality profiles, 62 taxa, 71 provisional associations, no verified species-range or ecoregion joins. Urban pools cover only the three original city presets. Search covers named catalog regions and arbitrary coordinates rather than worldwide street addresses. Offline caching covers the app shell, bundled display geography and downloaded lookup tiles; new tiles and OpenStreetMap street detail require a connection.
