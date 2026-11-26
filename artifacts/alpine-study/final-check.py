from pathlib import Path
import json,hashlib
p=Path('visual-lab/README.md');s=p.read_text(encoding='utf-8');insert='''
## Alpine cross-biome experiment

[Report and art-direction checkpoint](../artifacts/alpine-study/REPORT.md) · [Recipe/schema/grammar](alpine/README.md) · [Actual compositions](../artifacts/alpine-study/compositions.png) · [Palette states](../artifacts/alpine-study/palettes.png).

The first alpine study uses the existing renderer with a pure procedural plan and opt-in adapter. Three composition families, three palette states,9 training cases and3 post-freeze holdouts were evaluated. R3 geology was rejected; R2 is retained only as the strongest **technical** checkpoint. **None meets the artistic target or has human approval.** Major terrain/conifer/composition defects and a treeline budget miss are documented. Protected Puget, rainforest and retained savanna captures are pixel-identical. See the separate authorized [alpine controller](alpine/controller.json); do not reset its exhausted correction budget or treat revealed holdouts as unseen.

'''
marker='## Review the current experiments'
assert marker in s;s=s.replace(marker,insert+marker,1);p.write_text(s,encoding="utf-8")
f=json.loads(Path('artifacts/alpine-study/freeze.json').read_text());assert all(hashlib.sha256(Path(path).read_bytes()).hexdigest()==sha for path,sha in f['sourceHashes'].items());print('All final frozen runtime sources unchanged after holdout evaluation.')
r=json.loads(Path('artifacts/alpine-study/validated-training-results.json').read_text());print('Training cases:',len({(x['family'],x['seed']) for x in r}),'Palette state checks:',len([x for x in r if x.get('paletteInvariant')]),'Ecology violations:',sum(x['ecology']['violations'] for x in r));h=json.loads(Path('artifacts/alpine-study/holdouts.json').read_text());print('Holdouts:',[(x['family'],x['seed']) for x in h]);print('Protected pixel identities:',[x['pixelIdentical'] for x in json.loads(Path('artifacts/alpine-study/regression.json').read_text())]);

