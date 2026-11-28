const fs=require('fs'),{spawnSync}=require('child_process');
const stage=process.argv[2]||'holdout';
const freeze=JSON.parse(fs.readFileSync((process.env.ARTIFACT_ROOT||'artifacts/wave2-concepts')+'/freeze.json'));
let args=['artifacts/wave2-concepts/capture.cjs',stage],env={...process.env};
if(stage==='holdout'){env.HOLDOUTS=JSON.stringify(freeze.holdouts);args.push('boreal,temperate,tundra');}
else if(stage==='regional'){const inventory=JSON.parse(fs.readFileSync('visual-lab/global-expansion/inventory.json')),cases={};for(const [id,expansion]of [['boreal-canada','boreal'],['boreal-siberia','boreal'],['boreal-birch-edge','boreal'],['temperate-appalachia','temperate'],['temperate-eastasia','temperate'],['tundra-siberia','tundra'],['tundra-svalbard','tundra']]){const p=inventory.locations.find(p=>p.id===id);if(!p)throw Error(id);cases[id]={query:`lat=${p.lat}&lon=${p.lon}&habitat=forest`,expansion};}env.CASES=JSON.stringify(cases);args.push(Object.keys(cases).join(','),'41');}
else throw Error('Unknown validation stage');
const result=spawnSync(process.execPath,args,{env,stdio:'inherit'});process.exitCode=result.status??1;
