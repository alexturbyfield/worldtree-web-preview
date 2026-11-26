import json,hashlib,pathlib,datetime
P=pathlib.Path
files=['src/lib/forest/alpine-recipe.ts','src/lib/forest/alpine-adapter.ts','src/lib/forest/painted-renderer.ts','src/lib/forest/savanna-recipe.ts','scripts/studies/visual-quality.cjs','visual-lab/alpine/recipe.json','visual-lab/alpine/recipe.schema.json']
P('artifacts/alpine-study/frozen-source').mkdir(exist_ok=True)
for f in files:P('artifacts/alpine-study/frozen-source/'+P(f).name+'.txt').write_bytes(P(f).read_bytes())
record={'date':datetime.datetime.now(datetime.timezone.utc).isoformat(),'retainedArtRound':'R2','rejectedRounds':['R0 technical/visual failures','R3 pyramidal geological representation'],'sourceHashes':{f:hashlib.sha256(P(f).read_bytes()).hexdigest() for f in files},'status':'frozen-before-holdouts','trainingSeeds':['29','41','73'],'holdouts':{'valley':'101','overlook':'131','treeline':'167'},'holdoutsGenerated':False,'noFurtherTuning':'Do not change frozen geometry or artistic parameters after holdout evaluation without a new experiment.'}
P('artifacts/alpine-study/freeze.json').write_text(json.dumps(record,indent=2)+'\n')
