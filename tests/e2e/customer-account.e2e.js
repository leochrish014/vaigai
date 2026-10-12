const {chromium}=require('playwright');const {spawn}=require('child_process');
const {SITE,WEB,MOCK,SHOTS}=require('../helpers/env');
const URL='file://'+WEB+'/account.html?api=http://localhost:5678/webhook&key=dev-key';
const R=[];const ok=(n,c,i)=>{R.push([n,c?'PASS':'FAIL',i||'']);if(!c)console.log('FAIL',n,i||'')};const wait=ms=>new Promise(r=>setTimeout(r,ms));
let srv;(async()=>{try{
 srv=spawn('node',[MOCK],{stdio:'ignore'});await wait(900);
 const post=(p,b,h={})=>fetch('http://localhost:5678/webhook/'+p,{method:'POST',headers:{'Content-Type':'application/json','x-vaigai-key':'dev-key',...h},body:JSON.stringify(b)}).then(r=>r.json());
 const seed=await post('vaigai-order',{order_id:'VGM-250110-SEED',items:[{sku:'VGM-GHEE-500ml',qty:1},{sku:'VGM-CURD-400g',qty:2}],customer:{name:'Meena',phone:'9876501234'},address:'5 Temple Road, Teppakulam, Madurai 625009',area:'Teppakulam',pincode:'625009',slot:'By 5:30 AM'});
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:1100,height:800},colorScheme:'light'});const p=await ctx.newPage();p.setDefaultTimeout(8000);p.on('dialog',d=>d.accept());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(URL);await p.waitForTimeout(400);
 ok('login screen shown first, logout hidden',await p.isVisible('#f-phone')&&!(await p.isVisible('#out'))&&!(await p.isVisible('#dash')));
 await p.fill('#ph','12345');await p.click('#b-send');ok('invalid mobile number rejected on the page',/valid 10 digit/.test(await p.textContent('#st')));
 await p.fill('#ph','98765 01234');await p.click('#b-send');await p.waitForSelector('#f-otp:not(.hide)');ok('code sent -> code form shown',/Code sent/.test(await p.textContent('#st')));
 await p.fill('#otp','000000');await p.click('#b-ver');await p.waitForTimeout(400);ok('wrong code shows error and stays on login',/wrong code/.test(await p.textContent('#st'))&&!(await p.isVisible('#dash')));
 await p.fill('#otp','123456');await p.click('#b-ver');await p.waitForSelector('#dash:not(.hide)');
 ok('correct code logs in: greeting with name, masked phone, logout visible',/Hello, Meena/.test(await p.textContent('#hello'))&&/98XXXXXX34/.test(await p.textContent('#who'))&&await p.isVisible('#out'));
 ok('orders list shows the seeded order with items and total',/VGM-250110-SEED/.test(await p.textContent('#orders'))&&/Farm ghee/.test(await p.textContent('#orders'))&&/₹440/.test(await p.textContent('#orders')));
 ok('daily plan shown with status active',/active/.test(await p.textContent('#subs'))&&/x 2/.test(await p.textContent('#subs'))||/x/.test(await p.textContent('#subs')));
 /* repeat order */
 await p.click('[data-r="VGM-250110-SEED"]');ok('repeat panel opens with the old items',await p.isVisible('#rep')&&/Farm ghee/.test(await p.textContent('#rep-i')));
 await p.selectOption('#slot','6:30-7:30 AM');await p.click('#rep-go');await p.waitForTimeout(700);
 const log=await (await fetch('http://localhost:5678/_log')).json();const ro=log.filter(x=>x.path==='/webhook/vaigai-order').pop();
 ok('repeat order POSTs same items, address, chosen slot and the logged-in phone (cash on delivery)',ro.body.items.length===2&&ro.body.items.find(i=>i.sku==='VGM-CURD-400g').qty===2&&ro.body.address.includes('Teppakulam')&&ro.body.slot==='6:30-7:30 AM'&&ro.body.customer.phone==='9876501234'&&ro.body.payment==='cod',JSON.stringify(ro.body).slice(0,200));
 ok('new order appears in the list after repeat',(await p.$$('#orders [data-o]')).length===2&&/Order placed/.test(await p.textContent('#st')));
 /* subscription controls */
 await p.click('[data-sub] [data-a="pause"]');await p.waitForTimeout(500);ok('pause -> status paused, resume button offered',/paused/.test(await p.textContent('#subs'))&&!!(await p.$('[data-a="resume"]')));
 await p.click('[data-a="resume"]');await p.waitForTimeout(500);ok('resume -> active again',/active/.test(await p.textContent('#subs')));
 await p.click('[data-a="skipT"]');await p.waitForTimeout(500);ok('skip tomorrow adds a skipped date',/Skipped dates: \d{4}-\d{2}-\d{2}/.test(await p.textContent('#subs')));
 await p.fill('[data-d]','2020-01-01');await p.click('[data-a="skipD"]');await p.waitForTimeout(500);ok('skipping a past date is refused with the reason',/too late/.test(await p.textContent('#st')));
 const fut=new Date(Date.now()+10*864e5).toISOString().slice(0,10);await p.fill('[data-d]',fut);await p.click('[data-a="skipD"]');await p.waitForTimeout(500);ok('skipping a date 10 days ahead works',(await p.textContent('#subs')).includes(fut));
 /* Tamil toggle */
 await p.click('#lang');ok('Tamil labels',/என் ஆர்டர்கள்/.test(await p.textContent('#t-orders'))&&/வணக்கம்/.test(await p.textContent('#hello')));await p.click('#lang');
 /* a11y + tap targets */
 const small=await p.evaluate(()=>[...document.querySelectorAll('button,input,select')].filter(e=>e.offsetParent&&e.getBoundingClientRect().height<43.5).map(e=>e.id||e.textContent.trim().slice(0,12)));ok('all controls >= 44 px high',small.length===0,small.join(','));
 ok('inputs have labels and status is a live region',await p.evaluate(()=>!!document.querySelector('label[for=ph]')&&!!document.querySelector('label[for=otp]')&&document.getElementById('st').getAttribute('aria-live')==='polite'));
 await p.screenshot({path:SHOTS+'/account_desktop.png'});
 /* session expiry: kill token server-side by using a bad token */
 await p.evaluate(()=>localStorage.setItem('vaigai-token','deadbeefdeadbeefdeadbeef'));await p.reload();await p.waitForTimeout(600);ok('expired/invalid session returns to login with a clear message',await p.isVisible('#f-phone')&&/session ended/i.test(await p.textContent('#st')));
 /* logout */
 await p.fill('#ph','9876501234');await p.click('#b-send');await p.waitForSelector('#f-otp:not(.hide)');await p.fill('#otp','123456');await p.click('#b-ver');await p.waitForSelector('#dash:not(.hide)');await p.click('#out');ok('logout clears token and shows login',await p.isVisible('#f-phone')&&(await p.evaluate(()=>localStorage.getItem('vaigai-token')))===null);
 /* rate limit: 4th code request in 10 minutes */
 await p.fill('#ph','9000000001');for(let i=0;i<4;i++){await p.click('#b-send').catch(()=>{});await p.waitForTimeout(250);if(await p.isVisible('#b-back')&&i<3)await p.click('#b-back')}
 ok('4th code request in 10 minutes is refused with a clear message',/too many requests/.test(await p.textContent('#st')));
 /* mobile */
 await p.setViewportSize({width:390,height:844});await p.goto(URL);await p.waitForTimeout(300);ok('mobile: no sideways scroll on login',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.screenshot({path:SHOTS+'/account_mobile.png'});
 ok('no JS errors',errs.length===0,errs[0]);
 /* wrong code lockout after 5 tries */
 await p.fill('#ph','9333333333');await p.click('#b-send');await p.waitForSelector('#f-otp:not(.hide)');for(let i=0;i<6;i++){await p.fill('#otp','111111');await p.click('#b-ver');await p.waitForTimeout(150)}ok('after 5 wrong codes even the right code is refused',(await p.fill('#otp','123456'),await p.click('#b-ver'),await p.waitForTimeout(300),/too many wrong attempts/.test(await p.textContent('#st'))));
 await b.close();
}catch(e){console.log("TEST ERROR:",String(e.message).split("\n").slice(0,4).join(" | "));R.push(["aborted","FAIL",String(e.message).slice(0,200)])}finally{if(srv)srv.kill();const f=R.filter(r=>r[1]==='FAIL').length;console.log('account page tests:',R.length-f,'passed,',f,'failed');process.exit(f?1:0)}})();
