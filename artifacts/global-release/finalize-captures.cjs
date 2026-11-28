const fs=require('fs'),crypto=require('crypto');
const paths=require('child_process').execFileSync('git',['diff','--name-only','--','src'],{encoding:'utf8'}).trim().split(/\r?\n/).concat('src/lib/forest/unnamed-biome-tree.ts');
fs.writeFileSync(__dirname+'/freeze.json',JSON.stringify({at:new Date().toISOString(),holdoutSeed:'618379',files:paths.map(path=>({path,sha256:crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')}))},null,2));
let p=__dirname+'/capture.cjs',s=fs.readFileSync(p,'utf8').replace("seed:'29',density:","seed:process.argv[4]||'29',density:").replace("`${__dirname}/${mode}/report.json`","`${__dirname}/${mode}/report${process.argv[3]?'-'+process.argv[3]:''}.json`");fs.writeFileSync(p,s);
