import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
test('deployed worker bundle resolves real gzip tiles using browser stream APIs',async()=>{
 const messages: {id:number;region?:{ECO_NAME:string};error?:string}[]=[];
 const self: {onmessage?:(e:{data:{id:number;lat:number;lon:number}})=>Promise<void>;postMessage:(data:typeof messages[number])=>void}={postMessage:data=>messages.push(data)};
 const fetch=async(url:string)=>{try{return new Response(readFileSync('public'+url));}catch{return new Response('',{status:404});}};
 vm.runInNewContext(readFileSync('public/geo-worker.js','utf8'),{self,fetch,Response,DecompressionStream});
 for(const [id,lat,lon,expected] of [[1,47.6062,-122.3321,'Puget lowland forests'],[2,33.749,-84.388,'Piedmont'],[3,35.6762,139.6503,'Taiheiyo']] as const){await self.onmessage!({data:{id,lat,lon}});assert.equal(messages.at(-1)?.id,id);assert.match(messages.at(-1)?.region?.ECO_NAME??'',new RegExp(expected,'i'));assert.equal(messages.at(-1)?.error,undefined);}
 await self.onmessage!({data:{id:4,lat:25,lon:-140}});assert.equal(messages.at(-1)?.region,null);
 await self.onmessage!({data:{id:5,lat:100,lon:0}});assert.ok(messages.at(-1)?.error);
});
