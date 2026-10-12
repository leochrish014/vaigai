"""Generated secondary pages: Tamil home (/ta/), Madurai area pages, recipe blog hooks.

Receives the build namespace (SITE, PR, TA, esc, MARK, ...) via runpy init_globals."""
# Generates /ta/ (Tamil) and six Madurai area pages. Runs inside run.py (build globals available).
import datetime,json,re,urllib.parse
from bs4 import BeautifulSoup,NavigableString
U=SITE['url']
def nrm(s):return re.sub(r'\s+',' ',s).strip()
def make_ta(html):
    soup=BeautifulSoup(html,'html.parser')
    keys=TA
    done=0
    for el in soup.select('header *, main *, footer *'):
        k=nrm(el.get_text(''))
        if k in keys and not any(nrm(c.get_text(''))==k for c in el.find_all(True,recursive=False)):
            frag=BeautifulSoup(keys[k],'html.parser');el.clear()
            for c in list(frag.contents):el.append(c)
            done+=1
    soup.html['lang']='ta'
    T='வைகை பால் | மதுரையில் புதிய பால், தயிர், நெய், வெண்ணெய்'
    D='வைகை பால் மதுரையில் புதிய பண்ணைப் பால், தயிர், நெய், வெண்ணெய் ஆகியவற்றை அதிகாலை 5:30க்குள் வீடு தேடி வழங்குகிறது. அதே காலையில் குளிர்வித்து மூடப்படுகிறது.'
    soup.title.string=T
    def setm(sel,attr,val):
        e=soup.select_one(sel)
        if e:e[attr]=val
    setm('meta[name="description"]','content',D);setm('meta[property="og:title"]','content',T);setm('meta[property="og:description"]','content',D);setm('meta[property="og:url"]','content',U+'ta/');setm('meta[property="og:locale"]','content','ta_IN');setm('meta[name="twitter:title"]','content',T);setm('meta[name="twitter:description"]','content',D);setm('link[rel="canonical"]','href',U+'ta/')
    # hreflang set (already has en-in, ta-in, x-default from the English head)
    for l in soup.select('link[rel="alternate"][hreflang]'):pass
    # JSON-LD: Tamil FAQ + Tamil WebSite language
    for sc in soup.find_all('script',type='application/ld+json'):
        d=json.loads(sc.string)
        if d.get('@type')=='FAQPage':d['mainEntity']=[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in FAQ_TA]
        if d.get('@type')=='WebSite':d['inLanguage']='ta-IN';d['url']=U+'ta/'
        sc.string=json.dumps(d,ensure_ascii=False)
    # force Tamil + link English toggle to the English page
    head=soup.head;fl=soup.new_tag('script');fl.string='window.VAIGAI_FORCE_LANG="ta";window.VAIGAI_ALT_URL="../";';head.append(fl)
    out=str(soup)
    out=re.sub(r'(["\'(=])images/',r'\1../images/',out)
    out=out.replace('href="favicon.svg"','href="../favicon.svg"').replace('href="apple-touch-icon.png"','href="../apple-touch-icon.png"').replace('href="site.webmanifest"','href="../site.webmanifest"')
    out=out.replace("'images/cut/'","'../images/cut/'")
    out=out.replace('href="ta/" hreflang="ta" lang="ta">தமிழில் பார்க்க','href="../" hreflang="en-in" lang="en">View in English').replace('href="recipes/"','href="../recipes/"')
    for n,u in AREA_LINKS:out=out.replace(f'href="{u}/"',f'href="../{u}/"')
    return out,done
