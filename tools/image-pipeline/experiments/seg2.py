import cv2,numpy as np
def segment(path,floor=0.0,sat=.30,vmax=.72):
    img=cv2.imread(path);h,w=img.shape[:2]
    hsv=cv2.cvtColor(img,cv2.COLOR_BGR2HSV_FULL).astype(np.float32);H=hsv[...,0]/255*360;S=hsv[...,1]/255;V=hsv[...,2]/255
    bg=((H>140)&(H<235)&(S>sat)&(V<vmax))|(V<.10)
    # smooth background plausibility: subject if far from heavily-blurred bg-only image
    fg=(~bg).astype(np.uint8)
    if floor>0:fg[int(h*(1-floor)):,:]=0
    fg=cv2.morphologyEx(fg,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
    return img,fg
tiles=[]
for k,f,fl in [('milk','hero',.28),('ghee','ghee',.12),('butter','butter',.12),('curd','curd',.12)]:
    img,fg=segment(f'/home/claude/img/{f}.png',fl)
    a=cv2.GaussianBlur(fg.astype(np.float32),(0,0),.7)
    bgc=np.zeros_like(img);bgc[:]=(30,150,230) if k=='ghee' else (60,90,200)
    comp=(img*a[...,None]+bgc*(1-a[...,None])).astype(np.uint8);tiles.append(cv2.resize(comp,(688,384)))
cv2.imwrite('/home/claude/seg/test2.png',np.vstack([np.hstack(tiles[:2]),np.hstack(tiles[2:])]))
