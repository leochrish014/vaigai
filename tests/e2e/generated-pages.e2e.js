const {chromium}=require('playwright');
const {SITE,WEB,MOCK,SHOTS}=require('../helpers/env');
const ROOT='file://'+SITE+'/';
const STUB=`(()=>{const n=new Proxy(function(){},{get:(t,k)=>k==='then'?undefined:n,apply:()=>n});window.gsap=n;window.ScrollTrigger=n})()`;
const R=[];const ok=(n,c,i)=>{R.push([n,c?'PASS':'FAIL',i||'']);if(!c)console.log('FAIL',n,i||'')};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
const pages=[['ta','ta/index.html'],['anna','milk-delivery-anna-nagar-madurai/index.html'],['thiru','milk-delivery-thirunagar-madurai/index.html'],['rec','recipes/thayir-sadam-curd-rice-recipe/index.html'],['recidx','recipes/index.html']];
for(const [n,f] of pages)for(const [vw,vh,cs] of [[390,844,'light'],[390,844,'dark'],[1366,768,'light'],[320,568,'light']]){
 const c=await b.newContext({viewport:{width:vw,height:vh},colorScheme:cs});await c.addInitScript(STUB);const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(ROOT+f, {waitUntil: 'domcontentloaded'});await p.addStyleTag({content:'#pre{display:none!important}'});await p.waitForTimeout(700);await p.evaluate(()=>document.querySelectorAll('img').forEach(i=>i.loading='eager'));await p.waitForTimeout(500);
 const r=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,small:[...document.querySelectorAll('a,button,summary')].filter(e=>e.offsetParent&&!e.closest('.sr')&&(e.getBoundingClientRect().height<43.5||e.getBoundingClientRect().width<43.5)&&getComputedStyle(e).position!=='absolute'&&e.textContent.trim().length>0).map(e=>e.textContent.trim().slice(0,16)),broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src')),lang:document.documentElement.lang,h1:document.querySelector('h1').textContent.trim()}));
 ok(`${n} ${vw}px ${cs}: no sideways scroll, no JS errors, no broken images`,r.sw<=r.iw+1&&errs.length===0&&r.broken.length===0,JSON.stringify({sw:r.sw,errs:errs[0],broken:r.broken}));
 if(n!=='ta'&&n!=='recidx')ok(`${n} ${vw}px ${cs}: tap targets >= 44 px`,r.small.length===0,r.small.slice(0,4).join(','));
 if(vw===390&&cs==='light'){await p.screenshot({path:`${SHOTS}/pg_${n}_390.png`});}
 if(vw===390&&cs==='dark'&&n==='anna')await p.screenshot({path:`${SHOTS}/pg_${n}_dark.png`});
 if(n==='ta'&&vw===1366){ok('Tamil page: Tamil H1, html lang ta, language button shows EN, hero carousel and basket still present',/[\u0B80-\u0BFF]/.test(r.h1)&&r.lang==='ta'&&(await p.textContent('#langbtn'))==='EN'&&(await p.$$('.htabs button')).length===4&&!!(await p.$('#cartbtn')),r.h1);
  await p.click('#langbtn');await p.waitForTimeout(500);ok('Tamil page: EN button opens the English page',!/\/ta\//.test(p.url()),p.url());}
 if(n==='anna'&&vw===1366){const w=await p.$$eval('a[href*="wa.me"]',a=>a.map(x=>decodeURIComponent(x.href)));ok('Anna Nagar page: WhatsApp links carry the area name',w.length>=4&&w.every(x=>/Anna Nagar/.test(x)),w[0]);
  await p.click('details summary');ok('FAQ opens',await p.evaluate(()=>document.querySelector('details').open));}
 await c.close()}
await b.close();const f=R.filter(r=>r[1]==='FAIL').length;console.log('page UI tests:',R.length-f,'passed,',f,'failed');process.exit(f?1:0)})();
