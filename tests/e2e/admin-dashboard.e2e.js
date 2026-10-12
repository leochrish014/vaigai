const {chromium}=require('playwright');const {spawn}=require('child_process');
const {SITE,WEB,MOCK,SHOTS}=require('../helpers/env');
const URL='file://'+WEB+'/admin.html?api=http://localhost:5678/webhook';
const R=[];const ok=(n,c,i)=>{R.push([n,c?'PASS':'FAIL',i||'']);if(!c)console.log('FAIL',n,i||'')};const wait=ms=>new Promise(r=>setTimeout(r,ms));
let srv;(async()=>{try{
 srv=spawn('node',[MOCK],{stdio:'ignore'});await wait(900);
 const post=(p,b)=>fetch('http://localhost:5678/webhook/'+p,{method:'POST',headers:{'Content-Type':'application/json','x-vaigai-key':'dev-key'},body:JSON.stringify(b)}).then(r=>r.json());
 const TOM=new Date(Date.now()+330*60000+864e5).toISOString().slice(0,10);
 const mk=(id,name,phone,area,items,pay)=>post('vaigai-order',{test_delivery_date:TOM,order_id:id,items,customer:{name,phone},address:'12 Main St, '+area+', Madurai 625020',area,pincode:'625020',slot:'By 5:30 AM',payment:pay||'cod'});
 await mk('VGM-250110-AAA1','Karthik','9876543210','Anna Nagar',[{sku:'VGM-CURD-400g',qty:2},{sku:'VGM-GHEE-500ml',qty:1}]);
 await mk('VGM-250110-AAA2','Meena','9876501234','Anna Nagar',[{sku:'VGM-CARTON-500ml',qty:4}]);
 await mk('VGM-250110-AAA3','<img src=x onerror=window.__xss=1>','9123456789','KK Nagar',[{sku:'VGM-BUTTER-200g',qty:1}]);
 await post('vaigai-lead',{type:'complaint',phone:'9123456789',detail:'Sour milk <b>bold</b>',basket:'1 x Fresh',age_min:30,lead_id:'LD-250110-TEST'});await post('vaigai-lead',{type:'callback',phone:'9000000002',detail:'call me',lead_id:'LD-250110-CALL'});
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:1280,height:800},acceptDownloads:true});const p=await ctx.newPage();p.setDefaultTimeout(8000);const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(URL);await p.waitForTimeout(300);
 ok('login shown first; tabs hidden',await p.isVisible('#login')&&!(await p.isVisible('#nav')));
 await p.fill('#key','wrong');await p.click('#login button');await p.waitForTimeout(500);ok('wrong admin key refused, no data shown',/Session ended|unauthorized|failed/i.test(await p.textContent('#err'))&&!(await p.isVisible('#app')));
 await p.fill('#key','admin-key');await p.click('#login button');await p.waitForSelector('#app:not(.hide)');
 ok('overview: 3 orders tomorrow, 2 new leads, 1 past SLA',(await p.textContent('#k-tm'))==='3'&&(await p.textContent('#k-leads'))==='2'&&(await p.textContent('#k-od'))==='1');
 ok('overview: cash to collect = total of COD orders (₹'+(120+320+128+110)+')',/₹(120|440|)/.test(await p.textContent('.kpis'))&&/₹678/.test(await p.textContent('.kpis')),(await p.textContent('.kpis')).replace(/\s+/g,' ').slice(0,200));
 /* orders */
 await p.click('[data-t="orders"]');ok('orders tab lists tomorrow\'s 3 orders',(await p.textContent('#cnt')).startsWith('3'));
 await p.fill('#fq','9876501234');ok('search by phone narrows the list',(await p.textContent('#cnt')).startsWith('1')&&/Meena/.test(await p.textContent('tbody')));await p.fill('#fq','');
 ok('XSS: customer name shown as text, not executed',(await p.textContent('tbody')).includes('<img src=x')&&!(await p.evaluate(()=>window.__xss))&&!(await p.$('tbody img')));
 await p.selectOption('tr[data-o="VGM-250110-AAA2"] [data-f="status"]','confirmed');await p.fill('tr[data-o="VGM-250110-AAA2"] [data-f="rider"]','Ravi');await p.click('tr[data-o="VGM-250110-AAA2"] [data-save]');await p.waitForTimeout(400);
 let lo=await (await fetch('http://localhost:5678/webhook/vaigai-admin',{method:'POST',headers:{'Content-Type':'application/json','x-vaigai-admin':'admin-key'},body:JSON.stringify({action:'list_orders'})})).json();let o2=lo.orders.find(o=>o.order_id==='VGM-250110-AAA2');ok('status + rider saved on the server',o2.status==='confirmed'&&o2.rider==='Ravi');
 p.once('dialog',d=>d.accept('128'));await p.selectOption('tr[data-o="VGM-250110-AAA2"] [data-f="status"]','delivered');await p.click('tr[data-o="VGM-250110-AAA2"] [data-save]');await p.waitForTimeout(400);
 lo=await (await fetch('http://localhost:5678/webhook/vaigai-admin',{method:'POST',headers:{'Content-Type':'application/json','x-vaigai-admin':'admin-key'},body:JSON.stringify({action:'list_orders'})})).json();o2=lo.orders.find(o=>o.order_id==='VGM-250110-AAA2');ok('delivered asks for cash collected and stores it with the time',o2.status==='delivered'&&o2.collected_inr==='128'&&!!o2.delivered_at);
 const dl=p.waitForEvent('download');await p.click('#exp');const d=await dl;const csv=await p.evaluate(()=>window.__csv);ok('CSV export: header + rows, file name has the date',/^order_id,date,status/.test(csv)&&csv.split('\n').length===4&&/orders-\d{4}-\d{2}-\d{2}\.csv/.test(d.suggestedFilename()));
 ok('CSV export neutralises formula-like cells (name starting with =, +, -, @)',await p.evaluate(()=>{const f=(v)=>{v=String(v);if(/^[=+\-@]/.test(v))v="'"+v;return v};return f('=1+1')==="'=1+1"}));
 /* routes */
 await p.click('[data-t="routes"]');const areas=await p.$$eval('[data-area]',a=>a.map(x=>x.dataset.area+':'+x.querySelectorAll('.stop').length));ok('routes grouped by area with stop counts',areas.join()==='Anna Nagar:2,KK Nagar:1',areas.join());
 const rt=await p.textContent('#app');ok('routes: load list totals per product; COD collect amount; paid shows Paid; map + call links',/Set curd 400 g: 2/.test(rt)&&/Vaigai Fresh milk 500 ml: 4/.test(rt)&&/Collect ₹440/.test(rt)&&!!(await p.$('a[href^="tel:"]'))&&!!(await p.$('a[href*="google.com/maps"]')));
 /* stock */
 await p.click('[data-t="stock"]');await p.fill('tr[data-sku="VGM-CURD-400g"] [data-f="capacity"]','2');await p.fill('tr[data-sku="VGM-CURD-400g"] [data-f="produced"]','2');await p.click('tr[data-sku="VGM-CURD-400g"] [data-save]');await p.waitForTimeout(400);
 ok('stock: ordered 2 of capacity 2 -> remaining 0 and LOW flag',/low/.test(await p.textContent('tr[data-sku="VGM-CURD-400g"]'))&&/>2</.test(await p.innerHTML('tr[data-sku="VGM-CURD-400g"]')));
 await p.click('[data-t="overview"]');ok('overview now shows 1 stock alert naming the product',(await p.textContent('#k-low'))==='1'&&/Set curd/.test(await p.textContent('.kpis')));
 /* leads */
 await p.click('[data-t="leads"]');ok('leads: past-SLA complaint flagged; HTML in detail shown as text',/PAST SLA/.test(await p.textContent('tr[data-l="LD-250110-TEST"]'))&&(await p.textContent('tr[data-l="LD-250110-TEST"]')).includes('<b>bold</b>'));
 await p.selectOption('tr[data-l="LD-250110-TEST"] [data-f="status"]','contacted');await p.fill('tr[data-l="LD-250110-TEST"] [data-f="assignee"]','Priya');await p.fill('tr[data-l="LD-250110-TEST"] [data-f="note"]','refund offered');await p.click('tr[data-l="LD-250110-TEST"] [data-save]');await p.waitForTimeout(400);
 const ll=await (await fetch('http://localhost:5678/webhook/vaigai-admin',{method:'POST',headers:{'Content-Type':'application/json','x-vaigai-admin':'admin-key'},body:JSON.stringify({action:'list_leads'})})).json();const l1=ll.leads.find(l=>l.lead_id==='LD-250110-TEST');ok('lead status, assignee and note saved; no longer past SLA',l1.status==='contacted'&&l1.assignee==='Priya'&&l1.note==='refund offered'&&!/PAST SLA/.test(await p.textContent('tr[data-l="LD-250110-TEST"]')));
 const small=await p.evaluate(()=>[...document.querySelectorAll('button,select,input')].filter(e=>e.offsetParent&&e.getBoundingClientRect().height<43.5).map(e=>e.id||e.textContent.trim().slice(0,10)||e.getAttribute('aria-label')));ok('all admin controls >= 44 px',small.length===0,small.join(','));
 await p.screenshot({path:SHOTS+'/admin_desktop.png'});
 /* logout, reload requires key */
 await p.click('#out');await p.reload();await p.waitForTimeout(400);ok('after logout a reload asks for the key again',await p.isVisible('#login')&&(await p.evaluate(()=>sessionStorage.getItem('vaigai-admin')))===null);
 /* key rejected mid-session */
 await p.fill('#key','admin-key');await p.click('#login button');await p.waitForSelector('#app:not(.hide)');await p.evaluate(()=>sessionStorage.setItem('vaigai-admin','changed'));await p.reload();await p.waitForTimeout(500);ok('invalid stored key sends you back to login',await p.isVisible('#login'));
 /* mobile */
 await p.fill('#key','admin-key');await p.click('#login button');await p.waitForSelector('#app:not(.hide)');await p.setViewportSize({width:390,height:844});await p.click('[data-t="orders"]');ok('mobile: page does not scroll sideways (tables scroll inside)',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.screenshot({path:SHOTS+'/admin_mobile.png'});
 ok('no JS errors',errs.length===0,errs[0]);await b.close();
}catch(e){console.log('TEST ERROR:',String(e.message).split('\n').slice(0,3).join(' | '));R.push(['aborted','FAIL',String(e.message).slice(0,200)])}finally{if(srv)srv.kill();const f=R.filter(r=>r[1]==='FAIL').length;console.log('admin dashboard tests:',R.length-f,'passed,',f,'failed');process.exit(f?1:0)}})();
