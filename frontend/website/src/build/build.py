"""Vaigai Milk page generator: design tokens, content, HTML, JSON-LD and the client bundle.

Executed by build_site.py with REPO and HERE already defined (see build_site.py).
Sections: assets -> content (SITE, PR, FAQ) -> CSS tokens -> HTML sections -> head/SEO -> page().
"""
import base64,json,os,re
ASSETS=REPO/'frontend'/'website'/'assets'
IMAGE_KEYS=['hero','farm','dairy','combo','curd','carton','crate','ghee','badam','family','butter','cut_milk','cut_ghee','cut_butter','cut_curd']
IMGS={k:'data:image/webp;base64,'+base64.b64encode((ASSETS/'images'/f'{k}.webp').read_bytes()).decode() for k in IMAGE_KEYS}
DIM={k:(1408,768) if k in('farm','dairy') else (1376,768) for k in IMGS}
FN={'hero':'vaigai-milk-bottle-crown-splash','farm':'madurai-dairy-farm-cattle-aerial-view','dairy':'vaigai-milk-dairy-madurai-sunrise','combo':'vaigai-paneer-ghee-curd-range','curd':'vaigai-set-curd-clay-pot','carton':'vaigai-fresh-milk-carton-500ml','crate':'vaigai-milk-glass-bottles-wooden-crate','ghee':'vaigai-farm-ghee-jar','badam':'vaigai-badam-flavoured-milk-bottle','family':'vaigai-milk-product-range','butter':'vaigai-fresh-butter-block','cut_milk':'vaigai-milk-bottle-splash-cutout','cut_ghee':'vaigai-ghee-jar-splash-cutout','cut_butter':'vaigai-butter-block-cutout','cut_curd':'vaigai-curd-clay-pot-cutout'}
FNC={'combo':'vaigai-paneer-ghee-curd-cutout','badam':'vaigai-badam-milk-cutout','carton':'vaigai-fresh-carton-cutout','family':'vaigai-milk-range-cutout'}
HP='images/'+FN['cut_milk']+'.webp'
OGF='vaigai-milk-madurai-share.jpg';LOGOF='vaigai-milk-logo.png'
FSK=['combo','badam','carton','family'];CUT={}
for _k in FSK:
    CUT[_k]=json.load(open(ASSETS/'cutouts'/f'{_k}.json'))
    for _s in('main','atl'):IMGS[f'fs_{_k}_{_s}']='data:image/webp;base64,'+base64.b64encode((ASSETS/'cutouts'/f'{_k}_{_s}.webp').read_bytes()).decode()
DIM.update({k:tuple(v) for k,v in json.load(open(ASSETS/'cutouts'/'cutdims.json')).items()})
SITE=dict(url='https://www.example.com/',phone='+91 00000 00000',wa='910000000000',email='hello@example.com',
  street='Sample Street, Goripalayam',city='Madurai',state='Tamil Nadu',pin='625002')
PR=[
 dict(n='Vaigai Fresh milk',ta='பால்',u='500 ml',p=32,k='carton',d='Everyday pasteurised milk in a clean, sealed pack.',alt='Vaigai Fresh 500 ml milk carton'),
 dict(n='Badam milk',ta='பாதாம்',u='250 ml',p=55,k='badam',d='Roasted almonds and saffron in chilled, creamy milk.',alt='Vaigai Badam flavoured milk bottle with almonds'),
 dict(n='Farm ghee',ta='நெய்',u='500 ml',p=320,k='ghee',d='Golden, grainy and fragrant. Slow-made from fresh cream.',alt='Vaigai Farm Ghee jar with a wooden spoon'),
 dict(n='Set curd',ta='தயிர்',u='400 g',p=60,k='curd',d='Set in a clay pot the traditional way. Thick and cool.',alt='Vaigai set curd in a traditional clay pot'),
 dict(n='Fresh butter',ta='வெண்ணெய்',u='200 g',p=110,k='butter',d='Cold, creamy and just salty enough.',alt='Block of Vaigai fresh butter with a knife'),
 dict(n='Glass bottle milk',ta='பால்',u='500 ml',p=36,k='hero',d='Full cream milk in returnable glass. Pure and simple.',alt='Vaigai Milk glass bottle in a crown splash of milk')]
MO=[
 dict(t='Morning coffee',k='crate',d='Fresh bottles on the doorstep for the first filter coffee.',p=5,alt='Two Vaigai Milk bottles in a wooden crate on a doorstep'),
 dict(t='Smoothies',k='badam',d='Cold, creamy badam milk blends smooth with banana and dates.',p=1,alt='Vaigai Badam milk with almonds'),
 dict(t='Breakfast',k='curd',d='Set curd with idli, dosa or a bowl of millet porridge.',p=3,alt='Set curd in a clay pot with berries and almonds'),
 dict(t='Kids',k='carton',d='Easy, sealed packs for school lunchboxes and bedtime glasses.',p=0,alt='Vaigai Milk 500 ml carton'),
 dict(t='Desserts',k='butter',d='Butter and ghee for payasam, halwa and festival sweets.',p=4,alt='Vaigai butter on a slate board'),
 dict(t='Everyday nutrition',k='combo',d='Milk, paneer, ghee and curd. The whole family in one order.',p=2,alt='Vaigai paneer, ghee and curd')]
FAQ=[
 ('Which areas of Madurai do you deliver to?','We deliver across Anna Nagar, KK Nagar, Teppakulam, Goripalayam, Thirunagar, Tallakulam and nearby areas. Message us on WhatsApp with your pincode to confirm your street.'),
 ('What time does delivery happen?','Morning delivery reaches your doorstep by 5:30 AM so your milk is ready for the first coffee of the day.'),
 ('Is Vaigai Milk pasteurised and tested?','Yes. Every batch is checked at the farm, at the chilling centre and again at our dairy before it is sealed and delivered.'),
 ('Do you offer milk in glass bottles?','Yes. Our full cream milk is available in returnable glass bottles as well as sealed cartons and pouches.'),
 ('How do I place an order or start a daily plan?','Add products to your basket on this page and send the order on WhatsApp, or message us directly to start a daily or weekly delivery plan.'),
 ('Do you supply cafes, restaurants and bulk buyers?','Yes. We supply milk, curd, paneer, butter and ghee in bulk to cafes, hotels and caterers in Madurai. Contact us for pricing.')]
SLIDES=[
 dict(k='cut_milk',tab='Milk',eb='Fresh milk',h='Pure milk, <i>every dawn.</i>',p='Chilled the same morning and delivered to your door in glass by 5:30 AM.',cta='Shop milk',pi=5,c=('#2f86d6','#0f3d74','#04142b'),ac='#9fd6ff',parts='milk',alt='Vaigai Milk glass bottle inside a crown splash of fresh milk'),
 dict(k='cut_ghee',tab='Ghee',eb='Farm ghee',h='Golden ghee, <i>slow-made.</i>',p='Fragrant, grainy and rich. Made from fresh cream for pongal, sweets and Sunday meals.',cta='Shop ghee',pi=2,c=('#f2a81d','#a65a00','#2a1300'),ac='#ffd36b',parts='gold',alt='Vaigai Farm Ghee jar with a wooden spoon and a golden splash'),
 dict(k='cut_butter',tab='Butter',eb='Fresh butter',h='Creamy butter, <i>cold and fresh.</i>',p='Cold, soft and just salty enough for hot idlis and crisp dosas.',cta='Shop butter',pi=4,c=('#ecc861','#8f6a18','#2b1f06'),ac='#ffe38a',parts='butter',alt='Block of Vaigai butter with a knife on a slate board in a milk splash'),
 dict(k='cut_curd',tab='Curd',eb='Set curd',h='Thick curd, <i>clay-pot set.</i>',p='Set the traditional way in a clay pot. Thick, cool and gently tangy.',cta='Shop curd',pi=3,c=('#dd7a54','#7d303c','#2a0f1f'),ac='#ffc2a3',parts='curd',alt='Vaigai set curd in a clay pot with blueberries and almonds')]
exec(open(HERE/'ta.py',encoding='utf-8').read())
for p,(nt,dt) in zip(PR,PR_TA):p['nt']=nt;p['dt']=dt
TA=dict(TA_STATIC)
for sl in SLIDES:
    pass
for m,d in zip(MO,MO_TA):
    TA[m['d']]=d
