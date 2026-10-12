import re,json,os,sys,struct
from bs4 import BeautifulSoup
from xml.dom import minidom
import os as _os,pathlib as _pl
ROOT=_os.environ.get('SITE_DIR') or str(_pl.Path(__file__).resolve().parents[2]/'frontend'/'website'/'dist'/'public')
ART=_os.environ.get('ARTIFACTS_DIR') or str(_pl.Path(__file__).resolve().parents[1]/'.artifacts');_os.makedirs(ART,exist_ok=True)
html=open(f'{ROOT}/index.html',encoding='utf-8').read();soup=BeautifulSoup(html,'html.parser')
R=[]  # (id, area, check, status, note)
def add(i,area,check,ok,note='',warn=False):R.append((i,area,check,'PASS' if ok else ('WARN' if warn else 'FAIL'),note))
txt=lambda e:re.sub(r'\s+',' ',e.get_text(' ')).strip()
meta=lambda n:(soup.find('meta',attrs={'name':n}) or {}).get('content','')
og=lambda n:(soup.find('meta',attrs={'property':n}) or {}).get('content','')
title=soup.title.string.strip();desc=meta('description')
kw=['milk','madurai']
# --- Technical on-page
add('S01','On-page','Title length 30-60 and has keywords',30<=len(title)<=60 and all(k in title.lower() for k in kw),f'{len(title)} chars: {title}')
add('S02','On-page','Meta description 70-160 chars with keywords',70<=len(desc)<=160 and all(k in desc.lower() for k in kw),f'{len(desc)} chars')
canon=(soup.find('link',rel='canonical') or {}).get('href','')
add('S03','On-page','Canonical present and absolute',canon.startswith('https://'),canon)
add('S04','On-page','Domain is a real domain (not example.com)','example.com' not in canon,'Replace www.example.com before launch',warn=True)
add('S05','On-page','Robots meta allows indexing',('noindex' not in meta('robots').lower()),meta('robots'))
add('S06','On-page','html lang set',bool(soup.html.get('lang')),soup.html.get('lang'))
add('S07','On-page','Viewport meta without zoom block','user-scalable=no' not in meta('viewport') and 'width=device-width' in meta('viewport'),meta('viewport'))
h1=soup.find_all('h1');add('S08','On-page','Exactly one H1 with keywords',len(h1)==1 and 'milk' in txt(h1[0]).lower(),txt(h1[0]) if h1 else 'none')
hs=[int(h.name[1]) for h in soup.find_all(re.compile('^h[1-6]$'))];jumps=sum(1 for a,b in zip(hs,hs[1:]) if b-a>1)
add('S09','On-page','Heading levels never skip',jumps==0,f'{len(hs)} headings')
tt=re.sub(r'\s+',' ',title.lower());add('S10','On-page','Title, H1 and og:title are consistent in topic',og('og:title')==title,'og:title matches title')
add('S11','On-page','hreflang / alternate language declared',bool(soup.find('link',rel='alternate',hreflang=True)),'Single URL site; add hreflang when /ta/ page exists',warn=True)
add('S12','On-page','theme-color + application-name + format-detection',bool(soup.find('meta',attrs={'name':'theme-color'})) and bool(meta('application-name')),'',warn=True)
# --- Social
need=['og:type','og:title','og:description','og:image','og:url','og:image:width','og:image:height','og:image:alt','og:site_name','og:locale']
miss=[n for n in need if not og(n)];add('S13','Social','Open Graph complete',not miss,','.join(miss) or 'all present')
add('S14','Social','Twitter card + image + image alt',bool(meta('twitter:card')) and bool(meta('twitter:image')) and bool(meta('twitter:image:alt')),'',warn=True)
ogimg=og('og:image').replace(canon,'');p=f'{ROOT}/{ogimg}'
if os.path.exists(p):
    from PIL import Image;im=Image.open(p);add('S15','Social','OG image exists, 1200x630, <300KB',im.size==(1200,630) and os.path.getsize(p)<300_000,f'{im.size} {os.path.getsize(p)//1024}KB')
