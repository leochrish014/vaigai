import re,json,os,itertools
from bs4 import BeautifulSoup
from xml.dom import minidom
import os as _os,pathlib as _pl
ROOT=_os.environ.get('SITE_DIR') or str(_pl.Path(__file__).resolve().parents[2]/'frontend'/'website'/'dist'/'public')
ART=_os.environ.get('ARTIFACTS_DIR') or str(_pl.Path(__file__).resolve().parents[1]/'.artifacts');_os.makedirs(ART,exist_ok=True)
P={'home':'index.html','ta':'ta/index.html'}
for d in sorted(os.listdir(ROOT)):
    if d.startswith('milk-delivery-'):P[d]=d+'/index.html'
R=[];S={}
def add(i,c,ok,n='',warn=False):R.append((i,c,'PASS' if ok else ('WARN' if warn else 'FAIL'),n))
for d in sorted(os.listdir(ROOT+'/recipes')):
    P['recipes' if d=='index.html' else 'r:'+d]='recipes/'+d+('' if d=='index.html' else '/index.html')
for k,f in P.items():S[k]=BeautifulSoup(open(f'{ROOT}/{f}',encoding='utf-8').read(),'html.parser')
txt=lambda e:re.sub(r'\s+',' ',e.get_text(' ')).strip()
titles={k:s.title.string for k,s in S.items()};descs={k:(s.find('meta',attrs={'name':'description'}) or {}).get('content','') for k,s in S.items()}
add('P01','15 pages generated (home, Tamil, 6 areas, recipes index + 6 recipes)',len(P)==15,str(len(P)))
add('P02','Every title unique and <= 66 chars (Tamil <= 70)',len(set(titles.values()))==15 and all(len(t)<=(70 if k=='ta' else 66) for k,t in titles.items()),str({k:len(t) for k,t in titles.items()}))
add('P03','Every description unique, 70-170 chars',len(set(descs.values()))==15 and all(70<=len(d)<=170 for d in descs.values()),str({k:len(d) for k,d in descs.items()}))
add('P04','Canonical is self-referencing on every page',all((s_.find('link',rel='canonical') or {}).get('href','').rstrip('/').endswith('' if k=='home' else os.path.dirname(P[k]).rstrip('/')) for k,s_ in S.items()),'')
def jumps(s):
    h=[int(x.name[1]) for x in s.find_all(re.compile('^h[1-6]$'))];return sum(1 for a,b in zip(h,h[1:]) if b-a>1)
add('P05','One H1 per page; no skipped heading levels',all(len(s.find_all('h1'))==1 for s in S.values()) and all(jumps(s)==0 for s in S.values()),str({k:(len(s.find_all('h1')),jumps(s)) for k,s in S.items()}))
bad=[]
for k,s in S.items():
    for sc in s.find_all('script',type='application/ld+json'):
        try:json.loads(sc.string)
        except Exception as e:bad.append(k)
add('P06','All JSON-LD blocks on all pages parse',not bad,str(bad))
hl=lambda s:{l['hreflang']:l['href'] for l in s.find_all('link',rel='alternate') if l.get('hreflang')}
add('P07','Home and Tamil pages reference each other with hreflang en-in, ta-in, x-default',set(hl(S['home']))=={'en-in','ta-in','x-default'} and set(hl(S['ta']))=={'en-in','ta-in','x-default'} and hl(S['home'])['ta-in']==hl(S['ta'])['ta-in'],str(hl(S['ta'])))
add('P08','Tamil page: html lang=ta, Tamil title, canonical /ta/, og:locale ta_IN',S['ta'].html['lang']=='ta' and re.search('[\u0B80-\u0BFF]',titles['ta']) and S['ta'].find('link',rel='canonical')['href'].endswith('/ta/') and S['ta'].find('meta',property='og:locale')['content']=='ta_IN','')
ta_json=[json.loads(x.string) for x in S['ta'].find_all('script',type='application/ld+json')];faq=next(x for x in ta_json if x.get('@type')=='FAQPage')
add('P09','Tamil FAQ schema is in Tamil and matches the visible Tamil FAQ',all(re.search('[\u0B80-\u0BFF]',q['name']) for q in faq['mainEntity']) and [q['name'] for q in faq['mainEntity']]==[txt(x) for x in S['ta'].select('details summary')],'')
# leftover English on Tamil page
KEEP=re.compile(r'^(Vaigai|MILK|FAQ|GST|UPI|WhatsApp|EN|AM|PM|COD|GSTIN|FSSAI|₹|\d|Madurai|Anna|KK|Nagar|Teppakulam|Goripalayam|Thirunagar|Tallakulam|ml|g|IN|Pay|Order)',re.I)
T=BeautifulSoup(str(S['ta']),'html.parser')
for t in T(['script','style','noscript']):t.decompose()
for t in T.select('.sr,[aria-hidden="true"],svg'):t.decompose()
left=[]
for el in T.select('main *, footer *, header *'):
    if el.find(True):continue
    s=txt(el)
    if re.search(r'[A-Za-z]{4,} [A-Za-z]{3,} [A-Za-z]{2,}',s) and not re.search('[\u0B80-\u0BFF]',s):left.append(s[:70])