for p in PR:TA['See '+p['n']]='பார்க்க: '+p['nt']
for (q,a),(tq,tn) in zip(FAQ,FAQ_TA):TA[q]=tq;TA[a]=tn
AREA_LINKS=[('Anna Nagar','milk-delivery-anna-nagar-madurai'),('KK Nagar','milk-delivery-kk-nagar-madurai'),('Teppakulam','milk-delivery-teppakulam-madurai'),('Goripalayam','milk-delivery-goripalayam-madurai'),('Thirunagar','milk-delivery-thirunagar-madurai'),('Tallakulam','milk-delivery-tallakulam-madurai')]
def esc(s):return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('"','&quot;')

MARK=r'''<defs><linearGradient id="gL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c3f58a"/><stop offset=".5" stop-color="#3cb54a"/><stop offset="1" stop-color="#1b8a3c"/></linearGradient><linearGradient id="gR" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34b85a"/><stop offset=".55" stop-color="#0e6b3a"/><stop offset="1" stop-color="#073a22"/></linearGradient>
<linearGradient id="gB" x1="0" x2="1"><stop offset="0" stop-color="#cfe3da"/><stop offset=".3" stop-color="#fff"/><stop offset=".75" stop-color="#f1f8f4"/><stop offset="1" stop-color="#a9c8ba"/></linearGradient><linearGradient id="gH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7bdc6e"/><stop offset="1" stop-color="#1b8a3c"/></linearGradient></defs>
<path d="M3 10C19 6 33 18 33 52C12 49 1 30 3 10Z" fill="url(#gL)"/><path d="M61 10C45 6 31 18 31 52C52 49 63 30 61 10Z" fill="url(#gR)"/>
<path d="M6 13C19 14 28 24 30 44" stroke="#fff" stroke-opacity=".5" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<rect x="28" y="8" width="8" height="5.5" rx="1.6" fill="#0e6b3a"/><rect x="28" y="8" width="8" height="1.6" rx=".8" fill="#fff" opacity=".35"/>
<path d="M28.6 13.5H35.4V19C35.4 21.2 41.5 22.2 41.5 29V50C41.5 52.5 39.8 54 37.5 54H26.5C24.2 54 22.5 52.5 22.5 50V29C22.5 22.2 28.6 21.2 28.6 19Z" fill="url(#gB)" stroke="#0a4d2b" stroke-opacity=".3" stroke-width=".6"/>
<rect x="22.5" y="33" width="19" height="11" fill="#1d8a45"/><path d="M32 35.2C32 35.2 29.5 38.2 29.5 39.8a2.5 2.5 0 0 0 5 0C34.5 38.2 32 35.2 32 35.2Z" fill="#fff"/>
<path d="M25.4 26V49" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>
<path d="M0 52C12 46 22 50 32 52C44 54 54 48 64 51V62H0Z" fill="url(#gH)"/><path d="M0 57C14 53 26 57 38 56C48 55 56 53 64 55V62H0Z" fill="#0e6b3a" opacity=".9"/>'''

LIGHT=dict(bg='#f7f5ee',bg2='#e8f2ec',bg3='#dcebe3',ink='#0a2a24',muted='#46605a',line='rgba(10,42,36,.16)',accent='#0e6b3a',card='#ffffff',navbg='rgba(247,245,238,.88)',navline='rgba(10,42,36,.12)',foot='#0a2a24',ra='#ffffff',rb='#e0efe7',price='#7a4f00',shadow='rgba(6,48,58,.38)',hmask='none',hrad='24px',faqbg='#ffffff')
DARK=dict(bg='#06303a',bg2='#072a31',bg3='#04202a',ink='#eaf5f0',muted='#a9c7be',line='rgba(255,255,255,.2)',accent='#46d27a',card='#0c3d48',navbg='rgba(5,36,44,.74)',navline='rgba(255,255,255,.14)',foot='#031a20',ra='#0a4f4a',rb='#06303a',price='#e3b341',shadow='rgba(0,0,0,.7)',hmask='linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)',hrad='0px',faqbg='#0a3640')
def tok(d):return ''.join(f'--{k}:{v};' for k,v in d.items())
TOKENS=f":root{{{tok(LIGHT)}color-scheme:light}}\n@media(prefers-color-scheme:dark){{:root:not([data-theme=\"light\"]){{{tok(DARK)}color-scheme:dark}}}}\n:root[data-theme=\"dark\"]{{{tok(DARK)}color-scheme:dark}}\n:root[data-theme=\"light\"]{{{tok(LIGHT)}color-scheme:light}}"

NOGS=lambda p:f'''{p} #pre{{display:none!important}}{p} .pin{{position:relative!important;height:auto!important;padding:96px 0 60px!important}}{p} #story,{p} #flav{{height:auto!important}}{p} .view{{aspect-ratio:auto!important;display:grid;gap:16px;overflow:visible!important;border:0!important;background:none!important;box-shadow:none!important}}{p} .sc{{position:relative!important;inset:auto!important;aspect-ratio:1408/768;border-radius:20px;overflow:hidden}}{p} .caps{{gap:22px}}{p} .cap{{grid-area:auto!important}}{p} .prog{{display:none}}'''

