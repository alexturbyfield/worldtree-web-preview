const fs=require('fs'),sharp=require('sharp'),crypto=require('crypto');
(async()=>{
 const report=[];
 for(const [id,dir,baseline]of [['germany','previous/after','../bounded-resolver/after'],['finland','previous/after','../bounded-resolver/after'],['alaska','previous/after','../bounded-resolver/after'],['prairie','protected/after','protected/before']])for(const view of ['hero','inspection']){
  const a=await sharp(`${__dirname}/${baseline}/${id}-${view}.png`).removeAlpha().raw().toBuffer(),b=await sharp(`${__dirname}/${dir}/${id}-${view}.png`).removeAlpha().raw().toBuffer();let changed=0;for(let i=0;i<a.length;i++)changed+=a[i]!==b[i];report.push({id,view,changedChannels:changed});
 }
 const frozen=require('./freeze.json'),unchanged=frozen.files.every(f=>crypto.createHash('sha256').update(fs.readFileSync(f.path)).digest('hex')===f.sha256);
 const scenes=require('./after/report.json'),held=require('./holdout/report.json');
 const checks=[{name:'frozen source unchanged after holdout',pass:unchanged},{name:'protected pixels unchanged',pass:report.every(r=>r.changedChannels===0)},{name:'no render errors',pass:[...scenes,...held].every(r=>!r.error&&!r.errors.length)},{name:'foreign location-conditioned matte withheld',pass:[...scenes,...held].filter(r=>r.id!=='oklahoma').every(r=>r.backdrop.withheldForPilot===true)},{name:'no Oklahoma plant identities exported to Pampas or steppe',pass:[...scenes,...held].filter(r=>r.id!=='oklahoma').every(r=>!r.landscape.regionalPlants.length&&!r.landscape.regionalShrubs&&r.selection.regional.renderedTreeIdentity==='none')}];
 fs.writeFileSync(__dirname+'/validation.json',JSON.stringify({checks,protectedParity:report},null,2));console.log(checks);if(checks.some(c=>!c.pass))process.exitCode=1;
})();
