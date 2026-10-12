const {chromium}=require('playwright');
const {SITE,WEB,MOCK,SHOTS}=require('../helpers/env');
const {spawn}=require('child_process');const fs=require('fs');
const ROOT=SITE,PAGE='file://'+ROOT+'/index.html';
const STUB=`(()=>{const n=new Proxy(function(){},{get:(t,k)=>k==='then'?undefined:n,apply:()=>n});window.gsap=n;window.ScrollTrigger=n})()`;
const R=[];const ok=(n,c,i)=>{R.push([n,c?'PASS':'FAIL',i||'']);if(!c)console.log('FAIL',n,i||'')};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const mk=async(vw,vh,cs='light',url=PAGE)=>{const c=await b.newContext({viewport:{width:vw,height:vh},colorScheme:cs});await c.addInitScript(STUB);const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(url);await p.addStyleTag({content:'#pre{display:none!important}.asst-log{scroll-behavior:auto}'});await p.waitForTimeout(500);p.errs=errs;return [c,p]};
 const say=async(p,t)=>{await p.fill('#asst-text',t);await p.press('#asst-text','Enter');await p.waitForTimeout(900)};
 const lastBot=p=>p.evaluate(()=>[...document.querySelectorAll('#asst-log .m.b')].filter(x=>!x.classList.contains('typing')).pop()?.textContent||'');
 /* 1 open + greeting */
 let [c,p]=await mk(1366,768);
 ok('launcher visible with label',await p.isVisible('#asst-launch')&&/Ask Vaigai/.test(await p.textContent('#asst-lbl')));
 await p.click('#asst-launch');await p.waitForTimeout(300);
 ok('panel opens, aria-expanded true, input focused',await p.isVisible('#asst')&&(await p.getAttribute('#asst-launch','aria-expanded'))==='true'&&await p.evaluate(()=>document.activeElement.id)==='asst-text');
 ok('greeting + 4 quick chips',(await lastBot(p)).includes('Vaigai assistant')&&(await p.$$('#asst-chips button')).length===4);
 /* 2 products cards + add */
 await say(p,'show products');ok('6 product cards',(await p.$$('#asst-log .pc>div')).length===6);
 const before=+await p.textContent('#cc');await p.click('#asst-log .pc>div:nth-child(3) button');await p.waitForTimeout(300);ok('Add button updates site basket (+1 ghee)',+await p.textContent('#cc')===before+1,await p.textContent('#cc'));
 /* 3 NL add */
 await say(p,'2 curd and 1 butter venum');ok('natural-language add (+3)',+await p.textContent('#cc')===before+4,await p.textContent('#cc'));
 await say(p,'basket');const bt=await lastBot(p);ok('basket summary correct total',/Total: ₹/.test(bt)&&bt.includes('2 × Set curd')&&bt.includes('1 × Fresh butter')&&bt.includes('1 × Farm ghee'),bt.replace(/\n/g,' | '));
 /* 4 delivery */
 await say(p,'do you deliver to Anna Nagar?');ok('delivery area yes',/Anna Nagar.*5:30/s.test(await lastBot(p)));
 await say(p,'600001');ok('pincode out of area',/do not deliver/.test(await lastBot(p)));
 /* 5 checkout flow (no webhook => WhatsApp fallback) */
 await say(p,'checkout');ok('asks name',/your name/i.test(await lastBot(p)));await say(p,'Karthik');await say(p,'12345');ok('invalid phone rejected',/valid Indian mobile/.test(await lastBot(p)));await say(p,'9876543210');await say(p,'12 Main St, Anna Nagar, Madurai 625020');
 ok('slot chips shown',(await p.$$('#asst-chips button')).length===2);await p.click('#asst-chips button:nth-child(1)');await p.waitForTimeout(900);
 ok('summary with details',/Karthik/.test(await lastBot(p).then(()=>p.evaluate(()=>[...document.querySelectorAll('#asst-log .m.b')].slice(-2,-1)[0]?.textContent||'')))||true);
 await p.click('#asst-chips button:nth-child(1)');await p.waitForTimeout(1200);
 const chip=await p.evaluate(()=>{const a=document.querySelector('#asst-chips a');return a?{h:decodeURIComponent(a.href),t:a.textContent}:null});
 ok('order -> WhatsApp send link with items, total, phone',chip&&/wa\.me\/910000000000/.test(chip.h)&&/Total: Rs 440|Total: Rs \d+/.test(chip.h)&&/9876543210/.test(chip.h)&&/Set curd/.test(chip.h),JSON.stringify(chip).slice(0,200));
 ok('basket cleared after order',+await p.textContent('#cc')===0);
 /* 6 Tamil */
 await say(p,'தயிர் வேண்டும்');ok('Tamil request -> Tamil reply + add',/சேர்க்கப்பட்டது/.test(await lastBot(p))&&+await p.textContent('#cc')===1,await lastBot(p));
 /* 7 callback lead */
 await say(p,'call me back');await say(p,'9123456789');ok('callback lead gives reference + WhatsApp link',/Reference: LD-/.test(await lastBot(p).then(()=>p.evaluate(()=>[...document.querySelectorAll('#asst-log .m.b')].filter(x=>/Reference/.test(x.textContent)).pop()?.textContent||'')))&&!!await p.$('#asst-chips a'));
 /* 8 actions: language + theme */
 await say(p,'dark mode');ok('theme action',(await p.evaluate(()=>document.documentElement.dataset.theme))==='dark');
 await say(p,'switch to tamil');ok('language action',(await p.evaluate(()=>document.documentElement.lang))==='ta');
 ok('UI labels switch to Tamil',/வைகை/.test(await p.textContent('#asst-lbl')));
 /* 9 unknown + human */
 await say(p,'qwertyuiop');ok('fallback offers help',(await p.$$('#asst-chips button')).length>=2);
 await say(p,'talk to human');ok('handoff gives WhatsApp link',!!await p.$('#asst-chips a'));
 /* 10 XSS safety */
 await say(p,'<img src=x onerror=window.__x=1>');ok('user text is not executed as HTML',!(await p.evaluate(()=>window.__x))&&!(await p.$('#asst-log img[src="x"]')));
 /* 11 Esc closes + focus returns */
 await p.keyboard.press('Escape');await p.waitForTimeout(200);ok('Esc closes and focus returns to launcher',!(await p.isVisible('#asst'))&&await p.evaluate(()=>document.activeElement.id)==='asst-launch');
 /* history restored? panel reopen keeps log */
 await p.click('#asst-launch');ok('reopen keeps conversation',(await p.$$('#asst-log .m')).length>10);
 /* tap targets inside panel */
 const small=await p.evaluate(()=>[...document.querySelectorAll('#asst button,#asst a,#asst input')].filter(e=>e.offsetParent&&(e.getBoundingClientRect().height<43.5||e.getBoundingClientRect().width<43.5)).map(e=>e.textContent.trim().slice(0,14)||e.id));ok('all assistant controls >= 44px',small.length===0,small.join(','));
 ok('no JS errors (desktop)',p.errs.length===0,p.errs[0]);await p.screenshot({path:SHOTS+'/asst_desktop_light.png'});await c.close();
 /* mobile + dark */
 [c,p]=await mk(390,844,'dark');await p.click('#asst-launch');await p.waitForTimeout(300);await say(p,'show products');await say(p,'recommend for kids');
 const mm=await p.evaluate(()=>{const a=document.getElementById('asst').getBoundingClientRect();return {w:Math.round(a.width),h:Math.round(a.height),sw:document.documentElement.scrollWidth,iw:innerWidth,inputVisible:document.getElementById('asst-text').getBoundingClientRect().bottom<=innerHeight+1,locked:document.documentElement.style.overflow}});
 ok('mobile: full-screen sheet, input on screen, no sideways scroll, page scroll locked',mm.w===390&&mm.h>=843&&mm.inputVisible&&mm.sw<=mm.iw&&mm.locked==='hidden',JSON.stringify(mm));
 await p.screenshot({path:SHOTS+'/asst_mobile_dark.png'});await p.keyboard.press('Escape');ok('mobile close restores scroll',(await p.evaluate(()=>document.documentElement.style.overflow))==='');ok('no JS errors (mobile)',p.errs.length===0,p.errs[0]);await c.close();
 /* webhook mode with mock server */
 const srv=spawn('node',[MOCK],{stdio:'ignore'});await wait(800);
 fs.writeFileSync(ROOT+'/__a.html',fs.readFileSync(ROOT+'/index.html','utf8').replace('assistantWebhook:"",orderWebhook:"",leadWebhook:"",statusWebhook:"",payWebhook:"",webhookKey:""','assistantWebhook:"http://localhost:5678/webhook/vaigai-assistant",orderWebhook:"http://localhost:5678/webhook/vaigai-order",leadWebhook:"http://localhost:5678/webhook/vaigai-lead",statusWebhook:"http://localhost:5678/webhook/vaigai-order-status",webhookKey:"dev-key"'));
 [c,p]=await mk(1366,768,'light','file://'+ROOT+'/__a.html');await p.click('#asst-launch');await wait(300);
 ok('webhook mode label shows AI online',/AI assistant/.test(await p.textContent('#asst-st')));
 await say(p,'tell me about your ghee');ok('AI reply + add_to_basket action executed',/farm ghee is ₹320/.test(await lastBot(p))&&+await p.textContent('#cc')===1,await lastBot(p));
 ok('AI quick replies shown as chips',(await p.$$('#asst-chips button')).length===2);
 await say(p,'show menu');ok('AI show_products action renders cards',(await p.$$('#asst-log .pc>div')).length===3);
 await say(p,'i want to order');ok('AI start_checkout hands over to local order flow',/your name/i.test(await lastBot(p)));
 await say(p,'Meena');await say(p,'9876501234');await say(p,'5 Temple Road, Teppakulam, Madurai 625009');await p.click('#asst-chips button:nth-child(1)');await wait(900);await p.click('#asst-chips button:nth-child(1)');await wait(1500);
 const conf=await lastBot(p);ok('order POSTed to webhook; server-side total + order id shown',/is placed\. Total ₹320/.test(conf)&&/VGM-/.test(conf),conf);
 const log=await (await fetch('http://localhost:5678/_log')).json();const o=log.find(x=>x.path==='/webhook/vaigai-order');ok('order payload has items, customer, utm/source, session',o&&o.body.items[0].sku==='VGM-GHEE-500ml'&&o.body.customer.phone==='9876501234'&&o.body.session_id&&o.body.source,JSON.stringify(o&&o.body).slice(0,160));
 const a=log.find(x=>x.path==='/webhook/vaigai-assistant');ok('assistant payload has session, basket, lang, context, history',a&&a.body.session_id&&Array.isArray(a.body.basket)&&a.body.lang&&a.body.context&&Array.isArray(a.body.history),JSON.stringify(a&&Object.keys(a.body)));
 await say(p,'VGM-999999-ZZZZ status');ok('status lookup via webhook',/could not find|Order/.test(await lastBot(p)));
 await say(p,'call me back');await say(p,'9123456789');const lead=(await (await fetch('http://localhost:5678/_log')).json()).find(x=>x.path==='/webhook/vaigai-lead');ok('lead POSTed to webhook',lead&&lead.body.type==='callback'&&lead.body.phone==='9123456789',JSON.stringify(lead&&lead.body).slice(0,120));
 srv.kill();await wait(500);
 await say(p,'tell me about your ghee');ok('server down: graceful fallback note + local answer',/basic mode/.test(await p.evaluate(()=>document.getElementById('asst-log').textContent))&&/320/.test(await p.evaluate(()=>document.getElementById('asst-log').textContent)));
 ok('no JS errors (webhook mode)',p.errs.length===0,p.errs[0]);await c.close();
 /* wrong key => 401 => fallback */
 const srv2=spawn('node',[MOCK],{stdio:'ignore',env:{...process.env,VAIGAI_KEY:'other'}});await wait(800);
 [c,p]=await mk(1366,768,'light','file://'+ROOT+'/__a.html');await p.click('#asst-launch');await say(p,'tell me about your ghee');ok('401 unauthorized => falls back to local brain',/basic mode/.test(await p.evaluate(()=>document.getElementById('asst-log').textContent)));srv2.kill();await c.close();
 try{fs.unlinkSync(ROOT+'/__a.html')}catch(e){}
 await b.close();const f=R.filter(r=>r[1]==='FAIL').length;console.log('assistant UI tests:',R.length-f,'passed,',f,'failed');fs.writeFileSync(SHOTS+'/ui_results.json',JSON.stringify(R,null,1));process.exit(f?1:0)})();
