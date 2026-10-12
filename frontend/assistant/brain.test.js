const B=require('./brain.js');
const cat=[{k:'carton',n:'Vaigai Fresh milk',nt:'வைகை ஃப்ரெஷ் பால்',u:'500 ml',p:32,sku:'VGM-CARTON-500ml',d:'Everyday milk.',dt:'தினசரி பால்.'},{k:'badam',n:'Badam milk',nt:'பாதாம் பால்',u:'250 ml',p:55,sku:'VGM-BADAM-250ml',d:'Almond milk.',dt:'பாதாம் பால்.'},{k:'ghee',n:'Farm ghee',nt:'பண்ணை நெய்',u:'500 ml',p:320,sku:'VGM-GHEE-500ml',d:'Ghee.',dt:'நெய்.'},{k:'curd',n:'Set curd',nt:'கெட்டித் தயிர்',u:'400 g',p:60,sku:'VGM-CURD-400g',d:'Curd.',dt:'தயிர்.'},{k:'butter',n:'Fresh butter',nt:'புதிய வெண்ணெய்',u:'200 g',p:110,sku:'VGM-BUTTER-200g',d:'Butter.',dt:'வெண்ணெய்.'},{k:'hero',n:'Glass bottle milk',nt:'கண்ணாடி பாட்டில் பால்',u:'500 ml',p:36,sku:'VGM-HERO-500ml',d:'Glass milk.',dt:'கண்ணாடி பால்.'}];
let basket=[];const br=B.create({cat,getBasket:()=>basket});
let pass=0,fail=0;const T=(name,ok,info)=>{if(ok)pass++;else{fail++;console.log('FAIL',name,info||'')}};
const I=(s)=>br.intentOf(s).intent;
const cases=[['hi','greet'],['vanakkam','greet'],['வணக்கம்','greet'],['hello there','greet'],['thanks a lot','thanks'],['நன்றி','thanks'],['bye','bye'],
['show products','products'],['what do you sell','products'],['enna irukku','products'],['என்ன இருக்கு','products'],
['price of ghee','price'],['ghee evlo','price'],['நெய் விலை என்ன','price'],['how much is curd','price'],
['add 2 curd','add'],['2 curd and 1 ghee venum','add'],['oru badam milk venum','add'],['தயிர் வேண்டும்','add'],['I want butter','add'],['add milk','add'],
['basket','basket'],['show my cart','basket'],['கூடை','basket'],['remove ghee','remove'],['clear basket','remove'],
['checkout','checkout'],['place order','checkout'],['order now','checkout'],
['do you deliver to anna nagar','delivery'],['delivery time','delivery'],['625010','delivery'],['டெலிவரி எப்போது','delivery'],['deliver to chennai','delivery'],['kk nagar','delivery'],
['daily 1 milk monthly cost','subscription'],['weekly plan for curd','subscription'],['தினமும் பால்','subscription'],
['is it pasteurised','quality'],['any preservatives','quality'],['quality tested?','quality'],
['bulk order for cafe','bulk'],['we run a restaurant','bulk'],['my milk was sour','complaint'],['order not delivered','complaint'],['refund please','complaint'],['பால் புளித்து போச்சு','complaint'],
['talk to human','human'],['I want to speak to manager','human'],['call me back','callback'],['callback please','callback'],
['switch to tamil','language'],['தமிழ்','language'],['dark mode','theme'],['any discount?','offers'],['I am diabetic','health'],['VGM-250101-AB12 status','status'],
['recommend for coffee','recommend'],['suggest something for kids','recommend'],['what is best for festival sweets','recommend'],['asdfghjk','unknown'],['ghee','info'],['butter?','info']];
cases.forEach(([s,e])=>{const g=I(s);T('intent "'+s+'"',g===e,'got '+g+' expected '+e)});
// entities
let f=br.findProducts(B.norm('2 curd and 1 ghee venum'));T('multi qty',f.length===2&&f.find(x=>x.i===3).q===2&&f.find(x=>x.i===2).q===1,JSON.stringify(f));
f=br.findProducts(B.norm('ghee 3'));T('qty after',f[0]&&f[0].q===3,JSON.stringify(f));
f=br.findProducts(B.norm('rendu thayir'));T('tanglish qty',f[0]&&f[0].i===3&&f[0].q===2,JSON.stringify(f));
f=br.findProducts(B.norm('add milk'));T('milk ambiguous',f.length===2&&f.every(x=>x.amb));
f=br.findProducts(B.norm('vaigai fresh'));T('vaigai fresh',f[0]&&f[0].i===0);
// respond: add action
let r=br.respond('add 2 curd and 1 ghee',null,'en');T('add actions',r.a&&r.a.length===2&&r.a[0].type==='add',JSON.stringify(r.a));
r=br.respond('தயிர் வேண்டும்',null,'en');T('tamil reply lang',r.lang==='ta'&&r.a.length===1);
// price text includes price
r=br.respond('price of ghee',null,'en');T('price shows 320',JSON.stringify(r.m).includes('₹320'));
// delivery
r=br.respond('do you deliver to anna nagar',null,'en');T('anna nagar yes',JSON.stringify(r.m).includes('Anna Nagar')&&JSON.stringify(r.m).includes('5:30'));
r=br.respond('625010',null,'en');T('pin ok',JSON.stringify(r.m).includes('Yes'));
r=br.respond('600001',null,'en');T('pin out',JSON.stringify(r.m).includes('do not deliver'));
r=br.respond('deliver to chennai',null,'en');T('city generic',r.intent==='delivery');
// checkout empty
basket=[];r=br.respond('checkout',null,'en');T('checkout empty asks products',r.st.mode===null&&JSON.stringify(r.m).includes('empty'));
// full order flow
basket=[{i:3,q:2},{i:2,q:1}];r=br.respond('checkout',null,'en');T('order starts',r.st.mode==='order'&&r.st.step==='name');let st=r.st;
r=br.respond('Karthik',st,'en');st=r.st;T('name ok',st.step==='phone');
r=br.respond('12345',st,'en');st=r.st;T('bad phone rejected',st.step==='phone');
r=br.respond('+91 98765 43210',st,'en');st=r.st;T('phone ok',st.step==='addr'&&st.d.phone==='9876543210');
r=br.respond('12 Main Street Chennai 600001',st,'en');st=r.st;T('uncovered address stays',st.step==='addr',st.step);
r=br.respond('12 Main Street, Anna Nagar, Madurai 625020',st,'en');st=r.st;T('covered address',st.step==='slot'&&st.d.area==='Anna Nagar',JSON.stringify(st));
r=br.respond('slot2',st,'en');st=r.st;T('slot picked',st.step==='confirm'&&st.d.slot.includes('6:30'));
r=br.respond('yes',st,'en');T('order submitted',r.a&&r.a[0].type==='submit_order'&&r.a[0].order.total===440&&r.a[0].order.items.length===2&&r.a[0].order.customer.phone==='9876543210',JSON.stringify(r.a));
// cancel mid flow
basket=[{i:0,q:1}];r=br.respond('checkout',null,'en');r=br.respond('cancel',r.st,'en');T('cancel flow',r.st.mode===null);
// lead flows
r=br.respond('call me back',null,'en');T('callback asks phone',r.st.mode==='lead'&&r.st.step==='phone');r=br.respond('9123456789',r.st,'en');T('callback lead',r.a&&r.a[0].type==='submit_lead'&&r.a[0].lead.type==='callback');
r=br.respond('my milk was sour',null,'en');st=r.st;T('complaint detail',st.step==='detail');r=br.respond('Yesterday morning the carton was sour',st,'en');st=r.st;r=br.respond('9123456789',st,'en');T('complaint lead',r.a&&r.a[0].lead.type==='complaint'&&r.a[0].lead.detail.includes('sour'));
r=br.respond('bulk order for cafe',null,'en');st=r.st;r=br.respond('Cafe Madurai, 20 litres daily',st,'en');r=br.respond('9123456789',r.st,'en');T('bulk lead',r.a&&r.a[0].lead.type==='bulk');
// subscription
r=br.respond('daily 2 ghee monthly',null,'en');T('sub estimate',JSON.stringify(r.m).includes('19200'),JSON.stringify(r.m).slice(0,160));r=br.respond('yes',r.st,'en');T('sub to lead',r.st.mode==='lead'&&r.st.d.type==='subscription');
// actions
r=br.respond('switch to tamil',null,'en');T('lang action',r.a[0].type==='lang'&&r.a[0].v==='ta');r=br.respond('dark mode',null,'en');T('theme action',r.a[0].type==='theme'&&r.a[0].v==='dark');
r=br.respond('talk to human',null,'en');T('whatsapp action',r.a[0].type==='whatsapp');
r=br.respond('VGM-250101-AB12 status',null,'en');T('status action',r.a[0].type==='status'&&r.a[0].id==='VGM-250101-AB12');
// recommend
r=br.respond('recommend for coffee',null,'en');T('rec coffee',JSON.stringify(r.m).includes('coffee'));r=br.respond('what is best for idli dosa',null,'en');T('rec idli',r.m.some(x=>x.t==='products'&&x.i.includes(3)));
// remove
basket=[{i:2,q:1}];r=br.respond('remove ghee',null,'en');T('remove action',r.a[0].type==='remove'&&r.a[0].i===2);
// no hallucinated offers
r=br.respond('any offers today',null,'en');T('no fake offer',/do not have any running offers/.test(JSON.stringify(r.m)));
// medical guard
r=br.respond('is it ok for my diabetic father',null,'en');T('medical guard',/cannot give medical advice/.test(JSON.stringify(r.m)));
// fuzz: never throws, always returns messages
const junk=['','   ','😀😀','<script>alert(1)</script>','a'.repeat(5000),'\u0000','625','VGM-','add 999 ghee','add -5 curd','ghee '.repeat(200)];
junk.forEach(s=>{try{const x=br.respond(s,null,'en');T('fuzz '+JSON.stringify(s).slice(0,20),Array.isArray(x.m)&&x.m.length>0)}catch(e){T('fuzz throws '+s.slice(0,10),false,e.message)}});
r=br.respond('add 999 ghee',null,'en');T('qty cap',r.a&&r.a.length?r.a[0].q<=99:true);
// payment step (online payments enabled)
{let pay=true;const b2=B.create({cat,getBasket:()=>basket,payOnline:()=>pay});basket=[{i:2,q:1}];let r=b2.respond('checkout',null,'en'),st=r.st;r=b2.respond('Meena',st,'en');st=r.st;r=b2.respond('9876501234',st,'en');st=r.st;r=b2.respond('5 Temple Rd, Teppakulam, Madurai 625009',st,'en');st=r.st;r=b2.respond('slot1',st,'en');st=r.st;
 T('payment step asks how to pay with 2 choices',st.step==='pay'&&r.m[1].t==='chips'&&r.m[1].c.length===2,JSON.stringify(r.m).slice(0,160));
 r=b2.respond('maybe',st,'en');T('payment step rejects unclear answer',r.st.step==='pay');
 r=b2.respond('pay_online',st,'en');st=r.st;T('online chosen -> summary shows Online',st.step==='confirm'&&JSON.stringify(r.m).includes('Online'));
 r=b2.respond('yes',st,'en');T('order carries payment:online',r.a[0].order.payment==='online'&&r.a[0].order.total===320);
 basket=[{i:2,q:1}];r=b2.respond('checkout',null,'en');st=r.st;['Meena','9876501234','5 Temple Rd, Teppakulam, Madurai 625009','slot1'].forEach(x=>{r=b2.respond(x,st,'en');st=r.st});r=b2.respond('pay_cod',st,'en');st=r.st;r=b2.respond('yes',st,'en');T('cash on delivery -> payment:cod',r.a[0].order.payment==='cod');
 basket=[{i:2,q:1}];pay=false;r=b2.respond('checkout',null,'en');st=r.st;['Meena','9876501234','5 Temple Rd, Teppakulam, Madurai 625009','slot1'].forEach(x=>{r=b2.respond(x,st,'en');st=r.st});T('payments disabled -> no payment step, straight to confirm',st.step==='confirm');}
