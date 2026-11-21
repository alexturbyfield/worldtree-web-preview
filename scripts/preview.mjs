import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('out');
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.geojson':'application/geo+json','.gz':'application/gzip','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(file!==root&&!file.startsWith(root+path.sep))throw new Error('Invalid path');try{if((await stat(file)).isDirectory()){try{await stat(path.join(file,'index.html'));file=path.join(file,'index.html');}catch{file+='.html';}}}catch{file+='.html';}const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream','Cache-Control':'no-cache'});res.end(body);}catch{res.writeHead(404);res.end('Not found');}}).listen(3001,'127.0.0.1',()=>console.log('WorldTree production preview: http://127.0.0.1:3001'));