CSS=TOKENS+r'''
:root{--gold:#e3b341;--nav:84px;--mx:0;--my:0;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
html{scroll-padding-top:92px;background:var(--bg)}html.lenis,html.lenis body{height:auto}.lenis.lenis-smooth{scroll-behavior:auto!important}
*{box-sizing:border-box;margin:0}
body{font:400 17px/1.6 'Hanken Grotesk','Hind Madurai',system-ui,sans-serif;color:var(--ink);background:var(--bg);overflow-x:clip}
h1,h2,h3{font-family:'Instrument Serif','Hind Madurai',Georgia,serif;font-weight:400;letter-spacing:-.02em;line-height:1}
i{font-style:italic;color:var(--accent)}a{color:inherit}button{font:inherit;color:inherit;cursor:pointer}img{display:block;max-width:100%}
:focus-visible{outline:3px solid var(--gold);outline-offset:3px}
section{position:relative}.t{position:relative;z-index:3}
.sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.w{display:inline-block;overflow:hidden;vertical-align:top;padding:0 .06em .14em 0;margin-bottom:-.14em}.w>span{display:inline-block}
[data-scrub] .w{overflow:visible;margin:0;padding:0}
.eyebrow{display:block;font-weight:600;font-size:.78rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:14px}
.btn{display:inline-flex;align-items:center;gap:10px;white-space:nowrap;border:0;border-radius:99px;padding:.9em 1.6em;font-weight:600;background:#fff;color:#0a2a24;text-decoration:none;will-change:transform;min-height:44px}.btn.gold{background:var(--gold)}.btn.wa{background:#0b7a3e;color:#fff}
.skip{position:fixed;left:12px;top:-70px;z-index:200;background:var(--gold);color:#0a2a24;padding:.6em 1.1em;border-radius:99px;font-weight:600;text-decoration:none}.skip:focus{top:12px}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);min-height:44px}.logo svg{width:46px;height:44px;flex:none;filter:drop-shadow(0 4px 6px rgba(0,0,0,.3))}
.logo span{display:flex;flex-direction:column;line-height:1}.logo b{font:800 1.6rem Nunito,sans-serif;letter-spacing:-.01em}.logo em{font:700 .68rem Nunito,sans-serif;letter-spacing:.42em;font-style:normal;color:var(--accent);margin-top:3px}
.nav{position:fixed;z-index:60;top:calc(10px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);width:min(1120px,92vw);display:flex;justify-content:space-between;align-items:center;padding:6px 8px 6px 16px;background:var(--navbg);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-radius:99px;border:1px solid var(--navline);color:var(--ink)}
.nav .lk{display:flex;gap:22px;align-items:center}.nav .lk a{text-decoration:none;font-weight:600;font-size:.92rem;padding:10px 6px;min-height:44px;min-width:44px;justify-content:center;display:inline-flex;align-items:center}.nav .lk a:hover{color:var(--accent)}
#cartbtn{background:var(--gold);border:0;border-radius:99px;padding:.55em 1.2em;color:#0a2a24;font-weight:600;white-space:nowrap;min-height:44px}
#themebtn{flex:none;width:44px;height:44px;border-radius:50%;border:1px solid var(--line);background:transparent;display:grid;place-items:center;color:var(--ink)}#themebtn svg{width:20px;height:20px}
:root[data-theme="dark"] .ic-moon{display:none}:root:not([data-theme="dark"]) .ic-sun{display:none}
#langbtn{flex:none;min-width:44px;height:44px;border-radius:99px;border:1px solid var(--line);background:transparent;color:var(--ink);font:700 .9rem 'Hind Madurai','Nunito',sans-serif;padding:0 12px}
#cartbtn{display:inline-flex;align-items:center;gap:6px}#cartbtn svg{width:18px;height:18px}
html[lang=ta] h1,html[lang=ta] h2,html[lang=ta] h3{line-height:1.22;letter-spacing:0}html[lang=ta] .w{padding-top:.12em;max-width:100%}html[lang=ta] .hs-copy .hh{font-size:clamp(1.6rem,4vw,3.2rem);overflow-wrap:break-word}html[lang=ta] .cap h3{font-size:clamp(1.8rem,3.2vw,3.6rem)}html[lang=ta] .stm{line-height:1.3;font-size:clamp(1.5rem,3.8vw,4rem);overflow-wrap:break-word}html[lang=ta] .eyebrow{letter-spacing:.08em;text-transform:none}
.mm>*, .qgrid>*, .stats>*{min-width:0}
#quality .t{max-width:100%}
.stats span{overflow-wrap:anywhere;word-break:break-word}
@media(max-width:360px){.btn{white-space:normal;max-width:100%}html[lang=ta] #range h2,html[lang=ta] #beyond h2,html[lang=ta] #moments h2,html[lang=ta] #faq h2,html[lang=ta] #quality h2{font-size:1.65rem}html[lang=ta] #cta h2{font-size:1.9rem}html[lang=ta] .hs-copy .hh{font-size:1.55rem}html[lang=ta] .stm{font-size:1.45rem}html[lang=ta] #ml button{font-size:1.35rem}}
@media(max-width:1000px){.nav .lk a{display:none}}
@media(max-width:340px){.logo b{font-size:.98rem}.logo{gap:6px}.nav .lk{gap:4px}#cartbtn{padding:.4em .6em}.nav{padding-left:8px;width:97vw}}
@media(max-width:430px){.cw{display:none}.nav .lk{gap:6px}.logo b{font-size:1.1rem}.logo svg{width:32px;height:30px}.logo em{display:none}#cartbtn{padding:.45em .75em}#langbtn{padding:0 8px}}

.consent{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);width:min(700px,92vw);z-index:90;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:18px;padding:14px 18px;box-shadow:0 20px 50px -20px rgba(0,0,0,.5);display:flex;gap:12px;align-items:center;flex-wrap:wrap}.consent p{flex:1 1 260px;font-size:.9rem;line-height:1.4}.consent button{min-height:44px;border-radius:99px;border:1px solid var(--line);background:transparent;padding:0 18px;font-weight:600}.consent .y{background:var(--gold);border-color:var(--gold);color:#0a2a24}
.asst-launch{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:calc(max(16px,env(safe-area-inset-bottom)) + 68px);z-index:56;display:flex;align-items:center;gap:8px;height:52px;padding:0 18px 0 14px;border-radius:99px;border:0;background:var(--gold);color:#0a2a24;font:700 .95rem 'Hanken Grotesk','Hind Madurai',sans-serif;box-shadow:0 12px 28px -8px rgba(0,0,0,.5);cursor:pointer}.asst-launch svg{width:24px;height:24px}.asst-launch.nudge{animation:nudge 1.2s ease-in-out 3}@keyframes nudge{50%{transform:translateY(-8px)}}
.asst{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:calc(max(16px,env(safe-area-inset-bottom)) + 68px);z-index:95;width:min(392px,calc(100vw - 24px));height:min(640px,calc(100svh - 110px));display:flex;flex-direction:column;background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:22px;box-shadow:0 30px 80px -20px rgba(0,0,0,.6);overflow:hidden;font-family:'Hanken Grotesk','Hind Madurai',sans-serif}.asst[hidden]{display:none}
.asst-h{display:flex;align-items:center;gap:10px;padding:10px 12px 10px 14px;background:linear-gradient(135deg,#0b5d4b,#06303a);color:#fff}.asst-av{width:38px;height:38px;border-radius:50%;background:#fff;display:grid;place-items:center;flex:none}.asst-av svg{width:26px;height:25px}.asst-h b{display:block;font-size:1rem;line-height:1.2}.asst-h small{opacity:.85;font-size:.75rem}
.asst-x{margin-left:auto;width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:1.5rem;line-height:1}
.asst-log{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}
.m{max-width:88%;padding:10px 13px;border-radius:16px;font-size:.95rem;line-height:1.45;white-space:pre-line;overflow-wrap:anywhere}.m.b{align-self:flex-start;background:var(--card);border:1px solid var(--line);border-bottom-left-radius:4px}.m.u{align-self:flex-end;background:#0b7a3e;color:#fff;border-bottom-right-radius:4px}
.typing i{display:inline-block;width:7px;height:7px;margin:0 2px;border-radius:50%;background:var(--muted);animation:tp 1s infinite}.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}@keyframes tp{50%{transform:translateY(-4px);opacity:.5}}
.pc{align-self:stretch;display:flex;gap:10px;overflow-x:auto;padding:2px 2px 8px;scroll-snap-type:x mandatory}.pc>div{flex:0 0 218px;scroll-snap-align:start;background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}.pc img{width:100%;aspect-ratio:16/9;object-fit:cover;background:#06303a;display:block}.pc .pb{padding:10px}.pc h4{margin:0;font:700 .95rem 'Hanken Grotesk','Hind Madurai',sans-serif}.pc p{margin:2px 0 6px;font-size:.8rem;color:var(--muted);line-height:1.35}.pc .pr{font-weight:800;color:var(--price);margin-bottom:8px}.pc button{min-height:44px;border-radius:99px;border:0;background:var(--gold);color:#0a2a24;font-weight:700;padding:0 16px;width:100%}
.asst-chips{display:flex;gap:8px;flex-wrap:wrap;padding:4px 14px 8px}.asst-chips:empty{display:none}.asst-chips button,.asst-chips a{min-height:44px;display:inline-flex;align-items:center;border-radius:99px;border:1px solid var(--line);background:var(--card);color:var(--ink);padding:0 14px;font-size:.88rem;text-decoration:none}.asst-chips a{background:#0b7a3e;color:#fff;border-color:#0b7a3e;font-weight:700}
.asst-in{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--line);align-items:center}.asst-in input{flex:1;min-width:0;min-height:44px;border-radius:99px;border:1px solid var(--line);background:var(--card);color:var(--ink);padding:0 16px;font-size:1rem}.asst-in button{width:44px;height:44px;border-radius:50%;border:0;background:#0b7a3e;color:#fff;display:grid;place-items:center;flex:none}.asst-in button svg{width:20px;height:20px}.asst-in .mic{background:transparent;color:var(--ink);border:1px solid var(--line)}.asst-in .mic[hidden]{display:none}.asst-in .mic.on{background:#c0392b;color:#fff;border-color:#c0392b}
.asst-note{margin:0;padding:0 14px 10px;font-size:.72rem;color:var(--muted)}
@media(max-width:600px){.asst{inset:0;width:100%;height:100dvh;border-radius:0}.asst-launch{width:52px;padding:0;justify-content:center}.asst-launch span{display:none}}
@media(prefers-reduced-motion:reduce){.asst-launch.nudge,.typing i{animation:none}}
#bar{position:fixed;left:0;top:0;height:3px;width:100%;background:linear-gradient(90deg,#46d27a,#e3b341);transform-origin:0 50%;transform:scaleX(0);z-index:70}
#cur{position:fixed;left:-12px;top:-12px;width:24px;height:24px;border-radius:50%;border:1.5px solid var(--accent);z-index:80;pointer-events:none;transition:width .25s,height .25s,margin .25s,background .25s}#cur.big{width:60px;height:60px;margin:-18px 0 0 -18px;background:rgba(70,210,122,.16)}@media(pointer:coarse){#cur{display:none}}
.fab{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:55;width:56px;height:56px;border-radius:50%;background:#0b7a3e;color:#fff;display:grid;place-items:center;box-shadow:0 12px 28px -8px rgba(0,0,0,.5);text-decoration:none}.fab svg{width:28px;height:28px}
.seen #pre{display:none!important}
#pre{position:fixed;inset:0;z-index:100;background:radial-gradient(circle at 50% 40%,#0b5d4b,#04222a);color:#fff;display:grid;place-content:center;justify-items:center;gap:20px;perspective:700px}
#pre svg{width:150px;height:145px;animation:swing 2.4s ease-in-out infinite;filter:drop-shadow(0 18px 24px rgba(0,0,0,.45))}@keyframes swing{0%,100%{transform:rotateY(-32deg) rotateX(6deg)}50%{transform:rotateY(32deg) rotateX(-4deg)}}
#pre b{font:800 2.4rem Nunito,sans-serif}#pre .n{font:400 1.2rem 'Instrument Serif';letter-spacing:.3em;opacity:.8}
#hero{position:relative;min-height:100svh;overflow:hidden;color:#fff;background:#04142b;--pp:0;isolation:isolate}
.hbgs{position:absolute;inset:0;z-index:0}.hbgc{position:absolute;inset:0;opacity:0;transition:opacity 1.4s ease;background:radial-gradient(ellipse 75% 85% at 68% 46%,var(--c1) 0%,var(--c2) 46%,var(--c3) 100%)}.hbgc.on{opacity:1}
.hglow{position:absolute;inset:-20%;z-index:1;pointer-events:none;background:radial-gradient(circle at 70% 40%,rgba(255,255,255,.24),transparent 38%),radial-gradient(circle at 15% 85%,rgba(255,255,255,.08),transparent 45%);transform:translate3d(calc(var(--mx)*-30px),calc(var(--my)*-20px - var(--pp)*10vh),0)}
.hshade{position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.5),rgba(0,0,0,0) 62%),linear-gradient(0deg,rgba(0,0,0,.38),transparent 32%)}
.hslides{position:absolute;inset:0;z-index:3;perspective:1400px;touch-action:pan-y}
#hero{--dx:42%;--dr:-55deg}#hero[data-dir="prev"]{--dx:-42%;--dr:55deg}
.hs{position:absolute;inset:0;pointer-events:none}.hs.on{pointer-events:auto}.hs:not(.on):not(.out){visibility:hidden}
.hs-prod{position:absolute;right:4%;top:calc(var(--nav) + 2svh);bottom:13svh;width:min(56vw,980px);transform-style:preserve-3d;transform:translate3d(calc(var(--mx)*-18px),calc(var(--my)*-12px - var(--pp)*16vh),0) rotateY(calc(var(--mx)*7deg)) rotateX(calc(var(--my)*-5deg)) scale(calc(1 + var(--pp)*.4))}
.hs-prod img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 40px 46px rgba(0,0,0,.45));transform:translate3d(var(--dx),0,-320px) rotateY(var(--dr)) scale(.7);opacity:0;transition:transform 1.3s cubic-bezier(.2,.8,.2,1),opacity .9s}
#hero.ready .hs.on .hs-prod img{transform:none;opacity:1}
#hero .hs.out .hs-prod img{transform:translate3d(calc(var(--dx)*-1),0,-320px) rotateY(calc(var(--dr)*-1)) scale(.7);opacity:0}
.hs-parts{opacity:0;transition:opacity 1s}.hs.on .hs-parts{opacity:1}.hs:not(.on) .pt i{animation-play-state:paused}
.hs-copy{position:absolute;left:6vw;bottom:15svh;width:min(560px,42vw);z-index:4;transform:translateY(calc(var(--pp)*-60px));opacity:calc(1 - var(--pp)*1.5)}
.hs-copy>*{opacity:0;transform:translateY(34px);transition:opacity .8s,transform 1s cubic-bezier(.2,.8,.2,1)}
#hero.ready .hs.on .hs-copy>*{opacity:1;transform:none}#hero.ready .hs.on .hs-copy>:nth-child(2){transition-delay:.12s}#hero.ready .hs.on .hs-copy>:nth-child(3){transition-delay:.24s}#hero.ready .hs.on .hs-copy>:nth-child(4){transition-delay:.36s}
.hs-copy .eyebrow{color:#fff}.hs-copy .hh{font-size:clamp(2.3rem,5vw,5.6rem);margin-bottom:16px}.hs-copy i{color:var(--ac)}.hs-copy p{max-width:30em;margin-bottom:22px;color:rgba(255,255,255,.92)}
.hctrl{position:absolute;z-index:6;left:6vw;right:calc(6vw + 72px);bottom:calc(4svh + env(safe-area-inset-bottom,0px));display:flex;align-items:center;justify-content:space-between;gap:14px}
.htabs{display:flex;gap:8px}.htabs button{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.4);background:rgba(0,0,0,.28);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:99px;padding:.5em 1.15em;min-height:44px;font-weight:600;color:#fff}
.htabs button[aria-selected="true"]{background:rgba(255,255,255,.2);border-color:#fff}
.htabs button[aria-selected="true"]::after{content:"";position:absolute;left:0;bottom:0;height:3px;width:100%;background:var(--ac);transform-origin:0 50%;animation:hfill 6.5s linear forwards}
#hero.paused .htabs button::after{animation-play-state:paused}@keyframes hfill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.hnav{display:flex;gap:10px}.hnav button{width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,.55);background:rgba(0,0,0,.28);color:#fff;font-size:1.1rem}
.parts{position:absolute;inset:0;pointer-events:none;z-index:2;perspective:900px}
.pt{position:absolute;display:block;transform:translate3d(calc(var(--mx)*var(--d)*-30px),calc(var(--my)*var(--d)*-20px + var(--pp)*var(--v)*-70vh),calc(var(--d)*50px - 100px)) rotate(calc(var(--pp)*var(--r)*160deg));will-change:transform}
.pt i{display:block;width:calc(var(--s)*16px);height:calc(var(--s)*16px);animation:float 6s ease-in-out infinite alternate}
@keyframes float{from{transform:translate3d(0,0,0) rotate(0)}to{transform:translate3d(10px,-22px,0) rotate(18deg)}}
.t-drop i{border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff 0,rgba(255,255,255,.9) 22%,rgba(200,225,240,.45) 58%,rgba(255,255,255,.1) 100%);box-shadow:inset -2px -3px 5px rgba(0,60,90,.28),0 0 8px rgba(255,255,255,.35)}
.t-mist i{border-radius:50%;width:calc(var(--s)*46px);height:calc(var(--s)*46px);background:radial-gradient(circle,rgba(255,255,255,.35),transparent 68%);filter:blur(2px)}
.t-gdrop i{border-radius:50%;background:radial-gradient(circle at 32% 28%,#fff6c4 0,#f6c64a 35%,#b8791a 100%);box-shadow:inset -2px -3px 5px rgba(90,40,0,.4),0 0 10px rgba(255,200,80,.5)}
.t-berry i{border-radius:50%;width:calc(var(--s)*20px);height:calc(var(--s)*20px);background:radial-gradient(circle at 32% 28%,#8d9bf0 0,#38468f 40%,#141a45 100%);box-shadow:0 4px 8px rgba(0,0,0,.35)}
.t-almond i{width:calc(var(--s)*13px);height:calc(var(--s)*22px);border-radius:50% 50% 45% 45%/60% 60% 40% 40%;background:linear-gradient(135deg,#f6dcb0,#c28a4a);box-shadow:inset -1px -2px 3px rgba(90,50,10,.4)}
.t-leaf i{width:calc(var(--s)*20px);height:calc(var(--s)*20px);border-radius:0 100% 0 100%;background:linear-gradient(135deg,#8be28f,#1f8a4a);box-shadow:0 4px 8px rgba(0,0,0,.25)}
.t-crumb i{border-radius:30%;background:linear-gradient(135deg,#fffbe6,#e6cf86)}
.t-salt i{width:calc(var(--s)*6px);height:calc(var(--s)*6px);background:#fff;border-radius:20%;box-shadow:0 0 6px #fff}
.t-mote i{border-radius:50%;width:calc(var(--s)*22px);height:calc(var(--s)*22px);background:radial-gradient(circle,rgba(255,226,160,.95),rgba(255,200,100,0) 70%)}
.plane{position:relative}.plane .parts{inset:-4% -2%}
.wave{position:absolute;left:0;bottom:-1px;width:100%;height:clamp(50px,9vw,120px);z-index:4;pointer-events:none;display:block}
#intro{min-height:90svh;display:grid;align-items:center;padding:clamp(90px,12vw,150px) 6vw;background:var(--bg)}
.stm{font:400 clamp(1.9rem,4.6vw,4.4rem)/1.1 'Instrument Serif',serif;max-width:1000px;letter-spacing:-.02em}
.facts{display:flex;gap:clamp(22px,4vw,48px);flex-wrap:wrap;margin-top:40px;list-style:none;padding:0}.facts b{display:block;font:400 clamp(2.2rem,4vw,3.2rem) 'Instrument Serif'}.facts span{font-size:.9rem;color:var(--muted)}
.pin{position:sticky;top:0;height:100svh;overflow:hidden;background:var(--bg2);display:grid;place-content:center;justify-items:center;padding:var(--nav) 0 56px}
.stage{display:grid;grid-template-columns:1fr;gap:20px;width:92vw;align-items:center}
.view{position:relative;width:100%;aspect-ratio:1408/768;border-radius:22px;overflow:hidden;perspective:1400px;background:#06303a;box-shadow:0 40px 80px -30px var(--shadow);border:1px solid var(--line)}
.sc{position:absolute;inset:0;transform-style:preserve-3d;will-change:transform}.sc img{width:100%;height:100%;object-fit:contain}
.caps{display:grid;align-content:center}.cap{grid-area:1/1}
.cap h3{font-size:clamp(2rem,3.8vw,4.4rem);margin-bottom:12px}.cap p{color:var(--muted);max-width:30em;font-size:clamp(.92rem,1.15vw,1.05rem)}
.fcap .ta{font:600 1.2rem 'Hind Madurai';color:var(--accent);display:block;margin-bottom:6px}
.prog{position:absolute;left:6vw;right:calc(6vw + 72px);bottom:calc(3svh + env(safe-area-inset-bottom,0px));z-index:4;height:3px;background:var(--line);border-radius:9px;overflow:hidden}.prog i{display:block;height:100%;background:linear-gradient(90deg,#46d27a,#e3b341);transform-origin:0 50%;transform:scaleX(0)}
#story{height:430svh}#flav{height:460svh}
@media(min-width:700px) and (min-aspect-ratio:11/10){.stage{grid-template-columns:minmax(250px,.36fr) minmax(0,1fr);gap:3.5vw;width:min(94vw,1500px)}.caps{order:-1}.view{width:min(100%,calc((100svh - var(--nav) - 90px)*1.8333));justify-self:end}}
@media(max-height:700px) and (max-width:900px){.hs-copy p{display:none}.hs-prod{height:36svh}}
@media(max-height:480px){.cap p{display:none}.cap h3{font-size:1.9rem}}
#beyond{padding:clamp(90px,12vw,150px) 6vw;background:linear-gradient(180deg,var(--bg2),var(--bg3));overflow:hidden}
#beyond h2{font-size:clamp(2.2rem,5.4vw,5.4rem);max-width:12em;margin-bottom:clamp(30px,5vw,56px)}
.plane{perspective:1500px;max-width:1300px}
.stagebox{position:relative;border-radius:28px;background:radial-gradient(circle at 50% 38%,var(--g1),var(--g2) 78%);padding:clamp(14px,3vw,44px);box-shadow:0 50px 90px -30px var(--shadow);overflow:hidden;transform-origin:50% 100%}.stagebox .fs{width:min(100%,900px);margin:0 auto}
.fs{position:relative;width:100%;aspect-ratio:var(--ar);perspective:1200px}
.fs-c{position:absolute;left:-14%;top:-14%;width:128%;height:128%;pointer-events:none}
.fs-tilt{position:absolute;transform-style:preserve-3d;transform:rotateY(calc(var(--fx,0)*12deg + var(--fs,0)*-16deg)) rotateX(calc(var(--fy,0)*-8deg + var(--fs,0)*9deg)) translate3d(calc(var(--fx,0)*-10px),calc(var(--fs,0)*-34px),40px);will-change:transform}
.fs-main{width:100%;height:auto;filter:drop-shadow(0 34px 40px rgba(0,0,0,.4));animation:fsbob 6.5s ease-in-out infinite alternate}@keyframes fsbob{to{transform:translateY(-14px) rotate(.7deg)}}
.sc.scf{display:grid;place-items:center;background:radial-gradient(circle at 50% 42%,var(--g1),var(--g2) 80%)}.scf .fs{height:90%;width:auto;max-width:90%}
#range{padding:clamp(90px,12vw,150px) 0;background:radial-gradient(circle at 50% 28%,var(--ra),var(--rb) 72%);overflow:hidden}
#range .head{padding:0 6vw;margin-bottom:clamp(30px,5vw,50px)}#range h2{font-size:clamp(2.4rem,5.4vw,5.2rem)}
.dc{position:relative;perspective:1400px;outline:none;touch-action:pan-y;user-select:none;--w:min(560px,76vw)}
.track{position:relative;height:calc(var(--w)*.5625);transform-style:preserve-3d}
.dcard{position:absolute;left:50%;top:0;width:var(--w);aspect-ratio:16/9;margin-left:calc(var(--w) / -2);border-radius:22px;overflow:hidden;cursor:pointer;box-shadow:0 40px 60px -26px var(--shadow);border:1px solid var(--line);background:#06303a}
.dcard img{width:100%;height:100%;object-fit:contain;pointer-events:none}
.info{text-align:center;display:grid;justify-items:center;gap:8px;margin-top:clamp(28px,4vw,44px);padding:0 6vw}
.info h3{font-size:clamp(2rem,4vw,3.6rem)}.meta{display:flex;gap:14px;align-items:baseline;flex-wrap:wrap;justify-content:center}.meta .pr{font:400 2rem 'Instrument Serif';color:var(--price)}.info p{max-width:30em;color:var(--muted)}
.cn{display:flex;gap:12px;margin-top:10px;align-items:center}.cn .ar{width:48px;height:48px;border-radius:50%;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:1.1rem}
#moments{padding:clamp(90px,12vw,150px) 6vw;background:var(--bg)}#moments h2{font-size:clamp(2.2rem,5.2vw,5rem);max-width:12em}
.mm{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:clamp(24px,5vw,70px);margin-top:clamp(30px,4vw,50px);align-items:start;max-width:1300px}
#ml{list-style:none;padding:0}#ml button{display:block;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--line);padding:.3em 0;font:400 clamp(1.7rem,3.2vw,3.2rem)/1.15 'Instrument Serif';color:var(--muted);opacity:.75;transition:color .3s,padding .3s,opacity .3s}#ml button.on,#ml button:hover{color:var(--ink);opacity:1;padding-left:12px}
#mp{position:relative;border-radius:24px;overflow:hidden;aspect-ratio:16/9;perspective:1200px;box-shadow:0 40px 70px -30px var(--shadow);background:#06303a}
#mp img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0;transform:scale(1.04);transition:opacity .8s,transform 1.2s cubic-bezier(.2,.8,.2,1)}#mp img.on{opacity:1;transform:scale(1)}
#mcap{display:grid;padding:20px 4px 0}.mcx{grid-area:1/1;opacity:0;visibility:hidden;transition:opacity .5s}.mcx.on{opacity:1;visibility:visible}.mcx h3{font-size:clamp(1.8rem,2.8vw,2.6rem)}.mcx p{margin:6px 0 14px;max-width:30em;color:var(--muted)}
#quality{--ink:#fff;--accent:#6fe39a;--muted:#b9d4cc;--line:rgba(255,255,255,.3);background:#000;color:#fff;padding:clamp(90px,12vw,150px) 6vw;overflow:hidden}
.qgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:4vw;align-items:center;max-width:1300px;margin:0 auto}
.qimg{mix-blend-mode:screen;perspective:1200px}.qimg img{width:100%;height:auto;will-change:transform}
#quality h2{font-size:clamp(2.2rem,5vw,4.8rem)}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:34px;list-style:none;padding:0}.stats li{border-top:1px solid var(--line);padding-top:10px}.stats b{display:block;font:400 clamp(2.2rem,4vw,3.8rem) 'Instrument Serif';color:var(--accent)}.stats span{font-size:.88rem;color:var(--muted);line-height:1.3;display:block}
#faq{padding:clamp(90px,12vw,150px) 6vw;background:var(--bg)}#faq h2{font-size:clamp(2.2rem,5vw,4.6rem);margin-bottom:34px}
.faqs{max-width:900px}.faqs details{border-bottom:1px solid var(--line);padding:4px 0}.faqs summary{cursor:pointer;list-style:none;padding:18px 40px 18px 0;font:400 clamp(1.25rem,2vw,1.7rem) 'Instrument Serif';position:relative;min-height:44px}.faqs summary::-webkit-details-marker{display:none}
.faqs summary::after{content:"+";position:absolute;right:6px;top:14px;font:400 1.8rem 'Hanken Grotesk';color:var(--accent);transition:transform .3s}.faqs details[open] summary::after{transform:rotate(45deg)}.faqs p{color:var(--muted);padding:0 0 20px;max-width:46em}
#cta{background:var(--bg2);padding:clamp(90px,12vw,150px) 6vw clamp(70px,9vw,110px);text-align:center;overflow:hidden}
#cta h2{font-size:clamp(2.6rem,7vw,6.6rem)}
.cframe{position:relative;width:min(100%,1180px);margin:clamp(28px,4vw,48px) auto;border-radius:26px;overflow:hidden;perspective:1400px;box-shadow:0 50px 90px -30px var(--shadow);background:radial-gradient(circle at 50% 40%,#1f78b4,#082a4a 78%);padding:clamp(14px,3vw,40px)}.cframe .fs{width:min(100%,780px);margin:0 auto}
#basket{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:18px 22px;max-width:560px;margin:0 auto;text-align:left}
#basket ul{padding:0;margin:8px 0 12px}#basket li{display:flex;justify-content:space-between;gap:12px;padding:.3em 0;border-bottom:1px dashed var(--line);list-style:none}
.bt{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.bt b{font:400 1.6rem 'Instrument Serif'}
footer{background:var(--foot);color:#b9d4cc;padding:clamp(50px,7vw,80px) 6vw 40px}
.fgrid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:34px;max-width:1200px;margin:0 auto}
footer .logo{--ink:#fff;--accent:#8ff0b0}footer h2{font:800 .8rem Nunito,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#8ff0b0;margin-bottom:12px}footer address{font-style:normal;line-height:1.8}footer a{color:#fff;text-underline-offset:3px}
.areas{max-width:1200px;margin:28px auto 0}.areas ul{list-style:none;padding:0;display:flex;gap:6px 18px;flex-wrap:wrap}.areas a{display:inline-flex;min-height:44px;align-items:center}.areas p{margin-top:4px}
.legal{max-width:1200px;margin:34px auto 0;padding-top:20px;border-top:1px solid rgba(255,255,255,.14);font-size:.82rem;opacity:.8}
@media(max-width:900px),(max-height:560px){
 .hs-prod{left:0;right:0;width:auto;top:calc(var(--nav) + 4px);bottom:auto;height:40svh}.hs-copy{left:6vw;right:6vw;width:auto;bottom:calc(4svh + 96px)}.hshade{background:linear-gradient(0deg,rgba(0,0,0,.6),rgba(0,0,0,0) 60%)}.hs-copy .hh{font-size:clamp(2.2rem,8vw,3.8rem)}
 .mm{grid-template-columns:1fr}.qgrid{grid-template-columns:1fr}.qimg{order:-1}.fgrid{grid-template-columns:1fr 1fr}.fgrid>div:first-child{grid-column:1/-1}
}
@media(max-width:600px){
 body{font-size:16px}
 .hnav{display:none}.hctrl{right:calc(6vw + 64px)}.htabs button{font-size:0;width:44px;padding:0;border:0;background:none;backdrop-filter:none}.htabs button::before{content:"";position:absolute;left:6px;right:6px;top:50%;height:6px;margin-top:-3px;border-radius:9px;background:rgba(255,255,255,.4)}.htabs button[aria-selected="true"]{background:none}.htabs button[aria-selected="true"]::after{left:6px;right:6px;width:auto;bottom:auto;top:50%;margin-top:-3px;height:6px;border-radius:9px}
 .hs-copy{bottom:calc(4svh + 64px)}
 .nav{padding:5px 6px 5px 10px;gap:6px}.nav .lk a{display:none}#cartbtn{padding:.45em .9em;font-size:.85rem}.logo svg{width:36px;height:34px}.logo b{font-size:1.25rem}.logo em{font-size:.54rem;letter-spacing:.34em}
 :root{--nav:76px}
 .eyebrow{font-size:.7rem;margin-bottom:10px}.stats{gap:12px}.stats b{font-size:2.2rem}.stats span{font-size:.78rem}
 .dc{--w:80vw}.cn .btn{padding:.8em 1.2em;font-size:.9rem}.stage{gap:16px}.cap h3{font-size:2.1rem}.cap p{font-size:.95rem;line-height:1.5}.fgrid{grid-template-columns:1fr}
}
@media(prefers-reduced-motion:reduce){*{animation:none!important}.hs-prod,.pt{transform:none!important}}
'''+NOGS('.nogs')