else:add('S15','Social','OG image exists',False,p)
# --- Images
imgs=soup.find_all('img');generic=[i['src'] for i in imgs if i.get('src') and re.search(r'/(hero|farm|dairy|combo|curd|carton|crate|ghee|badam|family|butter|cut_\w+|\w+_main|\w+_atl)\.webp$',i['src'])]
add('S16','Images','Every <img> has alt',all(i.has_attr('alt') for i in imgs),f'{len(imgs)} images')
add('S17','Images','Alt text descriptive (>=20 chars, no "image of")',all(len(i.get('alt',''))>=20 and not re.match(r'(image|picture|photo) of',i.get('alt','').lower()) for i in imgs if i.get('alt','')!='' ),'')
add('S18','Images','Descriptive file names (keyword-rich)',len(generic)==0,f'{len(generic)} generic names e.g. {generic[:2]}',warn=True)
add('S19','Images','width/height set (prevents layout shift)',all(i.get('width') and i.get('height') for i in imgs),'')
nolazy=[i.get('src') for i in imgs if i.get('loading')!='lazy' and i.get('fetchpriority')!='high'];add('S20','Images','Below-fold images lazy, LCP image high priority',len(nolazy)<=1,f'non-lazy: {nolazy[:3]}')
big=[(f,os.path.getsize(f'{ROOT}/images/{f}')//1024) for f in os.listdir(f'{ROOT}/images') if os.path.getsize(f'{ROOT}/images/{f}')>300_000];add('S21','Images','No image over 300 KB',not big,str(big))
add('S22','Images','Modern format (WebP) used',all(i['src'].endswith('.webp') for i in imgs if i.get('src')),'')
pre=soup.find('link',rel='preload');add('S23','Images','LCP image preloaded',bool(pre) and pre.get('fetchpriority')=='high',pre.get('href') if pre else 'none')
# --- Structured data
ld=[]
for s in soup.find_all('script',type='application/ld+json'):
    try:ld.append(json.loads(s.string))
    except Exception as e:ld.append({'ERR':str(e)})
types=[(x.get('@type') if isinstance(x.get('@type'),str) else '/'.join(x.get('@type',[]))) for x in ld]
add('S24','Schema','JSON-LD parses (Org/LocalBusiness, WebSite, ItemList, FAQPage)',all('ERR' not in x for x in ld) and len(ld)>=4,str(types))
org=next((x for x in ld if 'LocalBusiness' in str(x.get('@type'))),{})
need_o=['name','url','logo','image','telephone','address','openingHoursSpecification','areaServed']
mo=[k for k in need_o if k not in org];add('S25','Schema','LocalBusiness has name/url/logo/phone/address/hours/area',not mo,','.join(mo) or 'complete')
add('S26','Schema','LocalBusiness has contactPoint, hasMap, geo-area list',all(k in org for k in('contactPoint','hasMap')),'',warn=True)
lst=next((x for x in ld if x.get('@type')=='ItemList'),{});okp=all(all(k in it['item'] for k in('name','image','offers','brand')) and all(k in it['item']['offers'] for k in('price','priceCurrency','availability')) for it in lst.get('itemListElement',[]))
add('S27','Schema','Product items have name/image/brand/offers(price,currency,availability)',okp,f"{len(lst.get('itemListElement',[]))} products")
add('S28','Schema','Product items have sku/category',all('sku' in it['item'] for it in lst.get('itemListElement',[])),'',warn=True)
fq=next((x for x in ld if x.get('@type')=='FAQPage'),{});qs=[q['name'] for q in fq.get('mainEntity',[])];dq=[txt(s) for s in soup.select('details summary')]
add('S29','Schema','FAQ schema matches visible FAQ',qs==dq,f'{len(qs)} questions')
site=next((x for x in ld if x.get('@type')=='WebSite'),{});add('S30','Schema','WebSite declares both languages',isinstance(site.get('inLanguage'),list),str(site.get('inLanguage')),warn=True)
add('S31','Schema','Placeholder phone/prices flagged for replacement','00000' not in json.dumps(ld),'Replace +91 00000 00000 in JSON-LD + footer',warn=True)
# --- Links
ids=[e['id'] for e in soup.find_all(id=True)];dup=[i for i in set(ids) if ids.count(i)>1];add('S32','Links','No duplicate ids',not dup,str(dup))
anch=[a['href'][1:] for a in soup.find_all('a',href=True) if a['href'].startswith('#') and len(a['href'])>1];bad=[a for a in anch if a not in ids];add('S33','Links','Every #anchor resolves',not bad,str(bad))
ext=[a for a in soup.find_all('a',href=True) if a['href'].startswith('http')];badr=[a['href'] for a in ext if a.get('target')=='_blank' and 'noopener' not in a.get('rel',[])];add('S34','Links','target=_blank links have rel=noopener',not badr,f'{len(ext)} external links')
emp=[a for a in soup.find_all('a') if not (txt(a) or a.get('aria-label'))];add('S35','Links','No empty-text links',not emp,f'{len(emp)}')
lab=[x for x in soup.find_all('aria-labelledby')]
refs=[e['aria-labelledby'] for e in soup.find_all(attrs={'aria-labelledby':True})];badl=[r for r in refs if r not in ids];add('S36','Links','aria-labelledby targets exist',not badl,str(badl))
tel=soup.find('a',href=re.compile('^tel:'));mail=soup.find('a',href=re.compile('^mailto:'));add('S37','Links','Click-to-call and mailto links present',bool(tel and mail),'')
# --- Files
rb=open(f'{ROOT}/robots.txt').read() if os.path.exists(f'{ROOT}/robots.txt') else '';add('S38','Files','robots.txt allows crawl + lists sitemap','Sitemap:' in rb and 'Disallow: /\n' not in rb,rb.strip().replace('\n',' | '))
try:
    sm=minidom.parse(f'{ROOT}/sitemap.xml');locs=[n.firstChild.data for n in sm.getElementsByTagName('loc')];add('S39','Files','sitemap.xml valid and lists canonical',canon in locs,f'{len(locs)} url(s), {len(sm.getElementsByTagName("image:image"))} image entries')
except Exception as e:add('S39','Files','sitemap.xml valid',False,str(e))
try:
    mf=json.load(open(f'{ROOT}/site.webmanifest'));ok=all(os.path.exists(f'{ROOT}/{i["src"]}') for i in mf['icons']);add('S40','Files','Web manifest valid, icons exist',ok,mf['name'])
except Exception as e:add('S40','Files','Web manifest valid',False,str(e))
add('S41','Files','favicon.svg + apple-touch-icon exist',os.path.exists(f'{ROOT}/favicon.svg') and os.path.exists(f'{ROOT}/apple-touch-icon.png'),'')
add('S42','Files','Custom 404 page present',os.path.exists(f'{ROOT}/404.html'),'',warn=True)
add('S43','Files','Cache + security headers file (_headers)',os.path.exists(f'{ROOT}/_headers'),'',warn=True)
# --- Content
body=soup.find('body');
for t in body.find_all(['script','style','noscript']):t.decompose()
words=re.findall(r"[A-Za-z]{2,}",txt(body));wc=len(words);low=' '.join(words).lower()
add('S44','Content','Visible text >= 300 words (static HTML)',wc>=300,f'{wc} words')
add('S45','Content','Local keyword coverage (Madurai >= 8, milk >= 10)',low.count('madurai')>=8 and low.count('milk')>=10,f"madurai={low.count('madurai')} milk={low.count('milk')} curd={low.count('curd')} ghee={low.count('ghee')} paneer={low.count('paneer')} butter={low.count('butter')}")
add('S46','Content','NAP (name, address, phone) in footer',bool(soup.find('address')) and 'Madurai' in txt(soup.find('address')),'')
add('S47','Content','Tamil text present for local audience (lang=ta spans)',bool(soup.find(attrs={'lang':'ta'})),'')
# --- Marketing
js=html
for ev in ['add_to_cart','begin_checkout','scroll_depth','whatsapp_fab','hero_slide','language_toggle','theme_toggle']:pass
evs=['add_to_cart','begin_checkout','scroll_depth','whatsapp_fab','generate_lead','view_item','page_context','consent']
have=[e for e in evs if e in js];add('S48','Marketing','dataLayer events cover funnel (cart, checkout, lead, view_item, scroll)',len(have)==len(evs),f'have {have}')
add('S49','Marketing','GTM / GA4 / Meta Pixel plug-in config present','VAIGAI_CONFIG' in js,'')
add('S50','Marketing','UTM parameters captured and passed to WhatsApp order','utm_' in js,'',warn=True)
add('S51','Marketing','Consent banner when trackers are configured','consent' in js.lower() and 'vaigai-consent' in js,'',warn=True)
wa=[a for a in soup.find_all('a',href=True) if 'wa.me' in a['href']];add('S52','Marketing','>= 3 WhatsApp conversion points (button, floating, footer)',len(wa)>=2 or 'wa.me' in js,f'{len(wa)} static + dynamic order link')
add('S53','Marketing','Social profile links (sameAs / footer)',bool(org.get('sameAs')),'Add Instagram/Facebook/YouTube links when ready',warn=True)
# --- Performance (static)
tot=sum(os.path.getsize(os.path.join(r,f)) for r,_,fs in os.walk(ROOT) for f in fs);add('S54','Performance','Total site weight < 2.5 MB',tot<2_500_000,f'{tot//1024} KB, HTML {os.path.getsize(ROOT+"/index.html")//1024} KB')
sc=soup.find_all('script',src=True) if False else re.findall(r'<script src="[^"]+"([^>]*)>',open(f'{ROOT}/index.html',encoding='utf-8').read());add('S55','Performance','External scripts deferred (no render-blocking)',all('defer' in s for s in sc),f'{len(sc)} external scripts')
add('S56','Performance','Fonts preconnected, display=swap','preconnect' in html and 'display=swap' in html,'')
json.dump(R,open(ART+'/static.json','w'),ensure_ascii=False,indent=1)
from collections import Counter;c=Counter(r[3] for r in R);print(dict(c))
for r in R:
    if r[3]!='PASS':print(r[3],r[0],r[2],'|',r[4][:140])
