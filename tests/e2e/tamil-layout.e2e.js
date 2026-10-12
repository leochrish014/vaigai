const {chromium}=require('playwright');
const {SITE,WEB,MOCK,SHOTS}=require('../helpers/env');
const STUB=`(()=>{const n=new Proxy(function(){},{get:(t,k)=>k==='then'?undefined:n,apply:()=>n});window.gsap=n;window.ScrollTrigger=n})()`;
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const out=[];let first=true;
 for(const [n,w,h] of [['xs-320',320,568],['phone-390',390,844],['tab-820',820,1180],['land-1024',1024,768],['lap-1366',1366,768],['fhd-1920',1920,1080],['phone-land',844,390]]){
  for(const th of ['light','dark']){
   const ctx=await b.newContext({viewport:{width:w,height:h},colorScheme:th,locale:'ta-IN'});await ctx.addInitScript(STUB);const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
   await p.goto('file://'+SITE+'/index.html');await p.addStyleTag({content:'#pre{display:none!important}.view>.sc:nth-child(n+2){display:none}.caps>.cap:nth-child(n+2){display:none}'});await p.waitForTimeout(700);
   await p.evaluate(()=>document.querySelectorAll('img').forEach(i=>i.loading='eager'));await p.waitForTimeout(500);
   const r=await p.evaluate(()=>{const o={lang:document.documentElement.lang,sw:document.documentElement.scrollWidth,iw:innerWidth,clip:[],over:[],i18n:window.__i18n&&{m:window.__i18n.matched,k:window.__i18n.keys,miss:window.__i18n.missing.slice(0,5)},navw:0};
    const nav=document.querySelector('.nav');o.navw=[Math.round(nav.scrollWidth),Math.round(nav.clientWidth)];
    document.querySelectorAll('main *,footer *,header *').forEach(e=>{const b=e.getBoundingClientRect();if(!b.width)return;const cs=getComputedStyle(e);
     if((b.right>innerWidth+2||b.left<-2)&&!e.closest('.dcard,.track,.wave,#drops,.hbg,.qimg,.sc,.cframe,.plane,#mp,.parts,.hs-prod,.hglow')&&cs.position!=='fixed')o.over.push(e.tagName+' '+(e.textContent||'').trim().slice(0,20));
     if(['H1','H2','H3','P','A','BUTTON','SPAN','LI','B'].includes(e.tagName)&&e.scrollWidth>e.clientWidth+3&&cs.overflow!=='visible'&&!e.closest('.w,.sr'))o.clip.push(e.tagName+' '+(e.textContent||'').trim().slice(0,20))});
    o.pins=[...document.querySelectorAll('#story,#flav')].map(sec=>{window.scrollTo(0,sec.offsetTop+2);const s=sec.querySelector('.stage').getBoundingClientRect();return s.top>=0&&s.bottom<=innerHeight+1});window.scrollTo(0,0);return o});
   r.vp=n+'/'+th;r.errs=errs;out.push(r);
   if(['xs-320','lap-1366','phone-390'].includes(n)&&th==='light'){await p.screenshot({path:`${SHOTS}/ta_${n}_top.png`});for(const id of ['story','moments']){try{await p.locator('#'+id).screenshot({path:`${SHOTS}/ta_${n}_${id}.png`})}catch(e){}}}
   await ctx.close()}}
 await b.close();
 out.forEach(r=>{const bad=r.sw>r.iw||r.over.length||r.clip.length||r.errs.length||r.pins.some(x=>!x)||r.navw[0]>r.navw[1]+1;console.log(bad?'FAIL':'ok  ',r.vp,r.lang,JSON.stringify(bad?{sw:r.sw,over:r.over.slice(0,3),clip:r.clip.slice(0,3),errs:r.errs,pins:r.pins,nav:r.navw}:{nav:r.navw}))});
 console.log('i18n',JSON.stringify(out[0].i18n));})();