def img(k,alt,eager=False,prod=True,extra=''):
    w,h=DIM[k]
    s=f'<img data-img="{k}" '+(f'src="images/{FN.get(k,k)}.webp" ' if prod else '')+f'width="{w}" height="{h}" alt="{esc(alt)}" decoding="async" '+('fetchpriority="high" ' if eager else ('loading="lazy" ' if prod else ''))+extra+'>'
    return s

def body(prod):
    I=lambda k,alt,**kw:img(k,alt,prod=prod,**kw)
    def FS(k,alt):
        m=CUT[k];sw,sh=m['sw'],m['sh'];x,y,w,h=m['main']
        src=(f'src="images/cut/{FNC[k]}.webp" loading="lazy" ' if prod else '')
        return f'<div class="fs" data-fs="{k}" style="--ar:{sw}/{sh}"><canvas class="fs-c fs-b" aria-hidden="true"></canvas><div class="fs-tilt" style="left:{x/sw*100:.3f}%;top:{y/sh*100:.3f}%;width:{w/sw*100:.3f}%"><img class="fs-main" data-img="fs_{k}_main" {src}width="{w}" height="{h}" alt="{esc(alt)}" decoding="async"></div><canvas class="fs-c fs-f" aria-hidden="true"></canvas></div>'
    cards=''.join(f'<article class="dcard" data-i="{i}">{I(p["k"],p["alt"])}<h3 class="sr">{esc(p["n"])}</h3></article>' for i,p in enumerate(PR))
    plist=''.join(f'<li><h3>{esc(p["n"])} ({p["u"]})</h3><p>{esc(p["d"])} Price ₹{p["p"]}.</p></li>' for p in PR)
    ml=''.join(f'<li><button type="button" data-i="{i}" aria-pressed="false">{m["t"]}</button></li>' for i,m in enumerate(MO))
    mp=''.join(I(m['k'],m['alt']) for m in MO)
    mc=''.join(f'<div class="mcx"><h3>{m["t"]}</h3><p>{esc(m["d"])}</p><a class="btn gold mag" href="#range" data-p="{m["p"]}">See {esc(PR[m["p"]]["n"])}</a></div>' for m in MO)
    faq=''.join(f'<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>' for q,a in FAQ)
    return f'''<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><symbol id="mk" viewBox="0 0 64 62">{MARK}</symbol></svg>
<a class="skip" href="#main">Skip to content</a><div id="bar" aria-hidden="true"></div><div id="cur" aria-hidden="true"></div>
<div id="pre" role="status" aria-label="Loading Vaigai Milk"><svg viewBox="0 0 64 62" aria-hidden="true"><use href="#mk"/></svg><b>Vaigai</b><div class="n" id="pn">0</div></div>
<header><nav class="nav" aria-label="Primary"><a class="logo" href="#hero" aria-label="Vaigai Milk, home"><svg viewBox="0 0 64 62" aria-hidden="true"><use href="#mk"/></svg><span><b>Vaigai</b><em>MILK</em></span></a>
<div class="lk"><a href="#story">Our story</a><a href="#range">Products</a><a href="#moments">Moments</a><a href="#faq">FAQ</a>
<button id="themebtn" type="button" aria-label="Switch to dark mode" aria-pressed="false"><svg class="ic-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg><svg class="ic-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button>
<button id="langbtn" type="button" aria-label="தமிழில் பார்க்க. View in Tamil" lang="ta">தமிழ்</button>
<button id="cartbtn" type="button" aria-label="Open basket"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg><span class="cw">Basket</span> (<span id="cc">0</span>)</button></div></nav></header>
<a class="fab" id="fab" href="https://wa.me/{SITE['wa']}?text=Hi%20Vaigai%20Milk%2C%20I%20would%20like%20to%20order" target="_blank" rel="noopener" aria-label="Chat with Vaigai Milk on WhatsApp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5.2A8.5 8.5 0 1 1 21 11.5z"/><path d="M8.5 9.5c.5 2.5 2.5 4.5 5 5l1.5-1.5-2-1-1 .7c-.8-.4-1.5-1.1-1.9-1.9l.7-1-1-2z" fill="currentColor" stroke="none"/></svg></a>
<main id="main">
<section id="hero" aria-roledescription="carousel" aria-label="Featured Vaigai Milk products" data-next="var(--bg)"><h1 class="sr">Vaigai Milk: fresh milk, curd, ghee and butter from Madurai</h1>
 <div class="hbgs" aria-hidden="true">{''.join(f'<div class="hbgc{" on" if i==0 else ""}" style="--c1:{s["c"][0]};--c2:{s["c"][1]};--c3:{s["c"][2]}"></div>' for i,s in enumerate(SLIDES))}</div><div class="hglow" aria-hidden="true"></div><div class="hshade" aria-hidden="true"></div>
 <div class="hslides">{''.join(f'<article class="hs{" on" if i==0 else ""}" role="group" aria-roledescription="slide" aria-label="{i+1} of {len(SLIDES)}" data-ac="{s["ac"]}" style="--ac:{s["ac"]}"{"" if i==0 else " aria-hidden=\"true\""}><div class="hs-prod">{I(s["k"],s["alt"],eager=(i==0))}</div><div class="parts hs-parts" data-parts="{s["parts"]}" data-n="20" data-x="34" aria-hidden="true"></div><div class="hs-copy"><span class="eyebrow">{s["eb"]}</span><h2 class="hh">{s["h"]}</h2><p>{s["p"]}</p><a class="btn gold mag" href="#range" data-p="{s["pi"]}" data-track="hero_shop_{s["tab"].lower()}">{s["cta"]} <span aria-hidden="true">→</span></a></div></article>' for i,s in enumerate(SLIDES))}</div>
 <div class="hctrl"><div class="htabs" role="tablist" aria-label="Choose a product">{''.join(f'<button type="button" role="tab" aria-selected="{"true" if i==0 else "false"}" data-i="{i}">{s["tab"]}</button>' for i,s in enumerate(SLIDES))}</div><div class="hnav"><button type="button" id="hprev" aria-label="Previous slide">&#8592;</button><button type="button" id="hnext" aria-label="Next slide">&#8594;</button></div></div></section>
<section id="intro" aria-labelledby="h-intro" data-next="var(--bg2)"><div class="t"><h2 class="sr" id="h-intro">Fresh milk from Madurai farms</h2><p class="stm" data-scrub>We believe the best milk is the simplest. Fresh from Madurai's farms, handled gently and sealed the same morning. Nothing added. Nothing hidden.</p>
 <ul class="facts"><li><b>5:30</b><span>AM doorstep delivery</span></li><li><b>4°C</b><span>chilled within hours</span></li><li><b>100%</b><span>Madurai sourced</span></li></ul></div></section>
<section id="story" aria-labelledby="h-story"><h2 class="sr" id="h-story">Our story: from Madurai farm to your doorstep</h2><div class="pin"><div class="stage"><div class="view">
 <div class="parts" data-parts="farm" data-n="16" aria-hidden="true"></div><div class="sc">{I('farm','Aerial view of a green dairy farm at sunset with cattle grazing and rocky hills behind')}</div>
 <div class="sc">{I('dairy','Vaigai Milk dairy shed at sunrise with grazing cows and a Madurai temple tower in the mist')}</div>
 <div class="sc">{I('crate','Two Vaigai Milk glass bottles in a wooden crate on a doorstep beside a brass pot')}</div></div>
 <div class="caps">
 <div class="cap"><span class="eyebrow">01 · Milked</span><h3>At the farm, <i>first light.</i></h3><p>Small herds graze the green fields around Madurai. Milking starts before sunrise, gently and by a hand-checked routine.</p></div>
 <div class="cap"><span class="eyebrow">02 · Chilled &amp; sealed</span><h3>At our dairy, <i>within hours.</i></h3><p>Milk reaches our dairy in the shadow of the Meenakshi gopuram, then is tested, chilled and sealed before the day warms up.</p></div>
 <div class="cap"><span class="eyebrow">03 · Delivered</span><h3>At your door, <i>by 5:30.</i></h3><p>Glass bottles arrive on your doorstep, cold and ready, in time for the first coffee of the day.</p></div></div></div>
 <div class="prog" aria-hidden="true"><i id="pf"></i></div></div></section>
<section id="beyond" aria-labelledby="h-beyond"><div class="t"><span class="eyebrow">Beyond milk</span><h2 id="h-beyond" data-split>Paneer, ghee, curd. <i>One family.</i></h2></div>
 <div class="plane stagebox" style="--g1:#1f8a5e;--g2:#0a3a30">{FS('combo','Fresh paneer, farm ghee and set curd flying in a burst of milk with the Vaigai Milk logo')}<div class="parts" data-parts="mint" data-n="14" aria-hidden="true"></div></div></section>
<section id="flav" aria-labelledby="h-flav"><h2 class="sr" id="h-flav">Signature picks: badam milk and Vaigai Fresh</h2><div class="pin"><div class="stage"><div class="view">
 <div class="parts" data-parts="mix" data-n="16" aria-hidden="true"></div><div class="sc scf" style="--g1:#e0a12a;--g2:#5a2f00">{FS('badam','Vaigai Badam flavoured milk bottle in a swirl of milk and almonds')}</div>
 <div class="sc scf" style="--g1:#2fa874;--g2:#0a3a30">{FS('carton','Vaigai Fresh 500 ml milk carton with droplets of condensation')}</div></div>
 <div class="caps">
 <div class="cap fcap"><span class="ta" lang="ta">பாதாம்</span><h3>Badam <i>milk.</i></h3><p>Roasted almonds and a hint of saffron in cold, creamy milk. Breakfast, dessert and everything between.</p></div>
 <div class="cap fcap"><span class="ta" lang="ta">புத்துணர்ச்சி</span><h3>Vaigai <i>Fresh.</i></h3><p>Everyday pasteurised milk in a clean, sealed 500 ml pack. Cold, simple and ready for the whole family.</p></div></div></div>
 <div class="prog" aria-hidden="true"><i id="pf2"></i></div></div></section>
<section id="range" aria-labelledby="h-range" data-next="var(--bg)"><div class="t head"><span class="eyebrow">Products</span><h2 id="h-range" data-split>Pick your <i>morning.</i></h2></div>
 <div class="dc" id="dc" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Vaigai Milk products. Use left and right arrow keys to browse."><div class="track">{cards}</div></div>
 <div class="t info" aria-live="polite"><h3 id="pn1">{PR[0]["n"]}</h3><div class="meta"><span id="pt1">{PR[0]["ta"]} · {PR[0]["u"]}</span><span class="pr" id="pp1">₹{PR[0]["p"]}</span></div><p id="pd1">{esc(PR[0]["d"])}</p>
 <div class="cn"><button class="ar" id="cp" type="button" aria-label="Previous product">&#8592;</button><button class="btn gold mag" id="addb" type="button">Add to basket</button><button class="ar" id="cnx" type="button" aria-label="Next product">&#8594;</button></div></div>
 <ul class="sr">{plist}</ul></section>
<section id="moments" aria-labelledby="h-moments" data-next="#000"><div class="t"><span class="eyebrow">Made for every moment</span><h2 id="h-moments" data-split>One brand. <i>Every part of the day.</i></h2>
 <div class="mm"><ul id="ml">{ml}</ul><div id="mpw"><div id="mp">{mp}<div class="parts" data-parts="drop" data-n="10" aria-hidden="true"></div></div><div id="mcap">{mc}</div></div></div></div></section>
<section id="quality" aria-labelledby="h-quality" data-next="var(--bg)"><div class="qgrid"><div class="qimg">{I('carton','Vaigai Milk 500 ml carton with droplets of condensation',)}</div>
 <div class="t"><span class="eyebrow">Quality you can trace</span><h2 id="h-quality" data-split>Tested before it <i>travels.</i></h2><p style="margin-top:16px;color:var(--muted)">Every batch is checked at the farm, at the chilling centre and again at the dairy. If it isn't right, it doesn't leave Madurai.</p>
 <ul class="stats"><li><b data-count="4">4</b><span>°C chilled within hours</span></li><li><b data-count="3">3</b><span>quality checks per batch</span></li><li><b data-count="0">0</b><span>preservatives added</span></li></ul><p style="font-size:.78rem;color:var(--muted);margin-top:14px">Sample figures. Replace with certified values.</p></div></div></section>
<section id="faq" aria-labelledby="h-faq"><div class="t"><span class="eyebrow">Questions</span><h2 id="h-faq" data-split>Good to <i>know.</i></h2><div class="faqs">{faq}</div></div></section>
<section id="cta" aria-labelledby="h-cta"><div class="t"><span class="eyebrow">Order for tomorrow</span><h2 id="h-cta" data-split>Wake up to <i>Vaigai.</i></h2></div>
 <div class="cframe">{FS('family','The full Vaigai Milk range swirling in a ring of milk: bottles, packs, ghee, paneer and curd')}<div class="parts" data-parts="mix" data-n="12" aria-hidden="true"></div></div><div class="t"><div id="basket" aria-live="polite"></div></div></section>
</main>
<footer><div class="fgrid"><div><a class="logo" href="#hero" aria-label="Vaigai Milk, back to top"><svg viewBox="0 0 64 62" style="width:56px;height:54px" aria-hidden="true"><use href="#mk"/></svg><span><b style="font-size:2rem">Vaigai</b><em>MILK · MADURAI</em></span></a><p style="margin-top:14px;max-width:26em">Fresh farm milk, curd, ghee, butter and paneer from Madurai, Tamil Nadu.</p></div>
<div><h2>Visit &amp; contact</h2><address>{SITE['street']}<br>{SITE['city']}, {SITE['state']} {SITE['pin']}<br><a href="tel:{SITE['phone'].replace(' ','')}">{SITE['phone']}</a><br><a href="mailto:{SITE['email']}">{SITE['email']}</a><br><a href="https://www.google.com/maps/search/?api=1&amp;query=Madurai+Tamil+Nadu" target="_blank" rel="noopener">Open in Google Maps</a></address></div>
<div><h2>Hours</h2><p><span>Delivery: daily by 5:30 AM</span><br><span>Orders: 6 AM to 9 PM</span><br><span>Chat:</span> <a href="https://wa.me/{SITE['wa']}" target="_blank" rel="noopener" data-track="whatsapp_footer">WhatsApp us</a></p></div></div>
<nav class="areas" aria-label="Delivery areas"><h2>Delivery areas</h2><ul>{"".join(f'<li><a href="{u}/">{n}</a></li>' for n,u in AREA_LINKS)}</ul><p><a href="ta/" hreflang="ta" lang="ta">தமிழில் பார்க்க</a> · <a href="recipes/">Recipes</a></p></nav><p class="legal">© Vaigai Milk, Madurai. Sample address, phone and prices are placeholders to be replaced before launch.</p></footer>'''

