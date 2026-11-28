# Protected environment registry

This consolidation preserves the accepted regional artwork; it does not promote experimental adapters into automatic global selection. The existing Visual Learning Lab remains the authority for reference evidence and human preferences.

## Using the references

Open `/explore` and expand **Approved reference scenes**. Selecting a reference opens its complete canonical location, seeds, adapter flags and rendering state. Legacy URLs continue to work. Changing a seed or camera marks the view **Variation — unreviewed**; the restore link reloads the reference settings.

The metadata registry is [environment-registry.json](../../src/lib/forest/environment-registry.json). Its pure TypeScript resolver supplies existing renderer adapters and the explorer without importing Three.js into the editor. Fifteen accepted regional directions cover the fourteen existing RESOLVE biome families, with Puget and alpine sharing family 5. This is category coverage, not verified worldwide regional coverage.

JSON downloads retain the existing recipe and add a versioned `environmentSelection` manifest. It records the actual adapter, selected reference version, evidence limits, approval provenance and whether query/camera settings match the checkpoint. Ecological input tree records are not a census of renderer-generated vegetation. Individual inspection is unavailable for adapters whose generated specimens cannot be mapped reliably to input records; mixed adapters retain legacy picking with this limitation disclosed.

## Frozen evidence and verification

[baselines.json](baselines.json) pins the accepted master source, complete queries, hero/inspection cameras, render settings and loaded-asset hashes. Approval provenance points to the existing human batch acceptance; fresh captures are not new aesthetic approvals.

- [Validation record](validation.json)
- [Thirty matched image comparisons](../../artifacts/environment-registry/parity.json)
- [Before contact sheet](../../artifacts/environment-registry/before-sheet.png) and [after contact sheet](../../artifacts/environment-registry/after-sheet.png)
- [Browser checks](../../artifacts/environment-registry/ui-validation.json)
- [Existing forest-test failures and unchanged dependency proof](../../artifacts/environment-registry/legacy-test-baseline-proof.json)

Run the existing-probe wrapper against a running preview:

```powershell
node scripts/studies/environment-registry.cjs before
node scripts/studies/environment-registry.cjs after
node scripts/studies/environment-registry.cjs compare
npx tsx --test tests/environment-registry.test.ts tests/wave1-dispatch.test.ts tests/mediterranean.test.ts tests/alpine-recipe.test.ts tests/material-workbench.test.ts
npm run build
```

Do not overwrite the frozen `before` evidence when checking future changes; preserve it or choose an isolated worktree/artifact copy. Captures use 640×360, fixed cameras, wind disabled and identical exposure. Seeds 41 and 73 are resolver/variation tests in this milestone, not newly artistically approved scenes. Browser validation uses software WebGL and does not establish mobile performance approval.

## Scope and next step

The [bounded resolver expansion is complete](BOUNDED-COMPLETION.md): all 14 existing families now have 42 explicit regional envelopes, with a touch-friendly automatic preview picker. This is representative opt-in coverage, not worldwide routing or artistic approval of each transfer. Earlier milestone records below remain preserved.

The [bounded automatic resolver](BOUNDED-RESOLVER.md) now offers an opt-in transfer within nine audited regional envelopes, with explicit provenance gates and fallback reasons. Its variations remain experimental and unreviewed.

The [prairie extension](BOUNDED-PRAIRIE.md) adds Oklahoma, Pampas and Mongolian steppe envelopes to that same policy (twelve total), preserving the prior rules and withholding unsupported foreign plants and location-conditioned artwork.

Prairie is now [published for review](prairie-publication.json). The [local Mediterranean extension](BOUNDED-MEDITERRANEAN.md) adds France, Portugal and Italy (fifteen local rules), with native-range oak gates and unchanged matte restrictions; it has not been published or artistically approved.

[Representative pilot coverage is complete](COMPLETION.md): 42 audited trial locations across all fourteen existing biome families. This is an opt-in validation milestone, not global artistic approval or automatic geographic promotion.

The authorized next step is available as the [opt-in geographic pilot](GEOGRAPHIC-PILOT.md): three locations each for woodland, prairie/steppe and tropical dry woodland. Its experimental evidence and remaining catalogue gaps are kept separate from these accepted checkpoints.

No terrain, grass, tree, lighting or matte assets changed. No ecology catalogue, biome taxonomy or renderer framework was replaced. Registry metadata is engine-neutral; adapters remain Three.js implementations. Full per-specimen export and worldwide regional generalization remain future work. A geographic resolver pilot should be separately scoped and reviewed against these protected baselines before any expansion of automatic routing.
