const {chromium}=require('playwright');
const {SITE,WEB,MOCK,SHOTS}=require('../helpers/env');
const fs=require('fs');
const URL='file://'+SITE+'/index.html';
const STUB=`(()=>{const n=new Proxy(function(){},{get:(t,k)=>k==='then'?undefined:n,apply:()=>n});window.gsap=n;window.ScrollTrigger=n})()`;
const VPS=[['xs-320',320,568],['sm-360',360,640],['phone-390',390,844],['phone-430',430,932],['tab-768',768,1024],['tab-820',820,1180],['land-1024',1024,768],['lap-1280',1280,720],['lap-1366',1366,768],['lap-1536',1536,864],['fhd-1920',1920,1080],['qhd-2560',2560,1440],['phone-land',844,390]];
const R={layout:[],fallback:{},nojs:{},reduce:{},theme:{},seo:{},a11y:{},contrast:[]};
const lum=c=>{const a=c.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*a[0]+.7152*a[1]+.0722*a[2]};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const hex=h=>{h=h.replace('#','');return [0,2,4].map(i=>parseInt(h.substr(i,2),16))};
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 /* 1. layout matrix with GSAP stubbed (layout only) */
 for(const theme of ['light','dark']){
  for(const [n,w,h] of VPS){
   const ctx=await b.newContext({viewport:{width:w,height:h},colorScheme:theme});await ctx.addInitScript(STUB);
   const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_|Failed to load resource/.test(m.text()))errs.push(m.text())});
   await p.goto(URL, {waitUntil: 'domcontentloaded'});await p.addStyleTag({content:'#pre{display:none!important}.view>.sc:nth-child(n+2){display:none}.caps>.cap:nth-child(n+2){display:none}'});await p.waitForTimeout(700);
   await p.evaluate(()=>Promise.all([...document.images].map(i=>i.loading='eager')));await p.waitForTimeout(1200);
   const r=await p.evaluate(()=>{const o={sw:document.documentElement.scrollWidth,iw:innerWidth,theme:document.documentElement.dataset.theme,bad:[],broken:[],clip:[],small:[]};
    document.querySelectorAll('main *,footer *,header *').forEach(e=>{const b=e.getBoundingClientRect();if(!b.width||!b.height)return;const cs=getComputedStyle(e);
     if((b.right>innerWidth+2||b.left<-2)&&!e.closest('.dcard,.track,.wave,#drops,.hbg,.qimg,.sc,.cframe,.plane,#mp,.parts,.hs-prod,.hglow')&&cs.position!=='fixed')o.bad.push(e.tagName+'.'+(e.className&&e.className.baseVal===undefined?e.className:'')+' '+Math.round(b.left)+'..'+Math.round(b.right));
     if(['H1','H2','H3','P','A','BUTTON','SPAN','LI','B'].includes(e.tagName)&&e.scrollWidth>e.clientWidth+3&&cs.overflow!=='visible'&&!e.closest('.w')&&!e.closest('.sr'))o.clip.push(e.tagName+' '+(e.textContent||'').trim().slice(0,24));
     if((e.tagName==='A'||e.tagName==='BUTTON')&&(b.width<44||b.height<44)&&!e.closest('.sr')&&!e.closest('footer')&&cs.visibility!=='hidden')o.small.push((e.textContent||e.ariaLabel||'').trim().slice(0,18)+' '+Math.round(b.width)+'x'+Math.round(b.height))});
    document.querySelectorAll('img').forEach(i=>{if(!i.complete||i.naturalWidth===0)o.broken.push(i.getAttribute('src'))});
    o.pins=[...document.querySelectorAll('#story,#flav')].map(sec=>{window.scrollTo(0,sec.offsetTop+2);const s=sec.querySelector('.stage').getBoundingClientRect();return s.top>=0&&s.bottom<=innerHeight+1});window.scrollTo(0,0);
    o.hero=(()=>{const i=document.querySelector('#hero img').getBoundingClientRect();return Math.round(i.width)+'x'+Math.round(i.height)})();
    o.bad=o.bad.slice(0,5);o.clip=o.clip.slice(0,5);o.small=[...new Set(o.small)].slice(0,6);return o});
   r.vp=n;r.errs=errs.slice(0,2);R.layout.push(r);
   if(['phone-390','lap-1366','tab-820'].includes(n)){for(const id of ['hero','intro','story','range','moments','faq','cta']){try{await p.locator('#'+id).screenshot({path:`${SHOTS}/qa_${theme}_${n}_${id}.png`})}catch(e){}}}
   await ctx.close();
  }
 }
 /* 2. fallback: real page, CDN unreachable => no GSAP */
 {const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(URL, {waitUntil: 'domcontentloaded'});await p.waitForTimeout(1500);
  R.fallback=await p.evaluate(()=>({nogs:document.body.classList.contains('nogs'),pre:!!document.getElementById('pre'),h1:document.querySelector('h1').textContent.trim(),h1vis:document.querySelector('h1').getBoundingClientRect().height>0,scenes:[...document.querySelectorAll('#story .sc')].map(e=>Math.round(e.getBoundingClientRect().height)),sw:document.documentElement.scrollWidth}));R.fallback.errs=errs;await ctx.close()}
 /* 3. JS disabled */
 {const ctx=await b.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});const p=await ctx.newPage();await p.goto(URL, {waitUntil: 'domcontentloaded'});await p.waitForTimeout(800);
  R.nojs=await p.evaluate(()=>({pre:getComputedStyle(document.getElementById('pre')).display,h1:document.querySelector('h1').textContent.trim(),imgsLoaded:[...document.images].filter(i=>i.complete&&i.naturalWidth>0).length,imgs:document.images.length,faq:document.querySelectorAll('details').length,sw:document.documentElement.scrollWidth}));await ctx.close()}
 /* 4. reduced motion */
 {const ctx=await b.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});await ctx.addInitScript(STUB);const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(URL, {waitUntil: 'domcontentloaded'});await p.waitForTimeout(800);R.reduce={errs,lenis:await p.evaluate(()=>typeof window.Lenis)};await ctx.close()}
 /* 5. theme toggle + persistence */
 {const ctx=await b.newContext({viewport:{width:1366,height:768},colorScheme:'light'});await ctx.addInitScript(STUB);const p=await ctx.newPage();await p.goto(URL, {waitUntil: 'domcontentloaded'});await p.addStyleTag({content:'#pre{display:none!important}'});
  const t0=await p.evaluate(()=>document.documentElement.dataset.theme);await p.click('#themebtn');const t1=await p.evaluate(()=>[document.documentElement.dataset.theme,document.getElementById('themebtn').getAttribute('aria-pressed'),document.getElementById('themebtn').getAttribute('aria-label'),getComputedStyle(document.body).backgroundColor]);
  await p.reload();await p.addStyleTag({content:'#pre{display:none!important}'});const t2=await p.evaluate(()=>document.documentElement.dataset.theme);await p.click('#themebtn');const t3=await p.evaluate(()=>[document.documentElement.dataset.theme,getComputedStyle(document.body).backgroundColor]);
  R.theme={initial:t0,afterClick:t1,afterReload:t2,backToLight:t3};
  /* basket + whatsapp + dataLayer */
  await p.evaluate(()=>{document.getElementById('addb').click();document.getElementById('addb').click();document.getElementById('cnx').click();document.getElementById('addb').click()});
  R.basket=await p.evaluate(()=>({count:document.getElementById('cc').textContent,href:decodeURIComponent(document.getElementById('wao').href).slice(0,120),events:dataLayer.map(e=>e.event)}));
  /* keyboard: tab order accessible names */
  const names=[];for(let i=0;i<14;i++){await p.keyboard.press('Tab');names.push(await p.evaluate(()=>{const a=document.activeElement;return (a.getAttribute('aria-label')||a.textContent||a.tagName).trim().slice(0,28)}))}
  R.a11y.tabOrder=names;
  /* seo */
  R.seo=await p.evaluate(()=>{const g=s=>document.querySelector(s),m=n=>(g(`meta[name="${n}"]`)||{}).content,og=n=>(g(`meta[property="${n}"]`)||{}).content;
   const hs=[...document.querySelectorAll('h1,h2,h3')].map(h=>+h.tagName[1]);let jumps=0;for(let i=1;i<hs.length;i++)if(hs[i]-hs[i-1]>1)jumps++;
   const ld=[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>{try{return JSON.parse(s.textContent)['@type']}catch(e){return 'INVALID'}});
   const faqLD=JSON.parse([...document.querySelectorAll('script[type="application/ld+json"]')].find(s=>s.textContent.includes('FAQPage')).textContent).mainEntity.map(q=>q.name);
   const faqDOM=[...document.querySelectorAll('details summary')].map(s=>s.textContent.trim());
   return {title:document.title,titleLen:document.title.length,desc:m('description'),descLen:(m('description')||'').length,lang:document.documentElement.lang,canonical:(g('link[rel=canonical]')||{}).href,robots:m('robots'),viewport:m('viewport'),og:['og:title','og:description','og:image','og:type','og:url'].map(k=>!!og(k)),twitter:!!m('twitter:card'),h1:document.querySelectorAll('h1').length,headingJumps:jumps,jsonld:ld,faqMatch:JSON.stringify(faqLD)===JSON.stringify(faqDOM),imgs:document.images.length,noAlt:[...document.images].filter(i=>!i.hasAttribute('alt')).length,emptyAlt:[...document.images].filter(i=>i.alt==='').length,noDims:[...document.images].filter(i=>!i.width||!i.height||!i.getAttribute('width')).length,landmarks:['header','nav','main','footer'].map(t=>document.querySelectorAll(t).length),links:[...document.querySelectorAll('a')].filter(a=>!(a.textContent.trim()||a.getAttribute('aria-label'))).length,heroPriority:g('#hero img').getAttribute('fetchpriority'),lazyBelow:[...document.images].filter(i=>i.loading==='lazy').length,visibleTextChars:document.body.innerText.length}});
  await ctx.close()}
 await b.close();
 /* 6. contrast (token pairs, WCAG) */
 const L={bg:'#f7f5ee',bg2:'#e8f2ec',bg3:'#dcebe3',ink:'#0a2a24',muted:'#46605a',accent:'#0e6b3a',card:'#ffffff',price:'#7a4f00',foot:'#0a2a24',ra:'#ffffff',rb:'#e0efe7',faq:'#ffffff'};
 const D={bg:'#06303a',bg2:'#072a31',bg3:'#04202a',ink:'#eaf5f0',muted:'#a9c7be',accent:'#46d27a',card:'#0c3d48',price:'#e3b341',foot:'#031a20',ra:'#0a4f4a',rb:'#06303a'};
 for(const [nm,T] of [['light',L],['dark',D]]){
  const pairs=[['ink','bg'],['ink','bg2'],['ink','bg3'],['muted','bg'],['muted','bg2'],['muted','bg3'],['accent','bg'],['accent','bg2'],['accent','bg3'],['ink','card'],['muted','card'],['ink','ra'],['ink','rb'],['price','ra'],['price','rb'],['accent','ra'],['accent','rb']];
  for(const [f,g] of pairs)R.contrast.push([nm,f+' on '+g,+ratio(hex(T[f]),hex(T[g])).toFixed(2)]);
 }
 const fixed=[['btn text on gold','#0a2a24','#e3b341'],['white on WhatsApp green','#ffffff','#0b7a3e'],['footer text','#b9d4cc','#0a2a24'],['footer text (dark)','#b9d4cc','#031a20'],['footer heading','#8ff0b0','#0a2a24'],['quality muted','#b9d4cc','#000000'],['quality accent','#6fe39a','#000000']];
 for(const [n,f,g] of fixed)R.contrast.push(['fixed',n,+ratio(hex(f),hex(g)).toFixed(2)]);
 fs.writeFileSync(SHOTS+'/qa.json',JSON.stringify(R,null,1));
 /* print summary */
 const fails=R.layout.filter(r=>r.sw>r.iw||r.bad.length||r.broken.length||r.errs.length||r.pins.some(x=>!x)||r.clip.length);
 console.log('layout runs:',R.layout.length,'failures:',fails.length);fails.forEach(r=>console.log(' FAIL',r.theme,r.vp,JSON.stringify({sw:r.sw,iw:r.iw,bad:r.bad,broken:r.broken,errs:r.errs,pins:r.pins,clip:r.clip})));
 const smalls={};R.layout.forEach(r=>r.small.forEach(s=>smalls[s]=(smalls[s]||0)+1));console.log('small tap targets:',JSON.stringify(smalls));
 console.log('fallback',JSON.stringify(R.fallback));console.log('nojs',JSON.stringify(R.nojs));console.log('reduce',JSON.stringify(R.reduce));
 console.log('theme',JSON.stringify(R.theme));console.log('basket',JSON.stringify(R.basket));console.log('tab',JSON.stringify(R.a11y.tabOrder));
 console.log('seo',JSON.stringify(R.seo));
 console.log('contrast below 4.5:',JSON.stringify(R.contrast.filter(c=>c[2]<4.5)));console.log('contrast min/max',Math.min(...R.contrast.map(c=>c[2])));
})();