def jsonld():
    base=SITE['url']
    org={"@context":"https://schema.org","@type":["Organization","LocalBusiness"],"@id":base+"#org","name":"Vaigai Milk","url":base,"logo":base+"images/"+LOGOF,"image":base+"images/"+OGF,
     "description":"Fresh farm milk, curd, ghee, butter and paneer from Madurai, Tamil Nadu, delivered to your door by 5:30 AM.","telephone":SITE['phone'],"email":SITE['email'],
     "address":{"@type":"PostalAddress","streetAddress":SITE['street'],"addressLocality":SITE['city'],"addressRegion":SITE['state'],"postalCode":SITE['pin'],"addressCountry":"IN"},
     "areaServed":[{"@type":"City","name":"Madurai"}]+[{"@type":"Place","name":a+", Madurai"} for a in ["Anna Nagar","KK Nagar","Teppakulam","Goripalayam","Thirunagar","Tallakulam"]],"hasMap":"https://www.google.com/maps/search/?api=1&query=Madurai+Tamil+Nadu","contactPoint":{"@type":"ContactPoint","telephone":SITE["phone"],"contactType":"customer service","areaServed":"IN","availableLanguage":["English","Tamil"]},"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],"opens":"06:00","closes":"21:00"}],"priceRange":"₹","sameAs":[]}
    site={"@context":"https://schema.org","@type":"WebSite","name":"Vaigai Milk","url":base,"inLanguage":["en-IN","ta-IN"]}
    items={"@context":"https://schema.org","@type":"ItemList","name":"Vaigai Milk products","itemListElement":[{"@type":"ListItem","position":i+1,"item":{"@type":"Product","name":p['n'],"description":p['d'],"image":base+f"images/{FN.get(p['k'],p['k'])}.webp","sku":"VGM-"+p['k'].upper()+"-"+p['u'].replace(' ',''),"category":"Dairy products","brand":{"@type":"Brand","name":"Vaigai Milk"},"offers":{"@type":"Offer","priceCurrency":"INR","price":str(p['p']),"availability":"https://schema.org/InStock","url":base+"#range"}}} for i,p in enumerate(PR)]}
    faq={"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in FAQ]}
    return ''.join(f'<script type="application/ld+json">{json.dumps(x,ensure_ascii=False)}</script>\n' for x in (org,site,items,faq))

TITLE='Vaigai Milk | Fresh Milk, Curd, Ghee & Paneer in Madurai'
DESC='Vaigai Milk delivers fresh farm milk, set curd, ghee, butter and paneer across Madurai, Tamil Nadu. Chilled, sealed and at your door by 5:30 AM.'
FAV="data:image/svg+xml,"+__import__('urllib.parse',fromlist=['quote']).quote(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 62">{MARK}</svg>')

JS='\n'.join((REPO/p).read_text(encoding='utf-8') for p in ('frontend/website/src/js/app.js','frontend/assistant/brain.js','frontend/assistant/ui.js'))

def page(prod):
    b=body(prod)
    head=f'''<!DOCTYPE html>
<html lang="en-IN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{TITLE}</title>
<meta name="description" content="{DESC}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#f7f5ee" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#06303a" media="(prefers-color-scheme: dark)">
<meta name="geo.region" content="IN-TN"><meta name="geo.placename" content="Madurai">
<link rel="canonical" href="{SITE['url']}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Vaigai Milk"><meta property="og:locale" content="en_IN"><meta property="og:url" content="{SITE['url']}"><meta property="og:title" content="{TITLE}"><meta property="og:description" content="{DESC}"><meta property="og:image" content="{SITE['url']}images/{OGF}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Vaigai Milk glass bottle in a crown splash of fresh milk">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{TITLE}"><meta name="twitter:description" content="{DESC}"><meta name="twitter:image" content="{SITE['url']}images/{OGF}"><meta name="twitter:image:alt" content="Vaigai Milk glass bottle in a crown splash of fresh milk"><meta name="application-name" content="Vaigai Milk"><meta name="apple-mobile-web-app-title" content="Vaigai Milk"><meta name="format-detection" content="telephone=yes"><meta name="author" content="Vaigai Milk"><link rel="alternate" hreflang="en-in" href="{SITE['url']}"><link rel="alternate" hreflang="ta-in" href="{SITE['url']}ta/"><link rel="alternate" hreflang="x-default" href="{SITE['url']}">
{'<link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="apple-touch-icon.png"><link rel="manifest" href="site.webmanifest"><link rel="preload" as="image" href="'+HP+'" type="image/webp" fetchpriority="high">' if prod else '<link rel="icon" href="'+FAV+'">'}
<script>(function(){{var t;try{{t=localStorage.getItem('vaigai-theme')}}catch(e){{}}if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);try{{if(sessionStorage.getItem('vaigai-seen')==='1')document.documentElement.className='seen'}}catch(e){{}}}})()</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Hanken+Grotesk:wght@400;600;800&family=Nunito:wght@700;800&family=Hind+Madurai:wght@400;600&display=swap" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Hanken+Grotesk:wght@400;600;800&family=Nunito:wght@700;800&family=Hind+Madurai:wght@400;600&display=swap"></noscript>
<script>window.VAIGAI_CONFIG={{gtm:"",ga4:"",pixel:"",assistantWebhook:"",orderWebhook:"",leadWebhook:"",statusWebhook:"",payWebhook:"",webhookKey:""}};</script>
<!-- ANALYTICS (optional): paste your Google Tag Manager or GA4 snippet here. Events are already pushed to window.dataLayer. -->
{jsonld()}<style>{CSS}</style>
<noscript><style>{NOGS('body')}</style></noscript></head><body>
'''
    imgjs=json.dumps({} if prod else IMGS)
    js=JS.replace('__IMG__',imgjs).replace('__PR__',json.dumps([{'n':p['n'],'ta':p['ta'],'u':p['u'],'p':p['p'],'d':p['d'],'nt':p['nt'],'dt':p['dt'],'k':p['k'],'sku':'VGM-'+p['k'].upper()+'-'+p['u'].replace(' ','')} for p in PR],ensure_ascii=False)).replace('__MO__',json.dumps([{'p':m['p']} for m in MO])).replace('__TA__',json.dumps(TA,ensure_ascii=False)).replace('__CUT__',json.dumps(CUT)).replace('__FNC__',json.dumps(FNC)).replace('__WA__',SITE['wa']).replace('__PROD__','true' if prod else 'false')
    scripts='''<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js" defer></script>
'''
    SAFE='<script>setTimeout(function(){var h=document.getElementById("hero"),p=document.getElementById("pre");if(h)h.classList.add("ready");if(p)p.remove()},1500)</script>\n'
    return head+b+'\n'+SAFE+scripts+'<script>window.addEventListener("DOMContentLoaded",function(){'+js+'});</script>\n</body></html>'
