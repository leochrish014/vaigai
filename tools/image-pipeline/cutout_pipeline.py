import cv2,numpy as np,json,os,base64
from PIL import Image
CFG={ # key: (rule, floor_cut_fraction, dark_cut_bottom_fraction, main_min_area)
 'hero':('hue',0.0,0.34,9000),'ghee':('hue',0.0,0,6000),'butter':('hue',0.0,0,9000),'curd':('hue',0.0,0,9000),
 'badam':('hue',0.0,0,9000),'carton':('dark',0.0,0,9000),'combo':('hue',0.12,0,9000),'family':('hue',0.0,0,12000)}
def run(k,verbose=True):
    rule,floor,dark_b,mmin=CFG[k]
    img=cv2.imread(f'/home/claude/img/{k}.png');h,w=img.shape[:2]
    hsv=cv2.cvtColor(img,cv2.COLOR_BGR2HSV_FULL).astype(np.float32);H=hsv[...,0]/255*360;S=hsv[...,1]/255;V=hsv[...,2]/255
    if rule=='hue':bg=((H>140)&(H<235)&(S>.30)&(V<.72))|(V<.10)
    else:bg=V<.13
    fg=(~bg).astype(np.uint8)
    if dark_b:
        yy=np.arange(h)[:,None]>int(h*(1-dark_b));fg[(V<.34)&yy]=0
    fg[:int(h*.004),:]=0
    if floor>0:fg[int(h*(1-floor)):,:]=0
    fg=cv2.morphologyEx(fg,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7)))
    fg=cv2.morphologyEx(fg,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
    # main = filled external contours of big blobs (dilated slightly to bridge splash gaps)
    link=cv2.dilate(fg,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(9,9)))
    cnts,_=cv2.findContours(link,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
    main=np.zeros_like(fg)
    for c in cnts:
        m=np.zeros_like(fg);cv2.drawContours(m,[c],-1,1,-1)
        if (m&fg).sum()>=mmin:main|=m
    main=main&cv2.dilate(fg,np.ones((7,7),np.uint8))  # tighten back
    main=cv2.morphologyEx(main,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(11,11)))
    cnts,_=cv2.findContours(main,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE);mf=np.zeros_like(fg);cv2.drawContours(mf,cnts,-1,1,-1);main=mf
    part=fg&(1-main)
    n,lab,st,_=cv2.connectedComponentsWithStats(part,connectivity=8)
    keep=np.zeros_like(part);sprites=[]
    for i in range(1,n):
        x,y,ww,hh,a=st[i]
        if a>=7 and a<=14000 and ww<260 and hh<260:keep[lab==i]=1;sprites.append((x,y,ww,hh,a))
    def defringe(m):
        unk=(cv2.dilate(m,np.ones((11,11),np.uint8))&(1-cv2.erode(m,np.ones((5,5),np.uint8)))).astype(np.uint8)*255
        return cv2.inpaint(img,unk,3,cv2.INPAINT_TELEA)
    def alpha(m):
        e=cv2.erode(m,np.ones((3,3),np.uint8)) if m.sum()>3000 else m
        return np.clip(cv2.GaussianBlur(e.astype(np.float32),(0,0),.9)*1.15,0,1)
    both=(main|keep)
    ys,xs=np.where(both>0);x0,x1,y0,y1=max(xs.min()-6,0),min(xs.max()+7,w),max(ys.min()-6,0),min(ys.max()+7,h)
    sw,sh=x1-x0,y1-y0
    col=defringe(both)
    am=alpha(main);ak=alpha(keep)
    rgba_main=np.dstack([col,(am*255).astype(np.uint8)])[y0:y1,x0:x1]
    # main bbox inside scene
    my,mx=np.where(main>0);bx0,bx1,by0,by1=mx.min(),mx.max()+1,my.min(),my.max()+1
    mainc=rgba_main[by0-y0:by1-y0,bx0-x0:bx1-x0]
    # pack sprites into atlas (shelf)
    spr=[];order=sorted(sprites,key=lambda s:-s[3]);AW=1024;cx=cy=rowh=0;pos=[]
    for (x,y,ww,hh,a) in order:
        pw,ph=ww+4,hh+4
        if cx+pw>AW:cx=0;cy+=rowh;rowh=0
        pos.append((x,y,ww,hh,cx,cy));cx+=pw;rowh=max(rowh,ph)
    AH=cy+rowh+2
    atlas=np.zeros((max(AH,8),AW,4),np.uint8);meta=[]
    for (x,y,ww,hh,ax,ay) in pos:
        px0,py0=max(x-2,0),max(y-2,0);px1,py1=min(x+ww+2,w),min(y+hh+2,h)
        c=col[py0:py1,px0:px1];al=(ak[py0:py1,px0:px1]*255).astype(np.uint8)
        # mask out other particles/main inside the crop
        atlas[ay:ay+(py1-py0),ax:ax+(px1-px0)]=np.dstack([c,al])
        meta.append([int(px0-x0),int(py0-y0),int(px1-px0),int(py1-py0),int(ax),int(ay)])
    out={'sw':int(sw),'sh':int(sh),'main':[int(bx0-x0),int(by0-y0),int(bx1-bx0),int(by1-by0)],'p':meta,'aw':AW,'ah':int(atlas.shape[0])}
    def save(arr,name,q):
        im=Image.fromarray(cv2.cvtColor(arr,cv2.COLOR_BGRA2RGBA));p=f'/home/claude/cut/{name}.webp';im.save(p,'WEBP',quality=q,method=6,alpha_quality=92);return p
    save(mainc,k+'_main',86);save(atlas,k+'_atl',86);json.dump(out,open(f'/home/claude/cut/{k}.json','w'))
    if verbose:print(k,'scene',sw,sh,'main',out['main'],'particles',len(meta),'sizeKB',os.path.getsize(f'/home/claude/cut/{k}_main.webp')//1024,os.path.getsize(f'/home/claude/cut/{k}_atl.webp')//1024)
    return out
if __name__=='__main__':
    import sys
    for k in CFG:run(k)
