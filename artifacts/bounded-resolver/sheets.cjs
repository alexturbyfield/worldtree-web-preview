const sharp=require('sharp');
async function sheet(mode,view){
 const rows=require('./'+(mode==='comparison'?'after':mode)+'/report.json'), layers=[];
 const modes=mode==='comparison'?['before','after']:[mode];
 for(let i=0;i<rows.length;i++)for(let j=0;j<modes.length;j++){
  layers.push({input:await sharp(`${__dirname}/${modes[j]}/${rows[i].id}-${view}.png`).resize(320,180).toBuffer(),left:j*320,top:i*204+24});
  layers.push({input:Buffer.from(`<svg width="320" height="24"><text x="8" y="17" fill="white" font-size="14">${rows[i].id} ${modes[j]}</text></svg>`),left:j*320,top:i*204});
 }
 await sharp({create:{width:320*modes.length,height:rows.length*204,channels:3,background:'#202020'}}).composite(layers).png().toFile(`${__dirname}/${mode}-${view}-sheet.png`);
}
(async()=>{await sheet(process.argv[2]||'comparison','hero');await sheet(process.argv[2]||'comparison','inspection');})();
