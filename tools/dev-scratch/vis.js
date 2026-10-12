const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
for(const [n,w,h] of [['lap',1366,768],['ph',390,844]]){
 const ctx=await b.newContext({viewport:{width:w,height:h},colorScheme:'dark'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///mnt/user-data/outputs/vaigai-site/index.html');await p.waitForTimeout(1800);
 for(let i=0;i<4;i++){await p.evaluate(i=>document.querySelectorAll('.htabs button')[i].click(),i);await p.mouse.move(w*.6,h*.4);await p.waitForTimeout(1800);await p.screenshot({path:`/home/claude/shots/v2_${n}_hero${i}.png`})}
 await p.evaluate(()=>document.querySelectorAll('img').forEach(i=>i.loading='eager'));
 for(const id of ['beyond','flav','cta']){await p.evaluate(i=>{const e=document.getElementById(i);window.scrollTo(0,e.offsetTop-(innerWidth<800?60:20))},id);await p.waitForTimeout(1500);await p.screenshot({path:`/home/claude/shots/v2_${n}_${id}.png`})}
 console.log(n,'errs',errs.length?errs[0]:'none');await ctx.close()}
await b.close()})();