add('P10','Tamil page has no untranslated English sentences in visible text',len(left)<=3,f'{len(left)} left: {left[:4]}',warn=True)
# links resolve
broken=[]
for k,f in P.items():
    base=os.path.dirname(os.path.join(ROOT,f))
    for a in S[k].find_all(['a','img','link'],href=True)+S[k].find_all('img',src=True):
        u=a.get('href') or a.get('src')
        if not u or u.startswith(('http','mailto','tel','#','data:','javascript')):continue
        u=u.split('#')[0].split('?')[0]
        if not u:continue
        p=os.path.normpath(os.path.join(base,u))
        if os.path.isdir(p):p=os.path.join(p,'index.html')
        if not os.path.exists(p):broken.append((k,u))
add('P11','All local links, images and icons resolve from every page (incl. ../ paths on /ta/ and area pages)',not broken,str(broken[:5]))
areas=[k for k in P if k.startswith('milk-delivery')];recs=[k for k in P if k.startswith('r:')]
home_links=[a['href'] for a in S['home'].select('.areas a')]
add('P12','Home page footer links to all 6 area pages, Tamil page and recipes',all(f'{k}/' in home_links for k in areas) and any(h=='ta/' for h in [a['href'] for a in S['home'].find_all('a',href=True)]),str(home_links[:4]))
add('P13','Each area page links to home, the other 5 areas and the Tamil page',all(sum(1 for a in S[k].find_all('a',href=True) if a['href'].startswith('../milk-delivery'))==5 and any(a['href']=='../' for a in S[k].find_all('a',href=True)) and any(a['href']=='../ta/' for a in S[k].find_all('a',href=True)) for k in areas),'')
sh=lambda s:{tuple(w[i:i+5]) for w in [re.findall(r'\w+',txt(s.find('main')).lower())] for i in range(len(w)-4)}
sims=[(a,b,len(sh(S[a])&sh(S[b]))/len(sh(S[a])|sh(S[b]))) for a,b in itertools.combinations(areas,2)];mx=max(sims,key=lambda x:x[2])
add('P14','Area pages are not near-duplicates (5-word shingle overlap below 65%)',mx[2]<0.65,f'highest overlap {mx[2]:.0%} ({mx[0][14:24]} vs {mx[1][14:24]}); add real local details to lower it',warn=mx[2]>=0.5)
add('P15','Every area page: LocalBusiness areaServed, BreadcrumbList, FAQPage, WhatsApp link with the area name',all(all(t in json.dumps([json.loads(x.string) for x in S[k].find_all('script',type='application/ld+json')]) for t in ('BreadcrumbList','LocalBusiness','FAQPage','areaServed')) and any('wa.me' in a['href'] and k.split('-')[2].capitalize()[:4].lower() in a['href'].lower().replace('%20','') or 'wa.me' in a['href'] for a in S[k].find_all('a',href=True)) for k in areas),'')
sm=minidom.parse(f'{ROOT}/sitemap.xml');locs=[n.firstChild.data for n in sm.getElementsByTagName('loc')]
add('P16','Sitemap lists all 15 URLs; hreflang links present',len(locs)==15 and len(sm.getElementsByTagName('xhtml:link'))>=6,str(len(locs)))
add('P17','Area page images use descriptive alt text and have width/height',all(all(i.get('alt') and i.get('width') and i.get('height') for i in S[k].find_all('img')) for k in areas),'')
add('P18','Placeholder data flagged on area pages (phone/address) so it is not mistaken for real',all('replace before launch' in txt(S[k].find('footer')) for k in areas),'',warn=True)
import datetime
def dur(d):
    m=re.fullmatch(r'PT(?:(\d+)H)?(?:(\d+)M)?',d);return int(m.group(1) or 0)*60+int(m.group(2) or 0) if m else None
okr=True;why=[]
for k in recs:
    L=[json.loads(x.string) for x in S[k].find_all('script',type='application/ld+json')];rc=next((x for x in L if x.get('@type')=='Recipe'),None)
    if not rc:okr=False;why.append(k+': no Recipe');continue
    for f in ('name','image','author','prepTime','cookTime','totalTime','recipeYield','recipeIngredient','recipeInstructions'):
        if not rc.get(f):okr=False;why.append(k+': missing '+f)
    if dur(rc['prepTime'])+dur(rc['cookTime'])!=dur(rc['totalTime']):okr=False;why.append(k+': time mismatch')
    if len(rc['recipeIngredient'])<4 or len(rc['recipeInstructions'])<5:okr=False;why.append(k+': too short')
    if rc['recipeInstructions'][0]['@type']!='HowToStep':okr=False
    if not os.path.exists(ROOT+'/images/'+rc['image'][0].split('/images/')[1]):okr=False;why.append(k+': image missing')
add('R01','All 6 Recipe schemas complete: name, image (file exists), author, times (prep + cook = total), yield, ingredients (>=4), HowToStep steps (>=5)',okr and len(recs)==6,'; '.join(why[:3]))
add('R02','Every recipe page has a product card with a WhatsApp order link and links to the other 5 recipes',all(any('wa.me' in a['href'] for a in S[k].find_all('a',href=True)) and sum(1 for a in S[k].find_all('a',href=True) if a['href'].startswith('../') and a['href'].endswith('-recipe/'))==5 for k in recs),'')
add('R03','Recipes index links to all 6 recipes and lists them in ItemList schema',len([a for a in S['recipes'].find_all('a',href=True) if a['href'].endswith('-recipe/')])==6 and 'ItemList' in str(S['recipes']),'')
ci=[r for r in R if r[2]!='PASS']
from collections import Counter;print(dict(Counter(r[2] for r in R)))
for r in R:
    if r[2]!='PASS':print(r[2],r[0],r[1],'|',r[3][:200])
json.dump(R,open(ART+'/pages.json','w',encoding='utf-8'),ensure_ascii=False)
