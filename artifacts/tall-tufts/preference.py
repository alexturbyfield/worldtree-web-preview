import json,pathlib
p=pathlib.Path('visual-lab/procedural-tree-grammar.json');v=json.loads(p.read_text());v['latestHumanDirection']={'record':'visual-lab/feedback/sparse-crown-tall-tufts.json','scope':'User prefers original sparse C over fuller C2; this supersedes the agent preference for C2 fullness. Final grass scene remains unapproved.'}
for r in v['rules']:
 if r['id']=='TC-C2-volume':r['humanFeedback']={'record':'visual-lab/feedback/sparse-crown-tall-tufts.json','decision':'prefer sparse C; do not promote C2 fullness','note':'Prior automated observation is preserved as experimental evidence, not human approval.'}
p.write_text(json.dumps(v,indent=2)+'\n')
