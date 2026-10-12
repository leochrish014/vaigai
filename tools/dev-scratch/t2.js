const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:820,height:1180}});await p.goto('file:///home/claude/test.html');await p.waitForTimeout(800);
const info=await p.evaluate(async()=>{const im=document.querySelector('#story .sc img');await im.decode().catch(()=>{});const v=document.querySelector('#story .view').getBoundingClientRect(),i=im.getBoundingClientRect();return {v:[v.width,v.height],i:[i.width,i.height],nat:[im.naturalWidth,im.naturalHeight],cs:getComputedStyle(document.querySelector('#story .sc')).display}});
console.log(JSON.stringify(info));
await p.locator('#story .pin').scrollIntoViewIfNeeded();await p.waitForTimeout(600);
await p.locator('#story').screenshot({path:'/home/claude/shots/tablet_story2.png'});await b.close()})();
