"""Generates the importable n8n workflow JSON files (backend/n8n/dist/*.json).

    python3 backend/n8n/src/build_workflows.py

Layout
  helpers (this file)  node factories: webhook(), code(), sheet(), wa_http(), respond() ...
  logic/*.py           the JavaScript that runs inside n8n Code nodes (kept as strings, unit-tested)
  flows/*.py           the node graphs: one file per workflow
Shared namespace: logic/ and flows/ are exec'd into this module's globals in a fixed order (see ORDER below).
"""
import json,uuid,os,sys,re
from pathlib import Path
N8N_HERE=Path(__file__).resolve().parent
REPO=N8N_HERE.parents[2]
HERE=REPO/'frontend'/'website'/'src'/'build'   # build.py resolves ta.py relative to HERE
exec((REPO/'frontend'/'website'/'src'/'build'/'build.py').read_text(encoding='utf-8').split("MARK=r'''")[0])
HERE=N8N_HERE
OUT=str(REPO/'backend'/'n8n'/'dist');os.makedirs(OUT,exist_ok=True)
CFGN='Config'
def uid():return str(uuid.uuid4())
CAT_JS='const CATALOG={'+','.join(f"'VGM-{p['k'].upper()}-{p['u'].replace(' ','')}':{{n:{json.dumps(p['n'])},ta:{json.dumps(p['nt'],ensure_ascii=False)},u:{json.dumps(p['u'])},p:{p['p']},d:{json.dumps(p['d'])},tags:{json.dumps(TAGS[p['k']])}}}" for p in PR)+'};' if False else ''
TAGS={'carton':['milk','fresh','daily','pack','carton','tea','coffee','kids'],'badam':['badam','almond','flavoured','kids','shake','smoothie'],'ghee':['ghee','nei','sweet','pongal','festival','rice'],'curd':['curd','thayir','yogurt','dahi','breakfast','idli','dosa','lunch'],'butter':['butter','vennai','idli','dosa','bread'],'hero':['milk','glass','bottle','returnable','coffee','tea','full cream']}
CAT_JS='const CATALOG={'+','.join(f"'VGM-{p['k'].upper()}-{p['u'].replace(' ','')}':{{n:{json.dumps(p['n'])},ta:{json.dumps(p['nt'],ensure_ascii=False)},u:{json.dumps(p['u'])},p:{p['p']},d:{json.dumps(p['d'])},tags:{json.dumps(TAGS[p['k']])}}}" for p in PR)+'};'
FAQ_JS='const FAQ='+json.dumps([{'q':q,'a':a} for q,a in FAQ],ensure_ascii=False)+';'
AREAS_JS="const AREAS=['anna nagar','kk nagar','k.k. nagar','teppakulam','theppakulam','goripalayam','thirunagar','tallakulam','thallakulam'];const PIN_MIN=625001,PIN_MAX=625020;"
IST="const ist=()=>new Date(Date.now()+330*60000);const ymd=d=>d.toISOString().slice(0,10);const addDays=(d,n)=>{const x=new Date(d);x.setUTCDate(x.getUTCDate()+n);return x};"
def node(name,type,pos,params,tv=1,cred=None,**x):
    n={'parameters':params,'id':uid(),'name':name,'type':type,'typeVersion':tv,'position':pos}
    if cred:n['credentials']=cred
    n.update(x)
    return json.loads(json.dumps(n,ensure_ascii=False).replace("$('Config')","$('"+CFGN+"')"))
