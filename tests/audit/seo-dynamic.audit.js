const {chromium}=require('playwright');
const {SITE,WEB,MOCK,SHOTS}=require('../helpers/env');
const fs=require('fs'),path=require('path');
const ROOT=SITE,PAGE='file://'+ROOT+'/index.html';
const STUB=`(()=>{const n=new Proxy(function(){},{get:(t,k)=>k==='then'?undefined:n,apply:()=>n});window.gsap=n;window.ScrollTrigger=n})()`;
const out=[];const add=(id,area,check,ok,note,warn)=>out.push([id,area,check,ok?'PASS':(warn?'WARN':'FAIL'),note||'']);
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 /* D01 crawler view: JS off vs JS on */
 const c1=await b.newContext({viewport:{width:1366,height:768},javaScriptEnabled:false});const p1=await c1.newPage();await p1.goto(PAGE);await p1.waitForTimeout(500);
 const nojs=await p1.evaluate(()=>({h:[...document.querySelectorAll('h1,h2,h3')].map(h=>h.textContent.trim()).filter(Boolean).length,words:document.body.innerText.split(/\s+/).filter(w=>w.length>1).length,imgs:[...document.images].filter(i=>i.complete&&i.naturalWidth>0).length,all:document.images.length,title:document.title}));await c1.close();
 const c2=await b.newContext({viewport:{width:1366,height:768}});const p2=await c2.newPage();const errs=[];p2.on('pageerror',e=>errs.push(e.message));await p2.goto(PAGE);await p2.waitForTimeout(2500);
 const js=await p2.evaluate(()=>({h:[...document.querySelectorAll('h1,h2,h3')].map(h=>h.textContent.trim()).filter(Boolean).length,words:document.body.innerText.split(/\s+/).filter(w=>w.length>1).length,h1:document.querySelectorAll('h1').length}));
 add('D01','Crawlability','Headings identical with JS off and on',nojs.h===js.h,`no-JS ${nojs.h} headings / JS ${js.h}`);
 add('D02','Crawlability','Content readable without JS (>= 90% of words)',nojs.words>=0.9*js.words,`no-JS ${nojs.words} words vs JS ${js.words}`);
 add('D03','Crawlability','All images load without JS (static src)',nojs.imgs===nojs.all,`${nojs.imgs}/${nojs.all}`);
 /* D04 every referenced file exists */
 const refs=await p2.evaluate(()=>[...document.querySelectorAll('img[src],link[href],a[href]')].map(e=>e.getAttribute('src')||e.getAttribute('href')).filter(u=>u&&!u.startsWith('http')&&!u.startsWith('#')&&!u.startsWith('tel:')&&!u.startsWith('mailto:')&&!u.startsWith('data:')));
 const missing=[...new Set(refs)].filter(r=>!fs.existsSync(path.join(ROOT,r.split('?')[0])));add('D04','Crawlability','Every local file referenced by the page exists',missing.length===0,missing.join(', ')||`${new Set(refs).size} files checked`);
 add('D05','Console','No JavaScript errors on load',errs.length===0,errs[0]||'');
 /* D06 CLS/LCP indicative */
 for(const [n,w,h] of [['desktop',1366,768],['mobile',390,844]]){
  const c=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:n==='mobile'?2:1});await c.addInitScript(`window.__m={cls:0,lcp:0,lcpEl:''};new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)__m.cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{const e=l.getEntries().pop();__m.lcp=e.startTime;__m.lcpEl=(e.element&&(e.element.tagName+' '+(e.element.className||'').toString().slice(0,30)))||''}).observe({type:'largest-contentful-paint',buffered:true})`);
  const p=await c.newPage();await p.goto(PAGE);await p.waitForTimeout(3500);const m=await p.evaluate(()=>__m);
  add('D06'+(n==='desktop'?'a':'b'),'Core Web Vitals (indicative)',`CLS < 0.1 (${n})`,m.cls<0.1,`CLS ${m.cls.toFixed(3)}`);
  add('D07'+(n==='desktop'?'a':'b'),'Core Web Vitals (indicative)',`LCP < 2.5 s locally (${n})`,m.lcp<2500,`LCP ${Math.round(m.lcp)} ms, element ${m.lcpEl}`,true);
  await c.close()}
 /* D08 marketing funnel with UTM */
 const c3=await b.newContext({viewport:{width:1366,height:768}});await c3.addInitScript(STUB);const p3=await c3.newPage();await p3.goto(PAGE+'?utm_source=instagram&utm_medium=social&utm_campaign=launch&fbclid=abc123');await p3.addStyleTag({content:'#pre{display:none!important}'});await p3.waitForTimeout(600);
 await p3.evaluate(()=>{document.getElementById('cnx').click();document.getElementById('addb').click();document.getElementById('fab').addEventListener('click',e=>e.preventDefault());document.getElementById('fab').click()});
 await p3.evaluate(()=>{window.scrollTo(0,document.body.scrollHeight)});await p3.waitForTimeout(400);
 await p3.evaluate(()=>{const w=document.getElementById('wao');w.addEventListener('click',e=>e.preventDefault());w.click();document.getElementById('langbtn').click();document.getElementById('themebtn').click()});
 const ev=await p3.evaluate(()=>({names:dataLayer.map(e=>e.event),ctx:dataLayer.find(e=>e.event==='page_context'),lead:dataLayer.find(e=>e.event==='generate_lead'),href:decodeURIComponent(document.getElementById('wao').href),vi:dataLayer.find(e=>e.event==='view_item')}));
 const need=['page_context','view_item','add_to_cart','generate_lead','begin_checkout','scroll_depth','language_toggle','theme_toggle'];const miss=need.filter(n=>!ev.names.includes(n));
 add('D08','Marketing','Funnel events fire: '+need.join(', '),miss.length===0,miss.length?'missing '+miss:'all fired');
 add('D09','Marketing','UTM / click-id captured in page_context',ev.ctx&&ev.ctx.utm_source==='instagram'&&ev.ctx.utm_campaign==='launch'&&ev.ctx.fbclid==='abc123',JSON.stringify(ev.ctx||{}));
 add('D10','Marketing','generate_lead carries UTM and method',ev.lead&&ev.lead.method==='whatsapp'&&ev.lead.utm_source==='instagram',JSON.stringify(ev.lead||{}));
 add('D11','Marketing','WhatsApp order message has items, total and traffic source',/x Badam milk|x Vaigai Fresh/.test(ev.href)&&/Total: Rs/.test(ev.href)&&/Source: instagram/.test(ev.href),ev.href.slice(0,150).replace(/\n/g,' | '));
 await c3.close();
 /* D12 consent + tag loader */
 fs.writeFileSync(ROOT+'/__t.html',fs.readFileSync(ROOT+'/index.html','utf8').replace('gtm:"",ga4:"",pixel:""','gtm:"GTM-TEST123",ga4:"",pixel:""'));const TURL='file://'+ROOT+'/__t.html';
 const cc=await b.newContext({viewport:{width:390,height:844}});await cc.route('**/googletagmanager.com/**',r=>r.abort());
 const pc=await cc.newPage();await pc.goto(TURL);await pc.addStyleTag({content:'#pre{display:none!important}'});await pc.waitForTimeout(500);
 const banner=await pc.evaluate(()=>({show:!!document.querySelector('.consent'),role:document.querySelector('.consent')?.getAttribute('role'),gtmBefore:!!document.querySelector('script[src*="googletagmanager"]'),btn:[...document.querySelectorAll('.consent button')].map(b=>Math.round(b.getBoundingClientRect().height))}));
 add('D12','Consent','Cookie notice shown when a tracking ID is set; tags NOT loaded before consent',banner.show&&!banner.gtmBefore,JSON.stringify(banner));
 add('D13','Consent','Consent buttons are tap-friendly (>= 44 px)',banner.btn.every(h=>h>=44),String(banner.btn));
 await pc.click('.consent .y');await pc.waitForTimeout(300);const after=await pc.evaluate(()=>({gone:!document.querySelector('.consent'),gtm:!!document.querySelector('script[src*="googletagmanager.com/gtm.js?id=GTM-TEST123"]'),stored:localStorage.getItem('vaigai-consent')}));
 add('D14','Consent','Accept loads GTM and remembers the choice',after.gone&&after.gtm&&after.stored==='yes',JSON.stringify(after));
 await cc.close();
 const cd=await b.newContext({viewport:{width:390,height:844}});await cd.route('**/googletagmanager.com/**',r=>r.abort());
 const pd=await cd.newPage();await pd.goto(TURL);await pd.addStyleTag({content:'#pre{display:none!important}'});await pd.click('.consent .n');await pd.waitForTimeout(300);const dec=await pd.evaluate(()=>({gtm:!!document.querySelector('script[src*="googletagmanager"]'),stored:localStorage.getItem('vaigai-consent')}));
 add('D15','Consent','Decline keeps all tracking tags off',!dec.gtm&&dec.stored==='no',JSON.stringify(dec));await cd.close();
 /* D16 default state: no config => no banner, no third-party trackers */
 const c4=await b.newContext({viewport:{width:390,height:844}});await c4.addInitScript(STUB);const p4=await c4.newPage();const reqs=[];p4.on('request',r=>reqs.push(r.url()));await p4.goto(PAGE);await p4.waitForTimeout(800);
 const trackers=reqs.filter(u=>/googletagmanager|google-analytics|facebook|doubleclick|hotjar|clarity/.test(u));add('D16','Privacy','No tracker requests and no cookie banner until IDs are configured',trackers.length===0&&!(await p4.evaluate(()=>!!document.querySelector('.consent'))),trackers.join(',')||'none');
 const ext=[...new Set(reqs.filter(u=>u.startsWith('http')).map(u=>new URL(u).host))];add('D17','Privacy','Third-party hosts contacted (fonts + animation libs only)',ext.every(h=>/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/.test(h)),ext.join(', '));await c4.close();
 /* D18 language toggle updates html lang & keeps single H1 */
 const c5=await b.newContext({viewport:{width:1366,height:768}});await c5.addInitScript(STUB);const p5=await c5.newPage();await p5.goto(PAGE);await p5.addStyleTag({content:'#pre{display:none!important}'});await p5.click('#langbtn');await p5.waitForTimeout(300);const ta=await p5.evaluate(()=>({lang:document.documentElement.lang,h1:document.querySelectorAll('h1').length,title:document.title,saved:localStorage.getItem('vaigai-lang')}));
 add('D18','Language','Tamil mode sets html lang=ta, keeps one H1 and the English <title>',ta.lang==='ta'&&ta.h1===1&&/Vaigai Milk/.test(ta.title)&&ta.saved==='ta',JSON.stringify(ta));await c5.close();
 /* D19 hero carousel behaviour */
 const c6=await b.newContext({viewport:{width:1366,height:768}});const p6=await c6.newPage();await p6.goto(PAGE);await p6.waitForTimeout(2600);
 const hc=await p6.evaluate(async()=>{const bgs=()=>[...document.querySelectorAll('.hbgc')].findIndex(e=>e.classList.contains('on')),tab=()=>[...document.querySelectorAll('.htabs button')].findIndex(b=>b.getAttribute('aria-selected')==='true');const r=[];for(let i=1;i<4;i++){document.querySelectorAll('.htabs button')[i].click();await new Promise(r=>setTimeout(r,400));r.push([i,bgs(),tab(),document.querySelectorAll('.hs.on').length,[...document.querySelectorAll('.hs')].filter(s=>!s.hasAttribute('aria-hidden')).length])}return r});
 add('D19','Hero carousel','Each tab shows the matching slide + background colour, one slide active, others aria-hidden',hc.every(x=>x[0]===x[1]&&x[0]===x[2]&&x[3]===1&&x[4]===1),JSON.stringify(hc));await c6.close();
 await b.close();try{fs.unlinkSync(ROOT+'/__t.html')}catch(e){}
 fs.writeFileSync(SHOTS+'/dyn.json',JSON.stringify(out,null,1));
 const cnt={};out.forEach(r=>cnt[r[3]]=(cnt[r[3]]||0)+1);console.log(JSON.stringify(cnt));out.forEach(r=>{if(r[3]!=='PASS')console.log(r[3],r[0],r[2],'|',r[4].slice(0,220))});
})();
