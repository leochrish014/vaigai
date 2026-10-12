const {chromium}=require('playwright');
const {SITE,WEB,MOCK,SHOTS}=require('../helpers/env');
const {spawn}=require('child_process');const fs=require('fs'),crypto=require('crypto');
const ROOT=SITE;
const STUB=`(()=>{const n=new Proxy(function(){},{get:(t,k)=>k==='then'?undefined:n,apply:()=>n});window.gsap=n;window.ScrollTrigger=n;window.__rz={mode:'ok'};window.Razorpay=function(o){this.open=async function(){if(window.__rz.mode==='dismiss')return o.modal.ondismiss();const sig=await window.__sign(o.order_id,'pay_test1');o.handler({razorpay_order_id:o.order_id,razorpay_payment_id:'pay_test1',razorpay_signature:window.__rz.mode==='forged'?'deadbeef':sig})}}})()`;
const R=[];const ok=(n,c,i)=>{R.push([n,c?'PASS':'FAIL',i||'']);if(!c)console.log('FAIL',n,i||'')};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let srv;(async()=>{try{
 srv=spawn('node',[MOCK],{stdio:'ignore',env:{...process.env,INVOICE_BASE:'file://'+ROOT+'/invoice.html'}});await wait(900);
 fs.writeFileSync(ROOT+'/__p.html',fs.readFileSync(ROOT+'/index.html','utf8').replace('assistantWebhook:"",orderWebhook:"",leadWebhook:"",statusWebhook:"",payWebhook:"",webhookKey:""','assistantWebhook:"",orderWebhook:"http://localhost:5678/webhook/vaigai-order",leadWebhook:"http://localhost:5678/webhook/vaigai-lead",statusWebhook:"",payWebhook:"http://localhost:5678/webhook",webhookKey:"dev-key"'));
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:1366,height:768}});await ctx.exposeFunction('__sign',(o,p)=>crypto.createHmac('sha256','mocksecret').update(o+'|'+p).digest('hex'));await ctx.addInitScript(STUB);
 const p=await ctx.newPage();p.setDefaultTimeout(9000);const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+ROOT+'/__p.html');await p.addStyleTag({content:'#pre{display:none!important}'});await p.waitForTimeout(500);
 const say=async t=>{await p.fill('#asst-text',t);await p.press('#asst-text','Enter');await p.waitForTimeout(800)};
 const chipClick=async txt=>{await p.click('#asst-chips >> text='+txt);await p.waitForTimeout(900)};
 const logTxt=()=>p.evaluate(()=>document.getElementById('asst-log').textContent);
 const order=async(mode,payChip)=>{await p.evaluate(m=>{window.__rz.mode=m},mode);await say('add 1 ghee');await say('checkout');await say('Karthik');await say('9876543210');await say('12 Main St, Anna Nagar, Madurai 625020');await chipClick('By 5:30');
  return p.evaluate(()=>[...document.querySelectorAll('#asst-chips button')].map(b=>b.textContent))};
 await p.click('#asst-launch');await p.waitForTimeout(300);
 let chips=await order('ok');ok('payment choice shown after slot (Pay online / Cash on delivery)',chips.length===2&&/Pay online/.test(chips[0])&&/Cash/.test(chips[1]),chips.join('|'));
 await chipClick('Pay online');ok('summary shows Online payment',/Payment: Online/.test(await logTxt()));
 await chipClick('Yes, place order');await p.waitForTimeout(1500);
 let t=await logTxt();ok('payment completes: "Payment received" + GST invoice number',/Payment received/.test(t)&&/GST invoice VGM\/\d\d-\d\d\/000001/.test(t),t.slice(-260));
 const href=await p.evaluate(()=>{const a=document.querySelector('#asst-chips a');return a&&a.href});ok('invoice link chip with id, token and api',/invoice\.html\?id=VGM-/.test(href||'')&&/t=[0-9a-f]{24}/.test(href||''),href);
 ok('basket cleared after paid order',+await p.textContent('#cc')===0);
 const log=await (await fetch('http://localhost:5678/_log')).json();const o1=log.find(x=>x.path==='/webhook/vaigai-order'),pc=log.find(x=>x.path==='/webhook/vaigai-pay-create'),pv=log.find(x=>x.path==='/webhook/vaigai-pay-verify');
 ok('order POST says payment:online; pay-create then pay-verify with provider ids and signature',o1&&o1.body.payment==='online'&&pc&&pc.body.order_id===o1.body.order_id&&pv&&pv.body.razorpay_payment_id==='pay_test1'&&/^[0-9a-f]{64}$/.test(pv.body.razorpay_signature));
 /* invoice page */
 const ip=await ctx.newPage();ip.setDefaultTimeout(9000);const ierr=[];ip.on('pageerror',e=>ierr.push(e.message));await ip.goto(href);await ip.waitForSelector('.top');const it=await ip.textContent('#sheet');
 ok('invoice page: TAX INVOICE, seller GSTIN/FSSAI, invoice no, item, HSN 0405 at 5%',/TAX INVOICE/.test(it)&&/GSTIN/.test(it)&&/FSSAI/.test(it)&&/VGM\/\d\d-\d\d\/000001/.test(it)&&/Farm ghee/.test(it)&&/0405/.test(it)&&/5%/.test(it));
 ok('invoice page: taxable 304.76, CGST 7.62, SGST 7.62, total 320.00, words',/₹304\.76/.test(it)&&/CGST[^₹]*₹7\.62/.test(it)&&/SGST[^₹]*₹7\.62/.test(it)&&/Total[^₹]*₹320\.00/.test(it)&&/Rupees Three Hundred Twenty Only/.test(it),it.replace(/\s+/g,' ').slice(0,420));
 ok('invoice page: customer phone is masked, PAID stamp present',/98XXXXXX10/.test(it)&&!/9876543210/.test(it)&&/PAID/.test(it));
 ok('number to words (Indian system): 100000 / 1234567 / 99',await ip.evaluate(()=>[__words(100000),__words(1234567),__words(99)].join('|'))==='One Lakh|Twelve Lakh Thirty Four Thousand Five Hundred Sixty Seven|Ninety Nine');
 await ip.emulateMedia({media:'print'});ok('print layout hides the toolbar',await ip.evaluate(()=>getComputedStyle(document.querySelector('.bar')).display)==='none');await ip.emulateMedia({media:'screen'});
 await ip.screenshot({path:SHOTS+'/invoice_desktop.png'});
 const bad=href.replace(/t=[0-9a-f]{24}/,'t=000000000000000000000000');await ip.goto(bad);await ip.waitForSelector('#msg');ok('invoice page: wrong token shows "not found", no data',/not found/i.test(await ip.textContent('#sheet'))&&!/Karthik/.test(await ip.textContent('body')));
 await ip.goto('file://'+ROOT+'/invoice.html?id=x&t=y');await ip.waitForTimeout(300);ok('invoice page: no API configured -> safe message, no request to unknown hosts',/incomplete|not found|Could not/i.test(await ip.textContent('#sheet')));
 await ip.setViewportSize({width:390,height:844});await ip.goto(href);await ip.waitForSelector('.top');ok('invoice page mobile: no sideways page scroll (table scrolls inside)',await ip.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await ip.screenshot({path:SHOTS+'/invoice_mobile.png'});
 ok('invoice page: no JS errors',ierr.length===0,ierr[0]);await ip.close();
 /* forged signature, then retry succeeds with invoice 000002 */
 await p.click('#asst-launch').catch(()=>{});chips=await order('forged');await chipClick('Pay online');await chipClick('Yes, place order');await p.waitForTimeout(1500);t=await logTxt();
 ok('forged payment signature is NOT accepted (no invoice) and customer is told safely',/could not confirm the payment/.test(t.slice(-500))&&!!(await p.$('#asst-chips >> text=Retry payment')));
 await p.evaluate(()=>{window.__rz.mode='ok'});await chipClick('Retry payment');await p.waitForTimeout(1500);t=await logTxt();ok('retry after failure succeeds and issues the next invoice number (000002)',/GST invoice VGM\/\d\d-\d\d\/000002/.test(t));
 /* dismissed checkout */
 chips=await order('dismiss');await chipClick('Pay online');await chipClick('Yes, place order');await p.waitForTimeout(1500);t=await logTxt();ok('closing the payment window keeps the order and offers retry / human help',/Payment was not completed/.test(t)&&!!(await p.$('#asst-chips >> text=Retry payment')));
 /* COD path: no payment calls */
 const before=(await (await fetch('http://localhost:5678/_log')).json()).filter(x=>/pay-/.test(x.path)).length;chips=await order('ok');await chipClick('Cash on delivery');await chipClick('Yes, place order');await p.waitForTimeout(1500);const after=(await (await fetch('http://localhost:5678/_log')).json()).filter(x=>/pay-/.test(x.path)).length;t=await logTxt();
 ok('cash on delivery: order placed with no payment-provider calls',after===before&&/is placed/.test(t.slice(-400)),t.slice(-200));
 const lastOrder=(await (await fetch('http://localhost:5678/_log')).json()).filter(x=>x.path==='/webhook/vaigai-order').pop();ok('cash on delivery order payload says payment:cod',lastOrder.body.payment==='cod');
 ok('no JS errors in the website during payment tests',errs.length===0,errs[0]);
 await b.close();
}finally{try{fs.unlinkSync(ROOT+'/__p.html')}catch(e){}if(srv)srv.kill();const f=R.filter(r=>r[1]==='FAIL').length;console.log('payment + invoice UI tests:',R.length-f,'passed,',f,'failed');fs.writeFileSync(SHOTS+'/pay_results.json',JSON.stringify(R,null,1));process.exit(f?1:0)}})();
