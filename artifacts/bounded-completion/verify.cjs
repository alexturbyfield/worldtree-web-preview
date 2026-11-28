const fs=require('fs'),crypto=require('crypto');
const development=require('./after/report.json'),held=require('./holdout/report.json'),rows=[...development,...held],frozen=require('./freeze.json'),parity=require('./protected/parity.json'),ui=require('./ui-validation.json');
const checks=[
 {name:'27 new points and nine frozen-seed checks rendered successfully',pass:development.length===27&&held.length===9&&rows.every(r=>!r.error&&!r.errors.length&&r.views.every(v=>v.calls>0&&v.triangles>0))},
 {name:'all routes selected automatically',pass:rows.every(r=>r.selection.automatic?.status==='selected'&&r.selection.route.adapter===r.family)},
 {name:'30 protected captures are pixel and geometry identical',pass:parity.length===30&&parity.every(p=>!p.changedChannels&&p.geometryIdentical&&!p.errors.length)},
 {name:'sources remained frozen through holdouts',pass:frozen.files.every(f=>crypto.createHash('sha256').update(fs.readFileSync(f.path)).digest('hex')===f.sha256)},
 {name:'dry forest withholds named trees, flowering and regional matte',pass:rows.filter(r=>r.family==='dryforest').every(r=>r.dryForest.ecology.trees.length===0&&r.dryForest.ecology.flowering.startsWith('Withheld')&&!r.views.some(v=>v.mattes.some(m=>m.name.includes('acg-dry-woodland'))))},
 {name:'montane transfers withhold Andean trees and rosettes',pass:rows.filter(r=>r.family==='montane').every(r=>r.andean.instances.trees===0&&r.andean.instances.rosettes===0&&r.withheld?.some(m=>m.id==='cordillera-blanca-puna-v1'))},
 {name:'savanna does not export Oklahoma artwork or named woody plants',pass:rows.filter(r=>r.family==='savanna').every(r=>r.backdrop.withheldForPilot===true&&r.selection.regional.renderedTreeIdentity==='none'&&r.wave.trees===0)},
 {name:'desert foreign distance artwork hidden',pass:rows.filter(r=>r.family==='desert'&&r.selection.regional.site.eco!==433).every(r=>r.views.every(v=>v.mattes.filter(m=>m.name==='depth-distant-plains-matte').every(m=>!m.visible)))},
 {name:'browser picker, mobile layout and ocean fallback pass',pass:!ui.errors.length&&ui.checks.every(c=>c.pass)}
];
const v=development.flatMap(r=>r.views),h=held.flatMap(r=>r.views);const stats=a=>({calls:[Math.min(...a.map(v=>v.calls)),Math.max(...a.map(v=>v.calls))],triangles:[Math.min(...a.map(v=>v.triangles)),Math.max(...a.map(v=>v.triangles))],textureCounts:[Math.min(...a.map(v=>v.textures)),Math.max(...a.map(v=>v.textures))]});
fs.writeFileSync(__dirname+'/validation.json',JSON.stringify({checks,development:stats(v),holdout:stats(h),mobileDeviceTested:false,frameTimeMeasured:false,alphaOverdrawMeasured:false,textureBytesMeasured:false},null,2));console.log(checks);if(checks.some(c=>!c.pass))process.exitCode=1;