def webhook(name,pos,path,method='POST'):return node(name,'n8n-nodes-base.webhook',pos,{'httpMethod':method,'path':path,'responseMode':'responseNode','options':{'allowedOrigins':'*'}},2,webhookId=uid())
def sched(name,pos,cron):return node(name,'n8n-nodes-base.scheduleTrigger',pos,{'rule':{'interval':[{'field':'cronExpression','expression':cron}]}},1.2)
CFG_FIELDS=[('wa_verify_token','CHANGE_ME_VERIFY_TOKEN'),('wa_app_secret','PASTE_META_APP_SECRET'),('ai_fallback','yes'),('razorpay_key_id','rzp_test_PASTE_KEY_ID'),('razorpay_key_secret','PASTE_RAZORPAY_KEY_SECRET'),('razorpay_webhook_secret','PASTE_RAZORPAY_WEBHOOK_SECRET'),('site_url','https://www.your-domain.com'),('admin_key','CHANGE_ME_ADMIN_KEY'),('rider_pins_json','{"1111":"Rider One"}'),('api_key','CHANGE_ME_WEBHOOK_KEY'),('sheet_id','PASTE_GOOGLE_SHEET_ID'),('wa_phone_id','PASTE_WHATSAPP_PHONE_NUMBER_ID'),('wa_token','PASTE_WHATSAPP_ACCESS_TOKEN'),('staff_wa','91XXXXXXXXXX'),('telegram_chat_id','PASTE_TELEGRAM_CHAT_ID'),('manager_telegram_chat_id','PASTE_MANAGER_CHAT_ID'),('base_url','https://YOUR-N8N-HOST'),('daily_capacity_json','{"VGM-CARTON-500ml":600,"VGM-HERO-500ml":300,"VGM-BADAM-250ml":150,"VGM-GHEE-500ml":60,"VGM-CURD-400g":200,"VGM-BUTTER-200g":80}')]
def config(pos,name='Config'):return node(name,'n8n-nodes-base.set',pos,{'assignments':{'assignments':[{'id':uid(),'name':k,'value':v,'type':'string'} for k,v in CFG_FIELDS]},'includeOtherFields':True,'options':{}},3.4)
def keyif(pos,name='Key OK?'):return node(name,'n8n-nodes-base.if',pos,{'conditions':{'options':{'caseSensitive':True,'leftValue':'','typeValidation':'loose'},'conditions':[{'id':uid(),'leftValue':"={{ $json.headers['x-vaigai-key'] }}",'rightValue':'={{ $json.api_key }}','operator':{'type':'string','operation':'equals'}}],'combinator':'and'},'options':{}},2)
def ifnode(name,pos,left,op_type,operation,right=''):
    cond={'id':uid(),'leftValue':left,'operator':{'type':op_type,'operation':operation}}
    if right!='':cond['rightValue']=right
    return node(name,'n8n-nodes-base.if',pos,{'conditions':{'options':{'caseSensitive':True,'leftValue':'','typeValidation':'loose'},'conditions':[cond],'combinator':'and'},'options':{}},2)
def code(name,pos,js):return node(name,'n8n-nodes-base.code',pos,{'jsCode':js,'mode':'runOnceForAllItems'},2)
def respond(name,pos,body,codeNum=200):return node(name,'n8n-nodes-base.respondToWebhook',pos,{'respondWith':'json','responseBody':body,'options':{'responseCode':codeNum}},1.1)
SHEETS={'googleSheetsOAuth2Api':{'id':'','name':'Google Sheets account'}}
DOC="={{ $('Config').first().json.sheet_id }}"
def sheet(name,pos,tab,op,cols=None,**x):
    p={'resource':'sheet','operation':op,'documentId':{'__rl':True,'mode':'id','value':"={{ $('Config').first().json.sheet_id }}"},'sheetName':{'__rl':True,'mode':'name','value':tab},'options':{}}
    if cols:p['columns']={'mappingMode':'defineBelow','value':{c:'={{ '+cols[1]+'.'+c+' }}' for c in cols[0]},'matchingColumns':[],'schema':[]}
    if op=='read':x.setdefault('alwaysOutputData',True)
    return node(name,'n8n-nodes-base.googleSheets',pos,p,4.5,SHEETS,**x)