INFO={
'Anna Nagar':('a large residential neighbourhood in Madurai','Families in Anna Nagar often take a daily litre of milk and add curd for the week, so we pack these morning orders together and deliver them in one run.','Pay cash on delivery. If online payment is switched on for your order you can also pay by UPI or card.',[0,3,4]),
'KK Nagar':('a residential locality in Madurai','Homes in KK Nagar can fix one morning slot and keep the same time every day. Changes for the next day close at 9 PM.','Cash on delivery is the usual choice in KK Nagar, and UPI or card are offered when online payment is enabled.',[0,1,3]),
'Teppakulam':('an area in east Madurai, named after the Mariamman Teppakulam temple tank','Teppakulam is on our morning route, so milk, ghee and butter for festival cooking can arrive together in the same crate.','You can pay on delivery, or by UPI or card when you choose online payment while ordering.',[2,4,0]),
'Goripalayam':('a busy locality in central Madurai','Shops, tiffin stalls and homes in Goripalayam can order milk and curd in larger quantities. Ask us on WhatsApp for a bulk plan.','Cash on delivery works for homes; shops can ask for a weekly invoice. GST invoices are issued for online payments.',[0,3,5]),
'Thirunagar':('a locality in south Madurai','Thirunagar customers can add butter and curd to the daily milk order so breakfast is covered with a single delivery.','Pay when the order arrives, or choose UPI or card at checkout if it is enabled.',[0,3,4]),
'Tallakulam':('a central Madurai locality','Homes and offices around Tallakulam can choose the 6:30 to 7:30 AM slot if they prefer a slightly later delivery.','Cash on delivery or UPI and card at checkout, depending on what is enabled for your order.',[0,1,5])}
CSS_AREA="""<style>:root{--bg:#f7f5ee;--card:#fff;--ink:#0a2a24;--muted:#46605a;--line:rgba(10,42,36,.16);--acc:#0e6b3a;--gold:#e3b341}@media(prefers-color-scheme:dark){:root{--bg:#06303a;--card:#0c3d48;--ink:#eaf5f0;--muted:#a9c7be;--line:rgba(255,255,255,.2);--acc:#46d27a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.65 system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans Tamil',sans-serif}a{color:inherit}.w{max-width:960px;margin:0 auto;padding:0 18px}
header{background:var(--card);border-bottom:1px solid var(--line)}header .w{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:64px}.logo{display:flex;align-items:center;gap:10px;font-weight:800;text-decoration:none;font-size:1.2rem;min-height:44px}.logo svg{width:40px;height:38px}
.logo{white-space:nowrap}@media(max-width:430px){header .btn{padding:0 14px;font-size:.9rem}.logo{font-size:1.05rem}}.btn{display:inline-flex;align-items:center;min-height:44px;border-radius:99px;padding:0 20px;background:var(--gold);color:#0a2a24;font-weight:700;text-decoration:none}.btn.o{background:transparent;border:1px solid var(--line);color:var(--ink)}
h1{font:400 clamp(2rem,6vw,3.4rem)/1.05 Georgia,'Noto Serif Tamil',serif;margin:26px 0 12px}h2{font:400 1.7rem/1.15 Georgia,serif;margin:34px 0 12px}.crumb{font-size:.88rem;color:var(--muted);padding-top:6px}.crumb a{display:inline-flex;min-height:44px;align-items:center;padding-right:6px}.lead{font-size:1.15rem;max-width:44em}.row{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0}
ul.facts{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}ul.facts li{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px}ul.facts b{display:block;color:var(--acc)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}.card{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden}.card img{width:100%;height:auto;display:block;background:#06303a}.card div{padding:12px 14px}.card h3,.card h2{margin:0;font:700 1.1rem system-ui,sans-serif}.card p{margin:4px 0 8px;color:var(--muted);font-size:.92rem}.pr{font-weight:800;color:var(--acc)}
ol.steps{padding-left:20px}details{border-bottom:1px solid var(--line);padding:6px 0}summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:600}.links{display:flex;gap:6px 16px;flex-wrap:wrap;list-style:none;padding:0}.links a{display:inline-flex;min-height:44px;align-items:center}
footer{margin-top:50px;background:#031a20;color:#b9d4cc;padding:30px 0 40px;font-size:.92rem}footer a{color:#fff;display:inline-flex;min-height:44px;min-width:44px;align-items:center;justify-content:center}footer .w>*{margin:0}.skip{position:absolute;left:-999px}.skip:focus{left:10px;top:10px;background:var(--gold);color:#0a2a24;padding:8px 14px;z-index:9;border-radius:99px}</style>"""
def area_page(name,slug,idx):
    where,lead,pay,picks=INFO[name]
    url=f'{U}{slug}/'
    title=f'Milk Delivery in {name}, Madurai | Vaigai Milk'
    desc=f'Fresh farm milk, curd, ghee and butter delivered to {name}, Madurai by 5:30 AM. Order on WhatsApp with Vaigai Milk. Chilled the same morning.'
    wa=lambda t:f'https://wa.me/{SITE["wa"]}?text='+urllib.parse.quote(t)
    prods=''.join(f'<article class="card"><img src="../images/{FN[p["k"]]}.webp" loading="lazy" width="1376" height="768" alt="{esc(p["alt"])}"><div><h3>{esc(p["n"])}</h3><p>{esc(p["d"])}</p><span class="pr">₹{p["p"]}</span> <span style="color:var(--muted)">· {p["u"]}</span><br><a class="btn o" style="margin-top:8px" href="{wa("Hi Vaigai Milk, I live in "+name+", Madurai. I would like to order "+p["n"])}" rel="noopener">Order in {name}</a></div></article>' for p in [PR[i] for i in picks])
    allp=''.join(f'<li>{esc(p["n"])} ({p["u"]}): ₹{p["p"]}</li>' for p in PR)
    others=''.join(f'<li><a href="../{u}/">Milk delivery in {n}</a></li>' for n,u in AREA_LINKS if n!=name)
    faqs=[(f'Do you deliver to {name} by 5:30 AM?',f'Yes. {name} is on our morning route and orders reach your door by 5:30 AM. Send your 6-digit pincode on WhatsApp and we confirm your street.'),
          (f'Can I start a daily milk plan in {name}?',f'Yes. Choose your products and quantity once and we deliver every morning. You can pause, skip a day or cancel from your account. Changes for the next day close at 9 PM.'),
          (f'How do I pay for orders in {name}?',pay)]
    faq_html=''.join(f'<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>' for q,a in faqs)
    ld=[{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Vaigai Milk","item":U},{"@type":"ListItem","position":2,"name":f"Milk delivery in {name}","item":url}]},
        {"@context":"https://schema.org","@type":"LocalBusiness","@id":U+"#org","name":"Vaigai Milk","url":url,"image":U+"images/"+OGF,"telephone":SITE['phone'],"address":{"@type":"PostalAddress","streetAddress":SITE['street'],"addressLocality":SITE['city'],"addressRegion":SITE['state'],"postalCode":SITE['pin'],"addressCountry":"IN"},"areaServed":{"@type":"Place","name":f"{name}, Madurai"},"priceRange":"₹"},
        {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faqs]}]
    ldh=''.join(f'<script type="application/ld+json">{json.dumps(x,ensure_ascii=False)}</script>' for x in ld)
    return f'''<!DOCTYPE html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{esc(title)}</title><meta name="description" content="{esc(desc)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="{url}">
<meta property="og:type" content="website"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{U}images/{OGF}"><meta property="og:locale" content="en_IN"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#06303a">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">{ldh}{CSS_AREA}</head><body><a class="skip" href="#main">Skip to content</a>
<header><div class="w"><a class="logo" href="../" aria-label="Vaigai Milk home"><svg viewBox="0 0 64 62" aria-hidden="true">{MARK}</svg>Vaigai Milk</a><a class="btn" href="{wa("Hi Vaigai Milk, I live in "+name+", Madurai. I would like to order milk.")}" rel="noopener">Order on WhatsApp</a></div></header>
<main id="main" class="w"><p class="crumb"><a href="../">Home</a> / Milk delivery in {name}</p>
<h1>Fresh milk delivery in {name}, Madurai</h1>
<p class="lead">{name} is {where}. Vaigai Milk brings farm-fresh milk, set curd, ghee and butter to {name} by 5:30 AM, chilled the same morning and sealed for freshness. {lead}</p>
<div class="row"><a class="btn" href="{wa("Hi Vaigai Milk, I live in "+name+", Madurai. Please share today's order options.")}" rel="noopener">Order for tomorrow</a><a class="btn o" href="../#range">See all products</a></div>
<ul class="facts"><li><b>By 5:30 AM</b>Daily doorstep delivery in {name}</li><li><b>6 AM to 9 PM</b>Order window; next-day cut-off at 9 PM</li><li><b>Cash or online</b>{esc(pay.split(".")[0])}.</li></ul>
<h2>Popular in {name}</h2><div class="grid">{prods}</div>
<h2>Price list for {name}</h2><ul>{allp}</ul><p style="color:var(--muted);font-size:.9rem">Prices are MRP including GST where applicable. Sample prices: confirm before you publish.</p>
<h2>How ordering in {name} works</h2><ol class="steps"><li>Message us on WhatsApp with your products and your {name} address.</li><li>We confirm your slot (by 5:30 AM, or 6:30 to 7:30 AM) and your price.</li><li>Your milk arrives chilled at your door. Pause, skip or change any day before 9 PM.</li></ol>
<h2>Questions from {name}</h2>{faq_html}
<h2>We also deliver to</h2><ul class="links">{others}<li><a href="../">Vaigai Milk home</a></li><li><a href="../ta/" hreflang="ta" lang="ta">தமிழில் பார்க்க</a></li></ul></main>
<footer><div class="w"><b>Vaigai Milk</b>, {esc(SITE['street'])}, {SITE['city']}, {SITE['state']} {SITE['pin']}<br><a href="tel:{SITE['phone'].replace(' ','')}">{SITE['phone']}</a> · <a href="mailto:{SITE['email']}">{SITE['email']}</a><br>Sample address and phone: replace before launch.</div></footer></body></html>'''
exec(open(HERE/'recipes_pages.py',encoding='utf-8').read())
def write_pages(P,index_html):
    out=[]
    ta,n=make_ta(index_html);os.makedirs(P+'/ta',exist_ok=True);open(P+'/ta/index.html','w',encoding='utf-8').write(ta);out.append(('ta/',f'translated {n} elements'))
    for i,(name,slug) in enumerate(AREA_LINKS):
        os.makedirs(f'{P}/{slug}',exist_ok=True);open(f'{P}/{slug}/index.html','w',encoding='utf-8').write(area_page(name,slug,i));out.append((slug+'/','area page'))
    os.makedirs(P+'/recipes',exist_ok=True);open(P+'/recipes/index.html','w',encoding='utf-8').write(recipes_index());out.append(('recipes/','recipe index'))
    for i,r in enumerate(RECIPES):
        os.makedirs(P+'/recipes/'+r['slug'],exist_ok=True);open(P+'/recipes/'+r['slug']+'/index.html','w',encoding='utf-8').write(recipe_page(r,i));out.append(('recipes/'+r['slug']+'/','recipe page'))
    return out
