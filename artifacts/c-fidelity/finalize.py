from pathlib import Path
p=Path('src/lib/forest/painted-renderer.ts');s=p.read_text().replace("if(requestedTree==='C2'){const m=", "if(requestedTree==='C2'&&directLighting){const m=");p.write_text(s)
p=Path('scripts/studies/visual-quality.cjs');s=p.read_text().replace("alphaCoverage:'No alpha test or transparency for dimensional grass; opaque depth-tested geometry, not a claim of zero fragment overdraw.'", "alphaCoverage:batches.every(o=>!o.material.alphaTest&&!o.material.transparent)?'No alpha test or transparency in these grass batches; opaque depth-tested geometry, not a claim of zero fragment overdraw.':'Alpha handling is recorded per batch; no hardware overdraw measurement.'");p.write_text(s)
import json,hashlib
p=Path('artifacts/c-fidelity/experiment.json');v=json.loads(p.read_text());
for f in v['sourceHashes']:
 v['sourceHashes'][f]=hashlib.sha256(Path(f).read_bytes()).hexdigest();Path('artifacts/c-fidelity/final-source/'+Path(f).name+'.txt').write_bytes(Path(f).read_bytes())
p.write_text(json.dumps(v,indent=2)+'\n')
