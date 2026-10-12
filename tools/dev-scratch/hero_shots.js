const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
for(const [n,w,h] of [['lap',1366,768],['ph',390,844],['xs',320,568],['land',844,390]]){
 const ctx=await b.newContext({viewport:{width:w,height:h},colorScheme:'light'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///mnt/user-data/outputs/vaigai-site/index.html');await p.waitForTimeout(1500);
 for(let i=0;i<4;i++){await p.click(`.htabs button[data-i="${i}"]`);await p.mouse.move(w*0.7,h*0.4);await p.waitForTimeout(2200);await p.screenshot({path:`/home/claude/shots/hero_${n}_${i}.png`})}
 console.log(n,errs.slice(0,2));await ctx.close()}
await b.close()})();
