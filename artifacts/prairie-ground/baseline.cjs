const fs=require('fs');for(const n of ['wave1.ts','wave2-shared.ts'])fs.copyFileSync('src/lib/forest/'+n,'artifacts/prairie-ground/before-'+n+'.txt');