def wa_cfg(pos,name='WhatsApp configured?'):return ifnode(name,pos,"={{ $('Config').first().json.wa_token }}",'string','notEquals','PASTE_WHATSAPP_ACCESS_TOKEN')
def wa_http(name,pos,to_expr,payload_expr):
    payload_expr=re.sub(r'\}(?=\})','} ',payload_expr)
    return node(name,'n8n-nodes-base.httpRequest',pos,{'method':'POST','url':"=https://graph.facebook.com/v20.0/{{ $('Config').first().json.wa_phone_id }}/messages",'sendHeaders':True,'headerParameters':{'parameters':[{'name':'Authorization','value':"=Bearer {{ $('Config').first().json.wa_token }}"},{'name':'Content-Type','value':'application/json'}]},'sendBody':True,'specifyBody':'json','jsonBody':'={{ JSON.stringify('+payload_expr+') }}','options':{}},4.2,onError='continueRegularOutput')
def tg(name,pos,text_expr,chat='telegram_chat_id',disabled=True):
    return node(name,'n8n-nodes-base.telegram',pos,{'chatId':"={{ $('Config').first().json."+chat+" }}",'text':text_expr,'additionalFields':{'appendAttribution':False}},1.2,{'telegramApi':{'id':'','name':'Telegram account'}},disabled=disabled,onError='continueRegularOutput')
def wf(name,nodes,conns,tags=None):
    c={}
    for a,b,*r in conns:
        out=r[0] if r else 0;typ=r[1] if len(r)>1 else 'main'
        c.setdefault(a,{}).setdefault(typ,[])
        while len(c[a][typ])<=out:c[a][typ].append([])
        c[a][typ][out].append({'node':b,'type':typ,'index':0})
    return {'name':name,'nodes':nodes,'connections':c,'active':False,'settings':{'executionOrder':'v1','timezone':'Asia/Kolkata','saveManualExecutions':True},'pinData':{},'tags':[{'name':t} for t in (tags or ['vaigai'])],'meta':{'templateCredsSetupCompleted':False}}
def save(fn,w):json.dump(w,open(f'{OUT}/{fn}','w',encoding='utf-8'),indent=2,ensure_ascii=False)
def note(text,pos,w=380,h=240):return {'parameters':{'content':text,'height':h,'width':w},'id':uid(),'name':'Note '+uid()[:4],'type':'n8n-nodes-base.stickyNote','typeVersion':1,'position':pos}


def sheet_update(name,pos,tab,cols,match,src='$json',op='update',**x):
    p={'resource':'sheet','operation':op,'documentId':{'__rl':True,'mode':'id','value':"={{ $('Config').first().json.sheet_id }}"},'sheetName':{'__rl':True,'mode':'name','value':tab},'columns':{'mappingMode':'defineBelow','value':{c:'={{ '+src+'.'+c+' }}' for c in cols},'matchingColumns':[match],'schema':[]},'options':{}}
    return node(name,'n8n-nodes-base.googleSheets',pos,p,4.5,SHEETS,**x)
def crypto_hmac(name,pos,value,secret,binary=False):
    p={'action':'hmac','type':'SHA256','dataPropertyName':'expected','secret':secret,'encoding':'hex'}
    if binary:p.update({'binaryData':True,'binaryPropertyName':'data'})
    else:p['value']=value
    return node(name,'n8n-nodes-base.crypto',pos,p,1)
def crypto_token(name,pos):return node(name,'n8n-nodes-base.crypto',pos,{'action':'generate','dataPropertyName':'token','encodingType':'hex','stringLength':24},1)
def crypto_gen(name,pos,prop,length=16):return node(name,'n8n-nodes-base.crypto',pos,{'action':'generate','dataPropertyName':prop,'encodingType':'hex','stringLength':length},1)
def respond_text(name,pos,body,codeNum=200):return node(name,'n8n-nodes-base.respondToWebhook',pos,{'respondWith':'text','responseBody':body,'options':{'responseCode':codeNum}},1.1)
CODE={}

ORDER=['logic/core','logic/payments','logic/account','logic/admin','logic/whatsapp','flows/wf01_05_core','flows/wf06_payments','flows/wf07_account','flows/wf08_admin','flows/wf09_whatsapp']
for _part in ORDER:
    exec((HERE/(_part+'.py')).read_text(encoding='utf-8'))
print('generated',len(os.listdir(OUT)),'workflows')
