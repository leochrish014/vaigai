import cv2,numpy as np,sys
SRC={'milk':'img/hero.png','ghee':'img/ghee.png','butter':'img/butter.png','curd':'img/curd.png'}
def matte(name,path):
    im=cv2.imread(path);h,w=im.shape[:2]
    hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV);H,S,V=[hsv[...,i].astype(np.int32) for i in range(3)]
    m=np.full((h,w),cv2.GC_PR_BGD,np.uint8)
    bgcol=((H>=78)&(H<=135)&(S>60))|(V<55)
    m[bgcol]=cv2.GC_PR_BGD
    fg=((S<55)&(V>165))|(((H>=5)&(H<=38))&(S>70)&(V>70))
    m[fg]=cv2.GC_PR_FGD
    sure_fg=((S<35)&(V>200))|(((H>=15)&(H<=32))&(S>120)&(V>150))
    m[sure_fg]=cv2.GC_FGD
    sure_bg=bgcol&(S>110)&(V<150)
    m[sure_bg]=cv2.GC_BGD
    if name=='curd':
        cv2.ellipse(m,(688,400),(182,192),0,0,360,cv2.GC_FGD,-1)
        for (cx,cy) in [(840,115),(725,182),(860,278),(900,367),(968,375),(458,438),(506,574),(716,198)]:cv2.circle(m,(cx,cy),22,cv2.GC_FGD,-1)
    if name=='butter':
        yy,xx=np.mgrid[:h,:w];reg=(yy>370)&(xx>330)&(xx<1060)
        m[reg&(S<80)&(V<125)]=cv2.GC_PR_FGD;m[reg&(S<55)&(V<95)]=cv2.GC_FGD
    b=int(.035*w);m[:, :b]=cv2.GC_BGD;m[:, -b:]=cv2.GC_BGD;m[:int(.05*h),:]=cv2.GC_BGD;m[-int(.04*h):,:]=cv2.GC_BGD
    bgm=np.zeros((1,65));fgm=np.zeros((1,65))
    cv2.grabCut(im,m,None,bgm,fgm,6,cv2.GC_INIT_WITH_MASK)
    M=((m==cv2.GC_FGD)|(m==cv2.GC_PR_FGD)).astype(np.uint8)
    # clean: remove specks, fill small holes
    M=cv2.morphologyEx(M,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats(M,connectivity=8)
    keep=np.zeros_like(M)
    for i in range(1,n):
        if st[i,cv2.CC_STAT_AREA]>=14:keep[lab==i]=1
    M=keep
    # fill internal holes (flood the true background from the border)
    inv=(1-M).astype(np.uint8)*255;ff=inv.copy();cv2.floodFill(ff,np.zeros((h+2,w+2),np.uint8),(2,2),0)
    M=np.where(ff>0,1,M).astype(np.uint8)
    # drop far-away specks
    n2,lab2,st2,cen=cv2.connectedComponentsWithStats(M,connectivity=8)
    big=1+np.argmax(st2[1:,cv2.CC_STAT_AREA]);x0,y0,bw,bh=st2[big,:4]
    for i in range(1,n2):
        cx,cy=cen[i]
        if not(x0-160<cx<x0+bw+160 and y0-160<cy<y0+bh+160):M[lab2==i]=0
    a=cv2.GaussianBlur(M.astype(np.float32),(0,0),1.1)
    a=np.clip((a-.15)/.7,0,1)
    # colour decontamination: propagate interior colours outward
    core=cv2.erode(M,np.ones((5,5),np.uint8)).astype(np.float32)
    imf=im.astype(np.float32)
    num=cv2.GaussianBlur(imf*core[...,None],(0,0),6);den=cv2.GaussianBlur(core,(0,0),6)[...,None]
    C=num/np.maximum(den,1e-4)
    edge=(a>0)&(core==0)
    out=imf.copy();out[edge]=C[edge]*.85+imf[edge]*.15
    rgba=np.dstack([out.clip(0,255).astype(np.uint8),(a*255).astype(np.uint8)])
    cv2.imwrite(f'cut/{name}.png',rgba)
    return rgba
tiles=[]
for k,p in SRC.items():
    r=matte(k,p);print(k,int((r[...,3]>128).mean()*100),'% opaque')
    # preview over a coloured bg
    bgc={'milk':(110,66,18),'ghee':(10,60,150),'butter':(40,110,170),'curd':(80,40,110)}[k]
    bg=np.zeros(r.shape[:2]+(3,),np.uint8);bg[:]=bgc
    al=(r[...,3:4]/255.0);prev=(r[...,:3]*al+bg*(1-al)).astype(np.uint8)
    tiles.append(cv2.resize(prev,(688,384)))
cv2.imwrite('cut_preview.png',np.vstack([np.hstack(tiles[:2]),np.hstack(tiles[2:])]))
