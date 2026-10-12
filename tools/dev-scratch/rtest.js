const {chromium}=require('/home/claude/.npm-global/lib/node_modules/playwright');
const fs=require('fs');
(async()=>{
 let html=fs.readFileSync('/mnt/user-data/outputs/vaigai-milk.html','utf8').replace(/<script src="[^"]+"><\/script>/g,'');
 const stub=`<script>const __n=new Proxy(function(){},{get:(t,k)=>k==='then'?undefined:__n,apply:()=>__n});window.gsap=__n;window.ScrollTrigger=__n;</script>`;
 html=html.replace('<script>\nconst IMG',stub+'<script>\nconst IMG');
 html=html.replace('</style>','#pre{display:none!important}.view>.sc:nth-child(n+2){display:none}.caps>.cap:nth-child(n+2){display:none}.pin{position:relative!important}#story,#flav{height:auto!important}</style>');
 fs.writeFileSync('/home/claude/test.html',html);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
 const vps=[['phone-small',320,568],['phone',390,844],['tablet',820,1180],['laptop',1366,768],['desktop',1920,1080],['phone-land',844,390]];
 for(const [n,w,h] of vps){
  const p=await b.newPage({viewport:{width:w,height:h}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///home/claude/test.html');await p.waitForTimeout(900);
  const r=await p.evaluate(()=>{const o={sw:document.documentElement.scrollWidth,iw:innerWidth,bad:[]};
   document.querySelectorAll('section *').forEach(e=>{const b=e.getBoundingClientRect();if(b.width>0&&(b.right>innerWidth+2||b.left<-2)&&!e.closest('.dcard,.track,.wave,#drops,.hbg,.qimg')&&getComputedStyle(e).position!=='fixed')o.bad.push(e.tagName+'.'+(e.className||e.id)+' '+Math.round(b.left)+'-'+Math.round(b.right))});
   o.bad=o.bad.slice(0,6);
   o.pins=[...document.querySelectorAll('.pin')].map(pn=>{const s=pn.querySelector('.stage').getBoundingClientRect();return {top:Math.round(s.top),bottom:Math.round(s.bottom),vh:innerHeight}});
   return o});
  console.log(n,w+'x'+h,JSON.stringify(r),errs.length?('ERR '+errs[0]):'');
  const ids=['hero','intro','story','beyond','flav','range','moments','quality','cta'];
  for(const id of ids){try{await p.locator('#'+id).screenshot({path:`/home/claude/shots/${n}_${id}.png`})}catch(e){}}
  await p.close();
 }
 await b.close();
})();
