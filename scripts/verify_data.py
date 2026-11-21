from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1]
data=root/'public/data/resolve-2017'
m=json.loads((data/'manifest.json').read_text(encoding='utf-8'))
assert m['feature_count']==847
assert len(m['tiles'])==463
assert hashlib.sha256((data/'display.geojson').read_bytes()).hexdigest()==m['display_sha256']
for key,info in m['tiles'].items():
    p=data/'tiles'/f'{key}.geojson.gz'
    assert p.stat().st_size==info['bytes'],key
    assert hashlib.sha256(p.read_bytes()).hexdigest()==info['sha256'],key
for name in ['profiles.json','species_associations.json']:
    assert (root/'data'/name).read_bytes()==(root/'prototype/worldtree'/name).read_bytes(),name
print('Verified 463 geographic tile hashes, display hash, and both unchanged prototype catalog files.')
v08=root/'public/data/v08'
if (v08/'manifest.json').exists():
    global_manifest=json.loads((v08/'manifest.json').read_text(encoding='utf-8'))
    for name,expected in global_manifest['files'].items():
        assert hashlib.sha256((v08/name).read_bytes()).hexdigest()==expected,name
    provenance=json.loads((v08/'provenance.json').read_text(encoding='utf-8'))
    for name,expected in provenance['files'].items():
        assert hashlib.sha256((root/'data/global'/name).read_bytes()).hexdigest()==expected,name
    assert (root/'data/global/taxa.json').read_bytes()==(v08/'taxa.json').read_bytes()
    print('Verified v0.8 public assets, normalized catalog provenance hashes, and matching public/source taxon data.')
