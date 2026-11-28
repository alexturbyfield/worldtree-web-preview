const {chromium}=require('playwright'),fs=require('fs');
(async()=>{
 const origin='https://worldtree-web-preview-8uv9ii0t8-alex-turbyfield.vercel.app';
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']}),rows=[];
 try{for(const [id,lat,lon,habitat,expected]of [['woodland',50.7,10.8,'forest','Automatic recipe · unreviewed'],['boreal',66.8,26.2,'forest','Automatic recipe · unreviewed'],['tundra',70.3,-155.2,'grassland','Automatic recipe · unreviewed'],['unsupported',0,-140,'forest','fallback']]){
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const query=new URLSearchParams({lat:String(lat),lon:String(lon),habitat,seed:'29',density:'36',structure:'grove-1',appearance:'garden',wind:'0',mode:'painterly',autoEnvironment:'bounded-auto-v1'});
  const response=await page.goto(origin+'/explore?'+query);await page.locator('[data-testid=forest-stage][data-state=ready]').waitFor({timeout:180000});
  const panel=page.getByTestId('environment-reference-panel');await panel.locator('summary').first().click();await panel.getByText('Bounded automatic resolver',{exact:true}).click();const state=await page.getByTestId('automatic-resolver-state').innerText();
  const row={id,url:page.url(),http:response.status(),state,errors,pass:response.status()===200&&state.includes(expected)&&!errors.length};rows.push(row);console.log(id,row.pass?'PASS':'FAIL');await page.close();
 }}finally{await browser.close();fs.writeFileSync('artifacts/bounded-resolver/deployed-smoke.json',JSON.stringify(rows,null,2));}
 if(rows.length!==4||rows.some(r=>!r.pass))process.exitCode=1;
})();