// WhatsApp mode: sender's number is known
{const bw=B.create({cat,getBasket:()=>basket,knownPhone:'9876543210'});basket=[{i:3,q:1}];let r=bw.respond('checkout',null,'en'),st=r.st;r=bw.respond('Meena',st,'en');st=r.st;T('whatsapp: phone step skipped, asks address',st.step==='addr'&&st.d.phone==='9876543210'&&/WhatsApp number/.test(JSON.stringify(r.m)));
 r=bw.respond('5 Temple Rd, Teppakulam, Madurai 625009',st,'en');st=r.st;r=bw.respond('slot1',st,'en');st=r.st;r=bw.respond('yes',st,'en');T('whatsapp: order uses sender phone',r.a&&r.a[0].order.customer.phone==='9876543210'&&r.a[0].order.total===60);
 r=bw.respond('call me back',null,'en');T('whatsapp: callback submitted at once with sender phone',r.a&&r.a[0].lead.phone==='9876543210'&&r.a[0].lead.type==='callback'&&r.st.mode===null);
 r=bw.respond('my milk was sour',null,'en');r=bw.respond('Yesterday evening it was sour',r.st,'en');T('whatsapp: complaint submitted after one description',r.a&&r.a[0].lead.type==='complaint'&&r.a[0].lead.phone==='9876543210'&&/Reference/.test(JSON.stringify(r.m)))}
console.log('brain tests:',pass,'passed,',fail,'failed');process.exit(fail?1:0);
