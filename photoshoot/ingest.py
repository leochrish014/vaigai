#!/usr/bin/env python3
"""Turn raw photos into website-ready WebP files.
Usage: python ingest.py RAW_FOLDER OUT_FOLDER [SHOT_LIST.csv]
- matches files to SHOT-LIST.csv by file name (any extension: jpg, png, tif, webp)
- resizes to max 1600 px wide (hero/story) or 1000 px (recipes/portraits), WebP quality 85
- writes alt-text list (alt-text.csv) and a report of missing / low resolution shots
Needs: pip install pillow"""
import sys,os,csv
from PIL import Image,ImageOps
raw,out=sys.argv[1],sys.argv[2];sl=sys.argv[3] if len(sys.argv)>3 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'SHOT-LIST.csv')
os.makedirs(out,exist_ok=True)
shots=list(csv.DictReader(open(sl,encoding='utf-8')))
files={os.path.splitext(f)[0].lower():os.path.join(raw,f) for f in os.listdir(raw) if f.lower().endswith(('.jpg','.jpeg','.png','.tif','.tiff','.webp'))}
rep=[];alt=[('filename','alt_text')]
for s in shots:
    key=s['filename'].lower()
    if key not in files:rep.append((s['id'],s['priority'],'MISSING',s['filename']));continue
    im=ImageOps.exif_transpose(Image.open(files[key])).convert('RGB');w,h=im.size
    maxw=1000 if s['id'][0] in 'RT' else 1600
    if w<maxw*0.75:rep.append((s['id'],s['priority'],'LOW RESOLUTION %dx%d'%(w,h),s['filename']))
    if w>maxw:im=im.resize((maxw,round(h*maxw/w)),Image.LANCZOS)
    im.save(os.path.join(out,s['filename']+'.webp'),'WEBP',quality=85,method=6)
    alt.append((s['filename']+'.webp',s['alt_text']));rep.append((s['id'],s['priority'],'OK %dx%d'%im.size,s['filename']))
csv.writer(open(os.path.join(out,'alt-text.csv'),'w',newline='',encoding='utf-8')).writerows(alt)
miss=[r for r in rep if r[2]=='MISSING' and r[1]=='must']
for r in rep:print(*r)
print('\nmust-have shots missing:',len(miss),'| processed:',sum(1 for r in rep if r[2].startswith('OK')))
