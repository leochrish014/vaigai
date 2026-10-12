import cv2,numpy as np,json,sys,os
def poly(x,y):
    return np.stack([np.ones_like(x),x,y,x*x,x*y,y*y],-1)
def bgmodel(img,fitmask_init):
    h,w=img.shape[:2];ys,xs=np.mgrid[0:h,0:w].astype(np.float32);xs/=w;ys/=h
    A=poly(xs,ys).reshape(-1,6);I=img.reshape(-1,3).astype(np.float32);m=fitmask_init.reshape(-1).copy()
    for it in range(5):
        idx=np.where(m)[0];sel=idx[::max(1,len(idx)//60000)]
        coef=np.linalg.lstsq(A[sel],I[sel],rcond=None)[0]
        pred=A@coef;D=np.linalg.norm(I-pred,axis=1)
        m=(D<(16 if it<3 else 12))&fitmask_init.reshape(-1) if it<1 else (D<12)
    return pred.reshape(h,w,3),D.reshape(h,w)
def segment(path,exclude_bottom=0.0,lo=14,hi=34,minmain=6000):
    img=cv2.imread(path);h,w=img.shape[:2]
    init=np.zeros((h,w),bool);b=int(.06*min(h,w));init[:b,:]=1;init[:,:b]=1;init[:,-b:]=1
    if exclude_bottom<1:init[int(h*(1-exclude_bottom))-b:,:]=init[int(h*(1-exclude_bottom))-b:,:]
    if exclude_bottom==0:init[-b:,:]=1
    pred,D=bgmodel(img,init)
    D=cv2.GaussianBlur(D,(0,0),.8)
    a=np.clip((D-lo)/(hi-lo),0,1);a=a*a*(3-2*a)
    bn=(a>.5).astype(np.uint8)
    # holes: fill enclosed regions of main subject
    k=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5));cl=cv2.morphologyEx(bn,cv2.MORPH_CLOSE,k)
    cnts,_=cv2.findContours(cl,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE);filled=np.zeros_like(cl)
    for c in cnts:
        if cv2.contourArea(c)>minmain:cv2.drawContours(filled,[c],-1,1,-1)
    a=np.maximum(a,filled.astype(np.float32)*np.clip(a*0+1,0,1)*1.0)
    return img,a,pred
if __name__=='__main__':
    names={'milk':('1000676049',.3),'ghee':('1000676054',0),'butter':('1000676057',0),'curd':('1000676056',0)}
    tiles=[]
    for k,(f,ex) in names.items():
        img,a,pred=segment(f'/home/claude/img/{ {"milk":"hero","ghee":"ghee","butter":"butter","curd":"curd"}[k]}.png',ex)
        bg=np.zeros_like(img);bg[:]=(30,150,230) if k=='ghee' else (60,90,200)
        comp=(img*a[...,None]+bg*(1-a[...,None])).astype(np.uint8);tiles.append(cv2.resize(comp,(688,384)))
    cv2.imwrite('/home/claude/seg/test.png',np.vstack([np.hstack(tiles[:2]),np.hstack(tiles[2:])]))
